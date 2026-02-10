import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MapView from './MapView';
import { io } from 'socket.io-client';

const LiveTrackingMap = ({ trip, userRole }) => {
  const [driverLocation, setDriverLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState('');
  const [simulationInterval, setSimulationInterval] = useState(null);

  // Get passenger waypoints from approved ride requests
  const passengerWaypoints = (trip.rideRequests || [])
    .filter(req => req.status === 'APPROVED' && req.passengerId?.pickupLocation)
    .map(req => ({
      lat: req.passengerId.pickupLocation.lat,
      lng: req.passengerId.pickupLocation.lng,
      name: req.passengerId.name || 'Passenger',
      address: req.passengerId.pickupLocation.address
    }));

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to tracking socket');
      // Join the trip room
      newSocket.emit('joinTrip', trip._id);
    });

    newSocket.on('locationUpdate', (data) => {
      if (data.tripId === trip._id) {
        setDriverLocation({
          lat: data.location.lat,
          lng: data.location.lng
        });
      }
    });

    newSocket.on('tripStatusUpdate', (data) => {
      if (data.tripId === trip._id) {
        console.log('Trip status updated:', data.status);
      }
    });

    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('leaveTrip', trip._id);
        newSocket.disconnect();
      }
    };
  }, [trip._id]);

  // Start tracking driver's location (for drivers only)
  useEffect(() => {
    if (userRole !== 'driver' || !socket || trip.status !== 'STARTED') {
      return;
    }

    let watchId;

    const startTracking = () => {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setDriverLocation(location);
            
            // Emit location to server
            socket.emit('updateLocation', {
              tripId: trip._id,
              location
            });
            setIsTracking(true);
          },
          (err) => {
            console.error('Geolocation error:', err);
            setError('Failed to get location. Please enable location services.');
            setIsTracking(false);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000
          }
        );
      } else {
        setError('Geolocation not supported by your browser');
      }
    };

    startTracking();

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [socket, trip._id, trip.status, userRole]);

  // Simulate location movement for testing (driver only)
  const startSimulation = () => {
    if (!trip.sourceLocation || !trip.destinationLocation) {
      setError('Cannot simulate - missing location data');
      return;
    }

    setIsSimulating(true);
    setError('');

    // Start from source location
    let currentLat = trip.sourceLocation.lat || trip.sourceLocation.coordinates?.coordinates[1];
    let currentLng = trip.sourceLocation.lng || trip.sourceLocation.coordinates?.coordinates[0];
    
    const targetLat = trip.destinationLocation.lat || trip.destinationLocation.coordinates?.coordinates[1];
    const targetLng = trip.destinationLocation.lng || trip.destinationLocation.coordinates?.coordinates[0];

    if (!currentLat || !currentLng || !targetLat || !targetLng) {
      setError('Invalid location coordinates');
      setIsSimulating(false);
      return;
    }

    // Calculate step increments (move in 20 steps)
    const steps = 20;
    const latStep = (targetLat - currentLat) / steps;
    const lngStep = (targetLng - currentLng) / steps;
    let stepCount = 0;

    const interval = setInterval(() => {
      if (stepCount >= steps) {
        clearInterval(interval);
        setIsSimulating(false);
        return;
      }

      currentLat += latStep;
      currentLng += lngStep;
      stepCount++;

      const location = { lat: currentLat, lng: currentLng };
      setDriverLocation(location);

      // Emit to server via socket
      if (socket) {
        socket.emit('updateLocation', {
          tripId: trip._id,
          location
        });
      }
    }, 2000); // Update every 2 seconds

    setSimulationInterval(interval);
  };

  const stopSimulation = () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
    setIsSimulating(false);
  };

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {trip.status === 'STARTED' ? '🚗 Trip In Progress' : '📍 Trip Overview'}
            </h3>
            {userRole === 'driver' && trip.status === 'STARTED' && (
              <p className="text-sm text-gray-600 mt-1">
                {isTracking ? (
                  <span className="text-green-600">✓ Location tracking active</span>
                ) : isSimulating ? (
                  <span className="text-blue-600">🔄 Simulating movement</span>
                ) : (
                  <span className="text-amber-600">⚠ Starting location tracking...</span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {userRole === 'driver' && trip.status === 'STARTED' && (
              <button
                onClick={isSimulating ? stopSimulation : startSimulation}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSimulating 
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isSimulating ? '⏹ Stop Test' : '🧪 Test Location'}
              </button>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              trip.status === 'STARTED' 
                ? 'bg-blue-100 text-blue-700'
                : trip.status === 'COMPLETED'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {trip.status}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Live Route Map</h4>
        <MapView
          sourceLocation={trip.sourceLocation}
          destinationLocation={trip.destinationLocation}
          waypoints={passengerWaypoints}
          driverLocation={driverLocation}
          height="500px"
        />

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Start Point</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-700">Destination</span>
          </div>
          {passengerWaypoints.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">Passengers ({passengerWaypoints.length})</span>
            </div>
          )}
          {driverLocation && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700">Driver (Live)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

LiveTrackingMap.propTypes = {
  trip: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    sourceLocation: PropTypes.object,
    destinationLocation: PropTypes.object,
    rideRequests: PropTypes.array,
    status: PropTypes.string
  }).isRequired,
  userRole: PropTypes.string.isRequired
};

export default LiveTrackingMap;
