# ALT_LAS Entegrasyon Test Planı

Bu belge, ALT_LAS projesindeki servisler arasındaki entegrasyonu test etmek için bir plan sunmaktadır. Özellikle API Gateway (İşçi 1) ve Segmentation Service (İşçi 2) arasındaki entegrasyona odaklanılmıştır.

## 1. Test Edilecek Entegrasyon Noktaları

### 1.1. API Gateway - Segmentation Service Entegrasyonu

| API Endpoint | HTTP Metodu | Açıklama |
|--------------|-------------|----------|
| `/segment` | POST | Komut segmentasyonu isteği gönderme |
| `/segment/:id` | GET | Segmentasyon durumunu sorgulama |
| `/alt-files` | GET | ALT dosyalarını listeleme |
| `/alt-files/:filename` | GET | Belirli bir ALT dosyasını alma |
| `/alt-files/:filename` | DELETE | Belirli bir ALT dosyasını silme |

### 1.2. Segmentation Service - Runner Service Entegrasyonu

| Fonksiyon | Açıklama |
|-----------|----------|
| `execute_task` | Bir görevi çalıştırma |
| `get_task_status` | Görev durumunu sorgulama |
| `cancel_task` | Bir görevi iptal etme |

### 1.3. Segmentation Service - AI Orchestrator Entegrasyonu

| Fonksiyon | Açıklama |
|-----------|----------|
| `process_llm` | LLM ile metin işleme |
| `process_vision` | Vision modeli ile görüntü işleme |
| `get_models_info` | Mevcut modeller hakkında bilgi alma |

### 1.4. Segmentation Service - OS Integration Service Entegrasyonu

| Fonksiyon | Açıklama |
|-----------|----------|
| `get_platform_info` | Platform bilgisi alma |
| `list_directory` | Dizin içeriğini listeleme |
| `list_processes` | Çalışan süreçleri listeleme |
| `capture_screenshot` | Ekran görüntüsü alma |

## 2. Test Senaryoları

### 2.1. API Gateway - Segmentation Service Entegrasyonu

#### 2.1.1. Temel Komut Segmentasyonu

**Amaç**: API Gateway üzerinden Segmentation Service'e komut gönderme ve segmentasyon sonuçlarını alma.

**Adımlar**:
1. API Gateway'in `/segment` endpoint'ine POST isteği gönder
2. Dönen yanıttan task ID'yi al
3. `/segment/:id` endpoint'i ile segmentasyon durumunu kontrol et
4. `/alt-files/:filename` endpoint'i ile oluşturulan ALT dosyasını al
5. ALT dosyasının içeriğini doğrula

**Beklenen Sonuç**: Komut başarıyla segmentlere ayrılmalı ve ALT dosyası oluşturulmalı.

#### 2.1.2. ALT Dosya Yönetimi

**Amaç**: API Gateway üzerinden ALT dosyalarını listeleme, alma ve silme işlemlerini test etme.

**Adımlar**:
1. Birden fazla komut segmentasyonu yaparak ALT dosyaları oluştur
2. `/alt-files` endpoint'i ile ALT dosyalarını listele
3. Belirli bir ALT dosyasını `/alt-files/:filename` endpoint'i ile al
4. Belirli bir ALT dosyasını `/alt-files/:filename` endpoint'i ile sil
5. Dosyanın silindiğini doğrula

**Beklenen Sonuç**: ALT dosyaları başarıyla listelenebilmeli, alınabilmeli ve silinebilmeli.

### 2.2. Segmentation Service - Runner Service Entegrasyonu

#### 2.2.1. Görev Çalıştırma

**Amaç**: Segmentation Service'in Runner Service'e görev göndermesini ve sonuçları almasını test etme.

**Adımlar**:
1. Segmentation Service'te bir ALT dosyası oluştur
2. ALT dosyasındaki görevleri Runner Service'e gönder
3. Görev durumunu periyodik olarak kontrol et
4. Görev tamamlandığında sonuçları al

**Beklenen Sonuç**: Görevler başarıyla Runner Service'e gönderilmeli, çalıştırılmalı ve sonuçlar alınabilmeli.

