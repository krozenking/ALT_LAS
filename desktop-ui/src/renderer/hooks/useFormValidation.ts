import { useState, useCallback, useEffect } from 'react';

/**
 * Validation rule type
 */
export type ValidationRule<T> = {
  /**
   * Validation function
   */
  validate: (value: T, formValues?: Record<string, any>) => boolean;
  /**
   * Error message
   */
  message: string;
  /**
   * Whether to validate on change
   */
  validateOnChange?: boolean;
  /**
   * Whether to validate on blur
   */
  validateOnBlur?: boolean;
  /**
   * Whether to validate on submit
   */
  validateOnSubmit?: boolean;
};

/**
 * Form field type
 */
export type FormField<T> = {
  /**
   * Field value
   */
  value: T;
  /**
   * Field error
   */
  error: string | null;
  /**
   * Whether the field is touched
   */
  touched: boolean;
  /**
   * Whether the field is dirty
   */
  dirty: boolean;
  /**
   * Whether the field is valid
   */
  valid: boolean;
  /**
   * Whether the field is validating
   */
  validating: boolean;
  /**
   * Field validation rules
   */
  rules: ValidationRule<T>[];
  /**
   * Field required flag
   */
  required: boolean;
  /**
   * Field disabled flag
   */
  disabled: boolean;
  /**
   * Field readonly flag
   */
  readonly: boolean;
  /**
   * Field name
   */
  name: string;
  /**
   * Field label
   */
  label?: string;
  /**
   * Field placeholder
   */
  placeholder?: string;
  /**
   * Field help text
   */
  helpText?: string;
  /**
   * Field default value
   */
  defaultValue?: T;
  /**
   * Field dependencies
   */
  dependencies?: string[];
};

/**
 * Form state type
 */
export type FormState<T extends Record<string, any>> = {
  /**
   * Form values
   */
  values: T;
  /**
   * Form errors
   */
  errors: Record<keyof T, string | null>;
  /**
   * Form touched fields
   */
  touched: Record<keyof T, boolean>;
  /**
   * Form dirty fields
   */
  dirty: Record<keyof T, boolean>;
  /**
   * Form valid fields
   */
  valid: Record<keyof T, boolean>;
  /**
   * Form validating fields
   */
  validating: Record<keyof T, boolean>;
  /**
   * Form fields
   */
  fields: Record<keyof T, FormField<any>>;
  /**
   * Whether the form is valid
   */
  isValid: boolean;
  /**
   * Whether the form is dirty
   */
  isDirty: boolean;
  /**
   * Whether the form is touched
   */
  isTouched: boolean;
  /**
   * Whether the form is submitting
   */
  isSubmitting: boolean;
  /**
   * Whether the form is submitted
   */
  isSubmitted: boolean;
  /**
   * Whether the form has errors
   */
  hasErrors: boolean;
};

/**
 * Form validation options
 */
export type FormValidationOptions<T extends Record<string, any>> = {
  /**
   * Initial values
   */
  initialValues: T;
  /**
   * Validation rules
   */
  validationRules?: Partial<Record<keyof T, ValidationRule<any>[]>>;
  /**
   * Required fields
   */
  requiredFields?: (keyof T)[];
  /**
   * Disabled fields
   */
  disabledFields?: (keyof T)[];
  /**
   * Readonly fields
   */
  readonlyFields?: (keyof T)[];
  /**
   * Field dependencies
   */
  dependencies?: Partial<Record<keyof T, (keyof T)[]>>;
  /**
   * Whether to validate on change
   */
  validateOnChange?: boolean;
  /**
   * Whether to validate on blur
   */
  validateOnBlur?: boolean;
  /**
   * Whether to validate on submit
   */
  validateOnSubmit?: boolean;
  /**
   * Whether to validate on mount
   */
  validateOnMount?: boolean;
  /**
   * Whether to validate all fields
   */
  validateAllFields?: boolean;
  /**
   * Whether to reset form on submit
   */
  resetOnSubmit?: boolean;
  /**
   * On submit callback
   */
  onSubmit?: (values: T) => void | Promise<void>;
  /**
   * On validation success callback
   */
  onValidationSuccess?: (values: T) => void;
  /**
   * On validation error callback
   */
  onValidationError?: (errors: Record<keyof T, string | null>) => void;
  /**
   * On change callback
   */
  onChange?: (name: keyof T, value: any, values: T) => void;
  /**
   * On blur callback
   */
  onBlur?: (name: keyof T, value: any, values: T) => void;
  /**
   * On reset callback
   */
  onReset?: () => void;
};

