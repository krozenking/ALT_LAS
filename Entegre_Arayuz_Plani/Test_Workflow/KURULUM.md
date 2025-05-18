# ALT_LAS Arayüz Test Workflow Kurulum Talimatları

Bu doküman, ALT_LAS projesi arayüz geliştirme planının test edilebilir workflow'unun kurulumu ve kullanımı için detaylı talimatları içermektedir.

## Gereksinimler

- Node.js (v18.0.0 veya üzeri)
- npm (v8.0.0 veya üzeri)
- Git
- GitHub hesabı (CI/CD pipeline için)

## Kurulum Adımları

### 1. Prototip Kurulumu

```bash
# Prototip klasörüne git
cd prototip

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Geliştirme sunucusu başlatıldıktan sonra, prototip `http://localhost:3000` adresinde erişilebilir olacaktır.

### 2. CI/CD Pipeline Kurulumu

CI/CD pipeline, GitHub Actions kullanılarak otomatik olarak yapılandırılmıştır. Repository'yi fork'ladıktan veya kendi repository'nize klonladıktan sonra:

1. GitHub repository'nizin "Actions" sekmesine gidin
2. "I understand my workflows, go ahead and enable them" butonuna tıklayın
3. Workflow'lar otomatik olarak etkinleştirilecektir

### 3. Erişilebilirlik Test Suite Kurulumu

```bash
# Test klasörüne git
cd test

# Bağımlılıkları yükle
npm install

# Erişilebilirlik testlerini çalıştır
npm run test:a11y
```

### 4. Performans Ölçüm Araçları Kurulumu

```bash
# Performans test klasörüne git
cd performance

# Bağımlılıkları yükle
npm install

# Performans testlerini çalıştır
npm run test:performance
```

## Kullanım Senaryoları

### Senaryo 1: Komponent Geliştirme ve Test

1. `prototip/src/components` klasöründe yeni bir komponent oluşturun
2. Komponenti geliştirin ve `prototip/src/pages` altındaki bir sayfada kullanın
3. Komponent için test dosyasını `prototip/src/components/__tests__` klasöründe oluşturun
4. Testleri çalıştırın: `npm run test`
5. Erişilebilirlik testlerini çalıştırın: `npm run test:a11y`

### Senaryo 2: State Management Değişikliği Test Etme

1. `prototip/src/store` klasöründeki store dosyalarını düzenleyin
2. Değişiklikleri ilgili komponentlerde kullanın
3. Store testlerini çalıştırın: `npm run test:store`
4. Entegrasyon testlerini çalıştırın: `npm run test:integration`

### Senaryo 3: CI/CD Pipeline Test Etme

1. Değişikliklerinizi commit edin ve GitHub'a push yapın
2. GitHub repository'nizin "Actions" sekmesinden workflow'ların çalışmasını izleyin
3. Tüm testlerin başarıyla geçtiğinden emin olun
4. Otomatik deployment'ın gerçekleştiğini doğrulayın

## Sorun Giderme

### Yaygın Hatalar ve Çözümleri

1. **"Module not found" hatası**
   - Çözüm: `npm install` komutunu tekrar çalıştırın

2. **"Port 3000 is already in use" hatası**
   - Çözüm: `npx kill-port 3000` komutunu çalıştırın ve sunucuyu tekrar başlatın

3. **CI/CD pipeline hataları**
   - Çözüm: GitHub repository'nizin "Settings > Secrets" bölümünde gerekli secret'ların tanımlandığından emin olun

4. **Test hataları**
   - Çözüm: Test çıktılarını inceleyerek hataların nedenini belirleyin ve ilgili kodu düzeltin

## Destek

Herhangi bir sorunla karşılaşırsanız, lütfen GitHub repository'de bir issue açın veya proje yöneticisiyle iletişime geçin.
