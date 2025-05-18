# Eksiklikleri Giderme Aksiyon Planı

Bu belge, ALT_LAS projesinin yeni kullanıcı arayüzü (UI) geliştirme planında tespit edilen eksiklikleri gidermek için uygulanacak aksiyonları içermektedir. Aksiyon planı, önceliklendirilmiş iyileştirme alanlarına göre düzenlenmiştir.

## 1. Mock Servisler ve API Kontratları (Yüksek Öncelik)

### 1.1. Mock Servis Altyapısının Kurulması

#### 1.1.1. Mock Servis Teknolojisinin Seçilmesi
- MSW (Mock Service Worker) teknolojisi, tarayıcı ve Node.js ortamlarında çalışabilmesi, servis çalışanları (service workers) kullanarak ağ isteklerini yakalayabilmesi ve gerçek API'lere geçiş kolaylığı sağlaması nedeniyle seçilmiştir.

#### 1.1.2. Proje Yapısının Oluşturulması
- Mock servisler için ayrı bir proje dizini oluşturulacak
- Gerekli bağımlılıklar kurulacak
- Temel konfigürasyon dosyaları hazırlanacak

### 1.2. API Kontratlarının Swagger/OpenAPI Şemaları ile Tanımlanması

#### 1.2.1. OpenAPI Şema Yapısının Oluşturulması
- OpenAPI 3.0 standardına uygun şema yapısı oluşturulacak
- Temel bilgiler, sunucu bilgileri ve güvenlik şemaları tanımlanacak
- Veri modelleri ve şemaları tanımlanacak

#### 1.2.2. API Endpointlerinin Tanımlanması
- Kullanıcı yönetimi endpointleri
- Görev yönetimi endpointleri
- Bildirim sistemi endpointleri
- Dosya yönetimi endpointleri

### 1.3. Mock Servislerin Geliştirilmesi

#### 1.3.1. Temel API Endpointleri için Mock Servislerin Geliştirilmesi
- Kullanıcı kimlik doğrulama endpointleri
- Kullanıcı profil yönetimi endpointleri
- Görev listeleme, oluşturma ve güncelleme endpointleri

#### 1.3.2. Hata Durumları ve Edge Case'lerin Simülasyonu
- Sunucu hataları (5xx)
- İstemci hataları (4xx)
- Ağ hataları
- Boş veri durumları
- Büyük veri setleri

### 1.4. API Test Koleksiyonlarının Hazırlanması

#### 1.4.1. Postman Koleksiyonlarının Oluşturulması
- Koleksiyon yapısının tasarlanması
- Her endpoint için test isteklerinin oluşturulması
- Ortam değişkenlerinin tanımlanması

#### 1.4.2. API Test Senaryolarının Geliştirilmesi
- Başarılı senaryo testleri
- Hata durumu testleri
- Sınır değer testleri

## 2. Kullanıcı Testi Altyapısı (Yüksek Öncelik)

### 2.1. Detaylı Kullanıcı Personalarının Oluşturulması

#### 2.1.1. Persona Şablonunun Hazırlanması
- Demografik bilgiler
- Hedefler ve motivasyonlar
- Engeller ve zorluklar
- Teknoloji kullanımı ve yetkinlikleri

#### 2.1.2. 5 Farklı Kullanıcı Tipi için Personaların Oluşturulması
- Yönetici personası
- Teknik kullanıcı personası
- Saha çalışanı personası
- Yeni başlayan kullanıcı personası
- Seyrek kullanıcı personası

### 2.2. Kullanım Senaryolarının Geliştirilmesi

#### 2.2.1. Her Persona için Temel Kullanım Senaryolarının Yazılması
- Her persona için en az 3 temel kullanım senaryosu
- Her senaryo için adım adım akışlar
- Her senaryo için başarı kriterleri

#### 2.2.2. Kullanım Senaryolarının Dokümante Edilmesi
- Senaryo şablonunun oluşturulması
- Senaryoların detaylı olarak yazılması
- Senaryoların görselleştirilmesi

### 2.3. Uzaktan Test Platformu Entegrasyonu

#### 2.3.1. Uzaktan Test Platformunun Seçilmesi ve Kurulması
- UserTesting platformu, kullanım kolaylığı, zengin özellikler ve detaylı raporlama imkanları nedeniyle seçilmiştir
- Platform hesabının oluşturulması
- Test ortamının hazırlanması

#### 2.3.2. Uzaktan Test Protokolünün Oluşturulması
- Test oturumu akışının tanımlanması
- Moderatör ve gözlemci için kılavuzların hazırlanması
- Test sonuçlarının kaydedilmesi ve analizi için metodolojinin belirlenmesi

## 3. Otomatik Test Altyapısı (Orta Öncelik)

### 3.1. Birim Test Altyapısının Kurulması

#### 3.1.1. Frontend Birim Test Framework'ünün Kurulması
- Jest ve React Testing Library'nin kurulması
- Test yapısının ve organizasyonunun tanımlanması
- Mock ve stub stratejisinin belirlenmesi

#### 3.1.2. Örnek Birim Testlerinin Yazılması
- Buton bileşeni için birim testleri
- Form elemanları için birim testleri
- Kart, liste ve tablo bileşenleri için birim testleri

