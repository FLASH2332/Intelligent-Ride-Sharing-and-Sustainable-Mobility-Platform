import apiRequest from './api';

export const tripService = {
  // Create a new trip
  async createTrip(tripData) {
    return await apiRequest('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  },

  // Search trips
  async searchTrips(params) {
    const queryParams = new URLSearchParams();
    
    if (params.source) queryParams.append('source', params.source);
    if (params.destination) queryParams.append('destination', params.destination);
    if (params.vehicleType) queryParams.append('vehicleType', params.vehicleType);
    
    // Add geolocation coordinates for proximity search
    if (params.sourceLat) queryParams.append('sourceLat', params.sourceLat);
    if (params.sourceLng) queryParams.append('sourceLng', params.sourceLng);
    if (params.destLat) queryParams.append('destLat', params.destLat);
    if (params.destLng) queryParams.append('destLng', params.destLng);
    
    return await apiRequest(`/trips/search?${queryParams.toString()}`, {
      method: 'GET',
    });
  },

  // Get trip by ID
  async getTripById(tripId) {
    return await apiRequest(`/trips/${tripId}`, {
      method: 'GET',
    });
  },

  // Start trip
  async startTrip(tripId) {
    return await apiRequest(`/trips/${tripId}/start`, {
      method: 'POST',
    });
  },

  // End trip
  async endTrip(tripId) {
    return await apiRequest(`/trips/${tripId}/end`, {
      method: 'POST',
    });
  },

  // Get driver's trips
  async getDriverTrips() {
    return await apiRequest('/trips/driver/trips', {
      method: 'GET',
    });
  },
};
