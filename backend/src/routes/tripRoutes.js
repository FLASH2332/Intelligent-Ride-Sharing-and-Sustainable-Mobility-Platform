import express from 'express';
import {
  createTrip,
  searchTrips,
  startTrip,
  endTrip
} from '../controllers/tripController.js';
import protect from '../middlewares/authMiddleware.js';
import requireDriver from '../middlewares/driverMiddleware.js';

const router = express.Router();

// Create a new trip (drivers only)
router.post('/trips', protect, requireDriver, createTrip);

// Search for trips near a location (authenticated users)
router.get('/trips/search', protect, searchTrips);

// Start a trip (drivers only)
router.post('/trips/:id/start', protect, requireDriver, startTrip);

// End a trip (drivers only)
router.post('/trips/:id/end', protect, requireDriver, endTrip);

export default router;
