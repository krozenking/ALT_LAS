# Nsight İzleme Altyapısı Kurulumu

**Doküman No:** ALT_LAS-DEVOPS-002  
**Versiyon:** 0.1 (Taslak)  
**Tarih:** 2025-07-05  
**Hazırlayan:** DevOps Mühendisi (Can Tekin)  
**İlgili Görev:** KM-1.7 - Nsight İzleme Altyapısı Kurulumu

## 1. Giriş

### 1.1 Amaç

Bu doküman, ALT_LAS projesinde CUDA entegrasyonu kapsamında NVIDIA Nsight araçları kullanılarak detaylı çekirdek izleme altyapısının kurulumunu ve yapılandırmasını tanımlamaktadır. Bu altyapı, GPU performans darboğazlarının tespit edilmesini, CUDA çekirdeklerinin optimize edilmesini ve genel sistem performansının iyileştirilmesini sağlayacaktır.

### 1.2 Kapsam

Bu doküman, aşağıdaki bileşenleri kapsamaktadır:

- NVIDIA Nsight Systems kurulumu ve yapılandırması
- NVIDIA Nsight Compute kurulumu ve yapılandırması
- Nsight araçlarının CI/CD pipeline'ına entegrasyonu
- Otomatik performans raporlama sistemi
- Örnek izleme ve analiz senaryoları

### 1.3 Hedef Kitle

Bu doküman, ALT_LAS projesinde çalışan DevOps mühendisleri, backend geliştiricileri, QA mühendisleri ve performans optimizasyonu ile ilgilenen diğer ekip üyeleri için hazırlanmıştır.

### 1.4 Referanslar

- ALT_LAS Proje Planı
- CUDA Entegrasyon Planı
- GPU Ön Isıtma PoC Dokümantasyonu
- Performans Test Planı
- NVIDIA Nsight Systems Dokümantasyonu
- NVIDIA Nsight Compute Dokümantasyonu

## 2. Nsight Araçları Genel Bakış

### 2.1 NVIDIA Nsight Systems

NVIDIA Nsight Systems, sistem düzeyinde performans analizi sağlayan bir araçtır. CPU ve GPU aktivitelerini zaman çizelgesi üzerinde görselleştirir, böylece uygulamanın genel performans karakteristiklerini anlamayı kolaylaştırır.

**Temel Özellikleri:**
- CPU ve GPU aktivitelerinin zaman çizelgesi görünümü
- CUDA API çağrıları ve çekirdek yürütmelerinin izlenmesi
- Bellek operasyonları ve veri transferlerinin analizi
- Sistem düzeyinde darboğazların tespiti
- Düşük overhead ile üretim ortamında kullanılabilme

### 2.2 NVIDIA Nsight Compute

NVIDIA Nsight Compute, CUDA çekirdeklerinin detaylı analizi için kullanılan bir araçtır. Çekirdek seviyesinde performans metrikleri sağlar ve optimizasyon fırsatlarını belirler.

**Temel Özellikleri:**
- CUDA çekirdeklerinin detaylı profili
- SM (Streaming Multiprocessor) kullanımı analizi
- Bellek erişim paternleri ve verimliliği
- Warp yürütme verimliliği
- Çekirdek optimizasyonu için öneriler

### 2.3 Nsight Araçları Karşılaştırması

| Özellik | Nsight Systems | Nsight Compute |
|---------|---------------|---------------|
| Odak | Sistem düzeyi analiz | Çekirdek düzeyi analiz |
| Kapsam | Tüm uygulama | Belirli CUDA çekirdekleri |
| Overhead | Düşük | Yüksek |
| Kullanım Senaryosu | Genel performans analizi | Çekirdek optimizasyonu |
| Veri Toplama | Zaman çizelgesi | Metrik tabanlı |
| Entegrasyon | CI/CD, komut satırı | Geliştirme ortamı |

## 3. Kurulum ve Yapılandırma

### 3.1 Sistem Gereksinimleri

#### 3.1.1 Nsight Systems

- **İşletim Sistemi:** Ubuntu 20.04 LTS veya üzeri
- **CUDA Toolkit:** 11.4 veya üzeri
- **NVIDIA Sürücüsü:** 470.57.02 veya üzeri
- **Donanım:** NVIDIA GPU (Volta, Turing, Ampere veya üzeri mimari)

#### 3.1.2 Nsight Compute

- **İşletim Sistemi:** Ubuntu 20.04 LTS veya üzeri
- **CUDA Toolkit:** 11.4 veya üzeri
- **NVIDIA Sürücüsü:** 470.57.02 veya üzeri
- **Donanım:** NVIDIA GPU (Volta, Turing, Ampere veya üzeri mimari)

### 3.2 Kurulum Adımları

#### 3.2.1 NVIDIA Sürücüsü ve CUDA Toolkit Kurulumu

