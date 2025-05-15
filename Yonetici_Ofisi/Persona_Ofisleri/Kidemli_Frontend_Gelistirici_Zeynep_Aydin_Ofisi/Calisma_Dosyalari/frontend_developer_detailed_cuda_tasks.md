# Kıdemli Frontend Geliştirici (Zeynep Aydın) - Detaylı Görev Kırılımı (CUDA Entegrasyonu)

Bu belge, Kıdemli Frontend Geliştirici (Zeynep Aydın) personasının ALT_LAS projesine CUDA entegrasyonu sürecindeki ana görevlerini, kullanıcı tarafından talep edilen hiyerarşik yapıya (Alt Görevler, Makro Görevler, Mikro Görevler ve Atlas Görevleri) göre detaylandırmaktadır.

**Ana Sorumluluk Alanı:** CUDA entegrasyonunun kullanıcı arayüzüne (UI) etkilerinin değerlendirilmesi, performans kazanımlarının kullanıcı deneyimine (UX) yansıtılması, WebGPU gibi istemci taraflı GPU hızlandırma teknolojilerinin fizibilitesinin araştırılması ve UI'da CUDA ile ilgili bilgilendirmelerin yapılması.

## Alt Görev 1: CUDA Entegrasyonunun Mevcut Frontend Performansına ve Kullanıcı Deneyimine Etkilerinin Analizi

*   **Açıklama:** Backend servislerinde yapılacak CUDA hızlandırmalarının, frontend tarafında nasıl bir performans artışı (örn. daha hızlı yanıt süreleri, daha akıcı veri görselleştirmeleri) sağlayacağının ve bunun kullanıcı deneyimini nasıl iyileştireceğinin analiz edilmesi.

### Makro Görev 1.1: Backend Yanıt Sürelerindeki İyileşmelerin Frontend'e Yansımasının Değerlendirilmesi
    *   **Açıklama:** `ai-orchestrator` ve `segmentation-service` gibi servislerden gelen yanıt sürelerindeki potansiyel düşüşlerin, frontend'deki ilgili bileşenlerin yüklenme ve etkileşim hızlarına nasıl yansıyacağının teorik ve pratik olarak değerlendirilmesi.
    *   **Mikro Görev 1.1.1:** Mevcut durumda, GPU hızlandırması olmayan backend servisleriyle etkileşimde bulunan kritik frontend bileşenlerinin (örn. analiz sonuçları tablosu, büyük veri listeleri, model çıkarım sonuçlarını gösteren arayüzler) performansının ölçülmesi (baseline).
        *   **Atlas Görevi AG-FE-PERFANALYSIS-001:**
            *   **Açıklama:** Tarayıcı geliştirici araçları (Network tab, Performance tab) kullanılarak, belirli kullanıcı senaryolarında (örn. büyük bir analiz isteği gönderme ve sonuçları görüntüleme) backend API çağrılarının yanıt sürelerinin ve bu yanıtlara bağlı UI güncellemelerinin ne kadar sürdüğünün kaydedilmesi.
            *   **İlgili Modül/Belge:** Frontend uygulama kaynak kodu (ilgili React/Vue/Angular bileşenleri), API sözleşmeleri.
            *   **Kullanılacak Kütüphane/Araç:** Tarayıcı Geliştirici Araçları (Chrome DevTools, Firefox Developer Tools).
            *   **Bağımlılıklar/İlişkiler:** Mevcut backend servislerinin durumu, QA Mühendisi (test senaryoları).
            *   **Lisans Uyumluluğu:** N/A (Araçlar için).
    *   **Mikro Görev 1.1.2:** Backend ekibinden (Kıdemli Backend Geliştirici, Veri Bilimcisi) CUDA ile beklenen performans kazanımları hakkında bilgi alınması ve bu kazanımların frontend'e olası etkilerinin (örn. %X daha hızlı yükleme) tahmin edilmesi.
        *   **Atlas Görevi AG-FE-PERFESTIMATE-001:**
            *   **Açıklama:** Backend ekibi tarafından yapılan PoC ve analiz sonuçlarına (örn. `poc_cosine_similarity_cupy_report.md`) dayanarak, API yanıt sürelerindeki beklenen iyileşme oranlarının (örn. ortalama ve 99. persentil) not edilmesi ve bu iyileşmelerin frontend tarafındaki kullanıcıya yansıyan gecikmeleri ne kadar azaltacağının hesaplanması.
            *   **İlgili Modül/Belge:** Backend PoC raporları, API sözleşmeleri.
            *   **Kullanılacak Kütüphane/Araç:** Yok (Analiz ve hesaplama).
            *   **Bağımlılıklar/İlişkiler:** Kıdemli Backend Geliştirici, Veri Bilimcisi.
            *   **Lisans Uyumluluğu:** N/A.