/**
 * Form validation result
 */
export type FormValidationResult<T extends Record<string, any>> = {
  /**
   * Form state
   */
  formState: FormState<T>;
  /**
   * Set field value
   */
  setFieldValue: (name: keyof T, value: any) => void;
  /**
   * Set field error
   */
  setFieldError: (name: keyof T, error: string | null) => void;
  /**
   * Set field touched
   */
  setFieldTouched: (name: keyof T, touched: boolean) => void;
  /**
   * Set form values
   */
  setValues: (values: Partial<T>) => void;
  /**
   * Set form errors
   */
  setErrors: (errors: Partial<Record<keyof T, string | null>>) => void;
  /**
   * Set form touched
   */
  setTouched: (touched: Partial<Record<keyof T, boolean>>) => void;
  /**
   * Reset form
   */
  resetForm: () => void;
  /**
   * Validate form
   */
  validateForm: () => boolean;
  /**
   * Validate field
   */
  validateField: (name: keyof T) => boolean;
  /**
   * Handle change
   */
  handleChange: (name: keyof T) => (event: React.ChangeEvent<any>) => void;
  /**
   * Handle blur
   */
  handleBlur: (name: keyof T) => (event: React.FocusEvent<any>) => void;
  /**
   * Handle submit
   */
  handleSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
  /**
   * Get field props
   */
  getFieldProps: (name: keyof T) => {
    name: string;
    value: any;
    onChange: (event: React.ChangeEvent<any>) => void;
    onBlur: (event: React.FocusEvent<any>) => void;
    error: string | null;
    touched: boolean;
    disabled: boolean;
    readonly: boolean;
    required: boolean;
  };
};

/**
 * Hook for form validation
 * @param options Form validation options
 * @returns Form validation result
 */
