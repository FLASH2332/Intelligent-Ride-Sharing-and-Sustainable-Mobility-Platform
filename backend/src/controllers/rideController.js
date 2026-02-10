import RideRequest from '../models/RideRequest.js';
import Trip from '../models/Trip.js';
import { getIO } from '../config/socket.js';

// @desc    Request a ride
// @route   POST /api/rides/request
// @access  Private (All users - drivers can also be passengers)
export const requestRide = async (req, res) => {
  try {
    const { tripId } = req.body;
    const passengerId = req.user.userId;

    // Validate user authentication
    if (!passengerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication error. Please log out and log back in.'
      });
    }

    if (!tripId) {
      return res.status(400).json({
        success: false,
        message: 'Trip ID is required'
      });
    }

    // Check if trip exists and has available seats
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Smart driver check: prevent requesting your own trip
    if (trip.driverId.toString() === passengerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request a ride for your own trip'
      });
    }

    // Check if passenger already has a pending request for this trip
    const existingRequest = await RideRequest.findOne({
      passengerId,
      tripId,
      status: 'PENDING'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this trip'
      });
    }

    if (trip.status !== 'SCHEDULED') {
      return res.status(400).json({
        success: false,
        message: 'Trip is not available for booking'
      });
    }

    if (trip.availableSeats < 1) {
      return res.status(400).json({
        success: false,
        message: 'No seats available for this trip'
      });
    }

    // Create ride request
    const rideRequest = await RideRequest.create({
      passengerId,
      tripId,
      status: 'PENDING'
    });

    const populatedRequest = await RideRequest.findById(rideRequest._id)
      .populate('passengerId', 'name email')
      .populate('tripId');

    res.status(201).json({
      success: true,
      data: populatedRequest
    });

  } catch (error) {
    console.error('Request ride error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to request ride'
    });
  }
};

// @desc    Approve a ride request
// @route   POST /api/rides/:id/approve
// @access  Private (Drivers only)
export const approveRide = async (req, res) => {
  try {
    const rideRequestId = req.params.id;

    // Find the ride request
    const rideRequest = await RideRequest.findById(rideRequestId)
      .populate('passengerId', 'name email')
      .populate('tripId');

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: 'Ride request not found'
      });
    }

    // Check if the user is the driver of this trip
    if (rideRequest.tripId.driverId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the trip driver can approve this request'
      });
    }

    // Check if request is still pending
    if (rideRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request with status ${rideRequest.status}`
      });
    }

    // Atomically decrement seats and approve request
    const trip = await Trip.findOneAndUpdate(
      {
        _id: rideRequest.tripId._id,
        availableSeats: { $gt: 0 }
      },
      {
        $inc: { availableSeats: -1 }
      },
      { new: true }
    );

    if (!trip) {
      return res.status(400).json({
        success: false,
        message: 'No seats available or trip not found'
      });
    }

    // Update ride request status
    rideRequest.status = 'APPROVED';
    await rideRequest.save();

    // Emit Socket.io event to passenger
    try {
      const io = getIO();
      io.to(`user-${rideRequest.passengerId._id}`).emit('ride-approved-notification', {
        rideId: rideRequest._id,
        tripId: rideRequest.tripId._id,
        message: 'Your ride request has been approved',
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.io emit error:', socketError);
      // Continue even if socket fails
    }

    res.status(200).json({
      success: true,
      data: rideRequest,
      trip: {
        availableSeats: trip.availableSeats
      }
    });

  } catch (error) {
    console.error('Approve ride error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to approve ride'
    });
  }
};

// @desc    Reject a ride request
// @route   POST /api/rides/:id/reject
// @access  Private (Drivers only)
export const rejectRide = async (req, res) => {
  try {
    const rideRequestId = req.params.id;

    // Find the ride request
    const rideRequest = await RideRequest.findById(rideRequestId)
      .populate('passengerId', 'name email')
      .populate('tripId');

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: 'Ride request not found'
      });
    }

    // Check if the user is the driver of this trip
    if (rideRequest.tripId.driverId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the trip driver can reject this request'
      });
    }

    // Check if request is still pending
    if (rideRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with status ${rideRequest.status}`
      });
    }

    // Update ride request status
    rideRequest.status = 'REJECTED';
    await rideRequest.save();

    // Emit Socket.io event to passenger
    try {
      const io = getIO();
      io.to(`user-${rideRequest.passengerId._id}`).emit('ride-rejected-notification', {
        rideId: rideRequest._id,
        tripId: rideRequest.tripId._id,
        message: 'Your ride request has been rejected',
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.io emit error:', socketError);
      // Continue even if socket fails
    }

    res.status(200).json({
      success: true,
      data: rideRequest
    });

  } catch (error) {
    console.error('Reject ride error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reject ride'
    });
  }
};

// @desc    Get ride requests for a specific trip
// @route   GET /api/rides/trip/:tripId
// @access  Private (Drivers only)
export const getRideRequestsForTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Find the trip
    const trip = await Trip.findById(tripId);

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
        message: 'Only the trip driver can view ride requests'
      });
    }

    // Get all ride requests for this trip
    const rideRequests = await RideRequest.find({ tripId })
      .populate('passengerId', 'name email')
      .populate('tripId', 'source destination scheduledTime vehicleType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rideRequests.length,
      rides: rideRequests
    });

  } catch (error) {
    console.error('Get ride requests error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get ride requests'
    });
  }
};

