# Embedding Model Fine-tuning: Tasarım Belgesi

Bu belge, ALT_LAS projesi dokümantasyonu için kullanılan embedding modelinin, proje özelindeki terminolojiye ve bağlama daha iyi uyum sağlaması amacıyla ince ayar (fine-tuning) sürecinin tasarımını ve iş akışını detaylandırmaktadır.

## 1. Amaç

Mevcut `paraphrase-multilingual-MiniLM-L12-v2` modelini, projenin kendi dokümanları üzerinde fine-tune ederek anlamsal arama, hibrit arama ve bağlamsal görev yardımı özelliklerinin doğruluğunu ve alaka düzeyini artırmak.

## 2. Hedef Dokümanlar (Fine-tuning Veri Seti Kaynağı)

Fine-tuning için kullanılacak veri seti, daha önce embedding üretimi için hedeflenen dokümanlardan oluşturulacaktır. Bu dokümanlar, projenin dilini ve kavramlarını yansıtan zengin bir kaynak sunmaktadır:

*   `/Planlama_Ofisi/ana_gorev_panosu.md`
*   `/Planlama_Ofisi/hierarchical_task_structure_definition.md`
*   `/Yonetici_Ofisi/Genel_Belgeler/YONETICI_OFISI_KULLANIM_KILAVUZU.md`
*   `/Yonetici_Ofisi/Genel_Belgeler/standart_gorev_atama_sablonu.md`
*   Tüm Persona Görev Tanımları (`.../Calisma_Dosyalari/*_detailed_cuda_tasks.md`)
*   Lisans Analizleri ve diğer önemli planlama dokümanları.

## 3. Fine-tuning İş Akışı

1.  **Veri Hazırlığı (Data Preparation):**
    *   **Strateji:** Fine-tuning için çeşitli stratejiler kullanılabilir. Başlangıç olarak, doküman içindeki anlamsal olarak yakın paragrafları veya bölümleri pozitif çiftler (positive pairs) olarak eşleştirmeyi veya bir sorgu-cevap formatında veri üretmeyi düşünebiliriz. Daha basit bir başlangıç için, `MultipleNegativesRankingLoss` gibi bir kayıp fonksiyonuyla uyumlu veri setleri oluşturulabilir. Bu, genellikle (anchor, positive) çiftleri veya (query, relevant_document) çiftleri gerektirir.
    *   **Yöntem 1 (Basit Yaklaşım - Komşu Paragraflar):** Aynı doküman içindeki ardışık veya başlık altında gruplanmış paragrafları pozitif çiftler olarak kabul edebiliriz. Bu, modelin aynı konu etrafında dönen metinleri birbirine yakınlaştırmasına yardımcı olabilir.
    *   **Yöntem 2 (Soru-Paragraf Çiftleri - Daha İleri Seviye):** Mevcut dokümanlardan potansiyel sorular ve bu soruların cevaplarını içeren paragrafları manuel veya yarı otomatik olarak etiketleyerek (query, answer_paragraph) çiftleri oluşturabiliriz. Bu, soru-cevap yeteneklerini doğrudan iyileştirebilir ancak daha fazla efor gerektirir.
    *   **İlk Odak:** `MultipleNegativesRankingLoss` için (anchor, positive) çiftleri oluşturmak. Örneğin, bir dokümandaki her bir paragrafı (anchor) alıp, aynı dokümandaki bir sonraki paragrafı (positive) olarak eşleştirebiliriz. Veya bir başlık altındaki tüm paragrafları birbirleriyle pozitif çift olarak kabul edebiliriz.
    *   Veri seti, `sentence_transformers` kütüphanesinin beklediği formatta (genellikle `InputExample` nesneleri listesi) hazırlanacaktır.

2.  **Fine-tuning Modeli ve Kayıp Fonksiyonu Seçimi:**
    *   **Temel Model:** `paraphrase-multilingual-MiniLM-L12-v2`.
    *   **Kayıp Fonksiyonu (Loss Function):** `MultipleNegativesRankingLoss` başlangıç için iyi bir seçenektir. Bu kayıp fonksiyonu, bir gruptaki (batch) bir (anchor, positive) çifti için diğer tüm (anchor, other_positive_in_batch) çiftlerini negatif olarak kabul eder ve pozitif çiftin benzerlik skorunu negatif çiftlerin skorlarından daha yüksek yapmaya çalışır.
    *   Alternatif olarak, eğer (anchor, positive, negative) üçlüleri oluşturulabilirse `TripletLoss` da kullanılabilir.

