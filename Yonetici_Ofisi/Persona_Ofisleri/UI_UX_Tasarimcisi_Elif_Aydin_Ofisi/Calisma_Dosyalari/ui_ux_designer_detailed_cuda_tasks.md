# UI/UX Tasarımcısı (Elif Aydın) - Detaylı Görev Kırılımı (CUDA Entegrasyonu)

Bu belge, UI/UX Tasarımcısı (Elif Aydın) personasının ALT_LAS projesine CUDA entegrasyonu sürecindeki ana görevlerini, kullanıcı tarafından talep edilen hiyerarşik yapıya (Alt Görevler, Makro Görevler, Mikro Görevler ve Atlas Görevleri) göre detaylandırmaktadır.

**Ana Sorumluluk Alanı:** CUDA entegrasyonunun kullanıcı deneyimine (UX) olumlu etkilerini maksimize etmek, performans artışlarını kullanıcı arayüzünde (UI) anlamlı ve sezgisel bir şekilde yansıtmak, AI önerilerinin şeffaflığını ve kullanılabilirliğini artırmak.

## Alt Görev 1: CUDA Performans Artışının Kullanıcı Deneyimine Etkileri için Konsept ve Prototip Geliştirme

*   **Açıklama:** Backend servislerindeki CUDA kaynaklı hızlanmaların kullanıcı tarafından nasıl algılanacağını ve bu algıyı olumlu yönde pekiştirecek UI/UX konseptlerinin geliştirilmesi. Özellikle "anlık" veya "çok hızlı" sonuçlanan işlemler için kullanıcıya geri bildirim mekanizmalarının tasarlanması.

### Makro Görev 1.1: Hızlandırılmış İşlemler için Kullanıcı Geri Bildirim Mekanizmalarının Tasarımı (Öneri S4.2 ile ilişkili)
    *   **Açıklama:** CUDA ile hızlandırılan işlemlerin sonuçları kullanıcıya sunulurken, bu hızın kullanıcı tarafından fark edilmesini ve takdir edilmesini sağlayacak, abartıdan uzak, zarif UI/UX çözümlerinin tasarlanması.
    *   **Mikro Görev 1.1.1:** "Anında Sonuç" veya "Hızlandırılmış İşlem" gibi durumlar için farklı UI gösterge (indicator) konseptlerinin (ikonlar, mikro animasyonlar, metin tabanlı ipuçları) Kıdemli Frontend Geliştirici ile birlikte değerlendirilmesi ve seçilmesi.
        *   **Atlas Görevi AG-UIUX-INDICATOR-CONCEPT-001:**
            *   **Açıklama:** Kıdemli Frontend Geliştiricinin AG-FE-INDICATOR-CONCEPT-001 göreviyle paralel olarak, üretilen görsel gösterge fikirlerinin kullanıcı deneyimi açısından (dikkat dağıtma, anlaşılırlık, estetik) değerlendirilmesi. En uygun 2-3 konseptin seçilerek Figma/Sketch üzerinde detaylı tasarımlarının yapılması.
            *   **İlgili Modül/Belge:** Proje UI Kiti, Marka Kimliği, Frontend Geliştirici (teknik fizibilite).
            *   **Kullanılacak Kütüphane/Araç:** Figma (Ticari), Sketch (Ticari), veya Adobe XD (Ticari) - Tasarım araçları.
            *   **Bağımlılıklar/İlişkiler:** Kıdemli Frontend Geliştirici.
            *   **Lisans Uyumluluğu:** Tasarım araçları ticari lisanslıdır, çıktıları (tasarımlar) projeye aittir.
    *   **Mikro Görev 1.1.2:** Seçilen gösterge konseptleri için yüksek sadakatli (high-fidelity) prototiplerin oluşturulması ve kullanıcı akışları içindeki yerleşimlerinin belirlenmesi.
        *   **Atlas Görevi AG-UIUX-INDICATOR-PROTOTYPE-001:**
            *   **Açıklama:** Figma veya benzeri bir prototipleme aracı kullanarak, hızlandırılmış işlem göstergelerinin farklı arayüz ekranlarında (örn. analiz sonuçları, model çıkarım paneli) nasıl görüneceğine ve kullanıcıyla nasıl etkileşime gireceğine dair interaktif prototiplerin oluşturulması.
            *   **İlgili Modül/Belge:** UI Tasarım Dosyaları, Kullanıcı Akış Diyagramları.
            *   **Kullanılacak Kütüphane/Araç:** Figma, Sketch, veya Adobe XD.
            *   **Bağımlılıklar/İlişkiler:** Kıdemli Frontend Geliştirici (prototipin teknik uygulanabilirliği hakkında geri bildirim).
            *   **Lisans Uyumluluğu:** Tasarım araçları ticari lisanslıdır.