export const useFormValidation = <T extends Record<string, any>>(
  options: FormValidationOptions<T>
): FormValidationResult<T> => {
  const {
    initialValues,
    validationRules = {},
    requiredFields = [],
    disabledFields = [],
    readonlyFields = [],
    dependencies = {},
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    validateOnMount = false,
    validateAllFields = false,
    resetOnSubmit = false,
    onSubmit,
    onValidationSuccess,
    onValidationError,
    onChange,
    onBlur,
    onReset,
  } = options;

  // Initialize form state
  const [formState, setFormState] = useState<FormState<T>>(() => {
    const fields: Record<keyof T, FormField<any>> = {} as Record<keyof T, FormField<any>>;
    
    // Initialize fields
    Object.keys(initialValues).forEach((key) => {
      const fieldName = key as keyof T;
      fields[fieldName] = {
        value: initialValues[fieldName],
        error: null,
        touched: false,
        dirty: false,
        valid: true,
        validating: false,
        rules: validationRules[fieldName] || [],
        required: requiredFields.includes(fieldName),
        disabled: disabledFields.includes(fieldName),
        readonly: readonlyFields.includes(fieldName),
        name: String(fieldName),
        defaultValue: initialValues[fieldName],
        dependencies: dependencies[fieldName] as string[] || [],
      };
    });
    
    return {
      values: { ...initialValues },
      errors: Object.keys(initialValues).reduce((acc, key) => {
        acc[key as keyof T] = null;
        return acc;
      }, {} as Record<keyof T, string | null>),
      touched: Object.keys(initialValues).reduce((acc, key) => {
        acc[key as keyof T] = false;
        return acc;
      }, {} as Record<keyof T, boolean>),
      dirty: Object.keys(initialValues).reduce((acc, key) => {
        acc[key as keyof T] = false;
        return acc;
      }, {} as Record<keyof T, boolean>),
      valid: Object.keys(initialValues).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Record<keyof T, boolean>),
      validating: Object.keys(initialValues).reduce((acc, key) => {
        acc[key as keyof T] = false;
        return acc;
      }, {} as Record<keyof T, boolean>),
      fields,
      isValid: true,
      isDirty: false,
      isTouched: false,
      isSubmitting: false,
      isSubmitted: false,
      hasErrors: false,
    };
  });

  // Validate field
  const validateField = useCallback(
    (name: keyof T): boolean => {
      const field = formState.fields[name];
      const value = formState.values[name];
      
      // Skip validation for disabled or readonly fields
      if (field.disabled || field.readonly) {
        return true;
      }
      
      // Check required field
      if (field.required && (value === undefined || value === null || value === '')) {
        setFormState((prevState) => ({
          ...prevState,
          errors: {
            ...prevState.errors,
            [name]: 'This field is required',
          },
          valid: {
            ...prevState.valid,
            [name]: false,
          },
          hasErrors: true,
        }));
        return false;
      }
      
      // Validate field rules
      for (const rule of field.rules) {
        if (!rule.validate(value, formState.values)) {
          setFormState((prevState) => ({
            ...prevState,
            errors: {
              ...prevState.errors,
              [name]: rule.message,
            },
            valid: {
              ...prevState.valid,
              [name]: false,
            },
            hasErrors: true,
          }));
          return false;
        }
      }
      
      // Field is valid
      setFormState((prevState) => ({
        ...prevState,
        errors: {
          ...prevState.errors,
          [name]: null,
        },
        valid: {
          ...prevState.valid,
          [name]: true,
        },
        hasErrors: Object.values(prevState.errors).some(
          (error, index) => error !== null && Object.keys(prevState.errors)[index] !== String(name)
        ),
      }));
      
      return true;
    },
    [formState]
  );

  // Validate form
  const validateForm = useCallback((): boolean => {
    let isValid = true;
    
    // Validate all fields
    Object.keys(formState.values).forEach((key) => {
      const fieldName = key as keyof T;
      const fieldValid = validateField(fieldName);
      isValid = isValid && fieldValid;
    });
    
    // Update form state
    setFormState((prevState) => ({
      ...prevState,
      isValid,
      hasErrors: !isValid,
    }));
    
    // Call validation callbacks
    if (isValid) {
      onValidationSuccess?.(formState.values);
    } else {
      onValidationError?.(formState.errors);
    }
    
    return isValid;
  }, [formState, validateField, onValidationSuccess, onValidationError]);

  // Set field value
  const setFieldValue = useCallback(
    (name: keyof T, value: any) => {
      setFormState((prevState) => {
        const newValues = {
          ...prevState.values,
          [name]: value,
        };
        
        const isDirty = value !== prevState.fields[name].defaultValue;
        
        return {
          ...prevState,
          values: newValues,
          dirty: {
            ...prevState.dirty,
            [name]: isDirty,
          },
          isDirty: Object.values({ ...prevState.dirty, [name]: isDirty }).some(Boolean),
          fields: {
            ...prevState.fields,
            [name]: {
              ...prevState.fields[name],
              value,
              dirty: isDirty,
            },
          },
        };
      });
      
      // Validate field if needed
      if (validateOnChange) {
        validateField(name);
      }
      
      // Validate dependent fields
      Object.keys(formState.fields).forEach((key) => {
        const fieldName = key as keyof T;
        const field = formState.fields[fieldName];
        
        if (field.dependencies?.includes(String(name)) && validateOnChange) {
          validateField(fieldName);
        }
      });
      
      // Call onChange callback
      onChange?.(name, value, { ...formState.values, [name]: value });
    },
    [formState, validateField, validateOnChange, onChange]
  );

  // Set field error
  const setFieldError = useCallback(
    (name: keyof T, error: string | null) => {
      setFormState((prevState) => ({
        ...prevState,
        errors: {
          ...prevState.errors,
          [name]: error,
        },
        valid: {
          ...prevState.valid,
          [name]: error === null,
        },
        hasErrors: error !== null || Object.values(prevState.errors).some(
          (err, index) => err !== null && Object.keys(prevState.errors)[index] !== String(name)
        ),
        isValid: error === null && Object.values(prevState.errors).every(
          (err, index) => err === null || Object.keys(prevState.errors)[index] === String(name)
        ),
      }));
    },
    []
  );

  // Set field touched
  const setFieldTouched = useCallback(
    (name: keyof T, touched: boolean) => {
      setFormState((prevState) => ({
        ...prevState,
        touched: {
          ...prevState.touched,
          [name]: touched,
        },
        isTouched: touched || Object.values(prevState.touched).some(Boolean),
        fields: {
          ...prevState.fields,
          [name]: {
            ...prevState.fields[name],
            touched,
          },
        },
      }));
      
      // Validate field if needed
      if (touched && validateOnBlur) {
        validateField(name);
      }
    },
    [validateField, validateOnBlur]
  );

  // Set form values
  const setValues = useCallback(
    (values: Partial<T>) => {
      setFormState((prevState) => {
        const newValues = {
          ...prevState.values,
          ...values,
        };
        
        const newDirty = { ...prevState.dirty };
        const newFields = { ...prevState.fields };
        
        // Update dirty state and fields
        Object.keys(values).forEach((key) => {
          const fieldName = key as keyof T;
          const isDirty = values[fieldName] !== prevState.fields[fieldName].defaultValue;
          
          newDirty[fieldName] = isDirty;
          newFields[fieldName] = {
            ...prevState.fields[fieldName],
            value: values[fieldName],
            dirty: isDirty,
          };
        });
        
        return {
          ...prevState,
          values: newValues,
          dirty: newDirty,
          isDirty: Object.values(newDirty).some(Boolean),
          fields: newFields,
        };
      });
      
      // Validate fields if needed
      if (validateOnChange) {
        Object.keys(values).forEach((key) => {
          validateField(key as keyof T);
        });
      }
    },
    [validateField, validateOnChange]
  );

  // Set form errors
  const setErrors = useCallback(
    (errors: Partial<Record<keyof T, string | null>>) => {
      setFormState((prevState) => {
        const newErrors = {
          ...prevState.errors,
          ...errors,
        };
        
        const newValid = { ...prevState.valid };
        
        // Update valid state
        Object.keys(errors).forEach((key) => {
          const fieldName = key as keyof T;
          newValid[fieldName] = errors[fieldName] === null;
        });
        
        return {
          ...prevState,
          errors: newErrors,
          valid: newValid,
          hasErrors: Object.values(newErrors).some((error) => error !== null),
          isValid: Object.values(newErrors).every((error) => error === null),
        };
      });
    },
    []
  );

  // Set form touched
  const setTouched = useCallback(
    (touched: Partial<Record<keyof T, boolean>>) => {
      setFormState((prevState) => {
        const newTouched = {
          ...prevState.touched,
          ...touched,
        };
        
        const newFields = { ...prevState.fields };
        
        // Update fields
        Object.keys(touched).forEach((key) => {
          const fieldName = key as keyof T;
          newFields[fieldName] = {
            ...prevState.fields[fieldName],
            touched: touched[fieldName] || false,
          };
        });
        
        return {
          ...prevState,
          touched: newTouched,
          isTouched: Object.values(newTouched).some(Boolean),
          fields: newFields,
        };
      });
      
      // Validate fields if needed
      if (validateOnBlur) {
        Object.keys(touched).forEach((key) => {
          const fieldName = key as keyof T;
          if (touched[fieldName]) {
            validateField(fieldName);
          }
        });
      }
    },
    [validateField, validateOnBlur]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setFormState((prevState) => {
      const fields: Record<keyof T, FormField<any>> = {} as Record<keyof T, FormField<any>>;
      
      // Reset fields
      Object.keys(initialValues).forEach((key) => {
        const fieldName = key as keyof T;
        fields[fieldName] = {
          ...prevState.fields[fieldName],
          value: initialValues[fieldName],
          error: null,
          touched: false,
          dirty: false,
          valid: true,
          validating: false,
          defaultValue: initialValues[fieldName],
        };
      });
      
      return {
        ...prevState,
        values: { ...initialValues },
        errors: Object.keys(initialValues).reduce((acc, key) => {
          acc[key as keyof T] = null;
          return acc;
        }, {} as Record<keyof T, string | null>),
        touched: Object.keys(initialValues).reduce((acc, key) => {
          acc[key as keyof T] = false;
          return acc;
        }, {} as Record<keyof T, boolean>),
        dirty: Object.keys(initialValues).reduce((acc, key) => {
          acc[key as keyof T] = false;
          return acc;
        }, {} as Record<keyof T, boolean>),
        valid: Object.keys(initialValues).reduce((acc, key) => {
          acc[key as keyof T] = true;
          return acc;
        }, {} as Record<keyof T, boolean>),
        validating: Object.keys(initialValues).reduce((acc, key) => {
          acc[key as keyof T] = false;
          return acc;
        }, {} as Record<keyof T, boolean>),
        fields,
        isValid: true,
        isDirty: false,
        isTouched: false,
        isSubmitting: false,
        isSubmitted: false,
        hasErrors: false,
      };
    });
    
    // Call onReset callback
    onReset?.();
  }, [initialValues, onReset]);

  // Handle change
  const handleChange = useCallback(
    (name: keyof T) => (event: React.ChangeEvent<any>) => {
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      setFieldValue(name, value);
    },
    [setFieldValue]
  );

  // Handle blur
  const handleBlur = useCallback(
    (name: keyof T) => (event: React.FocusEvent<any>) => {
      setFieldTouched(name, true);
      
      // Call onBlur callback
      onBlur?.(name, formState.values[name], formState.values);
    },
    [setFieldTouched, formState.values, onBlur]
  );

  // Handle submit
  const handleSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      // Prevent default form submission
      event?.preventDefault();
      
      // Update form state
      setFormState((prevState) => ({
        ...prevState,
        isSubmitting: true,
        isSubmitted: true,
      }));
      
      // Validate form if needed
      const isValid = validateOnSubmit ? validateForm() : formState.isValid;
      
      // Call onSubmit callback if form is valid
      if (isValid && onSubmit) {
        Promise.resolve(onSubmit(formState.values))
          .then(() => {
            // Reset form if needed
            if (resetOnSubmit) {
              resetForm();
            }
          })
          .finally(() => {
            // Update form state
            setFormState((prevState) => ({
              ...prevState,
              isSubmitting: false,
            }));
          });
      } else {
        // Update form state
        setFormState((prevState) => ({
          ...prevState,
          isSubmitting: false,
        }));
      }
    },
    [
      validateForm,
      formState.isValid,
      formState.values,
      onSubmit,
      resetForm,
      resetOnSubmit,
      validateOnSubmit,
    ]
  );

  // Get field props
  const getFieldProps = useCallback(
    (name: keyof T) => ({
      name: String(name),
      value: formState.values[name],
      onChange: handleChange(name),
      onBlur: handleBlur(name),
      error: formState.errors[name],
      touched: formState.touched[name],
      disabled: formState.fields[name].disabled,
      readonly: formState.fields[name].readonly,
      required: formState.fields[name].required,
    }),
    [formState, handleChange, handleBlur]
  );

  // Validate form on mount
  useEffect(() => {
    if (validateOnMount) {
      validateForm();
    }
  }, [validateOnMount, validateForm]);

  // Validate all fields when validateAllFields changes
  useEffect(() => {
    if (validateAllFields) {
      validateForm();
    }
  }, [validateAllFields, validateForm]);

  return {
    formState,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setValues,
    setErrors,
    setTouched,
    resetForm,
    validateForm,
    validateField,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldProps,
  };
};

export default useFormValidation;
