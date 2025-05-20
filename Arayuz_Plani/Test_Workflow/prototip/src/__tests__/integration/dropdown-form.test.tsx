// src/__tests__/integration/dropdown-form.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown, DropdownOption } from '../../components/Dropdown';
import { Button } from '../../components/Button';

// Basit bir form bileşeni oluşturalım
const CountryForm: React.FC = () => {
  const [country, setCountry] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  
  const countryOptions: DropdownOption[] = [
    { value: 'tr', label: 'Türkiye' },
    { value: 'us', label: 'Amerika Birleşik Devletleri' },
    { value: 'gb', label: 'Birleşik Krallık' },
    { value: 'de', label: 'Almanya' },
    { value: 'fr', label: 'Fransa' },
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!country) {
      setError('Lütfen bir ülke seçin');
      return;
    }
    
    setError('');
    setIsSubmitted(true);
  };
  
  if (isSubmitted) {
    return (
      <div>
        <h2>Form Başarıyla Gönderildi</h2>
        <p>Seçilen Ülke: {countryOptions.find(option => option.value === country)?.label}</p>
        <button onClick={() => setIsSubmitted(false)}>Yeni Form</button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} data-testid="country-form">
      <div className="space-y-4">
        <Dropdown
          label="Ülke"
          options={countryOptions}
          value={country}
          onChange={setCountry}
          error={error}
          required
        />
        
        <Button type="submit">Gönder</Button>
      </div>
    </form>
  );
};

describe('Dropdown Form Integration', () => {
  test('renders form with Dropdown component', () => {
    render(<CountryForm />);
    
    expect(screen.getByLabelText(/ülke/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gönder/i })).toBeInTheDocument();
  });
  
  test('shows validation error when submitting without selecting a country', async () => {
    render(<CountryForm />);
    
    // Submit the form without selecting a country
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/lütfen bir ülke seçin/i)).toBeInTheDocument();
    });
  });
  
  test('opens dropdown when clicked', async () => {
    render(<CountryForm />);
    
    // Click the dropdown button
    fireEvent.click(screen.getByLabelText(/ülke/i));
    
    // Check if dropdown options are displayed
    await waitFor(() => {
      expect(screen.getByText('Türkiye')).toBeInTheDocument();
      expect(screen.getByText('Amerika Birleşik Devletleri')).toBeInTheDocument();
      expect(screen.getByText('Birleşik Krallık')).toBeInTheDocument();
      expect(screen.getByText('Almanya')).toBeInTheDocument();
      expect(screen.getByText('Fransa')).toBeInTheDocument();
    });
  });
  
  test('selects a country and submits the form successfully', async () => {
    render(<CountryForm />);
    
    // Click the dropdown button
    fireEvent.click(screen.getByLabelText(/ülke/i));
    
    // Select a country
    fireEvent.click(screen.getByText('Türkiye'));
    
    // Check if the selected country is displayed in the dropdown
    await waitFor(() => {
      expect(screen.getByLabelText(/ülke/i)).toHaveTextContent('Türkiye');
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Check if form is submitted successfully
    await waitFor(() => {
      expect(screen.getByText(/form başarıyla gönderildi/i)).toBeInTheDocument();
      expect(screen.getByText(/seçilen ülke: türkiye/i)).toBeInTheDocument();
    });
  });
  
  test('clears validation error when a country is selected', async () => {
    render(<CountryForm />);
    
    // Submit the form without selecting a country
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/lütfen bir ülke seçin/i)).toBeInTheDocument();
    });
    
    // Click the dropdown button
    fireEvent.click(screen.getByLabelText(/ülke/i));
    
    // Select a country
    fireEvent.click(screen.getByText('Almanya'));
    
    // Check if validation error is cleared
    await waitFor(() => {
      expect(screen.queryByText(/lütfen bir ülke seçin/i)).not.toBeInTheDocument();
    });
  });
  
  test('handles keyboard navigation in dropdown', async () => {
    render(<CountryForm />);
    
    // Focus the dropdown button
    const dropdownButton = screen.getByLabelText(/ülke/i);
    dropdownButton.focus();
    
    // Press Enter to open dropdown
    fireEvent.keyDown(dropdownButton, { key: 'Enter' });
    
    // Check if dropdown is open
    await waitFor(() => {
      expect(screen.getByText('Türkiye')).toBeInTheDocument();
    });
    
    // Press Escape to close dropdown
    fireEvent.keyDown(dropdownButton, { key: 'Escape' });
    
    // Check if dropdown is closed
    await waitFor(() => {
      expect(screen.queryByText('Türkiye')).not.toBeInTheDocument();
    });
  });
});