## Alt Görev 2: CUDA Performans Kazanımlarını Kullanıcı Arayüzünde Vurgulama Stratejilerinin Geliştirilmesi (Öneri S4.2 ile ilişkili)

*   **Açıklama:** Backend'de CUDA ile elde edilen performans artışının kullanıcıya fark ettirilmesi ve kullanıcı deneyimini olumlu yönde pekiştirmesi için arayüzde görsel göstergeler veya bilgilendirmeler kullanılması.

### Makro Görev 2.1: "Hızlandırılmış Sonuç" veya Benzeri Bir Görsel Gösterge Tasarımı ve Prototiplemesi
    *   **Açıklama:** CUDA ile işlenmiş ve hızlı gelen sonuçlar için UI'da kullanıcıya bu durumu belirten (örn. bir ikon, bir etiket, bir animasyon) ince ve bilgilendirici bir görsel gösterge tasarlanması ve prototipinin oluşturulması.
    *   **Mikro Görev 2.1.1:** Farklı görsel gösterge konseptlerinin (örn. "CUDA Hızlandırıldı", "Anında Sonuç", küçük bir roket ikonu vb.) UI/UX Tasarımcısı ile birlikte beyin fırtınası yapılarak belirlenmesi.
        *   **Atlas Görevi AG-FE-INDICATOR-CONCEPT-001:**
            *   **Açıklama:** UI/UX Tasarımcısı ile bir çalıştay düzenlenerek, kullanıcıyı yormayacak, bilgilendirici ve markayla uyumlu potansiyel görsel gösterge fikirlerinin üretilmesi ve eskizlerinin çizilmesi.
            *   **İlgili Modül/Belge:** UI/UX Tasarım Kılavuzu, Proje Marka Kimliği.
            *   **Kullanılacak Kütüphane/Araç:** Beyaz tahta, eskiz araçları, Figma/Sketch (tasarım araçları).
            *   **Bağımlılıklar/İlişkiler:** UI/UX Tasarımcısı.
            *   **Lisans Uyumluluğu:** Tasarım araçlarının lisansları (genellikle ticari veya abonelik bazlı).
    *   **Mikro Görev 2.1.2:** Seçilen bir veya iki gösterge konsepti için frontend'de (örn. React/Vue/Angular bileşeni olarak) basit bir prototip geliştirilmesi.
        *   **Atlas Görevi AG-FE-INDICATOR-PROTOTYPE-001:**
            *   **Açıklama:** Belirlenen bir gösterge (örn. API yanıtında özel bir header veya alan ile tetiklenecek bir "Hızlı İşlem" ikonu) için bir React bileşeni oluşturulması. Bu bileşen, API yanıtına göre dinamik olarak görünüp kaybolmalıdır.
            *   **İlgili Modül:** Frontend uygulaması içinde yeni bir UI bileşeni (örn. `components/PerformanceIndicator.jsx`).
            *   **Kullanılacak Kütüphane/Araç:** `React` (MIT Lisansı - Uyumlu), CSS/Styled Components.
            *   **Bağımlılıklar/İlişkiler:** API yanıt yapısı (Backend Geliştirici, Yazılım Mimarı), UI/UX Tasarımcısı (görsel tasarım).
            *   **Lisans Uyumluluğu:** React ve ilişkili yaygın kütüphaneler ticari ve kapalı kaynak dağıtıma uygun.

## Alt Görev 3: WebGPU ile İstemci Taraflı GPU Hızlandırma Fizibilitesinin Araştırılması (Öneri S4.1 ile ilişkili)

*   **Açıklama:** Belirli frontend görevleri (örn. karmaşık veri görselleştirmeleri, bazı istemci taraflı ön/son işlemeler) için WebGPU standardının kullanılarak istemci tarafında GPU hızlandırması yapılmasının fizibilitesinin araştırılması ve bir PoC yapılması.

