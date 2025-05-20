# ALT_LAS Chat Botu Geliştirici Dokümantasyonu

Bu dokümantasyon, ALT_LAS Chat Botu arayüzünün geliştirilmesi, test edilmesi ve dağıtılması için gerekli bilgileri içerir.

## İçindekiler

1. [Geliştirme Ortamı](#geliştirme-ortamı)
2. [Proje Yapısı](#proje-yapısı)
3. [Bileşenler](#bileşenler)
4. [Hook'lar](#hooklar)
5. [Yardımcı Fonksiyonlar](#yardımcı-fonksiyonlar)
6. [Stil ve CSS](#stil-ve-css)
7. [Test](#test)
8. [Dağıtım](#dağıtım)
9. [Katkıda Bulunma](#katkıda-bulunma)

## Geliştirme Ortamı

### Gereksinimler

- Node.js 18 veya üzeri
- npm 9 veya üzeri
- Git

### Kurulum

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/krozenking/ALT_LAS.git
   cd ALT_LAS/proje_dosyalari/chat_arayuzu
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

4. Tarayıcınızda http://localhost:5173 adresine gidin.

### Ortam Değişkenleri

Uygulama, farklı ortamlar için farklı yapılandırma dosyaları kullanır:

- `.env.development`: Geliştirme ortamı
- `.env.test`: Test ortamı
- `.env.production`: Üretim ortamı

Ortam değişkenlerine `src/utils/config.ts` dosyası üzerinden erişilebilir:

```typescript
import { config } from '../utils/config';

// Örnek kullanım
const apiBaseUrl = config.api.baseUrl;
```

## Proje Yapısı

```
chat_arayuzu/
├── public/                  # Statik dosyalar
├── src/                     # Kaynak kodları
│   ├── components/          # React bileşenleri
│   │   ├── Chat/            # Sohbet bileşenleri
│   │   ├── Help/            # Yardım bileşenleri
│   │   ├── Keyboard/        # Klavye kısayolları bileşenleri
│   │   ├── Notifications/   # Bildirim bileşenleri
│   │   └── Theme/           # Tema bileşenleri
│   ├── hooks/               # Özel React hook'ları
│   ├── locales/             # Çeviri dosyaları
│   ├── services/            # API servisleri
│   ├── styles/              # CSS dosyaları
│   ├── tests/               # Test dosyaları
│   ├── types/               # TypeScript tip tanımları
│   ├── utils/               # Yardımcı fonksiyonlar
│   ├── App.tsx              # Ana uygulama bileşeni
│   └── main.tsx             # Uygulama giriş noktası
├── docs/                    # Dokümantasyon
├── scripts/                 # Dağıtım betikleri
├── .github/                 # GitHub Actions yapılandırması
├── cypress/                 # Cypress E2E testleri
├── .env                     # Ortam değişkenleri
└── README.md                # Proje dokümantasyonu
```

## Bileşenler

### Chat Bileşenleri

- `ChatContainer`: Ana sohbet konteyneri
- `MessageList`: Mesaj listesi
- `MessageItem`: Tek bir mesaj
- `MessageInput`: Mesaj giriş alanı
- `FileUploader`: Dosya yükleme bileşeni
- `VoiceRecorder`: Ses kayıt bileşeni
- `ConversationManager`: Konuşma yönetimi bileşeni

### Yardım Bileşenleri

- `HelpCenter`: Yardım merkezi
- `HelpButton`: Yardım düğmesi

### Klavye Kısayolları Bileşenleri

- `KeyboardShortcutsManager`: Klavye kısayolları yönetimi
- `KeyboardShortcutsButton`: Klavye kısayolları düğmesi

### Bildirim Bileşenleri

- `NotificationSystem`: Bildirim sistemi
- `NotificationButton`: Bildirim düğmesi
- `NotificationList`: Bildirim listesi
- `NotificationItem`: Tek bir bildirim

### Tema Bileşenleri

- `ThemeCustomizer`: Tema özelleştirici
- `ThemeButton`: Tema düğmesi

## Hook'lar

- `useTranslation`: Çeviri hook'u
- `useAccessibility`: Erişilebilirlik ayarları hook'u
- `useNotifications`: Bildirim sistemi hook'u
- `useThemeCustomization`: Tema özelleştirme hook'u
- `useKeyboardShortcuts`: Klavye kısayolları hook'u
- `useSkipLink`: Atlama bağlantısı hook'u
- `useFocusTrap`: Odak tuzağı hook'u
- `useA11yAnnounce`: Erişilebilirlik duyuruları hook'u
- `useAriaExpanded`: ARIA genişletilmiş durumu hook'u
- `useA11yKeyboardNav`: Erişilebilirlik klavye navigasyonu hook'u
- `useRenderCount`: Bileşen yeniden render'lama sayısını izleyen hook

## Yardımcı Fonksiyonlar

### Erişilebilirlik

- `initAccessibility`: Erişilebilirlik özelliklerini başlatan yardımcı fonksiyon
- `checkA11y`: Erişilebilirlik özelliklerini kontrol eden yardımcı fonksiyon

### Performans

- `reportWebVitals`: Web Vitals metriklerini izleyen yardımcı fonksiyon
- `measurePerformance`: Fonksiyon çalışma süresini ölçen yardımcı fonksiyon
- `debounce`: Debounce yardımcı fonksiyonu
- `throttle`: Throttle yardımcı fonksiyonu
- `lazyWithPreload`: Lazy loading için yardımcı fonksiyon
- `preloadImage`: Resim önbelleğe alma yardımcı fonksiyonu
- `CacheManager`: Önbellek yöneticisi sınıfı

### Güvenlik

- `escapeHtml`: XSS koruması için HTML escape yardımcı fonksiyonu
- `isSafeUrl`: Güvenli URL doğrulama yardımcı fonksiyonu
- `isSafeFileType`: Güvenli dosya tipi doğrulama yardımcı fonksiyonu
- `isSafeFileSize`: Güvenli dosya boyutu doğrulama yardımcı fonksiyonu
- `generateCsrfToken`: CSRF token oluşturma yardımcı fonksiyonu
- `validateCsrfToken`: CSRF token doğrulama yardımcı fonksiyonu
- `decodeJwt`: JWT token çözme yardımcı fonksiyonu
- `isJwtExpired`: JWT token doğrulama yardımcı fonksiyonu
- `SecureStorage`: Güvenli depolama sınıfı
- `generateSecureId`: Güvenli rastgele ID oluşturma yardımcı fonksiyonu
- `isStrongPassword`: Güvenli parola doğrulama yardımcı fonksiyonu
- `sanitizeInput`: Güvenli input doğrulama yardımcı fonksiyonu
- `reportCspViolation`: Content Security Policy ihlallerini raporlama yardımcı fonksiyonu

### Yapılandırma

- `config`: Uygulama yapılandırması
- `getEnvString`: Ortam değişkenini string olarak al
- `getEnvNumber`: Ortam değişkenini number olarak al
- `getEnvBoolean`: Ortam değişkenini boolean olarak al
- `getEnvArray`: Ortam değişkenini string dizisi olarak al

## Stil ve CSS

### CSS Değişkenleri

- `--color-primary`: Ana renk
- `--color-secondary`: İkincil renk
- `--color-accent`: Vurgu rengi
- `--color-bg`: Arka plan rengi
- `--color-text`: Metin rengi
- `--font-size-base`: Temel yazı boyutu
- `--font-family`: Yazı tipi ailesi
- `--border-radius`: Kenar yuvarlaklığı
- `--spacing-multiplier`: Boşluk çarpanı

### CSS Sınıfları

- `.high-contrast`: Yüksek kontrast modu
- `.reduce-motion`: Hareketi azaltma modu
- `.screen-reader-mode`: Ekran okuyucu modu
- `.font-size-sm`: Küçük yazı boyutu
- `.font-size-md`: Orta yazı boyutu
- `.font-size-lg`: Büyük yazı boyutu

## Test

### Birim Testleri

Birim testleri için Vitest kullanılmaktadır:

```bash
# Tüm testleri çalıştır
npm test

# Testleri izleme modunda çalıştır
npm run test:watch

# Test kapsamını görüntüle
npm run test:coverage
```

### E2E Testleri

E2E testleri için Cypress kullanılmaktadır:

```bash
# E2E testleri çalıştır
npm run test:e2e

# Cypress'i açık modda çalıştır
npm run test:e2e:open
```

### Tüm Testleri Çalıştırma

```bash
npm run test:ci
```

## Dağıtım

### Docker ile Dağıtım

```bash
# Linux/macOS
./scripts/deploy.sh --environment production --tag v1.0.0 --build

# Windows
.\scripts\deploy.ps1 -Environment production -Tag v1.0.0 -Build
```

### CI/CD

GitHub Actions ile CI/CD yapılandırması:

- `ci.yml`: Sürekli entegrasyon (lint, test, build)
- `cd.yml`: Sürekli dağıtım (development, test, production)

## Katkıda Bulunma

1. Depoyu fork'layın
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push'layın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

### Kod Standartları

- ESLint ve Prettier kullanılmaktadır
- Husky ve lint-staged ile commit öncesi kontroller yapılmaktadır
- TypeScript tip güvenliği sağlanmalıdır
- Testler yazılmalıdır
- Erişilebilirlik standartlarına uyulmalıdır
