# Google Maps API Integration - Setup Instructions

## ✅ Implementation Complete!

The Google Maps API has been successfully integrated into the application. Follow these steps to complete the setup:

## 1. Get Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API** (for location autocomplete)
   - **Geocoding API** (for address to coordinates conversion)
   - **Maps JavaScript API** (for map rendering)
   - **Distance Matrix API** (optional, for route calculations)
4. Go to "Credentials" and create an API Key
5. **Important**: Restrict your API key:
   - Set HTTP referrer restrictions (e.g., `localhost:5173/*`, `yourdomain.com/*`)
   - Restrict API key to only the APIs listed above

## 2. Configure Environment Variables

### Frontend (.env file)
Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in:
```
c:\Users\jayad\Desktop\SOFTWARE ENGG\FRESH\Intelligent-Ride-Sharing-and-Sustainable-Mobility-Platform\frontend\.env
```

### Frontend (index.html)
Replace `YOUR_API_KEY_HERE` in:
```
c:\Users\jayad\Desktop\SOFTWARE ENGG\FRESH\Intelligent-Ride-Sharing-and-Sustainable-Mobility-Platform\frontend\index.html
```
**Line 8**: Update the Google Maps script tag with your actual API key.

### Backend (.env file) - Optional
If needed for server-side geocoding:
```
c:\Users\jayad\Desktop\SOFTWARE ENGG\FRESH\Intelligent-Ride-Sharing-and-Sustainable-Mobility-Platform\backend\.env
```

## 3. Restart the Application

After updating the API keys:

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 4. Test the Integration

### Scenario 1: Driver Creates a Trip
1. Login as an employee who is **approved as a driver**
2. Navigate to "Create Trip"
3. **Test the autocomplete**:
   - Type in the "Source" field (e.g., "Bangalore")
   - You should see Google Places suggestions appear
   - Select a location from the dropdown
   - Repeat for "Destination" field
4. Fill in the remaining details and create the trip

### Scenario 2: Passenger Searches for Trips
1. In another browser tab/window, login as a regular **employee** (passenger)
2. Navigate to "Search Trips"
3. **Test the geolocation search**:
   - Type a source location (e.g., "Electronic City, Bangalore")
   - Select from autocomplete suggestions
   - Type a destination (e.g., "Whitefield, Bangalore")
   - Select from autocomplete suggestions
4. Click "Search Trips"
5. **Expected Result**: The trip created by the driver should appear if:
   - Source and destination are within 5km radius
   - Trip status is "SCHEDULED"
   - Available seats > 0

## 5. What Changed

### New Files Created:
- ✅ `frontend/src/components/LocationAutocomplete.jsx` - Google Places autocomplete component
- ✅ `frontend/.env` - Frontend environment variables

### Updated Files:
- ✅ `frontend/index.html` - Added Google Maps API script
- ✅ `frontend/src/pages/driver/CreateTrip.jsx` - Uses LocationAutocomplete
- ✅ `frontend/src/pages/passenger/SearchTrips.jsx` - Uses LocationAutocomplete with geo coordinates
- ✅ `backend/src/models/Trip.js` - Added geolocation fields and 2dsphere indexes
- ✅ `backend/src/controllers/tripController.js` - Added geo-based search logic
- ✅ `backend/.env` - Added Google Maps API key placeholder

## 6. How It Works

### Driver Creates Trip with Coordinates:
1. Driver types location → Google Places suggests real addresses
2. On selection, the app captures:
   - Address text
   - Latitude/Longitude coordinates
3. Trip is saved with both text and geo coordinates

### Passenger Searches with Geo-Matching:
1. Passenger types and selects locations
2. Search sends coordinates to backend
3. Backend uses MongoDB's `$geoNear` to find trips within 5km radius
4. Results are sorted by scheduled time

### Fallback:
- If coordinates aren't available, falls back to text-based regex search
- Ensures backward compatibility with existing trips

## 7. Benefits

✅ **Smart Matching**: Finds trips within 5km radius, not just exact text matches  
✅ **Real Addresses**: Google Places ensures valid, existing locations  
✅ **Flexible Search**: "Electronic City Phase 1" matches "Electronic City Phase 2"  
✅ **Better UX**: Autocomplete prevents typos and invalid locations  
✅ **Future-Ready**: Foundation for route visualization, distance calculation, etc.

## 8. Troubleshooting

### Issue: Autocomplete not appearing
- Check browser console for errors
- Verify Google Maps API key is set in `index.html`
- Ensure Places API is enabled in Google Cloud Console
- Check for CORS or API key restrictions

### Issue: Search returns no results
- Verify trips have geolocation data (check database)
- Try creating a new trip after setup
- Check if `maxDistance` parameter (default: 5000m) is appropriate
- Verify MongoDB 2dsphere indexes are created

### Issue: "Google is not defined" error
- Ensure Google Maps script loads before React app
- Check `async defer` attributes in script tag
- Reload the page to allow script to load

## 9. Next Steps (Optional Enhancements)

- 🗺️ **Map Visualization**: Show trip routes on Google Maps
- 📏 **Distance Display**: Show "2.3 km from your location"
- 🚗 **Route Optimization**: Use Distance Matrix API for best routes
- 📍 **Live Tracking**: Real-time driver location updates
- 💰 **Dynamic Pricing**: Calculate fare based on actual distance

## 10. Cost Considerations

Google Maps API pricing (as of 2024):
- **Free tier**: $200 credit/month
- **Places Autocomplete**: $2.83 per 1000 requests (after free tier)
- **Geocoding**: $5.00 per 1000 requests

For a small-medium corporate carpooling app, you'll likely stay within the free tier.

---

**Status**: ✅ Ready to test!  
**Next Action**: Add your Google Maps API key and test the flow described in Section 4.
