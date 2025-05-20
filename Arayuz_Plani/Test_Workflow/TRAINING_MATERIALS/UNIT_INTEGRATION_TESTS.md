# ALT_LAS UI Birim ve Entegrasyon Testleri

## Eğitim Oturumu 2: Birim ve Entegrasyon Testleri

### Amaç

Bu eğitim oturumu, ALT_LAS UI projesi için Jest ve React Testing Library kullanarak birim ve entegrasyon testleri yazmayı öğretmeyi amaçlamaktadır. Katılımcılar, birim ve entegrasyon testlerinin amacını, yazma adımlarını ve en iyi uygulamaları öğreneceklerdir.

### Hedef Kitle

- Frontend Geliştiriciler
- QA Mühendisleri
- Yeni Ekip Üyeleri

### Ön Koşullar

- Temel JavaScript/TypeScript bilgisi
- Temel React bilgisi
- Temel Git bilgisi
- Temel komut satırı bilgisi
- Test Otomasyon Altyapısı Genel Bakış eğitimini tamamlamış olmak

### Süre

2 saat

### Eğitim İçeriği

#### 1. Giriş (10 dakika)

- Eğitim oturumunun amaçları ve hedefleri
- Birim ve entegrasyon testlerinin önemi ve faydaları
- Jest ve React Testing Library'nin genel bakışı

#### 2. Jest ve React Testing Library Kurulumu (10 dakika)

- Jest kurulumu ve yapılandırması
  - `package.json` yapılandırması
  - `jest.config.js` yapılandırması
  - `jest.setup.js` yapılandırması

- React Testing Library kurulumu ve yapılandırması
  - `@testing-library/react` kurulumu
  - `@testing-library/jest-dom` kurulumu
  - `@testing-library/user-event` kurulumu

#### 3. Birim Testleri (40 dakika)

- Birim testlerinin amacı ve kapsamı
  - Tek bir bileşeni veya fonksiyonu izole bir şekilde test etmek
  - Bağımlılıkları taklit etmek
  - Davranışı test etmek, uygulamayı değil

- Birim testi yazma adımları
  1. Test edilecek bileşeni veya fonksiyonu içe aktarma
  2. Test senaryolarını tanımlama
  3. Bileşeni veya fonksiyonu render etme veya çağırma
  4. Beklenen sonuçları doğrulama

- Birim testi örnekleri
  - Bileşen render testi
  - Prop değişikliği testi
  - Olay işleyici testi
  - Durum değişikliği testi
  - Koşullu render testi

- Birim testi en iyi uygulamaları
  - Davranışı test etme, uygulamayı değil
  - Testleri basit tutma
  - Açıklayıcı test isimleri kullanma
  - Harici bağımlılıkları taklit etme
  - Sınır durumlarını test etme

#### 4. Entegrasyon Testleri (40 dakika)

- Entegrasyon testlerinin amacı ve kapsamı
  - Birden fazla bileşen arasındaki etkileşimi test etmek
  - Veri akışını test etmek
  - Kullanıcı etkileşimlerini test etmek

- Entegrasyon testi yazma adımları
  1. Test edilecek bileşenleri içe aktarma
  2. Test senaryolarını tanımlama
  3. Bileşenleri birlikte render etme
  4. Bileşenler arasındaki etkileşimleri simüle etme
  5. Beklenen sonuçları doğrulama

- Entegrasyon testi örnekleri
  - Form gönderimi testi
  - Bileşen etkileşimi testi
  - Veri akışı testi
  - Durum paylaşımı testi
  - Context API testi

- Entegrasyon testi en iyi uygulamaları
  - Gerçek kullanıcı etkileşimlerini simüle etme
  - Veri akışını test etme
  - Hata durumlarını test etme
  - Yükleme durumlarını test etme
  - Başarı durumlarını test etme

#### 5. Test Yardımcı Fonksiyonları (20 dakika)

- Test yardımcı fonksiyonlarının amacı ve faydaları
  - Tekrarlanan kodu azaltmak
  - Test kodunu daha okunabilir hale getirmek
  - Test yazma sürecini hızlandırmak

- Test yardımcı fonksiyonları örnekleri
  - Özel render fonksiyonları
  - Test veri oluşturucuları
  - Test bekleme fonksiyonları
  - Test temizleme fonksiyonları

- Test yardımcı fonksiyonları kullanımı
  - Test dosyalarında içe aktarma
  - Test senaryolarında kullanma
  - Test sonuçlarını doğrulama

#### 6. Uygulama (30 dakika)

- Basit bir bileşen için birim testi yazma
  - Bileşeni render etme
  - Prop değişikliklerini test etme
  - Olay işleyicileri test etme
  - Durum değişikliklerini test etme

- İki bileşen arasındaki etkileşimi test eden bir entegrasyon testi yazma
  - Bileşenleri birlikte render etme
  - Bileşenler arasındaki etkileşimleri simüle etme
  - Veri akışını test etme
  - Beklenen sonuçları doğrulama

