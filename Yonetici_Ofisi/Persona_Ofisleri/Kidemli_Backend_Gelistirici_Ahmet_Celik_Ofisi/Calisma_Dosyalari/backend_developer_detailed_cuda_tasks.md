# Kıdemli Backend Geliştirici (Ahmet Çelik) - Detaylı Görev Kırılımı (CUDA Entegrasyonu)

Bu belge, Kıdemli Backend Geliştirici (Ahmet Çelik) personasının ALT_LAS projesine CUDA entegrasyonu sürecindeki ana görevlerini, kullanıcı tarafından talep edilen hiyerarşik yapıya (Alt Görevler, Makro Görevler, Mikro Görevler ve Atlas Görevleri) göre detaylandırmaktadır.

**Ana Sorumluluk Alanı:** Backend servislerinde CUDA ile hızlandırılabilecek hotspot'ların belirlenmesi, Proof-of-Concept (PoC) çalışmalarının yapılması ve CUDA tabanlı backend modüllerinin geliştirilmesi.

## Alt Görev 1: Backend Servislerinde CUDA ile Hızlandırmaya Uygun Hotspot'ların Belirlenmesi

*   **Açıklama:** `ai-orchestrator` ve `segmentation-service` başta olmak üzere, backend servislerindeki mevcut algoritmalardan ve veri işleme adımlarından CUDA ile hızlandırmaya en uygun (performans kazanımı en yüksek olacak) 2-3 adet adayın (hotspot) belirlenmesi.

### Makro Görev 1.1: `ai-orchestrator` Servisinin Performans Profillemesi ve Hotspot Analizi
    *   **Açıklama:** `ai-orchestrator` servisinin, özellikle model çıkarım ve veri işleme süreçlerinin detaylı performans profillemesinin yapılması ve CUDA ile hızlandırılabilecek darboğazların tespit edilmesi.
    *   **Mikro Görev 1.1.1:** `ai-orchestrator` servisinin mevcut yük altında (tipik kullanım senaryoları) performans metriklerinin toplanması.
        *   **Atlas Görevi AG-BE-PROF-AIORCH-001:**
            *   **Açıklama:** Python `cProfile` veya `Py-Spy` kullanarak `ai-orchestrator` servisinin model çıkarım (`inference`) endpoint'lerinin ve ilgili iç fonksiyonlarının CPU kullanım süreleri ve çağrı sayılarının profillenmesi.
            *   **İlgili Modül:** `ai-orchestrator/app.py` (ve ilgili servis/manager sınıfları), `ai-orchestrator/services/inference_service.py`.
            *   **Kullanılacak Kütüphane/Araç:** `cProfile` (Python stdlib, PSF Lisansı - Uyumlu), `Py-Spy` (MIT Lisansı - Uyumlu).
            *   **Bağımlılıklar/İlişkiler:** Test senaryoları (QA Mühendisi), tipik model ve veri yükleri (Veri Bilimcisi).
            *   **Lisans Uyumluluğu:** Kullanılan araçlar ticari ve kapalı kaynak dağıtıma uygun.
    *   **Mikro Görev 1.1.2:** Profilleme sonuçlarına göre `ai-orchestrator` içinde CUDA ile hızlandırmaya en uygun 1-2 aday fonksiyon/modülün belirlenmesi.
        *   **Atlas Görevi AG-BE-HOTSPOT-AIORCH-001:**
            *   **Açıklama:** Profilleme verilerini analiz ederek, en çok CPU zamanı harcayan ve paralelleştirilmeye uygun olan model çıkarım adımlarının (örn. ön işleme, post işleme, belirli katman hesaplamaları eğer model framework dışında ise) veya veri manipülasyon fonksiyonlarının listelenmesi.
            *   **İlgili Modül/Belge:** Profilleme sonuç raporu, `ai-orchestrator` kaynak kodu.
            *   **Kullanılacak Kütüphane/Araç:** Profilleme analiz araçları (örn. SnakeViz, Pprofui).
            *   **Bağımlılıklar/İlişkiler:** Veri Bilimcisi (model mimarisi bilgisi).
            *   **Lisans Uyumluluğu:** N/A (Analiz süreci).

