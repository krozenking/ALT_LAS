# Model Orchestrator Dokümantasyonu

## Genel Bakış

Model Orchestrator, AI Orchestrator bileşeni içinde çoklu yapay zeka modellerinin yönetimini, seçimini, paralel çalıştırılmasını ve sonuçların birleştirilmesini sağlayan modüler bir servistir. Bu servis, farklı model seçim stratejileri, paralel veya sıralı çalıştırma seçenekleri ve çeşitli sonuç birleştirme stratejileri sunarak esnek ve güçlü bir orkestrasyon altyapısı sağlar.

## Özellikler

### 1. Model Seçim Stratejileri

Model Orchestrator, aşağıdaki model seçim stratejilerini destekler:

- **default**: Varsayılan model veya belirtilen modeli seçer
- **performance**: En düşük gecikme süresine sahip modeli seçer
- **quality**: En yüksek kalite puanına sahip modeli seçer
- **balanced**: Performans ve kalite arasında denge sağlayan modeli seçer
- **ensemble**: Birden fazla modeli bir topluluk olarak seçer

### 2. Çalıştırma Modları

- **Sıralı Çalıştırma**: Modeller sırayla çalıştırılır
- **Paralel Çalıştırma**: Modeller eşzamanlı olarak çalıştırılır, performans artışı sağlar

### 3. Sonuç Birleştirme Stratejileri

- **default**: En düşük gecikme süresine sahip modelin sonucunu seçer
- **weighted**: Modellerin sonuçlarını ağırlıklarına göre birleştirir
- **voting**: En çok tekrarlanan sonucu seçer (çoğunluk oylaması)
- **chain**: Modellerin sonuçlarını bir zincir halinde işler
- **best_confidence**: En yüksek güven puanına sahip modelin sonucunu seçer

## Kullanım

### Temel Kullanım

```python
from services.model_orchestrator import ModelOrchestrator
from models.model_manager import ModelManager

# Model yöneticisi oluştur
model_manager = ModelManager()
await model_manager.initialize()

# Model orkestratörü oluştur
orchestrator = ModelOrchestrator(model_manager)
await orchestrator.initialize()

# Tek bir model ile orkestrasyon
result = await orchestrator.orchestrate(
    input_data="Merhaba, nasılsın?",
    parameters={
        "model_type": "llm",
        "selection_strategy": "default",
        "model_name": "gpt-3"
    }
)

# Sonucu kullan
print(result["result"])
```

### Gelişmiş Kullanım: Ensemble Modeller

```python
# Birden fazla model ile ensemble orkestrasyon
result = await orchestrator.orchestrate(
    input_data="Bu görüntüdeki nesneleri tanımla",
    parameters={
        "model_type": "vision",
        "selection_strategy": "ensemble",
        "ensemble_size": 3,
        "parallel_execution": True,
        "merge_strategy": "voting",
        "timeout_ms": 5000
    }
)

# Sonucu ve orkestrasyon bilgilerini kullan
print(f"Sonuç: {result['result']}")
print(f"Kullanılan modeller: {result['orchestration']['selected_models']}")
print(f"Güven puanı: {result['confidence']}")
```

## Parametreler

### Orkestrasyon Parametreleri

| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| model_type | string | "llm" | Kullanılacak model tipi (llm, vision, voice) |
| selection_strategy | string | "default" | Model seçim stratejisi |
| model_name | string | null | Belirli bir model kullanmak için model adı |
| parallel_execution | boolean | false | Modellerin paralel çalıştırılıp çalıştırılmayacağı |
| merge_strategy | string | "default" | Sonuç birleştirme stratejisi |
| timeout_ms | integer | 30000 | Maksimum çalıştırma süresi (milisaniye) |
| ensemble_size | integer | 3 | Ensemble stratejisinde kullanılacak model sayısı |

### Model Seçim Stratejisi Parametreleri

#### Ensemble Stratejisi

| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| ensemble_size | integer | 3 | Seçilecek model sayısı |

### Sonuç Birleştirme Stratejisi Parametreleri

#### Weighted Stratejisi

| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| {model_type}:{model_name}_weight | float | null | Belirli bir modelin ağırlığı |

#### Chain Stratejisi

| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| chain_order | array | null | Modellerin zincir sırası |

## Dönüş Değeri

Orkestrasyon sonucu aşağıdaki yapıya sahiptir:

```json
{
  "result": "Model çıktısı",
  "model": "llm:model1",
  "confidence": 0.95,
  "latency_ms": 120,
  "orchestration": {
    "selected_models": ["llm:model1", "llm:model2"],
    "selection_strategy": "ensemble",
    "parallel_execution": true,
    "merge_strategy": "weighted",
    "latency_ms": 150
  },
  "merge_info": {
    "strategy": "weighted",
    "models_considered": 2,
    "weights": {
      "llm:model1": 0.7,
      "llm:model2": 0.3
    }
  }
}
```

## Hata İşleme

Model Orchestrator, çalıştırma sırasında oluşabilecek hataları yakalar ve istatistikleri günceller. Hata durumunda, hata bilgisi ile birlikte bir istisna fırlatılır.

## İstatistikler

Model Orchestrator, aşağıdaki istatistikleri tutar:

- total_orchestrations: Toplam orkestrasyon sayısı
- successful_orchestrations: Başarılı orkestrasyon sayısı
- failed_orchestrations: Başarısız orkestrasyon sayısı
- average_latency_ms: Ortalama gecikme süresi (milisaniye)
- model_selections: Her seçim stratejisinin kullanım sayısı
- parallel_executions: Paralel çalıştırma sayısı
- result_merges: Sonuç birleştirme sayısı

İstatistiklere `get_stats()` metodu ile erişilebilir.

## Genişletilebilirlik

Model Orchestrator, yeni model seçim stratejileri ve sonuç birleştirme stratejileri eklemek için genişletilebilir bir yapıya sahiptir. Yeni stratejiler eklemek için:

1. `selection_strategies` veya `merge_strategies` sözlüklerine yeni strateji fonksiyonunu ekleyin
2. Strateji fonksiyonunu sınıf içinde tanımlayın

Örnek:

```python
def __init__(self, model_manager=None):
    # ... mevcut kod ...
    self.selection_strategies = {
        # ... mevcut stratejiler ...
        "my_custom_strategy": self._my_custom_selection_strategy
    }

async def _my_custom_selection_strategy(self, model_type, parameters):
    # Özel strateji implementasyonu
    # ...
    return selected_models
```

## Performans İpuçları

- Düşük gecikme gerektiren uygulamalar için `performance` seçim stratejisini kullanın
- Yüksek doğruluk gerektiren uygulamalar için `ensemble` seçim stratejisini ve `voting` birleştirme stratejisini kullanın
- Paralel çalıştırma, birden fazla model kullanırken toplam gecikme süresini azaltır
- Zaman açısından kritik olmayan görevler için `chain` birleştirme stratejisi daha kapsamlı sonuçlar üretebilir
