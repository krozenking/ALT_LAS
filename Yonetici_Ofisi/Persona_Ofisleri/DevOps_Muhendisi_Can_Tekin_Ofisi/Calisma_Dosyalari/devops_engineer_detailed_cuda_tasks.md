# DevOps Mühendisi (Can Tekin) - Detaylı Görev Kırılımı (CUDA Entegrasyonu)

Bu belge, DevOps Mühendisi (Can Tekin) personasının ALT_LAS projesine CUDA entegrasyonu sürecindeki ana görevlerini, kullanıcı tarafından talep edilen hiyerarşik yapıya (Alt Görevler, Makro Görevler, Mikro Görevler ve Atlas Görevleri) göre detaylandırmaktadır.

**Ana Sorumluluk Alanı:** CUDA destekli geliştirme ve dağıtım ortamlarının kurulması, CI/CD süreçlerinin CUDA uyumlu hale getirilmesi, GPU kaynaklarının izlenmesi ve yönetilmesi, dağıtım stratejilerinin oluşturulması.

## Alt Görev 1: CUDA Uyumlu Geliştirme ve Test Ortamlarının Kurulumu ve Yönetimi

*   **Açıklama:** Geliştiricilerin ve QA ekibinin CUDA tabanlı geliştirmeler yapabilmesi ve testlerini yürütebilmesi için gerekli NVIDIA sürücülerinin, CUDA Toolkit'in, cuDNN'in ve diğer bağımlılıkların kurulu olduğu standartlaştırılmış geliştirme ve test ortamlarının (Docker imajları veya VM şablonları) hazırlanması ve bakımı.