### Makro Görev 1.2: `segmentation-service` Servisinin Performans Profillemesi ve Hotspot Analizi
    *   **Açıklama:** `segmentation-service` servisinin, özellikle `parallel_processing_optimizer.py` gibi yoğun hesaplama yapan modüllerinin detaylı performans profillemesinin yapılması ve CUDA ile hızlandırılabilecek darboğazların tespit edilmesi.
    *   **Mikro Görev 1.2.1:** `segmentation-service` servisinin `parallel_processing_optimizer.py` modülündeki ana algoritmaların performans metriklerinin toplanması.
        *   **Atlas Görevi AG-BE-PROF-SEGSERV-001:**
            *   **Açıklama:** `parallel_processing_optimizer.py` içindeki döngülerin, veri işleme fonksiyonlarının ve potansiyel paralel hesaplama bölümlerinin `cProfile` veya satır bazlı profiller (line_profiler) ile detaylı profillenmesi.
            *   **İlgili Modül:** `segmentation-service/services/parallel_processing_optimizer.py`.
            *   **Kullanılacak Kütüphane/Araç:** `cProfile` (Python stdlib, PSF Lisansı - Uyumlu), `line_profiler` (BSD Lisansı - Uyumlu).
            *   **Bağımlılıklar/İlişkiler:** Örnek büyük metin veri setleri (Veri Bilimcisi).
            *   **Lisans Uyumluluğu:** Kullanılan araçlar ticari ve kapalı kaynak dağıtıma uygun.
    *   **Mikro Görev 1.2.2:** Profilleme sonuçlarına göre `segmentation-service` içinde CUDA ile hızlandırmaya en uygun 1-2 aday fonksiyon/algoritmanın belirlenmesi.
        *   **Atlas Görevi AG-BE-HOTSPOT-SEGSERV-001:**
            *   **Açıklama:** `parallel_processing_optimizer.py` modülündeki en yoğun hesaplama yapan ve paralelleştirme potansiyeli yüksek olan algoritmik adımların (örn. metin benzerlik hesaplamaları, embedding matris operasyonları) listelenmesi.
            *   **İlgili Modül/Belge:** Profilleme sonuç raporu, `segmentation-service` kaynak kodu.
            *   **Kullanılacak Kütüphane/Araç:** Profilleme analiz araçları.
            *   **Bağımlılıklar/İlişkiler:** Veri Bilimcisi (algoritma detayları).
            *   **Lisans Uyumluluğu:** N/A (Analiz süreci).

## Alt Görev 2: Seçilen Bir Hotspot için Proof-of-Concept (PoC) Planı Hazırlanması ve Uygulanması

*   **Açıklama:** Belirlenen hotspot adaylarından biri için (örneğin, `segmentation-service` içerisindeki `parallel_processing_optimizer.py` modülündeki bir algoritma) bir Ön Çalışma (Proof-of-Concept - PoC) planı hazırlamak ve bu PoC'yi uygulamak.

