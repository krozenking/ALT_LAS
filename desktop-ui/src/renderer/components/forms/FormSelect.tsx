import React, { useRef, useEffect } from 'react';
import {
  Select,
  SelectProps,
  useColorMode,
} from '@chakra-ui/react';
import { useFormContext } from '../../contexts/FormContext';
import FormField, { FormFieldProps } from './FormField';

export interface SelectOption {
  /**
   * Option value
   */
  value: string;
  /**
   * Option label
   */
  label: string;
  /**
   * Whether the option is disabled
   */
  disabled?: boolean;
  /**
   * Option group
   */
  group?: string;
  /**
   * Option description
   */
  description?: string;
  /**
   * Option icon
   */
  icon?: React.ReactNode;
  /**
   * Option color
   */
  color?: string;
  /**
   * Option background color
   */
  backgroundColor?: string;
  /**
   * Option data
   */
  data?: any;
}

export interface SelectGroup {
  /**
   * Group label
   */
  label: string;
  /**
   * Group options
   */
  options: SelectOption[];
  /**
   * Whether the group is disabled
   */
  disabled?: boolean;
}

export interface FormSelectProps extends Omit<FormFieldProps, 'children'> {
  /**
   * Select props
   */
  selectProps?: SelectProps;
  /**
   * Options
   */
  options?: SelectOption[];
  /**
   * Option groups
   */
  groups?: SelectGroup[];
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
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  /**
   * On blur callback
   */
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  /**
   * On focus callback
   */
  onFocus?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  /**
   * Whether to auto focus
   */
  autoFocus?: boolean;
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
   * Whether to include empty option
   */
  includeEmptyOption?: boolean;
  /**
   * Empty option label
   */
  emptyOptionLabel?: string;
  /**
   * Empty option value
   */
  emptyOptionValue?: string;
  /**
   * Whether to sort options
   */
  sortOptions?: boolean;
  /**
   * Sort function
   */
  sortFn?: (a: SelectOption, b: SelectOption) => number;
  /**
   * Filter function
   */
  filterFn?: (option: SelectOption) => boolean;
  /**
   * Whether to show option icons
   */
  showOptionIcons?: boolean;
  /**
   * Whether to show option descriptions
   */
  showOptionDescriptions?: boolean;
  /**
   * Whether to show option colors
   */
  showOptionColors?: boolean;
  /**
   * Whether to show option background colors
   */
  showOptionBackgroundColors?: boolean;
  /**
   * Whether to show option groups
   */
  showOptionGroups?: boolean;
  /**
   * Whether to disable option groups
   */
  disableOptionGroups?: boolean;
  /**
   * Whether to disable empty option
   */
  disableEmptyOption?: boolean;
  /**
   * Whether to disable selected option
   */
  disableSelectedOption?: boolean;
  /**
   * Whether to disable unselected options
   */
  disableUnselectedOptions?: boolean;
  /**
   * Whether to disable first option
   */
  disableFirstOption?: boolean;
  /**
   * Whether to disable last option
   */
  disableLastOption?: boolean;
  /**
   * Whether to disable options by index
   */
  disableOptionsByIndex?: number[];
  /**
   * Whether to disable options by value
   */
  disableOptionsByValue?: string[];
  /**
   * Whether to disable options by label
   */
  disableOptionsByLabel?: string[];
  /**
   * Whether to disable options by group
   */
  disableOptionsByGroup?: string[];
  /**
   * Whether to disable options by filter
   */
  disableOptionsByFilter?: (option: SelectOption) => boolean;
}

/**
 * Form select component
 */
