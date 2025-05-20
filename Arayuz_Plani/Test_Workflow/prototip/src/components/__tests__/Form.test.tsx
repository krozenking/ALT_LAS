// src/components/__tests__/Form.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Form } from '../Form';

describe('Form Component', () => {
  test('renders form with all fields', () => {
    render(<Form onSubmit={jest.fn()} />);
    
    // Check if all form elements are rendered
    expect(screen.getByLabelText(/isim/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ülke/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kullanım koşullarını kabul ediyorum/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gönder/i })).toBeInTheDocument();
  });
  
  test('shows validation errors when submitting empty form', async () => {
    render(<Form onSubmit={jest.fn()} />);
    
    // Submit the form without entering any data
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/isim alanı zorunludur/i)).toBeInTheDocument();
      expect(screen.getByText(/e-posta alanı zorunludur/i)).toBeInTheDocument();
      expect(screen.getByText(/ülke seçimi zorunludur/i)).toBeInTheDocument();
      expect(screen.getByText(/kullanım koşullarını kabul etmelisiniz/i)).toBeInTheDocument();
    });
  });
  
  test('validates email format', async () => {
    render(<Form onSubmit={jest.fn()} />);
    
    // Enter invalid email
    userEvent.type(screen.getByLabelText(/isim/i), 'Test User');
    userEvent.type(screen.getByLabelText(/e-posta/i), 'invalid-email');
    
    // Open dropdown and select a country
    fireEvent.click(screen.getByLabelText(/ülke/i));
    fireEvent.click(screen.getByText('Türkiye'));
    
    // Check terms
    fireEvent.click(screen.getByLabelText(/kullanım koşullarını kabul ediyorum/i));
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Check if email validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/geçerli bir e-posta adresi giriniz/i)).toBeInTheDocument();
    });
  });
  
  test('calls onSubmit with form data when form is valid', async () => {
    const handleSubmit = jest.fn();
    render(<Form onSubmit={handleSubmit} />);
    
    // Fill out the form
    userEvent.type(screen.getByLabelText(/isim/i), 'Test User');
    userEvent.type(screen.getByLabelText(/e-posta/i), 'test@example.com');
    
    // Open dropdown and select a country
    fireEvent.click(screen.getByLabelText(/ülke/i));
    fireEvent.click(screen.getByText('Türkiye'));
    
    // Check terms
    fireEvent.click(screen.getByLabelText(/kullanım koşullarını kabul ediyorum/i));
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Check if onSubmit was called with correct values
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        country: 'tr',
        agreeTerms: true,
      });
    });
  });
  
  test('displays loading state when isLoading is true', () => {
    render(<Form onSubmit={jest.fn()} isLoading={true} />);
    
    // Check if button shows loading text
    expect(screen.getByRole('button', { name: /gönderiliyor/i })).toBeInTheDocument();
    
    // Check if button is disabled
    expect(screen.getByRole('button', { name: /gönderiliyor/i })).toBeDisabled();
  });
  
  test('displays error message when error prop is provided', () => {
    render(<Form onSubmit={jest.fn()} error="Form gönderilirken bir hata oluştu" />);
    
    // Check if error message is displayed
    expect(screen.getByText(/form gönderilirken bir hata oluştu/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
  
  test('clears validation errors when valid input is provided', async () => {
    render(<Form onSubmit={jest.fn()} />);
    
    // Submit empty form to trigger validation errors
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/isim alanı zorunludur/i)).toBeInTheDocument();
    });
    
    // Enter valid name
    userEvent.type(screen.getByLabelText(/isim/i), 'Test User');
    
    // Check if name validation error is cleared
    await waitFor(() => {
      expect(screen.queryByText(/isim alanı zorunludur/i)).not.toBeInTheDocument();
    });
  });
  
  test('has no accessibility violations', async () => {
    const { container } = render(<Form onSubmit={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('has no accessibility violations with error', async () => {
    const { container } = render(<Form onSubmit={jest.fn()} error="Form gönderilirken bir hata oluştu" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('has no accessibility violations with validation errors', async () => {
    const { container } = render(<Form onSubmit={jest.fn()} />);
    
    // Submit empty form to trigger validation errors
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getByText(/isim alanı zorunludur/i)).toBeInTheDocument();
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
