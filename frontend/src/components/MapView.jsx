import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PropTypes from 'prop-types';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for source and destination
const sourceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map bounds when markers change
const MapBounds = ({ sourceLocation, destinationLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (sourceLocation && destinationLocation) {
      const bounds = L.latLngBounds(
        [sourceLocation.lat, sourceLocation.lng],
        [destinationLocation.lat, destinationLocation.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (sourceLocation) {
      map.setView([sourceLocation.lat, sourceLocation.lng], 13);
    } else if (destinationLocation) {
      map.setView([destinationLocation.lat, destinationLocation.lng], 13);
    }
  }, [sourceLocation, destinationLocation, map]);

  return null;
};

MapBounds.propTypes = {
  sourceLocation: PropTypes.object,
  destinationLocation: PropTypes.object,
};

const MapView = ({ sourceLocation, destinationLocation, height = '400px', className = '' }) => {
  // Validate location has valid coordinates
  const isValidLocation = (loc) => {
    return loc && typeof loc.lat === 'number' && typeof loc.lng === 'number' && 
           !isNaN(loc.lat) && !isNaN(loc.lng);
  };

  const validSource = isValidLocation(sourceLocation) ? sourceLocation : null;
  const validDestination = isValidLocation(destinationLocation) ? destinationLocation : null;

  // Default center (India)
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  // Calculate center and zoom based on available locations
  let center = defaultCenter;
  let zoom = defaultZoom;

  if (validSource && validDestination) {
    center = [
      (validSource.lat + validDestination.lat) / 2,
      (validSource.lng + validDestination.lng) / 2
    ];
    zoom = 10;
  } else if (validSource) {
    center = [validSource.lat, validSource.lng];
    zoom = 13;
  } else if (validDestination) {
    center = [validDestination.lat, validDestination.lng];
    zoom = 13;
  }

  // Create polyline positions if both locations exist
  const polylinePositions = validSource && validDestination
    ? [
        [validSource.lat, validSource.lng],
        [validDestination.lat, validDestination.lng]
      ]
    : [];

  return (
    <div className={`rounded-lg overflow-hidden shadow-md ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Source Marker */}
        {validSource && (
          <Marker
            position={[validSource.lat, validSource.lng]}
            icon={sourceIcon}
          >
            <Popup>
              <div className="font-semibold text-green-700">Pickup Location</div>
              <div className="text-sm text-gray-600">{validSource.address}</div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {validDestination && (
          <Marker
            position={[validDestination.lat, validDestination.lng]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="font-semibold text-red-700">Drop-off Location</div>
              <div className="text-sm text-gray-600">{validDestination.address}</div>
            </Popup>
          </Marker>
        )}

        {/* Route Line */}
        {polylinePositions.length > 0 && (
          <Polyline
            positions={polylinePositions}
            color="#3B82F6"
            weight={4}
            opacity={0.7}
          />
        )}

        {/* Auto-adjust bounds */}
        <MapBounds 
          sourceLocation={validSource} 
          destinationLocation={validDestination} 
        />
      </MapContainer>
    </div>
  );
};

MapView.propTypes = {
  sourceLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    address: PropTypes.string
  }),
  destinationLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    address: PropTypes.string
  }),
  height: PropTypes.string,
  className: PropTypes.string,
};

export default MapView;
