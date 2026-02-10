// Socket.io handlers for ride sharing real-time features
import Trip from '../models/Trip.js';

export const setupRideSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a trip room for tracking
    socket.on('joinTrip', (tripId) => {
      if (!tripId) {
        socket.emit('error', { message: 'Trip ID is required' });
        return;
      }

      socket.join(`trip-${tripId}`);
      console.log(`Socket ${socket.id} joined trip room: trip-${tripId}`);
      
      socket.emit('trip-joined', { 
        tripId, 
        message: 'Successfully joined trip room' 
      });
    });

    // Leave a trip room
    socket.on('leaveTrip', (tripId) => {
      if (tripId) {
        socket.leave(`trip-${tripId}`);
        console.log(`Socket ${socket.id} left trip room: trip-${tripId}`);
      }
    });

    // Driver updates location during active trip
    socket.on('updateDriverLocation', async (data) => {
      const { tripId, location } = data;

      if (!tripId || !location || !location.coordinates) {
        socket.emit('error', { message: 'Trip ID and location coordinates are required' });
        return;
      }

      try {
        // Update trip location in database
        const trip = await Trip.findById(tripId);
        if (trip && trip.status === 'IN_PROGRESS') {
          trip.currentLocation = location;
          await trip.save();

          // Broadcast location update to all passengers in the trip room
          io.to(`trip-${tripId}`).emit('driverLocationUpdate', location);
          console.log(`Driver location updated for trip ${tripId}`);
        }
      } catch (error) {
        console.error('Error updating driver location:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Broadcast trip status change (start/end)
    socket.on('tripStatusChanged', (data) => {
      const { tripId, status } = data;

      if (!tripId || !status) {
        socket.emit('error', { message: 'Trip ID and status are required' });
        return;
      }

      // Broadcast to all users in the trip room
      io.to(`trip-${tripId}`).emit('tripStatusUpdate', status);
      console.log(`Trip ${tripId} status changed to ${status}`);
    });

    // Legacy events (keep for backward compatibility)
    socket.on('join-trip', (data) => {
      const { tripId, userId } = data;
      
      if (!tripId) {
        socket.emit('error', { message: 'Trip ID is required' });
        return;
      }

      socket.join(`trip-${tripId}`);
      console.log(`User ${userId || socket.id} joined trip room: trip-${tripId}`);
      
      socket.emit('trip-joined', { 
        tripId, 
        message: 'Successfully joined trip room' 
      });
    });

    socket.on('location-update', (data) => {
      const { tripId, location } = data;

      if (!tripId || !location) {
        socket.emit('error', { message: 'Trip ID and location are required' });
        return;
      }

      const { latitude, longitude } = location;

      if (!latitude || !longitude) {
        socket.emit('error', { message: 'Valid latitude and longitude are required' });
        return;
      }

      socket.to(`trip-${tripId}`).emit('driver-location', {
        tripId,
        location: {
          latitude,
          longitude,
          timestamp: new Date()
        }
      });

      console.log(`Location update for trip ${tripId}:`, location);
    });

    // Emit ride approval to specific passenger
    socket.on('ride-approved', (data) => {
      const { passengerId, rideId, tripId } = data;

      if (!passengerId || !rideId) {
        socket.emit('error', { message: 'Passenger ID and Ride ID are required' });
        return;
      }

      // Emit to passenger's personal room
      io.to(`user-${passengerId}`).emit('ride-approved-notification', {
        rideId,
        tripId,
        message: 'Your ride request has been approved',
        timestamp: new Date()
      });

      console.log(`Ride ${rideId} approved for passenger ${passengerId}`);
    });

    // Join user's personal room for notifications
    socket.on('join-user-room', (data) => {
      const { userId } = data;

      if (!userId) {
        socket.emit('error', { message: 'User ID is required' });
        return;
      }

      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined personal room: user-${userId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

export default setupRideSocket;
