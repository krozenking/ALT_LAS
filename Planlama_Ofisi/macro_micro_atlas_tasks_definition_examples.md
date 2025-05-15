# Makro, Mikro ve Atlas Görevleri: Kavramsal Çerçeve ve Örnekler

Bu belge, `/hierarchical_task_structure_definition.md` dosyasında tanımlanan hiyerarşik görev yapısındaki Makro, Mikro ve özellikle Atlas görevlerinin kavramsal çerçevesini ve pratik uygulama örneklerini detaylandırmaktadır.

## 1. Kavramsal Tanımlar

*   **Makro Görevler (Macro-Tasks):**
    *   Bir Alt Görevin daha küçük, yönetilebilir iş paketlerine bölünmüş halidir.
    *   Genellikle belirli bir uzmanlık alanına hitap eder ve birkaç adımdan oluşur.
    *   Tamamlanması birkaç gün sürebilir.
    *   Bir veya birden fazla Mikro Görevden oluşur.

*   **Mikro Görevler (Micro-Tasks):**
    *   Bir Makro Görevin en küçük, atomik iş birimleridir.
    *   Genellikle tek bir kişi tarafından kısa bir sürede (birkaç saat veya bir iş günü) tamamlanabilir.
    *   Çok spesifik bir eylemi, çıktıyı veya kararı hedefler.
    *   Bir veya birden fazla Atlas Görevi ile hayata geçirilir.

*   **Atlas Görevleri (Atlas Tasks):**
    *   Projenin "alt" (en alt seviye) ve "last" (son, temel) görevleridir.
    *   Bir Mikro Görevin nasıl gerçekleştirileceğine dair **teknik bir reçete veya yol haritası** sunar.
    *   **En Temel Birimdir:** Daha fazla işlevsel alt parçaya bölünmesi anlamlı olmayan en küçük eylem adımıdır.
    *   **Yol Göstericidir:** Hangi spesifik eylemlerin yapılacağını, hangi araçların veya fonksiyonların kullanılacağını belirtir.
    *   **Modül/Kütüphane Bağlantısı:**
        *   Etkilenecek veya kullanılacak spesifik kod modülünü (dosya adı, fonksiyon adı vb.) işaret eder.
        *   Kullanılacak kütüphaneyi (ve ideal olarak versiyonunu) ve bu kütüphanenin lisans uyumluluğunu (önceden yapılan analize göre) belirtir.
    *   **Bağımlılık ve İlişki Detayları:**
        *   Görevin girdilerini (hangi diğer görevlerin çıktısına bağlı olduğu) ve çıktılarını (hangi sonraki görevler için girdi oluşturduğu) tanımlar.
        *   Diğer modüllerle, kütüphanelerle veya proje özellikleriyle olan teknik etkileşimleri ve bağımlılıkları açıklar.
    *   **Lisans Uyumluluğu Notu:** Kullanılacak her bir kütüphane veya aracın, projenin ticari ve kapalı kaynak kodlu dağıtım hedefine uygun olup olmadığına dair bir not içerir.

## 2. Örnek Görev Kırılımı

**Ana Görev:** AI Orchestrator CUDA Entegrasyonu

**Alt Görev:** Model Çıkarım Motorunun TensorRT ile Optimizasyonu

### Örnek Makro Görev 1: Mevcut Modelin TensorRT için Hazırlanması ve Dönüştürülmesi

