import RideRequest from '../models/RideRequest.js';
import Trip from '../models/Trip.js';
import { getIO } from '../config/socket.js';

// @desc    Request a ride
// @route   POST /api/rides/request
// @access  Private (Passengers only)
export const requestRide = async (req, res) => {
  try {
    const { tripId } = req.body;
    const passengerId = req.user._id;

    // Check if user is a driver (passengers only can request)
    if (req.user.isDriver) {
      return res.status(403).json({
        success: false,
        message: 'Drivers cannot request rides'
      });
    }

    if (!tripId) {
      return res.status(400).json({
        success: false,
        message: 'Trip ID is required'
      });
    }

    // Check if passenger already has a pending request
    const existingRequest = await RideRequest.findOne({
      passengerId,
      status: 'PENDING'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending ride request'
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

    if (trip.status !== 'PLANNED') {
      return res.status(400).json({
        success: false,
        message: 'Trip is not available for booking'
      });
    }

    if (trip.seatsAvailable < 1) {
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
    if (rideRequest.tripId.driverId.toString() !== req.user._id.toString()) {
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
        seatsAvailable: { $gt: 0 }
      },
      {
        $inc: { seatsAvailable: -1 }
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
        seatsAvailable: trip.seatsAvailable
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
    if (rideRequest.tripId.driverId.toString() !== req.user._id.toString()) {
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