## Alt Görev 2: AI Önerileri için Kullanıcı Deneyimi ve Şeffaflık İyileştirmeleri (Öneri S6.1 ile ilişkili)

*   **Açıklama:** CUDA ile hızlandırılmış AI modellerinden gelen önerilerin (örn. metin segmentasyonu, anomali tespiti) kullanıcıya daha anlaşılır, güvenilir ve eyleme geçirilebilir bir şekilde sunulması için UI/UX iyileştirmelerinin tasarlanması. Özellikle "Neden Bu Öneri?" gibi açıklayıcı mekanizmaların entegrasyonu.

### Makro Görev 2.1: "Neden Bu Öneri?" (Explainable AI - XAI) Arayüz Komponentlerinin Tasarımı
    *   **Açıklama:** AI tarafından üretilen önerilerin arkasındaki temel mantığı veya en etkili faktörleri kullanıcıya basit ve anlaşılır bir dille sunacak arayüz bileşenlerinin tasarlanması.
    *   **Mikro Görev 2.1.1:** Farklı AI öneri tipleri için (örn. kategori tahmini, skor bazlı sıralama) uygun açıklama formatlarının (örn. en önemli özellikler listesi, basit bir kural özeti, güven skoru görselleştirmesi) Veri Bilimcisi ile birlikte belirlenmesi.
        *   **Atlas Görevi AG-UIUX-XAI-FORMATS-001:**
            *   **Açıklama:** Veri Bilimcisi ile bir çalıştay yaparak, farklı AI modellerinin ürettiği sonuçların nasıl daha şeffaf hale getirilebileceği üzerine fikir üretilmesi. Kullanıcının anlayabileceği, teknik olmayan açıklama formatlarının ve görselleştirme yöntemlerinin (örn. basit bar grafikler, vurgulamalar) taslaklarının oluşturulması.
            *   **İlgili Modül/Belge:** Veri Bilimcisi (model çıktıları ve açıklanabilirlik yetenekleri), Kullanıcı Personaları.
            *   **Kullanılacak Kütüphane/Araç:** Figma/Sketch, Beyaz Tahta.
            *   **Bağımlılıklar/İlişkiler:** Veri Bilimcisi.
            *   **Lisans Uyumluluğu:** Tasarım araçları ticari lisanslıdır.
    *   **Mikro Görev 2.1.2:** Seçilen açıklama formatları için UI mockuplarının ve prototiplerinin oluşturulması. Bu açıklamaların öneri arayüzlerine nasıl entegre edileceğinin (örn. bir tooltip, açılır bir panel, ayrı bir detay sayfası) tasarlanması.
        *   **Atlas Görevi AG-UIUX-XAI-MOCKUPS-001:**
            *   **Açıklama:** Figma veya benzeri bir araçta, AI önerilerinin yanında veya detayında "Neden?" ikonuna tıklandığında açılacak açıklama panellerinin veya tooltip’lerinin detaylı UI tasarımlarının ve interaktif prototiplerinin oluşturulması.
            *   **İlgili Modül/Belge:** UI Tasarım Dosyaları, AI Öneri Arayüzleri.
            *   **Kullanılacak Kütüphane/Araç:** Figma, Sketch, veya Adobe XD.
            *   **Bağımlılıklar/İlişkiler:** Kıdemli Frontend Geliştirici (teknik implementasyon fizibilitesi).
            *   **Lisans Uyumluluğu:** Tasarım araçları ticari lisanslıdır.

## Alt Görev 3: Büyük Veri Setlerinin Etkileşimli ve Performanslı Görselleştirilmesi için UI/UX Tasarımı (Öneri S6.2 ile ilişkili)

