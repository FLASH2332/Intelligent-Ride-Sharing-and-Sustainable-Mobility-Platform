import mongoose from 'mongoose';

const rideRequestSchema = new mongoose.Schema({
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Passenger ID is required']
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: [true, 'Trip ID is required']
  },
  status: {
    type: String,
    enum: {
      values: ['PENDING', 'APPROVED', 'REJECTED'],
      message: '{VALUE} is not a valid status'
    },
    default: 'PENDING'
  },
  pickupStatus: {
    type: String,
    enum: {
      values: ['WAITING', 'PICKED_UP', 'DROPPED_OFF'],
      message: '{VALUE} is not a valid pickup status'
    },
    default: 'WAITING'
  },
  pickedUpAt: {
    type: Date
  },
  droppedOffAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
rideRequestSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Index for querying pending requests by passenger
rideRequestSchema.index({ passengerId: 1, status: 1 });
rideRequestSchema.index({ tripId: 1, status: 1 });

const RideRequest = mongoose.model('RideRequest', rideRequestSchema);

export default RideRequest;
