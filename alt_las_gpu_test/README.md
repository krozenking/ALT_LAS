# ALT_LAS GPU Test

Bu proje, ALT_LAS sisteminin çoklu GPU desteğini test etmek için geliştirilmiştir. Tek bir GPU ile gerçek ortamda test yapılabilir ve çoklu GPU senaryoları simüle edilebilir.

## Proje Yapısı

```
alt_las_gpu_test/
├── config.yaml                # Konfigürasyon dosyası
├── gpu_pool_manager.py        # GPU Havuzu Yöneticisi
├── gpu_selection_strategy.py  # GPU Seçim Stratejisi
├── workload_distributor.py    # İş Yükü Dağıtıcı
├── api_extensions.py          # API Genişletmeleri
├── app.py                     # Ana uygulama
├── test_scripts/              # Test betikleri
│   ├── test_gpu_detection.py           # GPU algılama testi
│   ├── test_basic_functionality.py     # Temel işlevsellik testi
│   ├── test_concurrent_processing.py   # Eşzamanlı işlem testi
│   ├── test_performance.py             # Performans testi
│   ├── test_error_handling.py          # Hata durumu testi
│   └── run_all_tests.py                # Tüm testleri çalıştır
└── README.md                  # Bu dosya
```

## Gereksinimler

- Python 3.8+
- CUDA Toolkit 11.7+
- PyTorch veya TensorFlow (GPU desteği ile)
- NVIDIA NVML
- Flask

## Kurulum

1. Gerekli kütüphaneleri kurun:

```bash
pip install numpy torch torchvision torchaudio flask pynvml psutil requests pyyaml matplotlib
```

## Kullanım

### API'yi Çalıştırma

```bash
python app.py
```

Bu komut, Flask API'sini `http://localhost:8000` adresinde çalıştırır.

### Testleri Çalıştırma

Tüm testleri çalıştırmak için:

```bash
python test_scripts/run_all_tests.py
```

Belirli bir testi çalıştırmak için:

```bash
python test_scripts/test_gpu_detection.py
python test_scripts/test_basic_functionality.py
python test_scripts/test_concurrent_processing.py
python test_scripts/test_performance.py
python test_scripts/test_error_handling.py
```

## API Uç Noktaları

### GPU Bilgileri

- `GET /api/v1/gpus`: Tüm GPU'ların bilgilerini döndürür.
- `GET /api/v1/gpus/{gpu_id}`: Belirli bir GPU'nun bilgilerini döndürür.

### Tahmin API'si

- `POST /api/v1/predict`: Metin tahmin isteği gönderir ve bir GPU'da çalıştırır.
- `POST /api/v1/predict/batch`: Toplu metin tahmin isteği gönderir ve bir veya daha fazla GPU'da çalıştırır.

### Görev Yönetimi

- `GET /api/v1/tasks`: Tüm görevlerin durumlarını döndürür.
- `GET /api/v1/tasks/{task_id}`: Belirli bir görevin durumunu döndürür.
- `DELETE /api/v1/tasks/{task_id}`: Belirli bir görevi iptal eder.

### Batch Yönetimi

- `GET /api/v1/batches`: Tüm batch'lerin durumlarını döndürür.
- `GET /api/v1/batches/{batch_id}`: Belirli bir batch'in durumunu döndürür.
- `DELETE /api/v1/batches/{batch_id}`: Belirli bir batch'i iptal eder.

## Konfigürasyon

`config.yaml` dosyasında aşağıdaki ayarları yapılandırabilirsiniz:

### GPU Algılama ve Yönetimi

```yaml
gpu:
  detection:
    enabled: true                # GPU algılamayı etkinleştir/devre dışı bırak
    min_compute_capability: 7.0  # Minimum CUDA hesaplama yeteneği
    memory_threshold: 0.9        # GPU bellek kullanım eşiği
    utilization_threshold: 0.95  # GPU kullanım oranı eşiği
    max_temperature: 85          # Maksimum GPU sıcaklığı
    health_check_interval: 60    # GPU sağlık kontrolü aralığı (saniye)
```

### GPU Seçim Stratejisi

```yaml
gpu:
  selection:
    default_strategy: "single_gpu"  # Varsayılan GPU seçim stratejisi
    strategies:
      - "single_gpu"                # Tek GPU stratejisi
      - "round_robin"               # Round Robin stratejisi
      - "least_loaded"              # En Az Yüklü stratejisi
      - "memory_optimized"          # Bellek Optimizasyonlu strateji
      - "random"                    # Rastgele strateji
```

### İş Yükü Dağıtımı

```yaml
gpu:
  workload:
    queue_processing_interval: 0.1  # Kuyruk işleme aralığı (saniye)
    max_concurrent_tasks_per_gpu: 4 # GPU başına maksimum eşzamanlı görev
    batch_size: 8                   # Varsayılan batch boyutu
    timeout: 300                    # Görev zaman aşımı süresi (saniye)
    retry_count: 3                  # Başarısız görevler için yeniden deneme sayısı
```

### Test Ayarları

```yaml
test:
  detection:
    enabled: true                   # GPU algılama testini etkinleştir/devre dışı bırak

  basic_functionality:
    enabled: true                   # Temel işlevsellik testini etkinleştir/devre dışı bırak
    input_size: 1024                # Giriş boyutu
    output_size: 1024               # Çıkış boyutu
    duration: 5                     # Görev süresi (saniye)

  concurrent_processing:
    enabled: true                   # Eşzamanlı işlem testini etkinleştir/devre dışı bırak
    concurrent_tasks: 4             # Eşzamanlı görev sayısı
    task_count: 20                  # Toplam görev sayısı
    input_size: 1024                # Giriş boyutu
    output_size: 1024               # Çıkış boyutu
    duration: 2                     # Görev süresi (saniye)

  performance:
    enabled: true                   # Performans testini etkinleştir/devre dışı bırak
    scenarios:                      # Test senaryoları
      - name: "small_model"         # Küçük model senaryosu
        input_size: 1024            # Giriş boyutu
        output_size: 1024           # Çıkış boyutu
        duration: 5                 # Görev süresi (saniye)
      - name: "medium_model"        # Orta boy model senaryosu
        input_size: 4096            # Giriş boyutu
        output_size: 4096           # Çıkış boyutu
        duration: 5                 # Görev süresi (saniye)
      - name: "large_model"         # Büyük model senaryosu
        input_size: 8192            # Giriş boyutu
        output_size: 8192           # Çıkış boyutu
        duration: 5                 # Görev süresi (saniye)

  error_handling:
    enabled: true                   # Hata durumu testini etkinleştir/devre dışı bırak
    scenarios:                      # Test senaryoları
      - name: "gpu_overload"        # GPU aşırı yükleme senaryosu
        concurrent_tasks: 10        # Eşzamanlı görev sayısı
        input_size: 16384           # Giriş boyutu
        output_size: 16384          # Çıkış boyutu
        duration: 10                # Görev süresi (saniye)
      - name: "task_timeout"        # Görev zaman aşımı senaryosu
        input_size: 8192            # Giriş boyutu
        output_size: 8192           # Çıkış boyutu
        duration: 310               # Görev süresi (saniye)
```

## Lisans

Bu proje, MIT lisansı altında lisanslanmıştır.
