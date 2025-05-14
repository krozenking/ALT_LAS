# Beta Aşaması Fonksiyonel Gereksinimler

**Tarih:** 29 Mayıs 2025  
**Hazırlayan:** Mehmet Kaya (Yazılım Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Aşaması Fonksiyonel Gereksinimler

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta aşaması için fonksiyonel gereksinimleri içermektedir. Bu gereksinimler, alpha aşamasında toplanan kullanıcı geri bildirimleri, performans analizi, hata analizi ve öğrenilen dersler doğrultusunda belirlenmiştir. Beta aşaması, sistemin daha geniş bir kullanıcı kitlesine açılacağı ve daha kapsamlı testlerin yapılacağı bir aşamadır.

## 2. Mevcut Fonksiyonel Özellikler

Alpha aşamasında geliştirilen ve beta aşamasında devam edecek olan mevcut fonksiyonel özellikler aşağıdaki gibidir:

### 2.1. API Gateway

- **Kimlik Doğrulama ve Yetkilendirme**: Kullanıcı kimlik doğrulama ve yetkilendirme işlemleri
- **API Yönlendirme**: İsteklerin ilgili servislere yönlendirilmesi
- **Hız Sınırlama**: API isteklerinin hız sınırlaması
- **İstek Doğrulama**: API isteklerinin doğrulanması
- **Önbellek**: API yanıtlarının önbelleğe alınması

### 2.2. Segmentation Service

- **Görüntü Segmentasyonu**: Görüntülerin segmentlere ayrılması
- **Segmentasyon Algoritmaları**: Farklı segmentasyon algoritmalarının uygulanması
- **Segmentasyon Sonuçlarının Kaydedilmesi**: Segmentasyon sonuçlarının veritabanına kaydedilmesi
- **Segmentasyon Sonuçlarının Görselleştirilmesi**: Segmentasyon sonuçlarının görselleştirilmesi

### 2.3. Runner Service

- **İş Sırası Yönetimi**: İşlerin sıraya alınması ve yönetilmesi
- **İş Durumu İzleme**: İşlerin durumunun izlenmesi
- **İş Sonuçlarının Kaydedilmesi**: İş sonuçlarının veritabanına kaydedilmesi
- **İş Sonuçlarının Bildirilmesi**: İş sonuçlarının ilgili servislere bildirilmesi

### 2.4. Archive Service

- **Veri Arşivleme**: Verilerin arşivlenmesi
- **Arşiv Arama**: Arşivlenmiş verilerin aranması
- **Arşiv İndirme**: Arşivlenmiş verilerin indirilmesi
- **Arşiv Silme**: Arşivlenmiş verilerin silinmesi

### 2.5. AI Orchestrator

- **AI Model Yönetimi**: AI modellerinin yönetilmesi
- **AI İş Akışı Yönetimi**: AI iş akışlarının yönetilmesi
- **AI Sonuçlarının Kaydedilmesi**: AI sonuçlarının veritabanına kaydedilmesi
- **AI Sonuçlarının Görselleştirilmesi**: AI sonuçlarının görselleştirilmesi

## 3. Beta Aşaması Yeni Fonksiyonel Gereksinimler

Beta aşamasında geliştirilecek yeni fonksiyonel gereksinimler aşağıdaki gibidir:

### 3.1. API Gateway

#### 3.1.1. API Versiyonlama

- **Gereksinim**: API Gateway, farklı API versiyonlarını desteklemelidir.
- **Açıklama**: API Gateway, URL yolu, istek başlığı veya istek parametresi ile API versiyonunu belirleyebilmelidir.
- **Kabul Kriterleri**:
  - API Gateway, URL yolu ile API versiyonunu belirleyebilmelidir (örn. /v1/users, /v2/users).
  - API Gateway, istek başlığı ile API versiyonunu belirleyebilmelidir (örn. Accept: application/vnd.api.v1+json).
  - API Gateway, istek parametresi ile API versiyonunu belirleyebilmelidir (örn. ?version=1).
  - API Gateway, varsayılan bir API versiyonu sunabilmelidir.
  - API Gateway, desteklenmeyen API versiyonları için uygun hata mesajları döndürmelidir.

#### 3.1.2. API Dokümantasyonu

- **Gereksinim**: API Gateway, API dokümantasyonu sunmalıdır.
- **Açıklama**: API Gateway, Swagger/OpenAPI ile API dokümantasyonu sunmalıdır.
- **Kabul Kriterleri**:
  - API Gateway, Swagger/OpenAPI ile API dokümantasyonu sunmalıdır.
  - API dokümantasyonu, tüm API endpoint'lerini, parametrelerini, istek ve yanıt örneklerini içermelidir.
  - API dokümantasyonu, API versiyonlarını desteklemelidir.
  - API dokümantasyonu, interaktif olmalıdır (örn. API'yi test etme özelliği).

#### 3.1.3. API Analitikleri

- **Gereksinim**: API Gateway, API kullanım analitiklerini toplamalı ve raporlamalıdır.
- **Açıklama**: API Gateway, API isteklerinin sayısı, başarı/hata oranları, yanıt süreleri gibi metrikleri toplamalı ve raporlamalıdır.
- **Kabul Kriterleri**:
  - API Gateway, API isteklerinin sayısını toplamalı ve raporlamalıdır.
  - API Gateway, API başarı/hata oranlarını toplamalı ve raporlamalıdır.
  - API Gateway, API yanıt sürelerini toplamalı ve raporlamalıdır.
  - API Gateway, API kullanım analitiklerini görselleştirmelidir.
  - API Gateway, API kullanım analitiklerini dışa aktarabilmelidir (örn. CSV, JSON).

### 3.2. Segmentation Service

#### 3.2.1. Gelişmiş Segmentasyon Algoritmaları

- **Gereksinim**: Segmentation Service, daha gelişmiş segmentasyon algoritmaları sunmalıdır.
- **Açıklama**: Segmentation Service, derin öğrenme tabanlı segmentasyon algoritmaları gibi daha gelişmiş algoritmalar sunmalıdır.
- **Kabul Kriterleri**:
  - Segmentation Service, en az 3 yeni segmentasyon algoritması sunmalıdır.
  - Yeni algoritmalar, mevcut algoritmalardan daha iyi performans göstermelidir.
  - Yeni algoritmalar, kullanıcı arayüzünden seçilebilmelidir.
  - Yeni algoritmaların parametreleri, kullanıcı arayüzünden ayarlanabilmelidir.

#### 3.2.2. Toplu Segmentasyon

- **Gereksinim**: Segmentation Service, toplu segmentasyon işlemlerini desteklemelidir.
- **Açıklama**: Segmentation Service, birden fazla görüntünün toplu olarak segmentasyonunu desteklemelidir.
- **Kabul Kriterleri**:
  - Segmentation Service, birden fazla görüntünün toplu olarak segmentasyonunu desteklemelidir.
  - Toplu segmentasyon işlemleri, arka planda asenkron olarak çalışmalıdır.
  - Toplu segmentasyon işlemlerinin durumu izlenebilmelidir.
  - Toplu segmentasyon sonuçları, toplu olarak indirilebilmelidir.

#### 3.2.3. Segmentasyon Sonuçlarının Dışa Aktarılması

- **Gereksinim**: Segmentation Service, segmentasyon sonuçlarını farklı formatlarda dışa aktarabilmelidir.
- **Açıklama**: Segmentation Service, segmentasyon sonuçlarını PNG, JPEG, TIFF, DICOM gibi farklı formatlarda dışa aktarabilmelidir.
- **Kabul Kriterleri**:
  - Segmentation Service, segmentasyon sonuçlarını en az 4 farklı formatta dışa aktarabilmelidir.
  - Dışa aktarma formatı, kullanıcı arayüzünden seçilebilmelidir.
  - Dışa aktarma işlemi, arka planda asenkron olarak çalışmalıdır.
  - Dışa aktarma işleminin durumu izlenebilmelidir.

### 3.3. Runner Service

#### 3.3.1. İş Önceliklendirme

- **Gereksinim**: Runner Service, işleri önceliklendirmeyi desteklemelidir.
- **Açıklama**: Runner Service, işleri önceliklerine göre sıralayabilmeli ve işleyebilmelidir.
- **Kabul Kriterleri**:
  - Runner Service, işlere öncelik atanabilmesini desteklemelidir.
  - Runner Service, işleri önceliklerine göre sıralayabilmelidir.
  - Yüksek öncelikli işler, düşük öncelikli işlerden önce işlenmelidir.
  - İş önceliği, kullanıcı arayüzünden ayarlanabilmelidir.

#### 3.3.2. İş Zamanlama

- **Gereksinim**: Runner Service, işlerin zamanlanmasını desteklemelidir.
- **Açıklama**: Runner Service, işlerin belirli bir zamanda veya periyodik olarak çalıştırılmasını desteklemelidir.
- **Kabul Kriterleri**:
  - Runner Service, işlerin belirli bir zamanda çalıştırılmasını desteklemelidir.
  - Runner Service, işlerin periyodik olarak çalıştırılmasını desteklemelidir.
  - İş zamanlama, kullanıcı arayüzünden ayarlanabilmelidir.
  - Zamanlanmış işlerin durumu izlenebilmelidir.

#### 3.3.3. İş Bağımlılıkları

- **Gereksinim**: Runner Service, işler arasındaki bağımlılıkları desteklemelidir.
- **Açıklama**: Runner Service, bir işin başka bir işin tamamlanmasına bağlı olarak çalıştırılmasını desteklemelidir.
- **Kabul Kriterleri**:
  - Runner Service, işler arasındaki bağımlılıkları tanımlayabilmelidir.
  - Bağımlı işler, bağımlı oldukları işler tamamlanmadan çalıştırılmamalıdır.
  - İş bağımlılıkları, kullanıcı arayüzünden tanımlanabilmelidir.
  - İş bağımlılıkları, görsel olarak gösterilebilmelidir (örn. iş akışı diyagramı).

### 3.4. Archive Service

#### 3.4.1. Gelişmiş Arama

- **Gereksinim**: Archive Service, gelişmiş arama özelliklerini desteklemelidir.
- **Açıklama**: Archive Service, metadata, içerik, tarih aralığı gibi kriterlere göre gelişmiş arama yapabilmelidir.
- **Kabul Kriterleri**:
  - Archive Service, metadata'ya göre arama yapabilmelidir.
  - Archive Service, içeriğe göre arama yapabilmelidir.
  - Archive Service, tarih aralığına göre arama yapabilmelidir.
  - Archive Service, birden fazla kriteri birleştirerek arama yapabilmelidir.
  - Arama sonuçları, farklı kriterlere göre sıralanabilmelidir.

#### 3.4.2. Arşiv Versiyonlama

- **Gereksinim**: Archive Service, arşivlenen verilerin versiyonlanmasını desteklemelidir.
- **Açıklama**: Archive Service, arşivlenen verilerin farklı versiyonlarını saklayabilmeli ve yönetebilmelidir.
- **Kabul Kriterleri**:
  - Archive Service, arşivlenen verilerin farklı versiyonlarını saklayabilmelidir.
  - Archive Service, arşivlenen verilerin versiyonları arasında geçiş yapabilmelidir.
  - Archive Service, arşivlenen verilerin versiyonları arasındaki farkları gösterebilmelidir.
  - Versiyon geçmişi, kullanıcı arayüzünden görüntülenebilmelidir.

#### 3.4.3. Arşiv Paylaşımı

- **Gereksinim**: Archive Service, arşivlenen verilerin paylaşılmasını desteklemelidir.
- **Açıklama**: Archive Service, arşivlenen verilerin diğer kullanıcılarla veya sistemlerle paylaşılmasını desteklemelidir.
- **Kabul Kriterleri**:
  - Archive Service, arşivlenen verilerin diğer kullanıcılarla paylaşılmasını desteklemelidir.
  - Archive Service, arşivlenen verilerin diğer sistemlerle paylaşılmasını desteklemelidir.
  - Paylaşım izinleri, kullanıcı arayüzünden ayarlanabilmelidir.
  - Paylaşılan veriler, paylaşım linki ile erişilebilmelidir.

### 3.5. AI Orchestrator

#### 3.5.1. Model Versiyonlama

- **Gereksinim**: AI Orchestrator, AI modellerinin versiyonlanmasını desteklemelidir.
- **Açıklama**: AI Orchestrator, AI modellerinin farklı versiyonlarını saklayabilmeli ve yönetebilmelidir.
- **Kabul Kriterleri**:
  - AI Orchestrator, AI modellerinin farklı versiyonlarını saklayabilmelidir.
  - AI Orchestrator, AI modellerinin versiyonları arasında geçiş yapabilmelidir.
  - AI Orchestrator, AI modellerinin versiyonları arasındaki farkları gösterebilmelidir.
  - Model versiyon geçmişi, kullanıcı arayüzünden görüntülenebilmelidir.

#### 3.5.2. Model Performans İzleme

- **Gereksinim**: AI Orchestrator, AI modellerinin performansını izleyebilmelidir.
- **Açıklama**: AI Orchestrator, AI modellerinin doğruluk, hassasiyet, geri çağırma gibi performans metriklerini izleyebilmelidir.
- **Kabul Kriterleri**:
  - AI Orchestrator, AI modellerinin doğruluk, hassasiyet, geri çağırma gibi performans metriklerini izleyebilmelidir.
  - AI Orchestrator, AI modellerinin performans metriklerini görselleştirebilmelidir.
  - AI Orchestrator, AI modellerinin performans metriklerini dışa aktarabilmelidir.
  - Model performansı, kullanıcı arayüzünden izlenebilmelidir.

#### 3.5.3. Model Dağıtımı

- **Gereksinim**: AI Orchestrator, AI modellerinin dağıtımını yönetebilmelidir.
- **Açıklama**: AI Orchestrator, AI modellerinin farklı ortamlara (geliştirme, test, üretim) dağıtımını yönetebilmelidir.
- **Kabul Kriterleri**:
  - AI Orchestrator, AI modellerinin farklı ortamlara dağıtımını yönetebilmelidir.
  - AI Orchestrator, AI modellerinin dağıtım durumunu izleyebilmelidir.
  - AI Orchestrator, AI modellerinin dağıtımını geri alabilmelidir.
  - Model dağıtımı, kullanıcı arayüzünden yönetilebilmelidir.

## 4. Fonksiyonel Gereksinim Öncelikleri

Beta aşamasında geliştirilecek yeni fonksiyonel gereksinimlerin öncelikleri aşağıdaki gibidir:

| Gereksinim | Öncelik | Tahmini Geliştirme Süresi |
|------------|---------|---------------------------|
| API Versiyonlama | Yüksek | 2 hafta |
| API Dokümantasyonu | Yüksek | 1 hafta |
| API Analitikleri | Orta | 2 hafta |
| Gelişmiş Segmentasyon Algoritmaları | Yüksek | 3 hafta |
| Toplu Segmentasyon | Orta | 2 hafta |
| Segmentasyon Sonuçlarının Dışa Aktarılması | Düşük | 1 hafta |
| İş Önceliklendirme | Yüksek | 1 hafta |
| İş Zamanlama | Orta | 2 hafta |
| İş Bağımlılıkları | Düşük | 2 hafta |
| Gelişmiş Arama | Yüksek | 2 hafta |
| Arşiv Versiyonlama | Orta | 2 hafta |
| Arşiv Paylaşımı | Düşük | 1 hafta |
| Model Versiyonlama | Yüksek | 2 hafta |
| Model Performans İzleme | Orta | 2 hafta |
| Model Dağıtımı | Düşük | 2 hafta |

## 5. Fonksiyonel Gereksinim Bağımlılıkları

Beta aşamasında geliştirilecek yeni fonksiyonel gereksinimlerin bağımlılıkları aşağıdaki gibidir:

- **API Versiyonlama**: Bağımlılık yok
- **API Dokümantasyonu**: API Versiyonlama
- **API Analitikleri**: Bağımlılık yok
- **Gelişmiş Segmentasyon Algoritmaları**: Bağımlılık yok
- **Toplu Segmentasyon**: İş Önceliklendirme
- **Segmentasyon Sonuçlarının Dışa Aktarılması**: Bağımlılık yok
- **İş Önceliklendirme**: Bağımlılık yok
- **İş Zamanlama**: Bağımlılık yok
- **İş Bağımlılıkları**: İş Önceliklendirme
- **Gelişmiş Arama**: Bağımlılık yok
- **Arşiv Versiyonlama**: Bağımlılık yok
- **Arşiv Paylaşımı**: Bağımlılık yok
- **Model Versiyonlama**: Bağımlılık yok
- **Model Performans İzleme**: Bağımlılık yok
- **Model Dağıtımı**: Model Versiyonlama

## 6. Sonuç

Bu belge, ALT_LAS projesinin beta aşaması için fonksiyonel gereksinimleri içermektedir. Bu gereksinimler, alpha aşamasında toplanan kullanıcı geri bildirimleri, performans analizi, hata analizi ve öğrenilen dersler doğrultusunda belirlenmiştir. Beta aşamasında, mevcut fonksiyonel özelliklerin iyileştirilmesi ve yeni fonksiyonel özelliklerin eklenmesi hedeflenmektedir.
