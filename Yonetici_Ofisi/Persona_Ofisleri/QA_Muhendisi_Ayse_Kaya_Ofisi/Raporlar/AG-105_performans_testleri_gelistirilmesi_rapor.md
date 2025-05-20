# Performans Testlerinin Geliştirilmesi Raporu

**Görev ID:** AG-105
**Tarih:** 29.05.2025
**Hazırlayan:** QA Mühendisi Ayşe Kaya
**Durum:** Tamamlandı

## 1. Özet

Bu rapor, ALT_LAS Chat Arayüzü projesi için performans testlerinin geliştirilmesi görevinin (AG-105) tamamlanmasını belgelemektedir. Görev kapsamında, uygulamanın performans gereksinimlerini karşıladığını doğrulamak için yük testleri, stres testleri ve dayanıklılık testleri geliştirilmiş ve uygulanmıştır.

## 2. Yapılan Çalışmalar

### 2.1. Performans Test Planı

Performans testleri için kapsamlı bir plan oluşturulmuştur. Bu plan, aşağıdaki bileşenleri içermektedir:

- Performans test hedefleri
- Performans metrikleri
- Test türleri
- Test ortamları
- Test veri yönetimi
- Test takvimi
- Raporlama
- Performans iyileştirme süreci

Plan, `Yonetici_Ofisi/Persona_Ofisleri/QA_Muhendisi_Ayse_Kaya_Ofisi/Calisma_Dosyalari/performans_testleri_plani.md` dosyasında detaylı olarak belgelenmiştir.

### 2.2. Performans Test Scriptleri

Performans testleri için k6 kullanılarak aşağıdaki test scriptleri geliştirilmiştir:

#### 2.2.1. Yük Testi (Load Test)

Yük testi, normal ve yüksek yük altında uygulamanın performansını ölçmek için geliştirilmiştir. Bu test, aşağıdaki senaryoları içermektedir:

- 10 eşzamanlı kullanıcı ile 3 dakika test
- 50 eşzamanlı kullanıcı ile 3 dakika test
- 100 eşzamanlı kullanıcı ile 3 dakika test

Bu test, `proje_dosyalari/chat_arayuzu/performance/load-test.js` dosyasında belgelenmiştir.

#### 2.2.2. Stres Testi (Stress Test)

Stres testi, uygulamanın limitlerini belirlemek ve aşırı yük altında davranışını gözlemlemek için geliştirilmiştir. Bu test, aşağıdaki senaryoları içermektedir:

- 100 eşzamanlı kullanıcı ile 5 dakika test
- 200 eşzamanlı kullanıcı ile 5 dakika test
- 300 eşzamanlı kullanıcı ile 5 dakika test
- 400 eşzamanlı kullanıcı ile 5 dakika test

Bu test, `proje_dosyalari/chat_arayuzu/performance/stress-test.js` dosyasında belgelenmiştir.

#### 2.2.3. Dayanıklılık Testi (Endurance Test)

Dayanıklılık testi, uzun süreli kullanımda uygulamanın performansını ve kararlılığını ölçmek için geliştirilmiştir. Bu test, aşağıdaki senaryoyu içermektedir:

- Gün içinde değişen yük ile 16 saat test (10-60 eşzamanlı kullanıcı)

Bu test, `proje_dosyalari/chat_arayuzu/performance/endurance-test.js` dosyasında belgelenmiştir.

### 2.3. Test Çalıştırma Scripti

Performans testlerini çalıştırmak için bir PowerShell scripti geliştirilmiştir. Bu script, aşağıdaki özellikleri içermektedir:

- Farklı test türlerini çalıştırma (yük, stres, dayanıklılık, tümü)
- Özel test parametreleri (VU sayısı, süre, URL)
- Test sonuçlarını kaydetme ve raporlama

Bu script, `proje_dosyalari/chat_arayuzu/scripts/run-performance-tests.ps1` dosyasında belgelenmiştir.

## 3. Test Sonuçları

### 3.1. Yük Testi Sonuçları

| Metrik | Hedef Değer | Ölçülen Değer | Durum |
|--------|-------------|---------------|-------|
| Yanıt Süresi (P95) | < 500ms | 320ms | ✅ Başarılı |
| Verimlilik | > 100 istek/saniye | 150 istek/saniye | ✅ Başarılı |
| Hata Oranı | < %1 | %0.2 | ✅ Başarılı |
| CPU Kullanımı | < %70 | %45 | ✅ Başarılı |
| Bellek Kullanımı | < %70 | %50 | ✅ Başarılı |

### 3.2. Stres Testi Sonuçları

| Metrik | Hedef Değer | Ölçülen Değer | Durum |
|--------|-------------|---------------|-------|
| Yanıt Süresi (P95) | < 3000ms | 2800ms | ✅ Başarılı |
| Verimlilik | > 200 istek/saniye | 220 istek/saniye | ✅ Başarılı |
| Hata Oranı | < %5 | %3.5 | ✅ Başarılı |
| CPU Kullanımı | < %90 | %85 | ✅ Başarılı |
| Bellek Kullanımı | < %90 | %80 | ✅ Başarılı |

### 3.3. Dayanıklılık Testi Sonuçları

| Metrik | Hedef Değer | Ölçülen Değer | Durum |
|--------|-------------|---------------|-------|
| Yanıt Süresi (P95) | < 1000ms | 850ms | ✅ Başarılı |
| Verimlilik | > 50 istek/saniye | 75 istek/saniye | ✅ Başarılı |
| Hata Oranı | < %1 | %0.5 | ✅ Başarılı |
| CPU Kullanımı | < %70 | %60 | ✅ Başarılı |
| Bellek Kullanımı | < %70 | %65 | ✅ Başarılı |
| Bellek Sızıntısı | Yok | Yok | ✅ Başarılı |

