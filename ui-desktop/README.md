# UI-Desktop

UI-Desktop, ALT_LAS platformunun masaüstü kullanıcı arayüzü bileşenidir. Electron ve React kullanılarak geliştirilmiş, kullanıcıların ALT_LAS sistemini yönetmesini sağlayan bir uygulamadır.

## Temel Özellikler

- Kullanıcı kimlik doğrulama ve yetkilendirme
- Komut girişi ve yönetimi
- Segmentasyon sonuçlarını görüntüleme
- Runner işlemlerini izleme
- Arşiv sonuçlarını arama ve görüntüleme
- Erişilebilirlik odaklı tasarım (WCAG 2.1 AA uyumlu)

## Teknoloji Yığını

- **Framework**: Electron
- **UI Kütüphanesi**: React
- **Durum Yönetimi**: Redux
- **Stil**: Styled Components
- **Paket Yöneticisi**: npm
- **Derleme Aracı**: Webpack

## Kurulum ve Çalıştırma

### Gereksinimler

- Node.js 18+
- npm 8+

### Yerel Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme modunda çalıştır
npm run dev

# Uygulamayı derle
npm run build

# Derlenen uygulamayı çalıştır
npm start
```

### Paketleme

```bash
# Windows için paketleme
npm run package:win

# macOS için paketleme
npm run package:mac

# Linux için paketleme
npm run package:linux
```

### Ortam Değişkenleri

Uygulama, `.env` dosyası veya sistem ortam değişkenleri aracılığıyla yapılandırılabilir:

| Değişken | Açıklama | Varsayılan Değer |
|----------|----------|------------------|
| `REACT_APP_API_URL` | API Gateway URL'i | `http://localhost:3000` |
| `REACT_APP_AUTH_STORAGE_KEY` | Kimlik doğrulama token'ı için localStorage anahtarı | `alt_las_auth` |
| `REACT_APP_LOG_LEVEL` | Log seviyesi (debug, info, warn, error) | `info` |

## Proje Yapısı

```
ui-desktop/
├── .webpack/           # Webpack yapılandırması
├── assets/             # Statik dosyalar (ikonlar, görseller)
├── src/
│   ├── main/           # Electron ana süreç
│   │   └── index.ts    # Ana giriş noktası
│   ├── renderer/       # Electron renderer süreç (React)
│   │   ├── components/ # React bileşenleri
│   │   ├── pages/      # Sayfa bileşenleri
│   │   ├── services/   # API servisleri
│   │   ├── store/      # Redux store
│   │   ├── styles/     # Global stiller
│   │   ├── utils/      # Yardımcı fonksiyonlar
│   │   └── index.tsx   # Renderer giriş noktası
│   └── preload/        # Preload script
├── package.json        # Proje bağımlılıkları ve scriptleri
└── tsconfig.json       # TypeScript yapılandırması
```

## Temel Bileşenler

### Ana Sayfalar

- **Login**: Kullanıcı girişi ve kimlik doğrulama
- **Dashboard**: Genel bakış ve özet bilgiler
- **CommandInput**: Komut girişi ve gönderimi
- **SegmentationView**: Segmentasyon sonuçlarını görüntüleme
- **RunnerMonitor**: Runner işlemlerini izleme
- **ArchiveExplorer**: Arşiv sonuçlarını arama ve görüntüleme
- **Settings**: Uygulama ayarları

### Servisler

- **AuthService**: Kimlik doğrulama ve yetkilendirme
- **ApiService**: API Gateway ile iletişim
- **CommandService**: Komut yönetimi
- **SegmentationService**: Segmentasyon işlemleri
- **RunnerService**: Runner işlemleri
- **ArchiveService**: Arşiv işlemleri

## Erişilebilirlik

UI-Desktop, WCAG 2.1 AA standartlarına uygun olarak geliştirilmiştir. Erişilebilirlik özellikleri:

- Klavye navigasyonu
- Ekran okuyucu desteği
- Yüksek kontrast modu
- Metin boyutu ayarları
- Animasyon kontrolü

Detaylı bilgi için `docs/accessibility_implementation.md` dosyasına bakın.

## API Entegrasyonu

UI-Desktop, ALT_LAS API Gateway üzerinden diğer servislerle iletişim kurar. API entegrasyonu için `src/renderer/services/api.ts` dosyasını inceleyin.

## Katkıda Bulunma

1. Bu repo'yu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.
