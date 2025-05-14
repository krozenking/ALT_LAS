# AI Doküman Asistanı Kullanım Kılavuzu

Bu kılavuz, ALT_LAS projesi dokümantasyonu içinde AI personalarının bilgiye daha hızlı ve etkin bir şekilde erişmesini sağlamak amacıyla geliştirilen embedding tabanlı doküman yardımcısı özelliklerinin nasıl kullanılacağını açıklar.

## 1. Giriş

Proje dokümantasyonu büyüdükçe, AI personalarının ihtiyaç duydukları spesifik bilgilere ulaşması zorlaşabilir. Bu doküman asistanı, anlamsal arama ve bağlamsal yardım yetenekleri sunarak bu süreci kolaylaştırmayı hedefler. AI personaları (veya onlara yardımcı olan Manus gibi sistemler), bu araçları kullanarak dokümanları daha verimli bir şekilde "okuyabilir" ve görevleriyle ilgili bilgilere hızla erişebilir.

## 2. Temel Bileşenler ve Konumları

Bu sistemin ana bileşenleri `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/AI_Yardimcilari/Dokuman_Embeddings/` klasöründe bulunur:

*   **`generate_embeddings.py`**: Bu script, hedef dokümanları işleyerek anlamsal embedding vektörleri üretir ve bunları bir FAISS indeksine (`embeddings.index`) kaydeder. Ayrıca, her embedding için kaynak dosya, metin içeriği gibi bilgileri içeren bir meta veri dosyası (`metadata.json`) oluşturur. **Bu script, dokümanlarda önemli değişiklikler yapıldığında veya yeni dokümanlar eklendiğinde yeniden çalıştırılmalıdır.**
*   **`semantic_search.py`**: Bu script, yukarıda bahsedilen indeks ve meta verileri kullanarak çeşitli arama ve yardım fonksiyonları sunar. AI personalarının veya Manus'un etkileşimde bulunacağı ana script budur.
*   `embeddings.index`: Doküman bölümlerine ait embedding vektörlerini içeren FAISS indeks dosyası.
*   `metadata.json`: Her bir embedding vektörüne karşılık gelen kaynak dosya, bölüm indeksi ve orijinal metin gibi bilgileri içeren meta veri dosyası.

## 3. Özellikler ve Kullanım Şekilleri

`semantic_search.py` scripti aşağıdaki ana fonksiyonları içerir:

### 3.1. Anlamsal Arama (`semantic_search`)

*   **Amaç:** Belirli bir metin sorgusu için dokümanlar içinde anahtar kelime eşleşmesinin ötesinde, kavramsal ve anlamsal olarak en alakalı metin bölümlerini bulur.
*   **Nasıl Kullanılır:** Fonksiyona doğal dilde bir sorgu metni verilir.
*   **Örnek (Python içinde):**
    ```python
    from semantic_search import semantic_search
    query = "Yönetici Ofisi görevleri nasıl takip edilir?"
    results = semantic_search(query)
    for res in results:
        print(f"Skor: {res['score']:.4f}, Kaynak: {res['source_file']}")
        print(f"Metin: {res['text'][:200]}...")
    ```
*   **Çıktı:** Sorguyla en alakalı bulunan doküman bölümlerinin bir listesi. Her sonuç; bir benzerlik skoru (daha yüksek daha iyi), kaynak dosya yolu, bölüm indeksi ve metin içeriğini içerir.

### 3.2. Anahtar Kelime Araması (`keyword_search`)

*   **Amaç:** Sorgudaki anahtar kelimelerle tam olarak eşleşen metin bölümlerini bulur.
*   **Nasıl Kullanılır:** Fonksiyona aranacak anahtar kelimeler verilir.
*   **Örnek (Python içinde):**
    ```python
    from semantic_search import keyword_search
    query = "ana görev panosu öncelik"
    results = keyword_search(query)
    for res in results:
        print(f"Skor: {res['score']}, Kaynak: {res['source_file']}")
        print(f"Metin: {res['text'][:200]}...")
    ```
*   **Çıktı:** Eşleşen anahtar kelime sayısına göre sıralanmış doküman bölümlerinin listesi.

### 3.3. Hibrit Arama (`hybrid_search`)

