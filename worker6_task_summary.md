## İşçi 6: AI Entegrasyon Uzmanı - Görev Özeti ve Kurallar

Bu belge, `worker_tasks_detailed.md` dosyasından çıkarılan İşçi 6'nın (AI Entegrasyon Uzmanı) temel sorumluluklarını, detaylı görevlerini, teknik gereksinimlerini ve kod kalite metriklerini özetlemektedir.

### Temel Sorumluluklar:

*   Farklı AI modelleri (OpenAI, Anthropic, Mistral AI, yerel modeller) için adaptörlerin geliştirilmesi.
*   AI model performansının değerlendirilmesi ve karşılaştırılması.
*   Prompt engineering ve optimizasyonu.
*   AI servisleriyle entegrasyon testleri.
*   Yeni AI modellerinin araştırılması ve entegrasyonu.

### Detaylı Görevler (12 Haftalık Plan):

**Makro Görev 6.1: Temel Altyapı ve Araştırma (Hafta 1-2)**
*   **Mikro Görev 6.1.1:** Python/Rust ile AI adaptör projesinin kurulumu (Proje yapısı, Kütüphane seçimi, Asenkron destek, Docker yapılandırması).
*   **Mikro Görev 6.1.2:** AI model API'lerinin araştırılması ve dokümantasyonu (OpenAI, Anthropic, Mistral AI, Hugging Face API'leri, Yerel model (llama.cpp) arayüzleri).
*   **Mikro Görev 6.1.3:** Temel adaptör arayüzünün tasarlanması (Ortak fonksiyonlar: generate, chat, embed; Parametre standardizasyonu, Hata işleme).
*   **Mikro Görev 6.1.4:** Performans değerlendirme metriklerinin belirlenmesi (Doğruluk, Hız, Maliyet, Kaynak kullanımı, Kalite metrikleri).
*   **Mikro Görev 6.1.5:** Temel birim testleri (Test altyapısı, Mock/fixture'lar, Kapsam raporlama).

**Makro Görev 6.2: OpenAI ve Anthropic Adaptörleri (Hafta 3-4)**
*   **Mikro Görev 6.2.1:** OpenAI API adaptörünün geliştirilmesi (GPT-3.5/4 entegrasyonu, API anahtar yönetimi, Rate limiting, Hata işleme).
*   **Mikro Görev 6.2.2:** Anthropic Claude API adaptörünün geliştirilmesi (Claude modelleri entegrasyonu, API anahtar yönetimi, Rate limiting, Hata işleme).
*   **Mikro Görev 6.2.3:** Prompt engineering ve optimizasyonu (OpenAI/Anthropic) (Sistem/Kullanıcı prompt'ları, Few-shot/Zero-shot, Parametre ayarları).
*   **Mikro Görev 6.2.4:** Performans testleri ve karşılaştırması (OpenAI/Anthropic) (Test senaryoları, Metrik toplama, Sonuç analizi, Raporlama).
*   **Mikro Görev 6.2.5:** Adaptör testleri (Birim, Entegrasyon, Hata senaryoları).

**Makro Görev 6.3: Mistral AI ve Yerel Model Adaptörleri (Hafta 5-6)**
*   **Mikro Görev 6.3.1:** Mistral AI API adaptörünün geliştirilmesi (Mistral modelleri entegrasyonu, API anahtar yönetimi, Rate limiting, Hata işleme).
*   **Mikro Görev 6.3.2:** Yerel model (llama.cpp) adaptörünün geliştirilmesi (llama.cpp entegrasyonu, Model yükleme/yönetimi, Performans optimizasyonu, Kaynak izleme).
*   **Mikro Görev 6.3.3:** Prompt engineering ve optimizasyonu (Mistral/Yerel) (Sistem/Kullanıcı prompt'ları, Parametre ayarları, Model spesifik optimizasyonlar).
*   **Mikro Görev 6.3.4:** Performans testleri ve karşılaştırması (Mistral/Yerel) (Test senaryoları, Metrik toplama, Sonuç analizi, Raporlama).
*   **Mikro Görev 6.3.5:** Adaptör testleri (Birim, Entegrasyon, Hata senaryoları).

**Makro Görev 6.4: Runner Service Entegrasyonu (Hafta 7-8)**
*   **Mikro Görev 6.4.1:** Adaptörlerin Runner Service ile entegrasyonu (API endpoint implementasyonu, Model seçimi, Parametre geçişi, Hata işleme).
*   **Mikro Görev 6.4.2:** Asenkron model çağrıları ve yanıt işleme (Paralel çağrılar, Yanıt birleştirme, Hata toleransı, Performans optimizasyonu).
*   **Mikro Görev 6.4.3:** Model yapılandırma ve yönetim API'leri (Model ekleme/kaldırma, Parametre ayarları, Varsayılan model, API entegrasyonu).
*   **Mikro Görev 6.4.4:** Entegrasyon testleri (Runner Service, API Gateway, E2E, Performans).
*   **Mikro Görev 6.4.5:** Dokümantasyon (Adaptör API referansı, Model yapılandırma kılavuzu, Performans raporları).

**Makro Görev 6.5: İleri Özellikler ve Optimizasyon (Hafta 9-10)**
*   **Mikro Görev 6.5.1:** Model chaining ve orkestrasyonu (Çoklu model kullanımı, Adım adım işleme, Sonuç birleştirme, Hata işleme).
*   **Mikro Görev 6.5.2:** Dinamik model seçimi ve A/B testi (Performans/maliyet bazlı seçim, A/B testi altyapısı, Sonuç analizi).
*   **Mikro Görev 6.5.3:** Güvenlik ve etik değerlendirme (Veri gizliliği, Yanıt filtreleme, Bias tespiti, Güvenlik açıkları).
*   **Mikro Görev 6.5.4:** Yeni AI modellerinin araştırılması ve entegrasyonu (Hugging Face Hub, Yeni çıkan modeller, Performans değerlendirmesi, Adaptör geliştirme).
*   **Mikro Görev 6.5.5:** Performans optimizasyonu (Profiling, Bellek/CPU optimizasyonu, Cache, Batch processing).

**Makro Görev 6.6: Stabilizasyon ve Raporlama (Hafta 11-12)**
*   **Mikro Görev 6.6.1:** Kapsamlı testlerin tamamlanması (Birim, Entegrasyon, E2E, Yük, Güvenlik).
*   **Mikro Görev 6.6.2:** Hata ayıklama ve performans iyileştirmeleri (Son performans ayarları, Hata düzeltmeleri, Kararlılık testleri).
*   **Mikro Görev 6.6.3:** Detaylı performans raporlarının hazırlanması (Model karşılaştırması, Maliyet analizi, Öneriler, Sunum).
*   **Mikro Görev 6.6.4:** Dokümantasyon güncellemesi (API referansı, Model entegrasyon kılavuzu, Performans raporları, Sorun giderme).
*   **Mikro Görev 6.6.5:** Bilgi transferi ve eğitim (Diğer ekiplere eğitim, Dokümantasyon sunumu, Geri bildirim toplama).

### Teknik Gereksinimler:

*   Python 3.10+ / Rust 1.70+
*   OpenAI SDK, Anthropic SDK, Mistral AI SDK
*   llama.cpp
*   Hugging Face Transformers
*   Docker & Docker Compose
*   GitHub Actions

### Kod Kalite Metrikleri (Yöneticinin Beklentileri):

*   **Test kapsamı:** ≥ %85
*   **Kod tekrarı:** < %5
*   **Performans metrikleri:** Belirlenen hedeflere ulaşım
*   **Dokümantasyon kapsamı:** ≥ %80

Bu özet, İşçi 6'nın proje içindeki rolünü ve beklentilerini netleştirmek amacıyla hazırlanmıştır. Proje görevlerine başlarken bu özet ve `worker_tasks_detailed.md` dosyasındaki orijinal talimatlar dikkate alınacaktır.



### Ek Çalışma Kuralları (Kullanıcı Talebi Üzerine Eklenmiştir):

*   Her makro görev bitiminde, yapılan değişiklikler GitHub deposuna push edilecek ve ilgili dokümantasyon (README, API belgeleri, görev özetleri vb.) güncel tutulacaktır.
