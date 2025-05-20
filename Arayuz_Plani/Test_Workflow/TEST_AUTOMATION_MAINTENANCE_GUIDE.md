# ALT_LAS UI Test Otomasyon Altyapısı Bakım Kılavuzu

Bu kılavuz, ALT_LAS UI projesi için test otomasyon altyapısının nasıl bakımının yapılacağını açıklamaktadır. Test altyapısının güncel tutulması, test bağımlılıklarının yönetilmesi ve test performansının optimize edilmesi konularında rehberlik sağlamaktadır.

## İçindekiler

1. [Düzenli Bakım Görevleri](#düzenli-bakım-görevleri)
2. [Bağımlılık Yönetimi](#bağımlılık-yönetimi)
3. [Test Performansı Optimizasyonu](#test-performansı-optimizasyonu)
4. [Test Kapsamı İzleme](#test-kapsamı-i̇zleme)
5. [Test Kalitesi Değerlendirme](#test-kalitesi-değerlendirme)
6. [Test Altyapısı Güncellemeleri](#test-altyapısı-güncellemeleri)
7. [Sorun Giderme ve Hata Ayıklama](#sorun-giderme-ve-hata-ayıklama)
8. [En İyi Uygulamalar](#en-i̇yi-uygulamalar)

## Düzenli Bakım Görevleri

### Haftalık Bakım

1. **Kırık Testleri Düzeltme**: Kırık testleri tespit edin ve düzeltin.
   ```bash
   npm test -- --watchAll=false
   ```

2. **Snapshot Testlerini Güncelleme**: Snapshot testlerini güncelleyin.
   ```bash
   npm test -- -u
   ```

3. **Test Kapsamını Kontrol Etme**: Test kapsamını kontrol edin ve eksik testleri tespit edin.
   ```bash
   npm run test:coverage
   ```

### Aylık Bakım

1. **Bağımlılıkları Güncelleme**: Test bağımlılıklarını güncelleyin.
   ```bash
   npm outdated
   npm update
   ```

2. **Test Performansını Analiz Etme**: Test performansını analiz edin ve optimize edin.
   ```bash
   npm run test:ci -- --logHeapUsage
   ```

3. **Test Kalitesini Değerlendirme**: Test kalitesini değerlendirin ve iyileştirin.
   ```bash
   npm run test:report
   ```

### Üç Aylık Bakım

1. **Test Stratejisini Gözden Geçirme**: Test stratejisini gözden geçirin ve güncelleyin.
2. **Test Altyapısını Yeniden Yapılandırma**: Test altyapısını yeniden yapılandırın ve optimize edin.
3. **Test Dokümantasyonunu Güncelleme**: Test dokümantasyonunu güncelleyin.

## Bağımlılık Yönetimi

### Bağımlılıkları Güncelleme

Test bağımlılıklarını güncel tutmak önemlidir. Bağımlılıkları güncellemek için:

1. Mevcut bağımlılıkları kontrol edin:
   ```bash
   npm outdated
   ```

2. Bağımlılıkları güncelleyin:
   ```bash
   npm update
   ```

3. Büyük sürüm güncellemeleri için:
   ```bash
   npm install package-name@latest
   ```

4. Güncellemelerden sonra testleri çalıştırın:
   ```bash
   npm test -- --watchAll=false
   ```

### Bağımlılık Çakışmalarını Çözme

Bağımlılık çakışmalarını çözmek için:

1. Bağımlılık ağacını görüntüleyin:
   ```bash
   npm ls package-name
   ```

2. Çakışan bağımlılıkları çözün:
   ```bash
   npm dedupe
   ```

3. Gerekirse, bağımlılıkları manuel olarak güncelleyin:
   ```bash
   npm install package-name@specific-version
   ```

## Test Performansı Optimizasyonu

### Test Çalıştırma Süresini Azaltma

Test çalıştırma süresini azaltmak için:

1. Testleri paralel olarak çalıştırın:
   ```bash
   npm run test:parallel
   ```

2. Test dosyalarını daha küçük parçalara bölün:
   ```
   // Büyük test dosyası
   component.test.tsx

   // Daha küçük parçalara bölünmüş
   component.render.test.tsx
   component.interaction.test.tsx
   component.props.test.tsx
   ```

3. Jest yapılandırmasını optimize edin:
   ```js
   // jest.config.js
   module.exports = {
     // ...
     maxWorkers: '50%',
     bail: 1,
     testTimeout: 10000,
   };
   ```

### Bellek Kullanımını Optimize Etme

Bellek kullanımını optimize etmek için:

1. Bellek kullanımını analiz edin:
   ```bash
   npm run test:ci -- --logHeapUsage
   ```

2. Bellek sızıntılarını tespit edin ve düzeltin:
   ```tsx
   // Bellek sızıntısı
   useEffect(() => {
     const interval = setInterval(() => {
       // ...
     }, 1000);
     // Temizleme fonksiyonu eksik
   }, []);

   // Düzeltilmiş
   useEffect(() => {
     const interval = setInterval(() => {
       // ...
     }, 1000);
     return () => clearInterval(interval);
   }, []);
   ```

3. Test ortamını her testten sonra temizleyin:
   ```tsx
   afterEach(() => {
     cleanup();
   });
   ```

## Test Kapsamı İzleme

### Test Kapsamını Analiz Etme

Test kapsamını analiz etmek için:

1. Test kapsamı raporu oluşturun:
   ```bash
   npm run test:coverage
   ```

2. HTML raporu açın:
   ```
   coverage/lcov-report/index.html
   ```

3. Eksik test kapsamını tespit edin:
   ```
   Dosya                      | % Satır | % Dal | % Fonksiyon | % İfade
   ---------------------------|---------|-------|-------------|--------
   src/components/Button.tsx  | 80.00   | 75.00 | 85.71       | 80.00
   ```

### Test Kapsamını Artırma

Test kapsamını artırmak için:

1. Eksik test kapsamını tespit edin:
   ```bash
   npm run test:coverage -- --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
   ```

2. Eksik testleri ekleyin:
   ```tsx
   // Eksik test
   test('handles click events correctly', () => {
     const handleClick = jest.fn();
     render(<Button onClick={handleClick}>Click me</Button>);
     fireEvent.click(screen.getByRole('button'));
     expect(handleClick).toHaveBeenCalledTimes(1);
   });
   ```

3. Sınır durumlarını test edin:
   ```tsx
   test('does not trigger click when disabled', () => {
     const handleClick = jest.fn();
     render(<Button onClick={handleClick} disabled>Click me</Button>);
     fireEvent.click(screen.getByRole('button'));
     expect(handleClick).not.toHaveBeenCalled();
   });
   ```

## Test Kalitesi Değerlendirme

### Test Kalitesini Analiz Etme

Test kalitesini analiz etmek için:

1. Test kalitesi kontrol listesini kullanın:
   ```
   Arayuz_Plani\Test_Workflow\prototip\TEST_QUALITY_CHECKLIST.md
   ```

2. Test raporlarını inceleyin:
   ```bash
   npm run test:report
   ```

3. Test başarısızlıklarını analiz edin:
   ```bash
   npm test -- --verbose
   ```

### Test Kalitesini İyileştirme

Test kalitesini iyileştirmek için:

1. Test isimlerini açıklayıcı yapın:
   ```tsx
   // Kötü
   test('button', () => {
     // ...
   });

   // İyi
   test('renders button with correct text and applies primary variant styles', () => {
     // ...
   });
   ```

2. Test düzenini iyileştirin:
   ```tsx
   // Düzenli test
   describe('Button Component', () => {
     describe('Rendering', () => {
       test('renders with default props', () => {
         // ...
       });
     });

     describe('Interactions', () => {
       test('handles click events', () => {
         // ...
       });
     });
   });
   ```

3. Test veri yönetimini iyileştirin:
   ```tsx
   // Test verileri için yardımcı fonksiyonlar kullanın
   import { createValidFormData } from '../../utils/test-data';

   test('submits form with valid data', () => {
     const formData = createValidFormData();
     // ...
   });
   ```

## Test Altyapısı Güncellemeleri

### Jest Yapılandırmasını Güncelleme

Jest yapılandırmasını güncellemek için:

1. `jest.config.js` dosyasını açın:
   ```js
   // jest.config.js
   module.exports = {
     // ...
   };
   ```

2. Yapılandırmayı güncelleyin:
   ```js
   // jest.config.js
   module.exports = {
     // ...
     testTimeout: 10000, // Test zaman aşımını artırın
     maxWorkers: '50%', // CPU kullanımını optimize edin
     // ...
   };
   ```

3. Değişiklikleri test edin:
   ```bash
   npm test -- --watchAll=false
   ```

### Cypress Yapılandırmasını Güncelleme

Cypress yapılandırmasını güncellemek için:

1. `cypress.config.ts` dosyasını açın:
   ```ts
   // cypress.config.ts
   import { defineConfig } from 'cypress';

   export default defineConfig({
     // ...
   });
   ```

2. Yapılandırmayı güncelleyin:
   ```ts
   // cypress.config.ts
   import { defineConfig } from 'cypress';

   export default defineConfig({
     // ...
     viewportWidth: 1280, // Görüntü alanı genişliğini güncelleyin
     viewportHeight: 720, // Görüntü alanı yüksekliğini güncelleyin
     // ...
   });
   ```

3. Değişiklikleri test edin:
   ```bash
   npm run cypress
   ```

### Lighthouse CI Yapılandırmasını Güncelleme

Lighthouse CI yapılandırmasını güncellemek için:

1. `lighthouserc.js` dosyasını açın:
   ```js
   // lighthouserc.js
   module.exports = {
     ci: {
       // ...
     },
   };
   ```

2. Yapılandırmayı güncelleyin:
   ```js
   // lighthouserc.js
   module.exports = {
     ci: {
       collect: {
         // ...
         numberOfRuns: 5, // Çalıştırma sayısını artırın
         // ...
       },
       // ...
     },
   };
   ```

3. Değişiklikleri test edin:
   ```bash
   npm run test:performance
   ```

## Sorun Giderme ve Hata Ayıklama

### Yaygın Sorunlar ve Çözümleri

1. **Jest Zaman Aşımı Hataları**:
   ```
   Çözüm: Test zaman aşımını artırın
   jest.setTimeout(10000);
   ```

2. **Cypress Bağlantı Hataları**:
   ```
   Çözüm: Bekleme süresini artırın
   cy.visit('/login', { timeout: 10000 });
   ```

3. **Lighthouse CI Hataları**:
   ```
   Çözüm: Lighthouse CI yapılandırmasını güncelleyin
   module.exports = {
     ci: {
       collect: {
         startServerCommand: 'npm run start',
         // ...
       },
       // ...
     },
   };
   ```

### Hata Ayıklama Teknikleri

1. **Jest Testleri için Hata Ayıklama**:
   ```tsx
   // console.log kullanarak hata ayıklama
   test('debug example', () => {
     console.log('Debug info');
     // ...
   });

   // screen.debug() kullanarak hata ayıklama
   test('debug rendered output', () => {
     render(<Button>Click me</Button>);
     screen.debug();
     // ...
   });
   ```

2. **Cypress Testleri için Hata Ayıklama**:
   ```tsx
   // cy.pause() kullanarak hata ayıklama
   it('debug example', () => {
     cy.visit('/login');
     cy.pause();
     // ...
   });

   // cy.debug() kullanarak hata ayıklama
   it('debug commands', () => {
     cy.visit('/login');
     cy.debug();
     // ...
   });
   ```

3. **Lighthouse CI için Hata Ayıklama**:
   ```bash
   # Verbose mod ile çalıştırma
   npm run test:performance -- --verbose
   ```

## En İyi Uygulamalar

### Test Kodu Kalitesi

1. **DRY (Don't Repeat Yourself) İlkesi**: Test kodunda tekrarı önleyin.
   ```tsx
   // Tekrarlanan kod
   test('test 1', () => {
     render(<Button>Click me</Button>);
     // ...
   });

   test('test 2', () => {
     render(<Button>Click me</Button>);
     // ...
   });

   // DRY yaklaşımı
   beforeEach(() => {
     render(<Button>Click me</Button>);
   });

   test('test 1', () => {
     // ...
   });

   test('test 2', () => {
     // ...
   });
   ```

2. **Açıklayıcı Test İsimleri**: Test isimlerini açıklayıcı yapın.
   ```tsx
   // Kötü
   test('button test', () => {
     // ...
   });

   // İyi
   test('renders button with primary variant and applies correct styles', () => {
     // ...
   });
   ```

3. **Test İzolasyonu**: Testleri birbirinden izole edin.
   ```tsx
   // Her testten sonra temizleme yapın
   afterEach(() => {
     cleanup();
   });
   ```

### Test Bakımı

1. **Düzenli Refactoring**: Test kodunu düzenli olarak refactor edin.
2. **Test Dokümantasyonu**: Test kodunu dokümante edin.
3. **Test Kalitesi Kontrolleri**: Düzenli olarak test kalitesini kontrol edin.

### Test Otomasyonu

1. **CI/CD Entegrasyonu**: Testleri CI/CD pipeline'ına entegre edin.
2. **Otomatik Test Raporlama**: Test sonuçlarını otomatik olarak raporlayın.
3. **Test Kapsamı İzleme**: Test kapsamını düzenli olarak izleyin.
