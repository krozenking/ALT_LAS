# Test Otomasyonu En İyi Uygulamalar Rehberi

Bu rehber, ALT_LAS projesi için test otomasyonu konusunda en iyi uygulamaları içerir. Bu uygulamalar, test otomasyonunun etkinliğini ve sürdürülebilirliğini artırmak için tasarlanmıştır.

## 1. Genel Prensipler

### 1.1. Test Piramidi

Test piramidi, farklı test türlerinin ideal dağılımını gösterir:

- **Taban:** Birim Testleri (çok sayıda, hızlı, düşük maliyetli)
- **Orta:** Entegrasyon Testleri (orta sayıda, orta hızda, orta maliyetli)
- **Tepe:** E2E Testleri (az sayıda, yavaş, yüksek maliyetli)

Bu piramide uygun bir test dağılımı, test süitinin hızlı, güvenilir ve sürdürülebilir olmasını sağlar.

### 1.2. Test Edilebilirlik

- Kod, test edilebilirlik göz önünde bulundurularak tasarlanmalıdır
- Bağımlılıklar enjekte edilebilir olmalıdır
- Saf fonksiyonlar ve yan etkisiz kod tercih edilmelidir
- Karmaşık mantık küçük, test edilebilir parçalara bölünmelidir

### 1.3. Test Bağımsızlığı

- Her test, diğer testlerden bağımsız olarak çalışabilmelidir
- Testler arasında durum paylaşımı olmamalıdır
- Her test kendi test verilerini oluşturmalı ve temizlemelidir
- Testler herhangi bir sırada çalıştırılabilmelidir

### 1.4. Test Tekrarlanabilirliği

- Testler her çalıştırıldığında aynı sonucu vermelidir
- Dış bağımlılıklar (API'ler, veritabanları) mock'lanmalı veya kontrol edilmelidir
- Zaman, rastgelelik gibi değişken faktörler sabitlenmelidir
- Test ortamları izole ve tutarlı olmalıdır

## 2. Birim Testleri

### 2.1. Birim Test Yapısı

Her birim test dosyası şu yapıyı takip etmelidir:

```typescript
// Imports
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentToTest } from '../ComponentToTest';

describe('ComponentToTest', () => {
  // Test setup
  beforeEach(() => {
    // Setup code
  });

  afterEach(() => {
    // Cleanup code
    vi.clearAllMocks();
  });

  // Test cases
  it('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = ComponentToTest.doSomething(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

### 2.2. Mock Kullanımı

- Dış bağımlılıklar mock'lanmalıdır
- Mock'lar, gerçek bağımlılıkların davranışını simüle etmelidir
- Mock'lar, test başına yeniden oluşturulmalıdır
- Mock'lar, minimum düzeyde kullanılmalıdır

```typescript
// Mock örneği
vi.mock('../api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'test' })
}));
```

### 2.3. Test İsimlendirme

- Test isimleri açıklayıcı ve anlaşılır olmalıdır
- "should" veya "it" ile başlayan cümleler kullanılmalıdır
- Test ne test ettiğini, hangi koşullar altında ve beklenen sonucu içermelidir

```typescript
// İyi test isimlendirme örnekleri
it('should return user data when API call is successful', () => {});
it('should throw an error when API call fails', () => {});
it('should display loading indicator while fetching data', () => {});
```

## 3. E2E Testleri

### 3.1. E2E Test Yapısı

Her E2E test dosyası şu yapıyı takip etmelidir:

```typescript
// Cypress test örneği
describe('User Authentication', () => {
  beforeEach(() => {
    // Setup code
    cy.visit('/login');
  });

  it('should login successfully with valid credentials', () => {
    // Test steps
    cy.get('[data-testid="username"]').type('testuser');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    // Assertions
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome, Test User');
  });
});
```

### 3.2. Seçiciler

- Test ID'leri (data-testid) kullanılmalıdır
- CSS sınıfları veya ID'leri yerine veri öznitelikleri tercih edilmelidir
- XPath seçicileri son çare olarak kullanılmalıdır
- Seçiciler, UI değişikliklerine dayanıklı olmalıdır

```html
<!-- İyi seçici örneği -->
<button data-testid="submit-button">Submit</button>

