# Çoklu GPU Desteği Testleri

Bu dizin, ALT_LAS projesinde çoklu GPU desteği için yazılmış testleri içerir.

## Test Türleri

1. **Birim Testleri**: Her bir bileşenin işlevselliğini ayrı ayrı test eder.
2. **Entegrasyon Testleri**: Bileşenlerin birlikte çalışmasını test eder.
3. **Performans Testleri**: Çoklu GPU desteğinin performans etkisini ölçer.

## Test Dosyaları

- `test_gpu_pool_manager.py`: GPU Havuzu Yöneticisi için birim testleri
- `test_gpu_selection_strategy.py`: GPU Seçim Stratejisi için birim testleri
- `test_workload_distributor.py`: İş Yükü Dağıtıcı için birim testleri
- `test_api_extensions.py`: API Genişletmeleri için birim testleri
- `test_integration.py`: Bileşenlerin entegrasyonu için testler
- `test_performance.py`: Performans ölçümleri için testler
- `run_tests.py`: Tüm testleri çalıştırmak için betik

## Gereksinimler

Testleri çalıştırmak için aşağıdaki paketlerin yüklü olması gerekir:

```bash
pip install pytest
pip install flask
```

## Testleri Çalıştırma

Tüm testleri çalıştırmak için:

```bash
python run_tests.py --all
```

Sadece birim testlerini çalıştırmak için:

```bash
python run_tests.py --unit
```

Sadece entegrasyon testlerini çalıştırmak için:

```bash
python run_tests.py --integration
```

Sadece performans testlerini çalıştırmak için:

```bash
python run_tests.py --performance
```

## Test Sonuçları

Test sonuçları, konsola yazdırılır. Her test türü için başarı/başarısızlık durumu ve toplam çalışma süresi raporlanır.

### Örnek Çıktı

```
=== Tüm Testler ===

=== Birim Testleri ===

test_abstract_methods (test_gpu_pool_manager.TestGPUPoolManager) ... ok
test_get_all_gpu_info (test_gpu_pool_manager.TestGPUPoolManager) ... ok
test_reserve_and_release_gpu (test_gpu_pool_manager.TestGPUPoolManager) ... ok
test_get_available_gpus (test_gpu_pool_manager.TestGPUPoolManager) ... ok
test_init (test_gpu_pool_manager.TestNVMLGPUPoolManager) ... ok
test_discover_gpus (test_gpu_pool_manager.TestNVMLGPUPoolManager) ... ok
test_get_gpu_info (test_gpu_pool_manager.TestNVMLGPUPoolManager) ... ok
...

=== Entegrasyon Testleri ===

test_gpu_selection_and_distribution (test_integration.TestIntegration) ... ok
test_api_predict_and_status (test_integration.TestIntegration) ... ok
test_batch_processing (test_integration.TestIntegration) ... ok

=== Performans Testleri ===

test_single_vs_multi_gpu_throughput (test_performance.TestPerformance) ... ok
Tek GPU Throughput: 45.23 görev/saniye
İki GPU Throughput: 89.76 görev/saniye
Hızlanma Faktörü: 1.98x

test_batch_processing_performance (test_performance.TestPerformance) ... ok
Batch İşleme Throughput: 95.34 görev/saniye
Ortalama Batch İşleme Süresi: 0.1048 saniye

test_concurrent_requests (test_performance.TestPerformance) ... ok
Eşzamanlı İstekler: 20
Ortalama Yanıt Süresi: 0.0723 saniye
95. Persentil Yanıt Süresi: 0.0912 saniye
99. Persentil Yanıt Süresi: 0.0987 saniye

=== Test Sonuçları ===

Birim Testleri: Başarılı
Entegrasyon Testleri: Başarılı
Performans Testleri: Başarılı
Toplam Süre: 12.45 saniye
```

## Notlar

- Birim testleri, gerçek GPU'lar olmadan çalışabilir çünkü tüm GPU işlemleri mock'lanmıştır.
- Entegrasyon testleri, bileşenlerin birlikte çalışmasını test eder ancak yine gerçek GPU'lar gerekmez.
- Performans testleri, gerçek GPU'lar olmadan da çalışabilir ancak gerçek performans ölçümleri için gerçek GPU'lar gereklidir.
- Gerçek GPU'lar üzerinde test yapmak için, `MockGPUPoolManager` yerine `NVMLGPUPoolManager` kullanılmalıdır.
