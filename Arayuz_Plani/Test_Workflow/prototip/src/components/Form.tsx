// src/components/Form.tsx
import React, { useState } from 'react';
import { TextField } from './TextField';
import { Dropdown, DropdownOption } from './Dropdown';
import { Checkbox } from './Checkbox';
import { Button } from './Button';

interface FormData {
  name: string;
  email: string;
  country: string;
  agreeTerms: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  country?: string;
  agreeTerms?: string;
}

interface FormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  error?: string;
}

const countryOptions: DropdownOption[] = [
  { value: 'tr', label: 'Türkiye' },
  { value: 'us', label: 'Amerika Birleşik Devletleri' },
  { value: 'gb', label: 'Birleşik Krallık' },
  { value: 'de', label: 'Almanya' },
  { value: 'fr', label: 'Fransa' },
];

export const Form: React.FC<FormProps> = ({
  onSubmit,
  isLoading = false,
  error,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    country: '',
    agreeTerms: false,
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    // Validate name
    if (!formData.name) {
      errors.name = 'İsim alanı zorunludur';
      isValid = false;
    }
    
    // Validate email
    if (!formData.email) {
      errors.email = 'E-posta alanı zorunludur';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz';
      isValid = false;
    }
    
    // Validate country
    if (!formData.country) {
      errors.country = 'Ülke seçimi zorunludur';
      isValid = false;
    }
    
    // Validate terms agreement
    if (!formData.agreeTerms) {
      errors.agreeTerms = 'Kullanım koşullarını kabul etmelisiniz';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Kayıt formu">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <TextField
        label="İsim"
        value={formData.name}
        onChange={(value) => handleChange('name', value)}
        required
        error={formErrors.name}
        fullWidth
      />
      
      <TextField
        label="E-posta"
        type="email"
        value={formData.email}
        onChange={(value) => handleChange('email', value)}
        required
        error={formErrors.email}
        fullWidth
      />
      
      <Dropdown
        label="Ülke"
        options={countryOptions}
        value={formData.country}
        onChange={(value) => handleChange('country', value)}
        required
        error={formErrors.country}
        fullWidth
      />
      
      <Checkbox
        label="Kullanım koşullarını kabul ediyorum"
        checked={formData.agreeTerms}
        onChange={(checked) => handleChange('agreeTerms', checked)}
        error={formErrors.agreeTerms}
      />
      
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Gönderiliyor...' : 'Gönder'}
        </Button>
      </div>
    </form>
  );
};
