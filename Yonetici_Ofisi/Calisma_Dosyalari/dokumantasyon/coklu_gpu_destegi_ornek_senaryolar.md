# Çoklu GPU Desteği Örnek Kullanım Senaryoları

**Doküman No:** ALT_LAS-EXAMPLES-001
**Versiyon:** 0.1 (Taslak)
**Tarih:** 2025-08-05
**Hazırlayan:** Kıdemli Backend Geliştirici (Mehmet Yılmaz)
**İlgili Görev:** KM-2.1 - Çoklu GPU Desteği

## 1. Giriş

Bu doküman, ALT_LAS sisteminde çoklu GPU desteği için örnek kullanım senaryolarını içermektedir. Bu senaryolar, sistemin birden fazla GPU üzerinde nasıl verimli bir şekilde çalıştırılabileceğini göstermektedir.

### 1.1 Kapsam

Bu doküman, aşağıdaki örnek kullanım senaryolarını kapsamaktadır:

- Temel çoklu GPU kullanımı
- Batch işleme senaryoları
- Farklı GPU seçim stratejilerinin kullanımı
- Yüksek yük altında çoklu GPU kullanımı
- Görev tipine özgü GPU atama
- Python istemcisi ile çoklu GPU kullanımı
- Performans izleme ve optimizasyon

### 1.2 Hedef Kitle

Bu doküman, ALT_LAS sistemini kullanan geliştiriciler, sistem entegratörleri ve diğer teknik personel için hazırlanmıştır.

### 1.3 Ön Koşullar

Bu dokümandaki örnek senaryoları uygulamak için aşağıdaki ön koşulların sağlanması gerekmektedir:

- ALT_LAS sisteminin çoklu GPU desteği ile kurulmuş olması
- Sistemde en az iki CUDA uyumlu GPU bulunması
- API erişim yetkilerine sahip olunması
- Python 3.8 veya üzeri sürümün kurulu olması

## 2. Temel Çoklu GPU Kullanımı

### 2.1 Tek İstek Gönderme

En basit senaryo, tek bir isteği çoklu GPU desteği ile göndermektir. Bu senaryoda, sistem otomatik olarak uygun GPU'yu seçer ve isteği işler.

#### 2.1.1 cURL ile İstek Gönderme

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <api_key>" \
  -d '{
    "text": "Sample input text",
    "max_length": 128,
    "temperature": 0.7,
    "gpu_options": {
      "strategy": "least_loaded"
    }
  }' \
  https://api.example.com/api/v1/predict
```

#### 2.1.2 Python ile İstek Gönderme

```python
import requests

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

data = {
    "text": "Sample input text",
    "max_length": 128,
    "temperature": 0.7,
    "gpu_options": {
        "strategy": "least_loaded"
    }
}

response = requests.post(f"{api_url}/predict", headers=headers, json=data)
result = response.json()

print(f"Task ID: {result['task_id']}")
print(f"GPU ID: {result['gpu_id']}")
print(f"Status: {result['status']}")
```

### 2.2 Görev Durumu Sorgulama

İstek gönderildikten sonra, görevin durumunu sorgulamak için aşağıdaki adımları izleyebilirsiniz.

#### 2.2.1 cURL ile Görev Durumu Sorgulama

```bash
curl -H "Authorization: Bearer <api_key>" \
  https://api.example.com/api/v1/task/<task_id>
```

#### 2.2.2 Python ile Görev Durumu Sorgulama

```python
import requests
import time

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"
task_id = "your_task_id"  # Önceki istekten alınan task_id

headers = {
    "Authorization": f"Bearer {api_key}"
}

# Görev tamamlanana kadar durumu sorgula
while True:
    response = requests.get(f"{api_url}/task/{task_id}", headers=headers)
    status = response.json()

    print(f"Status: {status['status']}")

    if status['status'] in ['completed', 'failed', 'canceled']:
        break

    time.sleep(1)  # 1 saniye bekle

# Görev tamamlandıysa sonucu göster
if status['status'] == 'completed' and 'result' in status:
    print(f"Result: {status['result']['text']}")
    print(f"Execution Time: {status['result']['execution_time']} seconds")
