# Veri Bilimcisi (Dr. Elif Demir) için Detaylı CUDA Görev Kırılımı

Bu belge, Veri Bilimcisi Dr. Elif Demir'in ALT_LAS projesi kapsamında, özellikle CUDA entegrasyonu ve AI model geliştirme/optimizasyon süreçlerindeki görevlerini hiyerarşik bir yapıda detaylandırmaktadır.

## Ana Görev 1: CUDA Tabanlı Model Eğitimi ve Optimizasyonu

### Alt Görev 1.1: Mevcut Modellerin CUDA ile Hızlandırılmış Eğitim Altyapısının Kurulumu ve Testi
    *   **Makro Görev 1.1.1:** CUDA ve cuDNN uyumlu Derin Öğrenme Kütüphanelerinin (TensorFlow, PyTorch) Kurulumu ve Yapılandırılması
        *   **Mikro Görev 1.1.1.1:** Gerekli NVIDIA sürücülerinin, CUDA Toolkit'in ve cuDNN kütüphanesinin sunucu/geliştirme ortamına kurulması.
            *   **Atlas Görevi AG-DS-CUDASETUP-001:** Kurulum adımlarının belgelenmesi, script oluşturulması (varsa). İlgili Modül: Yok (Sistem Kurulumu). Kütüphane: NVIDIA Drivers, CUDA, cuDNN. Bağımlılık: Sistem yönetimi. Lisans: NVIDIA Yazılım Lisansı.
        *   **Mikro Görev 1.1.1.2:** TensorFlow-GPU ve PyTorch'un CUDA destekli versiyonlarının kurulumu ve temel bir model ile GPU kullanımının doğrulanması.
            *   **Atlas Görevi AG-DS-LIBTEST-001:** `nvidia-smi` ile GPU tanıma, `tf.config.list_physical_devices('GPU')` ve `torch.cuda.is_available()` kontrolü. İlgili Modül: Yok (Test Scripti). Kütüphane: TensorFlow-GPU, PyTorch. Bağımlılık: CUDA/cuDNN. Lisans: Apache 2.0 (TF), BSD-benzeri (PyTorch).
    *   **Makro Görev 1.1.2:** Mevcut Model Eğitim Scriptlerinin CUDA Kullanımına Uyarlanması
        *   **Mikro Görev 1.1.2.1:** Eğitim scriptlerinde veri yükleme (DataLoaders) ve modelin GPU'ya taşınması (`.to(device)`) adımlarının implementasyonu.
            *   **Atlas Görevi AG-DS-SCRIPTGPU-001:** PyTorch için `device = torch.device("cuda" if torch.cuda.is_available() else "cpu")` kullanımı. İlgili Modül: `model_training_scripts/`. Kütüphane: PyTorch/TensorFlow. Bağımlılık: Model scriptleri. Lisans: Proje Lisansı.
        *   **Mikro Görev 1.1.2.2:** Dağıtık eğitim (Multi-GPU) için `torch.nn.DataParallel` veya `DistributedDataParallel` (DDP) entegrasyonunun araştırılması ve temel implementasyonu.
            *   **Atlas Görevi AG-DS-DISTRIBUTED-001:** DDP için gerekli ortam değişkenleri ve script modifikasyonları. İlgili Modül: `model_training_scripts/`. Kütüphane: PyTorch. Bağımlılık: Birden fazla GPU. Lisans: BSD-benzeri.

