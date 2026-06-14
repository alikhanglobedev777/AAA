import React, { useState, useEffect } from 'react';
import './LocationSearchBar.css';

const LocationSearchBar = ({ onLocationChange, placeholder = 'Enter location...' }) => {
  const [searching, setSearching] = useState(false);
  const [location, setLocation] = useState('');

  // Clear search when component mounts or placeholder changes
  useEffect(() => {
    setLocation('');
  }, [placeholder]);

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    // Trigger search immediately as user types
    handleSearch(value);
  };

  const handleSearch = (searchTerm = '') => {
    if (searchTerm.trim() === '') {
      onLocationChange('');
      return;
    }
    setSearching(true);
    onLocationChange(searchTerm);
    setSearching(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(location);
    }
  };

  return (
    <div className="location-search-container">
      <div className="search-input-container">
        <input
          type="text"
          placeholder={placeholder}
          value={location}
          onChange={handleLocationChange}
          onKeyDown={handleKeyDown}
          className="location-input"
        />
        {location && (
          <button
            type="button"
            className="clear-button"
            onClick={() => {
              setLocation('');
              handleSearch('');
            }}
          >
            ×
          </button>
        )}
      </div>
      <div className="location-hint">
        Try: "Downtown", "West District", or "Northside"
      </div>
    </div>
  );
};

export default LocationSearchBar;