```

### 2.3 GPU Durumu Sorgulama

Sistemdeki GPU'ların durumunu sorgulamak için aşağıdaki adımları izleyebilirsiniz.

#### 2.3.1 cURL ile GPU Durumu Sorgulama

```bash
curl -H "Authorization: Bearer <api_key>" \
  https://api.example.com/api/v1/gpus
```

#### 2.3.2 Python ile GPU Durumu Sorgulama

```python
import requests

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"

headers = {
    "Authorization": f"Bearer {api_key}"
}

response = requests.get(f"{api_url}/gpus", headers=headers)
gpu_status = response.json()

print("GPU Status:")
for gpu in gpu_status['gpus']:
    print(f"GPU {gpu['id']} ({gpu['name']}): {gpu['utilization']}% utilization, {gpu['task_count']} tasks")
    print(f"  Memory: {gpu['memory_used'] / (1024**3):.2f} GB / {gpu['memory_total'] / (1024**3):.2f} GB")
```

## 3. Batch İşleme Senaryoları

### 3.1 Batch İşleme - GPU'lar Arasında Bölme

Bu senaryoda, bir batch işlemi GPU'lar arasında bölünür. Her görev, uygun GPU'ya atanır.

#### 3.1.1 cURL ile Batch İşleme

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <api_key>" \
  -d '{
    "batch": [
      {
        "text": "Sample input text 1",
        "max_length": 128,
        "temperature": 0.7
      },
      {
        "text": "Sample input text 2",
        "max_length": 256,
        "temperature": 0.5
      },
      {
        "text": "Sample input text 3",
        "max_length": 128,
        "temperature": 0.8
      }
    ],
    "gpu_options": {
      "strategy": "round_robin",
      "batch_split": true
    }
  }' \
  https://api.example.com/api/v1/batch_predict
```

#### 3.1.2 Python ile Batch İşleme

```python
import requests

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

data = {
    "batch": [
        {
            "text": "Sample input text 1",
            "max_length": 128,
            "temperature": 0.7
        },
        {
            "text": "Sample input text 2",
            "max_length": 256,
            "temperature": 0.5
        },
        {
            "text": "Sample input text 3",
            "max_length": 128,
            "temperature": 0.8
        }
    ],
    "gpu_options": {
        "strategy": "round_robin",
        "batch_split": True
    }
}

response = requests.post(f"{api_url}/batch_predict", headers=headers, json=data)
result = response.json()

print(f"Batch Status: {result['status']}")
print(f"Tasks: {len(result['tasks'])}")

for task in result['tasks']:
    print(f"Task ID: {task['task_id']}, GPU ID: {task['gpu_id']}, Status: {task['status']}")
```

### 3.2 Batch İşleme - Tek GPU'ya Gönderme

Bu senaryoda, bir batch işlemi tek bir GPU'ya gönderilir. Tüm görevler aynı GPU üzerinde işlenir.

#### 3.2.1 cURL ile Tek GPU'ya Batch İşleme

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <api_key>" \
  -d '{
    "batch": [
      {
        "text": "Sample input text 1",
        "max_length": 128,
        "temperature": 0.7
      },
      {
        "text": "Sample input text 2",
        "max_length": 256,
        "temperature": 0.5
      },
      {
        "text": "Sample input text 3",
        "max_length": 128,
        "temperature": 0.8
      }
    ],
    "gpu_options": {
      "strategy": "least_loaded",
      "batch_split": false
    }
  }' \
  https://api.example.com/api/v1/batch_predict
```

#### 3.2.2 Python ile Tek GPU'ya Batch İşleme

```python
import requests

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

data = {
    "batch": [
        {
            "text": "Sample input text 1",
            "max_length": 128,
            "temperature": 0.7
        },
        {
            "text": "Sample input text 2",
            "max_length": 256,
            "temperature": 0.5
        },
        {
            "text": "Sample input text 3",
            "max_length": 128,
            "temperature": 0.8
        }
    ],
    "gpu_options": {
        "strategy": "least_loaded",
        "batch_split": False
    }
}

response = requests.post(f"{api_url}/batch_predict", headers=headers, json=data)
result = response.json()