### 3.2. Entegrasyon Test Altyapısının Kurulması

#### 3.2.1. API Test Otomasyonu Altyapısının Kurulması
- Postman/Newman entegrasyonu
- API test yapısının ve organizasyonunun tanımlanması
- Test veri yönetimi stratejisinin belirlenmesi

#### 3.2.2. Örnek Entegrasyon Testlerinin Yazılması
- Kullanıcı kimlik doğrulama entegrasyon testleri
- Görev yönetimi entegrasyon testleri
- Bildirim sistemi entegrasyon testleri

### 3.3. E2E Test Altyapısının Kurulması

#### 3.3.1. E2E Test Framework'ünün Kurulması
- Cypress'in kurulması ve konfigüre edilmesi
- Test yapısının ve organizasyonunun tanımlanması
- Page Object Model deseninin uygulanması

#### 3.3.2. Örnek E2E Testlerinin Yazılması
- Kullanıcı girişi E2E testi
- Görev oluşturma E2E testi
- Bildirim görüntüleme E2E testi

## 4. Güvenlik Test Altyapısı (Orta Öncelik)

### 4.1. OWASP Kontrol Listelerinin Hazırlanması

#### 4.1.1. OWASP Top 10 Kontrol Listesinin Hazırlanması
- Her risk için kontrol noktalarının belirlenmesi
- Kontrol listesinin oluşturulması
- Kontrol listesinin dokümante edilmesi

#### 4.1.2. OWASP API Security Top 10 Kontrol Listesinin Hazırlanması
- Her risk için kontrol noktalarının belirlenmesi
- Kontrol listesinin oluşturulması
- Kontrol listesinin dokümante edilmesi

### 4.2. Güvenlik Test Araçlarının Entegrasyonu

#### 4.2.1. OWASP ZAP Entegrasyonu
- OWASP ZAP'in kurulması ve konfigüre edilmesi
- API tarama profillerinin oluşturulması
- Otomatik tarama senaryolarının hazırlanması

#### 4.2.2. Güvenlik Test Senaryolarının Geliştirilmesi
- Kimlik doğrulama ve yetkilendirme testleri
- Veri doğrulama ve sanitizasyon testleri
- Oturum yönetimi testleri

### 4.3. Tehdit Modelleme Çalışması

#### 4.3.1. Tehdit Modelleme Metodolojisinin Seçilmesi
- STRIDE metodolojisi, kapsamlı ve sistematik bir yaklaşım sunması nedeniyle seçilmiştir
- Tehdit modelleme sürecinin tanımlanması
- Tehdit modelleme araçlarının seçilmesi

#### 4.3.2. Sistem Bileşenlerinin ve Sınırlarının Tanımlanması
- Sistem bileşenlerinin listelenmesi
- Veri akışlarının tanımlanması
- Güven sınırlarının belirlenmesi

## 5. Performans Test Altyapısı (Düşük Öncelik)

### 5.1. Performans Metriklerinin Belirlenmesi

#### 5.1.1. Core Web Vitals Metriklerinin Tanımlanması
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Performans hedeflerinin belirlenmesi

#### 5.1.2. Lighthouse ve WebPageTest Entegrasyonu
- Lighthouse'un CI/CD pipeline'a entegrasyonu
- WebPageTest'in test süreçlerine entegrasyonu
- Performans test sonuçlarının raporlanması için format belirlenmesi

### 5.2. Yük Testi Senaryolarının Hazırlanması

#### 5.2.1. k6 Yük Testi Aracının Kurulması
- k6'nın kurulması ve konfigüre edilmesi
- Test senaryolarının yapısının tanımlanması
- Test sonuçlarının raporlanması için format belirlenmesi

#### 5.2.2. Yük Testi Senaryolarının Geliştirilmesi
- Temel yük testi senaryoları
- Stres testi senaryoları
- Dayanıklılık testi senaryoları

## 6. Dokümantasyon ve Eğitim (Düşük Öncelik)

### 6.1. Wiki ve Bilgi Tabanının Oluşturulması

#### 6.1.1. Wiki Platformunun Kurulması
- GitHub Wiki platformu, proje ile entegrasyon kolaylığı nedeniyle seçilmiştir
- Wiki yapısının ve kategorilerinin tasarlanması
- Ana sayfanın ve giriş sayfalarının oluşturulması

#### 6.1.2. Teknik Dokümantasyon Sayfalarının Oluşturulması
- Mimari dokümantasyon sayfaları
- API dokümantasyon sayfaları
- Geliştirici kılavuzu sayfaları

### 6.2. Video Eğitim Materyallerinin Hazırlanması

#### 6.2.1. Eğitim Video İçeriklerinin Planlanması
- Eğitim video konularının ve kapsamının belirlenmesi
- Video senaryolarının ve scriptlerinin hazırlanması
- Ekran görüntülerinin ve görsellerin hazırlanması

#### 6.2.2. Örnek Eğitim Videosunun Oluşturulması
- Ekran kaydı yazılımının seçilmesi ve kurulması
- Örnek eğitim videosunun kaydedilmesi
- Videonun düzenlenmesi ve alt yazıların eklenmesi
