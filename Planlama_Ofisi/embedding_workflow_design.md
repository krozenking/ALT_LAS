# Embedding Tabanlı Dokümantasyon İyileştirme: Tasarım Belgesi

Bu belge, ALT_LAS projesi dokümantasyonunun yapay zeka (AI) tarafından daha etkin kullanılabilmesi için embedding tabanlı özelliklerin tasarımını ve iş akışını detaylandırmaktadır. İlk aşamada Anlamsal Arama, Hibrit Arama ve Görevler için Bağlamsal Bilgi Sağlama özelliklerine odaklanılacaktır.

## 1. Hedeflenen Özellikler (İlk Aşama)

1.  **Anlamsal Arama (Semantic Search):** Kullanıcıların veya AI personalarının doğal dil sorgularıyla dokümantasyon içinde anlamsal olarak en alakalı bölümleri bulmalarını sağlar.
2.  **Hibrit Arama (Hybrid Search):** Anlamsal aramanın gücünü, anahtar kelime tabanlı aramanın kesinliği ile birleştirir.
3.  **Görevler için Bağlamsal Bilgi Sağlama (Contextual Task Assistance):** Bir AI personasına görev atandığında, görev tanımıyla ilgili en alakalı dokümantasyon bölümlerini otomatik olarak önerir.

## 2. Hedef Dokümanlar

İlk aşamada aşağıdaki dokümanlar embedding işlemine tabi tutulacaktır:

*   **Yönetici Ofisi ve Planlama Dokümanları:**
    *   `/home/ubuntu/ALT_LAS_Organized/Planlama_Ofisi/ana_gorev_panosu.md`
    *   `/home/ubuntu/ALT_LAS_Organized/Planlama_Ofisi/hierarchical_task_structure_definition.md`
    *   `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Genel_Belgeler/YONETICI_OFISI_KULLANIM_KILAVUZU.md`
    *   `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Genel_Belgeler/standart_gorev_atama_sablonu.md`
    *   `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/ofis_durumu.md`
*   **Persona Görev Tanımları:**
    *   `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/Yazilim_Mimari_Elif_Yilmaz_Ofisi/Calisma_Dosyalari/architect_detailed_cuda_tasks.md`
    *   `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/Kidemli_Backend_Gelistirici_Ahmet_Celik_Ofisi/Calisma_Dosyalari/backend_developer_detailed_cuda_tasks.md`
    *   `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/DevOps_Muhendisi_Can_Tekin_Ofisi/Calisma_Dosyalari/devops_engineer_detailed_cuda_tasks.md`
    *   `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/Kidemli_Frontend_Gelistirici_Zeynep_Aydin_Ofisi/Calisma_Dosyalari/frontend_developer_detailed_cuda_tasks.md`
    *   `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/QA_Muhendisi_Ayse_Kaya_Ofisi/Calisma_Dosyalari/qa_engineer_detailed_cuda_tasks.md`
    *   `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/UI_UX_Tasarimcisi_Elif_Aydin_Ofisi/Calisma_Dosyalari/ui_ux_designer_detailed_cuda_tasks.md`
    *   `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/Veri_Bilimcisi_Dr_Elif_Demir_Ofisi/Calisma_Dosyalari/data_scientist_detailed_cuda_tasks.md`
    *   `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/Proje_Yoneticisi_Ofisi/Calisma_Dosyalari/project_manager_detailed_cuda_tasks.md`
*   **Lisans Analizleri:**
    *   `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Genel_Belgeler/license_analysis_summary.md`
    *   `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Genel_Belgeler/license_recommendations_and_alternatives.md`
*   **Proje Kodu Dokümantasyonu (Örnek):**
    *   Proje yapısı ve AI görevleriyle doğrudan ilgili kritik README dosyaları veya teknik açıklamalar (örneğin, `/home/ubuntu/ALT_LAS_Organized/Proje_Kodu/segmentation-service/README.md` gibi, eğer varsa ve AI için önemliyse).

## 3. Embedding İş Akışı

1.  **Doküman Ön İşleme (Document Preprocessing):**
    *   **Bölütleme (Chunking):** Markdown dosyaları mantıksal bölümlere ayrılacaktır. Öncelikli olarak başlıklar (H1, H2, H3 vb.) ve paragraflar temelinde bölütleme yapılacaktır. Atlas Görevleri gibi yapılandırılmış listelerdeki her bir madde ayrı bir bölüt olarak değerlendirilebilir.
    *   **Temizleme:** Gereksiz Markdown sözdizimi karakterleri (embedding kalitesini düşürebilecek) minimuma indirilecek, ancak metnin okunabilirliği ve yapısı korunacaktır.

