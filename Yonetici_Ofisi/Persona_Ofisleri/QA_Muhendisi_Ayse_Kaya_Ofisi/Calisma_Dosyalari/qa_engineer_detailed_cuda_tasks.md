# QA Mühendisi (Ayşe Kaya) - Detaylı Görev Kırılımı (CUDA Entegrasyonu)

Bu belge, QA Mühendisi (Ayşe Kaya) personasının ALT_LAS projesine CUDA entegrasyonu sürecindeki ana görevlerini, kullanıcı tarafından talep edilen hiyerarşik yapıya (Alt Görevler, Makro Görevler, Mikro Görevler ve Atlas Görevleri) göre detaylandırmaktadır.

**Ana Sorumluluk Alanı:** CUDA ile hızlandırılmış bileşenlerin ve tüm sistemin kalitesinin sağlanması, performans testlerinin tasarlanması ve yürütülmesi, CUDA uyumluluk testlerinin yapılması, hata takibi ve raporlaması.

## Alt Görev 1: CUDA Entegrasyonu için Kapsamlı QA Stratejisi ve Test Planının Oluşturulması

*   **Açıklama:** CUDA entegrasyonunun getireceği yeni test gereksinimlerini (fonksiyonel, performans, uyumluluk, regresyon) kapsayan detaylı bir QA stratejisi ve test planı oluşturulması.

### Makro Görev 1.1: CUDA Odaklı Test Senaryolarının Tanımlanması
    *   **Açıklama:** CUDA ile hızlandırılacak her bir fonksiyon/modül için spesifik test senaryolarının (pozitif, negatif, sınır durumları) ve beklenen sonuçların tanımlanması.
    *   **Mikro Görev 1.1.1:** `segmentation-service` için CUDA ile hızlandırılacak kosinüs benzerliği hesaplama fonksiyonu (PoC hedefi) için test senaryolarının yazılması.
        *   **Atlas Görevi AG-QA-TESTCASE-SEGCOSINE-001:**
            *   **Açıklama:** Farklı boyutlarda girdi matrisleri (boş, tek elemanlı, çok büyük), NaN veya sonsuz içeren girdiler, CPU ve GPU sonuçlarının karşılaştırılması gibi durumları içeren test senaryolarının `pytest` formatında tasarlanması.
            *   **İlgili Modül/Belge:** `segmentation-service/tests/gpu/test_cosine_similarity.py` (yeni oluşturulacak), Backend PoC Planı (`AG-BE-POCPLAN-001`).
            *   **Kullanılacak Kütüphane/Araç:** `pytest` (MIT Lisansı - Uyumlu), `NumPy` (BSD Lisansı - Uyumlu), `CuPy` (MIT Lisansı - Uyumlu).
            *   **Bağımlılıklar/İlişkiler:** Kıdemli Backend Geliştirici (fonksiyon arayüzü ve beklenen davranış).
            *   **Lisans Uyumluluğu:** Kullanılan kütüphaneler ticari ve kapalı kaynak dağıtıma uygun.
    *   **Mikro Görev 1.1.2:** `ai-orchestrator` servisinin TensorRT ile optimize edilmiş model çıkarım süreçleri için fonksiyonel test senaryolarının tanımlanması.
        *   **Atlas Görevi AG-QA-TESTCASE-AIORCHTRT-001:**
            *   **Açıklama:** Farklı modeller (TensorFlow, PyTorch, ONNX tabanlı TensorRT motorları) için geçerli/geçersiz girdilerle yapılan çıkarım isteklerinin API seviyesinde test edilmesi. Yanıtların doğruluğu (Veri Bilimcisi ile teyitli) ve API sözleşmesine uygunluğunun (örn. meta veri varlığı) kontrolü.
            *   **İlgili Modül/Belge:** `ai-orchestrator/tests/api/test_inference_trt.py` (yeni oluşturulacak), API Sözleşmeleri, Veri Bilimcisi (model doğruluk kriterleri).
            *   **Kullanılacak Kütüphane/Araç:** `pytest` (MIT Lisansı - Uyumlu), `requests` (Apache 2.0 - Uyumlu).
            *   **Bağımlılıklar/İlişkiler:** Yazılım Mimarı (API sözleşmesi), Veri Bilimcisi (beklenen model çıktıları).
            *   **Lisans Uyumluluğu:** Kullanılan kütüphaneler ticari ve kapalı kaynak dağıtıma uygun.

