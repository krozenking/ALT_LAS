# ALT_LAS Chat Botu Proje Yapısı

Bu dokümantasyon, ALT_LAS Chat Botu projesinin yapısını ve organizasyonunu açıklar.

## Dizin Yapısı

```
chat_arayuzu/
├── public/                  # Statik dosyalar
│   ├── favicon.ico          # Favicon
│   ├── index.html           # HTML şablonu
│   └── assets/              # Statik varlıklar (görseller, fontlar, vb.)
├── src/                     # Kaynak kodları
│   ├── components/          # React bileşenleri
│   │   ├── Chat/            # Sohbet bileşenleri
│   │   │   ├── ChatContainer.tsx       # Ana sohbet konteyneri
│   │   │   ├── MessageList.tsx         # Mesaj listesi
│   │   │   ├── MessageItem.tsx         # Tek bir mesaj
│   │   │   ├── MessageInput.tsx        # Mesaj giriş alanı
│   │   │   ├── FileUploader.tsx        # Dosya yükleme bileşeni
│   │   │   ├── VoiceRecorder.tsx       # Ses kayıt bileşeni
│   │   │   ├── ConversationManager.tsx # Konuşma yönetimi bileşeni
│   │   │   ├── LanguageSelector.tsx    # Dil seçimi bileşeni
│   │   │   └── AccessibilityMenu.tsx   # Erişilebilirlik ayarları bileşeni
│   │   ├── Help/            # Yardım bileşenleri
│   │   │   ├── HelpCenter.tsx          # Yardım merkezi
│   │   │   └── HelpButton.tsx          # Yardım düğmesi
│   │   ├── Keyboard/        # Klavye kısayolları bileşenleri
│   │   │   ├── KeyboardShortcutsManager.tsx # Klavye kısayolları yönetimi
│   │   │   └── KeyboardShortcutsButton.tsx # Klavye kısayolları düğmesi
│   │   ├── Notifications/   # Bildirim bileşenleri
│   │   │   ├── NotificationSystem.tsx  # Bildirim sistemi
│   │   │   ├── NotificationButton.tsx  # Bildirim düğmesi
│   │   │   ├── NotificationList.tsx    # Bildirim listesi
│   │   │   └── NotificationItem.tsx    # Tek bir bildirim
│   │   └── Theme/           # Tema bileşenleri
│   │       ├── ThemeCustomizer.tsx     # Tema özelleştirici
│   │       └── ThemeButton.tsx         # Tema düğmesi
│   ├── hooks/               # Özel React hook'ları
│   │   ├── useTranslation.ts           # Çeviri hook'u
│   │   ├── useAccessibility.ts         # Erişilebilirlik ayarları hook'u
│   │   ├── useNotifications.ts         # Bildirim sistemi hook'u
│   │   ├── useThemeCustomization.ts    # Tema özelleştirme hook'u
│   │   ├── useKeyboardShortcuts.ts     # Klavye kısayolları hook'u
│   │   ├── useSkipLink.ts              # Atlama bağlantısı hook'u
│   │   ├── useFocusTrap.ts             # Odak tuzağı hook'u
│   │   ├── useA11yAnnounce.ts          # Erişilebilirlik duyuruları hook'u
│   │   ├── useAriaExpanded.ts          # ARIA genişletilmiş durumu hook'u
│   │   └── useA11yKeyboardNav.ts       # Erişilebilirlik klavye navigasyonu hook'u
│   ├── locales/             # Çeviri dosyaları
│   │   ├── tr.json                     # Türkçe çeviriler
│   │   └── en.json                     # İngilizce çeviriler
│   ├── services/            # API servisleri
│   │   ├── api.service.ts              # API istemcisi
│   │   ├── auth.service.ts             # Kimlik doğrulama servisi
│   │   ├── chat.service.ts             # Sohbet servisi
│   │   ├── file.service.ts             # Dosya servisi
│   │   ├── notification.service.ts     # Bildirim servisi
│   │   └── ai.service.ts               # AI servisi
│   ├── styles/              # CSS dosyaları
│   │   ├── accessibility.css           # Erişilebilirlik stilleri
│   │   └── theme.css                   # Tema stilleri
│   ├── tests/               # Test dosyaları
│   │   ├── setup.ts                    # Test kurulumu
│   │   ├── mocks/                      # Test mock'ları
│   │   └── __tests__/                  # Test dosyaları
│   ├── types/               # TypeScript tip tanımları
│   │   ├── index.ts                    # Tip dışa aktarımları
│   │   ├── message.ts                  # Mesaj tipleri
│   │   ├── user.ts                     # Kullanıcı tipleri
│   │   ├── conversation.ts             # Konuşma tipleri
│   │   ├── notification.ts             # Bildirim tipleri
│   │   ├── theme.ts                    # Tema tipleri
│   │   └── keyboard.ts                 # Klavye kısayolları tipleri
│   ├── utils/               # Yardımcı fonksiyonlar
│   │   ├── accessibility.ts            # Erişilebilirlik yardımcıları
│   │   ├── config.ts                   # Yapılandırma yardımcıları
│   │   ├── date.ts                     # Tarih yardımcıları
│   │   ├── file.ts                     # Dosya yardımcıları
│   │   ├── format.ts                   # Biçimlendirme yardımcıları
│   │   ├── performance.ts              # Performans yardımcıları
│   │   ├── security.ts                 # Güvenlik yardımcıları
│   │   ├── storage.ts                  # Depolama yardımcıları
│   │   └── validation.ts               # Doğrulama yardımcıları
│   ├── App.tsx              # Ana uygulama bileşeni
│   └── main.tsx             # Uygulama giriş noktası
├── docs/                    # Dokümantasyon
│   ├── API.md                          # API dokümantasyonu
│   ├── DEVELOPMENT.md                  # Geliştirici dokümantasyonu
│   ├── USER_GUIDE.md                   # Kullanıcı kılavuzu
│   ├── ACCESSIBILITY.md                # Erişilebilirlik dokümantasyonu
│   ├── CHANGELOG.md                    # Sürüm notları
│   └── PROJECT_STRUCTURE.md            # Proje yapısı dokümantasyonu
├── scripts/                 # Dağıtım betikleri
│   ├── deploy.sh                       # Linux/macOS dağıtım betiği
│   └── deploy.ps1                      # Windows dağıtım betiği
├── .github/                 # GitHub yapılandırması
│   └── workflows/                      # GitHub Actions iş akışları
│       ├── ci.yml                      # CI iş akışı
│       └── cd.yml                      # CD iş akışı
├── cypress/                 # Cypress E2E testleri
│   ├── e2e/                            # E2E test dosyaları
│   └── support/                        # Cypress destek dosyaları
├── .env                     # Ortam değişkenleri
├── .env.development         # Geliştirme ortamı değişkenleri
├── .env.test                # Test ortamı değişkenleri
├── .env.production          # Üretim ortamı değişkenleri
├── .eslintrc.js             # ESLint yapılandırması
├── .prettierrc              # Prettier yapılandırması
├── .gitignore               # Git yoksayma dosyası
├── tsconfig.json            # TypeScript yapılandırması
├── vite.config.ts           # Vite yapılandırması
├── vitest.config.ts         # Vitest yapılandırması
├── cypress.config.ts        # Cypress yapılandırması
├── jest.config.js           # Jest yapılandırması
├── docker-compose.yml       # Docker Compose yapılandırması
├── Dockerfile               # Docker yapılandırması
├── nginx.conf               # Nginx yapılandırması
├── package.json             # Proje bağımlılıkları
├── LICENSE                  # Lisans dosyası
├── CODE_OF_CONDUCT.md       # Davranış kuralları
├── CONTRIBUTING.md          # Katkıda bulunma kılavuzu
├── SECURITY.md              # Güvenlik politikası
└── README.md                # Proje dokümantasyonu
```

