import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Button,
  Code,
  useColorMode,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { glassmorphism } from '@/styles/theme';
import useFormValidation, { ValidationRule } from '../../hooks/useFormValidation';
import Form from './Form';
import FormField from './FormField';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormCheckbox from './FormCheckbox';
import FormRadio from './FormRadio';
import FormTextarea from './FormTextarea';

// Form demo component
const FormDemo: React.FC = () => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const toast = useToast();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Form initial values
  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    country: '',
    bio: '',
    interests: [],
    newsletter: false,
    terms: false,
  };
  
  // Form validation rules
  const validationRules = {
    firstName: [
      {
        validate: (value: string) => value.length > 0,
        message: 'First name is required',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
      {
        validate: (value: string) => value.length >= 2,
        message: 'First name must be at least 2 characters',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
    ],
    lastName: [
      {
        validate: (value: string) => value.length > 0,
        message: 'Last name is required',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
      {
        validate: (value: string) => value.length >= 2,
        message: 'Last name must be at least 2 characters',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
    ],
    email: [
      {
        validate: (value: string) => value.length > 0,
        message: 'Email is required',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
      {
        validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Email is invalid',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
    ],
    password: [
      {
        validate: (value: string) => value.length > 0,
        message: 'Password is required',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
      {
        validate: (value: string) => value.length >= 8,
        message: 'Password must be at least 8 characters',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
      {
        validate: (value: string) => /[A-Z]/.test(value),
        message: 'Password must contain at least one uppercase letter',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
      {
        validate: (value: string) => /[a-z]/.test(value),
        message: 'Password must contain at least one lowercase letter',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
      {
        validate: (value: string) => /[0-9]/.test(value),
        message: 'Password must contain at least one number',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
      {
        validate: (value: string) => /[^A-Za-z0-9]/.test(value),
        message: 'Password must contain at least one special character',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
    ],
    confirmPassword: [
      {
        validate: (value: string) => value.length > 0,
        message: 'Confirm password is required',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
      {
        validate: (value: string, formValues) => value === formValues?.password,
        message: 'Passwords do not match',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
    ],
    age: [
      {
        validate: (value: string) => value.length > 0,
        message: 'Age is required',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
      {
        validate: (value: string) => !isNaN(Number(value)),
        message: 'Age must be a number',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
      {
        validate: (value: string) => Number(value) >= 18,
        message: 'You must be at least 18 years old',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
      {
        validate: (value: string) => Number(value) <= 120,
        message: 'Age must be less than or equal to 120',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
    ],
    gender: [
      {
        validate: (value: string) => value.length > 0,
        message: 'Gender is required',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
    ],
    country: [
      {
        validate: (value: string) => value.length > 0,
        message: 'Country is required',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
    ],
    bio: [
      {
        validate: (value: string) => value.length > 0,
        message: 'Bio is required',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
      {
        validate: (value: string) => value.length >= 10,
        message: 'Bio must be at least 10 characters',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
      {
        validate: (value: string) => value.length <= 500,
        message: 'Bio must be less than or equal to 500 characters',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
    ],
    terms: [
      {
        validate: (value: boolean) => value === true,
        message: 'You must accept the terms and conditions',
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true,
      },
    ],
  };
  
  // Form validation
  const form = useFormValidation({
    initialValues,
    validationRules,
    requiredFields: ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'age', 'gender', 'country', 'bio', 'terms'],
    validateOnChange: true,
    validateOnBlur: true,
    validateOnSubmit: true,
    validateOnMount: false,
    validateAllFields: false,
    resetOnSubmit: false,
    onSubmit: (values) => {
      console.log('Form submitted:', values);
      toast({
        title: 'Form submitted',
        description: 'Form has been submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onValidationSuccess: (values) => {
      console.log('Form validation success:', values);
    },
    onValidationError: (errors) => {
      console.log('Form validation error:', errors);
      toast({
        title: 'Form validation error',
        description: 'Please fix the errors in the form',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });
  
  // Gender options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ];
  
  // Country options
  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'es', label: 'Spain' },
    { value: 'it', label: 'Italy' },
    { value: 'jp', label: 'Japan' },
    { value: 'cn', label: 'China' },
    { value: 'in', label: 'India' },
    { value: 'br', label: 'Brazil' },
    { value: 'mx', label: 'Mexico' },
    { value: 'za', label: 'South Africa' },
    { value: 'ru', label: 'Russia' },
    { value: 'kr', label: 'South Korea' },
    { value: 'sg', label: 'Singapore' },
    { value: 'ae', label: 'United Arab Emirates' },
    { value: 'sa', label: 'Saudi Arabia' },
    { value: 'tr', label: 'Turkey' },
  ];
  
  // Handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.handleSubmit(event);
  };
  
  // Handle form reset
  const handleReset = () => {
    form.resetForm();
  };
  
  return (
    <Box p={4} height="100%">
      <VStack spacing={4} align="stretch" height="100%">
        <Heading size="lg">{t('common.forms')}</Heading>
        
        <Text>
          {t('common.formsDescription')}
        </Text>
        
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>{t('common.info')}</AlertTitle>
          <AlertDescription>
            {t('common.formsInfo')}
          </AlertDescription>
        </Alert>
        
        <Tabs variant="enclosed">
          <TabList>
            <Tab>{t('common.demo')}</Tab>
            <Tab>{t('common.code')}</Tab>
            <Tab>{t('common.api')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.registrationForm')}</Heading>
                  
                  <Form form={form} onSubmit={handleSubmit}>
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={4}>
                        <FormInput
                          name="firstName"
                          label="First Name"
                          placeholder="Enter your first name"
                          autoFocus
                        />
                        
                        <FormInput
                          name="lastName"
                          label="Last Name"
                          placeholder="Enter your last name"
                        />
                      </HStack>
                      
                      <FormInput
                        name="email"
                        label="Email"
                        placeholder="Enter your email"
                        type="email"
                        autoComplete="email"
                      />
                      
                      <HStack spacing={4}>
                        <FormInput
                          name="password"
                          label="Password"
                          placeholder="Enter your password"
                          type="password"
                          showPasswordToggle
                          autoComplete="new-password"
                        />
                        
                        <FormInput
                          name="confirmPassword"
                          label="Confirm Password"
                          placeholder="Confirm your password"
                          type="password"
                          showPasswordToggle
                          autoComplete="new-password"
                        />
                      </HStack>
                      
                      <HStack spacing={4}>
                        <FormInput
                          name="age"
                          label="Age"
                          placeholder="Enter your age"
                          type="number"
                          inputProps={{ min: 18, max: 120 }}
                        />
                        
                        <FormRadio
                          name="gender"
                          label="Gender"
                          options={genderOptions}
                          direction="row"
                        />
                      </HStack>
                      
                      <FormSelect
                        name="country"
                        label="Country"
                        placeholder="Select your country"
                        options={countryOptions}
                        includeEmptyOption
                      />
                      
                      <FormTextarea
                        name="bio"
                        label="Bio"
                        placeholder="Tell us about yourself"
                        showCharCount
                        maxLength={500}
                        autoResize
                      />
                      
                      <FormCheckbox
                        name="newsletter"
                        checkboxLabel="Subscribe to newsletter"
                      />
                      
                      <FormCheckbox
                        name="terms"
                        checkboxLabel="I agree to the terms and conditions"
                      />
                      
                      <HStack spacing={4} justify="flex-end">
                        <Button onClick={handleReset} variant="outline">
                          Reset
                        </Button>
                        
                        <Button type="submit" colorScheme="blue" isLoading={form.formState.isSubmitting}>
                          Submit
                        </Button>
                      </HStack>
                    </VStack>
                  </Form>
                </VStack>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.code')}</Heading>
                  
                  <Box>
                    <Heading size="sm" mb={2}>useFormValidation</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import useFormValidation from '../../hooks/useFormValidation';

const form = useFormValidation({
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    // ...
  },
  validationRules: {
    firstName: [
      {
        validate: (value) => value.length > 0,
        message: 'First name is required',
      },
      // ...
    ],
    // ...
  },
  requiredFields: ['firstName', 'lastName', 'email'],
  validateOnChange: true,
  validateOnBlur: true,
  validateOnSubmit: true,
  onSubmit: (values) => {
    console.log('Form submitted:', values);
  },
});`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>Form Component</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import Form from './Form';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormCheckbox from './FormCheckbox';
import FormRadio from './FormRadio';
import FormTextarea from './FormTextarea';

<Form form={form} onSubmit={handleSubmit}>
  <FormInput
    name="firstName"
    label="First Name"
    placeholder="Enter your first name"
  />
  
  <FormSelect
    name="country"
    label="Country"
    placeholder="Select your country"
    options={countryOptions}
  />
  
  <FormCheckbox
    name="terms"
    checkboxLabel="I agree to the terms and conditions"
  />
  
  <FormRadio
    name="gender"
    label="Gender"
    options={genderOptions}
    direction="row"
  />
  
  <FormTextarea
    name="bio"
    label="Bio"
    placeholder="Tell us about yourself"
    showCharCount
    maxLength={500}
  />
  
  <Button type="submit">Submit</Button>
</Form>`}
                    </Code>
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.api')}</Heading>
                  
                  <Box>
                    <Heading size="sm" mb={2}>useFormValidation</Heading>
                    <Text>
                      A hook for form validation that provides form state management, validation, and submission handling.
                    </Text>
                    <Text mt={2}>
                      <strong>Parameters:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>initialValues</strong>: Initial form values</Text>
                      <Text>• <strong>validationRules</strong>: Validation rules for form fields</Text>
                      <Text>• <strong>requiredFields</strong>: Required form fields</Text>
                      <Text>• <strong>validateOnChange</strong>: Whether to validate on change</Text>
                      <Text>• <strong>validateOnBlur</strong>: Whether to validate on blur</Text>
                      <Text>• <strong>validateOnSubmit</strong>: Whether to validate on submit</Text>
                      <Text>• <strong>validateOnMount</strong>: Whether to validate on mount</Text>
                      <Text>• <strong>validateAllFields</strong>: Whether to validate all fields</Text>
                      <Text>• <strong>resetOnSubmit</strong>: Whether to reset form on submit</Text>
                      <Text>• <strong>onSubmit</strong>: On submit callback</Text>
                      <Text>• <strong>onValidationSuccess</strong>: On validation success callback</Text>
                      <Text>• <strong>onValidationError</strong>: On validation error callback</Text>
                    </VStack>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>Form Components</Heading>
                    <Text>
                      A set of form components that work with the useFormValidation hook.
                    </Text>
                    <Text mt={2}>
                      <strong>Components:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>Form</strong>: Form container component</Text>
                      <Text>• <strong>FormField</strong>: Form field component</Text>
                      <Text>• <strong>FormInput</strong>: Form input component</Text>
                      <Text>• <strong>FormSelect</strong>: Form select component</Text>
                      <Text>• <strong>FormCheckbox</strong>: Form checkbox component</Text>
                      <Text>• <strong>FormRadio</strong>: Form radio component</Text>
                      <Text>• <strong>FormTextarea</strong>: Form textarea component</Text>
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>{t('common.details')}</Heading>
          
          <VStack align="stretch" spacing={3}>
            <Text>
              {t('common.formsDetails')}
            </Text>
            
            <Box pl={4}>
              <Text>• <strong>Form Validation</strong>: {t('common.formValidation')}</Text>
              <Text>• <strong>Form State Management</strong>: {t('common.formStateManagement')}</Text>
              <Text>• <strong>Form Submission</strong>: {t('common.formSubmission')}</Text>
              <Text>• <strong>Form Reset</strong>: {t('common.formReset')}</Text>
              <Text>• <strong>Form Field Components</strong>: {t('common.formFieldComponents')}</Text>
            </Box>
            
            <Text>
              {t('common.formsFeatures')}
            </Text>
            
            <Box pl={4}>
              <Text>• {t('common.formValidationRules')}</Text>
              <Text>• {t('common.formFieldValidation')}</Text>
              <Text>• {t('common.formFieldDependencies')}</Text>
              <Text>• {t('common.formFieldFormatting')}</Text>
              <Text>• {t('common.formFieldMasking')}</Text>
              <Text>• {t('common.formFieldAutoResize')}</Text>
              <Text>• {t('common.formFieldCharCount')}</Text>
              <Text>• {t('common.formFieldPasswordToggle')}</Text>
              <Text>• {t('common.formFieldClearButton')}</Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default FormDemo;