#### 2.2.2. Görev İptal Etme

**Amaç**: Segmentation Service'in Runner Service'teki bir görevi iptal etmesini test etme.

**Adımlar**:
1. Uzun sürecek bir görev başlat
2. Görevin çalıştığını doğrula
3. Görevi iptal et
4. Görevin iptal edildiğini doğrula

**Beklenen Sonuç**: Görev başarıyla iptal edilmeli ve durumu "cancelled" olarak güncellenmelidir.

### 2.3. Segmentation Service - AI Orchestrator Entegrasyonu

#### 2.3.1. LLM İşleme

**Amaç**: Segmentation Service'in AI Orchestrator'ı kullanarak LLM işleme yapmasını test etme.

**Adımlar**:
1. Segmentation Service'te bir metin işleme görevi oluştur
2. Metni AI Orchestrator'a gönder
3. İşleme sonuçlarını al
4. Sonuçları doğrula

**Beklenen Sonuç**: Metin başarıyla işlenmeli ve anlamlı sonuçlar dönmelidir.

#### 2.3.2. Model Bilgisi Alma

**Amaç**: Segmentation Service'in AI Orchestrator'dan model bilgilerini almasını test etme.

**Adımlar**:
1. AI Orchestrator'dan mevcut modellerin listesini al
2. Model bilgilerini doğrula

**Beklenen Sonuç**: Mevcut modellerin listesi başarıyla alınmalıdır.

### 2.4. Segmentation Service - OS Integration Service Entegrasyonu

#### 2.4.1. Platform Bilgisi Alma

**Amaç**: Segmentation Service'in OS Integration Service'ten platform bilgilerini almasını test etme.

**Adımlar**:
1. OS Integration Service'ten platform bilgilerini al
2. Bilgileri doğrula

**Beklenen Sonuç**: Platform bilgileri (işletim sistemi, sürüm, vb.) başarıyla alınmalıdır.

#### 2.4.2. Dosya Sistemi İşlemleri

**Amaç**: Segmentation Service'in OS Integration Service aracılığıyla dosya sistemi işlemlerini yapmasını test etme.

**Adımlar**:
1. Belirli bir dizinin içeriğini listele
2. Dizin içeriğini doğrula

**Beklenen Sonuç**: Dizin içeriği başarıyla listelenmelidir.

## 3. Test Ortamı Kurulumu

### 3.1. Gerekli Servisler

- API Gateway (Node.js/Express)
- Segmentation Service (Python/FastAPI)
- Runner Service (Rust)
- AI Orchestrator (Python)
- OS Integration Service (Rust/C++)

### 3.2. Docker Compose Yapılandırması

```yaml
version: '3'
services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    environment:
      - SEGMENTATION_SERVICE_URL=http://segmentation-service:8000
      - RUNNER_SERVICE_URL=http://runner-service:8080
      - AI_ORCHESTRATOR_URL=http://ai-orchestrator:8080
      - OS_INTEGRATION_SERVICE_URL=http://os-integration-service:8080
    depends_on:
      - segmentation-service
      - runner-service
      - ai-orchestrator
      - os-integration-service

  segmentation-service:
    build: ./segmentation-service
    ports:
      - "8000:8000"
    environment:
      - RUNNER_SERVICE_URL=http://runner-service:8080
      - AI_ORCHESTRATOR_URL=http://ai-orchestrator:8080
      - OS_INTEGRATION_SERVICE_URL=http://os-integration-service:8080

  runner-service:
    build: ./runner-service
    ports:
      - "8080:8080"
    environment:
      - AI_ORCHESTRATOR_URL=http://ai-orchestrator:8080
      - OS_INTEGRATION_SERVICE_URL=http://os-integration-service:8080

  ai-orchestrator:
    build: ./ai-orchestrator
    ports:
      - "8081:8080"

  os-integration-service:
    build: ./os-integration-service
    ports:
      - "8082:8080"
```

### 3.3. Mock Servisler

Bazı servisler henüz tam olarak geliştirilmediği için, entegrasyon testleri sırasında mock servisler kullanılabilir:

