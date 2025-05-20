# ALT_LAS UI Test Otomasyon Altyapısı Kullanım Kılavuzu

Bu kılavuz, ALT_LAS UI projesi için test otomasyon altyapısının nasıl kullanılacağını açıklamaktadır. Test yazma, test çalıştırma ve test sonuçlarını analiz etme konularında rehberlik sağlamaktadır.

## İçindekiler

1. [Başlangıç](#başlangıç)
2. [Test Türleri](#test-türleri)
3. [Test Yazma](#test-yazma)
4. [Test Çalıştırma](#test-çalıştırma)
5. [Test Sonuçlarını Analiz Etme](#test-sonuçlarını-analiz-etme)
6. [CI/CD Entegrasyonu](#cicd-entegrasyonu)
7. [Sorun Giderme](#sorun-giderme)
8. [Sık Sorulan Sorular](#sık-sorulan-sorular)

## Başlangıç

### Gereksinimler

- Node.js 18 veya üzeri
- npm 8 veya üzeri
- Git

### Kurulum

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/krozenking/ALT_LAS.git
   cd ALT_LAS
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Test bağımlılıklarını kontrol edin:
   ```bash
   npm test -- --watchAll=false
   ```

## Test Türleri

ALT_LAS UI projesi için aşağıdaki test türleri mevcuttur:

### 1. Birim Testleri

Birim testleri, tek bir bileşeni veya fonksiyonu izole bir şekilde test eder. Jest ve React Testing Library kullanılarak yazılmıştır.

### 2. Entegrasyon Testleri

Entegrasyon testleri, birden fazla bileşen arasındaki etkileşimi test eder. Jest ve React Testing Library kullanılarak yazılmıştır.

### 3. Erişilebilirlik Testleri

Erişilebilirlik testleri, bileşenlerin WCAG 2.1 AA standartlarına uygunluğunu test eder. Jest-axe ve Cypress-axe kullanılarak yazılmıştır.

### 4. Performans Testleri

Performans testleri, uygulamanın performans metriklerini test eder. Lighthouse CI kullanılarak yazılmıştır.

### 5. Uçtan Uca Testler

Uçtan uca testler, tam kullanıcı akışlarını test eder. Cypress kullanılarak yazılmıştır.

### 6. Görsel Regresyon Testleri

Görsel regresyon testleri, bileşenlerin görsel değişikliklerini test eder. Percy kullanılarak yazılmıştır.

## Test Yazma

### Birim Testi Yazma

Birim testleri, `src/components/__tests__` dizininde yer alır. Yeni bir birim testi eklemek için:

1. İlgili bileşen için bir test dosyası oluşturun: `ComponentName.test.tsx`
2. Jest ve React Testing Library kullanarak testleri yazın:

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

### Entegrasyon Testi Yazma

Entegrasyon testleri, `src/__tests__/integration` dizininde yer alır. Yeni bir entegrasyon testi eklemek için:

1. İlgili özellik için bir test dosyası oluşturun: `feature-name.test.tsx`
2. Jest ve React Testing Library kullanarak testleri yazın:

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

### Erişilebilirlik Testi Yazma

Erişilebilirlik testleri, `src/__tests__/a11y` dizininde yer alır. Yeni bir erişilebilirlik testi eklemek için:

1. İlgili bileşen veya özellik için bir test dosyası oluşturun: `component-name-a11y.test.tsx`
2. Jest-axe ve erişilebilirlik test yardımcı fonksiyonlarını kullanarak testleri yazın:

```tsx
// button-a11y.test.tsx
import React from 'react';
import { Button } from '../../components/Button';
import { testA11y, wcag2aaConfig } from '../../utils/a11y-test-utils';

describe('Button Accessibility', () => {
  test('meets WCAG 2.1 AA standards', async () => {
    await testA11y(<Button>Accessible Button</Button>, wcag2aaConfig);
  });
});
```

### Uçtan Uca Test Yazma

Uçtan uca testler, `cypress/e2e` dizininde yer alır. Yeni bir uçtan uca test eklemek için:

1. İlgili özellik için bir test dosyası oluşturun: `feature-name.cy.ts`
2. Cypress kullanarak testleri yazın:

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

### Görsel Regresyon Testi Yazma

Görsel regresyon testleri, `cypress/component` dizininde yer alır. Yeni bir görsel regresyon testi eklemek için:

1. İlgili bileşen için bir test dosyası oluşturun: `ComponentName.cy.tsx`
2. Cypress ve Percy kullanarak testleri yazın:

```tsx
// Button.cy.tsx
describe('Button Component', () => {
  it('renders primary variant correctly', () => {
    cy.mount(<Button variant="primary">Primary Button</Button>);
    cy.percySnapshot('Button - Primary');
  });
});
```

### Performans Testi Yazma

Performans testleri, Lighthouse CI yapılandırması ile tanımlanır. Yeni bir performans testi eklemek için:

1. `lighthouserc.js` dosyasını güncelleyin:

```js
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/new-page', // Yeni sayfa ekleyin
      ],
      // ...
    },
    // ...
  },
};
```

## Test Çalıştırma

### Tüm Testleri Çalıştırma

```bash
npm test
```

### Birim Testleri Çalıştırma

```bash
npm test -- --testPathIgnorePatterns=integration a11y
```

### Entegrasyon Testleri Çalıştırma

```bash
npm run test:integration
```

### Erişilebilirlik Testleri Çalıştırma

```bash
npm run test:a11y
```

### Uçtan Uca Testleri Çalıştırma

```bash
npm run test:e2e
```

### Görsel Regresyon Testleri Çalıştırma

```bash
npm run test:visual
```

### Performans Testleri Çalıştırma

```bash
npm run test:performance
```

### Masaüstü Performans Testleri Çalıştırma

```bash
npm run test:performance:desktop
```

### Mobil Performans Testleri Çalıştırma

```bash
npm run test:performance:mobile
```

### Performans Bütçesi Testleri Çalıştırma

```bash
npm run test:performance:budget
```

### Test Raporları Oluşturma

```bash
npm run test:report
```

### Test Özeti Oluşturma

```bash
npm run test:summary
```

## Test Sonuçlarını Analiz Etme

### Jest Test Sonuçları

Jest test sonuçları, komut satırında görüntülenir. Ayrıca, HTML raporu oluşturmak için:

```bash
npm run test:report
```

HTML raporu, `test-report.html` dosyasında oluşturulur.

### Cypress Test Sonuçları

Cypress test sonuçları, Cypress Test Runner'da görüntülenir. Ayrıca, komut satırında çalıştırıldığında sonuçlar görüntülenir.

### Percy Test Sonuçları

Percy test sonuçları, Percy Dashboard'da görüntülenir. Percy Dashboard'a erişmek için:

```bash
npx percy dashboard
```

### Lighthouse Test Sonuçları

Lighthouse test sonuçları, komut satırında görüntülenir. Ayrıca, HTML raporu oluşturulur ve geçici bir URL'de görüntülenir.

## CI/CD Entegrasyonu

ALT_LAS UI projesi, GitHub Actions ile CI/CD entegrasyonuna sahiptir. CI/CD pipeline'ı, aşağıdaki işlemleri gerçekleştirir:

1. Kod linting
2. Birim ve entegrasyon testleri
3. Erişilebilirlik testleri
4. Yapı oluşturma
5. Performans testleri
6. Uçtan uca testler
7. Görsel regresyon testleri
8. Önizleme dağıtımı
9. Üretim dağıtımı

GitHub Actions workflow dosyası, `.github/workflows/ci.yml` dosyasında yer alır.

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

## Sık Sorulan Sorular

### Yeni bir bileşen için nasıl test yazarım?

Yeni bir bileşen için test yazmak için, bileşenin davranışını ve kullanıcı etkileşimlerini düşünün. Birim testleri, bileşenin render edildiğini, doğru props'ları aldığını ve kullanıcı etkileşimlerine doğru tepki verdiğini test etmelidir.

### Testleri nasıl daha hızlı çalıştırabilirim?

Testleri daha hızlı çalıştırmak için, test paralelleştirmeyi kullanabilirsiniz: `npm run test:parallel`. Ayrıca, testleri daha küçük parçalara bölebilir ve sadece değişen testleri çalıştırabilirsiniz.

### Erişilebilirlik testlerini nasıl geçebilirim?

Erişilebilirlik testlerini geçmek için, WCAG 2.1 AA standartlarına uygun bileşenler oluşturun. Form elemanları için etiketler kullanın, renk kontrastını yeterli yapın, klavye erişilebilirliğini sağlayın ve ARIA özelliklerini doğru kullanın.

### Performans testlerini nasıl geçebilirim?

Performans testlerini geçmek için, uygulamanın performans metriklerini iyileştirin. Gereksiz JavaScript'i azaltın, resimleri optimize edin, CSS'i minimize edin ve kritik render yolunu optimize edin.

### Görsel regresyon testlerini nasıl güncellerim?

Görsel regresyon testlerini güncellemek için, Percy Dashboard'da değişiklikleri onaylayın. Değişiklikler onaylandıktan sonra, yeni görsel baseline oluşturulur.
