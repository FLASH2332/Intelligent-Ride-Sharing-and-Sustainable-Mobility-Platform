import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const LocationAutocomplete = ({ value, onChange, placeholder, label, required }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);

  useEffect(() => {
    // Check if Google Maps script is loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps API not loaded yet');
      return;
    }

    // Initialize autocomplete
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'in' }, // India only
      fields: ['formatted_address', 'geometry', 'name', 'place_id']
    });

    autocompleteRef.current = autocomplete;

    // Listen for place selection
    const placeChangedListener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (place.geometry) {
        const locationData = {
          address: place.formatted_address || place.name,
          name: place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          placeId: place.place_id
        };
        
        setInputValue(locationData.address);
        onChange(locationData);
      }
    });

    // Cleanup
    return () => {
      if (window.google && window.google.maps && window.google.maps.event) {
        window.google.maps.event.removeListener(placeChangedListener);
      }
    };
  }, [onChange]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // If user manually clears or types, notify parent with just the text
    if (newValue !== value) {
      onChange({ address: newValue, lat: null, lng: null });
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      />
      <p className="text-xs text-gray-500 mt-1">
        Start typing to see location suggestions
      </p>
    </div>
  );
};

LocationAutocomplete.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool
};

LocationAutocomplete.defaultProps = {
  value: '',
  placeholder: 'Enter location',
  label: '',
  required: false
};

export default LocationAutocomplete;
