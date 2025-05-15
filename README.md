# ALT_LAS CUDA Geliştirme Ortamı

Bu belge, ALT_LAS projesi için CUDA uyumlu geliştirme ortamının kurulumu ve kullanımı hakkında bilgi sağlar.

## Gereksinimler

- NVIDIA GPU (CUDA Compute Capability 3.5 veya üzeri)
- NVIDIA Sürücüleri (Windows için 528.33+, Linux için 525.60.13+)
- Docker 19.03 veya üzeri
- NVIDIA Container Toolkit (nvidia-docker)

## Kurulum

### 1. NVIDIA Sürücülerinin Kurulumu

#### Windows

1. [NVIDIA Sürücü İndirme Sayfası](https://www.nvidia.com/Download/index.aspx)'nı ziyaret edin
2. GPU modelinizi seçin ve en son sürücüyü indirin
3. İndirilen kurulum dosyasını çalıştırın ve talimatları izleyin

#### Linux (Ubuntu)

```bash
sudo apt-get update
sudo apt-get install -y nvidia-driver-525
sudo reboot
```

Kurulumu doğrulamak için:

```bash
nvidia-smi
```

### 2. Docker Kurulumu

#### Windows

1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)'u indirin ve kurun
2. Docker Desktop ayarlarından WSL 2 entegrasyonunu etkinleştirin
3. Docker Desktop ayarlarından NVIDIA GPU desteğini etkinleştirin

#### Linux (Ubuntu)

```bash
# Docker kurulumu
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Docker'ı sudo olmadan kullanabilmek için
sudo usermod -aG docker $USER
# Değişikliklerin etkili olması için oturumu kapatıp yeniden açın

# NVIDIA Container Toolkit kurulumu
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

### 3. CUDA Geliştirme Ortamı Docker İmajının Oluşturulması

Proje dizininde aşağıdaki komutu çalıştırın:

```bash
docker build -t altlas-dev:cuda-12.6-py3.11-v1.0 -f Dockerfile.dev .
```

Bu komut, CUDA 12.6 ve Python 3.11 içeren bir Docker imajı oluşturacaktır.

### 4. Docker İmajının Docker Hub'a Yüklenmesi (İsteğe Bağlı)

```bash
# Docker Hub'a giriş yapın
docker login

# İmajı etiketleyin
docker tag altlas-dev:cuda-12.6-py3.11-v1.0 [DOCKER_HUB_KULLANICI_ADI]/altlas-dev:cuda-12.6-py3.11-v1.0

# İmajı Docker Hub'a yükleyin
docker push [DOCKER_HUB_KULLANICI_ADI]/altlas-dev:cuda-12.6-py3.11-v1.0
```

## Kullanım

### 1. Geliştirme Konteynerini Başlatma

```bash
# Windows
docker run --gpus all -it --name altlas-cuda-dev -v %cd%:/workspace -p 8888:8888 altlas-dev:cuda-12.6-py3.11-v1.0

# Linux/macOS
docker run --gpus all -it --name altlas-cuda-dev -v $(pwd):/workspace -p 8888:8888 altlas-dev:cuda-12.6-py3.11-v1.0
```

Bu komut:
- Tüm GPU'ları konteyner içinde kullanılabilir hale getirir
- Mevcut dizini konteyner içindeki `/workspace` dizinine bağlar
- 8888 portunu Jupyter Notebook için açar

### 2. Jupyter Notebook Başlatma

Konteyner içinde:

```bash
jupyter notebook --ip 0.0.0.0 --port 8888 --no-browser --allow-root
```

Tarayıcınızda `http://localhost:8888` adresine giderek Jupyter Notebook'a erişebilirsiniz.

### 3. CUDA Kurulumunu Doğrulama

Konteyner içinde Python'u başlatın:

```bash
python
```

CUDA'nın Python'dan erişilebilir olduğunu doğrulayın:

```python
import torch
print(torch.cuda.is_available())  # True olmalı
print(torch.cuda.device_count())  # En az 1 olmalı
print(torch.cuda.get_device_name(0))  # GPU adını göstermeli

import cupy as cp
x_gpu = cp.array([1, 2, 3])
print(x_gpu)  # CuPy array'i göstermeli
```

### 4. Örnek CUDA Kodu Çalıştırma

Konteyner içinde bir Python dosyası oluşturun:

```python
# cuda_test.py
import torch
import time

# CUDA kullanılabilir mi kontrol et
if not torch.cuda.is_available():
    print("CUDA kullanılamıyor!")
    exit()

# GPU bilgilerini göster
print(f"CUDA Versiyonu: {torch.version.cuda}")
print(f"GPU Sayısı: {torch.cuda.device_count()}")
print(f"Aktif GPU: {torch.cuda.current_device()}")
print(f"GPU Adı: {torch.cuda.get_device_name(0)}")

# Basit bir CUDA testi
def gpu_test():
    # Büyük matrisler oluştur
    size = 10000
    a = torch.randn(size, size, device='cuda')
    b = torch.randn(size, size, device='cuda')
    
    # GPU'da matris çarpımı
    start_time = time.time()
    c = torch.matmul(a, b)
    torch.cuda.synchronize()  # GPU işleminin tamamlanmasını bekle
    gpu_time = time.time() - start_time
    
    # CPU'da matris çarpımı
    a_cpu = a.cpu()
    b_cpu = b.cpu()
    start_time = time.time()
    c_cpu = torch.matmul(a_cpu, b_cpu)
    cpu_time = time.time() - start_time
    
    print(f"GPU Hesaplama Süresi: {gpu_time:.4f} saniye")
    print(f"CPU Hesaplama Süresi: {cpu_time:.4f} saniye")
    print(f"Hızlanma: {cpu_time/gpu_time:.2f}x")

if __name__ == "__main__":
    gpu_test()
```

Dosyayı çalıştırın:

```bash
python cuda_test.py
```

## Sorun Giderme

### 1. NVIDIA Sürücü Sorunları

NVIDIA sürücülerinin doğru kurulduğunu kontrol edin:

```bash
nvidia-smi
```

Bu komut, GPU bilgilerini ve sürücü versiyonunu göstermelidir.

### 2. Docker GPU Erişim Sorunları

Docker'ın GPU'lara erişebildiğini kontrol edin:

```bash
docker run --gpus all nvidia/cuda:12.6.0-base-ubuntu20.04 nvidia-smi
```

Bu komut, konteyner içinden GPU bilgilerini göstermelidir.

### 3. CUDA Kütüphane Sorunları

Konteyner içinde CUDA kütüphanelerinin doğru kurulduğunu kontrol edin:

```bash
python -c "import torch; print('CUDA available:', torch.cuda.is_available())"
```

Bu komut `True` döndürmelidir.

## İletişim

Sorunlarla karşılaşırsanız veya yardıma ihtiyacınız varsa:
- DevOps Mühendisi (Can Tekin) ile iletişime geçin
- GitHub Issues üzerinden bir sorun bildirin