print(f"Batch Status: {result['status']}")
print(f"GPU ID: {result['gpu_id']}")
print(f"Tasks: {len(result['task_ids'])}")
```

## 4. Farklı GPU Seçim Stratejilerinin Kullanımı

ALT_LAS sistemi, farklı GPU seçim stratejileri sunar. Bu stratejiler, iş yükünün GPU'lar arasında nasıl dağıtılacağını belirler.

### 4.1 Round Robin Stratejisi

Round Robin stratejisi, görevleri sırayla her GPU'ya dağıtır. Bu strateji, iş yükünün GPU'lar arasında eşit dağıtılmasını sağlar.

```python
import requests

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

# 5 görev oluştur
tasks = []
for i in range(5):
    tasks.append({
        "text": f"Sample input text {i+1}",
        "max_length": 128,
        "temperature": 0.7,
        "gpu_options": {
            "strategy": "round_robin"
        }
    })

# Her görevi gönder
results = []
for task in tasks:
    response = requests.post(f"{api_url}/predict", headers=headers, json=task)
    results.append(response.json())

# Sonuçları göster
for i, result in enumerate(results):
    print(f"Task {i+1}: GPU {result['gpu_id']}")
```

### 4.2 En Az Yüklü Stratejisi

En Az Yüklü stratejisi, en düşük kullanım oranına sahip GPU'yu seçer. Bu strateji, iş yükünün GPU'lar arasında dengeli dağıtılmasını sağlar.

```python
import requests

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

# GPU durumunu kontrol et
response = requests.get(f"{api_url}/gpus", headers=headers)
gpu_status = response.json()

print("GPU Status Before:")
for gpu in gpu_status['gpus']:
    print(f"GPU {gpu['id']}: {gpu['utilization']}% utilization, {gpu['task_count']} tasks")

# En az yüklü stratejisi ile görev gönder
data = {
    "text": "Sample input text",
    "max_length": 128,
    "temperature": 0.7,
    "gpu_options": {
        "strategy": "least_loaded"
    }
}

response = requests.post(f"{api_url}/predict", headers=headers, json=data)
result = response.json()

print(f"\nTask sent to GPU {result['gpu_id']}")

# GPU durumunu tekrar kontrol et
response = requests.get(f"{api_url}/gpus", headers=headers)
gpu_status = response.json()

print("\nGPU Status After:")
for gpu in gpu_status['gpus']:
    print(f"GPU {gpu['id']}: {gpu['utilization']}% utilization, {gpu['task_count']} tasks")
```

### 4.3 Bellek Optimizasyonlu Stratejisi

Bellek Optimizasyonlu strateji, görevin bellek gereksinimlerine göre en uygun GPU'yu seçer. Bu strateji, bellek yoğun görevler için uygundur.

```python
import requests

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

# GPU durumunu kontrol et
response = requests.get(f"{api_url}/gpus", headers=headers)
gpu_status = response.json()

print("GPU Status Before:")
for gpu in gpu_status['gpus']:
    print(f"GPU {gpu['id']}: {gpu['memory_used'] / (1024**3):.2f} GB / {gpu['memory_total'] / (1024**3):.2f} GB")

# Bellek optimizasyonlu stratejisi ile görev gönder
data = {
    "text": "Sample input text",
    "max_length": 128,
    "temperature": 0.7,
    "estimated_memory": 8 * 1024 * 1024 * 1024,  # 8 GB
    "gpu_options": {
        "strategy": "memory_optimized"
    }
}

response = requests.post(f"{api_url}/predict", headers=headers, json=data)
result = response.json()

print(f"\nTask sent to GPU {result['gpu_id']}")

# GPU durumunu tekrar kontrol et
response = requests.get(f"{api_url}/gpus", headers=headers)
gpu_status = response.json()

print("\nGPU Status After:")
for gpu in gpu_status['gpus']:
    print(f"GPU {gpu['id']}: {gpu['memory_used'] / (1024**3):.2f} GB / {gpu['memory_total'] / (1024**3):.2f} GB")
```

### 4.4 Görev Tipine Özgü Stratejisi

Görev Tipine Özgü strateji, görev tipine göre önceden tanımlanmış GPU'ları seçer. Bu strateji, belirli görev tipleri için optimize edilmiş GPU'ları kullanmak için uygundur.

```python
import requests

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