### Makro Görev 1.2: CUDA Performans Test Planının Oluşturulması (Öneri S5.2 ile ilişkili)
    *   **Açıklama:** CUDA ile hızlandırılmış fonksiyonların ve servislerin performansını (gecikme, iş hacmi, kaynak kullanımı) ölçmek için detaylı bir performans test planı oluşturulması. Bu plan, 95. ve 99. persentil yanıt sürelerini de içermelidir.
    *   **Mikro Görev 1.2.1:** Performans testi yapılacak kritik senaryoların ve metriklerin belirlenmesi.
        *   **Atlas Görevi AG-QA-PERFPLAN-SCENARIOS-001:**
            *   **Açıklama:** `ai-orchestrator` için eş zamanlı çıkarım istekleri, `segmentation-service` için büyük veri setleriyle segmentasyon gibi senaryoların tanımlanması. Ölçülecek metrikler: Ortalama, medyan, 95p, 99p yanıt süreleri, saniyedeki istek sayısı (RPS), GPU kullanımı (%), GPU bellek kullanımı (%).
            *   **İlgili Modül/Belge:** Performans Test Planı Dokümanı, Yazılım Mimarı (kritik akışlar).
            *   **Kullanılacak Kütüphane/Araç:** Yok (Planlama ve tanımlama).
            *   **Bağımlılıklar/İlişkiler:** DevOps Mühendisi (izleme altyapısı), Kıdemli Backend Geliştirici.
            *   **Lisans Uyumluluğu:** N/A.
    *   **Mikro Görev 1.2.2:** Performans testleri için kullanılacak araçların (örn. Locust, k6, JMeter) ve test ortamı gereksinimlerinin belirlenmesi.
        *   **Atlas Görevi AG-QA-PERFPLAN-TOOLS-001:**
            *   **Açıklama:** API tabanlı servisler için `Locust` (MIT Lisansı - Uyumlu) veya `k6` (AGPLv3/Ticari - **AGPLv3 kısmı kapalı kaynak dağıtımda sorunlu, eğer k6 OSS dağıtılacaksa. Sadece test scriptleri yazılıp çalıştırılacaksa ve k6 kendisi dağıtılmıyorsa genellikle sorun olmaz, ama dikkatli olunmalı. Alternatif: Apache JMeter - Apache 2.0**) gibi bir yük testi aracının seçilmesi. Testlerin çalıştırılacağı ortamın (örn. Kubernetes üzerinde ayrı bir namespace, belirli sayıda GPU kaynağı) tanımlanması.
            *   **İlgili Modül/Belge:** Performans Test Planı Dokümanı.
            *   **Kullanılacak Kütüphane/Araç:** Seçilen yük testi aracı.
            *   **Bağımlılıklar/İlişkiler:** DevOps Mühendisi (test ortamı kurulumu).
            *   **Lisans Uyumluluğu:** Locust (MIT) uyumlu. k6 (AGPLv3) dikkatle değerlendirilmeli, JMeter (Apache 2.0) uyumlu.

