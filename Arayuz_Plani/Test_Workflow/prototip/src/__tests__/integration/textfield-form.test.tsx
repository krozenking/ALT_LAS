// src/__tests__/integration/textfield-form.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';

// Basit bir form bileşeni oluşturalım
const SimpleForm: React.FC = () => {
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
  });
  
  const [formErrors, setFormErrors] = React.useState({
    username: '',
    email: '',
  });
  
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is changed
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = {
      username: '',
      email: '',
    };
    
    if (!formData.username) {
      errors.username = 'Kullanıcı adı gereklidir';
    }
    
    if (!formData.email) {
      errors.email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    setFormErrors(errors);
    
    // If no errors, submit form
    if (!errors.username && !errors.email) {
      setIsSubmitted(true);
    }
  };
  
  if (isSubmitted) {
    return (
      <div>
        <h2>Form Başarıyla Gönderildi</h2>
        <p>Kullanıcı Adı: {formData.username}</p>
        <p>E-posta: {formData.email}</p>
        <button onClick={() => setIsSubmitted(false)}>Yeni Form</button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} data-testid="simple-form">
      <div className="space-y-4">
        <TextField
          label="Kullanıcı Adı"
          value={formData.username}
          onChange={(value) => handleChange('username', value)}
          error={formErrors.username}
          required
        />
        
        <TextField
          label="E-posta"
          type="email"
          value={formData.email}
          onChange={(value) => handleChange('email', value)}
          error={formErrors.email}
          required
        />
        
        <Button type="submit">Gönder</Button>
      </div>
    </form>
  );
};

describe('TextField Form Integration', () => {
  test('renders form with TextField components', () => {
    render(<SimpleForm />);
    
    expect(screen.getByLabelText(/kullanıcı adı/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gönder/i })).toBeInTheDocument();
  });
  
  test('shows validation errors when submitting empty form', async () => {
    render(<SimpleForm />);
    
    // Submit the form without entering any data
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/kullanıcı adı gereklidir/i)).toBeInTheDocument();
      expect(screen.getByText(/e-posta gereklidir/i)).toBeInTheDocument();
    });
  });
  
  test('validates email format', async () => {
    render(<SimpleForm />);
    
    // Enter username but invalid email
    userEvent.type(screen.getByLabelText(/kullanıcı adı/i), 'testuser');
    userEvent.type(screen.getByLabelText(/e-posta/i), 'invalid-email');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Check if email validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/geçerli bir e-posta adresi giriniz/i)).toBeInTheDocument();
    });
  });
  
  test('clears validation errors when fields are changed', async () => {
    render(<SimpleForm />);
    
    // Submit empty form to trigger validation errors
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/kullanıcı adı gereklidir/i)).toBeInTheDocument();
    });
    
    // Enter username
    userEvent.type(screen.getByLabelText(/kullanıcı adı/i), 'testuser');
    
    // Check if username validation error is cleared
    await waitFor(() => {
      expect(screen.queryByText(/kullanıcı adı gereklidir/i)).not.toBeInTheDocument();
    });
  });
  
  test('submits form successfully with valid data', async () => {
    render(<SimpleForm />);
    
    // Enter valid data
    userEvent.type(screen.getByLabelText(/kullanıcı adı/i), 'testuser');
    userEvent.type(screen.getByLabelText(/e-posta/i), 'test@example.com');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Check if form is submitted successfully
    await waitFor(() => {
      expect(screen.getByText(/form başarıyla gönderildi/i)).toBeInTheDocument();
      expect(screen.getByText(/kullanıcı adı: testuser/i)).toBeInTheDocument();
      expect(screen.getByText(/e-posta: test@example.com/i)).toBeInTheDocument();
    });
  });
});