*   **Açıklama:** CUDA ile işlenmiş veya analiz edilmiş büyük veri setlerinin (örn. binlerce metin, milyonlarca veri noktası) kullanıcı arayüzünde takılmadan, akıcı bir şekilde ve anlamlı içgörüler sunacak biçimde görselleştirilmesi için UI/UX stratejilerinin ve tasarımlarının geliştirilmesi. Dinamik filtreleme, sıralama ve detay seviyesi (level-of-detail) gibi tekniklerin kullanılması.

### Makro Görev 3.1: Dinamik Filtreleme ve Sıralama Arayüzlerinin Tasarımı
    *   **Açıklama:** Kullanıcıların büyük veri setlerini kendi ihtiyaçlarına göre anlık olarak filtreleyebileceği, sıralayabileceği ve gruplayabileceği sezgisel ve performanslı arayüz kontrollerinin tasarlanması.
    *   **Mikro Görev 3.1.1:** Büyük veri tabloları veya listeleri için gelişmiş filtreleme seçeneklerinin (örn. çoklu kriter, aralık seçimi, metin araması) ve sıralama kontrollerinin UI tasarımlarının yapılması.
        *   **Atlas Görevi AG-UIUX-BIGDATA-FILTER-001:**
            *   **Açıklama:** Karmaşık veri tabloları için, her sütuna özel filtreleme seçenekleri (örn. kategorik seçim, sayısal aralık kaydırıcısı), genel bir arama çubuğu ve çoklu sütuna göre sıralama imkanı sunan bir UI panelinin Figma’da detaylı olarak tasarlanması.
            *   **İlgili Modül/Belge:** UI Tasarım Dosyaları, Veri Modelleri (Veri Bilimcisi).
            *   **Kullanılacak Kütüphane/Araç:** Figma.
            *   **Bağımlılıklar/İlişkiler:** Kıdemli Frontend Geliştirici (bu filtrelerin backend API’leri veya frontend kütüphaneleri ile nasıl destekleneceği), Veri Bilimcisi.
            *   **Lisans Uyumluluğu:** Figma ticari lisanslıdır.

### Makro Görev 3.2: Detay Seviyesi (Level-of-Detail - LOD) ve Aşamalı Yükleme (Progressive Loading) Stratejilerinin UX Tasarımı
    *   **Açıklama:** Çok büyük veri setlerinin ilk yüklemede kullanıcıyı bekletmemesi ve arayüzün donmaması için aşamalı yükleme (lazy loading, infinite scrolling) ve farklı zoom seviyelerinde farklı detayların gösterilmesi (LOD) gibi UX stratejilerinin tasarlanması.
    *   **Mikro Görev 3.2.1:** Büyük bir harita veya ağ grafiği görselleştirmesi için LOD prensiplerine dayalı bir UX akışının tasarlanması.
        *   **Atlas Görevi AG-UIUX-BIGDATA-LOD-001:**
            *   **Açıklama:** Kullanıcı haritayı/grafiği uzaklaştırdığında (zoom out) sadece ana kümelerin veya özet bilgilerin gösterilmesi, yakınlaştırdığında (zoom in) ise daha detaylı düğümlerin, bağlantıların ve etiketlerin aşamalı olarak yüklenerek gösterileceği bir kullanıcı deneyimi akışının ve arayüz geçişlerinin Figma’da prototiplenmesi.
            *   **İlgili Modül/Belge:** UI Tasarım Dosyaları, Veri Görselleştirme Gereksinimleri.
            *   **Kullanılacak Kütüphane/Araç:** Figma.
            *   **Bağımlılıklar/İlişkiler:** Kıdemli Frontend Geliştirici (teknik implementasyon), Veri Bilimcisi (veri yapısı ve özetleme stratejileri).
            *   **Lisans Uyumluluğu:** Figma ticari lisanslıdır.

*(Bu detaylandırma, UI/UX Tasarımcısı personasının görevlerinin bir başlangıcıdır. Kullanılabilirlik testleri, A/B test tasarımları gibi diğer Alt Görevler ve Makro/Mikro/Atlas görevleri benzer şekilde detaylandırılacaktır.)*
