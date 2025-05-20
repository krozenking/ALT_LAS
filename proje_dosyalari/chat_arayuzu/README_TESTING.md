# ALT_LAS Chat Arayüzü Test Dokümantasyonu

Bu doküman, ALT_LAS Chat Arayüzü projesinin test altyapısını ve test süreçlerini açıklar.

## İçindekiler

1. [Test Altyapısı](#test-altyapısı)
2. [Birim Testleri](#birim-testleri)
3. [Entegrasyon Testleri](#entegrasyon-testleri)
4. [E2E Testleri](#e2e-testleri)
5. [Statik Analiz](#statik-analiz)
6. [Docker ile Test](#docker-ile-test)
7. [Kubernetes ile Test](#kubernetes-ile-test)
8. [CI/CD Entegrasyonu](#cicd-entegrasyonu)

## Test Altyapısı

ALT_LAS Chat Arayüzü projesi, aşağıdaki test araçlarını kullanır:

- **Vitest**: Birim ve entegrasyon testleri için
- **Cypress**: E2E ve bileşen testleri için
- **ESLint**: Statik kod analizi için
- **TypeScript**: Tip kontrolü için
- **Docker**: İzole test ortamı için
- **Kubernetes**: Ölçeklenebilir test ortamı için

## Birim Testleri

Birim testleri, uygulamanın en küçük parçalarını (fonksiyonlar, bileşenler vb.) test eder.

### Birim Testlerini Çalıştırma

```bash
# Tüm birim testlerini çalıştır
npm run test:unit

# İzleme modunda birim testlerini çalıştır
npm run test:watch

# Kapsam raporu ile birim testlerini çalıştır
npm run test:coverage
```

### Birim Test Dosyaları

Birim test dosyaları, test edilen dosyanın yanında `__tests__` klasöründe veya doğrudan `*.test.ts(x)` uzantısıyla bulunur.

Örnek:
```
src/
  components/
    Chat/
      __tests__/
        ChatContainer.test.tsx
        MessageInput.test.tsx
        SettingsDrawer.test.tsx
  utils/
    __tests__/
      config.test.ts
```

## Entegrasyon Testleri

Entegrasyon testleri, birden fazla bileşenin veya modülün birlikte çalışmasını test eder.

### Entegrasyon Testlerini Çalıştırma

```bash
# Tüm entegrasyon testlerini çalıştır
npm run test

# Belirli bir entegrasyon testini çalıştır
npx vitest run src/components/Chat/__tests__/ChatContainer.test.tsx
```

## E2E Testleri

E2E (End-to-End) testleri, uygulamanın gerçek kullanıcı senaryolarını simüle ederek tam bir kullanıcı deneyimini test eder.

### E2E Testlerini Çalıştırma

```bash
# Tüm E2E testlerini çalıştır
npm run test:e2e

# E2E testlerini Cypress UI ile çalıştır
npm run test:e2e:open
```

### E2E Test Dosyaları

E2E test dosyaları `cypress/e2e` klasöründe bulunur ve `*.cy.ts` uzantısına sahiptir.

Örnek:
```
cypress/
  e2e/
    chat.cy.ts
    settings.cy.ts
    accessibility.cy.ts
```

## Statik Analiz

Statik analiz, kodu çalıştırmadan potansiyel hataları ve kod kalitesi sorunlarını tespit eder.

### Statik Analizi Çalıştırma

```bash
# ESLint ile statik analiz
npm run lint

# ESLint ile statik analiz ve otomatik düzeltme
npm run lint:fix

# TypeScript tip kontrolü
npx tsc --noEmit

# Tüm statik analizleri çalıştır
npm run test:static
```

## Docker ile Test

Docker, testleri izole bir ortamda çalıştırmak için kullanılır.

### Docker ile Testleri Çalıştırma

```bash
# Tüm testleri Docker ile çalıştır
npm run test:docker

# Birim testlerini izleme modunda Docker ile çalıştır
npm run test:docker:watch

# E2E testlerini Docker ile çalıştır
npm run test:docker:e2e

# Statik analizi Docker ile çalıştır
npm run test:docker:static

# Docker image'ını oluştur ve testleri çalıştır
powershell -File ./scripts/run-tests-docker.ps1 -BuildImage
```

## Kubernetes ile Test

Kubernetes, testleri ölçeklenebilir bir ortamda çalıştırmak için kullanılır.

### Kubernetes ile Testleri Çalıştırma

```bash
# Testleri Kubernetes ile çalıştır
npm run test:k8s

# Zamanlanmış testleri Kubernetes ile oluştur
npm run test:k8s:scheduled

# Özel parametrelerle Kubernetes testlerini çalıştır
powershell -File ./scripts/run-tests-k8s.ps1 -Namespace test -DockerRegistry my-registry -ImageTag v1.0.0 -BuildImage -PushImage
```

## CI/CD Entegrasyonu

Test altyapısı, CI/CD süreçlerine entegre edilebilir. Örnek bir CI/CD yapılandırması:

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run test:e2e
```

## Test Yazma Kuralları

1. Her bileşen için en az bir test dosyası oluşturun.
2. Kritik iş mantığı için kapsamlı testler yazın.
3. Kullanıcı etkileşimlerini simüle eden testler ekleyin.
4. Hata durumlarını test edin.
5. Testleri anlamlı şekilde gruplandırın ve adlandırın.
6. Test kapsamını düzenli olarak kontrol edin ve artırın.

## Kaynaklar

- [Vitest Dokümantasyonu](https://vitest.dev/)
- [Cypress Dokümantasyonu](https://docs.cypress.io/)
- [React Testing Library Dokümantasyonu](https://testing-library.com/docs/react-testing-library/intro/)
- [ESLint Dokümantasyonu](https://eslint.org/docs/user-guide/getting-started)
- [TypeScript Dokümantasyonu](https://www.typescriptlang.org/docs/)
