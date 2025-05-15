# Performans Test Planı (GPU) - 95/99 Persentil Yanıt Süreleri Ölçümü

**Doküman No:** ALT_LAS-QA-001  
**Versiyon:** 1.0  
**Tarih:** 2025-06-14  
**Hazırlayan:** QA Mühendisi (Ayşe Kaya)  
**İlgili Görev:** KM-1.4 - Performans Test Planı Güncelleme

## 1. Giriş

### 1.1 Amaç

Bu doküman, ALT_LAS projesinde CUDA entegrasyonu kapsamında gerçekleştirilecek performans testlerinin planını tanımlamaktadır. Özellikle, 95. ve 99. persentil yanıt süreleri ölçümü için test stratejisi, metodolojisi ve araçları detaylandırılmaktadır. Bu plan, GPU kaynak kullanımı ve işlem süresi meta verilerini içeren API yanıtlarının performans karakteristiklerinin doğru ve tutarlı bir şekilde ölçülmesini sağlayacaktır.

### 1.2 Kapsam

Bu performans test planı, aşağıdaki bileşenleri kapsamaktadır:

- 95. ve 99. persentil yanıt süreleri ölçüm metodolojisi
- Performans test senaryoları ve test verileri
- Test ortamı ve altyapısı gereksinimleri
- Test araçları ve izleme mekanizmaları
- Performans metrikleri ve kabul kriterleri
- Test sonuçlarının raporlanması ve analizi

### 1.3 Hedef Kitle

Bu doküman, ALT_LAS projesinde çalışan QA mühendisleri, DevOps mühendisleri, backend geliştiricileri ve proje yöneticileri için hazırlanmıştır.

### 1.4 Referanslar

- ALT_LAS Proje Planı
- CUDA Entegrasyon Planı
- API Meta Veri Tasarımı (GPU) Dokümanı
- GPU Ön Isıtma PoC Dokümantasyonu
- Mevcut Performans Test Planı (v0.9)

## 2. Performans Metrikleri ve Ölçüm Metodolojisi

### 2.1 Temel Performans Metrikleri

ALT_LAS projesinde CUDA entegrasyonu sonrasında izlenecek temel performans metrikleri şunlardır:

1. **Yanıt Süresi (Response Time):**
   - Ortalama yanıt süresi (ms)
   - Medyan yanıt süresi (ms)
   - 95. persentil yanıt süresi (ms)
   - 99. persentil yanıt süresi (ms)
   - Maksimum yanıt süresi (ms)

2. **Throughput:**
   - Saniyedeki istek sayısı (RPS)
   - Saniyedeki işlem sayısı (TPS)

3. **Kaynak Kullanımı:**
   - CPU kullanımı (%)
   - Bellek kullanımı (MB)
   - GPU bellek kullanımı (MB)
   - GPU kullanımı (%)
   - Disk I/O (MB/s)
   - Ağ I/O (MB/s)

4. **Hata Oranları:**
   - Başarısız isteklerin oranı (%)
   - Zaman aşımına uğrayan isteklerin oranı (%)

### 2.2 Persentil Yanıt Süreleri Ölçüm Metodolojisi

Persentil yanıt süreleri, kullanıcı deneyimini daha iyi yansıtan metriklerdir. Ortalama ve medyan değerler, uç değerlerden etkilenebilir ve gerçek kullanıcı deneyimini tam olarak yansıtmayabilir. Bu nedenle, 95. ve 99. persentil yanıt süreleri, sistemin performans karakteristiklerini daha iyi anlamak için kritik öneme sahiptir.

#### 2.2.1 Persentil Hesaplama Yöntemi

Persentil yanıt süreleri, aşağıdaki adımlarla hesaplanacaktır:

1. Test süresi boyunca tüm isteklerin yanıt süreleri kaydedilir.
2. Yanıt süreleri küçükten büyüğe sıralanır.
3. 95. persentil için, sıralanmış yanıt sürelerinin %95'inci değeri alınır.
4. 99. persentil için, sıralanmış yanıt sürelerinin %99'uncu değeri alınır.

