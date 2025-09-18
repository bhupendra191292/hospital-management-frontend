import React from 'react';
import './SearchInput.css';

const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className = "",
  disabled = false 
}) => {
  return (
    <div className={`search-input-container ${className}`}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="search-input"
        />
        {value && (
          <button 
            className="clear-button"
            onClick={() => onChange('')}
            type="button"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
