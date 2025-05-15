# Performans Test Senaryosu Şablonu

**Senaryo ID:** PT-GPU-001  
**Senaryo Adı:** GPU Ön Isıtma Persentil Performans Testi  
**Hazırlayan:** QA Mühendisi (Ayşe Kaya)  
**Tarih:** 2025-06-15  
**İlgili Servis:** ai-orchestrator

## 1. Test Amacı

Bu test senaryosu, GPU ön ısıtma mekanizmasının 95. ve 99. persentil yanıt süreleri üzerindeki etkisini ölçmeyi amaçlamaktadır. Test, soğuk başlangıç durumu ile ön ısıtılmış GPU durumu arasındaki performans farkını karşılaştıracaktır.

## 2. Test Ortamı

- **Donanım:** 2x NVIDIA A100 (40GB) GPU, 64 çekirdekli CPU, 512 GB RAM
- **Yazılım:** Ubuntu 22.04 LTS, CUDA 12.2, Docker 24.0, Kubernetes 1.26
- **Test Araçları:** k6 0.46, Prometheus 2.45, Grafana 10.0, NVIDIA Nsight Systems
- **Test Verileri:** Standart test veri seti (1000 örnek)

## 3. Ön Koşullar

1. Test ortamı hazır ve erişilebilir durumda olmalıdır.
2. ai-orchestrator servisi kurulu ve çalışır durumda olmalıdır.
3. Test için kullanılacak modeller hazır ve erişilebilir olmalıdır.
4. İzleme altyapısı (Prometheus, Grafana) kurulu ve yapılandırılmış olmalıdır.
5. GPU ön ısıtma mekanizması devre dışı bırakılabilir olmalıdır.

## 4. Test Adımları

### 4.1 Soğuk Başlangıç Testi

1. Tüm servisleri durdurun ve GPU belleğini temizleyin:
   ```bash
   kubectl delete deployment ai-orchestrator
   nvidia-smi --gpu-reset
   ```

2. GPU ön ısıtma mekanizmasını devre dışı bırakarak servisi başlatın:
   ```bash
   kubectl apply -f ai-orchestrator-no-warmup.yaml
   ```

3. Servisin hazır olduğunu doğrulayın:
   ```bash
   kubectl wait --for=condition=ready pod -l app=ai-orchestrator --timeout=300s
   ```

4. k6 ile yük testini başlatın:
   ```bash
   k6 run -e TEST_TYPE=cold_start gpu_warmup_test.js
   ```

5. Test sırasında aşağıdaki metrikleri kaydedin:
   - Ortalama yanıt süresi
   - Medyan yanıt süresi
   - 95. persentil yanıt süresi
   - 99. persentil yanıt süresi
   - GPU bellek kullanımı
   - GPU kullanım oranı

6. Test tamamlandıktan sonra sonuçları kaydedin ve servisi durdurun:
   ```bash
   kubectl delete deployment ai-orchestrator
   ```

### 4.2 Ön Isıtılmış GPU Testi

1. GPU ön ısıtma mekanizmasını etkinleştirerek servisi başlatın:
   ```bash
   kubectl apply -f ai-orchestrator-with-warmup.yaml
   ```

2. Servisin hazır olduğunu ve GPU ön ısıtma işleminin tamamlandığını doğrulayın:
   ```bash
   kubectl wait --for=condition=ready pod -l app=ai-orchestrator --timeout=300s
   kubectl logs -l app=ai-orchestrator | grep "GPU warmup completed"
   ```

3. k6 ile aynı yük testini başlatın:
   ```bash
   k6 run -e TEST_TYPE=warm_start gpu_warmup_test.js
   ```

4. Test sırasında aynı metrikleri kaydedin.

5. Test tamamlandıktan sonra sonuçları kaydedin.

## 5. Test Verileri

Test için aşağıdaki veri seti kullanılacaktır:

- **Model:** BERT-base (110M parametre)
- **Giriş Verileri:** Standart NLP test veri seti (1000 örnek)
- **İstek Yapısı:**
  ```json
  {
    "text": "Sample text for processing",
    "max_length": 128,
    "temperature": 0.7
  }
  ```

## 6. Beklenen Sonuçlar

1. **Soğuk Başlangıç:**
   - 95. persentil yanıt süresi: < 500 ms
   - 99. persentil yanıt süresi: < 1000 ms

2. **Ön Isıtılmış GPU:**
   - 95. persentil yanıt süresi: < 200 ms
   - 99. persentil yanıt süresi: < 500 ms

3. **İyileştirme Beklentisi:**
   - 95. persentil yanıt süresinde en az %50 iyileştirme
   - 99. persentil yanıt süresinde en az %40 iyileştirme

## 7. Kabul Kriterleri

1. Ön ısıtılmış GPU ile 95. persentil yanıt süresi 200 ms'den düşük olmalıdır.
2. Ön ısıtılmış GPU ile 99. persentil yanıt süresi 500 ms'den düşük olmalıdır.
3. Soğuk başlangıç ile ön ısıtılmış GPU arasında en az %40 performans iyileştirmesi olmalıdır.
4. Test sırasında hata oranı %1'den düşük olmalıdır.

## 8. Test Sonuçları Raporlama

Test sonuçları aşağıdaki formatta raporlanacaktır:

| Metrik | Soğuk Başlangıç | Ön Isıtılmış GPU | İyileştirme (%) |
|--------|-----------------|------------------|-----------------|
| Ortalama Yanıt Süresi (ms) | | | |
| Medyan Yanıt Süresi (ms) | | | |
| 95. Persentil Yanıt Süresi (ms) | | | |
| 99. Persentil Yanıt Süresi (ms) | | | |
| Maksimum Yanıt Süresi (ms) | | | |
| RPS | | | |
| Hata Oranı (%) | | | |
| GPU Bellek Kullanımı (MB) | | | |
| GPU Kullanım Oranı (%) | | | |

## 9. Ek Bilgiler

- Test sırasında Grafana panosu: http://monitoring.altlas.local/grafana/d/gpu-performance
- Test sonuçları: `/test-results/gpu-warmup-test-results.json`
- Test senaryosu kodu: `/test-scripts/gpu_warmup_test.js`

## 10. Revizyon Geçmişi

| Versiyon | Tarih | Değişiklikler | Değiştiren |
|----------|-------|---------------|------------|
| 1.0 | 2025-06-15 | İlk versiyon | Ayşe Kaya |
