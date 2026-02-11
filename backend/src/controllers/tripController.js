import Trip from '../models/Trip.js';
import { getIO } from '../config/socket.js';

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private (Drivers only)
export const createTrip = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication error. Please log out and log back in.'
      });
    }

    // Check if user is a driver
    if (!req.user.isDriver) {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can create trips'
      });
    }

    const { vehicleType, totalSeats, scheduledTime, source, destination, sourceLocation, destinationLocation } = req.body;

    // Validate required fields
    if (!source || !destination || !scheduledTime || !vehicleType || !totalSeats) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: source, destination, scheduledTime, vehicleType, totalSeats'
      });
    }

    // Validate scheduledTime is within 7 days
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const tripScheduledTime = new Date(scheduledTime);

    if (tripScheduledTime < now || tripScheduledTime > sevenDaysFromNow) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled time must be within the next 7 days'
      });
    }

    // Validate seats based on vehicle type
    if (vehicleType === 'CAR' && (totalSeats < 1 || totalSeats > 7)) {
      return res.status(400).json({
        success: false,
        message: 'CAR can have between 1 and 7 seats'
      });
    }

    if (vehicleType === 'BIKE' && totalSeats !== 1) {
      return res.status(400).json({
        success: false,
        message: 'BIKE must have exactly 1 seat'
      });
    }

    // Calculate estimated cost (simple formula: base + per km)
    const estimatedCost = 50 + (totalSeats * 10);

    // Prepare trip data
    const tripData = {
      driverId: req.user.userId,
      vehicleType,
      totalSeats: parseInt(totalSeats),
      availableSeats: parseInt(totalSeats),
      scheduledTime: tripScheduledTime,
      source,
      destination,
      estimatedCost,
      status: 'SCHEDULED'
    };

    // Add geolocation data if provided
    if (sourceLocation && sourceLocation.lat && sourceLocation.lng) {
      tripData.sourceLocation = {
        address: sourceLocation.address || source,
        coordinates: {
          type: 'Point',
          coordinates: [parseFloat(sourceLocation.lng), parseFloat(sourceLocation.lat)]
        }
      };
    }

    if (destinationLocation && destinationLocation.lat && destinationLocation.lng) {
      tripData.destinationLocation = {
        address: destinationLocation.address || destination,
        coordinates: {
          type: 'Point',
          coordinates: [parseFloat(destinationLocation.lng), parseFloat(destinationLocation.lat)]
        }
      };
    }

    // Set route if both source and destination coordinates are available
    if (tripData.sourceLocation && tripData.destinationLocation) {
      const sourceCoords = tripData.sourceLocation.coordinates.coordinates;
      const destCoords = tripData.destinationLocation.coordinates.coordinates;
      
      // Only set route if coordinates are distinct
      if (sourceCoords[0] !== destCoords[0] || sourceCoords[1] !== destCoords[1]) {
        tripData.route = {
          type: 'LineString',
          coordinates: [sourceCoords, destCoords]
        };
      }
    }

    // Create trip
    const trip = await Trip.create(tripData);

    const populatedTrip = await Trip.findById(trip._id).populate('driverId', 'name email');

    // Emit socket event for new trip creation
    try {
      const io = getIO();
      io.emit('new-trip-created', {
        trip: populatedTrip,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.io emit error:', socketError);
    }

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      trip: populatedTrip
    });

  } catch (error) {
    console.error('Create trip error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create trip'
    });
  }
};