### Makro Görev 2.1: PoC için Algoritma Seçimi ve Detaylı PoC Planının Oluşturulması
    *   **Açıklama:** Hotspot analizleri sonucunda belirlenen adaylar arasından PoC için en uygun olan bir algoritmanın seçilmesi ve bu algoritmanın CUDA ile implementasyonu için detaylı bir plan hazırlanması.
    *   **Mikro Görev 2.1.1:** PoC için hedef algoritmanın ve kapsamının netleştirilmesi.
        *   **Atlas Görevi AG-BE-POCDEF-001:**
            *   **Açıklama:** `segmentation-service/services/parallel_processing_optimizer.py` içinden, örneğin, büyük bir metin koleksiyonu üzerinde tüm-çiftlere-karşı (all-pairs) kosinüs benzerliği hesaplama algoritmasının PoC hedefi olarak seçilmesi.
            *   **İlgili Modül/Belge:** Hotspot analiz raporu, `parallel_processing_optimizer.py` kaynak kodu.
            *   **Kullanılacak Kütüphane/Araç:** Yok (Karar verme ve tanımlama).
            *   **Bağımlılıklar/İlişkiler:** Veri Bilimcisi (algoritmanın önemi ve karmaşıklığı hakkında girdi).
            *   **Lisans Uyumluluğu:** N/A.
    *   **Mikro Görev 2.1.2:** Seçilen algoritma için CUDA implementasyon stratejisinin (Python CuPy/Numba veya C++ CUDA) belirlenmesi ve PoC planının yazılması.
        *   **Atlas Görevi AG-BE-POCPLAN-001:**
            *   **Açıklama:** Kosinüs benzerliği hesaplaması için CuPy kullanarak bir Python tabanlı CUDA implementasyonu PoC planının hazırlanması. Plan, kullanılacak CuPy fonksiyonlarını, veri transfer stratejilerini (CPU-GPU), beklenen performans metriklerini ve basit bir test senaryosunu içermelidir.
            *   **İlgili Modül/Belge:** PoC Hedef Algoritma Tanımı, `CuPy` dokümantasyonu.
            *   **Kullanılacak Kütüphane/Araç:** `CuPy` (MIT Lisansı - Uyumlu).
            *   **Bağımlılıklar/İlişkiler:** Yazılım Mimarı (mimari uyum), QA Mühendisi (test senaryosu girdisi).
            *   **Lisans Uyumluluğu:** CuPy ticari ve kapalı kaynak dağıtıma uygun.
        *   **(Opsiyonel) Atlas Görevi AG-BE-POCPLAN-002 (Öneri S2.1 ile ilişkili):**
            *   **Açıklama:** Aynı kosinüs benzerliği hesaplaması için C++ ile özel bir CUDA çekirdeği yazma opsiyonunu da içeren (veya ayrı bir PoC olarak planlanan) bir karşılaştırmalı PoC planının hazırlanması.
            *   **İlgili Modül/Belge:** PoC Hedef Algoritma Tanımı, CUDA C++ Programlama Kılavuzu.
            *   **Kullanılacak Kütüphane/Araç:** NVIDIA CUDA Toolkit (NVIDIA EULA - Uyumlu), C++ Derleyicisi (GCC/Clang/MSVC - Uyumlu).
            *   **Bağımlılıklar/İlişkiler:** Yazılım Mimarı, QA Mühendisi.
            *   **Lisans Uyumluluğu:** CUDA Toolkit ve derleyiciler ticari ve kapalı kaynak dağıtıma uygun.