// @desc    Get passenger's rides
// @route   GET /api/rides/passenger/rides
// @access  Private
export const getPassengerRides = async (req, res) => {
  try {
    const passengerId = req.user.userId;

    // Get all ride requests for this passenger
    const rideRequests = await RideRequest.find({ passengerId })
      .populate('tripId')
      .populate('passengerId', 'name email')
      .sort({ createdAt: -1 });

    // Populate driver information from tripId
    const ridesWithDriver = await Promise.all(
      rideRequests.map(async (ride) => {
        if (ride.tripId) {
          await ride.tripId.populate('driverId', 'name email');
        }
        return ride;
      })
    );

    res.status(200).json({
      success: true,
      count: ridesWithDriver.length,
      rides: ridesWithDriver
    });

  } catch (error) {
    console.error('Get passenger rides error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get passenger rides'
    });
  }
};

// @desc    Mark passenger as picked up
// @route   POST /api/rides/:id/pickup
// @access  Private (Driver only)
export const markAsPickedUp = async (req, res) => {
  try {
    const rideRequestId = req.params.id;

    // Find the ride request
    const rideRequest = await RideRequest.findById(rideRequestId)
      .populate('passengerId', 'name email')
      .populate('tripId');

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: 'Ride request not found'
      });
    }

    // Check if the user is the driver of this trip
    if (rideRequest.tripId.driverId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the trip driver can mark passengers as picked up'
      });
    }

    // Check if request is approved
    if (rideRequest.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Only approved passengers can be picked up'
      });
    }

    // Check if already picked up
    if (rideRequest.pickupStatus === 'PICKED_UP') {
      return res.status(400).json({
        success: false,
        message: 'Passenger already marked as picked up'
      });
    }

    // Update pickup status
    rideRequest.pickupStatus = 'PICKED_UP';
    rideRequest.pickedUpAt = new Date();
    await rideRequest.save();

    // Emit Socket.io event to passenger
    try {
      const io = getIO();
      io.to(`user-${rideRequest.passengerId._id}`).emit('pickup-status-update', {
        rideId: rideRequest._id,
        pickupStatus: 'PICKED_UP',
        message: 'You have been picked up',
        timestamp: new Date()
      });
      
      // Also emit to trip room
      io.to(`trip:${rideRequest.tripId._id}`).emit('passengerPickup', {
        rideId: rideRequest._id,
        passengerId: rideRequest.passengerId._id,
        passengerName: rideRequest.passengerId.name,
        pickupStatus: 'PICKED_UP'
      });
    } catch (socketError) {
      console.error('Socket.io emit error:', socketError);
    }

    res.status(200).json({
      success: true,
      data: rideRequest,
      message: 'Passenger marked as picked up'
    });

  } catch (error) {
    console.error('Mark as picked up error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to mark passenger as picked up'
    });
  }
};

// @desc    Mark passenger as dropped off
// @route   POST /api/rides/:id/dropoff
// @access  Private (Driver only)
export const markAsDroppedOff = async (req, res) => {
  try {
    const rideRequestId = req.params.id;

    // Find the ride request
    const rideRequest = await RideRequest.findById(rideRequestId)
      .populate('passengerId', 'name email')
      .populate('tripId');

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: 'Ride request not found'
      });
    }

    // Check if the user is the driver of this trip
    if (rideRequest.tripId.driverId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the trip driver can mark passengers as dropped off'
      });
    }

    // Check if request is approved
    if (rideRequest.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Only approved passengers can be dropped off'
      });
    }

    // Check if picked up
    if (rideRequest.pickupStatus !== 'PICKED_UP') {
      return res.status(400).json({
        success: false,
        message: 'Passenger must be picked up before being dropped off'
      });
    }

    // Update pickup status
    rideRequest.pickupStatus = 'DROPPED_OFF';
    rideRequest.droppedOffAt = new Date();
    await rideRequest.save();

    // Emit Socket.io event to passenger
    try {
      const io = getIO();
      io.to(`user-${rideRequest.passengerId._id}`).emit('pickup-status-update', {
        rideId: rideRequest._id,
        pickupStatus: 'DROPPED_OFF',
        message: 'You have been dropped off',
        timestamp: new Date()
      });
      
      // Also emit to trip room
      io.to(`trip:${rideRequest.tripId._id}`).emit('passengerDropoff', {
        rideId: rideRequest._id,
        passengerId: rideRequest.passengerId._id,
        passengerName: rideRequest.passengerId.name,
        pickupStatus: 'DROPPED_OFF'
      });
    } catch (socketError) {
      console.error('Socket.io emit error:', socketError);
    }

    res.status(200).json({
      success: true,
      data: rideRequest,
      message: 'Passenger marked as dropped off'
    });

  } catch (error) {
    console.error('Mark as dropped off error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to mark passenger as dropped off'
    });
  }
};
