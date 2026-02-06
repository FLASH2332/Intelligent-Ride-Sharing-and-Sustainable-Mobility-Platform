import Trip from '../models/Trip.js';

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private (Drivers only)
export const createTrip = async (req, res) => {
  try {
    // Check if user is a driver
    if (!req.user.isDriver) {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can create trips'
      });
    }

    const { vehicleType, seatsAvailable, startTime, route } = req.body;

    // Validate startTime is within 7 days
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const tripStartTime = new Date(startTime);

    if (tripStartTime < now || tripStartTime > sevenDaysFromNow) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be within the next 7 days'
      });
    }

    // Validate seats based on vehicle type
    if (vehicleType === 'CAR' && seatsAvailable > 7) {
      return res.status(400).json({
        success: false,
        message: 'CAR can have maximum 7 seats available'
      });
    }

    if (vehicleType === 'BIKE' && seatsAvailable !== 1) {
      return res.status(400).json({
        success: false,
        message: 'BIKE must have exactly 1 seat available'
      });
    }

    // Create trip
    const trip = await Trip.create({
      driverId: req.user._id,
      vehicleType,
      seatsAvailable,
      startTime: tripStartTime,
      route,
      status: 'PLANNED'
    });

    res.status(201).json({
      success: true,
      data: trip
    });

  } catch (error) {
    console.error('Create trip error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create trip'
    });
  }
};

// @desc    Search for trips near a location
// @route   GET /api/trips/search
// @access  Private
export const searchTrips = async (req, res) => {
  try {
    const { lat, lng, vehicleType } = req.query;

    // Validate required parameters
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude'
      });
    }

    // Build query
    const query = {
      status: 'PLANNED',
      seatsAvailable: { $gt: 0 },
      route: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: 5000 // 5km radius
        }
      }
    };

    // Add vehicle type filter if provided
    if (vehicleType) {
      query.vehicleType = vehicleType.toUpperCase();
    }

    const trips = await Trip.find(query).populate('driverId', 'name email');

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });

  } catch (error) {
    console.error('Search trips error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to search trips'
    });
  }
};

// @desc    Start a trip
// @route   PUT /api/trips/:id/start
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

    // Check if user is the driver of this trip
    if (trip.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the trip driver can start this trip'
      });
    }

    // Check if trip is in PLANNED status
    if (trip.status !== 'PLANNED') {
      return res.status(400).json({
        success: false,
        message: `Cannot start trip with status ${trip.status}. Trip must be in PLANNED status`
      });
    }

    // Update status to ONGOING
    trip.status = 'ONGOING';
    await trip.save();

    res.status(200).json({
      success: true,
      data: trip
    });

  } catch (error) {
    console.error('Start trip error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to start trip'
    });
  }
};

// @desc    End a trip
// @route   PUT /api/trips/:id/end
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
    if (trip.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the trip driver can end this trip'
      });
    }

    // Check if trip is in ONGOING status
    if (trip.status !== 'ONGOING') {
      return res.status(400).json({
        success: false,
        message: `Cannot end trip with status ${trip.status}. Trip must be in ONGOING status`
      });
    }

    // Update status to COMPLETED
    trip.status = 'COMPLETED';
    await trip.save();

    res.status(200).json({
      success: true,
      data: trip
    });

  } catch (error) {
    console.error('End trip error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to end trip'
    });
  }
};