### Makro Görev 1.3: CUDA Uyumluluk Test Matrisinin Oluşturulması (Öneri S5.1 ile ilişkili)
    *   **Açıklama:** CUDA uygulamalarının farklı NVIDIA GPU mimarilerinde, sürücü versiyonlarında ve işletim sistemlerinde (eğer relevant ise) doğru çalıştığını doğrulamak için bir uyumluluk test matrisi ve planı oluşturulması.
    *   **Mikro Görev 1.3.1:** Desteklenmesi hedeflenen GPU mimarilerinin (örn. Ampere, Turing, Volta) ve sürücü versiyon aralıklarının belirlenmesi.
        *   **Atlas Görevi AG-QA-COMPATMATRIX-GPUS-001:**
            *   **Açıklama:** Yönetici ve DevOps Mühendisi ile koordineli olarak, projenin hedef kitlesi ve mevcut altyapı göz önünde bulundurularak test edilecek GPU mimarileri ve sürücü versiyonlarının listelenmesi.
            *   **İlgili Modül/Belge:** Uyumluluk Test Planı Dokümanı.
            *   **Kullanılacak Kütüphane/Araç:** Yok (Belirleme).
            *   **Bağımlılıklar/İlişkiler:** Yönetici, DevOps Mühendisi.
            *   **Lisans Uyumluluğu:** N/A.
    *   **Mikro Görev 1.3.2:** Uyumluluk testleri için temel bir test setinin (kritik fonksiyonları içeren) tanımlanması ve bu testlerin farklı ortamlarda nasıl çalıştırılacağının planlanması.
        *   **Atlas Görevi AG-QA-COMPATMATRIX-TESTSET-001:**
            *   **Açıklama:** En kritik CUDA fonksiyonlarını (örn. bir model çıkarımı, bir segmentasyon işlemi) içeren küçük bir test setinin seçilmesi. Bu testlerin, DevOps tarafından hazırlanan farklı CUDA sürücülerine sahip Docker imajları veya VM şablonları üzerinde nasıl çalıştırılacağının (manuel veya CI ile otomatize) planlanması.
            *   **İlgili Modül/Belge:** Uyumluluk Test Planı Dokümanı, Temel Test Seti Scriptleri.
            *   **Kullanılacak Kütüphane/Araç:** `pytest`.
            *   **Bağımlılıklar/İlişkiler:** DevOps Mühendisi (test ortamları).
            *   **Lisans Uyumluluğu:** N/A.

## Alt Görev 2: CUDA Entegrasyon Sürecinde Testlerin Yürütülmesi ve Hata Yönetimi

*   **Açıklama:** Geliştirme süreci boyunca fonksiyonel, performans ve uyumluluk testlerinin düzenli olarak yürütülmesi, bulunan hataların takibi, raporlanması ve çözümlerinin doğrulanması.

### Makro Görev 2.1: Fonksiyonel ve Regresyon Testlerinin Otomatize Edilmesi ve Yürütülmesi
    *   **Açıklama:** CUDA ile ilgili birim, entegrasyon ve API testlerinin CI/CD pipeline’ına entegre edilerek her kod değişikliğinde otomatik olarak çalıştırılması ve regresyon hatalarının erken tespiti.
    *   **Mikro Görev 2.1.1:** `pytest` ile yazılmış CUDA birim ve entegrasyon testlerinin CI pipeline’ında (GPU destekli runner üzerinde) çalıştırılmasının sağlanması.
        *   **Atlas Görevi AG-QA-AUTOTEST-CI-001:**
            *   **Açıklama:** DevOps Mühendisi ile işbirliği yaparak, `pytest tests/gpu/` ve `pytest tests/api/` gibi komutların CI script’ine eklenmesi ve test sonuçlarının CI arayüzünde raporlanmasının sağlanması.
            *   **İlgili Modül/Belge:** CI/CD pipeline scripti, Test Raporlama Aracı (örn. Allure, JUnit XML).
            *   **Kullanılacak Kütüphane/Araç:** `pytest`, CI/CD Platformu.
            *   **Bağımlılıklar/İlişkiler:** DevOps Mühendisi (CI konfigürasyonu).
            *   **Lisans Uyumluluğu:** N/A.

