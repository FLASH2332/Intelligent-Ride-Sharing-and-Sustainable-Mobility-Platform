import express from 'express';
import {
  createTrip,
  searchTrips,
  startTrip,
  completeTrip,
  cancelTrip,
  endTrip,
  getDriverTrips,
  updateDriverLocation,
  getTripById
} from '../controllers/tripController.js';
import protect from '../middlewares/authMiddleware.js';
import requireDriver from '../middlewares/driverMiddleware.js';

const router = express.Router();

// Create a new trip (drivers only)
router.post('/trips', protect, requireDriver, createTrip);

// Search for trips near a location (authenticated users)
router.get('/trips/search', protect, searchTrips);

// Get specific trip details (authenticated users)
router.get('/trips/:id', protect, getTripById);

// Get driver's trips (drivers only)
router.get('/trips/driver/trips', protect, requireDriver, getDriverTrips);

// Start a trip (drivers only)
router.post('/trips/:id/start', protect, requireDriver, startTrip);

// Complete a trip (drivers only)
router.post('/trips/:id/complete', protect, requireDriver, completeTrip);

// Cancel a trip (drivers only)
router.post('/trips/:id/cancel', protect, requireDriver, cancelTrip);

// End a trip (drivers only) - legacy endpoint
router.post('/trips/:id/end', protect, requireDriver, endTrip);

// Update driver location during trip (drivers only)
router.post('/trips/:id/location', protect, requireDriver, updateDriverLocation);

export default router;
