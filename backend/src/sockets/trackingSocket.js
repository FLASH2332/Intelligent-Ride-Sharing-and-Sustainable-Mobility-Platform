import Trip from '../models/Trip.js';
import jwt from 'jsonwebtoken';

export const setupTrackingSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected to tracking`);

    // Join a specific trip room
    socket.on('joinTrip', async (tripId) => {
      try {
        const trip = await Trip.findById(tripId);
        
        if (!trip) {
          socket.emit('error', { message: 'Trip not found' });
          return;
        }

        socket.join(`trip:${tripId}`);
        console.log(`User ${socket.userId} joined trip ${tripId}`);

        // Send current trip status
        socket.emit('tripStatus', {
          tripId: trip._id,
          status: trip.status,
          currentLocation: trip.currentLocation
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join trip' });
      }
    });

    // Leave a trip room
    socket.on('leaveTrip', (tripId) => {
      socket.leave(`trip:${tripId}`);
      console.log(`User ${socket.userId} left trip ${tripId}`);
    });

    // Update driver location
    socket.on('updateLocation', async ({ tripId, location }) => {
      try {
        // Verify the user is the driver of this trip
        const trip = await Trip.findById(tripId);
        
        if (!trip) {
          socket.emit('error', { message: 'Trip not found' });
          return;
        }

        if (trip.driverId.toString() !== socket.userId) {
          socket.emit('error', { message: 'Only the driver can update location' });
          return;
        }

        // Update trip's current location
        trip.currentLocation = {
          type: 'Point',
          coordinates: [location.lng, location.lat] // MongoDB uses [lng, lat]
        };
        
        await trip.save();

        // Broadcast location to all users in the trip room
        io.to(`trip:${tripId}`).emit('locationUpdate', {
          tripId,
          location: {
            lat: location.lat,
            lng: location.lng
          },
          timestamp: new Date()
        });

        console.log(`Location updated for trip ${tripId}`);
      } catch (error) {
        console.error('Location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Start trip
    socket.on('startTrip', async (tripId) => {
      try {
        const trip = await Trip.findById(tripId);
        
        if (!trip) {
          socket.emit('error', { message: 'Trip not found' });
          return;
        }

        if (trip.driverId.toString() !== socket.userId) {
          socket.emit('error', { message: 'Only the driver can start the trip' });
          return;
        }

        if (trip.status !== 'SCHEDULED') {
          socket.emit('error', { message: 'Trip already started or completed' });
          return;
        }

        trip.status = 'STARTED';
        trip.actualStartTime = new Date();
        await trip.save();

        // Notify all passengers
        io.to(`trip:${tripId}`).emit('tripStatusUpdate', {
          tripId,
          status: 'STARTED',
          message: 'Trip has started!'
        });

        console.log(`Trip ${tripId} started`);
      } catch (error) {
        console.error('Start trip error:', error);
        socket.emit('error', { message: 'Failed to start trip' });
      }
    });

    // Complete trip
    socket.on('completeTrip', async (tripId) => {
      try {
        const trip = await Trip.findById(tripId);
        
        if (!trip) {
          socket.emit('error', { message: 'Trip not found' });
          return;
        }

        if (trip.driverId.toString() !== socket.userId) {
          socket.emit('error', { message: 'Only the driver can complete the trip' });
          return;
        }

        if (trip.status === 'COMPLETED') {
          socket.emit('error', { message: 'Trip already completed' });
          return;
        }

        trip.status = 'COMPLETED';
        trip.actualEndTime = new Date();
        await trip.save();

        // Notify all passengers
        io.to(`trip:${tripId}`).emit('tripStatusUpdate', {
          tripId,
          status: 'COMPLETED',
          message: 'Trip has been completed!'
        });

        console.log(`Trip ${tripId} completed`);
      } catch (error) {
        console.error('Complete trip error:', error);
        socket.emit('error', { message: 'Failed to complete trip' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from tracking`);
    });
  });
};

export default setupTrackingSocket;