# Farklı görev tipleri için görevler oluştur
tasks = [
    {
        "text": "Sample input text for image segmentation",
        "type": "image_segmentation",
        "max_length": 128,
        "temperature": 0.7,
        "gpu_options": {
            "strategy": "task_specific"
        }
    },
    {
        "text": "Sample input text for text generation",
        "type": "text_generation",
        "max_length": 256,
        "temperature": 0.5,
        "gpu_options": {
            "strategy": "task_specific"
        }
    },
    {
        "text": "Sample input text for object detection",
        "type": "object_detection",
        "max_length": 128,
        "temperature": 0.8,
        "gpu_options": {
            "strategy": "task_specific"
        }
    }
]

# Her görevi gönder
results = []
for task in tasks:
    response = requests.post(f"{api_url}/predict", headers=headers, json=task)
    results.append(response.json())

# Sonuçları göster
for i, result in enumerate(results):
    print(f"Task Type: {tasks[i]['type']}, GPU: {result['gpu_id']}")
```

## 5. Yüksek Yük Altında Çoklu GPU Kullanımı

### 5.1 Eşzamanlı İstekler

Bu senaryoda, çok sayıda eşzamanlı istek gönderilir ve sistemin bu istekleri çoklu GPU'lar arasında nasıl dağıttığı gözlemlenir.

```python
import requests
import time
import threading
import concurrent.futures

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

# Görev gönderme fonksiyonu
def send_task(task_id):
    data = {
        "text": f"Sample input text for task {task_id}",
        "max_length": 128,
        "temperature": 0.7,
        "gpu_options": {
            "strategy": "least_loaded"
        }
    }

    start_time = time.time()
    response = requests.post(f"{api_url}/predict", headers=headers, json=data)
    end_time = time.time()

    result = response.json()
    return {
        "task_id": task_id,
        "gpu_id": result['gpu_id'],
        "response_time": end_time - start_time
    }

# GPU durumunu kontrol et
response = requests.get(f"{api_url}/gpus", headers=headers)
gpu_status = response.json()

print("GPU Status Before:")
for gpu in gpu_status['gpus']:
    print(f"GPU {gpu['id']}: {gpu['utilization']}% utilization, {gpu['task_count']} tasks")

# 20 eşzamanlı istek gönder
num_tasks = 20
results = []

with concurrent.futures.ThreadPoolExecutor(max_workers=num_tasks) as executor:
    futures = [executor.submit(send_task, i) for i in range(num_tasks)]

    for future in concurrent.futures.as_completed(futures):
        results.append(future.result())

# Sonuçları analiz et
gpu_distribution = {}
response_times = []

for result in results:
    gpu_id = result['gpu_id']
    if gpu_id not in gpu_distribution:
        gpu_distribution[gpu_id] = 0
    gpu_distribution[gpu_id] += 1

    response_times.append(result['response_time'])

# GPU dağılımını göster
print("\nGPU Distribution:")
for gpu_id, count in gpu_distribution.items():
    print(f"GPU {gpu_id}: {count} tasks ({count / num_tasks * 100:.1f}%)")

# Yanıt sürelerini göster
avg_response_time = sum(response_times) / len(response_times)
min_response_time = min(response_times)
max_response_time = max(response_times)

print(f"\nResponse Times:")
print(f"Average: {avg_response_time:.3f} seconds")
print(f"Minimum: {min_response_time:.3f} seconds")
print(f"Maximum: {max_response_time:.3f} seconds")

# GPU durumunu tekrar kontrol et
response = requests.get(f"{api_url}/gpus", headers=headers)
gpu_status = response.json()

print("\nGPU Status After:")
for gpu in gpu_status['gpus']:
    print(f"GPU {gpu['id']}: {gpu['utilization']}% utilization, {gpu['task_count']} tasks")
```

### 5.2 Uzun Süreli Yük Testi

Bu senaryoda, uzun süreli bir yük testi yapılır ve sistemin performansı izlenir.

```python
import requests
import time
import threading
import concurrent.futures
import statistics
import matplotlib.pyplot as plt

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

# Görev gönderme fonksiyonu
def send_task():
    data = {
        "text": "Sample input text",
        "max_length": 128,
        "temperature": 0.7,
        "gpu_options": {
            "strategy": "least_loaded"
        }
    }

    start_time = time.time()
    response = requests.post(f"{api_url}/predict", headers=headers, json=data)
    end_time = time.time()

    result = response.json()
    return {
        "gpu_id": result['gpu_id'],
        "response_time": end_time - start_time,
        "timestamp": time.time()
    }

