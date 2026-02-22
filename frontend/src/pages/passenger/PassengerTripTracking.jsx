import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rideService } from '../../services/rideService';
import { tripService } from '../../services/tripService';
import LiveTrackingMap from '../../components/LiveTrackingMap';
import { io } from 'socket.io-client';
import calculateETA from '../../services/etaService';

const PassengerTripTracking = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eta, setEta] = useState(null);
  const [etaLastUpdated, setEtaLastUpdated] = useState(null);
  const tripRef = useRef(null);

  // Keep tripRef in sync so socket handler always has fresh trip data
  useEffect(() => { tripRef.current = trip; }, [trip]);

  useEffect(() => {
    fetchRideDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideId]);

  // Setup socket connection for real-time updates
  useEffect(() => {
    if (!ride) return;

    const token = localStorage.getItem('authToken');
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to tracking socket');
      newSocket.emit('joinTrip', ride.tripId._id);
    });

    newSocket.on('locationUpdate', async (data) => {
      if (data.tripId !== ride.tripId._id) return;

      // Use server-computed ETA if available
      if (data.eta) {
        setEta(data.eta);
        setEtaLastUpdated(Date.now());
        return;
      }

      // Fallback: compute ETA on client from driver location + trip destination
      const currentTrip = tripRef.current;
      if (!currentTrip?.destinationLocation) return;
      const dl = currentTrip.destinationLocation;
      const dest =
        typeof dl.lat === 'number'
          ? { lat: dl.lat, lng: dl.lng }
          : dl.coordinates?.coordinates?.length === 2
            ? { lat: dl.coordinates.coordinates[1], lng: dl.coordinates.coordinates[0] }
            : null;
      if (!dest) return;
      const driverLoc = { lat: data.location.lat, lng: data.location.lng };
      const result = await calculateETA(driverLoc, dest);
      if (result) {
        setEta(result);
        setEtaLastUpdated(Date.now());
      }
    });

    newSocket.on('pickup-status-update', (data) => {
      if (data.rideId === rideId) {
        setRide(prev => ({
          ...prev,
          pickupStatus: data.pickupStatus
        }));
      }
    });

    newSocket.on('tripStatusUpdate', (data) => {
      if (data.tripId === ride.tripId._id) {
        setTrip(prev => ({ ...prev, status: data.status }));
        // Clear ETA when trip is no longer active
        if (data.status !== 'STARTED') {
          setEta(null);
        }
      }
    });

    return () => {
      if (newSocket) {
        newSocket.emit('leaveTrip', ride.tripId._id);
        newSocket.disconnect();
      }
    };
  }, [ride, rideId]);

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      // Get passenger's rides and find this one
      const data = await rideService.getPassengerRides();
      const currentRide = data.rides.find(r => r._id === rideId);

      if (!currentRide) {
        setError('Ride not found');
        return;
      }

      setRide(currentRide);

      // Fetch full trip details
      if (currentRide.tripId?._id) {
        const tripData = await tripService.getTripById(currentRide.tripId._id);
        setTrip(tripData.trip);
      }
    } catch (err) {
      setError(err.message || 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (!ride || !trip) return { text: 'Unknown', color: 'gray', icon: '❓' };

    // Trip not started yet
    if (trip.status === 'SCHEDULED') {
      return {
        text: 'Trip Scheduled',
        color: 'blue',
        icon: '📅',
        message: 'Waiting for driver to start the trip'
      };
    }

    // Trip started
    if (trip.status === 'STARTED') {
      if (ride.pickupStatus === 'DROPPED_OFF') {
        return {
          text: 'Dropped Off',
          color: 'gray',
          icon: '✓',
          message: 'You have reached your destination'
        };
      } else if (ride.pickupStatus === 'PICKED_UP') {
        return {
          text: 'On Board',
          color: 'green',
          icon: '🚗',
          message: 'You are on the way to your destination'
        };
      } else {
        return {
          text: 'Driver On the Way',
          color: 'amber',
          icon: '⏳',
          message: 'Driver is coming to pick you up'
        };
      }
    }

    // Trip completed
    if (trip.status === 'COMPLETED') {
      return {
        text: 'Trip Completed',
        color: 'green',
        icon: '✓',
        message: 'Thank you for riding with us!'
      };
    }

    // Trip cancelled
    if (trip.status === 'CANCELLED') {
      return {
        text: 'Trip Cancelled',
        color: 'red',
        icon: '✕',
        message: 'This trip has been cancelled'
      };
    }

    return { text: trip.status, color: 'gray', icon: '❓', message: '' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error || !ride || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Trip</h2>
            <p className="text-gray-600 mb-6">{error || 'Ride not found'}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Track Your Ride</h1>
            <p className="text-gray-600 mt-1">Real-time trip status and location</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-4">{statusInfo.icon}</div>
            <h2 className={`text-2xl font-bold mb-2 text-${statusInfo.color}-700`}>
              {statusInfo.text}
            </h2>
            <p className="text-gray-600 text-lg">{statusInfo.message}</p>

            {/* ── Inline ETA badge (only when trip is active and we have data) ── */}
            {trip.status === 'STARTED' && eta && (
              <div
                style={{
                  marginTop: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2040 100%)',
                  borderRadius: '14px',
                  padding: '14px 24px',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '11px', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Arrives in</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#63b3ed', lineHeight: 1 }}>
                    {eta.etaText}
                  </div>
                  {eta.fallback && (
                    <div style={{ fontSize: '10px', opacity: 0.45 }}>≈ estimated</div>
                  )}
                </div>
                <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.15)' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '11px', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Remaining</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#9ae6b4', lineHeight: 1 }}>
                    {eta.distanceText}
                  </div>
                </div>
                {etaLastUpdated && (
                  <div style={{ fontSize: '10px', opacity: 0.4, marginLeft: '4px', alignSelf: 'flex-end' }}>
                    · refreshes 60s
                  </div>
                )}
              </div>
            )}

            {/* Waiting for ETA */}
            {trip.status === 'STARTED' && !eta && (
              <div
                style={{
                  marginTop: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f7fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  color: '#718096',
                  fontSize: '13px',
                }}
              >
                <span style={{ fontSize: '16px' }}>⏳</span>
                Calculating ETA — waiting for driver location…
              </div>
            )}
          </div>
        </div>

        {/* Trip Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">Trip Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Route</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <div className="text-sm text-gray-600">Pickup</div>
                    <div className="font-medium text-gray-900">{trip.source}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <div className="text-sm text-gray-600">Destination</div>
                    <div className="font-medium text-gray-900">{trip.destination}</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Driver & Vehicle</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Driver:</span>
                  <p className="font-medium text-gray-900">
                    {trip.driverId?.name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Vehicle:</span>
                  <p className="font-medium text-gray-900">{trip.vehicleType}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Scheduled:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(trip.scheduledTime).toLocaleString()}
                  </p>
                </div>
                {trip.actualStartTime && (
                  <div>
                    <span className="text-sm text-gray-600">Started at:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(trip.actualStartTime).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Map */}
        {trip.status === 'STARTED' && (
          <LiveTrackingMap trip={trip} userRole="passenger" />
        )}

        {/* Timeline for pickup status */}
        {trip.status === 'STARTED' && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Journey Progress</h3>
            <div className="flex items-center justify-between">
              <div className={`flex flex-col items-center ${ride.pickupStatus !== 'WAITING' ? 'text-green-600' : 'text-gray-400'
                }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${ride.pickupStatus !== 'WAITING' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                  ✓
                </div>
                <p className="text-sm mt-2 font-medium">Picked Up</p>
              </div>
              <div className="flex-1 h-1 mx-4 bg-gray-200">
                <div className={`h-full ${ride.pickupStatus === 'PICKED_UP' || ride.pickupStatus === 'DROPPED_OFF'
                  ? 'bg-green-500'
                  : 'bg-gray-200'
                  }`} style={{ width: ride.pickupStatus === 'PICKED_UP' ? '50%' : ride.pickupStatus === 'DROPPED_OFF' ? '100%' : '0%' }}></div>
              </div>
              <div className={`flex flex-col items-center ${ride.pickupStatus === 'DROPPED_OFF' ? 'text-green-600' : 'text-gray-400'
                }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${ride.pickupStatus === 'DROPPED_OFF' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                  ✓
                </div>
                <p className="text-sm mt-2 font-medium">Dropped Off</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerTripTracking;
