import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripService } from '../../services/tripService';
import InputField from '../../components/InputField';
import LocationAutocomplete from '../../components/LocationAutocomplete';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    scheduledTime: '',
    vehicleType: 'CAR',
    totalSeats: 4,
  });

  const [sourceLocation, setSourceLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);

  // Get max date (7 days from now)
  const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 16);
  };

  // Get min date (now)
  const getMinDate = () => {
    return new Date().toISOString().slice(0, 16);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-adjust seats based on vehicle type
    if (name === 'vehicleType') {
      setFormData({
        ...formData,
        [name]: value,
        totalSeats: value === 'BIKE' ? 1 : 4,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSourceChange = (locationData) => {
    setSourceLocation(locationData);
    setFormData({
      ...formData,
      source: locationData.address || locationData
    });
  };

  const handleDestinationChange = (locationData) => {
    setDestinationLocation(locationData);
    setFormData({
      ...formData,
      destination: locationData.address || locationData
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate form data
      if (!formData.source || !formData.destination || !formData.scheduledTime) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate seats for CAR
      if (formData.vehicleType === 'CAR' && (formData.totalSeats < 1 || formData.totalSeats > 7)) {
        setError('Car seats must be between 1 and 7');
        setLoading(false);
        return;
      }

      // Create trip
      await tripService.createTrip({
        source: formData.source,
        destination: formData.destination,
        scheduledTime: formData.scheduledTime,
        vehicleType: formData.vehicleType,
        totalSeats: parseInt(formData.totalSeats),
        sourceLocation: sourceLocation?.lat && sourceLocation?.lng ? {
          address: sourceLocation.address,
          lat: sourceLocation.lat,
          lng: sourceLocation.lng
        } : null,
        destinationLocation: destinationLocation?.lat && destinationLocation?.lng ? {
          address: destinationLocation.address,
          lat: destinationLocation.lat,
          lng: destinationLocation.lng
        } : null
      });

      setSuccess('Trip created successfully!');
      
      // Reset form
      setFormData({
        source: '',
        destination: '',
        scheduledTime: '',
        vehicleType: 'CAR',
        totalSeats: 4,
      });
      setSourceLocation(null);
      setDestinationLocation(null);

      // Redirect to driver dashboard after 2 seconds
      setTimeout(() => {
        navigate('/driver/requests');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create New Trip</h1>
            <p className="text-gray-600 mt-2">Fill in the details to create a new ride</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <LocationAutocomplete
              label="Source"
              value={formData.source}
              onChange={handleSourceChange}
              placeholder="Enter pickup location"
              required
            />

            <LocationAutocomplete
              label="Destination"
              value={formData.destination}
              onChange={handleDestinationChange}
              placeholder="Enter drop-off location"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                min={getMinDate()}
                max={getMaxDate()}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum 7 days from now</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="vehicleType"
                    value="CAR"
                    checked={formData.vehicleType === 'CAR'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Car</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="vehicleType"
                    value="BIKE"
                    checked={formData.vehicleType === 'BIKE'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Bike</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Seats
              </label>
              <input
                type="number"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                min={formData.vehicleType === 'BIKE' ? 1 : 1}
                max={formData.vehicleType === 'BIKE' ? 1 : 7}
                disabled={formData.vehicleType === 'BIKE'}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.vehicleType === 'BIKE'
                  ? 'Bike: 1 seat (fixed)'
                  : 'Car: 1-7 seats'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Trip...' : 'Create Trip'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/driver/requests')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Ride Requests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
