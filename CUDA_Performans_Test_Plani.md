# CUDA Performans Test Planı

## 1. Giriş

### 1.1 Amaç

Bu doküman, ALT_LAS projesindeki CUDA ile hızlandırılmış servislerin ve fonksiyonların performansını ölçmek için kapsamlı bir test planı sunmaktadır. Bu plan, CUDA entegrasyonunun sağladığı performans kazanımlarını değerlendirmek, potansiyel darboğazları tespit etmek ve sistemin yüksek yük altındaki davranışını anlamak amacıyla oluşturulmuştur.

### 1.2 Kapsam

Bu test planı, aşağıdaki servisleri ve fonksiyonları kapsamaktadır:

- **ai-orchestrator**: AI modellerinin yönetimi ve çalıştırılması
- **segmentation-service**: Metin segmentasyonu ve analizi
- **Kritik İş Akışları**: Bu servislerin birlikte çalıştığı temel iş akışları

### 1.3 Hedefler

- CUDA entegrasyonu sonrası performans kazanımlarını ölçmek
- 95. ve 99. persentil yanıt sürelerini belirlemek
- Sistemin maksimum kapasitesini ve ölçeklenebilirliğini değerlendirmek
- Potansiyel darboğazları ve performans sorunlarını tespit etmek
- Farklı yük koşulları altında sistemin davranışını anlamak

## 2. Test Ortamı

### 2.1 Donanım Gereksinimleri

| Bileşen | Özellikler |
|---------|------------|
| CPU     | Intel Xeon E5-2680 v4 (14 çekirdek, 2.40GHz) veya eşdeğeri |
| RAM     | 64GB DDR4 |
| GPU     | NVIDIA GeForce RTX 4060 (8GB GDDR6) |
| Depolama| 500GB SSD |
| Ağ      | 10 Gbps Ethernet |

### 2.2 Yazılım Gereksinimleri

| Yazılım | Versiyon |
|---------|----------|
| İşletim Sistemi | Ubuntu 20.04 LTS |
| CUDA Toolkit | 12.6 |
| Docker | 24.0.5 veya üzeri |
| NVIDIA Container Toolkit | En son sürüm |
| Python | 3.11 |
| Locust | 2.15.1 veya üzeri |
| Prometheus | 2.45.0 veya üzeri |
| Grafana | 10.0.3 veya üzeri |

### 2.3 Test Ortamı Kurulumu

1. CUDA Uyumlu Geliştirme Ortamı Docker imajını kullanarak test ortamını kurun:
   ```bash
   docker run --gpus all -d --name altlas-test-env -p 8080:8080 -p 9090:9090 altlas-dev:cuda-12.6-py3.11-v1.0
   ```

2. Prometheus ve Grafana'yı kurun ve yapılandırın:
   ```bash
   docker run -d --name prometheus -p 9090:9090 -v /path/to/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
   docker run -d --name grafana -p 3000:3000 grafana/grafana
   ```

3. Test araçlarını yükleyin:
   ```bash
   pip install locust pytest pytest-benchmark
   ```

## 3. Test Senaryoları

### 3.1 ai-orchestrator Servisi Test Senaryoları

#### 3.1.1 Model Yükleme Performansı

| Test ID | TS-AIO-001 |
|---------|------------|
| Açıklama | AI modellerinin GPU'ya yüklenme süresini ölçer |
| Ön Koşullar | ai-orchestrator servisi çalışır durumda olmalı |
| Test Adımları | 1. Farklı boyutlardaki modelleri (küçük, orta, büyük) yükleme isteği gönder<br>2. Yükleme sürelerini ölç |
| Beklenen Sonuçlar | CUDA entegrasyonu ile model yükleme süreleri CPU'ya göre en az %50 daha hızlı olmalı |
| Ölçülecek Metrikler | - Model yükleme süresi (ms)<br>- GPU bellek kullanımı (MB)<br>- GPU kullanım oranı (%) |

#### 3.1.2 LLM Çıkarım Performansı

