# Performans Testleri Planı

## 1. Giriş

Bu belge, ALT_LAS Chat Arayüzü projesi için performans testleri planını tanımlar. Bu plan, uygulamanın performans gereksinimlerini karşıladığını doğrulamak için yapılacak testleri, kullanılacak araçları ve metodolojileri içerir.

## 2. Performans Test Hedefleri

- Uygulamanın yük altında davranışını ölçmek
- Performans darboğazlarını tespit etmek
- Ölçeklenebilirlik sınırlarını belirlemek
- Kullanıcı deneyimini etkileyen performans sorunlarını tespit etmek
- Performans iyileştirmelerinin etkisini ölçmek
- Performans regresyonlarını önlemek

## 3. Performans Metrikleri

### 3.1. Sunucu Tarafı Metrikleri

| Metrik | Açıklama | Hedef Değer |
|--------|----------|-------------|
| Yanıt Süresi | Sunucunun bir isteğe yanıt verme süresi | P95 < 500ms |
| Verimlilik | Birim zamanda işlenen istek sayısı | > 100 istek/saniye |
| Hata Oranı | Başarısız isteklerin oranı | < %1 |
| CPU Kullanımı | Sunucu CPU kullanım oranı | < %70 |
| Bellek Kullanımı | Sunucu bellek kullanım oranı | < %70 |
| Disk I/O | Disk okuma/yazma hızı | < 80% disk kapasitesi |
| Ağ Kullanımı | Ağ trafiği miktarı | < 70% ağ kapasitesi |

### 3.2. İstemci Tarafı Metrikleri

| Metrik | Açıklama | Hedef Değer |
|--------|----------|-------------|
| Sayfa Yükleme Süresi | Sayfanın tamamen yüklenmesi için geçen süre | < 2 saniye |
| İlk İçerik Boyama (FCP) | İlk içeriğin görüntülenme süresi | < 1 saniye |
| En Büyük İçerikli Boyama (LCP) | En büyük içeriğin görüntülenme süresi | < 2.5 saniye |
| İlk Giriş Gecikmesi (FID) | Kullanıcı etkileşimine yanıt verme süresi | < 100ms |
| Kümülatif Düzen Kayması (CLS) | Sayfa yüklenirken öğelerin kayma miktarı | < 0.1 |
| JavaScript Yürütme Süresi | JavaScript kodunun yürütülme süresi | < 50ms |
| Bellek Kullanımı | Tarayıcı bellek kullanım oranı | < 100MB |

### 3.3. AI Entegrasyonu Metrikleri

| Metrik | Açıklama | Hedef Değer |
|--------|----------|-------------|
| AI Yanıt Süresi | AI modelinin yanıt verme süresi | P95 < 3 saniye |
| Token İşleme Hızı | Saniyede işlenen token sayısı | > 20 token/saniye |
| Bellek Kullanımı | AI modeli bellek kullanım oranı | < 4GB |
| Hata Oranı | Başarısız AI isteklerinin oranı | < %2 |
| Eşzamanlı İstek Kapasitesi | Aynı anda işlenebilen istek sayısı | > 10 istek |

## 4. Test Türleri

### 4.1. Yük Testleri

**Amaç:** Normal ve yüksek yük altında uygulamanın performansını ölçmek.

**Araç:** k6

**Senaryolar:**
1. **Temel Yük Testi:** 50 eşzamanlı kullanıcı, 10 dakika süre
2. **Orta Yük Testi:** 100 eşzamanlı kullanıcı, 20 dakika süre
3. **Yüksek Yük Testi:** 200 eşzamanlı kullanıcı, 30 dakika süre

**Örnek k6 Scripti:**

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp-up to 50 users over 2 minutes
    { duration: '5m', target: 50 },  // Stay at 50 users for 5 minutes
    { duration: '2m', target: 100 }, // Ramp-up to 100 users over 2 minutes
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    { duration: '2m', target: 0 },   // Ramp-down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
  },
};