### Makro Görev 3.1: WebGPU için Potansiyel Kullanım Alanlarının Belirlenmesi
    *   **Açıklama:** Mevcut frontend uygulamasında WebGPU ile hızlandırılabilecek, hesaplama yoğun veya büyük veri setleriyle çalışan bileşenlerin (örn. 3D grafikler, büyük veri tablolarının anlık filtrelenmesi/render edilmesi, istemci taraflı ML çıkarımları) belirlenmesi.
    *   **Mikro Görev 3.1.1:** Projedeki mevcut veri görselleştirme bileşenlerinin (örn. karmaşık grafikler, haritalar) WebGPU ile potansiyel olarak nasıl iyileştirilebileceğinin analizi.
        *   **Atlas Görevi AG-FE-WEBGPU-USECASE-VIS-001:**
            *   **Açıklama:** Mevcut bir D3.js veya benzeri bir kütüphane ile yapılmış karmaşık bir veri görselleştirme bileşeninin performans darboğazlarının incelenmesi ve WebGPU ile bu darboğazların (örn. binlerce DOM elemanı yerine tek bir canvas üzerinde GPU ile render) nasıl aşılabileceğinin teorik olarak değerlendirilmesi.
            *   **İlgili Modül/Belge:** İlgili frontend görselleştirme bileşeninin kaynak kodu.
            *   **Kullanılacak Kütüphane/Araç:** Tarayıcı Performans Profiler.
            *   **Bağımlılıklar/İlişkiler:** UI/UX Tasarımcısı (görselleştirme gereksinimleri).
            *   **Lisans Uyumluluğu:** N/A.

### Makro Görev 3.2: Seçilen Bir Kullanım Alanı için WebGPU ile PoC Geliştirilmesi
    *   **Açıklama:** Belirlenen bir kullanım alanı için (örn. basit bir 2D/3D veri görselleştirmesi veya bir matris çarpımı gibi hesaplama görevi) WebGPU kullanarak bir PoC prototipi geliştirilmesi.
    *   **Mikro Görev 3.2.1:** WebGPU temellerinin (Device, Adapter, Shader, Pipeline, Buffer, Command Encoder) öğrenilmesi ve basit bir WebGPU "Merhaba Dünya" (örn. ekrana bir üçgen çizme) uygulamasının yapılması.
        *   **Atlas Görevi AG-FE-WEBGPU-POC-HELLO-001:**
            *   **Açıklama:** WebGPU API'sini kullanarak temel bir render pipeline oluşturulması, basit bir vertex ve fragment shader (WGSL dilinde) yazılması ve bir canvas üzerine renkli bir üçgen çizdirilmesi.
            *   **İlgili Modül/Belge:** `webgpu-poc/hello_triangle.html` (yeni oluşturulacak PoC projesi).
            *   **Kullanılacak Kütüphane/Araç:** Tarayıcı (WebGPU destekli - Chrome, Edge, Firefox Nightly), Text Editör.
            *   **Bağımlılıklar/İlişkiler:** WebGPU API dokümantasyonu (örn. MDN, web.dev).
            *   **Lisans Uyumluluğu:** N/A (Web standardı ve tarayıcı özelliği).
    *   **Mikro Görev 3.2.2:** PoC hedefi olarak belirlenen basit bir hesaplama görevinin (örn. iki büyük matrisin çarpımı) WebGPU compute shader kullanarak implemente edilmesi.
        *   **Atlas Görevi AG-FE-WEBGPU-POC-COMPUTE-001:**
            *   **Açıklama:** İki matrisi girdi olarak alan, bunları GPU belleğine (buffer) yükleyen, WGSL ile yazılmış bir compute shader ile çarpan ve sonucu CPU'ya geri okuyan bir WebGPU uygulaması geliştirilmesi. JavaScript ile yapılan aynı hesaplamayla performansının karşılaştırılması.
            *   **İlgili Modül/Belge:** `webgpu-poc/matrix_multiply.html`.
            *   **Kullanılacak Kütüphane/Araç:** Tarayıcı, Text Editör.
            *   **Bağımlılıklar/İlişkiler:** WebGPU API dokümantasyonu.
            *   **Lisans Uyumluluğu:** N/A.
    *   **Mikro Görev 3.2.3:** WebGPU PoC sonuçlarının (geliştirme deneyimi, performans, tarayıcı uyumluluğu, zorluklar) raporlanması.
        *   **Atlas Görevi AG-FE-WEBGPU-POC-REPORT-001:**
            *   **Açıklama:** WebGPU PoC çalışmasının bulgularını, potansiyel faydalarını, karşılaşılan zorlukları (örn. API karmaşıklığı, debug imkanları) ve projenin geleceğinde WebGPU kullanımına dair önerileri içeren bir rapor hazırlanması.
            *   **İlgili Modül/Belge:** `webgpu_poc_report.md`.
            *   **Kullanılacak Kütüphane/Araç:** Markdown editörü.
            *   **Bağımlılıklar/İlişkiler:** PoC kodları ve performans ölçümleri.
            *   **Lisans Uyumluluğu:** N/A.

*(Bu detaylandırma, Kıdemli Frontend Geliştirici personasının görevlerinin bir başlangıcıdır. Diğer Alt Görevler ve Makro/Mikro/Atlas görevleri benzer şekilde detaylandırılacaktır.)*
