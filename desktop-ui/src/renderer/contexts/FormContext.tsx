import React, { createContext, useContext, ReactNode } from 'react';
import { FormValidationResult } from '../hooks/useFormValidation';

/**
 * Form context type
 */
export type FormContextType<T extends Record<string, any>> = FormValidationResult<T> | null;

/**
 * Create form context
 */
export const FormContext = createContext<FormContextType<any>>(null);

/**
 * Form provider props
 */
export interface FormProviderProps<T extends Record<string, any>> {
  /**
   * Form validation result
   */
  form: FormValidationResult<T>;
  /**
   * Children components
   */
  children: ReactNode;
}

/**
 * Form provider component
 */
export function FormProvider<T extends Record<string, any>>({
  form,
  children,
}: FormProviderProps<T>) {
  return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
}

/**
 * Hook to use form context
 * @returns Form context
 */
export function useFormContext<T extends Record<string, any>>(): FormValidationResult<T> {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  
  return context as FormValidationResult<T>;
}

export default FormContext;