### Makro Görev 1.1: Standart CUDA Geliştirme Docker İmajının Oluşturulması
    *   **Açıklama:** Projede kullanılacak spesifik CUDA Toolkit, cuDNN, Python ve temel AI kütüphanelerini içeren bir Docker imajının oluşturulması ve sürüm kontrolü altında tutulması.
    *   **Mikro Görev 1.1.1:** Temel NVIDIA CUDA imajının (örn. `nvidia/cuda:11.8.0-cudnn8-devel-ubuntu20.04`) seçilmesi ve projenin Python versiyonunun kurulması.
        *   **Atlas Görevi AG-DEVOPS-DOCKERIMG-001:**
            *   **Açıklama:** Dockerfile oluşturarak `FROM nvidia/cuda:11.8.0-cudnn8-devel-ubuntu20.04` direktifi ile başlanması, `apt-get update` ve `apt-get install -y python3.11 python3.11-pip python3.11-venv` komutları ile Python kurulumunun yapılması.
            *   **İlgili Modül/Belge:** `Dockerfile.dev`, Proje Bağımlılıkları Dokümanı.
            *   **Kullanılacak Kütüphane/Araç:** Docker (Apache 2.0), NVIDIA CUDA Base Image (NVIDIA EULA).
            *   **Bağımlılıklar/İlişkiler:** Proje için belirlenen CUDA ve Python versiyonları.
            *   **Lisans Uyumluluğu:** Docker ve NVIDIA base image (kullanım koşulları dahilinde) uyumlu.
    *   **Mikro Görev 1.1.2:** Proje bağımlılıklarının (TensorFlow, PyTorch, CuPy, Numba, RAPIDS vb.) Docker imajına eklenmesi.
        *   **Atlas Görevi AG-DEVOPS-DOCKERIMG-002:**
            *   **Açıklama:** `requirements.txt` dosyasındaki (veya CUDA'ya özel `requirements-gpu.txt`) kütüphanelerin `pip3.11 install -r requirements-gpu.txt` komutu ile Docker imajına kurulması. Gerekirse TensorRT gibi SDK'ların manuel kurulum adımlarının eklenmesi.
            *   **İlgili Modül/Belge:** `Dockerfile.dev`, `requirements-gpu.txt`.
            *   **Kullanılacak Kütüphane/Araç:** `pip` (MIT), Kurulacak Python kütüphaneleri (Apache 2.0, MIT, BSD vb. - lisansları önceden incelenmiş ve uyumlu).
            *   **Bağımlılıklar/İlişkiler:** Veri Bilimcisi ve Backend Geliştirici (kütüphane listesi ve versiyonları).
            *   **Lisans Uyumluluğu:** Kullanılan Python kütüphaneleri ticari ve kapalı kaynak dağıtıma uygun.
    *   **Mikro Görev 1.1.3:** Docker imajının bir container registry'ye (örn. Docker Hub, AWS ECR, GitHub Packages) push edilmesi ve versiyonlanması.
        *   **Atlas Görevi AG-DEVOPS-DOCKERIMG-003:**
            *   **Açıklama:** `docker build`, `docker tag` ve `docker push` komutları kullanılarak oluşturulan imajın, seçilen container registry'ye yüklenmesi. İmaj etiketlerinin (tag) versiyonlama stratejisine (örn. `altlas-dev:cuda-11.8-py3.11-v1.0`) uygun olması.
            *   **İlgili Modül/Belge:** `Dockerfile.dev`, CI/CD pipeline scriptleri.
            *   **Kullanılacak Kütüphane/Araç:** Docker, Seçilen Container Registry.
            *   **Bağımlılıklar/İlişkiler:** CI/CD sistemi.
            *   **Lisans Uyumluluğu:** N/A (Araçlar için).

### Makro Görev 1.2: CUDA Uyumlu Test Ortamlarının Hazırlanması
    *   **Açıklama:** QA ekibinin CUDA tabanlı testleri çalıştırabilmesi için, geliştirme imajına benzer ancak test araçlarını da içeren bir test ortamı Docker imajının veya VM şablonunun oluşturulması.
    *   **Mikro Görev 1.2.1:** Test ortamı için gerekli ek araçların (örn. PyTest, NVIDIA test araçları, benchmark scriptleri için bağımlılıklar) belirlenmesi ve Docker imajına eklenmesi.
        *   **Atlas Görevi AG-DEVOPS-DOCKERTEST-001:**
            *   **Açıklama:** Geliştirme Dockerfile (`Dockerfile.dev`) temel alınarak, QA Mühendisi ile koordineli bir şekilde `pytest`, `nvidia-smi` (zaten base imajda olmalı), ve diğer test bağımlılıklarının eklendiği bir `Dockerfile.test` oluşturulması.
            *   **İlgili Modül/Belge:** `Dockerfile.test`, QA Test Planı.
            *   **Kullanılacak Kütüphane/Araç:** Docker, `pytest` (MIT Lisansı - Uyumlu).
            *   **Bağımlılıklar/İlişkiler:** QA Mühendisi (test aracı gereksinimleri).
            *   **Lisans Uyumluluğu:** `pytest` ticari ve kapalı kaynak dağıtıma uygun.

## Alt Görev 2: CUDA Destekli Servisler için CI/CD Pipeline'larının Geliştirilmesi ve Güncellenmesi

*   **Açıklama:** CUDA ile geliştirilen kodun otomatik olarak derlenmesi, test edilmesi ve dağıtılabilir paketler haline getirilmesi için mevcut CI/CD pipeline'larının (örn. Jenkins, GitLab CI, GitHub Actions) güncellenmesi veya yenilerinin oluşturulması.

### Makro Görev 2.1: CI Pipeline'ında CUDA Kod Derleme ve Birim Testlerinin Entegrasyonu
    *   **Açıklama:** Her kod push işleminden sonra CUDA içeren modüllerin derlenmesi (eğer C++/CUDA çekirdekleri varsa) ve Python tabanlı CUDA kodları için birim testlerinin GPU destekli runner'lar üzerinde çalıştırılması.
    *   **Mikro Görev 2.1.1:** CI sisteminde GPU destekli bir runner/agent konfigürasyonunun yapılması.
        *   **Atlas Görevi AG-DEVOPS-CICD-GPURUNNER-001:**
            *   **Açıklama:** Seçilen CI/CD platformunda (örn. GitLab CI runner, GitHub Actions self-hosted runner) NVIDIA GPU'larına erişimi olan bir runner'ın kurulması ve yapılandırılması. Bu runner, Makro Görev 1.1'de oluşturulan CUDA geliştirme Docker imajını kullanabilmelidir.
            *   **İlgili Modül/Belge:** CI/CD Platform Dokümantasyonu, `Dockerfile.dev`.
            *   **Kullanılacak Kütüphane/Araç:** CI/CD Platformu, Docker, NVIDIA Container Toolkit.
            *   **Bağımlılıklar/İlişkiler:** Proje altyapısı (GPU'lu sunucu).
            *   **Lisans Uyumluluğu:** N/A (Altyapı ve platforma bağlı).
    *   **Mikro Görev 2.1.2:** CUDA birim testlerinin (örn. `pytest` ile yazılmış ve CuPy/Numba kullanan testler) CI pipeline'ına eklenmesi.
        *   **Atlas Görevi AG-DEVOPS-CICD-UNITTEST-001:**
            *   **Açıklama:** CI pipeline script'ine (örn. `.gitlab-ci.yml`, GitHub Actions workflow dosyası) `pytest tests/gpu/` gibi bir komut eklenerek GPU gerektiren birim testlerinin GPU'lu runner üzerinde çalıştırılmasının sağlanması.
            *   **İlgili Modül/Belge:** CI/CD pipeline scripti, Proje test yapısı.
            *   **Kullanılacak Kütüphane/Araç:** `pytest` (MIT Lisansı - Uyumlu).
            *   **Bağımlılıklar/İlişkiler:** GPU'lu runner, QA Mühendisi (test scriptleri).
            *   **Lisans Uyumluluğu:** `pytest` uyumlu.

### Makro Görev 2.2: CUDA Uyumlu Dağıtım Paketlerinin (Docker İmajları) CD Pipeline'ında Oluşturulması
    *   **Açıklama:** Başarılı CI süreçlerinden sonra, CUDA runtime kütüphanelerini ve optimize edilmiş modelleri içeren, üretime hazır Docker imajlarının otomatik olarak oluşturulması ve container registry'ye push edilmesi.
    *   **Mikro Görev 2.2.1:** Üretim için optimize edilmiş bir CUDA runtime Dockerfile (`Dockerfile.prod`) oluşturulması.
        *   **Atlas Görevi AG-DEVOPS-DOCKERPROD-001:**
            *   **Açıklama:** `Dockerfile.prod` oluşturularak, `nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu20.04` gibi daha küçük bir base runtime imajının kullanılması. Sadece gerekli CUDA runtime kütüphanelerinin, Python uygulamasının ve TensorRT motorları gibi optimize edilmiş model dosyalarının imaja kopyalanması. Geliştirme araçları ve gereksiz bağımlılıklar çıkarılmalıdır.
            *   **İlgili Modül/Belge:** `Dockerfile.prod`, `Dockerfile.dev` (referans için).
            *   **Kullanılacak Kütüphane/Araç:** Docker, NVIDIA CUDA Runtime Image (NVIDIA EULA).
            *   **Bağımlılıklar/İlişkiler:** Optimize edilmiş model dosyaları (Veri Bilimcisi).
            *   **Lisans Uyumluluğu:** NVIDIA runtime image (kullanım koşulları dahilinde) uyumlu.
    *   **Mikro Görev 2.2.2:** CD pipeline'ında üretim Docker imajının build edilmesi ve registry'ye push edilmesinin otomatize edilmesi.
        *   **Atlas Görevi AG-DEVOPS-CD-BUILDPUSH-001:**
            *   **Açıklama:** CI pipeline'ının başarılı test aşamasından sonra tetiklenecek bir CD adımı eklenerek, `Dockerfile.prod` kullanılarak üretim imajının build edilmesi, versiyonlanması ve container registry'ye push edilmesinin sağlanması.
            *   **İlgili Modül/Belge:** CI/CD pipeline scripti, `Dockerfile.prod`.
            *   **Kullanılacak Kütüphane/Araç:** Docker, CI/CD Platformu.
            *   **Bağımlılıklar/İlişkiler:** Container Registry.
            *   **Lisans Uyumluluğu:** N/A.

## Alt Görev 3: GPU Kaynaklarının İzlenmesi ve Kubernetes Entegrasyonu (Öneri S3.1, S3.2 ile ilişkili)

*   **Açıklama:** Kubernetes üzerinde çalışacak CUDA uygulamaları için GPU kaynaklarının etkin bir şekilde izlenmesi, tahsis edilmesi ve yönetilmesi. NVIDIA Nsight gibi araçlarla detaylı çekirdek izleme altyapısının kurulması.

### Makro Görev 3.1: Kubernetes için NVIDIA Device Plugin Kurulumu ve Konfigürasyonu
    *   **Açıklama:** Kubernetes cluster'ında GPU kaynaklarının pod'lara atanabilmesi için NVIDIA Device Plugin for Kubernetes'in kurulması ve yapılandırılması.
    *   **Mikro Görev 3.1.1:** NVIDIA Device Plugin'in Kubernetes cluster'ına deploy edilmesi.
        *   **Atlas Görevi AG-DEVOPS-K8S-DEVICEPLUGIN-001:**
            *   **Açıklama:** NVIDIA'nın resmi dokümantasyonunu takip ederek `nvidia-device-plugin` DaemonSet'inin Kubernetes cluster'ına `kubectl apply -f <nvidia-device-plugin.yml>` komutu ile deploy edilmesi.
            *   **İlgili Modül/Belge:** Kubernetes Cluster Yönetim Arayüzü/CLI, NVIDIA Device Plugin Dokümantasyonu.
            *   **Kullanılacak Kütüphane/Araç:** `kubectl` (Apache 2.0), NVIDIA Device Plugin (Apache 2.0).
            *   **Bağımlılıklar/İlişkiler:** Çalışan bir Kubernetes cluster, worker node'larda NVIDIA sürücülerinin kurulu olması.
            *   **Lisans Uyumluluğu:** `kubectl` ve NVIDIA Device Plugin ticari ve kapalı kaynak dağıtıma uygun.

### Makro Görev 3.2: GPU İzleme için Prometheus ve Grafana Entegrasyonu (DCGM ile)
    *   **Açıklama:** NVIDIA Data Center GPU Manager (DCGM) kullanarak GPU metriklerinin (kullanım, sıcaklık, bellek) toplanması ve bu metriklerin Prometheus'a aktarılarak Grafana'da görselleştirilmesi.
    *   **Mikro Görev 3.2.1:** DCGM exporter'ın kurularak Prometheus'un GPU metriklerini scrape etmesinin sağlanması.
        *   **Atlas Görevi AG-DEVOPS-MONITOR-DCGMEXPORTER-001:**
            *   **Açıklama:** `dcgm-exporter` servisinin GPU'lu node'larda çalışacak şekilde deploy edilmesi ve Prometheus konfigürasyonuna (`prometheus.yml`) bu exporter'ı scrape edecek bir job eklenmesi.
            *   **İlgili Modül/Belge:** Prometheus Konfigürasyonu, DCGM Exporter Dokümantasyonu.
            *   **Kullanılacak Kütüphane/Araç:** `dcgm-exporter` (Apache 2.0), Prometheus (Apache 2.0).
            *   **Bağımlılıklar/İlişkiler:** Çalışan Prometheus ve DCGM.
            *   **Lisans Uyumluluğu:** `dcgm-exporter` ve Prometheus ticari ve kapalı kaynak dağıtıma uygun.
    *   **Mikro Görev 3.2.2:** Grafana'da temel GPU izleme dashboard'unun oluşturulması.
        *   **Atlas Görevi AG-DEVOPS-MONITOR-GRAFANADASH-001:**
            *   **Açıklama:** Grafana'da yeni bir dashboard oluşturularak, Prometheus'tan gelen DCGM metriklerini (GPU kullanımı, bellek kullanımı, sıcaklık vb.) gösteren panellerin eklenmesi. **Not: Grafana OSS (AGPLv3) lisansı ticari kapalı kaynak dağıtımda sorunlu olabilir. Bu dashboard'un şirket içi kullanım veya kullanıcıya kendi Grafana'sında kurması için şablon olarak sunulması değerlendirilmelidir. Alternatif olarak, Apache ECharts gibi bir kütüphane ile özel bir dashboard arayüzü geliştirilebilir veya Grafana Enterprise lisansı alınabilir.**
            *   **İlgili Modül/Belge:** Grafana, Prometheus Veri Kaynağı.
            *   **Kullanılacak Kütüphane/Araç:** Grafana (AGPLv3 veya Enterprise), Prometheus (Apache 2.0).
            *   **Bağımlılıklar/İlişkiler:** AG-DEVOPS-MONITOR-DCGMEXPORTER-001.
            *   **Lisans Uyumluluğu:** Grafana OSS (AGPLv3) ticari kapalı kaynak dağıtım için **uyumsuz**. Alternatifler değerlendirilmeli.

### Makro Görev 3.3: NVIDIA Nsight ile Detaylı Çekirdek İzleme Altyapısının Kurulumu (Öneri S3.2)
    *   **Açıklama:** Geliştirme ve test ortamlarında, CUDA çekirdeklerinin detaylı performans analizi için NVIDIA Nsight Systems/Compute araçlarının kullanımına yönelik altyapının ve süreçlerin oluşturulması.
    *   **Mikro Görev 3.3.1:** Nsight Systems ve Nsight Compute araçlarının geliştirme/test ortamlarına (veya ilgili Docker imajlarına) kurulumu veya erişilebilirliğinin sağlanması.
        *   **Atlas Görevi AG-DEVOPS-NSIGHT-SETUP-001:**
            *   **Açıklama:** Nsight Systems ve Nsight Compute'un CUDA geliştirme Docker imajına (`Dockerfile.dev`) veya geliştiricilerin erişebileceği merkezi bir sunucuya kurulması. Komut satırı versiyonlarının (`nsys`, `ncu`) path'e eklenmesi.
            *   **İlgili Modül/Belge:** NVIDIA Nsight Dokümantasyonu, `Dockerfile.dev`.
            *   **Kullanılacak Kütüphane/Araç:** NVIDIA Nsight Suite (NVIDIA EULA - Geliştirme aracı olarak uyumlu).
            *   **Bağımlılıklar/İlişkiler:** CUDA Toolkit.
            *   **Lisans Uyumluluğu:** Nsight geliştirme araçları olarak ticari projelerde kullanıma uygun.

*(Bu detaylandırma, DevOps Mühendisi personasının görevlerinin bir başlangıcıdır. Diğer Alt Görevler ve Makro/Mikro/Atlas görevleri benzer şekilde detaylandırılacaktır.)*