export default function () {
  const res = http.get('https://altlas.chat/api/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

### 4.2. Stres Testleri

**Amaç:** Uygulamanın limitlerini belirlemek ve aşırı yük altında davranışını gözlemlemek.

**Araç:** k6

**Senaryolar:**
1. **Aşamalı Stres Testi:** 50'den 500'e kadar artan kullanıcı sayısı, 30 dakika süre
2. **Ani Stres Testi:** Aniden 300 eşzamanlı kullanıcı, 10 dakika süre
3. **Uzun Süreli Stres Testi:** 200 eşzamanlı kullanıcı, 2 saat süre

**Örnek k6 Scripti:**

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 50 },   // Ramp-up to 50 users over 5 minutes
    { duration: '5m', target: 100 },  // Ramp-up to 100 users over 5 minutes
    { duration: '5m', target: 200 },  // Ramp-up to 200 users over 5 minutes
    { duration: '5m', target: 300 },  // Ramp-up to 300 users over 5 minutes
    { duration: '5m', target: 400 },  // Ramp-up to 400 users over 5 minutes
    { duration: '5m', target: 500 },  // Ramp-up to 500 users over 5 minutes
    { duration: '10m', target: 0 },   // Ramp-down to 0 users over 10 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1000ms
    http_req_failed: ['rate<0.05'],    // Less than 5% of requests should fail
  },
};

export default function () {
  const res = http.post('https://altlas.chat/api/chat', {
    message: 'Hello, AI!',
    model: 'gpt-3.5-turbo',
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 3000ms': (r) => r.timings.duration < 3000,
  });
  
  sleep(3);
}
```

### 4.3. Dayanıklılık Testleri

**Amaç:** Uzun süreli kullanımda uygulamanın performansını ve kararlılığını ölçmek.

**Araç:** k6

**Senaryolar:**
1. **24 Saat Testi:** 50 eşzamanlı kullanıcı, 24 saat süre
2. **Hafta Sonu Testi:** 30 eşzamanlı kullanıcı, 48 saat süre (hafta sonu boyunca)
3. **Değişken Yük Testi:** Gün içinde değişen yük, 24 saat süre

**Örnek k6 Scripti:**

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    // Simulate a full day with varying load
    { duration: '2h', target: 30 },   // Morning ramp-up
    { duration: '4h', target: 50 },   // Morning peak
    { duration: '2h', target: 40 },   // Midday
    { duration: '4h', target: 60 },   // Afternoon peak
    { duration: '4h', target: 30 },   // Evening
    { duration: '8h', target: 10 },   // Night
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
  },
};

export default function () {
  // Simulate user session
  // 1. Login
  let loginRes = http.post('https://altlas.chat/api/login', {
    username: 'test-user',
    password: 'test-password',
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });
  
  sleep(2);
  
  // 2. Send chat message
  let chatRes = http.post('https://altlas.chat/api/chat', {
    message: 'Hello, AI!',
    model: 'gpt-3.5-turbo',
  });
  
  check(chatRes, {
    'chat successful': (r) => r.status === 200,
  });
  
  sleep(5);
  
  // 3. Logout
  let logoutRes = http.post('https://altlas.chat/api/logout');
  
  check(logoutRes, {
    'logout successful': (r) => r.status === 200,
  });
  
  sleep(3);
}
```

### 4.4. Ölçeklenebilirlik Testleri

**Amaç:** Uygulamanın ölçeklenebilirliğini ölçmek ve kaynak kullanımını optimize etmek.

**Araç:** k6, Kubernetes

**Senaryolar:**
1. **Yatay Ölçeklendirme Testi:** Artan yük altında pod sayısını artırma
2. **Dikey Ölçeklendirme Testi:** Artan yük altında pod kaynaklarını artırma
3. **Otomatik Ölçeklendirme Testi:** HPA (Horizontal Pod Autoscaler) ile otomatik ölçeklendirme

**Örnek k6 Scripti:**

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 50 },   // Ramp-up to 50 users
    { duration: '10m', target: 100 }, // Ramp-up to 100 users
    { duration: '10m', target: 200 }, // Ramp-up to 200 users
    { duration: '10m', target: 300 }, // Ramp-up to 300 users
    { duration: '10m', target: 200 }, // Ramp-down to 200 users
    { duration: '10m', target: 100 }, // Ramp-down to 100 users
    { duration: '5m', target: 0 },    // Ramp-down to 0 users
  ],
};