3.  **Eğitim (Training):**
    *   `sentence_transformers` kütüphanesinin `SentenceTransformer` sınıfının `fit` metodu kullanılarak model fine-tune edilecektir.
    *   **Parametreler:** Epoch sayısı (örn: 1-5), learning rate (örn: 2e-5), batch size (örn: 16-32) gibi hiperparametreler belirlenecektir. Küçük bir veri seti ve sınırlı kaynaklarla başlanacağı için epoch sayısı düşük tutulabilir.
    *   Eğitim süreci, modelin performansını bir değerlendirme seti üzerinde (eğer oluşturulabilirse) izleyerek veya kayıp değerinin düşüşünü gözlemleyerek takip edilecektir.

4.  **Modelin Kaydedilmesi:**
    *   Fine-tune edilmiş model, yeni bir isimle (örn: `alt-las-custom-MiniLM-L12-v2`) belirtilen bir yola kaydedilecektir:
        `/Yonetici_Ofisi/AI_Yardimcilari/Dokuman_Embeddings/fine_tuned_model/`

5.  **Yeni Embedding Üretimi ve İndeksleme:**
    *   `generate_embeddings.py` scripti, fine-tune edilmiş yeni modeli kullanacak şekilde güncellenecektir.
    *   Tüm hedef dokümanlar için embeddingler bu yeni modelle yeniden üretilecek ve FAISS indeksi güncellenecektir. Eski indeks ve metadata dosyalarının yedeği alınabilir.

6.  **Arama Fonksiyonlarının Güncellenmesi:**
    *   `semantic_search.py` scriptindeki model yükleme kısmı, fine-tune edilmiş modelin yolunu gösterecek şekilde güncellenecektir.

## 4. Uygulama Adımları (Python Scriptleri)

1.  **`prepare_finetuning_data.py`:**
    *   Hedef dokümanları okur.
    *   Seçilen stratejiye göre (örn: komşu paragraflar) `InputExample` listesi oluşturur.
    *   Bu listeyi eğitim için uygun bir formatta (örn: .tsv dosyası veya doğrudan Python listesi) kaydeder/döndürür.

2.  **`run_finetuning.py`:**
    *   `prepare_finetuning_data.py` ile hazırlanan veriyi yükler.
    *   `sentence_transformers` ile `paraphrase-multilingual-MiniLM-L12-v2` modelini yükler.
    *   Seçilen kayıp fonksiyonu (örn: `MultipleNegativesRankingLoss`) ve eğitim parametreleriyle modeli fine-tune eder.
    *   Fine-tune edilmiş modeli belirtilen yola kaydeder.

3.  **`generate_embeddings.py` (Güncellenmiş):**
    *   Model yükleme kısmında fine-tune edilmiş modelin yolunu kullanır.
    *   Diğer işlevleri aynı kalır (embedding üretme ve FAISS indeksini kaydetme).

4.  **`semantic_search.py` (Güncellenmiş):**
    *   Model yükleme kısmında fine-tune edilmiş modelin yolunu kullanır.
    *   Arama fonksiyonları aynı kalır, ancak artık yeni embeddingleri kullanır.

## 5. Değerlendirme

Fine-tuning sonrası, anlamsal arama ve bağlamsal yardım özelliklerinin performansı, önceki modelle karşılaştırmalı olarak değerlendirilecektir. Bu değerlendirme, belirli test sorguları ve görev tanımları üzerinden manuel olarak yapılabilir.

## 6. Kaydedilecek Dosyalar (Örnek)

*   `/Yonetici_Ofisi/AI_Yardimcilari/Dokuman_Embeddings/fine_tuning_data/`:
    *   `training_data.tsv` (veya benzeri formatta eğitim verisi)
*   `/Yonetici_Ofisi/AI_Yardimcilari/Dokuman_Embeddings/fine_tuned_model/`:
    *   Fine-tune edilmiş model dosyaları (Sentence Transformers formatında).
*   Scriptler (`prepare_finetuning_data.py`, `run_finetuning.py`) ana embedding klasöründe veya ayrı bir `fine_tuning_scripts` alt klasöründe olabilir.

Bu tasarım, embedding modelinin fine-tuning sürecini başlatmak için bir yol haritası sunmaktadır. Uygulama sırasında detaylar ve stratejiler daha da geliştirilebilir.
