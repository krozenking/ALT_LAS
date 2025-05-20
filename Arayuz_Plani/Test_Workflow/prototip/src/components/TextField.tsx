// src/components/TextField.tsx
import React, { useState } from 'react';

interface TextFieldProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'password' | 'email' | 'number';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  id?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  placeholder = '',
  value = '',
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  error,
  helperText,
  fullWidth = false,
  id,
}) => {
  const [inputValue, setInputValue] = useState(value);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };
  
  const inputId = id || `textfield-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Tailwind classes
  const baseClasses = 'block w-full px-4 py-2 mt-1 text-gray-900 placeholder-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  const errorClasses = error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : '';
  const widthClass = fullWidth ? 'w-full' : 'max-w-lg';
  
  const classes = `${baseClasses} ${errorClasses} ${disabledClasses}`;
  
  return (
    <div className={widthClass}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1">
        <input
          id={inputId}
          type={type}
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={classes}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
