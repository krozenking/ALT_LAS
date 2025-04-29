# İşçi 3: Runner Geliştirici - Yapılacaklar Listesi

Bu liste, İşçi 3 (Runner Geliştirici) için `updated_worker_tasks.md` ve `remaining_warnings.md` belgelerine ve mevcut kod tabanına dayalı olarak oluşturulmuştur.

## Görevler

### 1. Kod Temizliği ve Uyarıların Giderilmesi (Öncelikli)
- [ ] **Görev 3.1:** `cargo fix --bin "runner-service"` komutunu çalıştırarak otomatik düzeltmeleri uygula
- [ ] **Görev 3.2:** `src/last_file/processor.rs` dosyasındaki kullanılmayan kod uyarılarını gider
  - [ ] `LastFileProcessorConfig` yapısındaki kullanılmayan alanları düzelt
  - [ ] `LastFileProcessor` yapısı ve ilişkili fonksiyonlarını düzelt
- [ ] **Görev 3.3:** Diğer modüllerdeki kullanılmayan kod uyarılarını gider
- [ ] **Görev 3.4:** `cargo check` ile tüm uyarıların giderildiğini doğrula

### 2. *.last Dosya Formatı İmplementasyonu (Hafta 9-10)
- [x] **Görev 3.5:** *.last dosya formatı implementasyonu
  - [x] Dosya yapısı tanımı
  - [x] Serileştirme/deserileştirme
  - [x] Versiyon yönetimi
  - [x] Geriye dönük uyumluluk
- [x] **Görev 3.6:** Sonuç değerlendirme ve başarı oranı hesaplama
  - [x] Başarı metriklerinin tanımlanması
  - [x] Segment başarı değerlendirmesi
  - [x] Genel başarı oranı hesaplama
  - [x] Başarısızlık analizi
- [x] **Görev 3.7:** Metadata ekleme
  - [x] İşlem metadata'sı
  - [x] Performans metadata'sı
  - [x] Kaynak kullanımı metadata'sı
  - [x] Hata metadata'sı

### 3. AI Servis Entegrasyonu (Hafta 7-8)
- [x] **Görev 3.8:** AI servisleri için çağrı sistemi
  - [x] HTTP client implementasyonu
  - [x] Asenkron API çağrıları
  - [x] Rate limiting ve kota yönetimi
  - [x] Timeout ve retry mekanizması
- [x] **Görev 3.9:** Farklı AI modelleri için adaptörler
  - [x] OpenAI adaptörü
  - [x] Anthropic adaptörü
  - [x] Mistral AI adaptörü
  - [x] Yerel model adaptörü (llama.cpp)
- [x] **Görev 3.10:** Yanıt işleme ve birleştirme
  - [x] Yanıt ayrıştırma
  - [x] Format dönüştürme
  - [x] Yanıt birleştirme algoritması
  - [x] Tutarlılık kontrolü

### 4. Paralel İşlem Yönetimi (Hafta 5-6)
- [x] **Görev 3.11:** Asenkron görev yönetim sistemi
  - [x] Tokio task yönetimi
  - [x] Future kompozisyonu
  - [x] Asenkron stream işleme
  - [x] Backpressure mekanizması
- [x] **Görev 3.12:** İş parçacığı havuzu implementasyonu
  - [x] Dinamik iş parçacığı havuzu
  - [x] İş dağıtım algoritması
  - [x] İş parçacığı yaşam döngüsü
  - [x] Kaynak kullanımı izleme
- [x] **Görev 3.13:** Görev önceliklendirme
  - [x] Öncelik kuyrukları
  - [x] Preemptive scheduling
  - [x] Deadline-aware scheduling
  - [x] Kaynak bazlı önceliklendirme

### 5. API ve Entegrasyon (Hafta 11-12)
- [x] **Görev 3.14:** API Gateway ile entegrasyon
  - [x] API endpoint implementasyonu
  - [x] Kimlik doğrulama entegrasyonu
  - [x] Hata işleme standardizasyonu
  - [x] Rate limiting uyumluluğu
- [x] **Görev 3.15:** Segmentation Service ile entegrasyon
  - [x] Segment alma protokolü
  - [x] Durum senkronizasyonu
  - [x] Hata işleme
  - [x] Performans optimizasyonu
- [x] **Görev 3.16:** Archive Service ile entegrasyon
  - [x] Sonuç gönderme protokolü
  - [x] Dosya transferi
  - [x] Metadata senkronizasyonu
  - [x] Hata işleme

### 6. Test ve Dokümantasyon
- [ ] **Görev 3.17:** Kapsamlı test yazımı
  - [ ] Birim testleri
  - [ ] Entegrasyon testleri
  - [ ] Performans testleri
  - [ ] Hata senaryoları testleri
- [ ] **Görev 3.18:** Dokümantasyon güncellemesi
  - [ ] API referans dokümanı
  - [ ] *.last dosya formatı dokümanı
  - [ ] Mimari dokümanı
  - [ ] Sorun giderme kılavuzu