| Test ID | TS-AIO-002 |
|---------|------------|
| Açıklama | LLM modellerinin çıkarım performansını ölçer |
| Ön Koşullar | ai-orchestrator servisi çalışır durumda ve model yüklenmiş olmalı |
| Test Adımları | 1. Farklı uzunluklarda metin girdileri ile `/api/llm` endpoint'ine istek gönder<br>2. Yanıt sürelerini ölç |
| Beklenen Sonuçlar | CUDA entegrasyonu ile çıkarım süreleri CPU'ya göre en az %70 daha hızlı olmalı |
| Ölçülecek Metrikler | - Yanıt süresi (ms)<br>- Token/saniye oranı<br>- GPU bellek kullanımı (MB)<br>- GPU kullanım oranı (%) |

#### 3.1.3 Paralel İstek İşleme

| Test ID | TS-AIO-003 |
|---------|------------|
| Açıklama | ai-orchestrator'ın paralel istekleri işleme kapasitesini ölçer |
| Ön Koşullar | ai-orchestrator servisi çalışır durumda ve model yüklenmiş olmalı |
| Test Adımları | 1. Artan sayıda eşzamanlı istek gönder (10, 50, 100, 200, 500)<br>2. Yanıt sürelerini ve hata oranlarını ölç |
| Beklenen Sonuçlar | Sistem, 100 eşzamanlı isteği %1'den düşük hata oranıyla işleyebilmeli |
| Ölçülecek Metrikler | - Saniyedeki istek sayısı (RPS)<br>- Yanıt süresi (ms)<br>- 95. ve 99. persentil yanıt süreleri<br>- Hata oranı (%)<br>- GPU bellek kullanımı (MB)<br>- GPU kullanım oranı (%) |

### 3.2 segmentation-service Servisi Test Senaryoları

#### 3.2.1 Metin Segmentasyonu Performansı

| Test ID | TS-SEG-001 |
|---------|------------|
| Açıklama | Metin segmentasyonu işleminin performansını ölçer |
| Ön Koşullar | segmentation-service servisi çalışır durumda olmalı |
| Test Adımları | 1. Farklı uzunluklarda metin girdileri ile `/api/v1/segment` endpoint'ine istek gönder<br>2. Yanıt sürelerini ölç |
| Beklenen Sonuçlar | CUDA entegrasyonu ile segmentasyon süreleri CPU'ya göre en az %40 daha hızlı olmalı |
| Ölçülecek Metrikler | - Yanıt süresi (ms)<br>- İşlenen karakter/saniye oranı<br>- GPU bellek kullanımı (MB)<br>- GPU kullanım oranı (%) |

#### 3.2.2 Toplu Segmentasyon Performansı

| Test ID | TS-SEG-002 |
|---------|------------|
| Açıklama | Toplu metin segmentasyonu işleminin performansını ölçer |
| Ön Koşullar | segmentation-service servisi çalışır durumda olmalı |
| Test Adımları | 1. Farklı sayıda metin içeren toplu istekler ile `/api/v1/segment/batch` endpoint'ine istek gönder<br>2. Yanıt sürelerini ölç |
| Beklenen Sonuçlar | CUDA entegrasyonu ile toplu segmentasyon süreleri CPU'ya göre en az %60 daha hızlı olmalı |
| Ölçülecek Metrikler | - Yanıt süresi (ms)<br>- İşlenen belge/saniye oranı<br>- GPU bellek kullanımı (MB)<br>- GPU kullanım oranı (%) |

#### 3.2.3 Paralel İstek İşleme

| Test ID | TS-SEG-003 |
|---------|------------|
| Açıklama | segmentation-service'in paralel istekleri işleme kapasitesini ölçer |
| Ön Koşullar | segmentation-service servisi çalışır durumda olmalı |
| Test Adımları | 1. Artan sayıda eşzamanlı istek gönder (10, 50, 100, 200, 500)<br>2. Yanıt sürelerini ve hata oranlarını ölç |
| Beklenen Sonuçlar | Sistem, 200 eşzamanlı isteği %1'den düşük hata oranıyla işleyebilmeli |
| Ölçülecek Metrikler | - Saniyedeki istek sayısı (RPS)<br>- Yanıt süresi (ms)<br>- 95. ve 99. persentil yanıt süreleri<br>- Hata oranı (%)<br>- GPU bellek kullanımı (MB)<br>- GPU kullanım oranı (%) |

### 3.3 Kritik İş Akışları Test Senaryoları

