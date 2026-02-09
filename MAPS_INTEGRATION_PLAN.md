# Google Maps API Integration Plan

## Why Google Maps?
- **Autocomplete**: Users can select actual locations from suggestions
- **Geolocation**: Store lat/lng for accurate distance calculations
- **Route Matching**: Find trips along the route, not just exact matches
- **Distance/Duration**: Calculate actual travel time and distance

## Implementation Steps

### 1. Setup Google Maps API
```bash
# Get API Key from: https://console.cloud.google.com/
# Enable these APIs:
- Places API (for autocomplete)
- Geocoding API (for address to coordinates)
- Distance Matrix API (for route calculations)
```

### 2. Frontend Changes

#### Add Google Maps Script (index.html)
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
```

#### Create Location Autocomplete Component
```jsx
// frontend/src/components/LocationAutocomplete.jsx
import { useRef, useEffect } from 'react';

const LocationAutocomplete = ({ value, onChange, placeholder }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'in' }, // India only
      fields: ['formatted_address', 'geometry', 'name']
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        onChange({
          address: place.formatted_address,
          name: place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      }
    });
  }, []);

  return <input ref={inputRef} defaultValue={value} placeholder={placeholder} />;
};
```

### 3. Backend Changes

#### Update Trip Model (models/Trip.js)
```javascript
const tripSchema = new mongoose.Schema({
  // ... existing fields
  
  source: {
    address: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  
  destination: {
    address: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number]
    }
  },
  
  route: {
    type: { type: String, enum: ['LineString'] },
    coordinates: [[Number]] // Array of [lng, lat] points
  }
});

// Geospatial index for location-based queries
tripSchema.index({ 'source.coordinates': '2dsphere' });
tripSchema.index({ 'destination.coordinates': '2dsphere' });
```

#### Update Search Logic (controllers/tripController.js)
```javascript
export const searchTrips = async (req, res) => {
  const { sourceLat, sourceLng, destLat, destLng, maxDistance = 5000 } = req.query;

  // Find trips with source within 5km and destination within 5km
  const trips = await Trip.find({
    status: 'SCHEDULED',
    availableSeats: { $gt: 0 },
    'source.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [sourceLng, sourceLat] },
        $maxDistance: maxDistance // meters
      }
    },
    'destination.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [destLng, destLat] },
        $maxDistance: maxDistance
      }
    }
  }).populate('driverId', 'name email');

  res.json({ success: true, trips });
};
```

### 4. Environment Variables
```env
# Add to backend/.env
GOOGLE_MAPS_API_KEY=your_api_key_here

# Add to frontend/.env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Benefits Over Current System
1. **Flexible Matching**: Find trips within 5km radius, not exact text match
2. **Real Addresses**: Autocomplete ensures valid locations
3. **Smart Search**: "Electronic City" matches "Electronic City Phase 1", "Phase 2", etc.
4. **Distance Calculation**: Show "2.3 km from your location"
5. **Route Visualization**: Can show trip route on map

## Migration Strategy
1. Keep current text search as fallback
2. Add Maps API alongside existing system
3. Gradually migrate existing trips to use coordinates
4. Eventually remove text-based search

## Estimated Implementation Time
- Frontend autocomplete: 2-3 hours
- Backend geo queries: 2-3 hours
- Testing & refinement: 2-3 hours
- **Total: 6-9 hours**

## Cost Consideration
- Google Maps API has generous free tier
- First $200/month is free
- For small-medium apps, stays within free tier
