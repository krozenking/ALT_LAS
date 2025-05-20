# ALT_LAS UI Test Otomasyon Altyapısı Dokümantasyon İndeksi

Bu indeks, ALT_LAS UI projesi için test otomasyon altyapısı ile ilgili tüm dokümantasyonu bir araya getirmektedir. Test otomasyon altyapısının kurulumu, kullanımı, bakımı ve geliştirilmesi ile ilgili bilgiler içermektedir.

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Kurulum ve Yapılandırma](#kurulum-ve-yapılandırma)
3. [Test Yazma Kılavuzları](#test-yazma-kılavuzları)
4. [Test Çalıştırma Kılavuzları](#test-çalıştırma-kılavuzları)
5. [Test Raporlama](#test-raporlama)
6. [Test Bakımı](#test-bakımı)
7. [Test Geliştirme](#test-geliştirme)
8. [Referans Dokümantasyonu](#referans-dokümantasyonu)
9. [Ek Kaynaklar](#ek-kaynaklar)

## Genel Bakış

### Test Otomasyon Altyapısı Genel Bakış

- [TEST_AUTOMATION_OVERVIEW.md](./TEST_AUTOMATION_OVERVIEW.md): Test otomasyon altyapısının genel bakışı
- [FINAL_TEST_AUTOMATION_REPORT.md](./FINAL_TEST_AUTOMATION_REPORT.md): Test otomasyon altyapısı final raporu
- [TEST_AUTOMATION_ENHANCEMENT_REPORT.md](./TEST_AUTOMATION_ENHANCEMENT_REPORT.md): Test otomasyon altyapısı iyileştirme raporu
- [FINAL_ENHANCEMENT_REPORT.md](./FINAL_ENHANCEMENT_REPORT.md): Test otomasyon altyapısı final iyileştirme raporu

## Kurulum ve Yapılandırma

### Test Otomasyon Altyapısı Kurulumu

- [TEST_AUTOMATION_SETUP.md](./prototip/TEST_AUTOMATION_SETUP.md): Test otomasyon altyapısı kurulum kılavuzu
- [jest.config.js](./prototip/jest.config.js): Jest yapılandırma dosyası
- [cypress.config.ts](./prototip/cypress.config.ts): Cypress yapılandırma dosyası
- [lighthouserc.js](./prototip/lighthouserc.js): Lighthouse CI yapılandırma dosyası
- [.github/workflows/ci.yml](./prototip/.github/workflows/ci.yml): GitHub Actions workflow dosyası

### Test Bağımlılıkları

- [package.json](./prototip/package.json): Test bağımlılıkları ve komutları

## Test Yazma Kılavuzları

### Birim Testleri

- [TEST_AUTOMATION_GUIDE.md](./prototip/TEST_AUTOMATION_GUIDE.md): Test otomasyon rehberi
- [src/utils/test-utils.tsx](./prototip/src/utils/test-utils.tsx): Test yardımcı fonksiyonları
- [src/utils/test-data.ts](./prototip/src/utils/test-data.ts): Test veri yönetimi yardımcı fonksiyonları

### Entegrasyon Testleri

- [src/__tests__/integration/README.md](./prototip/src/__tests__/integration/README.md): Entegrasyon testleri kılavuzu
- [src/__tests__/integration/textfield-form.test.tsx](./prototip/src/__tests__/integration/textfield-form.test.tsx): TextField entegrasyon testi örneği
- [src/__tests__/integration/dropdown-form.test.tsx](./prototip/src/__tests__/integration/dropdown-form.test.tsx): Dropdown entegrasyon testi örneği
- [src/__tests__/integration/checkbox-form.test.tsx](./prototip/src/__tests__/integration/checkbox-form.test.tsx): Checkbox entegrasyon testi örneği

### Erişilebilirlik Testleri

- [src/__tests__/a11y/README.md](./prototip/src/__tests__/a11y/README.md): Erişilebilirlik testleri kılavuzu
- [src/utils/a11y-test-utils.ts](./prototip/src/utils/a11y-test-utils.ts): Erişilebilirlik test yardımcı fonksiyonları
- [src/__tests__/a11y/comprehensive-a11y.test.tsx](./prototip/src/__tests__/a11y/comprehensive-a11y.test.tsx): Kapsamlı erişilebilirlik testi örneği
- [cypress/e2e/a11y.cy.ts](./prototip/cypress/e2e/a11y.cy.ts): Cypress erişilebilirlik testi örneği

### Uçtan Uca Testler

- [cypress/e2e/README.md](./prototip/cypress/e2e/README.md): Uçtan uca testler kılavuzu
- [cypress/e2e/login.cy.ts](./prototip/cypress/e2e/login.cy.ts): Login uçtan uca testi örneği
- [cypress/e2e/home.cy.ts](./prototip/cypress/e2e/home.cy.ts): Home uçtan uca testi örneği

### Görsel Regresyon Testleri

- [cypress/component/README.md](./prototip/cypress/component/README.md): Görsel regresyon testleri kılavuzu
- [cypress/component/Button.cy.tsx](./prototip/cypress/component/Button.cy.tsx): Button görsel regresyon testi örneği

### Performans Testleri

- [PERFORMANCE_TEST_REPORT_TEMPLATE.md](./prototip/PERFORMANCE_TEST_REPORT_TEMPLATE.md): Performans test raporu şablonu
- [lighthouse-budget.json](./prototip/lighthouse-budget.json): Lighthouse bütçe dosyası

## Test Çalıştırma Kılavuzları

### Test Komutları

- [TEST_AUTOMATION_USER_GUIDE.md](./TEST_AUTOMATION_USER_GUIDE.md): Test otomasyon altyapısı kullanım kılavuzu
- [package.json](./prototip/package.json): Test komutları

### CI/CD Entegrasyonu

- [.github/workflows/ci.yml](./prototip/.github/workflows/ci.yml): GitHub Actions workflow dosyası
- [CI_CD_INTEGRATION_GUIDE.md](./prototip/CI_CD_INTEGRATION_GUIDE.md): CI/CD entegrasyon kılavuzu

## Test Raporlama

### Test Raporları

- [jest.reporter.config.json](./prototip/jest.reporter.config.json): Jest HTML Reporter yapılandırması
- [jest-html-reporter-style.css](./prototip/jest-html-reporter-style.css): Jest HTML Reporter stil dosyası
- [TEST_REPORT_TEMPLATE.md](./prototip/TEST_REPORT_TEMPLATE.md): Test raporu şablonu

### Test Kapsama Raporları

- [TEST_COVERAGE_REPORT.md](./prototip/TEST_COVERAGE_REPORT.md): Test kapsama raporu

## Test Bakımı

### Test Bakım Kılavuzları

- [TEST_AUTOMATION_MAINTENANCE_GUIDE.md](./TEST_AUTOMATION_MAINTENANCE_GUIDE.md): Test otomasyon altyapısı bakım kılavuzu
- [TEST_QUALITY_CHECKLIST.md](./prototip/TEST_QUALITY_CHECKLIST.md): Test kalitesi kontrol listesi

### Sorun Giderme

- [TROUBLESHOOTING_GUIDE.md](./prototip/TROUBLESHOOTING_GUIDE.md): Sorun giderme kılavuzu

## Test Geliştirme

### Test Geliştirme Planları

- [TEST_AUTOMATION_IMPROVEMENT_PLAN.md](./TEST_AUTOMATION_IMPROVEMENT_PLAN.md): Test otomasyon altyapısı iyileştirme planı
- [TEST_AUTOMATION_ROADMAP.md](./TEST_AUTOMATION_ROADMAP.md): Test otomasyon altyapısı geliştirme yol haritası

### Test Stratejisi

- [TEST_STRATEGY.md](./prototip/TEST_STRATEGY.md): Test stratejisi
- [TEST_PLAN.md](./prototip/TEST_PLAN.md): Test planı

## Referans Dokümantasyonu

### Test Araçları

- [Jest Dokümantasyonu](https://jestjs.io/docs/getting-started)
- [React Testing Library Dokümantasyonu](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Dokümantasyonu](https://docs.cypress.io/)
- [Percy Dokümantasyonu](https://docs.percy.io/)
- [Lighthouse CI Dokümantasyonu](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md)

### Test Yardımcı Kütüphaneleri

- [jest-axe Dokümantasyonu](https://github.com/nickcolley/jest-axe)
- [cypress-axe Dokümantasyonu](https://github.com/component-driven/cypress-axe)
- [MSW Dokümantasyonu](https://mswjs.io/docs/)

## Ek Kaynaklar

### Eğitim Materyalleri

- [TEST_AUTOMATION_TRAINING.md](./prototip/TEST_AUTOMATION_TRAINING.md): Test otomasyon eğitim materyalleri
- [ACCESSIBILITY_TESTING_GUIDE.md](./prototip/ACCESSIBILITY_TESTING_GUIDE.md): Erişilebilirlik testi kılavuzu
- [PERFORMANCE_TESTING_GUIDE.md](./prototip/PERFORMANCE_TESTING_GUIDE.md): Performans testi kılavuzu

### Örnek Testler

- [src/components/__tests__/Button.test.tsx](./prototip/src/components/__tests__/Button.test.tsx): Button birim testi örneği
- [src/components/__tests__/TextField.test.tsx](./prototip/src/components/__tests__/TextField.test.tsx): TextField birim testi örneği
- [src/components/__tests__/Dropdown.test.tsx](./prototip/src/components/__tests__/Dropdown.test.tsx): Dropdown birim testi örneği
- [src/components/__tests__/Checkbox.test.tsx](./prototip/src/components/__tests__/Checkbox.test.tsx): Checkbox birim testi örneği
- [src/components/__tests__/LoginForm.test.tsx](./prototip/src/components/__tests__/LoginForm.test.tsx): LoginForm birim testi örneği
- [src/components/__tests__/Form.test.tsx](./prototip/src/components/__tests__/Form.test.tsx): Form birim testi örneği

### Şablonlar

- [src/__tests__/templates/unit-test-template.tsx](./prototip/src/__tests__/templates/unit-test-template.tsx): Birim testi şablonu
- [src/__tests__/templates/integration-test-template.tsx](./prototip/src/__tests__/templates/integration-test-template.tsx): Entegrasyon testi şablonu
- [src/__tests__/templates/a11y-test-template.tsx](./prototip/src/__tests__/templates/a11y-test-template.tsx): Erişilebilirlik testi şablonu
- [cypress/e2e/templates/e2e-test-template.cy.ts](./prototip/cypress/e2e/templates/e2e-test-template.cy.ts): Uçtan uca test şablonu
- [cypress/component/templates/visual-test-template.cy.tsx](./prototip/cypress/component/templates/visual-test-template.cy.tsx): Görsel regresyon testi şablonu
