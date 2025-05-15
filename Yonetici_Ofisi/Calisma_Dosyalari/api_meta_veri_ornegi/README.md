# API Meta Veri Tasarımı (GPU) - Örnek Uygulama

Bu örnek uygulama, ALT_LAS projesi CUDA entegrasyonu kapsamında API yanıtlarında işlem süresi ve GPU kaynağı kullanımı ile ilgili meta verilerin standart bir şekilde sunulması için geliştirilen mimari tasarımın bir implementasyonudur.

## Genel Bakış

Bu örnek uygulama, aşağıdaki bileşenleri içermektedir:

1. **GPU Meta Veri Toplayıcı (`gpu_metadata_collector.py`):** GPU kaynak kullanımı ve işlem süresi gibi performans metriklerini toplayan ve API yanıtlarına ekleyen fonksiyonları içerir.

2. **API Middleware (`api_middleware.py`):** API yanıtlarına meta verileri ekleyen middleware bileşenlerini içerir. FastAPI, Flask ve diğer ASGI uyumlu framework'ler için implementasyonlar sunar.

3. **Örnek FastAPI Uygulaması (`example_fastapi_app.py`):** API Meta Veri Tasarımı'nın FastAPI ile nasıl kullanılacağını gösteren örnek bir uygulama içerir.

## Kurulum

### Gereksinimler

- Python 3.8+
- PyTorch
- NVIDIA GPU (opsiyonel, GPU olmadan da çalışır)
- CUDA Toolkit (GPU kullanılacaksa)
- FastAPI
- Uvicorn
- Pynvml

### Bağımlılıkları Yükleme

```bash
pip install torch fastapi uvicorn pynvml
```

## Kullanım

### Örnek Uygulamayı Çalıştırma

```bash
uvicorn example_fastapi_app:app --reload
```

Uygulama varsayılan olarak `http://localhost:8000` adresinde çalışacaktır.

### API Endpoint'leri

- **GET /:** Kök endpoint
- **GET /health:** Sağlık kontrolü endpoint'i
- **POST /api/v1/predict:** Metin tahmin endpoint'i
- **GET /api/v1/models:** Modelleri listeleyen endpoint
- **GET /api/v1/gpu/status:** GPU durumunu döndüren endpoint

### Swagger Dokümantasyonu

API dokümantasyonuna `http://localhost:8000/docs` adresinden erişilebilir.

## Meta Veri Yapısı

API yanıtlarına eklenen meta veri yapısı aşağıdaki gibidir:

```json
{
  "meta": {
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-05-31T14:30:15.123Z",
    "processing_time": {
      "total_ms": 120.45,
      "components": {
        "preprocessing_ms": 15.32,
        "inference_ms": 98.76,
        "postprocessing_ms": 6.37
      }
    },
    "gpu_resources": {
      "device_id": 0,
      "device_name": "NVIDIA A100",
      "memory_used_mb": 1024.5,
      "memory_total_mb": 40960,
      "utilization_percent": 35.8,
      "temperature_c": 65
    },
    "trace_id": "1-62be1272-1b71aa9db0b02a0b31fe29de",
    "version": "1.0"
  },
  "status": "success",
  "data": {
    // API'ye özgü yanıt verileri
  },
  "error": null
}
```

## Entegrasyon Kılavuzu

### Dekoratör Yaklaşımı

API endpoint'lerinize meta veri toplama özelliği eklemek için `gpu_metrics_collector` dekoratörünü kullanabilirsiniz:

```python
from gpu_metadata_collector import gpu_metrics_collector

@app.route('/api/v1/predict', methods=['POST'])
@gpu_metrics_collector
def predict():
    # API işlemleri
    result = model.predict(request.json['data'])
    return jsonify(result)
```

### Middleware Yaklaşımı

Tüm API yanıtlarına meta veri eklemek için middleware yaklaşımını kullanabilirsiniz:

```python
from api_middleware import MetadataMiddleware

# FastAPI için
app = FastAPI()
app.add_middleware(MetadataMiddleware)

# Flask için
app = Flask(__name__)
app.wsgi_app = FlaskMetadataMiddleware(app.wsgi_app)
```

### Ayrıntılı İzleme Noktaları

Daha detaylı performans analizi için, API işlem akışının kritik noktalarında izleme noktaları ekleyebilirsiniz:

```python
from gpu_metadata_collector import MetricsTracer

def process_request(data):
    with MetricsTracer.span("preprocessing"):
        preprocessed_data = preprocess(data)
    
    with MetricsTracer.span("inference"):
        result = model(preprocessed_data)
    
    with MetricsTracer.span("postprocessing"):
        final_result = postprocess(result)
    
    return final_result
```

### Yapılandırma

Meta veri toplama davranışını yapılandırmak için `configure_metadata_collection` fonksiyonunu kullanabilirsiniz:

```python
from gpu_metadata_collector import configure_metadata_collection

configure_metadata_collection({
    "detail_level": "full",  # "minimal", "standard", "full"
    "sampling_rate": 0.1,    # 1.0 = tüm istekler, 0.1 = %10 örnekleme
    "components": {
        "processing_time": {
            "include_components": True
        },
        "gpu_resources": {
            "include_temperature": False
        }
    }
})
```

## Performans Etkileri

Meta veri toplama mekanizması, API yanıt sürelerini minimal düzeyde etkileyecek şekilde tasarlanmıştır. Ancak, yüksek yük altında veya sınırlı kaynaklara sahip sistemlerde, örnekleme stratejisi kullanarak performans etkisini azaltabilirsiniz:

```python
configure_metadata_collection({
    "sampling_rate": 0.1  # Sadece isteklerin %10'u için meta veri topla
})
```

## Güvenlik Notları

- GPU kaynak kullanımı gibi sistem bilgileri, potansiyel olarak hassas bilgiler içerebilir. Üretim ortamında, bu bilgilerin kimler tarafından görülebileceğini kontrol etmek için uygun erişim kontrolleri uygulanmalıdır.
- Detay seviyesini yapılandırarak, hassas bilgilerin API yanıtlarında görünmesini engelleyebilirsiniz.

## Lisans

Bu örnek uygulama, ALT_LAS projesi kapsamında geliştirilmiş olup, projenin lisans koşullarına tabidir.

## İletişim

Bu örnek uygulama hakkında sorularınız veya geri bildirimleriniz için Yazılım Mimarı (Elif Yılmaz) ile iletişime geçebilirsiniz.
