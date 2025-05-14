import React, { useState, useRef, useEffect } from 'react';
import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  InputProps,
  InputGroupProps,
  InputLeftElementProps,
  InputRightElementProps,
  IconButton,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react';
import { useFormContext } from '../../contexts/FormContext';
import FormField, { FormFieldProps } from './FormField';

export interface FormInputProps extends Omit<FormFieldProps, 'children'> {
  /**
   * Input props
   */
  inputProps?: InputProps;
  /**
   * Input group props
   */
  inputGroupProps?: InputGroupProps;
  /**
   * Left element props
   */
  leftElementProps?: InputLeftElementProps;
  /**
   * Right element props
   */
  rightElementProps?: InputRightElementProps;
  /**
   * Left element
   */
  leftElement?: React.ReactNode;
  /**
   * Right element
   */
  rightElement?: React.ReactNode;
  /**
   * Placeholder
   */
  placeholder?: string;
  /**
   * Type
   */
  type?: string;
  /**
   * Default value
   */
  defaultValue?: string;
  /**
   * Value
   */
  value?: string;
  /**
   * On change callback
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * On blur callback
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /**
   * On focus callback
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /**
   * Whether to show password toggle button
   */
  showPasswordToggle?: boolean;
  /**
   * Whether to show clear button
   */
  showClearButton?: boolean;
  /**
   * Whether to auto focus
   */
  autoFocus?: boolean;
  /**
   * Whether to auto select
   */
  autoSelect?: boolean;
  /**
   * Whether to trim value
   */
  trimValue?: boolean;
  /**
   * Whether to normalize value
   */
  normalizeValue?: boolean;
  /**
   * Whether to format value
   */
  formatValue?: boolean;
  /**
   * Format function
   */
  formatFn?: (value: string) => string;
  /**
   * Parse function
   */
  parseFn?: (value: string) => string;
  /**
   * Validate function
   */
  validateFn?: (value: string) => string | null;
  /**
   * Mask function
   */
  maskFn?: (value: string) => string;
  /**
   * Mask character
   */
  maskChar?: string;
  /**
   * Mask placeholder
   */
  maskPlaceholder?: string;
  /**
   * Whether to show character count
   */
  showCharCount?: boolean;
  /**
   * Maximum character count
   */
  maxLength?: number;
  /**
   * Minimum character count
   */
  minLength?: number;
  /**
   * Pattern
   */
  pattern?: string;
  /**
   * Whether to auto capitalize
   */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /**
   * Whether to auto correct
   */
  autoCorrect?: 'on' | 'off';
  /**
   * Whether to auto complete
   */
  autoComplete?: string;
  /**
   * Whether to spell check
   */
  spellCheck?: boolean;
  /**
   * Input mode
   */
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  /**
   * Whether to disable
   */
  disabled?: boolean;
  /**
   * Whether to make readonly
   */
  readOnly?: boolean;
  /**
   * Whether to make required
   */
  isRequired?: boolean;
  /**
   * Whether to make invalid
   */
  isInvalid?: boolean;
  /**
   * Size
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /**
   * Variant
   */
  variant?: 'outline' | 'filled' | 'flushed' | 'unstyled';
  /**
   * Color scheme
   */
  colorScheme?: string;
  /**
   * Focus border color
   */
  focusBorderColor?: string;
  /**
   * Error border color
   */
  errorBorderColor?: string;
  /**
   * ID
   */
  id?: string;
}

/**
 * Form input component
 */