```bash
# NVIDIA GPU sürücüsünü kur
sudo apt-get update
sudo apt-get install -y nvidia-driver-535

# CUDA Toolkit kurulumu
wget https://developer.download.nvidia.com/compute/cuda/12.2.0/local_installers/cuda_12.2.0_535.54.03_linux.run
sudo sh cuda_12.2.0_535.54.03_linux.run --silent --toolkit

# Ortam değişkenlerini ayarla
echo 'export PATH=/usr/local/cuda-12.2/bin${PATH:+:${PATH}}' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda-12.2/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}' >> ~/.bashrc
source ~/.bashrc
```

#### 3.2.2 Nsight Systems Kurulumu

```bash
# Nsight Systems indirme
wget https://developer.download.nvidia.com/devtools/nsight-systems/nsight-systems-2023.2.1_2023.2.1.122-1_amd64.deb

# Kurulum
sudo apt-get install -y ./nsight-systems-2023.2.1_2023.2.1.122-1_amd64.deb

# Kurulumu doğrula
nsys --version
```

#### 3.2.3 Nsight Compute Kurulumu

```bash
# Nsight Compute indirme
wget https://developer.download.nvidia.com/devtools/nsight-compute/nsight-compute-linux-2023.2.1.0-33006834.deb

# Kurulum
sudo apt-get install -y ./nsight-compute-linux-2023.2.1.0-33006834.deb

# Kurulumu doğrula
ncu --version
```

### 3.3 Docker Konteyner Yapılandırması

Nsight araçlarını Docker konteynerlerinde kullanmak için aşağıdaki Dockerfile örneği kullanılabilir:

```dockerfile
FROM nvidia/cuda:12.2.0-devel-ubuntu22.04

# Gerekli paketleri kur
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Nsight Systems kur
RUN wget -q https://developer.download.nvidia.com/devtools/nsight-systems/nsight-systems-2023.2.1_2023.2.1.122-1_amd64.deb \
    && apt-get update \
    && apt-get install -y ./nsight-systems-2023.2.1_2023.2.1.122-1_amd64.deb \
    && rm nsight-systems-2023.2.1_2023.2.1.122-1_amd64.deb \
    && rm -rf /var/lib/apt/lists/*

# Nsight Compute kur
RUN wget -q https://developer.download.nvidia.com/devtools/nsight-compute/nsight-compute-linux-2023.2.1.0-33006834.deb \
    && apt-get update \
    && apt-get install -y ./nsight-compute-linux-2023.2.1.0-33006834.deb \
    && rm nsight-compute-linux-2023.2.1.0-33006834.deb \
    && rm -rf /var/lib/apt/lists/*

# Çalışma dizini oluştur
WORKDIR /app

# Uygulama dosyalarını kopyala
COPY . .

# Varsayılan komut
CMD ["/bin/bash"]
```

Docker konteynerini çalıştırmak için:

```bash
docker build -t altlas-nsight-tools .
docker run --gpus all -it altlas-nsight-tools
```

### 3.4 Kubernetes Yapılandırması

Nsight araçlarını Kubernetes ortamında kullanmak için aşağıdaki YAML dosyası örneği kullanılabilir:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nsight-profiling-pod
spec:
  containers:
  - name: nsight-container
    image: altlas-nsight-tools:latest
    command: ["/bin/bash", "-c", "--"]
    args: ["while true; do sleep 30; done;"]
    resources:
      limits:
        nvidia.com/gpu: 1
    volumeMounts:
    - name: nsight-data
      mountPath: /nsight-data
  volumes:
  - name: nsight-data
    persistentVolumeClaim:
      claimName: nsight-data-pvc
```

## 4. Nsight İzleme Altyapısı

### 4.1 İzleme Stratejisi

ALT_LAS projesi için aşağıdaki izleme stratejisi uygulanacaktır:

1. **Geliştirme Aşaması İzleme:**
   - Geliştiriciler, yerel ortamlarında Nsight araçlarını kullanarak kod değişikliklerinin performans etkilerini analiz edecek
   - Her sprint için en az bir detaylı performans analizi yapılacak

2. **CI/CD Pipeline İzleme:**
   - Her pull request için otomatik performans testleri çalıştırılacak
   - Performans regresyonları tespit edilecek ve raporlanacak

3. **Üretim Ortamı İzleme:**
   - Düşük overhead ile üretim ortamında periyodik izleme yapılacak
   - Performans anomalileri tespit edilecek ve uyarılar oluşturulacak

### 4.2 İzleme Metrikleri

Aşağıdaki temel metrikler izlenecek ve raporlanacaktır:

#### 4.2.1 Sistem Düzeyi Metrikler (Nsight Systems)

- **Toplam Yürütme Süresi:** Uygulamanın toplam çalışma süresi
- **GPU Kullanım Oranı:** GPU'nun ne kadar aktif olduğu
- **Bellek Transferleri:** Host-device arasındaki veri transferleri
- **API Çağrı Süreleri:** CUDA API çağrılarının süreleri
- **Çekirdek Yürütme Süreleri:** CUDA çekirdeklerinin yürütme süreleri

#### 4.2.2 Çekirdek Düzeyi Metrikler (Nsight Compute)

- **SM Etkinliği:** Streaming Multiprocessor kullanım etkinliği
- **Bellek Throughput:** Global, shared ve texture bellek throughput değerleri
- **Warp Yürütme Etkinliği:** Warp'ların ne kadar verimli çalıştığı
- **Instruction Throughput:** Saniyede yürütülen instruction sayısı
- **Bellek Erişim Paternleri:** Coalesced vs. uncoalesced bellek erişimleri

### 4.3 Otomatik İzleme Scripti

Aşağıdaki bash scripti, otomatik izleme için kullanılabilir:

```bash
#!/bin/bash