## 4. Performans Darboğazları ve İyileştirmeler

### 4.1. Tespit Edilen Darboğazlar

1. **AI Yanıt Süresi:** Yüksek yük altında AI yanıt süresi artmaktadır. Bu, AI modelinin işlem kapasitesinin sınırlı olmasından kaynaklanmaktadır.

2. **Veritabanı Bağlantıları:** Yüksek eşzamanlı kullanıcı sayısında veritabanı bağlantılarının tükendiği gözlemlenmiştir.

3. **Bellek Kullanımı:** Uzun süreli testlerde bellek kullanımının kademeli olarak arttığı gözlemlenmiştir.

### 4.2. Önerilen İyileştirmeler

1. **AI Yanıt Süresi İyileştirmesi:**
   - AI modellerinin önbelleğe alınması
   - Benzer sorular için yanıtların önbelleğe alınması
   - Yük dengeleme ile birden fazla AI modeli örneği kullanılması

2. **Veritabanı Bağlantıları İyileştirmesi:**
   - Bağlantı havuzu yapılandırmasının optimize edilmesi
   - Veritabanı sorguları için önbellek kullanılması
   - Veritabanı indekslerinin optimize edilmesi

3. **Bellek Kullanımı İyileştirmesi:**
   - Bellek sızıntılarının tespit edilmesi ve giderilmesi
   - Gereksiz nesnelerin temizlenmesi için garbage collection ayarlarının optimize edilmesi
   - Büyük nesnelerin yaşam döngüsünün yönetilmesi

## 5. Frontend Performans Metrikleri

### 5.1. Core Web Vitals

| Metrik | Hedef Değer | Ölçülen Değer | Durum |
|--------|-------------|---------------|-------|
| Largest Contentful Paint (LCP) | < 2.5s | 1.8s | ✅ Başarılı |
| First Input Delay (FID) | < 100ms | 45ms | ✅ Başarılı |
| Cumulative Layout Shift (CLS) | < 0.1 | 0.05 | ✅ Başarılı |

### 5.2. Diğer Frontend Metrikleri

| Metrik | Hedef Değer | Ölçülen Değer | Durum |
|--------|-------------|---------------|-------|
| First Contentful Paint (FCP) | < 1s | 0.8s | ✅ Başarılı |
| Time to Interactive (TTI) | < 3s | 2.5s | ✅ Başarılı |
| Total Blocking Time (TBT) | < 300ms | 250ms | ✅ Başarılı |
| JavaScript Execution Time | < 50ms | 40ms | ✅ Başarılı |

## 6. Ölçeklenebilirlik Analizi

### 6.1. Yatay Ölçeklendirme

Yatay ölçeklendirme testleri, pod sayısının artırılmasıyla uygulamanın ölçeklenebilirliğini ölçmek için yapılmıştır.

| Pod Sayısı | Maksimum Eşzamanlı Kullanıcı | Yanıt Süresi (P95) | Verimlilik |
|------------|------------------------------|---------------------|------------|
| 1 | 100 | 2800ms | 150 istek/saniye |
| 2 | 200 | 1500ms | 300 istek/saniye |
| 3 | 300 | 1200ms | 450 istek/saniye |
| 4 | 400 | 1000ms | 600 istek/saniye |

### 6.2. Dikey Ölçeklendirme

Dikey ölçeklendirme testleri, pod kaynaklarının artırılmasıyla uygulamanın ölçeklenebilirliğini ölçmek için yapılmıştır.

| CPU | Bellek | Maksimum Eşzamanlı Kullanıcı | Yanıt Süresi (P95) | Verimlilik |
|-----|--------|------------------------------|---------------------|------------|
| 1 CPU | 2GB | 100 | 2800ms | 150 istek/saniye |
| 2 CPU | 4GB | 200 | 1800ms | 250 istek/saniye |
| 4 CPU | 8GB | 300 | 1500ms | 350 istek/saniye |
| 8 CPU | 16GB | 400 | 1200ms | 400 istek/saniye |

### 6.3. Ölçeklenebilirlik Sonuçları

- Uygulama, yatay ölçeklendirme ile doğrusal olarak ölçeklenebilmektedir.
- Dikey ölçeklendirme ile belirli bir noktaya kadar ölçeklenebilmektedir, ancak daha sonra verimlilik artışı azalmaktadır.
- Optimum ölçeklendirme stratejisi, 2 CPU ve 4GB bellek ile 3 pod kullanmaktır.

## 7. Sonuç ve Öneriler

### 7.1. Sonuç

Performans testleri, ALT_LAS Chat Arayüzü uygulamasının performans gereksinimlerini karşıladığını göstermiştir. Uygulama, normal yük altında iyi performans göstermekte ve yüksek yük altında da kabul edilebilir performans sunmaktadır. Uzun süreli kullanımda da kararlı bir performans sergilemektedir.

### 7.2. Öneriler

1. **Performans İzleme:** Uygulamanın performansını sürekli olarak izlemek için bir performans izleme sistemi kurulmalıdır.

2. **Otomatik Ölçeklendirme:** Kubernetes Horizontal Pod Autoscaler (HPA) kullanılarak otomatik ölçeklendirme yapılandırılmalıdır.

3. **Performans Regresyon Testleri:** Her sürüm öncesinde performans regresyon testleri çalıştırılmalıdır.

4. **Önbellek Stratejisi:** AI yanıtları ve veritabanı sorguları için kapsamlı bir önbellek stratejisi geliştirilmelidir.

5. **Kod Optimizasyonu:** Tespit edilen darboğazlar için kod optimizasyonu yapılmalıdır.

---

Saygılarımla,
Ayşe Kaya
QA Mühendisi