*   **Sorumlu Persona:** Veri Bilimcisi (Dr. Elif Demir)
*   **Açıklama:** `ai-orchestrator` servisinde kullanılan bir TensorFlow/PyTorch modelinin TensorRT ile optimizasyon için uygun formata (örn. ONNX) dönüştürülmesi ve temel TensorRT uyumluluk kontrollerinin yapılması.

    #### Örnek Mikro Görev 1.1: Modelin ONNX Formatına Dönüştürülmesi
    *   **Sorumlu Persona:** Veri Bilimcisi (Dr. Elif Demir)
    *   **Açıklama:** Seçilen TensorFlow veya PyTorch modelinin ONNX (Open Neural Network Exchange) formatına başarılı bir şekilde dönüştürülmesi.

        *   **Atlas Görevi AG-MOD-ONNX-001 (TensorFlow için):**
            *   **Açıklama:** Mevcut TensorFlow Keras modelinin (`.h5` veya SavedModel formatında) ONNX formatına dönüştürülmesi.
            *   **İlgili Modül:** `ai-orchestrator/utils/model_exporter.py` (yeni oluşturulabilir veya mevcut bir modüle eklenebilir)
            *   **Kullanılacak Kütüphane(ler):**
                *   `tensorflow` (v2.10+, Apache 2.0) - Lisans: Uyumlu.
                *   `tf2onnx` (v1.14+, MIT License) - Lisans: Uyumlu.
                *   `onnx` (v1.13+, Apache 2.0) - Lisans: Uyumlu.
            *   **Bağımlılıklar/İlişkiler:**
                *   **Girdi:** Eğitilmiş TensorFlow modeli dosyası.
                *   **Çıktı:** `.onnx` uzantılı model dosyası (Mikro Görev 1.2 için girdi).
                *   TensorFlow modelinin yapısının ONNX tarafından desteklenen operasyonları içermesi.
            *   **Lisans Uyumluluğu:** Tüm kütüphaneler ticari ve kapalı kaynak dağıtıma uygun.

        *   **Atlas Görevi AG-MOD-ONNX-002 (PyTorch için):**
            *   **Açıklama:** Mevcut PyTorch modelinin (`.pth` veya `.pt` formatında) ONNX formatına dönüştürülmesi.
            *   **İlgili Modül:** `ai-orchestrator/utils/model_exporter.py`
            *   **Kullanılacak Kütüphane(ler):**
                *   `torch` (v1.13+, BSD-benzeri) - Lisans: Uyumlu.
                *   `torchvision` (eğer model torchvision kullanıyorsa, v0.14+, BSD-benzeri) - Lisans: Uyumlu.
                *   `onnx` (v1.13+, Apache 2.0) - Lisans: Uyumlu.
            *   **Bağımlılıklar/İlişkiler:**
                *   **Girdi:** Eğitilmiş PyTorch model dosyası ve örnek bir girdi tensörü.
                *   **Çıktı:** `.onnx` uzantılı model dosyası (Mikro Görev 1.2 için girdi).
                *   PyTorch modelinin `torch.onnx.export` fonksiyonu ile uyumlu olması.
            *   **Lisans Uyumluluğu:** Tüm kütüphaneler ticari ve kapalı kaynak dağıtıma uygun.

    #### Örnek Mikro Görev 1.2: ONNX Modelinin TensorRT ile Temel Uyumluluk Kontrolü ve Parse Edilmesi
    *   **Sorumlu Persona:** Veri Bilimcisi (Dr. Elif Demir)
    *   **Açıklama:** Oluşturulan ONNX modelinin TensorRT tarafından parse edilip edilemediğinin ve temel bir TensorRT motorunun (engine) oluşturulup oluşturulamadığının kontrol edilmesi.

        *   **Atlas Görevi AG-TRT-PARSE-001:**
            *   **Açıklama:** ONNX model dosyasının TensorRT Python API (`tensorrt.Builder`, `tensorrt.Logger`, `tensorrt.INetworkDefinition`, `tensorrt.OnnxParser`) kullanılarak parse edilmesi.
            *   **İlgili Modül:** `ai-orchestrator/tensorrt_utils/engine_builder.py` (yeni oluşturulabilir)
            *   **Kullanılacak Kütüphane(ler):**
                *   `tensorrt` (NVIDIA CUDA Toolkit EULA kapsamında, genellikle v8.x+) - Lisans: NVIDIA EULA (Dağıtım için EULA incelenmeli, genellikle runtime dağıtımı uyumlu).
                *   `onnx` (v1.13+, Apache 2.0) - Lisans: Uyumlu.
                *   `pycuda` (opsiyonel, CUDA ile doğrudan etkileşim için, MIT License) - Lisans: Uyumlu.
            *   **Bağımlılıklar/İlişkiler:**
                *   **Girdi:** Mikro Görev 1.1'den elde edilen `.onnx` dosyası.
                *   **Çıktı:** Başarılı parse işlemi logu veya hata mesajları. Temel bir TensorRT motoru oluşturma denemesi (optimizasyonsuz).
                *   Sistemde uyumlu NVIDIA sürücülerinin ve TensorRT kütüphanelerinin kurulu olması.
            *   **Lisans Uyumluluğu:** `tensorrt` runtime kütüphanelerinin dağıtımı NVIDIA EULA'sına tabidir, genellikle ticari kullanıma izin verir. Diğerleri uyumlu.