export const FormInput: React.FC<FormInputProps> = ({
  name,
  inputProps = {},
  inputGroupProps = {},
  leftElementProps = {},
  rightElementProps = {},
  leftElement,
  rightElement,
  placeholder,
  type = 'text',
  defaultValue,
  value,
  onChange,
  onBlur,
  onFocus,
  showPasswordToggle = false,
  showClearButton = false,
  autoFocus = false,
  autoSelect = false,
  trimValue = false,
  normalizeValue = false,
  formatValue = false,
  formatFn,
  parseFn,
  validateFn,
  maskFn,
  maskChar,
  maskPlaceholder,
  showCharCount = false,
  maxLength,
  minLength,
  pattern,
  autoCapitalize,
  autoCorrect,
  autoComplete,
  spellCheck,
  inputMode,
  disabled,
  readOnly,
  isRequired,
  isInvalid,
  size,
  variant,
  colorScheme,
  focusBorderColor,
  errorBorderColor,
  id,
  ...rest
}) => {
  const form = useFormContext();
  const { colorMode } = useColorMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Get field props
  const fieldProps = form.getFieldProps(name);
  
  // Determine input type
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;
  
  // Handle input change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;
    
    // Trim value if needed
    if (trimValue) {
      newValue = newValue.trim();
    }
    
    // Normalize value if needed
    if (normalizeValue) {
      newValue = newValue.normalize();
    }
    
    // Format value if needed
    if (formatValue && formatFn) {
      newValue = formatFn(newValue);
    }
    
    // Apply mask if needed
    if (maskFn) {
      newValue = maskFn(newValue);
    }
    
    // Parse value if needed
    if (parseFn) {
      newValue = parseFn(newValue);
    }
    
    // Update event target value
    const newEvent = {
      ...event,
      target: {
        ...event.target,
        value: newValue,
      },
    };
    
    // Call onChange callback if provided
    if (onChange) {
      onChange(newEvent);
    }
    
    // Update form field value
    form.setFieldValue(name, newValue);
  };
  
  // Handle input blur
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    
    // Call onBlur callback if provided
    if (onBlur) {
      onBlur(event);
    }
    
    // Update form field touched state
    form.setFieldTouched(name, true);
    
    // Validate field if needed
    if (validateFn) {
      const error = validateFn(event.target.value);
      if (error) {
        form.setFieldError(name, error);
      }
    }
  };
  
  // Handle input focus
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    
    // Call onFocus callback if provided
    if (onFocus) {
      onFocus(event);
    }
    
    // Auto select text if needed
    if (autoSelect && inputRef.current) {
      inputRef.current.select();
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Clear input value
  const clearValue = () => {
    form.setFieldValue(name, '');
    
    // Focus input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Auto focus input on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // Render password toggle button
  const renderPasswordToggle = () => {
    if (!showPasswordToggle) {
      return null;
    }
    
    return (
      <Tooltip label={showPassword ? 'Hide password' : 'Show password'}>
        <IconButton
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          icon={showPassword ? '👁️' : '👁️‍🗨️'}
          size="sm"
          variant="ghost"
          onClick={togglePasswordVisibility}
        />
      </Tooltip>
    );
  };
  
  // Render clear button
  const renderClearButton = () => {
    if (!showClearButton || !fieldProps.value) {
      return null;
    }
    
    return (
      <Tooltip label="Clear">
        <IconButton
          aria-label="Clear"
          icon={'✖️'}
          size="sm"
          variant="ghost"
          onClick={clearValue}
        />
      </Tooltip>
    );
  };
  
  // Render character count
  const renderCharCount = () => {
    if (!showCharCount) {
      return null;
    }
    
    const count = String(fieldProps.value || '').length;
    const max = maxLength || 0;
    
    return (
      <Tooltip label="Character count">
        <Box fontSize="xs" color={count > max ? 'red.500' : 'gray.500'}>
          {max ? `${count}/${max}` : count}
        </Box>
      </Tooltip>
    );
  };
  
  // Determine if input has right element
  const hasRightElement = showPasswordToggle || showClearButton || showCharCount || rightElement;
  
  return (
    <FormField name={name} {...rest}>
      <InputGroup size={size} {...inputGroupProps}>
        {leftElement && (
          <InputLeftElement {...leftElementProps}>
            {leftElement}
          </InputLeftElement>
        )}
        
        <Input
          ref={inputRef}
          id={id || name}
          name={name}
          type={inputType}
          value={value !== undefined ? value : fieldProps.value || ''}
          defaultValue={defaultValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          inputMode={inputMode}
          disabled={disabled || fieldProps.disabled}
          readOnly={readOnly || fieldProps.readonly}
          required={isRequired || fieldProps.required}
          isInvalid={isInvalid || !!fieldProps.error}
          variant={variant}
          focusBorderColor={focusBorderColor}
          errorBorderColor={errorBorderColor}
          size={size}
          {...inputProps}
        />
        
        {hasRightElement && (
          <InputRightElement width="auto" {...rightElementProps}>
            <HStack spacing={1}>
              {renderCharCount()}
              {renderClearButton()}
              {renderPasswordToggle()}
              {rightElement}
            </HStack>
          </InputRightElement>
        )}
      </InputGroup>
    </FormField>
  );
};

// HStack component for right elements
const HStack: React.FC<{ spacing: number; children: React.ReactNode }> = ({ spacing, children }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing * 0.25}rem` }}>
      {children}
    </div>
  );
};

// Box component for character count
const Box: React.FC<{ fontSize: string; color: string; children: React.ReactNode }> = ({ fontSize, color, children }) => {
  return (
    <div style={{ fontSize, color }}>
      {children}
    </div>
  );
};

export default FormInput;