#### 7. Soru ve Cevaplar (10 dakika)

- Katılımcılardan sorular
- Açık konuların tartışılması
- Sonraki adımlar

### Eğitim Materyalleri

- Sunum slaytları
- Demo videoları
- Kod örnekleri
- Alıştırmalar

### Kaynaklar

- [Jest Dokümantasyonu](https://jestjs.io/docs/getting-started)
- [React Testing Library Dokümantasyonu](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Sorgu Öncelikleri](https://testing-library.com/docs/queries/about/#priority)
- [Jest Cheat Sheet](https://github.com/sapegin/jest-cheat-sheet)
- [React Testing Library Cheat Sheet](https://testing-library.com/docs/react-testing-library/cheatsheet/)

## Örnek Kod Parçaları

### Birim Testi Örnekleri

#### Bileşen Render Testi

```tsx
// Button.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  test('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });
});
```

#### Prop Değişikliği Testi

```tsx
// Button.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  test('applies primary variant styles when variant prop is primary', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button', { name: /primary button/i });
    expect(button).toHaveClass('bg-blue-600');
  });

  test('applies secondary variant styles when variant prop is secondary', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole('button', { name: /secondary button/i });
    expect(button).toHaveClass('bg-gray-200');
  });
});
```

#### Olay İşleyici Testi

```tsx
// Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick handler when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

#### Durum Değişikliği Testi

```tsx
// Counter.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from '../Counter';

describe('Counter Component', () => {
  test('increments count when increment button is clicked', () => {
    render(<Counter initialCount={0} />);
    const incrementButton = screen.getByRole('button', { name: /increment/i });
    const countDisplay = screen.getByText(/count: 0/i);
    
    fireEvent.click(incrementButton);
    
    expect(countDisplay).toHaveTextContent('Count: 1');
  });

  test('decrements count when decrement button is clicked', () => {
    render(<Counter initialCount={1} />);
    const decrementButton = screen.getByRole('button', { name: /decrement/i });
    const countDisplay = screen.getByText(/count: 1/i);
    
    fireEvent.click(decrementButton);
    
    expect(countDisplay).toHaveTextContent('Count: 0');
  });
});
```

### Entegrasyon Testi Örnekleri

#### Form Gönderimi Testi

```tsx
// LoginForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

describe('LoginForm Integration', () => {
  test('submits form with valid credentials', async () => {
    const handleSubmit = jest.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    // Enter valid credentials
    userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Check if form is submitted with correct data
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });
  });

  test('shows validation errors with invalid credentials', async () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    
    // Submit the form without entering any data
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
});
```

#### Bileşen Etkileşimi Testi

```tsx
// Dropdown.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dropdown } from '../Dropdown';

describe('Dropdown Integration', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  test('opens dropdown when clicked', () => {
    render(<Dropdown options={options} label="Select Option" />);
    
    // Click the dropdown button
    fireEvent.click(screen.getByLabelText(/select option/i));
    
    // Check if dropdown options are displayed
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  test('selects an option when clicked', () => {
    const handleChange = jest.fn();
    render(
      <Dropdown
        options={options}
        label="Select Option"
        onChange={handleChange}
      />
    );
    
    // Click the dropdown button
    fireEvent.click(screen.getByLabelText(/select option/i));
    
    // Click an option
    fireEvent.click(screen.getByText('Option 2'));
    
    // Check if onChange handler is called with correct value
    expect(handleChange).toHaveBeenCalledWith('option2');
    
    // Check if selected option is displayed
    expect(screen.getByLabelText(/select option/i)).toHaveTextContent('Option 2');
  });
});
```

### Test Yardımcı Fonksiyonları Örnekleri

#### Özel Render Fonksiyonu

```tsx
// test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../context/ThemeContext';

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

#### Test Veri Oluşturucusu

```tsx
// test-data.ts
export interface User {
  id: string;
  username: string;
  email: string;
}

export const createUser = (overrides?: Partial<User>): User => {
  return {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    ...overrides,
  };
};

export interface FormData {
  name: string;
  email: string;
  message: string;
}

export const createFormData = (overrides?: Partial<FormData>): FormData => {
  return {
    name: 'Test User',
    email: 'test@example.com',
    message: 'Test message',
    ...overrides,
  };
};
```

## Alıştırmalar

1. Button bileşeni için birim testleri yazın
   - Farklı varyantlar için render testleri
   - Farklı boyutlar için render testleri
   - onClick olayı için testler
   - Disabled durumu için testler

2. TextField bileşeni için birim testleri yazın
   - Farklı tipler için render testleri
   - onChange olayı için testler
   - Validation için testler
   - Error durumu için testler

3. LoginForm bileşeni için entegrasyon testleri yazın
   - Geçerli kimlik bilgileriyle form gönderimi
   - Geçersiz kimlik bilgileriyle form gönderimi
   - Validation hataları
   - Loading durumu
