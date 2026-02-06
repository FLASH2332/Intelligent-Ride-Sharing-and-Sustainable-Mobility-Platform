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
  seatsAvailable: {
    type: Number,
    required: [true, 'Seats available is required'],
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
          return 'CAR can have maximum 7 seats available';
        } else if (this.vehicleType === 'BIKE') {
          return 'BIKE must have exactly 1 seat available';
        }
        return 'Invalid seats configuration';
      }
    }
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(value) {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return value >= now && value <= sevenDaysFromNow;
      },
      message: 'Start time must be within the next 7 days'
    }
  },
  route: {
    type: {
      type: String,
      enum: ['LineString'],
      required: true
    },
    coordinates: {
      type: [[Number]],
      required: true,
      validate: {
        validator: function(value) {
          return value && value.length >= 2;
        },
        message: 'Route must have at least 2 coordinates (start and end points)'
      }
    }
  },
  status: {
    type: String,
    enum: {
      values: ['PLANNED', 'ONGOING', 'COMPLETED'],
      message: '{VALUE} is not a valid status'
    },
    default: 'PLANNED'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index on route
tripSchema.index({ route: '2dsphere' });

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
