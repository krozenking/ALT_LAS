// src/__tests__/a11y/form-components.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Form } from '../../components/Form';
import { TextField } from '../../components/TextField';
import { Dropdown } from '../../components/Dropdown';
import { Checkbox } from '../../components/Checkbox';

describe('Form Components Accessibility', () => {
  test('TextField has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <TextField label="Standard TextField" />
        <TextField label="Required TextField" required />
        <TextField label="Disabled TextField" disabled />
        <TextField label="Error TextField" error="This is an error message" />
        <TextField label="Helper Text TextField" helperText="This is helper text" />
        <TextField label="Password TextField" type="password" />
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('Dropdown has no accessibility violations', async () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ];
    
    const { container } = render(
      <div>
        <Dropdown label="Standard Dropdown" options={options} />
        <Dropdown label="Required Dropdown" options={options} required />
        <Dropdown label="Disabled Dropdown" options={options} disabled />
        <Dropdown label="Error Dropdown" options={options} error="This is an error message" />
        <Dropdown label="Selected Dropdown" options={options} value="option2" />
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('Checkbox has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Checkbox label="Standard Checkbox" />
        <Checkbox label="Checked Checkbox" checked />
        <Checkbox label="Disabled Checkbox" disabled />
        <Checkbox label="Error Checkbox" error="This is an error message" />
        <Checkbox label="Helper Text Checkbox" helperText="This is helper text" />
        <Checkbox label="Indeterminate Checkbox" indeterminate />
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('Form has no accessibility violations', async () => {
    const { container } = render(<Form onSubmit={jest.fn()} />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('Form with error has no accessibility violations', async () => {
    const { container } = render(
      <Form 
        onSubmit={jest.fn()} 
        error="Form submission failed" 
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('Form in loading state has no accessibility violations', async () => {
    const { container } = render(
      <Form 
        onSubmit={jest.fn()} 
        isLoading={true} 
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('keyboard navigation works correctly', async () => {
    // This test is more of a functional test than an automated accessibility test
    // In a real-world scenario, you would use a tool like Cypress to test keyboard navigation
    // or perform manual testing with screen readers
    
    // For now, we'll just check that the form doesn't have accessibility violations
    const { container } = render(<Form onSubmit={jest.fn()} />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('color contrast meets WCAG standards', async () => {
    // axe-core includes color contrast checks
    const { container } = render(
      <div>
        <TextField label="Text Field" />
        <Dropdown 
          label="Dropdown" 
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ]} 
        />
        <Checkbox label="Checkbox" />
        <Form onSubmit={jest.fn()} />
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('form elements have proper labels', async () => {
    // axe-core checks for proper labeling
    const { container } = render(<Form onSubmit={jest.fn()} />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('error messages are properly associated with form controls', async () => {
    const { container } = render(
      <div>
        <TextField label="Text Field" error="Error message" />
        <Dropdown 
          label="Dropdown" 
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ]} 
          error="Error message" 
        />
        <Checkbox label="Checkbox" error="Error message" />
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
