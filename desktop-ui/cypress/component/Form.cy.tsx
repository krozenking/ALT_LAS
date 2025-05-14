import React from 'react';
import Form from '../../src/renderer/components/molecules/Form';
import Input from '../../src/renderer/components/atoms/Input';
import Button from '../../src/renderer/components/atoms/Button';

describe('Form Component', () => {
  it('renders form with inputs and submits data', () => {
    const handleSubmit = cy.stub().as('submitHandler');
    
    cy.mount(
      <Form onSubmit={handleSubmit}>
        <Input
          label="Username"
          name="username"
          placeholder="Enter username"
          data-testid="username-input"
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter password"
          data-testid="password-input"
          required
        />
        <Button type="submit" data-testid="submit-button">
          Submit
        </Button>
      </Form>
    );
    
    // Check if form elements are rendered
    cy.get('[data-testid=username-input]').should('exist');
    cy.get('[data-testid=password-input]').should('exist');
    cy.get('[data-testid=submit-button]').should('exist');
    
    // Fill the form
    cy.get('[data-testid=username-input]').type('testuser');
    cy.get('[data-testid=password-input]').type('password123');
    
    // Submit the form
    cy.get('[data-testid=submit-button]').click();
    
    // Check if the form was submitted with the correct data
    cy.get('@submitHandler').should('have.been.calledOnce');
    cy.get('@submitHandler').should('have.been.calledWith', {
      username: 'testuser',
      password: 'password123',
    });
  });
  
  it('validates required fields', () => {
    const handleSubmit = cy.stub().as('submitHandler');
    
    cy.mount(
      <Form onSubmit={handleSubmit}>
        <Input
          label="Username"
          name="username"
          placeholder="Enter username"
          data-testid="username-input"
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter password"
          data-testid="password-input"
          required
        />
        <Button type="submit" data-testid="submit-button">
          Submit
        </Button>
      </Form>
    );
    
    // Submit the form without filling required fields
    cy.get('[data-testid=submit-button]').click();
    
    // Check if the form was not submitted
    cy.get('@submitHandler').should('not.have.been.called');
    
    // Check if validation messages are displayed
    cy.get('[data-testid=username-input]').should('have.attr', 'aria-invalid', 'true');
    cy.get('[data-testid=password-input]').should('have.attr', 'aria-invalid', 'true');
  });
  
  it('handles form reset', () => {
    cy.mount(
      <Form>
        <Input
          label="Username"
          name="username"
          placeholder="Enter username"
          data-testid="username-input"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter password"
          data-testid="password-input"
        />
        <Button type="reset" data-testid="reset-button">
          Reset
        </Button>
      </Form>
    );
    
    // Fill the form
    cy.get('[data-testid=username-input]').type('testuser');
    cy.get('[data-testid=password-input]').type('password123');
    
    // Check if inputs have values
    cy.get('[data-testid=username-input]').should('have.value', 'testuser');
    cy.get('[data-testid=password-input]').should('have.value', 'password123');
    
    // Reset the form
    cy.get('[data-testid=reset-button]').click();
    
    // Check if inputs are cleared
    cy.get('[data-testid=username-input]').should('have.value', '');
    cy.get('[data-testid=password-input]').should('have.value', '');
  });
  
  it('handles form with initial values', () => {
    const initialValues = {
      username: 'initialuser',
      password: 'initialpassword',
    };
    
    cy.mount(
      <Form initialValues={initialValues}>
        <Input
          label="Username"
          name="username"
          placeholder="Enter username"
          data-testid="username-input"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter password"
          data-testid="password-input"
        />
      </Form>
    );
    
    // Check if inputs have initial values
    cy.get('[data-testid=username-input]').should('have.value', 'initialuser');
    cy.get('[data-testid=password-input]').should('have.value', 'initialpassword');
  });
});
