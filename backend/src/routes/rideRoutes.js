import express from 'express';
import {
  requestRide,
  approveRide,
  rejectRide,
  getRideRequestsForTrip,
  getPassengerRides
} from '../controllers/rideController.js';
import protect from '../middlewares/authMiddleware.js';
import requireDriver from '../middlewares/driverMiddleware.js';

const router = express.Router();

// Request a ride (authenticated users)
router.post('/rides/request', protect, requestRide);

// Get ride requests for a specific trip (drivers only)
router.get('/rides/trip/:tripId', protect, requireDriver, getRideRequestsForTrip);

// Get passenger's rides
router.get('/rides/passenger/rides', protect, getPassengerRides);

// Approve a ride request (drivers only)
router.post('/rides/:id/approve', protect, requireDriver, approveRide);

// Reject a ride request (drivers only)
router.post('/rides/:id/reject', protect, requireDriver, rejectRide);

export default router;
