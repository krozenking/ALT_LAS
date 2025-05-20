// src/components/Dropdown.tsx
import React, { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  fullWidth?: boolean;
  id?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seçiniz',
  disabled = false,
  error,
  required = false,
  fullWidth = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | undefined>(
    value ? options.find(option => option.value === value) : undefined
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const dropdownId = id || `dropdown-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const listboxId = `${dropdownId}-listbox`;
  
  useEffect(() => {
    // Update selected option when value prop changes
    if (value) {
      const option = options.find(option => option.value === value);
      if (option) {
        setSelectedOption(option);
      }
    } else {
      setSelectedOption(undefined);
    }
  }, [value, options]);
  
  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };
  
  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(option);
    setIsOpen(false);
    onChange?.(option.value);
  };
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        if (!isOpen) {
          event.preventDefault();
          setIsOpen(true);
        }
        break;
    }
  };
  
  // Tailwind classes
  const baseClasses = 'block w-full px-4 py-2 text-gray-900 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  const errorClasses = error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'cursor-pointer';
  const widthClass = fullWidth ? 'w-full' : 'max-w-lg';
  
  const classes = `${baseClasses} ${errorClasses} ${disabledClasses}`;
  
  return (
    <div className={widthClass} ref={dropdownRef}>
      <label 
        htmlFor={dropdownId} 
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative mt-1">
        <button
          type="button"
          id={dropdownId}
          className={classes}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${dropdownId}-label`}
          aria-controls={listboxId}
          aria-disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        >
          <span className="flex items-center justify-between">
            <span className="block truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="ml-2 pointer-events-none">
              <svg 
                className={`h-5 w-5 text-gray-400 transform ${isOpen ? 'rotate-180' : ''}`} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </span>
          </span>
        </button>
        
        {isOpen && (
          <ul
            id={listboxId}
            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            tabIndex={-1}
            role="listbox"
            aria-labelledby={`${dropdownId}-label`}
          >
            {options.map((option) => (
              <li
                key={option.value}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-100 ${
                  selectedOption?.value === option.value ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                }`}
                id={`${dropdownId}-option-${option.value}`}
                role="option"
                aria-selected={selectedOption?.value === option.value}
                onClick={() => handleSelect(option)}
              >
                <span className="block truncate">
                  {option.label}
                </span>
                
                {selectedOption?.value === option.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {error && (
        <p id={`${dropdownId}-error`} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