Örneğin, 1000 istek yapıldıysa:
- 95. persentil, 950. sıradaki yanıt süresidir.
- 99. persentil, 990. sıradaki yanıt süresidir.

#### 2.2.2 Ölçüm Noktaları

Yanıt süreleri, aşağıdaki noktalarda ölçülecektir:

1. **İstemci Tarafı (End-to-End):**
   - İstek gönderildiği andan yanıt alındığı ana kadar geçen süre
   - Ağ gecikmelerini ve istemci işleme sürelerini içerir

2. **Sunucu Tarafı (Server-Side):**
   - İstek sunucuya ulaştığı andan yanıt gönderildiği ana kadar geçen süre
   - API Meta Veri Tasarımı'nda tanımlanan `processing_time` metriği

3. **Bileşen Bazlı:**
   - Ön işleme süresi (`preprocessing_ms`)
   - Çıkarım süresi (`inference_ms`)
   - Son işleme süresi (`postprocessing_ms`)

### 2.3 Veri Toplama ve Analiz

Persentil yanıt sürelerinin doğru bir şekilde ölçülmesi için, aşağıdaki veri toplama ve analiz yöntemleri kullanılacaktır:

1. **Sürekli İzleme:**
   - Prometheus ve Grafana ile gerçek zamanlı izleme
   - API Meta Veri yanıtlarından toplanan performans metrikleri
   - Sistem kaynak kullanımı metrikleri

2. **Yük Testi Sonuçları:**
   - JMeter, Locust veya k6 ile yapılan yük testlerinden elde edilen veriler
   - Test senaryolarına göre ayrıştırılmış persentil değerleri

3. **Histogram ve Isı Haritaları:**
   - Yanıt sürelerinin dağılımını gösteren histogramlar
   - Zaman içindeki persentil değişimlerini gösteren ısı haritaları

4. **Anomali Tespiti:**
   - Persentil değerlerindeki ani değişimlerin tespiti
   - Performans sorunlarının erken uyarı mekanizmaları

## 3. Test Senaryoları

### 3.1 Temel Test Senaryoları

Aşağıdaki temel test senaryoları, 95. ve 99. persentil yanıt sürelerinin ölçülmesi için kullanılacaktır:

1. **Temel Yük Testi:**
   - Sabit RPS ile sürekli yük
   - Kademeli artan yük
   - Kademeli azalan yük

2. **Dayanıklılık Testi (Endurance Test):**
   - Uzun süreli (4+ saat) sabit yük
   - Persentil değerlerinin zaman içindeki değişimi

3. **Stres Testi:**
   - Maksimum kapasiteyi aşan yük
   - Persentil değerlerinin bozulma noktası

4. **Spike Testi:**
   - Ani yük artışları ve azalışları
   - Persentil değerlerinin ani değişimlere tepkisi

5. **Karışık Trafik Testi:**
   - Farklı API endpoint'lerine eş zamanlı istekler
   - Gerçek kullanım senaryolarını simüle eden trafik modelleri

### 3.2 GPU Spesifik Test Senaryoları

CUDA entegrasyonu sonrasında, GPU kullanımını ve performansını değerlendirmek için aşağıdaki özel test senaryoları eklenmiştir:

1. **GPU Ön Isıtma Testi:**
   - Soğuk başlangıç vs. ön ısıtılmış GPU performansı karşılaştırması
   - Ön ısıtma sonrası persentil değerlerindeki iyileşme

2. **GPU Bellek Kullanımı Testi:**
   - Farklı boyutlardaki modeller için bellek kullanımı ve persentil değerleri
   - Bellek sızıntılarının persentil değerlerine etkisi

3. **Çoklu Model Yükleme Testi:**
   - Birden fazla modelin eş zamanlı yüklenmesi ve kullanılması
   - Model değiştirme senaryolarında persentil değerleri

4. **Batch İşleme Testi:**
   - Farklı batch boyutlarının persentil değerlerine etkisi
   - Optimal batch boyutu belirleme

