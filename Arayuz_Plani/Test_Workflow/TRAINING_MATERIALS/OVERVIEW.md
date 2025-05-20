# ALT_LAS UI Test Otomasyon Altyapısı Genel Bakış

## Eğitim Oturumu 1: Test Otomasyon Altyapısı Genel Bakış

### Amaç

Bu eğitim oturumu, ALT_LAS UI test otomasyon altyapısının genel bakışını, bileşenlerini ve özelliklerini tanıtmayı amaçlamaktadır. Katılımcılar, test otomasyon altyapısının amacını, mimarisini ve temel bileşenlerini anlayacaklardır.

### Hedef Kitle

- Frontend Geliştiriciler
- QA Mühendisleri
- DevOps Mühendisleri
- Proje Yöneticileri
- Yeni Ekip Üyeleri

### Ön Koşullar

- Temel JavaScript/TypeScript bilgisi
- Temel React bilgisi
- Temel Git bilgisi
- Temel komut satırı bilgisi

### Süre

2 saat

### Eğitim İçeriği

#### 1. Giriş (15 dakika)

- Eğitim oturumunun amaçları ve hedefleri
- Katılımcıların tanıtılması
- Test otomasyonunun önemi ve faydaları
- ALT_LAS UI test otomasyon altyapısının genel bakışı

#### 2. Test Otomasyon Altyapısının Amacı ve Hedefleri (15 dakika)

- Test otomasyon altyapısının amacı
  - Kod kalitesini artırmak
  - Hataları erken tespit etmek
  - Geliştirme sürecini hızlandırmak
  - Kullanıcı deneyimini iyileştirmek

- Test otomasyon altyapısının hedefleri
  - Test kapsamını artırmak
  - Test performansını iyileştirmek
  - Erişilebilirlik uyumluluğunu sağlamak
  - Performans metriklerini optimize etmek
  - Kapsamlı dokümantasyon oluşturmak

#### 3. Test Otomasyon Altyapısının Mimarisi (30 dakika)

- Test otomasyon altyapısının yüksek seviye mimarisi
  - Test çerçeveleri
  - Test türleri
  - CI/CD entegrasyonu
  - Test raporlama
  - Test veri yönetimi

- Test otomasyon altyapısının bileşenleri
  - Jest ve React Testing Library
  - Cypress
  - Percy
  - Lighthouse CI
  - MSW
  - GitHub Actions

- Test otomasyon altyapısının dosya yapısı
  - Test dosyalarının organizasyonu
  - Test yardımcı fonksiyonları
  - Test veri yönetimi
  - Test yapılandırması

#### 4. Test Türleri (30 dakika)

- Birim Testleri
  - Amaç ve kapsam
  - Jest ve React Testing Library kullanımı
  - Örnek birim testi

- Entegrasyon Testleri
  - Amaç ve kapsam
  - Jest ve React Testing Library kullanımı
  - Örnek entegrasyon testi

- Erişilebilirlik Testleri
  - Amaç ve kapsam
  - jest-axe ve Cypress-axe kullanımı
  - Örnek erişilebilirlik testi

- Performans Testleri
  - Amaç ve kapsam
  - Lighthouse CI kullanımı
  - Örnek performans testi

- Uçtan Uca Testler
  - Amaç ve kapsam
  - Cypress kullanımı
  - Örnek uçtan uca test

- Görsel Regresyon Testleri
  - Amaç ve kapsam
  - Percy kullanımı
  - Örnek görsel regresyon testi

#### 5. CI/CD Entegrasyonu (15 dakika)

- GitHub Actions workflow
  - Workflow yapılandırması
  - Test çalıştırma
  - Test raporlama
  - Kod kapsama takibi
  - Otomatik dağıtım

- Test paralelleştirme
  - Birim ve entegrasyon testleri için shard'lar
  - Uçtan uca testler için tarayıcı matrisi
  - Performans testleri için masaüstü ve mobil

- Test raporlama
  - Jest HTML Reporter
  - Codecov
  - Lighthouse CI
  - Percy Dashboard

#### 6. Test Otomasyon Altyapısının Kullanımı (15 dakika)

- Test yazma
  - Test dosyası oluşturma
  - Test senaryoları yazma
  - Test yardımcı fonksiyonları kullanma
  - Test veri yönetimi

- Test çalıştırma
  - Komut satırından test çalıştırma
  - IDE'den test çalıştırma
  - CI/CD pipeline'ından test çalıştırma

- Test sonuçlarını analiz etme
  - Test raporlarını inceleme
  - Kod kapsama raporlarını inceleme
  - Hata ayıklama

#### 7. Uygulama (30 dakika)

- Basit bir bileşen için test yazma
  - Birim testi
  - Entegrasyon testi
  - Erişilebilirlik testi

- Testleri çalıştırma ve sonuçları analiz etme
  - Komut satırından test çalıştırma
  - Test raporlarını inceleme
  - Kod kapsama raporlarını inceleme

#### 8. Soru ve Cevaplar (15 dakika)

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
- [Cypress Dokümantasyonu](https://docs.cypress.io/)
- [Percy Dokümantasyonu](https://docs.percy.io/)
- [Lighthouse CI Dokümantasyonu](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md)
- [MSW Dokümantasyonu](https://mswjs.io/docs/)
- [GitHub Actions Dokümantasyonu](https://docs.github.com/en/actions)

## Örnek Kod Parçaları

### Birim Testi Örneği

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

### Entegrasyon Testi Örneği

```tsx
// textfield-form.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SimpleForm } from '../../components/SimpleForm';

describe('TextField Form Integration', () => {
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
    });
  });
});
```

### Erişilebilirlik Testi Örneği

```tsx
// button-a11y.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '../Button';

describe('Button Accessibility', () => {
  test('has no accessibility violations', async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Uçtan Uca Test Örneği

```tsx
// login.cy.ts
describe('Login Form', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('input[id^="textfield-username"]').type('admin');
    cy.get('input[id^="textfield-password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

### Görsel Regresyon Testi Örneği

```tsx
// Button.cy.tsx
describe('Button Component', () => {
  it('renders primary variant correctly', () => {
    cy.mount(<Button variant="primary">Primary Button</Button>);
    cy.percySnapshot('Button - Primary');
  });
});
```

### Performans Testi Örneği

```js
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
      },
    },
  },
};
```

## Alıştırmalar

1. Basit bir bileşen için birim testi yazın
2. İki bileşen arasındaki etkileşimi test eden bir entegrasyon testi yazın
3. Bir bileşenin erişilebilirliğini test eden bir erişilebilirlik testi yazın
4. Bir kullanıcı akışını test eden bir uçtan uca test yazın
5. Bir bileşenin görsel görünümünü test eden bir görsel regresyon testi yazın