#### 3.3.1 Uçtan Uca Metin İşleme

| Test ID | TS-WF-001 |
|---------|------------|
| Açıklama | Metin segmentasyonu ve LLM işleme adımlarını içeren uçtan uca iş akışını test eder |
| Ön Koşullar | ai-orchestrator ve segmentation-service servisleri çalışır durumda olmalı |
| Test Adımları | 1. Metin segmentasyonu için istek gönder<br>2. Segmentasyon sonucunu al<br>3. LLM işleme için istek gönder<br>4. Toplam işlem süresini ölç |
| Beklenen Sonuçlar | CUDA entegrasyonu ile uçtan uca işlem süresi CPU'ya göre en az %60 daha hızlı olmalı |
| Ölçülecek Metrikler | - Toplam işlem süresi (ms)<br>- Her adımın işlem süresi (ms)<br>- 95. ve 99. persentil yanıt süreleri<br>- GPU bellek kullanımı (MB)<br>- GPU kullanım oranı (%) |

## 4. Test Araçları

### 4.1 Locust

Locust, API yük testleri için kullanılacak ana araçtır. Python ile yazılmış, dağıtık ve kullanıcı davranışlarını simüle edebilen bir yük test aracıdır.

#### 4.1.1 Locust Kurulumu

```bash
pip install locust
```

#### 4.1.2 Locust Yapılandırması

Locust testleri için `locustfile.py` dosyası oluşturulacaktır. Bu dosya, test senaryolarını ve kullanıcı davranışlarını tanımlar.

### 4.2 Prometheus ve Grafana

Prometheus ve Grafana, test sırasında sistem metriklerini toplamak ve görselleştirmek için kullanılacaktır.

#### 4.2.1 Prometheus Yapılandırması

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ai-orchestrator'
    static_configs:
      - targets: ['ai-orchestrator:8080']
  - job_name: 'segmentation-service'
    static_configs:
      - targets: ['segmentation-service:8080']
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
  - job_name: 'nvidia-dcgm-exporter'
    static_configs:
      - targets: ['nvidia-dcgm-exporter:9400']
```

## 5. Test Prosedürü

### 5.1 Test Hazırlığı

1. Test ortamını kurun ve tüm servislerin çalıştığından emin olun
2. Prometheus ve Grafana'yı yapılandırın ve çalıştırın
3. Test verilerini hazırlayın (örnek metinler, API istekleri vb.)
4. Locust test scriptlerini hazırlayın

### 5.2 Test Yürütme

1. Temel performans ölçümlerini almak için CPU tabanlı testleri çalıştırın
2. CUDA entegrasyonu ile testleri çalıştırın
3. Her test senaryosu için aşağıdaki adımları izleyin:
   - Düşük yük testi (10 eşzamanlı kullanıcı)
   - Orta yük testi (50 eşzamanlı kullanıcı)
   - Yüksek yük testi (100 eşzamanlı kullanıcı)
   - Stres testi (200+ eşzamanlı kullanıcı)
4. Her test için metrikleri kaydedin ve analiz edin

### 5.3 Test Sonrası Analiz

1. CPU ve GPU tabanlı testlerin sonuçlarını karşılaştırın
2. Performans kazanımlarını hesaplayın
3. 95. ve 99. persentil yanıt sürelerini analiz edin
4. Darboğazları ve performans sorunlarını tespit edin
5. Optimizasyon önerileri oluşturun

## 6. Raporlama

### 6.1 Test Raporu İçeriği

Test raporu aşağıdaki bölümleri içerecektir:

1. **Yönetici Özeti**: Test sonuçlarının genel bir özeti ve önemli bulgular
2. **Test Ortamı**: Kullanılan donanım ve yazılım yapılandırması
3. **Test Senaryoları ve Sonuçları**: Her test senaryosu için detaylı sonuçlar
4. **Performans Metrikleri**: Yanıt süreleri, RPS, hata oranları vb.
5. **Karşılaştırmalı Analiz**: CPU ve GPU performans karşılaştırması
6. **Darboğazlar ve Sorunlar**: Tespit edilen performans sorunları
7. **Öneriler**: Performans iyileştirme önerileri
8. **Ekler**: Ham test verileri, grafikler ve ek bilgiler

### 6.2 Rapor Formatı

Test raporu, Markdown formatında hazırlanacak ve aşağıdaki dosya yapısında teslim edilecektir:

```
CUDA_Performans_Test_Raporu/
├── README.md (Yönetici Özeti)
├── test_ortami.md
├── test_senaryolari/
│   ├── ai_orchestrator_testleri.md
│   ├── segmentation_service_testleri.md
│   └── kritik_is_akislari_testleri.md
├── performans_metrikleri.md
├── karsilastirmali_analiz.md
├── darbogazlar_ve_sorunlar.md
├── oneriler.md
└── ekler/
    ├── ham_veriler/
    ├── grafikler/
    └── ek_bilgiler.md
