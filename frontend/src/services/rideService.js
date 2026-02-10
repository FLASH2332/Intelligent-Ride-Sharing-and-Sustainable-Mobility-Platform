import apiRequest from './api';

export const rideService = {
  // Request a ride
  async requestRide(tripId) {
    return await apiRequest('/rides/request', {
      method: 'POST',
      body: JSON.stringify({ tripId }),
    });
  },

  // Get ride requests for a trip (driver)
  async getRideRequests(tripId) {
    return await apiRequest(`/rides/trip/${tripId}`, {
      method: 'GET',
    });
  },

  // Approve ride request
  async approveRideRequest(rideId) {
    return await apiRequest(`/rides/${rideId}/approve`, {
      method: 'POST',
    });
  },

  // Reject ride request
  async rejectRideRequest(rideId) {
    return await apiRequest(`/rides/${rideId}/reject`, {
      method: 'POST',
    });
  },

  // Combined decision function for convenience
  async decideRideRequest(rideId, decision) {
    if (decision === 'APPROVED') {
      return await this.approveRideRequest(rideId);
    } else if (decision === 'REJECTED') {
      return await this.rejectRideRequest(rideId);
    } else {
      throw new Error('Invalid decision. Must be APPROVED or REJECTED');
    }
  },

  // Get passenger's rides
  async getPassengerRides() {
    return await apiRequest('/rides/passenger/rides', {
      method: 'GET',
    });
  },

  // Get ride status
  async getRideStatus(rideId) {
    return await apiRequest(`/rides/${rideId}`, {
      method: 'GET',
    });
  },

  // Mark passenger as picked up
  async markAsPickedUp(rideId) {
    return await apiRequest(`/rides/${rideId}/pickup`, {
      method: 'POST',
    });
  },

  // Mark passenger as dropped off
  async markAsDroppedOff(rideId) {
    return await apiRequest(`/rides/${rideId}/dropoff`, {
      method: 'POST',
    });
  },
};

