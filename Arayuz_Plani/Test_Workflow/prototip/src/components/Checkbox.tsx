// src/components/Checkbox.tsx
import React from 'react';

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  id?: string;
  name?: string;
  value?: string;
  indeterminate?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  error,
  helperText,
  id,
  name,
  value,
  indeterminate = false,
}) => {
  const checkboxId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };
  
  // Use ref to set indeterminate state (not possible with props)
  const checkboxRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  
  return (
    <div className="relative flex items-start">
      <div className="flex items-center h-5">
        <input
          ref={checkboxRef}
          id={checkboxId}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          value={value}
          aria-invalid={!!error}
          aria-describedby={
            error 
              ? `${checkboxId}-error` 
              : helperText 
                ? `${checkboxId}-helper` 
                : undefined
          }
          className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
            error ? 'border-red-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>
      <div className="ml-3 text-sm">
        <label 
          htmlFor={checkboxId} 
          className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}
        >
          {label}
        </label>
        {helperText && !error && (
          <p id={`${checkboxId}-helper`} className="text-gray-500">
            {helperText}
          </p>
        )}
        {error && (
          <p id={`${checkboxId}-error`} className="text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