## Bileşen Hiyerarşisi

```
App
├── NotificationProvider
│   └── NotificationSystem
├── ChakraProvider
│   └── AppContent
│       ├── Header
│       │   ├── LanguageSelector
│       │   ├── NotificationButton
│       │   │   └── NotificationList
│       │   │       └── NotificationItem
│       │   ├── HelpButton
│       │   │   └── HelpCenter
│       │   ├── KeyboardShortcutsButton
│       │   │   └── KeyboardShortcutsManager
│       │   ├── ThemeButton
│       │   │   └── ThemeCustomizer
│       │   ├── AccessibilityMenu
│       │   └── ColorModeToggle
│       └── ChatContainer
│           ├── ConversationManager
│           ├── MessageList
│           │   └── MessageItem
│           └── MessageInput
│               ├── FileUploader
│               └── VoiceRecorder
```

## Veri Akışı

1. **Kullanıcı Girişi**:
   - Kullanıcı, `MessageInput` bileşeni aracılığıyla metin girer, dosya yükler veya ses kaydeder.
   - Giriş, `ChatContainer` bileşenine iletilir.

2. **API İletişimi**:
   - `ChatContainer`, ilgili servisi (`chat.service.ts`, `file.service.ts`, vb.) kullanarak API ile iletişim kurar.
   - API yanıtı, `ChatContainer` tarafından alınır.

3. **Durum Güncelleme**:
   - `ChatContainer`, yeni mesajı duruma ekler.
   - Durum güncellemesi, `MessageList` ve `MessageItem` bileşenlerine yansır.

4. **Bildirimler**:
   - Yeni mesajlar veya sistem olayları, `NotificationSystem` aracılığıyla bildirim oluşturur.
   - Bildirimler, `NotificationButton` ve `NotificationList` bileşenleri aracılığıyla görüntülenir.

5. **Ayarlar ve Tercihler**:
   - Kullanıcı tercihleri (`LanguageSelector`, `ThemeCustomizer`, `AccessibilityMenu`, vb.) ilgili hook'lar aracılığıyla yönetilir.
   - Tercihler, yerel depolamada saklanır ve uygulama genelinde uygulanır.

## Önemli Dosyalar ve Sorumlulukları

### Ana Bileşenler

