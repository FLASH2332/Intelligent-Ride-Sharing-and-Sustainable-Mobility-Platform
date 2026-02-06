// Socket.io handlers for ride sharing real-time features

export const setupRideSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a trip room
    socket.on('join-trip', (data) => {
      const { tripId, userId } = data;
      
      if (!tripId) {
        socket.emit('error', { message: 'Trip ID is required' });
        return;
      }

      // Join the trip room
      socket.join(`trip-${tripId}`);
      console.log(`User ${userId || socket.id} joined trip room: trip-${tripId}`);
      
      // Notify user they joined successfully
      socket.emit('trip-joined', { 
        tripId, 
        message: 'Successfully joined trip room' 
      });
    });

    // Driver broadcasts location update to trip room
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

      // Broadcast location to all users in the trip room except sender
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