### Örnek Makro Görev 2: TensorRT Motorunun Oluşturulması ve Performans Optimizasyonu

*   **Sorumlu Persona:** Veri Bilimcisi (Dr. Elif Demir), Kıdemli Backend Geliştirici (Ahmet Çelik)
*   **Açıklama:** Parse edilen ONNX modelinden, farklı optimizasyon profilleri (örn. FP16, INT8 hassasiyeti) kullanılarak optimize edilmiş TensorRT motorlarının (engine) oluşturulması ve performanslarının değerlendirilmesi.

    #### Örnek Mikro Görev 2.1: FP16 Hassasiyetinde TensorRT Motoru Oluşturma
    *   **Sorumlu Persona:** Veri Bilimcisi (Dr. Elif Demir)
    *   **Açıklama:** ONNX modelinden FP16 (yarım hassasiyet) optimizasyonu ile bir TensorRT motoru oluşturulması.

        *   **Atlas Görevi AG-TRT-FP16-001:**
            *   **Açıklama:** TensorRT builder konfigürasyonunda (`IBuilderConfig`) FP16 modunun etkinleştirilerek (`builder_config.set_flag(trt.BuilderFlag.FP16)`) TensorRT motorunun serialize edilmesi.
            *   **İlgili Modül:** `ai-orchestrator/tensorrt_utils/engine_builder.py`
            *   **Kullanılacak Kütüphane(ler):** `tensorrt` (v8.x+, NVIDIA EULA) - Lisans: NVIDIA EULA (Runtime dağıtımı genellikle uyumlu).
            *   **Bağımlılıklar/İlişkiler:**
                *   **Girdi:** Başarıyla parse edilmiş ONNX network tanımı (Mikro Görev 1.2 çıktısı).
                *   **Çıktı:** `.engine` veya `.plan` uzantılı serialize edilmiş FP16 TensorRT motoru.
                *   Kullanılan GPU'nun FP16 operasyonlarını desteklemesi.
            *   **Lisans Uyumluluğu:** `tensorrt` runtime kütüphanelerinin dağıtımı NVIDIA EULA'sına tabidir.

    *(INT8 kalibrasyonu ve motor oluşturma için benzer Mikro ve Atlas görevleri tanımlanabilir.)*

## 3. Atlas Görevlerinin Önemi

Atlas görevleri, projenin en alt seviyedeki teknik detaylarını netleştirerek aşağıdaki faydaları sağlar:

*   **Açıklık ve Anlaşılırlık:** Her bir temel adımın ne olduğu ve nasıl yapılacağı konusunda belirsizliği ortadan kaldırır.
*   **Teknik Tutarlılık:** Kullanılacak kütüphaneler, modüller ve yaklaşımlar konusunda standartlaşmayı teşvik eder.
*   **Bağımlılık Yönetimi:** Görevler arası bağımlılıkların ve veri akışlarının net bir şekilde görülmesini sağlar.
*   **Lisans Takibi:** Her bir temel bileşenin lisans uyumluluğunun görev bazında teyit edilmesine yardımcı olur.
*   **Yeni Ekip Üyeleri İçin Hızlandırıcı:** Projeye yeni katılan birinin, bir görevin teknik detaylarını hızla anlamasına olanak tanır.
*   **Tahminleme ve Planlama:** Daha küçük ve net tanımlanmış görevler, efor tahminlemesini ve planlamayı kolaylaştırır.

Bu yapı, her AI çalışanın (persona) kendi uzmanlık alanındaki görevleri bu detay seviyesinde planlaması ve belgelemesi için bir temel oluşturacaktır.
