// src/__tests__/integration/checkbox-form.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../../components/Checkbox';
import { Button } from '../../components/Button';

// Basit bir form bileşeni oluşturalım
const PreferencesForm: React.FC = () => {
  const [preferences, setPreferences] = React.useState({
    newsletter: false,
    marketing: false,
    updates: false,
  });
  
  const [errors, setErrors] = React.useState({
    newsletter: '',
  });
  
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  
  const handleChange = (field: keyof typeof preferences, checked: boolean) => {
    setPreferences(prev => ({ ...prev, [field]: checked }));
    
    // Clear error when field is changed
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {
      newsletter: '',
    };
    
    if (!preferences.newsletter) {
      newErrors.newsletter = 'Bülten aboneliği zorunludur';
    }
    
    setErrors(newErrors);
    
    // If no errors, submit form
    if (!newErrors.newsletter) {
      setIsSubmitted(true);
    }
  };
  
  if (isSubmitted) {
    return (
      <div>
        <h2>Form Başarıyla Gönderildi</h2>
        <p>Tercihleriniz kaydedildi:</p>
        <ul>
          <li>Bülten: {preferences.newsletter ? 'Evet' : 'Hayır'}</li>
          <li>Pazarlama: {preferences.marketing ? 'Evet' : 'Hayır'}</li>
          <li>Güncellemeler: {preferences.updates ? 'Evet' : 'Hayır'}</li>
        </ul>
        <button onClick={() => setIsSubmitted(false)}>Yeni Form</button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} data-testid="preferences-form">
      <div className="space-y-4">
        <Checkbox
          label="Bültene abone olmak istiyorum"
          checked={preferences.newsletter}
          onChange={(checked) => handleChange('newsletter', checked)}
          error={errors.newsletter}
          required
        />
        
        <Checkbox
          label="Pazarlama iletileri almak istiyorum"
          checked={preferences.marketing}
          onChange={(checked) => handleChange('marketing', checked)}
        />
        
        <Checkbox
          label="Ürün güncellemeleri hakkında bilgi almak istiyorum"
          checked={preferences.updates}
          onChange={(checked) => handleChange('updates', checked)}
        />
        
        <Button type="submit">Gönder</Button>
      </div>
    </form>
  );
};

describe('Checkbox Form Integration', () => {
  test('renders form with Checkbox components', () => {
    render(<PreferencesForm />);
    
    expect(screen.getByLabelText(/bültene abone olmak istiyorum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pazarlama iletileri almak istiyorum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ürün güncellemeleri hakkında bilgi almak istiyorum/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gönder/i })).toBeInTheDocument();
  });
  
  test('shows validation error when submitting without checking required checkbox', async () => {
    render(<PreferencesForm />);
    
    // Submit the form without checking the required checkbox
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/bülten aboneliği zorunludur/i)).toBeInTheDocument();
    });
  });
  
  test('checks and unchecks checkboxes correctly', async () => {
    render(<PreferencesForm />);
    
    // Check all checkboxes
    fireEvent.click(screen.getByLabelText(/bültene abone olmak istiyorum/i));
    fireEvent.click(screen.getByLabelText(/pazarlama iletileri almak istiyorum/i));
    fireEvent.click(screen.getByLabelText(/ürün güncellemeleri hakkında bilgi almak istiyorum/i));
    
    // Check if all checkboxes are checked
    await waitFor(() => {
      expect(screen.getByLabelText(/bültene abone olmak istiyorum/i)).toBeChecked();
      expect(screen.getByLabelText(/pazarlama iletileri almak istiyorum/i)).toBeChecked();
      expect(screen.getByLabelText(/ürün güncellemeleri hakkında bilgi almak istiyorum/i)).toBeChecked();
    });
    
    // Uncheck the second checkbox
    fireEvent.click(screen.getByLabelText(/pazarlama iletileri almak istiyorum/i));
    
    // Check if the second checkbox is unchecked
    await waitFor(() => {
      expect(screen.getByLabelText(/pazarlama iletileri almak istiyorum/i)).not.toBeChecked();
    });
  });
  
  test('submits form successfully with valid data', async () => {
    render(<PreferencesForm />);
    
    // Check the required checkbox
    fireEvent.click(screen.getByLabelText(/bültene abone olmak istiyorum/i));
    
    // Check the third checkbox
    fireEvent.click(screen.getByLabelText(/ürün güncellemeleri hakkında bilgi almak istiyorum/i));
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Check if form is submitted successfully
    await waitFor(() => {
      expect(screen.getByText(/form başarıyla gönderildi/i)).toBeInTheDocument();
      expect(screen.getByText(/bülten: evet/i)).toBeInTheDocument();
      expect(screen.getByText(/pazarlama: hayır/i)).toBeInTheDocument();
      expect(screen.getByText(/güncellemeler: evet/i)).toBeInTheDocument();
    });
  });
  
  test('clears validation error when required checkbox is checked', async () => {
    render(<PreferencesForm />);
    
    // Submit the form without checking the required checkbox
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/bülten aboneliği zorunludur/i)).toBeInTheDocument();
    });
    
    // Check the required checkbox
    fireEvent.click(screen.getByLabelText(/bültene abone olmak istiyorum/i));
    
    // Check if validation error is cleared
    await waitFor(() => {
      expect(screen.queryByText(/bülten aboneliği zorunludur/i)).not.toBeInTheDocument();
    });
  });
});