2.  **Embedding Modeli Seçimi:**
    *   Dokümanların dili (Türkçe ve potansiyel İngilizce) göz önüne alındığında, çok dilli bir model veya özellikle Türkçe için eğitilmiş bir model tercih edilecektir. `sentence-transformers` kütüphanesinden `paraphrase-multilingual-MiniLM-L12-v2` veya benzeri bir model başlangıç için uygun olabilir. Gerekirse, daha spesifik Türkçe modeller (örn: `dbmdz/bert-base-turkish-cased` tabanlı bir sentence transformer) araştırılacaktır.
    *   Modelin kurulumu ve Python ortamına entegrasyonu sağlanacaktır (`pip3 install sentence-transformers`).

3.  **Embedding Üretimi (Embedding Generation):**
    *   Python scripti kullanılarak hedeflenen dokümanlar okunacak, ön işleme adımlarından geçirilecek ve seçilen model ile her bir bölütün embedding vektörü üretilecektir.
    *   Her embedding vektörü ile birlikte, kaynağı (dosya yolu, bölüm başlığı/numarası) ve orijinal metin gibi meta veriler saklanacaktır.

4.  **Vektör Depolama ve İndeksleme (Vector Storage & Indexing):**
    *   **İlk Aşama (PoC):** Basitlik ve hız için `FAISS (Facebook AI Similarity Search)` kütüphanesi kullanılacaktır. Üretilen embeddingler bir FAISS indeksine eklenecektir. Meta veriler ayrı bir yapıda (örn: Python dictionary veya JSON dosyası) indeksle eşleştirilerek saklanacaktır.
    *   **Kurulum:** `pip3 install faiss-cpu` (veya GPU destekli versiyonu eğer ortam uygunsa).
    *   Saklanacak dosyalar: `embeddings.index` (FAISS indeksi) ve `metadata.json` (vektörlere karşılık gelen doküman bilgileri).

## 4. Özelliklerin Geliştirilmesi

1.  **Anlamsal Arama Arayüzü (Python Fonksiyonu/Scripti):**
    *   Girdi: Kullanıcı sorgusu (doğal dil metni).
    *   İşlem:
        1.  Sorgunun embedding vektörünü üret.
        2.  FAISS indeksinde bu vektöre en yakın K adet embedding vektörünü bul (kosinüs benzerliği ile).
        3.  Bulunan vektörlere karşılık gelen meta verilerden orijinal metin bölümlerini ve kaynaklarını al.
    *   Çıktı: En alakalı doküman bölümlerinin listesi (kaynak bilgisi ile birlikte).

2.  **Hibrit Arama Mantığı:**
    *   Anlamsal arama sonuçları ile birlikte, sorgudaki anahtar kelimeleri içeren doküman bölümlerini de getirecek basit bir anahtar kelime eşleştirme mekanizması eklenecektir.
    *   İki sonuç kümesi birleştirilip (örneğin, önce anahtar kelime eşleşmeleri, sonra anlamsal benzerlikler veya birleşik bir skorlama ile) kullanıcıya sunulacaktır.

3.  **Görevler için Bağlamsal Bilgi Sağlama:**
    *   Girdi: Bir görev tanımı (örn: `standart_gorev_atama_sablonu.md` içeriğinden "Görev Açıklaması ve Kapsamı" bölümü veya `ana_gorev_panosu.md`'den görev adı).
    *   İşlem: Görev tanımının embedding vektörü üretilir ve anlamsal arama mekanizması kullanılarak dokümantasyon içinde en alakalı bölümler bulunur.
    *   Çıktı: AI personasına, göreviyle ilgili olabilecek doküman bölümlerinin bir listesi öneri olarak sunulur.

## 5. Geliştirme Ortamı ve Kütüphaneler

*   **Dil:** Python 3.11
*   **Temel Kütüphaneler:**
    *   `sentence-transformers` (Embedding üretimi için)
    *   `faiss-cpu` (Vektör indeksleme ve arama için)
    *   `numpy` (Vektör işlemleri için)
    *   `markdown` veya `beautifulsoup4` (Markdown ayrıştırma için, isteğe bağlı)

## 6. Kaydedilecek Dosyalar (Örnek)

*   `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/AI_Yardimcilari/Dokuman_Embeddings/`:
    *   `embeddings.index` (FAISS indeksi)
    *   `metadata.json` (Embedding meta verileri)
    *   `generate_embeddings.py` (Embedding üretme scripti)
    *   `semantic_search.py` (Arama ve bağlamsal yardım fonksiyonlarını içeren script)

Bu tasarım, embedding tabanlı dokümantasyon özelliklerinin ilk aşamasını hayata geçirmek için bir yol haritası sunmaktadır. Uygulama sırasında detaylar daha da netleşecektir.

