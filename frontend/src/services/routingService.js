// Routing service using OSRM (Open Source Routing Machine)
// Free routing API based on OpenStreetMap data

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Get route between two points with actual road geometry
 * @param {Object} source - {lat, lng}
 * @param {Object} destination - {lat, lng}
 * @param {Array} waypoints - Optional intermediate points [{lat, lng}, ...]
 * @returns {Promise<Object>} Route data with geometry and distance
 */
export const getRoute = async (source, destination, waypoints = []) => {
  try {
    // Build coordinates string: lng,lat;lng,lat;...
    const points = [source, ...waypoints, destination];
    const coordinates = points
      .map(point => `${point.lng},${point.lat}`)
      .join(';');

    const url = `${OSRM_BASE_URL}/${coordinates}?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch route');
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = data.routes[0];
    
    return {
      coordinates: route.geometry.coordinates.map(coord => [coord[1], coord[0]]), // Convert [lng, lat] to [lat, lng]
      distance: route.distance, // in meters
      duration: route.duration, // in seconds
      steps: route.legs[0]?.steps || [],
    };
  } catch (error) {
    console.error('Routing error:', error);
    // Fallback to straight line if routing fails
    return {
      coordinates: [
        [source.lat, source.lng],
        [destination.lat, destination.lng]
      ],
      distance: null,
      duration: null,
      steps: [],
      fallback: true
    };
  }
};

/**
 * Calculate distance between two points (Haversine formula)
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRad = (value) => {
  return value * Math.PI / 180;
};

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatDistance = (meters) => {
  if (!meters) return 'N/A';
  
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
  if (!seconds) return 'N/A';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
};