export default function () {
  const res = http.get('https://altlas.chat/api/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}
```

### 4.5. Frontend Performans Testleri

**Amaç:** Frontend performansını ölçmek ve kullanıcı deneyimini iyileştirmek.

**Araç:** Lighthouse, WebPageTest

**Senaryolar:**
1. **Sayfa Yükleme Testi:** Ana sayfanın yükleme performansı
2. **Etkileşim Testi:** Kullanıcı etkileşimlerinin performansı
3. **Mobil Performans Testi:** Mobil cihazlarda performans

**Örnek Lighthouse Komutu:**

```bash
lighthouse https://altlas.chat --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless" --preset=desktop
```

## 5. Test Ortamları

### 5.1. Geliştirme Ortamı

- **URL:** https://dev.altlas.chat
- **Altyapı:** Kubernetes (1 node, 2 pod)
- **Kullanım:** Geliştirme sırasında temel performans testleri

### 5.2. Test Ortamı

- **URL:** https://test.altlas.chat
- **Altyapı:** Kubernetes (2 node, 4 pod)
- **Kullanım:** Kapsamlı performans testleri

### 5.3. Staging Ortamı

- **URL:** https://staging.altlas.chat
- **Altyapı:** Kubernetes (3 node, 6 pod)
- **Kullanım:** Üretim ortamına benzer performans testleri

### 5.4. Üretim Ortamı

- **URL:** https://altlas.chat
- **Altyapı:** Kubernetes (5 node, 10 pod)
- **Kullanım:** Canlı ortam, sadece smoke testleri

## 6. Test Veri Yönetimi

### 6.1. Test Verileri

- **Kullanıcı Profilleri:** 1000 test kullanıcısı
- **Sohbet Geçmişi:** Kullanıcı başına 10 sohbet, sohbet başına 20 mesaj
- **Dosya Yüklemeleri:** Farklı boyutlarda ve türlerde dosyalar (1KB - 10MB)

### 6.2. Veri Oluşturma

- Test verileri, test öncesinde otomatik olarak oluşturulacak
- Gerçekçi kullanıcı davranışlarını simüle eden veriler kullanılacak
- Veri oluşturma scriptleri, test ortamında çalıştırılacak

## 7. Test Takvimi

| Tarih | Test Türü | Ortam | Sorumlu |
|-------|-----------|-------|---------|
| 27.05.2025 | Yük Testleri | Test | QA Mühendisi |
| 28.05.2025 | Stres Testleri | Test | QA Mühendisi |
| 29.05.2025 | Dayanıklılık Testleri | Test | QA Mühendisi |
| 30.05.2025 | Ölçeklenebilirlik Testleri | Staging | QA Mühendisi, DevOps Mühendisi |
| 31.05.2025 | Frontend Performans Testleri | Staging | QA Mühendisi, Frontend Geliştirici |

## 8. Raporlama

### 8.1. Performans Test Raporu

Her test çalıştırması için aşağıdaki bilgileri içeren bir rapor oluşturulacak:

- Test türü ve senaryosu
- Test ortamı ve yapılandırması
- Test sonuçları (metrikler)
- Performans darboğazları ve sorunlar
- İyileştirme önerileri

### 8.2. Trend Analizi

Zaman içindeki performans değişimlerini izlemek için trend analizi yapılacak:

- Haftalık performans karşılaştırması
- Sürüm bazlı performans karşılaştırması
- Performans regresyonlarının tespiti

## 9. Performans İyileştirme Süreci

1. **Performans Sorunlarının Tespiti:** Performans testleri ile sorunların tespiti
2. **Analiz:** Sorunların kök nedenlerinin analizi
3. **İyileştirme:** Performans iyileştirmelerinin uygulanması
4. **Doğrulama:** İyileştirmelerin etkisinin ölçülmesi
5. **İzleme:** Sürekli performans izleme ve iyileştirme

## 10. Sonuç

Bu performans testleri planı, ALT_LAS Chat Arayüzü projesinin performans gereksinimlerini karşıladığını doğrulamak için yapılacak testleri, kullanılacak araçları ve metodolojileri tanımlar. Bu plan, uygulamanın performansını ölçmek, performans darboğazlarını tespit etmek ve performans iyileştirmelerinin etkisini ölçmek için kullanılacaktır.

---

Hazırlayan: QA Mühendisi Ayşe Kaya
Tarih: 27.05.2025
Versiyon: 1.0