### Makro Görev 2.2: Performans Testlerinin Periyodik Olarak Yürütülmesi ve Sonuçların Analizi
    *   **Açıklama:** Belirlenen performans test senaryolarının, önemli geliştirme aşamalarından sonra veya periyodik olarak (örn. haftalık) yürütülmesi, sonuçların analiz edilerek performans regresyonlarının veya iyileşmelerinin takip edilmesi.
    *   **Mikro Görev 2.2.1:** Seçilen yük testi aracı (örn. Locust) ile performans test scriptlerinin yazılması.
        *   **Atlas Görevi AG-QA-PERFTEST-SCRIPTS-001:**
            *   **Açıklama:** AG-QA-PERFPLAN-SCENARIOS-001’de tanımlanan senaryolar için Locustfile (`locustfile.py`) içerisinde test kullanıcı davranışlarının (API istekleri, bekleme süreleri vb.) Python kodu ile tanımlanması.
            *   **İlgili Modül/Belge:** `locustfile.py`, Performans Test Planı.
            *   **Kullanılacak Kütüphane/Araç:** `Locust` (MIT Lisansı - Uyumlu).
            *   **Bağımlılıklar/İlişkiler:** API Sözleşmeleri.
            *   **Lisans Uyumluluğu:** Locust ticari ve kapalı kaynak dağıtıma uygun.
    *   **Mikro Görev 2.2.2:** Performans testlerinin yürütülmesi ve sonuçların (yanıt süreleri, RPS, hata oranları, GPU metrikleri) toplanıp raporlanması.
        *   **Atlas Görevi AG-QA-PERFTEST-EXECUTE-001:**
            *   **Açıklama:** Locust testlerinin belirlenen test ortamında (örn. Kubernetes üzerinde) çalıştırılması. Test sırasında ve sonrasında Locust arayüzünden/raporlarından ve DCGM/Prometheus/Grafana üzerinden performans metriklerinin toplanması ve bir performans test raporunda özetlenmesi.
            *   **İlgili Modül/Belge:** Performans Test Raporu, Locust, Grafana.
            *   **Kullanılacak Kütüphane/Araç:** Locust, Grafana (Lisans durumu dikkate alınmalı).
            *   **Bağımlılıklar/İlişkiler:** DevOps Mühendisi (test ortamı ve izleme).
            *   **Lisans Uyumluluğu:** Grafana OSS (AGPLv3) için dikkat.

### Makro Görev 2.3: Hata Takip ve Yönetim Sürecinin İşletilmesi
    *   **Açıklama:** Testler sırasında bulunan tüm hataların (fonksiyonel, performans, uyumluluk) bir hata takip sistemine (örn. Jira, GitHub Issues) detaylı bir şekilde kaydedilmesi, önceliklendirilmesi, geliştiricilere atanması ve çözümlerinin doğrulanması.
    *   **Mikro Görev 2.3.1:** Bulunan her hata için standart bir hata raporu formatının kullanılması.
        *   **Atlas Görevi AG-QA-BUGREPORT-001:**
            *   **Açıklama:** Hata raporlarının; adımlar, beklenen sonuç, gerçekleşen sonuç, ekran görüntüsü/log dosyası, ortam bilgileri (GPU modeli, sürücü versiyonu, CUDA versiyonu), ciddiyet ve öncelik gibi bilgileri içerecek şekilde standart bir formatta hata takip sistemine girilmesi.
            *   **İlgili Modül/Belge:** Hata Takip Sistemi, Hata Raporu Şablonu.
            *   **Kullanılacak Kütüphane/Araç:** Seçilen Hata Takip Sistemi.
            *   **Bağımlılıklar/İlişkiler:** Tüm geliştirme ekibi.
            *   **Lisans Uyumluluğu:** Hata takip sisteminin lisansına bağlı (örn. Jira ticari, GitHub Issues ücretsiz).

*(Bu detaylandırma, QA Mühendisi personasının görevlerinin bir başlangıcıdır. Diğer Alt Görevler ve Makro/Mikro/Atlas görevleri benzer şekilde detaylandırılacaktır.)*