### Makro Görev 2.2: Seçilen Algoritmanın CUDA ile PoC Implementasyonu (CuPy Örneği)
    *   **Açıklama:** AG-BE-POCPLAN-001'de tanımlanan plana göre kosinüs benzerliği algoritmasının CuPy kullanılarak implemente edilmesi.
    *   **Mikro Görev 2.2.1:** Gerekli veri yapılarının (örn. metin embeddingleri) CPU'dan GPU'ya (CuPy array'lerine) transferi için fonksiyonların yazılması.
        *   **Atlas Görevi AG-BE-POCIMPL-DATA-001:**
            *   **Açıklama:** NumPy array'lerini CuPy array'lerine (`cp.asarray()`) dönüştüren ve GPU belleğine transfer eden bir Python fonksiyonunun `segmentation-service/utils/gpu_utils.py` (yeni oluşturulabilir) modülüne eklenmesi.
            *   **İlgili Modül:** `segmentation-service/utils/gpu_utils.py`.
            *   **Kullanılacak Kütüphane/Araç:** `CuPy` (MIT Lisansı - Uyumlu), `NumPy` (BSD Lisansı - Uyumlu).
            *   **Bağımlılıklar/İlişkiler:** Örnek embedding verisi.
            *   **Lisans Uyumluluğu:** CuPy ve NumPy ticari ve kapalı kaynak dağıtıma uygun.
    *   **Mikro Görev 2.2.2:** Kosinüs benzerliği hesaplamasının CuPy fonksiyonları (örn. `cupy.dot`, `cupy.linalg.norm`) kullanılarak GPU üzerinde yapılması.
        *   **Atlas Görevi AG-BE-POCIMPL-CALC-001:**
            *   **Açıklama:** `parallel_processing_optimizer.py` modülüne, embedding matrislerini alıp CuPy kullanarak kosinüs benzerlik matrisini hesaplayan bir fonksiyon (`calculate_similarity_gpu_cupy`) eklenmesi.
            *   **İlgili Modül:** `segmentation-service/services/parallel_processing_optimizer.py`.
            *   **Kullanılacak Kütüphane/Araç:** `CuPy` (MIT Lisansı - Uyumlu).
            *   **Bağımlılıklar/İlişkiler:** AG-BE-POCIMPL-DATA-001'den GPU'ya transfer edilmiş veriler.
            *   **Lisans Uyumluluğu:** CuPy ticari ve kapalı kaynak dağıtıma uygun.
    *   **Mikro Görev 2.2.3:** Sonuçların GPU'dan CPU'ya geri transferi ve mevcut CPU tabanlı implementasyonla sonuçların karşılaştırılması (doğruluk testi).
        *   **Atlas Görevi AG-BE-POCIMPL-VALIDATE-001:**
            *   **Açıklama:** GPU'da hesaplanan benzerlik matrisinin CPU'ya (`cupy.asnumpy()`) geri transfer edilmesi ve NumPy tabanlı orijinal fonksiyonun sonuçlarıyla karşılaştırılarak doğruluğunun (küçük toleranslarla) teyit edilmesi.
            *   **İlgili Modül:** PoC test scripti.
            *   **Kullanılacak Kütüphane/Araç:** `CuPy` (MIT Lisansı - Uyumlu), `NumPy` (BSD Lisansı - Uyumlu), `pytest` (MIT Lisansı - Uyumlu).
            *   **Bağımlılıklar/İlişkiler:** Orijinal CPU implementasyonu.
            *   **Lisans Uyumluluğu:** Kullanılan kütüphaneler ticari ve kapalı kaynak dağıtıma uygun.

### Makro Görev 2.3: PoC Performansının Değerlendirilmesi ve Raporlanması
    *   **Açıklama:** Uygulanan CUDA PoC'sinin performansının CPU tabanlı orijinal implementasyonla karşılaştırılması ve sonuçların raporlanması.
    *   **Mikro Görev 2.3.1:** CPU ve GPU implementasyonlarının farklı veri boyutları için çalışma sürelerinin ölçülmesi.
        *   **Atlas Görevi AG-BE-POCPERF-001:**
            *   **Açıklama:** Farklı sayılarda metin (ve dolayısıyla embedding) içeren veri setleri (örn. 100, 1000, 10000, 100000 metin) için hem CPU hem de GPU (`calculate_similarity_gpu_cupy`) fonksiyonlarının çalışma sürelerinin `timeit` modülü veya benzeri bir yöntemle ölçülüp kaydedilmesi.
            *   **İlgili Modül:** PoC test/benchmark scripti.
            *   **Kullanılacak Kütüphane/Araç:** `timeit` (Python stdlib, PSF Lisansı - Uyumlu), `CuPy`, `NumPy`.
            *   **Bağımlılıklar/İlişkiler:** Çeşitli boyutlarda test verisi.
            *   **Lisans Uyumluluğu:** Kullanılan kütüphaneler ticari ve kapalı kaynak dağıtıma uygun.
    *   **Mikro Görev 2.3.2:** PoC sonuçlarının (performans kazanımları, karşılaşılan zorluklar, öneriler) bir rapor halinde özetlenmesi.
        *   **Atlas Görevi AG-BE-POCREPORT-001:**
            *   **Açıklama:** PoC çalışmasının tüm adımlarını, elde edilen performans karşılaştırma grafiklerini, kod örneklerini, karşılaşılan sorunları ve bu PoC'nin tam entegrasyona geçip geçmemesi yönündeki öneriyi içeren bir Markdown raporunun hazırlanması.
            *   **İlgili Modül/Belge:** PoC Raporu (`poc_cosine_similarity_cupy_report.md`).
            *   **Kullanılacak Kütüphane/Araç:** Markdown editörü.
            *   **Bağımlılıklar/İlişkiler:** Tüm PoC çıktıları.
            *   **Lisans Uyumluluğu:** N/A.

*(Bu detaylandırma, Kıdemli Backend Geliştirici personasının görevlerinin bir başlangıcıdır. Diğer hotspot adayları ve tam entegrasyon adımları için benzer şekilde detaylı görev kırılımları oluşturulacaktır.)*
