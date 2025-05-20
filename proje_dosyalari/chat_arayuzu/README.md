# ALT_LAS Chat Botu Arayüzü

<p align="center">
  <img src="public/assets/logo.png" alt="ALT_LAS Logo" width="200" />
</p>

<p align="center">
  <a href="https://github.com/krozenking/ALT_LAS/actions/workflows/ci.yml">
    <img src="https://github.com/krozenking/ALT_LAS/actions/workflows/ci.yml/badge.svg" alt="CI Status" />
  </a>
  <a href="https://github.com/krozenking/ALT_LAS/actions/workflows/cd.yml">
    <img src="https://github.com/krozenking/ALT_LAS/actions/workflows/cd.yml/badge.svg" alt="CD Status" />
  </a>
  <a href="https://github.com/krozenking/ALT_LAS/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/krozenking/ALT_LAS" alt="License" />
  </a>
  <a href="https://github.com/krozenking/ALT_LAS/releases">
    <img src="https://img.shields.io/github/v/release/krozenking/ALT_LAS" alt="Release" />
  </a>
</p>

ALT_LAS Chat Botu Arayüzü, kullanıcıların yapay zeka ile metin, dosya ve ses aracılığıyla etkileşime geçmesini sağlayan modern, erişilebilir ve özelleştirilebilir bir web arayüzüdür.

## Özellikler

### Temel Özellikler
- Metin tabanlı sohbet arayüzü
- Markdown formatlaması desteği
- Kod bloğu görüntüleme ve sözdizimi vurgulama
- Otomatik bağlantı algılama
- Responsive tasarım (mobil ve masaüstü uyumlu)

### Gelişmiş Özellikler
- **Dosya Yükleme ve Görüntüleme**:
  - Farklı dosya tiplerini destekleme (görsel, metin, PDF, vb.)
  - Dosya önizleme (görseller için)
  - Dosya indirme

- **Ses Tanıma ve Kayıt**:
  - Sesli mesaj kaydı
  - Konuşma tanıma (speech-to-text)
  - Ses dosyası oynatma

- **Çoklu Dil Desteği**:
  - Türkçe ve İngilizce dil desteği
  - Dil seçimi bileşeni

- **Erişilebilirlik İyileştirmeleri**:
  - Yüksek kontrast modu
  - Yazı boyutu ayarı
  - Hareketi azaltma modu
  - Ekran okuyucu modu
  - Klavye navigasyonu
  - ARIA öznitelikleri

- **Konuşma Geçmişi Yönetimi**:
  - Konuşmaları kaydetme
  - Kaydedilmiş konuşmaları yükleme
  - Konuşma başlıklarını düzenleme
  - Konuşmaları silme
  - Konuşmaları dışa aktarma

- **Kullanıcı Profili ve Tercihler**:
  - Kullanıcı bilgilerini düzenleme
  - Bildirim tercihlerini ayarlama
  - Gizlilik ayarlarını yönetme
  - Sohbet görünümünü özelleştirme

- **Bildirim Sistemi**:
  - Gerçek zamanlı bildirimler
  - Bildirim listesi
  - Okunmamış bildirim sayacı

- **Tema Özelleştirme**:
  - Hazır temalar
  - Renk özelleştirme
  - Tipografi ayarları
  - Düzen ayarları

- **Klavye Kısayolları Yönetimi**:
  - Kısayolları görüntüleme
  - Kısayolları özelleştirme
  - Kısayolları etkinleştirme/devre dışı bırakma

- **Yardım Merkezi**:
  - Sık Sorulan Sorular (SSS)
  - Öğreticiler
  - Klavye kısayolları rehberi
  - Destek ve iletişim bilgileri

## Kurulum

### Gereksinimler
- Node.js 18 veya üzeri
- npm 9 veya üzeri
- Docker ve Docker Compose (dağıtım için)

### Geliştirme Ortamı Kurulumu

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

### Docker ile Dağıtım

1. Docker Compose ile uygulamayı başlatın:
   ```bash
   # Linux/macOS
   ./scripts/deploy.sh

   # Windows
   .\scripts\deploy.ps1
   ```

2. Özel parametrelerle dağıtım:
   ```bash
   # Linux/macOS
   ./scripts/deploy.sh --environment production --tag v1.0.0 --build

   # Windows
   .\scripts\deploy.ps1 -Environment production -Tag v1.0.0 -Build
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
│   ├── types/               # TypeScript tip tanımları
│   ├── utils/               # Yardımcı fonksiyonlar
│   ├── ai-integration.ts    # AI entegrasyonu
│   ├── App.tsx              # Ana uygulama bileşeni
│   └── main.tsx             # Uygulama giriş noktası
├── scripts/                 # Dağıtım betikleri
├── .env                     # Ortam değişkenleri
├── .env.development         # Geliştirme ortamı değişkenleri
├── .env.production          # Üretim ortamı değişkenleri
├── .env.test                # Test ortamı değişkenleri
├── docker-compose.yml       # Docker Compose yapılandırması
├── Dockerfile               # Docker yapılandırması
├── nginx.conf               # Nginx yapılandırması
├── package.json             # Proje bağımlılıkları
└── README.md                # Proje dokümantasyonu
```

## Kullanım

### Temel Kullanım
1. Mesaj giriş kutusuna bir mesaj yazın.
2. Enter tuşuna basın veya gönder düğmesine tıklayın.
3. AI yanıt verirken bir yükleme göstergesi görünecektir.
4. Yanıt geldiğinde otomatik olarak görüntülenecektir.

### Dosya Yükleme
1. Mesaj giriş kutusunun yanındaki ataç simgesine tıklayın.
2. Yüklemek istediğiniz dosyayı seçin veya dosyayı sürükleyip bırakın.
3. Dosya yüklendikten sonra, AI'ya dosya hakkında bir soru veya talimat yazabilirsiniz.
4. Mesajınızı göndermek için Enter tuşuna basın veya gönder düğmesine tıklayın.

### Sesli Mesaj Kaydı
1. Mesaj giriş kutusunun yanındaki mikrofon simgesine tıklayın.
2. Kayıt başladığında, mesajınızı net bir şekilde söyleyin.
3. Kayıt tamamlandığında, mesajınız otomatik olarak metne dönüştürülecektir.
4. Metni düzenleyebilir ve göndermek için Enter tuşuna basabilir veya gönder düğmesine tıklayabilirsiniz.

### Konuşma Yönetimi
1. Üst menüdeki 'Kaydet' düğmesine tıklayarak mevcut konuşmayı kaydedebilirsiniz.
2. Üst menüdeki 'Yükle' düğmesine tıklayarak önceden kaydedilmiş konuşmaları yükleyebilirsiniz.
3. Üst menüdeki 'Dışa Aktar' düğmesine tıklayarak mevcut konuşmayı PDF, HTML veya metin dosyası olarak dışa aktarabilirsiniz.

## Geliştirme

### Komutlar
- `npm run dev`: Geliştirme sunucusunu başlatır
- `npm run build`: Uygulamayı üretim için derler
- `npm run preview`: Derlenmiş uygulamayı önizler
- `npm run lint`: Kod kalitesini kontrol eder
- `npm run test`: Testleri çalıştırır

### Ortam Değişkenleri
Uygulama, farklı ortamlar için farklı yapılandırma dosyaları kullanır:
- `.env.development`: Geliştirme ortamı
- `.env.test`: Test ortamı
- `.env.production`: Üretim ortamı

## Lisans
Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim
Sorularınız veya sorunlarınız için [support@altlas.com](mailto:support@altlas.com) adresine e-posta gönderebilirsiniz.

---

Tarih: 1 Haziran 2025