// @desc    Search for trips by source and destination
// @route   GET /api/trips/search
// @access  Private
export const searchTrips = async (req, res) => {
  try {
    const { source, destination, vehicleType, sourceLat, sourceLng, destLat, destLng, maxDistance = 5000 } = req.query;

    // Validate required parameters
    if (!source || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination are required'
      });
    }

    let trips;

    // If geolocation coordinates are provided, use geospatial query
    if (sourceLat && sourceLng && destLat && destLng) {
      const sourceLon = parseFloat(sourceLng);
      const sourceLa = parseFloat(sourceLat);
      const destLon = parseFloat(destLng);
      const destLa = parseFloat(destLat);
      const maxDist = parseInt(maxDistance);

      // Build base query
      const baseQuery = {
        status: 'SCHEDULED',
        availableSeats: { $gt: 0 },
        'sourceLocation.coordinates.coordinates': { $exists: true, $ne: [0, 0] },
        'destinationLocation.coordinates.coordinates': { $exists: true, $ne: [0, 0] }
      };

      // Add vehicle type filter if provided
      if (vehicleType) {
        baseQuery.vehicleType = vehicleType.toUpperCase();
      }

      // Find trips with source and destination within radius
      // Using aggregation pipeline for better geospatial matching
      trips = await Trip.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [sourceLon, sourceLa]
            },
            distanceField: 'sourceDistance',
            maxDistance: maxDist,
            spherical: true,
            key: 'sourceLocation.coordinates',
            query: baseQuery
          }
        },
        {
          $addFields: {
            destDistance: {
              $let: {
                vars: {
                  destCoords: '$destinationLocation.coordinates.coordinates'
                },
                in: {
                  $sqrt: {
                    $add: [
                      {
                        $pow: [
                          { $subtract: [{ $arrayElemAt: ['$$destCoords', 0] }, destLon] },
                          2
                        ]
                      },
                      {
                        $pow: [
                          { $subtract: [{ $arrayElemAt: ['$$destCoords', 1] }, destLa] },
                          2
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        {
          $match: {
            destDistance: { $lte: maxDist / 111320 } // Approximate conversion to degrees
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'driverId',
            foreignField: '_id',
            as: 'driverInfo'
          }
        },
        {
          $unwind: '$driverInfo'
        },
        {
          $addFields: {
            driverId: {
              _id: '$driverInfo._id',
              name: '$driverInfo.name',
              email: '$driverInfo.email'
            }
          }
        },
        {
          $project: {
            driverInfo: 0
          }
        },
        {
          $sort: { scheduledTime: 1 }
        }
      ]);

    } else {
      // Fallback to text-based search using regex
      const query = {
        status: 'SCHEDULED',
        availableSeats: { $gt: 0 },
        source: { $regex: source, $options: 'i' },
        destination: { $regex: destination, $options: 'i' }
      };

      // Add vehicle type filter if provided
      if (vehicleType) {
        query.vehicleType = vehicleType.toUpperCase();
      }

      trips = await Trip.find(query)
        .populate('driverId', 'name email')
        .sort({ scheduledTime: 1 });
    }

    res.status(200).json({
      success: true,
      count: trips.length,
      trips: trips
    });

  } catch (error) {
    console.error('Search trips error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to search trips'
    });
  }
};

// @desc    Get driver's trips
// @route   GET /api/trips/driver/trips
// @access  Private (Driver only)
export const getDriverTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ driverId: req.user.userId })
      .populate('driverId', 'name email')
      .sort({ scheduledTime: -1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      trips: trips
    });

  } catch (error) {
    console.error('Get driver trips error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get driver trips'
    });
  }
};

// @desc    End a trip
// @route   POST /api/trips/:id/end
// @access  Private (Driver only)
export const endTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user is the driver of this trip
    if (trip.driverId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the trip driver can end this trip'
      });
    }

    // Check if trip is in IN_PROGRESS status
    if (trip.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        message: `Cannot end trip with status ${trip.status}. Trip must be in IN_PROGRESS status`
      });
    }

    // Update status to COMPLETED
    trip.status = 'COMPLETED';
    trip.actualEndTime = new Date();
    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Trip ended successfully',
      trip: trip
    });

  } catch (error) {
    console.error('End trip error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to end trip'
    });
  }
};

// @desc    Update driver's current location during trip
// @route   POST /api/trips/:id/location
// @access  Private (Driver only)
export const updateDriverLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user is the driver of this trip
    if (trip.driverId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the trip driver can update location'
      });
    }

    // Update current location
    trip.currentLocation = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)]
    };
    
    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      location: trip.currentLocation
    });

  } catch (error) {
    console.error('Update location error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update location'
    });
  }
};

// @desc    Get trip details by ID
// @route   GET /api/trips/:id
// @access  Private
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('driverId', 'name email phone')
      .populate({
        path: 'rides',
        populate: {
          path: 'passengerId',
          select: 'name email phone'
        }
      });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.status(200).json({
      success: true,
      trip
    });

  } catch (error) {
    console.error('Get trip error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get trip'
    });
  }
};

// @desc    Start a trip
// @route   POST /api/trips/:id/start
// @access  Private (Driver only)
export const startTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Verify the user is the driver
    if (trip.driverId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the driver can start this trip'
      });
    }

    if (trip.status !== 'SCHEDULED') {
      return res.status(400).json({
        success: false,
        message: `Cannot start trip with status ${trip.status}`
      });
    }

    trip.status = 'STARTED';
    trip.actualStartTime = new Date();
    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Trip started successfully',
      trip
    });

  } catch (error) {
    console.error('Start trip error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to start trip'
    });
  }
};

// @desc    Complete a trip
// @route   POST /api/trips/:id/complete
// @access  Private (Driver only)
export const completeTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Verify the user is the driver
    if (trip.driverId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the driver can complete this trip'
      });
    }

    if (trip.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Trip is already completed'
      });
    }

    trip.status = 'COMPLETED';
    trip.actualEndTime = new Date();
    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Trip completed successfully',
      trip
    });

  } catch (error) {
    console.error('Complete trip error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to complete trip'
    });
  }
};

// @desc    Cancel a trip
// @route   POST /api/trips/:id/cancel
// @access  Private (Driver only)
export const cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Verify the user is the driver
    if (trip.driverId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the driver can cancel this trip'
      });
    }

    if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel trip with status ${trip.status}`
      });
    }

    trip.status = 'CANCELLED';
    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Trip cancelled successfully',
      trip
    });

  } catch (error) {
    console.error('Cancel trip error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel trip'
    });
  }
};