### Alt Görev 1.2: Model Çıkarım (Inference) Süreçlerinin TensorRT ile Optimizasyonu
    *   **Makro Görev 1.2.1:** Eğitilmiş Modellerin TensorRT Optimizasyonu için Hazırlanması
        *   **Mikro Görev 1.2.1.1:** Modellerin ONNX formatına dönüştürülmesi (Yazılım Mimarı ile koordineli).
            *   **Atlas Görevi AG-DS-ONNXCONV-001:** `torch.onnx.export` veya `tf2onnx` kullanımı. İlgili Modül: `model_conversion_scripts/`. Kütüphane: PyTorch, TensorFlow, ONNX, tf2onnx. Bağımlılık: Eğitilmiş model dosyaları. Lisans: BSD-benzeri, Apache 2.0, MIT.
        *   **Mikro Görev 1.2.1.2:** TensorRT için optimizasyon profillerinin (FP16, INT8 quantization) araştırılması ve tanımlanması.
            *   **Atlas Görevi AG-DS-TRTPROFILE-001:** TensorRT dokümantasyonunun incelenmesi, kalibrasyon veri setlerinin hazırlanması. İlgili Modül: Yok (Araştırma/Belgeleme). Kütüphane: TensorRT. Bağımlılık: ONNX modeli. Lisans: NVIDIA Yazılım Lisansı.
    *   **Makro Görev 1.2.2:** TensorRT Motorlarının Oluşturulması ve Performans Testleri
        *   **Mikro Görev 1.2.2.1:** ONNX modellerinden TensorRT motorlarının (`.engine` dosyaları) oluşturulması.
            *   **Atlas Görevi AG-DS-TRTENGINE-001:** `trtexec` aracı veya TensorRT Python API'sinin kullanılması. İlgili Modül: `tensorrt_scripts/`. Kütüphane: TensorRT. Bağımlılık: ONNX modeli, optimizasyon profili. Lisans: NVIDIA Yazılım Lisansı.
        *   **Mikro Görev 1.2.2.2:** Optimize edilmiş TensorRT motorlarının çıkarım hızı ve doğruluk açısından orijinal modellerle karşılaştırılması.
            *   **Atlas Görevi AG-DS-TRTTEST-001:** Test scriptleri ile latency ve throughput ölçümleri, doğruluk metriklerinin (accuracy, mAP vb.) karşılaştırılması. İlgili Modül: `performance_testing_scripts/`. Kütüphane: TensorRT, PyTorch/TensorFlow. Bağımlılık: TensorRT motoru, test veri seti. Lisans: Proje Lisansı.

## Ana Görev 2: Yeni AI Modellerinin Geliştirilmesi ve CUDA ile Entegrasyonu

### Alt Görev 2.1: Proje İhtiyaçlarına Yönelik Yeni Model Mimarilerinin Araştırılması ve Tasarımı
    *   **Makro Görev 2.1.1:** Literatür Taraması ve Son Teknoloji Modellerin İncelenmesi
        *   **Mikro Görev 2.1.1.1:** İlgili problem alanındaki (örn: görüntü işleme, doğal dil işleme) güncel makalelerin ve açık kaynaklı modellerin araştırılması.
            *   **Atlas Görevi AG-DS-LITREVIEW-001:** PapersWithCode, arXiv gibi kaynakların taranması. İlgili Modül: Yok (Araştırma). Kütüphane: Yok. Bağımlılık: Yok. Lisans: Yok.
    *   **Makro Görev 2.1.2:** Seçilen Model Mimarilerinin Prototipinin Geliştirilmesi
        *   **Mikro Görev 2.1.2.1:** Küçük bir veri seti üzerinde model prototipinin PyTorch/TensorFlow ile kodlanması ve temel eğitimin yapılması.
            *   **Atlas Görevi AG-DS-PROTOTYPE-001:** Model tanımı, eğitim döngüsü, kayıp fonksiyonu implementasyonu. İlgili Modül: `new_model_prototypes/`. Kütüphane: PyTorch/TensorFlow. Bağımlılık: Veri seti. Lisans: Proje Lisansı.

### Alt Görev 2.2: Veri Ön İşleme ve Artırma (Data Augmentation) Pipeline'larının CUDA ile Hızlandırılması
    *   **Makro Görev 2.2.1:** GPU Tabanlı Veri İşleme Kütüphanelerinin (DALI, cuPy) Araştırılması ve Entegrasyonu
        *   **Mikro Görev 2.2.1.1:** NVIDIA DALI (Data Loading Library) kütüphanesinin mevcut veri yükleme pipeline'larına entegrasyon potansiyelinin değerlendirilmesi.
            *   **Atlas Görevi AG-DS-DALI-001:** DALI pipeline'larının tasarlanması ve test edilmesi. İlgili Modül: `data_processing_scripts/`. Kütüphane: NVIDIA DALI. Bağımlılık: Veri setleri. Lisans: Apache 2.0.
        *   **Mikro Görev 2.2.1.2:** cuPy kullanılarak NumPy tabanlı ön işleme adımlarının GPU'ya taşınması.
            *   **Atlas Görevi AG-DS-CUPY-001:** NumPy kodunun cuPy eşdeğerleriyle değiştirilmesi ve performans karşılaştırması. İlgili Modül: `data_processing_scripts/`. Kütüphane: cuPy. Bağımlılık: NumPy kodu. Lisans: MIT.