# GPU durumunu izleme fonksiyonu
def monitor_gpus(interval=10, duration=300):
    start_time = time.time()
    end_time = start_time + duration

    gpu_metrics = []

    while time.time() < end_time:
        response = requests.get(f"{api_url}/gpus", headers=headers)
        gpu_status = response.json()

        for gpu in gpu_status['gpus']:
            gpu_metrics.append({
                "gpu_id": gpu['id'],
                "utilization": gpu['utilization'],
                "memory_used": gpu['memory_used'],
                "task_count": gpu['task_count'],
                "timestamp": time.time()
            })

        time.sleep(interval)

    return gpu_metrics

# Yük testi parametreleri
test_duration = 300  # 5 dakika
request_interval = 1  # 1 saniye
monitor_interval = 10  # 10 saniye

# GPU izleme thread'ini başlat
monitor_thread = threading.Thread(
    target=lambda: monitor_gpus(monitor_interval, test_duration)
)
monitor_thread.start()

# Yük testi başlat
print(f"Starting load test for {test_duration} seconds...")
start_time = time.time()
end_time = start_time + test_duration

results = []

while time.time() < end_time:
    result = send_task()
    results.append(result)

    # İstek aralığı kadar bekle
    time.sleep(request_interval)

# GPU izleme thread'inin tamamlanmasını bekle
monitor_thread.join()

# Sonuçları analiz et
gpu_distribution = {}
response_times = []

for result in results:
    gpu_id = result['gpu_id']
    if gpu_id not in gpu_distribution:
        gpu_distribution[gpu_id] = 0
    gpu_distribution[gpu_id] += 1

    response_times.append(result['response_time'])

# GPU dağılımını göster
print("\nGPU Distribution:")
for gpu_id, count in gpu_distribution.items():
    print(f"GPU {gpu_id}: {count} tasks ({count / len(results) * 100:.1f}%)")

# Yanıt sürelerini göster
avg_response_time = statistics.mean(response_times)
median_response_time = statistics.median(response_times)
p95_response_time = sorted(response_times)[int(len(response_times) * 0.95)]
p99_response_time = sorted(response_times)[int(len(response_times) * 0.99)]

print(f"\nResponse Times:")
print(f"Average: {avg_response_time:.3f} seconds")
print(f"Median: {median_response_time:.3f} seconds")
print(f"95th Percentile: {p95_response_time:.3f} seconds")
print(f"99th Percentile: {p99_response_time:.3f} seconds")

# Throughput hesapla
throughput = len(results) / test_duration

print(f"\nThroughput: {throughput:.2f} requests/second")
```

## 6. Görev Tipine Özgü GPU Atama

Bu senaryoda, farklı görev tipleri için farklı GPU'lar atanır. Bu, belirli görev tipleri için optimize edilmiş GPU'ları kullanmak için uygundur.

### 6.1 Konfigürasyon

Öncelikle, görev tipine özgü GPU eşleştirmelerini yapılandırın:

```yaml
gpu:
  multi_gpu:
    default_strategy: "task_specific"
    task_specific_mappings:
      image_segmentation: "gpu_0"  # Görüntü segmentasyonu için GPU 0
      text_generation: "gpu_1"     # Metin üretimi için GPU 1
      object_detection: "gpu_2"    # Nesne tespiti için GPU 2
```

### 6.2 Farklı Görev Tipleri Gönderme

```python
import requests

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

# Farklı görev tipleri
task_types = [
    "image_segmentation",
    "text_generation",
    "object_detection"
]

# Her görev tipi için 5 görev gönder
results = {}

for task_type in task_types:
    results[task_type] = []

    for i in range(5):
        data = {
            "text": f"Sample input text for {task_type} {i+1}",
            "type": task_type,
            "max_length": 128,
            "temperature": 0.7,
            "gpu_options": {
                "strategy": "task_specific"
            }
        }

        response = requests.post(f"{api_url}/predict", headers=headers, json=data)
        results[task_type].append(response.json())