```

## 7. Yük Testi Scriptleri

### 7.1 ai-orchestrator Locust Scripti

```python
from locust import HttpUser, task, between
import json
import random

class AIOrchestrator(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # API anahtarı veya token alınabilir
        pass
    
    @task(3)
    def test_llm_processing(self):
        # Farklı uzunluklarda metin örnekleri
        text_samples = [
            "Bu kısa bir metin örneğidir.",
            "Bu orta uzunlukta bir metin örneğidir. Birkaç cümle içerir ve LLM tarafından işlenecektir.",
            "Bu uzun bir metin örneğidir. " + "Lorem ipsum dolor sit amet. " * 10
        ]
        
        # Rastgele bir metin örneği seç
        text = random.choice(text_samples)
        
        # LLM işleme isteği gönder
        payload = {
            "input": text,
            "parameters": {
                "max_tokens": 100,
                "temperature": 0.7
            }
        }
        
        headers = {"Content-Type": "application/json"}
        response = self.client.post("/api/llm", json=payload, headers=headers)
        
        # Yanıt kontrolü
        if response.status_code != 200:
            print(f"Hata: {response.status_code}, {response.text}")
```

### 7.2 segmentation-service Locust Scripti

```python
from locust import HttpUser, task, between
import json
import random

class SegmentationService(HttpUser):
    wait_time = between(1, 3)
    
    @task(2)
    def test_segment(self):
        # Farklı uzunluklarda metin örnekleri
        text_samples = [
            "Bu kısa bir metin örneğidir.",
            "Bu orta uzunlukta bir metin örneğidir. Birkaç cümle içerir ve segmentasyon servisi tarafından işlenecektir.",
            "Bu uzun bir metin örneğidir. " + "Lorem ipsum dolor sit amet. " * 10
        ]
        
        # Rastgele bir metin örneği seç
        text = random.choice(text_samples)
        
        # Segmentasyon isteği gönder
        payload = {
            "text": text,
            "parameters": {
                "language": "tr",
                "mode": "normal",
                "persona": "researcher"
            }
        }
        
        headers = {"Content-Type": "application/json"}
        response = self.client.post("/api/v1/segment", json=payload, headers=headers)
        
        # Yanıt kontrolü
        if response.status_code != 200:
            print(f"Hata: {response.status_code}, {response.text}")
    
    @task(1)
    def test_segment_batch(self):
        # Toplu segmentasyon için metin örnekleri
        texts = [
            "Birinci metin örneği.",
            "İkinci metin örneği.",
            "Üçüncü metin örneği."
        ]
        
        # Toplu segmentasyon isteği gönder
        payload = {
            "texts": texts,
            "parameters": {
                "language": "tr",
                "mode": "normal",
                "persona": "researcher"
            }
        }
        
        headers = {"Content-Type": "application/json"}
        response = self.client.post("/api/v1/segment/batch", json=payload, headers=headers)
        
        # Yanıt kontrolü
        if response.status_code != 200:
            print(f"Hata: {response.status_code}, {response.text}")
```

## 8. Sonuç

Bu performans test planı, ALT_LAS projesindeki CUDA entegrasyonunun sağladığı performans kazanımlarını ölçmek ve değerlendirmek için kapsamlı bir çerçeve sunmaktadır. Test sonuçları, CUDA entegrasyonunun başarısını değerlendirmek ve potansiyel iyileştirme alanlarını belirlemek için kullanılacaktır.

---

**Hazırlayan:** QA Mühendisi - Ayşe Kaya  
**Tarih:** 2025-05-22
