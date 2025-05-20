// src/__tests__/integration/form-submission.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from '../../components/Form';
import { rest } from 'msw';
import { server } from '../../mocks/server';

// Mock a simple registration page component that uses the Form
const RegistrationPage: React.FC = () => {
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  
  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      // Simulate API call
      const response = await fetch('https://api.alt-las.example/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kayıt işlemi başarısız oldu');
      }
      
      setIsRegistered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isRegistered) {
    return (
      <div>
        <h1>Kayıt Başarılı!</h1>
        <p>Hesabınız başarıyla oluşturuldu.</p>
        <button onClick={() => setIsRegistered(false)}>Yeni Kayıt</button>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Kayıt Ol</h1>
      <Form 
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
        error={error} 
      />
    </div>
  );
};

// Add a handler for the register endpoint
beforeAll(() => {
  server.use(
    rest.post('https://api.alt-las.example/register', (req, res, ctx) => {
      const { email } = req.body as { email: string };
      
      if (email === 'existing@example.com') {
        return res(
          ctx.status(400),
          ctx.json({ error: 'Bu e-posta adresi zaten kullanılıyor' })
        );
      }
      
      return res(
        ctx.status(200),
        ctx.json({ 
          success: true,
          message: 'Kayıt başarılı' 
        })
      );
    })
  );
});

describe('Form Submission Integration', () => {
  test('successful registration flow', async () => {
    render(<RegistrationPage />);
    
    // Check initial state
    expect(screen.getByRole('heading', { name: /kayıt ol/i })).toBeInTheDocument();
    
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
    
    // Check loading state
    expect(screen.getByRole('button', { name: /gönderiliyor/i })).toBeInTheDocument();
    
    // Wait for registration to complete
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /kayıt başarılı/i })).toBeInTheDocument();
    });
    
    // Check success state
    expect(screen.getByText(/hesabınız başarıyla oluşturuldu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yeni kayıt/i })).toBeInTheDocument();
  });
  
  test('registration with existing email shows error', async () => {
    render(<RegistrationPage />);
    
    // Fill out the form with existing email
    userEvent.type(screen.getByLabelText(/isim/i), 'Test User');
    userEvent.type(screen.getByLabelText(/e-posta/i), 'existing@example.com');
    
    // Open dropdown and select a country
    fireEvent.click(screen.getByLabelText(/ülke/i));
    fireEvent.click(screen.getByText('Türkiye'));
    
    // Check terms
    fireEvent.click(screen.getByLabelText(/kullanım koşullarını kabul ediyorum/i));
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/bu e-posta adresi zaten kullanılıyor/i)).toBeInTheDocument();
    });
    
    // Check that we're still on the registration page
    expect(screen.getByRole('heading', { name: /kayıt ol/i })).toBeInTheDocument();
  });
  
  test('validation prevents submission with empty fields', async () => {
    render(<RegistrationPage />);
    
    // Submit the form without entering any data
    fireEvent.click(screen.getByRole('button', { name: /gönder/i }));
    
    // Check validation errors
    await waitFor(() => {
      expect(screen.getByText(/isim alanı zorunludur/i)).toBeInTheDocument();
      expect(screen.getByText(/e-posta alanı zorunludur/i)).toBeInTheDocument();
      expect(screen.getByText(/ülke seçimi zorunludur/i)).toBeInTheDocument();
      expect(screen.getByText(/kullanım koşullarını kabul etmelisiniz/i)).toBeInTheDocument();
    });
    
    // Check that no API call was made (we're still on the registration page)
    expect(screen.getByRole('heading', { name: /kayıt ol/i })).toBeInTheDocument();
  });
  
  test('server error shows generic error message', async () => {
    // Override the handler for this test to simulate a server error
    server.use(
      rest.post('https://api.alt-las.example/register', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Sunucu hatası' })
        );
      })
    );
    
    render(<RegistrationPage />);
    
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
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/sunucu hatası/i)).toBeInTheDocument();
    });
    
    // Check that we're still on the registration page
    expect(screen.getByRole('heading', { name: /kayıt ol/i })).toBeInTheDocument();
  });
});
