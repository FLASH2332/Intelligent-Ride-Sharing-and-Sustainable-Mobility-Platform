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
  destination: {
    type: String,
    required: [true, 'Destination location is required'],
    trim: true
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
      values: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'],
      message: '{VALUE} is not a valid status'
    },
    default: 'SCHEDULED'
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
      enum: ['LineString'],
      default: 'LineString'
    },
    coordinates: {
      type: [[Number]],
      default: [[0, 0], [0, 0]]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index on route
tripSchema.index({ route: '2dsphere' });

// Index for text-based searches
tripSchema.index({ source: 'text', destination: 'text' });
tripSchema.index({ status: 1, availableSeats: 1 });

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