<!-- Kötü seçici örneği -->
<button class="btn btn-primary">Submit</button>
```

### 3.3. Bekleme Stratejileri

- Sabit bekleme süreleri (cy.wait(1000)) kullanılmamalıdır
- Koşullu bekleme stratejileri kullanılmalıdır
- Elementlerin görünür, etkin veya var olmasını beklemek için uygun komutlar kullanılmalıdır

```typescript
// İyi bekleme stratejisi örneği
cy.get('[data-testid="submit-button"]').should('be.visible').click();
cy.get('[data-testid="success-message"]').should('be.visible');

// Kötü bekleme stratejisi örneği
cy.wait(1000);
cy.get('[data-testid="submit-button"]').click();
cy.wait(1000);
cy.get('[data-testid="success-message"]');
```

## 4. Test Veri Yönetimi

### 4.1. Test Veri Oluşturma

- Test verileri, test başına oluşturulmalıdır
- Test verileri, test senaryosuna özgü olmalıdır
- Test verileri, gerçekçi olmalıdır
- Factory veya builder desenleri kullanılmalıdır

```typescript
// Test veri factory örneği
const createUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  ...overrides
});

// Kullanım
const adminUser = createUser({ role: 'admin' });
```

### 4.2. Test Veri Temizleme

- Her test, kendi oluşturduğu verileri temizlemelidir
- Temizleme, afterEach veya after hook'larında yapılmalıdır
- Temizleme, test başarısız olsa bile çalışmalıdır

```typescript
// Test veri temizleme örneği
describe('User Management', () => {
  let createdUserId;

  afterEach(async () => {
    if (createdUserId) {
      await deleteUser(createdUserId);
      createdUserId = null;
    }
  });

  it('should create a new user', async () => {
    const response = await createUser({ name: 'New User' });
    createdUserId = response.id;
    expect(response.status).toBe(201);
  });
});
```

## 5. CI/CD Entegrasyonu

### 5.1. CI Pipeline Yapılandırması

- Her commit için birim testleri ve lint kontrolleri çalıştırılmalıdır
- Pull request'ler için entegrasyon ve E2E testleri çalıştırılmalıdır
- Test sonuçları ve kod kapsam raporları oluşturulmalıdır
- Test başarısızlıkları, pipeline'ı durdurmalıdır

### 5.2. Test Paralelleştirme

- Testler, CI ortamında paralelleştirilmelidir
- Test süitleri, dengeli bir şekilde bölünmelidir
- Test bağımlılıkları, paralelleştirmeyi engellememelidir
- Test sonuçları, tek bir raporda birleştirilmelidir

### 5.3. Test Raporlama

- Test sonuçları, okunabilir ve anlaşılır raporlar halinde sunulmalıdır
- Başarısız testler için detaylı hata mesajları ve ekran görüntüleri sağlanmalıdır
- Trend analizi ve metrikler oluşturulmalıdır
- Kod kapsam raporları oluşturulmalıdır

## 6. Test Bakımı

### 6.1. Test Refaktörleme

- Testler, kod tabanı ile birlikte refaktör edilmelidir
- Tekrarlanan test kodu, yardımcı fonksiyonlara çıkarılmalıdır
- Test kalitesi, kod kalitesi kadar önemlidir
- Testler, düzenli olarak gözden geçirilmelidir

### 6.2. Kırılgan Testler

- Kırılgan testler (flaky tests) tespit edilmeli ve düzeltilmelidir
- Kırılganlık nedenleri analiz edilmelidir
- Kırılgan testler, geçici olarak devre dışı bırakılabilir, ancak en kısa sürede düzeltilmelidir
- Kırılgan testlerin takibi için bir sistem oluşturulmalıdır

### 6.3. Test Dokümantasyonu

- Testler, kendi kendini dokümante etmelidir
- Karmaşık test senaryoları için ek dokümantasyon sağlanmalıdır
- Test stratejisi ve yaklaşımı dokümante edilmelidir
- Test araçları ve kullanımları dokümante edilmelidir

## 7. Kaynaklar

- [Vitest Dokümantasyonu](https://vitest.dev/)
- [Cypress Dokümantasyonu](https://docs.cypress.io/)
- [React Testing Library Dokümantasyonu](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Dokümantasyonu](https://jestjs.io/docs/getting-started)
- [Testing JavaScript (Kent C. Dodds)](https://testingjavascript.com/)

---

Hazırlayan: QA Mühendisi Ayşe Kaya
Tarih: 23.05.2025
Versiyon: 1.0
