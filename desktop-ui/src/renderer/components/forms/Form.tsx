import React, { ReactNode, FormEvent } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import { FormProvider } from '../../contexts/FormContext';
import { FormValidationResult } from '../../hooks/useFormValidation';

export interface FormProps<T extends Record<string, any>> extends Omit<BoxProps, 'onSubmit'> {
  /**
   * Form validation result
   */
  form: FormValidationResult<T>;
  /**
   * Children components
   */
  children: ReactNode;
  /**
   * On submit callback
   */
  onSubmit?: (values: T) => void | Promise<void>;
  /**
   * Whether to prevent default form submission
   */
  preventDefault?: boolean;
  /**
   * Whether to stop propagation of form submission
   */
  stopPropagation?: boolean;
  /**
   * Whether to disable the form
   */
  disabled?: boolean;
  /**
   * Whether the form is loading
   */
  isLoading?: boolean;
  /**
   * Form ID
   */
  id?: string;
  /**
   * Form name
   */
  name?: string;
  /**
   * Form method
   */
  method?: 'get' | 'post';
  /**
   * Form action
   */
  action?: string;
  /**
   * Form enctype
   */
  encType?: string;
  /**
   * Form target
   */
  target?: string;
  /**
   * Whether to autocomplete the form
   */
  autoComplete?: 'on' | 'off';
  /**
   * Whether to validate the form
   */
  noValidate?: boolean;
}

/**
 * Form component
 */
export function Form<T extends Record<string, any>>({
  form,
  children,
  onSubmit,
  preventDefault = true,
  stopPropagation = false,
  disabled = false,
  isLoading = false,
  id,
  name,
  method,
  action,
  encType,
  target,
  autoComplete,
  noValidate,
  ...rest
}: FormProps<T>) {
  // Handle form submission
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Prevent default form submission if needed
    if (preventDefault) {
      event.preventDefault();
    }
    
    // Stop propagation if needed
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    // Skip submission if form is disabled or loading
    if (disabled || isLoading) {
      return;
    }
    
    // Handle form submission
    form.handleSubmit(event);
    
    // Call onSubmit callback if provided
    if (onSubmit && form.formState.isValid) {
      onSubmit(form.formState.values);
    }
  };
  
  return (
    <FormProvider form={form}>
      <Box
        as="form"
        onSubmit={handleSubmit}
        id={id}
        name={name}
        method={method}
        action={action}
        encType={encType}
        target={target}
        autoComplete={autoComplete}
        noValidate={noValidate}
        aria-disabled={disabled || isLoading}
        opacity={disabled || isLoading ? 0.6 : 1}
        pointerEvents={disabled || isLoading ? 'none' : 'auto'}
        {...rest}
      >
        {children}
      </Box>
    </FormProvider>
  );
}

export default Form;