5. **Karma Hassasiyet (Mixed Precision) Testi:**
   - FP32 vs. FP16 vs. INT8 hassasiyetlerinin persentil değerlerine etkisi
   - Hassasiyet/performans dengesi analizi

### 3.3 Servis Spesifik Test Senaryoları

ALT_LAS projesindeki her servis için özel test senaryoları tanımlanacaktır. Örnek olarak:

1. **ai-orchestrator Servisi:**
   - Model yükleme ve değiştirme senaryoları
   - Çoklu model çıkarım senaryoları
   - Önbellekleme etkinliği senaryoları

2. **segmentation-service Servisi:**
   - Farklı boyutlardaki giriş verileri
   - Farklı segmentasyon algoritmaları
   - Batch işleme senaryoları

3. **API Gateway:**
   - Yönlendirme ve yük dengeleme senaryoları
   - Hata durumları ve geri dönüş senaryoları
   - Kimlik doğrulama ve yetkilendirme senaryoları

## 4. Test Ortamı ve Altyapısı

### 4.1 Test Ortamları

Performans testleri, aşağıdaki ortamlarda gerçekleştirilecektir:

1. **Geliştirme Ortamı:**
   - Temel performans testleri
   - Geliştirme sırasında hızlı geri bildirim

2. **Test Ortamı:**
   - Kapsamlı performans testleri
   - Üretim benzeri yapılandırma
   - İzole edilmiş kaynaklar

3. **Ön Üretim Ortamı:**
   - Üretim ortamının birebir kopyası
   - Son doğrulama testleri
   - Kanarya testleri

### 4.2 Donanım Gereksinimleri

Test ortamları için aşağıdaki donanım gereksinimleri tanımlanmıştır:

1. **GPU Sunucuları:**
   - En az 2x NVIDIA A100 (40GB) GPU
   - 64 çekirdekli CPU
   - 512 GB RAM
   - 2 TB NVMe SSD

2. **Yük Oluşturucu Sunucular:**
   - En az 2 sunucu
   - 32 çekirdekli CPU
   - 128 GB RAM
   - 1 TB SSD

3. **İzleme Sunucusu:**
   - 16 çekirdekli CPU
   - 64 GB RAM
   - 2 TB SSD (zaman serisi veritabanı için)

### 4.3 Yazılım Gereksinimleri

Test ortamları için aşağıdaki yazılım gereksinimleri tanımlanmıştır:

1. **İşletim Sistemi:**
   - Ubuntu 22.04 LTS

2. **Konteyner Orkestrasyon:**
   - Kubernetes 1.26+
   - Docker 24.0+

3. **GPU Yazılımları:**
   - NVIDIA Driver 535+
   - CUDA Toolkit 12.2+
   - cuDNN 8.9+
   - TensorRT 8.6+

4. **İzleme Araçları:**
   - Prometheus 2.45+
   - Grafana 10.0+
   - Jaeger 1.47+
   - OpenTelemetry Collector

5. **Test Araçları:**
   - JMeter 5.6+
   - k6 0.46+
   - Locust 2.16+

## 5. Test Araçları ve İzleme Mekanizmaları

### 5.1 Yük Testi Araçları

Performans testleri için aşağıdaki araçlar kullanılacaktır:

1. **k6:**
   - Modern, geliştirici dostu yük testi aracı
   - JavaScript ile test senaryoları yazma
   - Persentil metriklerini doğrudan destekler
   - Prometheus entegrasyonu

2. **JMeter:**
   - Kapsamlı ve olgun yük testi aracı
   - GUI ile test senaryoları oluşturma
   - Geniş eklenti ekosistemi
   - Detaylı raporlama özellikleri

3. **Locust:**
   - Python tabanlı yük testi aracı
   - Gerçek kullanıcı davranışlarını simüle etme
   - Dağıtık test yapabilme
   - Web arayüzü ile gerçek zamanlı izleme

### 5.2 İzleme Araçları

