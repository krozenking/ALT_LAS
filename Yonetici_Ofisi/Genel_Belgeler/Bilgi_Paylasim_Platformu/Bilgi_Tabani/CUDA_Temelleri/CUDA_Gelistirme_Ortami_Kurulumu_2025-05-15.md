# CUDA Geliştirme Ortamı Kurulumu

**Yazar:** Proje Yöneticisi (AI)
**Tarih:** 2025-05-15
**Kategori:** CUDA Temelleri
**Etiketler:** CUDA, kurulum, geliştirme ortamı, Docker, NVIDIA

## Özet

Bu doküman, ALT_LAS projesi için CUDA geliştirme ortamının kurulumu ve yapılandırılması hakkında bilgi sağlar. Docker tabanlı standart bir geliştirme ortamı, NVIDIA sürücüleri, CUDA Toolkit ve diğer gerekli bileşenlerin kurulumu adım adım açıklanmıştır.

## İçindekiler

1. [Giriş](#giriş)
2. [Gereksinimler](#gereksinimler)
3. [NVIDIA Sürücülerinin Kurulumu](#nvidia-sürücülerinin-kurulumu)
4. [Docker ve NVIDIA Container Toolkit Kurulumu](#docker-ve-nvidia-container-toolkit-kurulumu)
5. [ALT_LAS CUDA Geliştirme Docker İmajı](#alt_las-cuda-geliştirme-docker-imajı)
6. [Geliştirme Ortamının Test Edilmesi](#geliştirme-ortamının-test-edilmesi)
7. [Sorun Giderme](#sorun-giderme)
8. [Referanslar](#referanslar)

## Giriş

ALT_LAS projesi CUDA entegrasyonu için, tüm geliştirme ekibinin aynı ortamda çalışabilmesi ve tutarlı sonuçlar elde edebilmesi amacıyla standart bir geliştirme ortamı oluşturulmuştur. Bu ortam, Docker konteynerları kullanılarak sağlanmaktadır ve NVIDIA GPU'ları ile çalışabilmek için gerekli tüm bileşenleri içermektedir.

## Gereksinimler

- NVIDIA GPU (Compute Capability 3.5 veya üzeri)
- Linux işletim sistemi (Ubuntu 20.04 LTS önerilir)
- En az 8 GB RAM
- En az 20 GB boş disk alanı
- Docker 19.03 veya üzeri
- NVIDIA Container Toolkit

## NVIDIA Sürücülerinin Kurulumu

NVIDIA sürücülerini kurmak için aşağıdaki adımları izleyin:

1. Mevcut sürücüleri kontrol edin:
   ```bash
   nvidia-smi
   ```

2. Eğer sürücü kurulu değilse veya güncel değilse, Ubuntu'da aşağıdaki komutları çalıştırın:
   ```bash
   sudo apt-get update
   sudo apt-get install -y nvidia-driver-525
   ```

3. Sistemi yeniden başlatın:
   ```bash
   sudo reboot
   ```

4. Kurulumu doğrulayın:
   ```bash
   nvidia-smi
   ```

   Aşağıdakine benzer bir çıktı görmelisiniz:
   ```
   +-----------------------------------------------------------------------------+
   | NVIDIA-SMI 525.105.17   Driver Version: 525.105.17   CUDA Version: 12.0     |
   |-------------------------------+----------------------+----------------------+
   | GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
   | Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
   |                               |                      |               MIG M. |
   |===============================+======================+======================|
   |   0  NVIDIA GeForce ...  Off  | 00000000:01:00.0  On |                  N/A |
   | 30%   45C    P8    26W / 215W |    456MiB /  8192MiB |      1%      Default |
   |                               |                      |                  N/A |
   +-------------------------------+----------------------+----------------------+
   ```

## Docker ve NVIDIA Container Toolkit Kurulumu

1. Docker'ı kurun:
   ```bash
   sudo apt-get update
   sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
   sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io
   ```

2. Docker'ı sudo olmadan kullanabilmek için kullanıcınızı docker grubuna ekleyin:
   ```bash
   sudo usermod -aG docker $USER
   ```
   Bu değişikliğin etkili olması için oturumu kapatıp yeniden açın.

3. NVIDIA Container Toolkit'i kurun:
   ```bash
   distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
   curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
   curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
   sudo apt-get update
   sudo apt-get install -y nvidia-container-toolkit
   ```

4. Docker servisini yeniden başlatın:
   ```bash
   sudo systemctl restart docker
   ```

5. Kurulumu test edin:
   ```bash
   docker run --gpus all nvidia/cuda:11.8.0-base-ubuntu20.04 nvidia-smi
   ```
   Bu komut, konteyner içinden nvidia-smi çıktısını göstermelidir.

## ALT_LAS CUDA Geliştirme Docker İmajı

ALT_LAS projesi için özel olarak hazırlanmış CUDA geliştirme Docker imajını kullanmak için:

1. İmajı çekin:
   ```bash
   docker pull altlas/cuda-dev:11.8.0-py3.11-v1.0
   ```

2. Geliştirme konteynerini başlatın:
   ```bash
   docker run --gpus all -it --name altlas-cuda-dev \
     -v $(pwd):/workspace \
     -p 8888:8888 \
     altlas/cuda-dev:11.8.0-py3.11-v1.0
   ```

   Bu komut:
   - Tüm GPU'ları konteyner içinde kullanılabilir hale getirir
   - Mevcut dizini konteyner içindeki `/workspace` dizinine bağlar
   - 8888 portunu Jupyter Notebook için açar

## Geliştirme Ortamının Test Edilmesi

Geliştirme ortamının doğru çalıştığını test etmek için:

1. Konteyner içinde Python'u başlatın:
   ```bash
   python3
   ```

2. CUDA'nın Python'dan erişilebilir olduğunu doğrulayın:
   ```python
   import torch
   print(torch.cuda.is_available())  # True olmalı
   print(torch.cuda.device_count())  # En az 1 olmalı
   print(torch.cuda.get_device_name(0))  # GPU adını göstermeli
   
   import cupy as cp
   x_gpu = cp.array([1, 2, 3])
   print(x_gpu)  # CuPy array'i göstermeli
   ```

## Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

1. **"Error: could not select device driver with capabilities: [[gpu]]"**
   - NVIDIA Container Toolkit'in doğru kurulduğundan emin olun
   - Docker servisini yeniden başlatın: `sudo systemctl restart docker`

2. **"CUDA error: no CUDA-capable device is detected"**
   - NVIDIA sürücülerinin doğru kurulduğunu kontrol edin: `nvidia-smi`
   - Docker'a `--gpus all` parametresini eklediğinizden emin olun

3. **"ImportError: libcuda.so.1: cannot open shared object file"**
   - CUDA kütüphanelerinin doğru kurulduğunu kontrol edin
   - Konteyner içinde: `ldconfig -p | grep cuda`

### Destek Alma

Sorunlarla karşılaşırsanız:
- DevOps Mühendisi (Can Tekin) ile iletişime geçin
- Bilgi Paylaşım Platformu'ndaki ilgili dokümanlara başvurun
- NVIDIA Developer Forums: https://forums.developer.nvidia.com/

## Referanslar

1. NVIDIA CUDA Toolkit Dokümantasyonu: https://docs.nvidia.com/cuda/
2. NVIDIA Container Toolkit: https://github.com/NVIDIA/nvidia-docker
3. Docker Dokümantasyonu: https://docs.docker.com/
4. PyTorch CUDA Kurulumu: https://pytorch.org/get-started/locally/
5. CuPy Dokümantasyonu: https://docs.cupy.dev/en/stable/

---

**Not:** Bu doküman, ALT_LAS projesi CUDA entegrasyonu sürecinde ekip üyelerine yardımcı olmak amacıyla hazırlanmıştır. Doküman, projenin ilerleyişine ve ihtiyaçlara göre güncellenecektir.