export const FormSelect: React.FC<FormSelectProps> = ({
  name,
  selectProps = {},
  options = [],
  groups = [],
  placeholder,
  defaultValue,
  value,
  onChange,
  onBlur,
  onFocus,
  autoFocus = false,
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
  includeEmptyOption = false,
  emptyOptionLabel = 'Select an option',
  emptyOptionValue = '',
  sortOptions = false,
  sortFn,
  filterFn,
  showOptionIcons = false,
  showOptionDescriptions = false,
  showOptionColors = false,
  showOptionBackgroundColors = false,
  showOptionGroups = true,
  disableOptionGroups = false,
  disableEmptyOption = false,
  disableSelectedOption = false,
  disableUnselectedOptions = false,
  disableFirstOption = false,
  disableLastOption = false,
  disableOptionsByIndex = [],
  disableOptionsByValue = [],
  disableOptionsByLabel = [],
  disableOptionsByGroup = [],
  disableOptionsByFilter,
  ...rest
}) => {
  const form = useFormContext();
  const { colorMode } = useColorMode();
  const selectRef = useRef<HTMLSelectElement>(null);
  
  // Get field props
  const fieldProps = form.getFieldProps(name);
  
  // Handle select change
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // Call onChange callback if provided
    if (onChange) {
      onChange(event);
    }
    
    // Update form field value
    form.setFieldValue(name, event.target.value);
  };
  
  // Handle select blur
  const handleBlur = (event: React.FocusEvent<HTMLSelectElement>) => {
    // Call onBlur callback if provided
    if (onBlur) {
      onBlur(event);
    }
    
    // Update form field touched state
    form.setFieldTouched(name, true);
  };
  
  // Handle select focus
  const handleFocus = (event: React.FocusEvent<HTMLSelectElement>) => {
    // Call onFocus callback if provided
    if (onFocus) {
      onFocus(event);
    }
  };
  
  // Auto focus select on mount
  useEffect(() => {
    if (autoFocus && selectRef.current) {
      selectRef.current.focus();
    }
  }, [autoFocus]);
  
  // Prepare options
  const prepareOptions = () => {
    let preparedOptions = [...options];
    
    // Filter options if needed
    if (filterFn) {
      preparedOptions = preparedOptions.filter(filterFn);
    }
    
    // Sort options if needed
    if (sortOptions) {
      preparedOptions.sort(sortFn || ((a, b) => a.label.localeCompare(b.label)));
    }
    
    return preparedOptions;
  };
  
  // Prepare groups
  const prepareGroups = () => {
    let preparedGroups = [...groups];
    
    // Filter groups if needed
    if (filterFn) {
      preparedGroups = preparedGroups.map(group => ({
        ...group,
        options: group.options.filter(filterFn),
      })).filter(group => group.options.length > 0);
    }
    
    // Sort groups if needed
    if (sortOptions) {
      preparedGroups.sort((a, b) => a.label.localeCompare(b.label));
      
      // Sort options within groups
      preparedGroups = preparedGroups.map(group => ({
        ...group,
        options: [...group.options].sort(sortFn || ((a, b) => a.label.localeCompare(b.label))),
      }));
    }
    
    return preparedGroups;
  };
  
  // Check if option is disabled
  const isOptionDisabled = (option: SelectOption, index: number) => {
    // Check option disabled flag
    if (option.disabled) {
      return true;
    }
    
    // Check if selected option should be disabled
    if (disableSelectedOption && option.value === fieldProps.value) {
      return true;
    }
    
    // Check if unselected options should be disabled
    if (disableUnselectedOptions && option.value !== fieldProps.value) {
      return true;
    }
    
    // Check if first option should be disabled
    if (disableFirstOption && index === 0) {
      return true;
    }
    
    // Check if last option should be disabled
    if (disableLastOption && index === options.length - 1) {
      return true;
    }
    
    // Check if option should be disabled by index
    if (disableOptionsByIndex.includes(index)) {
      return true;
    }
    
    // Check if option should be disabled by value
    if (disableOptionsByValue.includes(option.value)) {
      return true;
    }
    
    // Check if option should be disabled by label
    if (disableOptionsByLabel.includes(option.label)) {
      return true;
    }
    
    // Check if option should be disabled by group
    if (option.group && disableOptionsByGroup.includes(option.group)) {
      return true;
    }
    
    // Check if option should be disabled by filter
    if (disableOptionsByFilter && disableOptionsByFilter(option)) {
      return true;
    }
    
    return false;
  };
  
  // Render options
  const renderOptions = () => {
    const preparedOptions = prepareOptions();
    
    return (
      <>
        {includeEmptyOption && (
          <option value={emptyOptionValue} disabled={disableEmptyOption}>
            {emptyOptionLabel}
          </option>
        )}
        
        {preparedOptions.map((option, index) => (
          <option
            key={option.value}
            value={option.value}
            disabled={isOptionDisabled(option, index)}
            style={{
              color: showOptionColors ? option.color : undefined,
              backgroundColor: showOptionBackgroundColors ? option.backgroundColor : undefined,
            }}
          >
            {option.label}
          </option>
        ))}
      </>
    );
  };
  
  // Render option groups
  const renderOptionGroups = () => {
    const preparedGroups = prepareGroups();
    
    return (
      <>
        {includeEmptyOption && (
          <option value={emptyOptionValue} disabled={disableEmptyOption}>
            {emptyOptionLabel}
          </option>
        )}
        
        {preparedGroups.map((group) => (
          <optgroup
            key={group.label}
            label={group.label}
            disabled={disableOptionGroups || group.disabled}
          >
            {group.options.map((option, index) => (
              <option
                key={option.value}
                value={option.value}
                disabled={isOptionDisabled(option, index)}
                style={{
                  color: showOptionColors ? option.color : undefined,
                  backgroundColor: showOptionBackgroundColors ? option.backgroundColor : undefined,
                }}
              >
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </>
    );
  };
  
  return (
    <FormField name={name} {...rest}>
      <Select
        ref={selectRef}
        id={id || name}
        name={name}
        value={value !== undefined ? value : fieldProps.value || ''}
        defaultValue={defaultValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled || fieldProps.disabled}
        readOnly={readOnly || fieldProps.readonly}
        required={isRequired || fieldProps.required}
        isInvalid={isInvalid || !!fieldProps.error}
        variant={variant}
        focusBorderColor={focusBorderColor}
        errorBorderColor={errorBorderColor}
        size={size}
        {...selectProps}
      >
        {showOptionGroups && groups.length > 0 ? renderOptionGroups() : renderOptions()}
      </Select>
    </FormField>
  );
};

export default FormSelect;