- **App.tsx**: Uygulama kök bileşeni, genel yapıyı ve sağlayıcıları ayarlar.
- **ChatContainer.tsx**: Sohbet işlevselliğinin ana konteyneri, mesaj listesi ve giriş alanını yönetir.
- **MessageList.tsx**: Mesajları görüntüler ve kaydırma davranışını yönetir.
- **MessageItem.tsx**: Tek bir mesajı görüntüler, dosya ve ses içeriğini işler.
- **MessageInput.tsx**: Kullanıcı girişini alır, metin, dosya ve ses girişini yönetir.

### Hook'lar

- **useTranslation.ts**: Çeviri işlevselliği sağlar, dil değiştirmeyi yönetir.
- **useAccessibility.ts**: Erişilebilirlik ayarlarını yönetir.
- **useNotifications.ts**: Bildirim sistemini yönetir.
- **useThemeCustomization.ts**: Tema özelleştirmeyi yönetir.
- **useKeyboardShortcuts.ts**: Klavye kısayollarını yönetir.

### Servisler

- **api.service.ts**: API isteklerini yönetir, hata işleme ve yeniden deneme mantığı sağlar.
- **auth.service.ts**: Kimlik doğrulama ve yetkilendirme işlemlerini yönetir.
- **chat.service.ts**: Sohbet ve mesaj işlemlerini yönetir.
- **file.service.ts**: Dosya yükleme ve indirme işlemlerini yönetir.
- **notification.service.ts**: Bildirim işlemlerini yönetir.
- **ai.service.ts**: AI modelleri ve yanıt üretme işlemlerini yönetir.

### Yardımcı Fonksiyonlar

- **accessibility.ts**: Erişilebilirlik yardımcı fonksiyonları.
- **config.ts**: Yapılandırma yardımcı fonksiyonları, ortam değişkenlerine erişim sağlar.
- **security.ts**: Güvenlik yardımcı fonksiyonları, XSS koruması, güvenli depolama, vb.
- **performance.ts**: Performans yardımcı fonksiyonları, debounce, throttle, önbelleğe alma, vb.

## Teknoloji Yığını

- **Dil**: TypeScript
- **Framework**: React
- **UI Kütüphanesi**: Chakra UI
- **Durum Yönetimi**: React Context API
- **Yönlendirme**: React Router
- **API İstemcisi**: Axios
- **Yapı Aracı**: Vite
- **Test**: Vitest, React Testing Library, Cypress
- **Linting ve Biçimlendirme**: ESLint, Prettier
- **CI/CD**: GitHub Actions
- **Konteynerleştirme**: Docker, Docker Compose
- **Web Sunucusu**: Nginx

## Mimari Kararlar

1. **Bileşen Tabanlı Mimari**:
   - Uygulamanın her bir parçası, yeniden kullanılabilir ve test edilebilir bileşenler olarak tasarlanmıştır.
   - Bileşenler, tek bir sorumluluğa sahip olacak şekilde tasarlanmıştır.

2. **Hook Tabanlı Durum Yönetimi**:
   - Durum yönetimi için özel hook'lar kullanılmıştır.
   - Karmaşık durum yönetimi için React Context API kullanılmıştır.

3. **Servis Tabanlı API İletişimi**:
   - API iletişimi, servis modülleri aracılığıyla soyutlanmıştır.
   - Her servis, belirli bir API alanını yönetir.

4. **Erişilebilirlik Öncelikli Tasarım**:
   - Tüm bileşenler, erişilebilirlik standartlarına uygun olarak tasarlanmıştır.
   - ARIA öznitelikleri, klavye navigasyonu ve ekran okuyucu desteği sağlanmıştır.

5. **Çok Dilli Destek**:
   - Çeviri dosyaları ve çeviri hook'u aracılığıyla çok dilli destek sağlanmıştır.
   - Dinamik dil değiştirme desteklenmektedir.

6. **Tema ve Özelleştirme**:
   - Tema özelleştirme, CSS değişkenleri ve Chakra UI tema sistemi aracılığıyla sağlanmıştır.
   - Kullanıcı tercihleri yerel depolamada saklanmaktadır.

7. **Performans Optimizasyonu**:
   - Gereksiz yeniden render'lamaları önlemek için memoizasyon kullanılmıştır.
   - Büyük bileşenler için lazy loading uygulanmıştır.
   - Performans yardımcı fonksiyonları (debounce, throttle, önbelleğe alma) kullanılmıştır.

8. **Güvenlik Önlemleri**:
   - XSS koruması için HTML escape ve güvenli işleme uygulanmıştır.
   - CSRF koruması için token'lar kullanılmıştır.
   - Güvenli depolama için şifreleme uygulanmıştır.
   - Dosya yükleme için güvenli doğrulama uygulanmıştır.

9. **Test Stratejisi**:
   - Birim testleri için Vitest ve React Testing Library kullanılmıştır.
   - E2E testleri için Cypress kullanılmıştır.
   - Test kapsamı hedefi en az %80'dir.

10. **Dağıtım Stratejisi**:
    - Docker ve Docker Compose ile konteynerleştirme uygulanmıştır.
    - Nginx ile web sunucusu yapılandırılmıştır.
    - GitHub Actions ile CI/CD otomasyonu sağlanmıştır.