# Yapılandırma
APP_NAME="ai-orchestrator"
OUTPUT_DIR="/nsight-data/$(date +%Y%m%d_%H%M%S)"
DURATION=60  # saniye cinsinden

# Çıktı dizini oluştur
mkdir -p $OUTPUT_DIR

# Nsight Systems ile sistem düzeyi profil oluştur
echo "Nsight Systems ile profil oluşturuluyor..."
nsys profile --stats=true \
  --output=$OUTPUT_DIR/system_profile \
  --duration=$DURATION \
  --sample=cpu \
  --trace=cuda,nvtx,osrt,cudnn,cublas \
  --force-overwrite=true \
  --show-output=true \
  $APP_NAME

# Nsight Compute ile çekirdek düzeyi profil oluştur
echo "Nsight Compute ile profil oluşturuluyor..."
ncu --export=$OUTPUT_DIR/kernel_profile \
  --force-overwrite \
  --target-processes all \
  --replay-mode application \
  --kernel-regex ".*" \
  --launch-skip 0 \
  --launch-count 10 \
  $APP_NAME

echo "Profil oluşturma tamamlandı. Sonuçlar: $OUTPUT_DIR"
```

## 5. CI/CD Entegrasyonu

### 5.1 Jenkins Pipeline Entegrasyonu

Aşağıdaki Jenkinsfile örneği, Nsight izleme altyapısını CI/CD pipeline'ına entegre etmek için kullanılabilir:

```groovy
pipeline {
    agent {
        label 'gpu-node'
    }
    
    environment {
        NSIGHT_DATA_DIR = "${WORKSPACE}/nsight-data"
        PERFORMANCE_THRESHOLD = "200"  // ms cinsinden
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                sh 'docker build -t altlas-app:${BUILD_NUMBER} .'
            }
        }
        
        stage('Unit Tests') {
            steps {
                sh 'docker run --gpus all altlas-app:${BUILD_NUMBER} python -m pytest tests/'
            }
        }
        
        stage('Performance Profiling') {
            steps {
                sh '''
                mkdir -p ${NSIGHT_DATA_DIR}
                
                # Nsight Systems ile profil oluştur
                docker run --gpus all -v ${NSIGHT_DATA_DIR}:/nsight-data \
                    altlas-app:${BUILD_NUMBER} \
                    nsys profile --stats=true \
                    --output=/nsight-data/system_profile \
                    --duration=30 \
                    --sample=cpu \
                    --trace=cuda,nvtx,osrt,cudnn,cublas \
                    --force-overwrite=true \
                    python benchmark.py
                
                # Profil sonuçlarını analiz et
                docker run --gpus all -v ${NSIGHT_DATA_DIR}:/nsight-data \
                    altlas-app:${BUILD_NUMBER} \
                    python analyze_profile.py /nsight-data/system_profile.nsys-rep > ${NSIGHT_DATA_DIR}/profile_summary.json
                '''
            }
        }
        
        stage('Performance Validation') {
            steps {
                script {
                    def profileSummary = readJSON file: "${NSIGHT_DATA_DIR}/profile_summary.json"
                    def avgKernelTime = profileSummary.avg_kernel_time
                    
                    echo "Average kernel execution time: ${avgKernelTime} ms"
                    
                    if (avgKernelTime > env.PERFORMANCE_THRESHOLD.toInteger()) {
                        unstable(message: "Performance threshold exceeded: ${avgKernelTime} ms > ${env.PERFORMANCE_THRESHOLD} ms")
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
                expression { currentBuild.result != 'UNSTABLE' }
            }
            steps {
                sh 'docker tag altlas-app:${BUILD_NUMBER} altlas-app:latest'
                sh 'docker push altlas-app:latest'
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'nsight-data/**', allowEmptyArchive: true
        }
    }
}
```

### 5.2 GitHub Actions Entegrasyonu

Aşağıdaki GitHub Actions workflow örneği, Nsight izleme altyapısını GitHub Actions'a entegre etmek için kullanılabilir:

```yaml
name: GPU Performance Profiling

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  profile:
    runs-on: [self-hosted, gpu]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: |
        docker build -t altlas-app:${{ github.sha }} .
    
    - name: Run unit tests
      run: |
        docker run --gpus all altlas-app:${{ github.sha }} python -m pytest tests/
    
    - name: Run Nsight Systems profiling
      run: |
        mkdir -p nsight-data
        
        docker run --gpus all -v $(pwd)/nsight-data:/nsight-data \
          altlas-app:${{ github.sha }} \
          nsys profile --stats=true \
          --output=/nsight-data/system_profile \
          --duration=30 \
          --sample=cpu \
          --trace=cuda,nvtx,osrt,cudnn,cublas \
          --force-overwrite=true \
          python benchmark.py
    
    - name: Analyze profile results
      run: |
        docker run --gpus all -v $(pwd)/nsight-data:/nsight-data \
          altlas-app:${{ github.sha }} \
          python analyze_profile.py /nsight-data/system_profile.nsys-rep > nsight-data/profile_summary.json
    
    - name: Validate performance
      run: |
        THRESHOLD=200
        AVG_KERNEL_TIME=$(jq '.avg_kernel_time' nsight-data/profile_summary.json)
        
        echo "Average kernel execution time: $AVG_KERNEL_TIME ms"
        
        if (( $(echo "$AVG_KERNEL_TIME > $THRESHOLD" | bc -l) )); then
          echo "::warning::Performance threshold exceeded: $AVG_KERNEL_TIME ms > $THRESHOLD ms"
          exit 1
        fi
    
    - name: Upload profile results
      uses: actions/upload-artifact@v3
      with:
        name: nsight-profile-results
        path: nsight-data/
```

## 6. Örnek İzleme ve Analiz Senaryoları

### 6.1 Model Yükleme Performansı Analizi

```bash
# Model yükleme performansını izle
nsys profile --stats=true \
  --output=model_loading_profile \
  --trace=cuda,nvtx,osrt \
  python -c "from ai_orchestrator import ModelLoader; loader = ModelLoader(); loader.load_model('bert-base')"
```

### 6.2 Çıkarım Performansı Analizi

```bash
# Çıkarım performansını izle
nsys profile --stats=true \
  --output=inference_profile \
  --trace=cuda,nvtx,osrt,cudnn,cublas \
  python benchmark_inference.py --model bert-base --batch-size 32 --sequence-length 128
```

### 6.3 Bellek Kullanımı Analizi

```bash
# Bellek kullanımını izle
nsys profile --stats=true \
  --output=memory_profile \
  --trace=cuda,nvtx,osrt \
  --sample=cpu \
  python memory_benchmark.py --model bert-base --iterations 100
```

### 6.4 Çekirdek Optimizasyonu Analizi

```bash
# Belirli bir çekirdeği analiz et
ncu --export=kernel_analysis \
  --kernel-regex "bert_attention_kernel" \
  --metrics sm__cycles_elapsed.avg,sm__cycles_elapsed.avg.per_second,dram__bytes.sum,dram__bytes.sum.per_second \
  python benchmark_inference.py --model bert-base --batch-size 1 --sequence-length 128
```

## 7. Sonuç ve Öneriler

Nsight izleme altyapısı, ALT_LAS projesinde CUDA entegrasyonu kapsamında GPU performans darboğazlarının tespit edilmesini, CUDA çekirdeklerinin optimize edilmesini ve genel sistem performansının iyileştirilmesini sağlayacaktır.

Bu doküman, Nsight araçlarının kurulumu, yapılandırması ve CI/CD pipeline'ına entegrasyonu için gerekli adımları tanımlamaktadır. Ayrıca, örnek izleme ve analiz senaryoları sunarak, ekip üyelerinin Nsight araçlarını etkili bir şekilde kullanmalarını sağlamaktadır.

Gelecek çalışmalar için öneriler:
1. Otomatik performans regresyon testi sisteminin geliştirilmesi
2. Çekirdek optimizasyonu için özel araçların geliştirilmesi
3. Performans metriklerinin merkezi bir dashboard'da görselleştirilmesi
4. Yapay zeka destekli performans analizi ve optimizasyon önerilerinin entegrasyonu

---

**Ek Bilgi:** Bu doküman, KM-1.7 (Nsight İzleme Altyapısı Kurulumu) görevi kapsamında hazırlanmış olup, Kıdemli Backend Geliştirici ile birlikte gözden geçirilecek ve nihai hale getirilecektir.
