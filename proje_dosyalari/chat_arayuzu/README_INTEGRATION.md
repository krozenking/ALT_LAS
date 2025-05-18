# ALT_LAS Chat ve AI Entegrasyonu Dokümantasyonu

Bu doküman, ALT_LAS projesinin chat arayüzü ve AI entegrasyon modülü arasındaki bağlantıyı açıklamaktadır.

## Genel Bakış

Chat arayüzü ve AI entegrasyon modülü arasındaki bağlantı, kullanıcıların farklı AI modelleriyle etkileşime geçmesini sağlar. Bu entegrasyon, aşağıdaki özellikleri sunar:

- Farklı AI modellerini seçme ve kullanma
- Mesaj gönderme ve yanıt alma
- Paralel sorgu işleme (birden fazla modele aynı anda sorgu gönderme)
- Yanıt karşılaştırma ve değerlendirme
- Hata yönetimi ve geri bildirim

## Dosya Yapısı

- `index.html`: Ana HTML dosyası
- `styles.css`: Stil dosyası
- `app.js`: Ana uygulama mantığı
- `ai-integration.js`: AI entegrasyon modülü ile bağlantı sağlayan ara katman

## Kullanım

### AI Entegrasyonunu Başlatma

```javascript
// AI Entegrasyonunu başlat
const success = await aiIntegration.initializeAI({
  models: [
    {
      id: 'openai-gpt4',
      type: 'openai',
      modelName: 'gpt-4',
      apiKey: 'your_api_key',
      systemMessage: 'Sen ALT_LAS projesinin yardımcı asistanısın.'
    },
    // Diğer modeller...
  ],
  defaultModel: 'openai-gpt4',
  parallelQueryEnabled: true
});
```

### Sorgu Gönderme

```javascript
// Tek modele sorgu gönderme
const response = await aiIntegration.queryAI(message, messageHistory);

// Birden fazla modele paralel sorgu gönderme
const parallelResponse = await aiIntegration.parallelQueryAI(message, messageHistory, modelIds);
```

### Model Değiştirme

```javascript
// Aktif modeli değiştirme
const success = aiIntegration.changeAIModel(modelId);
```

### Mevcut Modelleri Alma

```javascript
// Mevcut modelleri alma
const models = aiIntegration.getAvailableAIModels();

// Aktif model bilgisini alma
const activeModel = aiIntegration.getActiveAIModel();
```

## Özellikler

### Model Seçimi

Kullanıcılar, arayüzdeki model seçim menüsünden farklı AI modellerini seçebilirler. Seçilen model, sonraki tüm sorguların gönderileceği model olur.

### Paralel Sorgu

Kullanıcılar, "Paralel Sorgu" seçeneğini seçerek aynı mesajı birden fazla modele gönderebilirler. Bu özellik, farklı modellerin yanıtlarını karşılaştırmak için kullanışlıdır.

### Yanıt Karşılaştırma

Paralel sorgu sonucunda, farklı modellerin yanıtları karşılaştırılır ve en iyi yanıt belirlenir. Karşılaştırma, yanıt uzunluğu, içerik zenginliği ve diğer metriklere dayanır.

### Hata Yönetimi

AI entegrasyonu sırasında oluşabilecek hatalar yakalanır ve kullanıcıya anlaşılır mesajlar gösterilir. Entegrasyon başarısız olursa, uygulama simülasyon moduna geçer.

## Geliştirici Notları

- AI entegrasyon modülü, farklı AI modellerine bağlantı kurmak için adaptör deseni kullanır.
- Mesaj geçmişi, sohbet bağlamını korumak için kullanılır.
- Paralel sorgu özelliği, farklı modellerin performansını karşılaştırmak için kullanışlıdır.
- Gerçek API anahtarları, güvenlik nedeniyle çevresel değişkenlerden alınmalıdır.

## Gelecek Geliştirmeler

- Anthropic ve Llama model adaptörlerinin eklenmesi
- Daha gelişmiş yanıt karşılaştırma algoritmaları
- Kullanıcı tercihlerine göre model özelleştirme
- Dosya yükleme ve işleme yeteneklerinin geliştirilmesi