Performans metriklerinin izlenmesi için aşağıdaki araçlar kullanılacaktır:

1. **Prometheus:**
   - Zaman serisi veritabanı
   - Metrik toplama ve depolama
   - PromQL ile sorgu yapabilme
   - Uyarı mekanizması

2. **Grafana:**
   - Metrik görselleştirme
   - Özelleştirilebilir panolar
   - Persentil görselleştirme için özel grafikler
   - Uyarı entegrasyonu

3. **Jaeger:**
   - Dağıtık izleme (distributed tracing)
   - İstek akışını uçtan uca izleme
   - Darboğaz analizi
   - Servisler arası etkileşimleri görselleştirme

4. **NVIDIA Nsight Systems:**
   - GPU performans profilleme
   - CUDA çekirdek analizi
   - GPU bellek kullanımı izleme
   - Darboğaz tespiti

### 5.3 Özel İzleme Mekanizmaları

95. ve 99. persentil yanıt sürelerinin doğru bir şekilde izlenmesi için aşağıdaki özel mekanizmalar geliştirilecektir:

1. **Persentil Hesaplama Servisi:**
   - API Meta Veri yanıtlarından toplanan verileri işleyen özel servis
   - Gerçek zamanlı persentil hesaplama
   - Zaman penceresi bazlı analiz (1 dk, 5 dk, 15 dk, 1 saat, 1 gün)
   - Anomali tespiti

2. **Özel Prometheus Exporters:**
   - API Meta Veri metriklerini Prometheus'a aktaran özel exporter
   - GPU kaynak kullanımı metriklerini toplayan exporter
   - Servis bazlı persentil metriklerini üreten exporter

3. **Grafana Panoları:**
   - Persentil yanıt süreleri için özel panolar
   - Isı haritaları ve histogramlar
   - Servis bazlı performans karşılaştırmaları
   - Trend analizi grafikleri

## 6. Test Yürütme Planı

### 6.1 Test Takvimi

Performans testleri, aşağıdaki takvime göre yürütülecektir:

1. **Hazırlık Aşaması (2025-06-14 - 2025-06-16):**
   - Test ortamlarının hazırlanması
   - Test araçlarının kurulumu ve yapılandırması
   - Test senaryolarının geliştirilmesi

2. **Temel Testler (2025-06-17 - 2025-06-18):**
   - Temel yük testleri
   - Persentil ölçüm mekanizmalarının doğrulanması
   - İzleme altyapısının test edilmesi

3. **GPU Spesifik Testler (2025-06-19 - 2025-06-20):**
   - GPU ön ısıtma testleri
   - Bellek kullanımı testleri
   - Çoklu model testleri

4. **Servis Spesifik Testler (2025-06-21 - 2025-06-22):**
   - ai-orchestrator testleri
   - segmentation-service testleri
   - API Gateway testleri

5. **Entegrasyon Testleri (2025-06-23 - 2025-06-24):**
   - Uçtan uca performans testleri
   - Servisler arası etkileşim testleri
   - Gerçek kullanım senaryoları testleri

6. **Raporlama ve Analiz (2025-06-25 - 2025-06-26):**
   - Test sonuçlarının analizi
   - Performans iyileştirme önerilerinin hazırlanması
   - Final raporun oluşturulması

### 6.2 Test Yürütme Prosedürü

Her test senaryosu için aşağıdaki adımlar izlenecektir:

1. **Test Öncesi Hazırlık:**
   - Test ortamının sıfırlanması
   - Gerekli servislerin başlatılması
   - Başlangıç metriklerinin kaydedilmesi

2. **Test Yürütme:**
   - Test senaryosunun çalıştırılması
   - Gerçek zamanlı izleme
   - Sorunların kaydedilmesi

3. **Test Sonrası Analiz:**
   - Metriklerin toplanması ve analizi
   - Persentil değerlerinin hesaplanması
   - Sonuçların kabul kriterleriyle karşılaştırılması

