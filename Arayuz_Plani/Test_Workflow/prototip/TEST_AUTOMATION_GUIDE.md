# ALT_LAS UI Test Otomasyon Rehberi

Bu rehber, ALT_LAS UI projesi için test otomasyon süreçlerini ve en iyi uygulamaları açıklamaktadır.

## Test Türleri

### 1. Birim Testleri

Birim testleri, tek bir bileşeni veya fonksiyonu izole bir şekilde test eder. Bağımlılıklar taklit edilmelidir.

#### Birim Testi Yazma Adımları

1. Test edilecek bileşeni veya fonksiyonu içe aktarın
2. Test senaryolarını tanımlayın
3. Bileşeni veya fonksiyonu render edin veya çağırın
4. Beklenen sonuçları doğrulayın

#### Örnek Birim Testi

```tsx
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

test('renders correctly with default props', () => {
  render(<Button>Click me</Button>);
  const button = screen.getByRole('button', { name: /click me/i });
  expect(button).toBeInTheDocument();
});
```

### 2. Entegrasyon Testleri

Entegrasyon testleri, birden fazla bileşen arasındaki etkileşimi test eder.

#### Entegrasyon Testi Yazma Adımları

1. Test edilecek bileşenleri içe aktarın
2. Test senaryolarını tanımlayın
3. Bileşenleri birlikte render edin
4. Bileşenler arasındaki etkileşimleri simüle edin
5. Beklenen sonuçları doğrulayın

#### Örnek Entegrasyon Testi

```tsx
// textfield-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SimpleForm } from '../SimpleForm';

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
```

### 3. Erişilebilirlik Testleri

Erişilebilirlik testleri, bileşenlerin WCAG standartlarına uygunluğunu test eder.

#### Erişilebilirlik Testi Yazma Adımları

1. Test edilecek bileşeni içe aktarın
2. Bileşeni render edin
3. jest-axe ile erişilebilirlik kontrolü yapın

#### Örnek Erişilebilirlik Testi

```tsx
// button-a11y.test.tsx
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '../Button';

test('Button component has no accessibility violations', async () => {
  const { container } = render(<Button>Accessible Button</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 4. Uçtan Uca Testler

Uçtan uca testler, tam kullanıcı akışlarını test eder.

#### Uçtan Uca Test Yazma Adımları

1. Test senaryolarını tanımlayın
2. Sayfayı ziyaret edin
3. Kullanıcı etkileşimlerini simüle edin
4. Beklenen sonuçları doğrulayın

#### Örnek Uçtan Uca Test

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

### 5. Görsel Regresyon Testleri

Görsel regresyon testleri, bileşenlerin görsel değişikliklerini test eder.

#### Görsel Regresyon Testi Yazma Adımları

1. Test edilecek bileşeni içe aktarın
2. Bileşeni render edin
3. Percy ile ekran görüntüsü alın

#### Örnek Görsel Regresyon Testi

```tsx
// Button.cy.tsx
describe('Button Component', () => {
  it('renders primary variant correctly', () => {
    cy.mount(<Button variant="primary">Primary Button</Button>);
    cy.percySnapshot('Button - Primary');
  });
});
```

## Test Organizasyonu

### Dizin Yapısı

```
src/
├── components/
│   ├── __tests__/           # Bileşen birim testleri
├── pages/
│   ├── __tests__/           # Sayfa bileşeni testleri
├── store/
│   ├── __tests__/           # Store testleri
├── services/
│   ├── __tests__/           # Servis testleri
├── utils/
│   ├── __tests__/           # Yardımcı fonksiyon testleri
├── __tests__/
│   ├── integration/         # Entegrasyon testleri
│   ├── a11y/                # Erişilebilirlik testleri
cypress/
├── e2e/                     # Uçtan uca testler
├── component/               # Bileşen testleri
```

### Dosya Adlandırma Kuralları

- Birim testleri: `ComponentName.test.tsx`
- Entegrasyon testleri: `feature-name.test.tsx`
- Erişilebilirlik testleri: `component-name-a11y.test.tsx`
- Uçtan uca testler: `feature-name.cy.ts`
- Görsel regresyon testleri: `ComponentName.cy.tsx`

## Test Çalıştırma

### Tüm Testler

```bash
npm test
```

### Birim Testleri

```bash
npm test -- --testPathIgnorePatterns=integration a11y
```

### Entegrasyon Testleri

```bash
npm run test:integration
```

### Erişilebilirlik Testleri

```bash
npm run test:a11y
```

### Uçtan Uca Testler

```bash
npm run test:e2e
```

### Görsel Regresyon Testleri

```bash
npm run test:visual
```

## En İyi Uygulamalar

1. **Davranışı Test Edin, Uygulamayı Değil**: Bileşenin ne yaptığını test edin, nasıl yaptığını değil.
2. **Testleri Basit Tutun**: Her test bir şeyi test etmelidir.
3. **Açıklayıcı Test İsimleri Kullanın**: Test isimleri neyin test edildiğini açıklamalıdır.
4. **Harici Bağımlılıkları Taklit Edin**: Harici bağımlılıkları taklit etmek için jest.mock() kullanın.
5. **Sınır Durumlarını Test Edin**: Sınır koşullarını ve hata durumlarını test edin.
6. **Test Bağımsızlığını Koruyun**: Testler birbirine bağımlı olmamalıdır.
7. **Testing Library En İyi Uygulamalarını Kullanın**: Uygulama odaklı sorgular (getByTestId) yerine kullanıcı odaklı sorgular (getByRole, getByLabelText) tercih edin.
8. **Erişilebilirliği Test Edin**: Erişilebilirlik ihlallerini test etmek için jest-axe kullanın.

## Sorun Giderme

### Yaygın Sorunlar

1. **Testler CI'da Başarısız Oluyor Ancak Yerel Olarak Geçiyor**: Bu genellikle ortam farklılıklarından kaynaklanır. Ortama özgü kodu kontrol edin.
2. **Snapshot Testleri Başarısız Oluyor**: Bileşenler değiştiğinde snapshot'lar güncellenmesi gerekir. Snapshot'ları güncellemek için `npm test -- -u` çalıştırın.
3. **Testlerde Zaman Aşımı**: Test için zaman aşımını artırın veya test edilen kodu optimize edin.
4. **Bellek Sızıntıları**: Aboneliği iptal edilmemiş olay dinleyicileri veya kapatılmamış bağlantıları kontrol edin.

### Testleri Hata Ayıklama

1. `console.log()` kullanarak testleri hata ayıklayın.
2. Daha ayrıntılı çıktı görmek için `--verbose` bayrağını kullanın: `npm test -- --verbose`.
3. İzleme modunda testleri çalıştırmak için `--watch` bayrağını kullanın: `npm test -- --watch`.
4. Render edilen HTML'yi görmek için Testing Library'den `debug()` fonksiyonunu kullanın: `screen.debug()`.

## Kaynaklar

- [Jest Dokümantasyonu](https://jestjs.io/docs/getting-started)
- [React Testing Library Dokümantasyonu](https://testing-library.com/docs/react-testing-library/intro/)
- [jest-axe Dokümantasyonu](https://github.com/nickcolley/jest-axe)
- [Cypress Dokümantasyonu](https://docs.cypress.io/)
- [Percy Dokümantasyonu](https://docs.percy.io/)
- [MSW Dokümantasyonu](https://mswjs.io/docs/)