# Sonuçları analiz et
for task_type in task_types:
    gpu_distribution = {}

    for result in results[task_type]:
        gpu_id = result['gpu_id']
        if gpu_id not in gpu_distribution:
            gpu_distribution[gpu_id] = 0
        gpu_distribution[gpu_id] += 1

    print(f"\n{task_type} GPU Distribution:")
    for gpu_id, count in gpu_distribution.items():
        print(f"GPU {gpu_id}: {count} tasks ({count / len(results[task_type]) * 100:.1f}%)")
```

## 7. Performans İzleme ve Optimizasyon

### 7.1 GPU Performans Metriklerini İzleme

```python
import requests
import time
import matplotlib.pyplot as plt

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"

headers = {
    "Authorization": f"Bearer {api_key}"
}

# GPU metriklerini izleme
def monitor_gpus(duration=300, interval=10):
    start_time = time.time()
    end_time = start_time + duration

    timestamps = []
    gpu_metrics = {}

    while time.time() < end_time:
        response = requests.get(f"{api_url}/gpus", headers=headers)
        gpu_status = response.json()

        current_time = time.time() - start_time
        timestamps.append(current_time)

        for gpu in gpu_status['gpus']:
            gpu_id = gpu['id']

            if gpu_id not in gpu_metrics:
                gpu_metrics[gpu_id] = {
                    'utilization': [],
                    'memory_used': [],
                    'task_count': []
                }

            gpu_metrics[gpu_id]['utilization'].append(gpu['utilization'])
            gpu_metrics[gpu_id]['memory_used'].append(gpu['memory_used'] / (1024**3))  # GB
            gpu_metrics[gpu_id]['task_count'].append(gpu['task_count'])

        print(f"Time: {current_time:.1f}s")
        for gpu_id, metrics in gpu_metrics.items():
            print(f"GPU {gpu_id}: {metrics['utilization'][-1]}% util, {metrics['memory_used'][-1]:.2f} GB, {metrics['task_count'][-1]} tasks")

        print()
        time.sleep(interval)

    return timestamps, gpu_metrics

# 5 dakika boyunca GPU metriklerini izle
print("Monitoring GPU metrics for 5 minutes...")
timestamps, gpu_metrics = monitor_gpus(duration=300, interval=10)

# Grafikleri çiz
plt.figure(figsize=(15, 10))

# GPU kullanım oranı grafiği
plt.subplot(3, 1, 1)
for gpu_id, metrics in gpu_metrics.items():
    plt.plot(timestamps, metrics['utilization'], label=f'GPU {gpu_id}')
plt.title('GPU Utilization')
plt.xlabel('Time (s)')
plt.ylabel('Utilization (%)')
plt.legend()
plt.grid(True)

# GPU bellek kullanımı grafiği
plt.subplot(3, 1, 2)
for gpu_id, metrics in gpu_metrics.items():
    plt.plot(timestamps, metrics['memory_used'], label=f'GPU {gpu_id}')
plt.title('GPU Memory Usage')
plt.xlabel('Time (s)')
plt.ylabel('Memory Used (GB)')
plt.legend()
plt.grid(True)

# GPU görev sayısı grafiği
plt.subplot(3, 1, 3)
for gpu_id, metrics in gpu_metrics.items():
    plt.plot(timestamps, metrics['task_count'], label=f'GPU {gpu_id}')
plt.title('GPU Task Count')
plt.xlabel('Time (s)')
plt.ylabel('Task Count')
plt.legend()
plt.grid(True)

plt.tight_layout()
plt.savefig('gpu_metrics.png')
plt.show()
```

### 7.2 Farklı Stratejilerin Performans Karşılaştırması

```python
import requests
import time
import statistics
import matplotlib.pyplot as plt

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

# Görev gönderme fonksiyonu
def send_tasks(strategy, num_tasks=50):
    results = []

    for i in range(num_tasks):
        data = {
            "text": f"Sample input text for task {i+1}",
            "max_length": 128,
            "temperature": 0.7,
            "gpu_options": {
                "strategy": strategy
            }
        }

        start_time = time.time()
        response = requests.post(f"{api_url}/predict", headers=headers, json=data)
        end_time = time.time()

        result = response.json()
        results.append({
            "gpu_id": result['gpu_id'],
            "response_time": end_time - start_time
        })

        # Kısa bir bekleme ekle
        time.sleep(0.1)

    return results