4. **Raporlama:**
   - Test sonuçlarının dokümante edilmesi
   - Grafiklerin ve görselleştirmelerin oluşturulması
   - Bulguların ve önerilerin kaydedilmesi

### 6.3 Kabul Kriterleri

95. ve 99. persentil yanıt süreleri için aşağıdaki kabul kriterleri belirlenmiştir:

1. **ai-orchestrator Servisi:**
   - 95. persentil: < 200 ms
   - 99. persentil: < 500 ms

2. **segmentation-service Servisi:**
   - 95. persentil: < 300 ms
   - 99. persentil: < 700 ms

3. **API Gateway:**
   - 95. persentil: < 50 ms
   - 99. persentil: < 100 ms

4. **Uçtan Uca (End-to-End):**
   - 95. persentil: < 500 ms
   - 99. persentil: < 1000 ms

Bu kriterler, normal yük koşulları altında (maksimum tasarım kapasitesinin %70'i) karşılanmalıdır. Stres testleri ve spike testleri için farklı kriterler uygulanacaktır.

## 7. Raporlama ve Analiz

### 7.1 Test Raporları

Her test senaryosu için aşağıdaki bilgileri içeren detaylı raporlar hazırlanacaktır:

1. **Test Özeti:**
   - Test senaryosu adı ve açıklaması
   - Test tarihi ve süresi
   - Test ortamı bilgileri

2. **Performans Metrikleri:**
   - Ortalama, medyan, 95. ve 99. persentil yanıt süreleri
   - Throughput değerleri (RPS/TPS)
   - Kaynak kullanımı metrikleri
   - Hata oranları

3. **Grafikler ve Görselleştirmeler:**
   - Yanıt süresi histogramları
   - Persentil değerlerinin zaman içindeki değişimi
   - Kaynak kullanımı grafikleri
   - Isı haritaları

4. **Bulgular ve Öneriler:**
   - Tespit edilen performans sorunları
   - Darboğaz analizleri
   - İyileştirme önerileri
   - Sonraki adımlar

### 7.2 Periyodik Performans Raporları

Proje süresince, aşağıdaki periyodik performans raporları hazırlanacaktır:

1. **Günlük Performans Özeti:**
   - Temel performans metriklerinin günlük özeti
   - Persentil değerlerindeki değişimler
   - Tespit edilen anomaliler

2. **Haftalık Performans Raporu:**
   - Detaylı performans analizi
   - Trend analizleri
   - İyileştirme çalışmalarının etkisi

3. **Sprint Sonu Performans Raporu:**
   - Sprint hedeflerine göre performans değerlendirmesi
   - Karşılaştırmalı analizler
   - Sonraki sprint için öneriler

4. **Milestone Performans Raporu:**
   - Kilometre taşı hedeflerine göre performans değerlendirmesi
   - Kapsamlı performans analizi
   - Stratejik öneriler

## 8. Sonuç ve Öneriler

Bu performans test planı, ALT_LAS projesinde CUDA entegrasyonu sonrasında 95. ve 99. persentil yanıt sürelerinin doğru ve tutarlı bir şekilde ölçülmesi için gerekli stratejileri, metodolojileri ve araçları tanımlamaktadır. Plan, proje ilerledikçe ve yeni gereksinimler ortaya çıktıkça güncellenecektir.

Önerilen yaklaşım, persentil yanıt sürelerinin hem sunucu tarafında hem de istemci tarafında ölçülmesini, GPU spesifik test senaryolarının eklenmesini ve özel izleme mekanizmalarının geliştirilmesini içermektedir. Bu yaklaşım, ALT_LAS projesinin performans hedeflerine ulaşmasında önemli bir adım olacaktır.

---

**Ek Bilgi:** Bu doküman, KM-1.4 (Performans Test Planı Güncelleme) görevi kapsamında hazırlanmış olup, QA Mühendisi (Ayşe Kaya) ve DevOps Mühendisi (Can Tekin) tarafından yürütülmektedir. Plan, proje yönetimi tarafından onaylandıktan sonra uygulamaya konulacaktır.
