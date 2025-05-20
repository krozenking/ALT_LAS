// cypress/component/Form.cy.tsx
import React from 'react';
import { Form } from '../../src/components/Form';

describe('Form Component', () => {
  it('renders correctly', () => {
    cy.mount(<Form onSubmit={cy.stub()} />);
    
    // Check if all form elements are rendered
    cy.get('label').contains('İsim').should('be.visible');
    cy.get('label').contains('E-posta').should('be.visible');
    cy.get('label').contains('Ülke').should('be.visible');
    cy.get('label').contains('Kullanım koşullarını kabul ediyorum').should('be.visible');
    cy.get('button').contains('Gönder').should('be.visible');
  });
  
  it('shows validation errors when submitting empty form', () => {
    const onSubmit = cy.stub();
    cy.mount(<Form onSubmit={onSubmit} />);
    
    // Submit the form without entering any data
    cy.get('button').contains('Gönder').click();
    
    // Check if validation errors are displayed
    cy.contains('İsim alanı zorunludur').should('be.visible');
    cy.contains('E-posta alanı zorunludur').should('be.visible');
    cy.contains('Ülke seçimi zorunludur').should('be.visible');
    cy.contains('Kullanım koşullarını kabul etmelisiniz').should('be.visible');
    
    // Check that onSubmit was not called
    cy.wrap(onSubmit).should('not.be.called');
  });
  
  it('validates email format', () => {
    const onSubmit = cy.stub();
    cy.mount(<Form onSubmit={onSubmit} />);
    
    // Enter invalid email
    cy.get('input[id^="textfield-isim"]').type('Test User');
    cy.get('input[id^="textfield-e-posta"]').type('invalid-email');
    
    // Open dropdown and select a country
    cy.get('button[id^="dropdown-ülke"]').click();
    cy.contains('Türkiye').click();
    
    // Check terms
    cy.get('input[id^="checkbox-kullanım"]').click();
    
    // Submit the form
    cy.get('button').contains('Gönder').click();
    
    // Check if email validation error is displayed
    cy.contains('Geçerli bir e-posta adresi giriniz').should('be.visible');
    
    // Check that onSubmit was not called
    cy.wrap(onSubmit).should('not.be.called');
  });
  
  it('calls onSubmit with form data when form is valid', () => {
    const onSubmit = cy.stub();
    cy.mount(<Form onSubmit={onSubmit} />);
    
    // Fill out the form
    cy.get('input[id^="textfield-isim"]').type('Test User');
    cy.get('input[id^="textfield-e-posta"]').type('test@example.com');
    
    // Open dropdown and select a country
    cy.get('button[id^="dropdown-ülke"]').click();
    cy.contains('Türkiye').click();
    
    // Check terms
    cy.get('input[id^="checkbox-kullanım"]').click();
    
    // Submit the form
    cy.get('button').contains('Gönder').click();
    
    // Check that onSubmit was called with correct values
    cy.wrap(onSubmit).should('be.calledWithMatch', {
      name: 'Test User',
      email: 'test@example.com',
      country: 'tr',
      agreeTerms: true,
    });
  });
  
  it('displays loading state when isLoading is true', () => {
    cy.mount(<Form onSubmit={cy.stub()} isLoading={true} />);
    
    // Check if button shows loading text
    cy.get('button').contains('Gönderiliyor...').should('be.visible');
    
    // Check if button is disabled
    cy.get('button').contains('Gönderiliyor...').should('be.disabled');
  });
  
  it('displays error message when error prop is provided', () => {
    cy.mount(<Form onSubmit={cy.stub()} error="Form gönderilirken bir hata oluştu" />);
    
    // Check if error message is displayed
    cy.contains('Form gönderilirken bir hata oluştu').should('be.visible');
  });
  
  it('clears validation errors when valid input is provided', () => {
    cy.mount(<Form onSubmit={cy.stub()} />);
    
    // Submit empty form to trigger validation errors
    cy.get('button').contains('Gönder').click();
    
    // Check if validation errors are displayed
    cy.contains('İsim alanı zorunludur').should('be.visible');
    
    // Enter valid name
    cy.get('input[id^="textfield-isim"]').type('Test User');
    
    // Check if name validation error is cleared
    cy.contains('İsim alanı zorunludur').should('not.exist');
  });
});