*   **Amaç:** Anlamsal aramanın kavramsal eşleştirme gücünü, anahtar kelime aramasının kesinliği ile birleştirerek daha kapsamlı ve dengeli sonuçlar sunar.
*   **Nasıl Kullanılır:** Fonksiyona doğal dilde bir sorgu metni verilir. İsteğe bağlı olarak anlamsal ve anahtar kelime sonuçlarının ağırlıkları ayarlanabilir.
*   **Örnek (Python içinde):**
    ```python
    from semantic_search import hybrid_search
    query = "Yönetici Ofisi görev panosu önceliklendirme"
    results = hybrid_search(query)
    for res in results:
        print(f"Skor: {res['score']:.4f}, Kaynak: {res['source_file']}")
        print(f"Metin: {res['text'][:200]}...")
    ```
*   **Çıktı:** Anlamsal ve anahtar kelime skorlarının ağırlıklı birleşimine göre sıralanmış doküman bölümlerinin listesi.

### 3.4. Görevler için Bağlamsal Yardım (`get_contextual_assistance_for_task`)

*   **Amaç:** Bir AI personasına atanan belirli bir görev tanımı için dokümantasyon içinde en alakalı ve yardımcı olabilecek bölümleri otomatik olarak bulup önermek.
*   **Nasıl Kullanılır:** Fonksiyona görevin detaylı bir açıklaması (örneğin, `standart_gorev_atama_sablonu.md` dosyasındaki "Görev Açıklaması ve Kapsamı" bölümü veya `ana_gorev_panosu.md`'den görev adı ve kısa açıklaması) verilir.
*   **Örnek (Python içinde):**
    ```python
    from semantic_search import get_contextual_assistance_for_task
    task_description = "CUDA PoC Raporunu İncele ve mimari açıdan değerlendir."
    relevant_docs = get_contextual_assistance_for_task(task_description)
    print(f"'{task_description}' görevi için ilgili dokümanlar:")
    for doc in relevant_docs:
        print(f"  Skor: {doc['score']:.4f}, Kaynak: {doc['source_file']}")
        print(f"    Metin: {doc['text'][:200]}...")
    ```
*   **Çıktı:** Görev tanımıyla anlamsal olarak en alakalı bulunan doküman bölümlerinin bir listesi.

## 4. Sonuçların Yorumlanması

*   **Skor:** Genellikle 0-1 arasında bir değerdir (anahtar kelime aramasında eşleşen kelime sayısı olabilir). Daha yüksek skor, sorguyla daha yüksek alaka düzeyi anlamına gelir.
*   **Kaynak Dosya (`source_file`):** Bilginin bulunduğu orijinal dokümanın tam yolu.
*   **Bölüm İndeksi (`chunk_index`):** Bilginin kaynak dosya içinde bulunduğu bölümün (paragrafın) sırası.
*   **Metin (`text`):** Bulunan ilgili metin bölümünün kendisi.

## 5. Etkili Sorgular ve Görev Tanımları için İpuçları

*   **Net ve Spesifik Olun:** Aradığınız bilgi veya görev hakkında olabildiğince net ve spesifik ifadeler kullanın.
*   **Doğal Dil Kullanın:** Özellikle anlamsal ve hibrit arama için, sorunuzu veya ifadenizi doğal dilde yazmaktan çekinmeyin.
*   **Anahtar Kavramları Dahil Edin:** Görev tanımlarında veya sorgularda, konuyla ilgili anahtar kavramları ve terimleri kullanmak, daha isabetli sonuçlar almanıza yardımcı olur.

## 6. Bilgi Tabanının Güncel Tutulması

Dokümantasyon (hedef .md dosyaları) güncellendiğinde veya yeni dokümanlar eklendiğinde, arama sonuçlarının doğruluğunu ve güncelliğini korumak için `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/AI_Yardimcilari/Dokuman_Embeddings/generate_embeddings.py` scriptinin **yeniden çalıştırılması gerektiğini unutmayın.** Bu işlem, embedding vektörlerini ve FAISS indeksini güncelleyecektir.

Bu doküman asistanı özelliklerinin, ALT_LAS projesindeki AI personalarının verimliliğini artırmasına ve bilgiye erişimini kolaylaştırmasına yardımcı olması beklenmektedir.