- **Mock Runner Service**: Görev çalıştırma ve durum sorgulama isteklerine yanıt veren basit bir servis.
- **Mock AI Orchestrator**: LLM ve Vision işleme isteklerine yanıt veren basit bir servis.
- **Mock OS Integration Service**: Platform bilgisi ve dosya sistemi işlemleri için yanıt veren basit bir servis.

## 4. Test Otomasyon Araçları

### 4.1. API Testleri için Araçlar

- **Postman/Newman**: API endpoint'lerini test etmek için
- **pytest**: Python tabanlı testler için
- **Jest**: JavaScript tabanlı testler için

### 4.2. Entegrasyon Testleri için Araçlar

- **Docker Compose**: Test ortamını kurmak için
- **pytest-asyncio**: Asenkron entegrasyon testleri için
- **Supertest**: Node.js API testleri için

## 5. Test Uygulama Planı

### 5.1. Hazırlık Aşaması

1. Test ortamını Docker Compose ile kur
2. Gerekli mock servisleri hazırla
3. Test veri setlerini oluştur

### 5.2. Test Uygulama Aşaması

1. API Gateway - Segmentation Service entegrasyon testlerini çalıştır
2. Segmentation Service - Runner Service entegrasyon testlerini çalıştır
3. Segmentation Service - AI Orchestrator entegrasyon testlerini çalıştır
4. Segmentation Service - OS Integration Service entegrasyon testlerini çalıştır
5. Uçtan uca entegrasyon testlerini çalıştır

### 5.3. Raporlama Aşaması

1. Test sonuçlarını topla
2. Başarısız testleri analiz et
3. Hataları düzelt ve testleri tekrar çalıştır
4. Test raporunu oluştur

## 6. Görev Dağılımı

### 6.1. İşçi 1 (API Gateway) Görevleri

- API Gateway'deki mock implementasyonları gerçek Segmentation Service çağrılarıyla değiştirme
- API Gateway - Segmentation Service entegrasyon testlerini yazma
- API Gateway tarafındaki hata işleme mekanizmalarını geliştirme
- API Gateway dokümantasyonunu güncelleme

### 6.2. İşçi 2 (Segmentation Service) Görevleri

- Segmentation Service'teki entegrasyon modülünü tamamlama
- Segmentation Service - Runner Service entegrasyon testlerini yazma
- Segmentation Service - AI Orchestrator entegrasyon testlerini yazma
- Segmentation Service - OS Integration Service entegrasyon testlerini yazma
- Segmentation Service dokümantasyonunu güncelleme

## 7. Zaman Çizelgesi

| Görev | Sorumlu | Tahmini Süre |
|-------|---------|--------------|
| Test ortamı kurulumu | İşçi 1 & İşçi 2 | 1 gün |
| Mock servislerin hazırlanması | İşçi 2 | 2 gün |
| API Gateway entegrasyon geliştirmeleri | İşçi 1 | 3 gün |
| Segmentation Service entegrasyon geliştirmeleri | İşçi 2 | 3 gün |
| Entegrasyon testlerinin yazılması | İşçi 1 & İşçi 2 | 4 gün |
| Test çalıştırma ve hata düzeltme | İşçi 1 & İşçi 2 | 2 gün |
| Dokümantasyon güncelleme | İşçi 1 & İşçi 2 | 1 gün |
| **Toplam** | | **16 gün** |

## 8. Başarı Kriterleri

- Tüm entegrasyon noktaları için testlerin yazılmış olması
- Testlerin %90'ının başarıyla geçmesi
- Entegrasyon hatalarının belgelenmiş ve çözülmüş olması
- Dokümantasyonun güncellenmiş olması

Bu test planı, ALT_LAS projesindeki servisler arasındaki entegrasyonu test etmek için bir çerçeve sunmaktadır. Plan, özellikle API Gateway (İşçi 1) ve Segmentation Service (İşçi 2) arasındaki entegrasyona odaklanmaktadır, ancak diğer servislerle olan entegrasyonları da kapsamaktadır.
