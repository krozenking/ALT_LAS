import React, { useState, useRef, useEffect } from 'react';
import {
  Textarea,
  TextareaProps,
  Box,
  Text,
  Flex,
  useColorMode,
} from '@chakra-ui/react';
import { useFormContext } from '../../contexts/FormContext';
import FormField, { FormFieldProps } from './FormField';

export interface FormTextareaProps extends Omit<FormFieldProps, 'children'> {
  /**
   * Textarea props
   */
  textareaProps?: TextareaProps;
  /**
   * Placeholder
   */
  placeholder?: string;
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
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /**
   * On blur callback
   */
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  /**
   * On focus callback
   */
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
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
   * Whether to auto resize
   */
  autoResize?: boolean;
  /**
   * Minimum rows
   */
  minRows?: number;
  /**
   * Maximum rows
   */
  maxRows?: number;
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
  /**
   * Resize
   */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

/**
 * Form textarea component
 */
export const FormTextarea: React.FC<FormTextareaProps> = ({
  name,
  textareaProps = {},
  placeholder,
  defaultValue,
  value,
  onChange,
  onBlur,
  onFocus,
  autoFocus = false,
  autoSelect = false,
  trimValue = false,
  normalizeValue = false,
  formatValue = false,
  formatFn,
  parseFn,
  validateFn,
  showCharCount = false,
  maxLength,
  minLength,
  autoResize = false,
  minRows = 3,
  maxRows = 10,
  autoCapitalize,
  autoCorrect,
  autoComplete,
  spellCheck,
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
  resize = 'vertical',
  ...rest
}) => {
  const form = useFormContext();
  const { colorMode } = useColorMode();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Get field props
  const fieldProps = form.getFieldProps(name);
  
  // Handle textarea change
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
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
    
    // Auto resize if needed
    if (autoResize && textareaRef.current) {
      autoResizeTextarea(textareaRef.current, minRows, maxRows);
    }
  };
  
  // Handle textarea blur
  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
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
  
  // Handle textarea focus
  const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    
    // Call onFocus callback if provided
    if (onFocus) {
      onFocus(event);
    }
    
    // Auto select text if needed
    if (autoSelect && textareaRef.current) {
      textareaRef.current.select();
    }
  };
  
  // Auto resize textarea
  const autoResizeTextarea = (
    textarea: HTMLTextAreaElement,
    minRows: number,
    maxRows: number
  ) => {
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
    const minHeight = minRows * lineHeight;
    const maxHeight = maxRows * lineHeight;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set new height
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  };
  
  // Auto focus textarea on mount
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);
  
  // Auto resize textarea on mount
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      autoResizeTextarea(textareaRef.current, minRows, maxRows);
    }
  }, [autoResize, minRows, maxRows]);
  
  // Auto resize textarea when value changes
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      autoResizeTextarea(textareaRef.current, minRows, maxRows);
    }
  }, [autoResize, minRows, maxRows, value, fieldProps.value]);
  
  // Render character count
  const renderCharCount = () => {
    if (!showCharCount) {
      return null;
    }
    
    const count = String(fieldProps.value || '').length;
    const max = maxLength || 0;
    
    return (
      <Text
        fontSize="xs"
        color={count > max ? 'red.500' : 'gray.500'}
        textAlign="right"
        mt={1}
      >
        {max ? `${count}/${max}` : count}
      </Text>
    );
  };
  
  return (
    <FormField name={name} {...rest}>
      <Box>
        <Textarea
          ref={textareaRef}
          id={id || name}
          name={name}
          value={value !== undefined ? value : fieldProps.value || ''}
          defaultValue={defaultValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          maxLength={maxLength}
          minLength={minLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          disabled={disabled || fieldProps.disabled}
          readOnly={readOnly || fieldProps.readonly}
          required={isRequired || fieldProps.required}
          isInvalid={isInvalid || !!fieldProps.error}
          variant={variant}
          focusBorderColor={focusBorderColor}
          errorBorderColor={errorBorderColor}
          size={size}
          resize={resize}
          rows={minRows}
          {...textareaProps}
        />
        
        {renderCharCount()}
      </Box>
    </FormField>
  );
};

export default FormTextarea;
