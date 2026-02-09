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

    const { vehicleType, totalSeats, scheduledTime, source, destination } = req.body;

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

    // Create trip
    const trip = await Trip.create({
      driverId: req.user._id,
      vehicleType,
      totalSeats: parseInt(totalSeats),
      availableSeats: parseInt(totalSeats),
      scheduledTime: tripScheduledTime,
      source,
      destination,
      estimatedCost,
      status: 'SCHEDULED'
    });

    const populatedTrip = await Trip.findById(trip._id).populate('driverId', 'name email');

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
    const { source, destination, vehicleType } = req.query;

    // Validate required parameters
    if (!source || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination are required'
      });
    }

    // Build query - simplified to use only regex for now
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

    const trips = await Trip.find(query)
      .populate('driverId', 'name email')
      .sort({ scheduledTime: 1 });

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
    const trips = await Trip.find({ driverId: req.user._id })
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

    // Check if user is the driver of this trip
    if (trip.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the trip driver can start this trip'
      });
    }

    // Check if trip is in SCHEDULED status
    if (trip.status !== 'SCHEDULED') {
      return res.status(400).json({
        success: false,
        message: `Cannot start trip with status ${trip.status}. Trip must be in SCHEDULED status`
      });
    }

    // Update status to IN_PROGRESS
    trip.status = 'IN_PROGRESS';
    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Trip started successfully',
      trip: trip
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
    if (trip.driverId.toString() !== req.user._id.toString()) {
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
