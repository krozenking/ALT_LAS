# Kubernetes Altyapı Kurulumu Raporu

**Tarih:** 10 Mayıs 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Alpha Aşaması - Kubernetes Altyapı Kurulumu

## 1. Genel Bakış

Bu rapor, ALT_LAS projesinin alpha aşamasına geçiş için gerekli Kubernetes altyapısının kurulumu ve yapılandırması hakkında bilgi vermektedir. Rapor, yapılan çalışmaları, karşılaşılan zorlukları ve sonraki adımları içermektedir.

## 2. Yapılan Çalışmalar

### 2.1. Kubernetes Kümesi Kurulumu

Yerel geliştirme ortamı için K3d kullanılarak hafif bir Kubernetes kümesi kuruldu:

```bash
k3d cluster create alt-las-local --api-port 6443 -p "80:80@loadbalancer" -p "443:443@loadbalancer" --agents 2
```

Küme yapılandırması:
- 1 control plane node
- 2 worker node
- LoadBalancer yapılandırması (80 ve 443 portları)

Küme bağlantısı başarıyla doğrulandı:

```bash
NAME                         STATUS   ROLES                  AGE   VERSION
k3d-alt-las-local-agent-0    Ready    <none>                 16s   v1.31.5+k3s1
k3d-alt-las-local-agent-1    Ready    <none>                 16s   v1.31.5+k3s1
k3d-alt-las-local-server-0   Ready    control-plane,master   19s   v1.31.5+k3s1
```

### 2.2. Proje Yapısı

ALT_LAS projesinin temel yapısı oluşturuldu:

```
ALT_LAS/
├── .env
├── .env.example
├── docker-compose.yml
├── api-gateway/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── index.js
├── segmentation-service/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       └── main.py
├── runner-service/
├── archive-service/
├── ai-orchestrator/
└── kubernetes-manifests/
    ├── api-gateway/
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   ├── configmap.yaml
    │   └── secret.yaml
    ├── segmentation-service/
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   ├── configmap.yaml
    │   └── secret.yaml
    ├── infrastructure/
    │   ├── postgres.yaml
    │   ├── redis.yaml
    │   └── nats.yaml
    ├── monitoring/
    │   ├── prometheus.yaml
    │   ├── grafana.yaml
    │   ├── loki.yaml
    │   └── promtail.yaml
    ├── ingress.yaml
    └── kustomization.yaml
```

### 2.3. Kubernetes Manifest Dosyaları

Aşağıdaki Kubernetes kaynakları için manifest dosyaları oluşturuldu:

#### 2.3.1. Servisler
- API Gateway
- Segmentation Service

Her servis için aşağıdaki kaynaklar oluşturuldu:
- Deployment
- Service
- ConfigMap
- Secret

#### 2.3.2. Altyapı Bileşenleri
- PostgreSQL
- Redis
- NATS

#### 2.3.3. İzleme ve Loglama
- Prometheus
- Grafana
- Loki
- Promtail

#### 2.3.4. Ağ
- Ingress

### 2.4. CI/CD Pipeline

GitHub Actions kullanılarak CI/CD pipeline oluşturuldu:

```yaml
name: ALT_LAS CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    # ...

  build-and-push:
    # ...

  deploy:
    # ...
```

Pipeline aşamaları:
1. Build ve Test
2. Docker Image Oluşturma ve Push
3. Kubernetes'e Dağıtım

### 2.5. Dağıtım Betikleri

Kubernetes kümesine dağıtım için PowerShell betik dosyası oluşturuldu:
- `deploy.ps1`

## 3. Karşılaşılan Zorluklar

1. **K3d Kurulumu**: Windows ortamında K3d kurulumu sırasında yetki sorunları yaşandı. Alternatif bir kurulum yöntemi kullanılarak çözüldü.

2. **Dosya Yolu Sorunları**: Windows ortamında dosya yolu ile ilgili sorunlar yaşandı. Göreceli yollar kullanılarak çözüldü.

## 4. Eksiklikler ve Sonraki Adımlar

### 4.1. Eksiklikler

1. **Runner Service ve Archive Service için Kubernetes Manifest Dosyaları**: Bu servisler için Kubernetes manifest dosyaları henüz oluşturulmadı.

2. **AI Orchestrator için Kubernetes Manifest Dosyaları**: AI Orchestrator servisi için Kubernetes manifest dosyaları henüz oluşturulmadı.

3. **Namespace Yapılandırması**: Dağıtım betiğinde `alt-las` namespace'i kullanılıyor, ancak manifest dosyalarında namespace belirtilmemiş.

4. **Servisler Arası Ağ Politikaları**: Kubernetes NetworkPolicy kaynakları oluşturulmadı.

5. **Otomatik Ölçeklendirme Yapılandırması**: HorizontalPodAutoscaler kaynakları oluşturulmadı.

6. **Backup ve Restore Stratejisi**: Veritabanı ve diğer kalıcı veriler için yedekleme ve geri yükleme stratejisi oluşturulmadı.

7. **Servis Mesh Entegrasyonu**: Servisler arası iletişim için bir servis mesh entegrasyonu yapılmadı.

### 4.2. Sonraki Adımlar

1. **Eksik Manifest Dosyalarının Oluşturulması**: Runner Service, Archive Service ve AI Orchestrator için Kubernetes manifest dosyalarının oluşturulması.

2. **Namespace Yapılandırmasının Düzeltilmesi**: Tüm manifest dosyalarında namespace belirtilmesi.

3. **Ağ Politikalarının Oluşturulması**: Servisler arası iletişim için NetworkPolicy kaynaklarının oluşturulması.

4. **Otomatik Ölçeklendirme Yapılandırması**: HorizontalPodAutoscaler kaynaklarının oluşturulması.

5. **Backup ve Restore Stratejisinin Oluşturulması**: Veritabanı ve diğer kalıcı veriler için yedekleme ve geri yükleme stratejisinin oluşturulması.

6. **Servis Mesh Entegrasyonu**: Servisler arası iletişim için bir servis mesh entegrasyonunun yapılması.

7. **Güvenlik Taraması**: Kubernetes kaynakları için güvenlik taraması yapılması.

## 5. Sonuç

ALT_LAS projesinin alpha aşamasına geçiş için gerekli Kubernetes altyapısının temel kurulumu ve yapılandırması tamamlandı. Eksiklikler ve sonraki adımlar belirlendi. Backend Geliştirici (Ahmet Çelik) ve diğer ekip üyeleri ile koordineli çalışarak, eksik servislerin Kubernetes manifest dosyalarının oluşturulması ve diğer eksikliklerin giderilmesi planlanmaktadır.
