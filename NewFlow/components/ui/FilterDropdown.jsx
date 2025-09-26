import React, { useState } from 'react';
import './FilterDropdown.css';

const FilterDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Filter...',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`filter-dropdown ${className}`}>
      <button
        className={`filter-dropdown-button ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        type="button"
      >
        <span className="filter-text">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="filter-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="filter-dropdown-menu">
          <button
            className="filter-option"
            onClick={() => handleSelect({ value: '', label: 'All' })}
          >
            All
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              className={`filter-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
