import express from 'express';
import {
  requestRide,
  approveRide,
  rejectRide
} from '../controllers/rideController.js';
import protect from '../middlewares/authMiddleware.js';
import requireDriver from '../middlewares/driverMiddleware.js';

const router = express.Router();

// Request a ride (authenticated users)
router.post('/rides/request', protect, requestRide);

// Approve a ride request (drivers only)
router.post('/rides/:id/approve', protect, requireDriver, approveRide);

// Reject a ride request (drivers only)
router.post('/rides/:id/reject', protect, requireDriver, rejectRide);

export default router;