# Farklı stratejileri test et
strategies = [
    "round_robin",
    "least_loaded",
    "memory_optimized",
    "task_specific",
    "random"
]

strategy_results = {}

for strategy in strategies:
    print(f"Testing {strategy} strategy...")
    strategy_results[strategy] = send_tasks(strategy)

# Sonuçları analiz et
strategy_metrics = {}

for strategy, results in strategy_results.items():
    # GPU dağılımı
    gpu_distribution = {}
    for result in results:
        gpu_id = result['gpu_id']
        if gpu_id not in gpu_distribution:
            gpu_distribution[gpu_id] = 0
        gpu_distribution[gpu_id] += 1

    # Yanıt süreleri
    response_times = [result['response_time'] for result in results]

    strategy_metrics[strategy] = {
        'gpu_distribution': gpu_distribution,
        'avg_response_time': statistics.mean(response_times),
        'median_response_time': statistics.median(response_times),
        'p95_response_time': sorted(response_times)[int(len(response_times) * 0.95)],
        'p99_response_time': sorted(response_times)[int(len(response_times) * 0.99)]
    }

# Sonuçları göster
for strategy, metrics in strategy_metrics.items():
    print(f"\n{strategy} Strategy:")

    print("GPU Distribution:")
    for gpu_id, count in metrics['gpu_distribution'].items():
        print(f"GPU {gpu_id}: {count} tasks ({count / len(strategy_results[strategy]) * 100:.1f}%)")

    print(f"Average Response Time: {metrics['avg_response_time']:.3f} seconds")
    print(f"Median Response Time: {metrics['median_response_time']:.3f} seconds")
    print(f"95th Percentile Response Time: {metrics['p95_response_time']:.3f} seconds")
    print(f"99th Percentile Response Time: {metrics['p99_response_time']:.3f} seconds")

# Grafikleri çiz
plt.figure(figsize=(15, 10))

# Ortalama yanıt süresi grafiği
plt.subplot(2, 1, 1)
strategies_list = list(strategy_metrics.keys())
avg_response_times = [metrics['avg_response_time'] for metrics in strategy_metrics.values()]
plt.bar(strategies_list, avg_response_times)
plt.title('Average Response Time by Strategy')
plt.xlabel('Strategy')
plt.ylabel('Response Time (s)')
plt.grid(True)

# GPU dağılımı grafiği
plt.subplot(2, 1, 2)
bar_width = 0.15
index = range(len(strategies_list))

gpu_ids = set()
for metrics in strategy_metrics.values():
    gpu_ids.update(metrics['gpu_distribution'].keys())
gpu_ids = sorted(gpu_ids)

for i, gpu_id in enumerate(gpu_ids):
    values = []
    for strategy in strategies_list:
        distribution = strategy_metrics[strategy]['gpu_distribution']
        values.append(distribution.get(gpu_id, 0) / len(strategy_results[strategy]) * 100)

    plt.bar([x + i * bar_width for x in index], values, bar_width, label=f'GPU {gpu_id}')

plt.title('GPU Distribution by Strategy')
plt.xlabel('Strategy')
plt.ylabel('Percentage of Tasks')
plt.xticks([x + bar_width * (len(gpu_ids) - 1) / 2 for x in index], strategies_list)
plt.legend()
plt.grid(True)

plt.tight_layout()
plt.savefig('strategy_comparison.png')
plt.show()
```

## 8. Sonuç

Bu doküman, ALT_LAS sisteminde çoklu GPU desteği için örnek kullanım senaryolarını içermektedir. Bu senaryolar, sistemin birden fazla GPU üzerinde nasıl verimli bir şekilde çalıştırılabileceğini göstermektedir.

Çoklu GPU desteği, ALT_LAS sisteminin performansını ve ölçeklenebilirliğini önemli ölçüde artırmaktadır. Farklı GPU seçim stratejileri, farklı kullanım senaryoları için optimize edilmiş çözümler sunmaktadır.

Bu senaryoları kendi ortamınıza uyarlayarak, ALT_LAS sisteminin çoklu GPU desteğinden en iyi şekilde yararlanabilirsiniz.
