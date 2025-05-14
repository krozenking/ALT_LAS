import React, { ReactNode } from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  FormControlProps,
  FormLabelProps,
  FormErrorMessageProps,
  FormHelperTextProps,
} from '@chakra-ui/react';
import { useFormContext } from '../../contexts/FormContext';

export interface FormFieldProps extends FormControlProps {
  /**
   * Field name
   */
  name: string;
  /**
   * Field label
   */
  label?: ReactNode;
  /**
   * Field help text
   */
  helpText?: ReactNode;
  /**
   * Children components
   */
  children: ReactNode;
  /**
   * Whether to hide the error message
   */
  hideError?: boolean;
  /**
   * Whether to hide the help text
   */
  hideHelp?: boolean;
  /**
   * Whether to hide the label
   */
  hideLabel?: boolean;
  /**
   * Whether to show the error message only when the field is touched
   */
  showErrorOnlyWhenTouched?: boolean;
  /**
   * Whether to show the error message only when the field is dirty
   */
  showErrorOnlyWhenDirty?: boolean;
  /**
   * Whether to show the error message only when the form is submitted
   */
  showErrorOnlyWhenSubmitted?: boolean;
  /**
   * Label props
   */
  labelProps?: FormLabelProps;
  /**
   * Error message props
   */
  errorProps?: FormErrorMessageProps;
  /**
   * Help text props
   */
  helpTextProps?: FormHelperTextProps;
}

/**
 * Form field component
 */
export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  helpText,
  children,
  hideError = false,
  hideHelp = false,
  hideLabel = false,
  showErrorOnlyWhenTouched = true,
  showErrorOnlyWhenDirty = false,
  showErrorOnlyWhenSubmitted = false,
  labelProps = {},
  errorProps = {},
  helpTextProps = {},
  ...rest
}) => {
  const form = useFormContext();
  
  // Get field props
  const { error, touched, dirty, required } = form.getFieldProps(name);
  
  // Check if error should be shown
  const showError =
    !hideError &&
    error !== null &&
    (!showErrorOnlyWhenTouched || touched) &&
    (!showErrorOnlyWhenDirty || dirty) &&
    (!showErrorOnlyWhenSubmitted || form.formState.isSubmitted);
  
  return (
    <FormControl
      isInvalid={showError}
      isRequired={required}
      {...rest}
    >
      {!hideLabel && label && (
        <FormLabel htmlFor={name} {...labelProps}>
          {label}
        </FormLabel>
      )}
      
      {children}
      
      {showError && (
        <FormErrorMessage {...errorProps}>
          {error}
        </FormErrorMessage>
      )}
      
      {!hideHelp && helpText && !showError && (
        <FormHelperText {...helpTextProps}>
          {helpText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default FormField;
