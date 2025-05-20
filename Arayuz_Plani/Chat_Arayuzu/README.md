# ALT_LAS Chat Arayüzü

ALT_LAS projesi için geliştirilen Chat arayüzü bileşenleri ve dokümantasyonu.

## Proje Yapısı

```
Chat_Arayuzu/
├── components/         # Chat bileşenleri
│   ├── ChatContainer/  # Ana chat konteyner bileşeni
│   ├── MessageList/    # Mesaj listesi bileşeni
│   ├── MessageItem/    # Tek bir mesaj bileşeni
│   ├── MessageInput/   # Mesaj girişi bileşeni
│   ├── UserStatus/     # Kullanıcı durumu bileşeni
│   ├── FileUpload/     # Dosya yükleme bileşeni
│   ├── ChatHeader/     # Chat başlık bileşeni
│   ├── ChatSidebar/    # Chat kenar çubuğu bileşeni
│   ├── SearchBar/      # Arama çubuğu bileşeni
│   └── Notification/   # Bildirim bileşeni
├── hooks/              # Özel React hook'ları
├── context/            # React context'leri
├── services/           # API servisleri
├── utils/              # Yardımcı fonksiyonlar
├── types/              # TypeScript tipleri
├── styles/             # Genel stil dosyaları
└── tests/              # Test dosyaları
```

## Bileşenler

### ChatContainer

Ana chat konteyner bileşeni, tüm chat arayüzünü içerir.

### MessageList

Mesaj listesi bileşeni, tüm mesajları görüntüler.

### MessageItem

Tek bir mesaj bileşeni, bir mesajı görüntüler.

### MessageInput

Mesaj girişi bileşeni, kullanıcının mesaj yazmasını sağlar.

### UserStatus

Kullanıcı durumu bileşeni, kullanıcının çevrimiçi/çevrimdışı durumunu gösterir.

### FileUpload

Dosya yükleme bileşeni, kullanıcının dosya yüklemesini sağlar.

### ChatHeader

Chat başlık bileşeni, chat başlığını ve eylemlerini içerir.

### ChatSidebar

Chat kenar çubuğu bileşeni, kullanıcı listesini ve diğer bilgileri içerir.

### SearchBar

Arama çubuğu bileşeni, mesajlarda arama yapmayı sağlar.

### Notification

Bildirim bileşeni, yeni mesaj bildirimlerini gösterir.

## Geliştirme

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

### Test

```bash
# Birim testleri çalıştır
npm test

# Uçtan uca testleri çalıştır
npm run test:e2e
```

### Derleme

```bash
# Üretim için derleme
npm run build
```

## Teknolojiler

- React
- TypeScript
- Styled Components
- Socket.io
- React Query
- Framer Motion
- React Testing Library
- Cypress
