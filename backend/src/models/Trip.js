import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Driver ID is required']
  },
  vehicleType: {
    type: String,
    enum: {
      values: ['CAR', 'BIKE'],
      message: '{VALUE} is not a valid vehicle type'
    },
    required: [true, 'Vehicle type is required']
  },
  totalSeats: {
    type: Number,
    required: [true, 'Total seats is required'],
    min: [1, 'At least 1 seat must be available'],
    validate: {
      validator: function(value) {
        if (this.vehicleType === 'CAR') {
          return value <= 7;
        } else if (this.vehicleType === 'BIKE') {
          return value === 1;
        }
        return true;
      },
      message: function(_props) {
        if (this.vehicleType === 'CAR') {
          return 'CAR can have maximum 7 seats';
        } else if (this.vehicleType === 'BIKE') {
          return 'BIKE must have exactly 1 seat';
        }
        return 'Invalid seats configuration';
      }
    }
  },
  availableSeats: {
    type: Number,
    required: [true, 'Available seats is required'],
    min: [0, 'Available seats cannot be negative']
  },
  source: {
    type: String,
    required: [true, 'Source location is required'],
    trim: true
  },
  sourceLocation: {
    address: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
  },
  destination: {
    type: String,
    required: [true, 'Destination location is required'],
    trim: true
  },
  destinationLocation: {
    address: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
  },
  scheduledTime: {
    type: Date,
    required: [true, 'Scheduled time is required'],
    validate: {
      validator: function(value) {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return value >= now && value <= sevenDaysFromNow;
      },
      message: 'Scheduled time must be within the next 7 days'
    }
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: {
      values: ['SCHEDULED', 'STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      message: '{VALUE} is not a valid status'
    },
    default: 'SCHEDULED'
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  // Legacy fields for backward compatibility with geo-based queries
  seatsAvailable: {
    type: Number,
    default: function() {
      return this.availableSeats;
    }
  },
  startTime: {
    type: Date,
    default: function() {
      return this.scheduledTime;
    }
  },
  route: {
    type: {
      type: String,
      enum: ['LineString']
    },
    coordinates: {
      type: [[Number]],
      validate: {
        validator: function(coords) {
          // Route must have at least 2 distinct vertices
          if (!coords || coords.length < 2) return false;
          // Check that not all coordinates are the same
          const first = coords[0];
          return coords.some(coord => coord[0] !== first[0] || coord[1] !== first[1]);
        },
        message: 'Route must have at least 2 distinct vertices'
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for rides
tripSchema.virtual('rides', {
  ref: 'RideRequest',
  localField: '_id',
  foreignField: 'tripId'
});

// Create 2dsphere index on route
tripSchema.index({ route: '2dsphere' });
tripSchema.index({ 'sourceLocation.coordinates': '2dsphere' });
tripSchema.index({ 'destinationLocation.coordinates': '2dsphere' });
tripSchema.index({ currentLocation: '2dsphere' });

// Index for efficient searches
tripSchema.index({ status: 1, availableSeats: 1 });
tripSchema.index({ source: 1, destination: 1 });

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
