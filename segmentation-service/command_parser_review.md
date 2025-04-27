### Görev 2.7: Komut Ayrıştırma Algoritması İncelemesi (`command_parser.py`)

**Mevcut Durum:**

*   `CommandParser` sınıfı, `language_processor` kullanarak komutları işler.
*   `parse_command` metodu, dili algılar, `segment_command` ile segmentleri oluşturur ve bir `AltFile` nesnesi döndürür.
*   `segment_command` metodu:
    *   Komutu cümlelere ayırır (`sent_tokenize`).
    *   Her cümleyi `_split_into_subtasks` ile alt görevlere ayırmaya çalışır (bağlaçlara göre regex ile bölme).
    *   Her alt görev için `_identify_task_type` ile görev tipini belirler (keyword eşleşmesi ve basit confidence skoru).
    *   `_extract_parameters` ile parametreleri çıkarır (görev tipine göre basit keyword çıkarma ve regex mantığı).
    *   `_identify_dependencies` ile segmentler arası bağımlılıkları belirlemeye çalışır (segmentler arasındaki metinde dependency keyword'lerini arama).
*   Dil işlemciden (`language_processor`) keyword listeleri (task, dependency, conjunction, alternative, context) alır.

**Değerlendirme:**

*   **Temel Fonksiyonellik:** Basit komutları segmentlere ayırma, görev tipi belirleme ve parametre çıkarma için temel bir yapı mevcut.
*   **Dil Bağımlılığı:** `language_processor` üzerinden dil bilgisi alarak farklı dilleri destekleme potansiyeli var.
*   **Basitlik:** Mevcut mantık oldukça basit ve kural tabanlı. Karmaşık cümle yapıları, örtük bağımlılıklar veya gelişmiş parametreler için yetersiz kalabilir.
*   **Subtask Bölme:** Bağlaçlara göre bölme basit senaryolarda işe yarayabilir ancak yan cümleleri veya karmaşık ilişkileri doğru ayıramayabilir.
*   **Task Tipi Belirleme:** Keyword eşleşmesi güvenilir olmayabilir, özellikle eş anlamlılar veya farklı ifadeler kullanıldığında. Confidence skoru basit bir normalizasyona dayanıyor.
*   **Parametre Çıkarma:** Görev tipine göre sabit kodlanmış mantık (örn. 'search' için query, 'create' için title/format) esnek değil ve birçok parametreyi kaçırabilir. NER (Named Entity Recognition) veya daha gelişmiş bilgi çıkarma teknikleri kullanılmıyor gibi görünüyor.
*   **Bağımlılık Belirleme:** Sadece segmentler arasındaki metinde keyword aramak çok kısıtlıdır. Anlamsal bağımlılıkları veya cümle içindeki sıralamayı tam olarak yakalayamaz.
*   **Enhanced DSL Entegrasyonu:** Mevcut ayrıştırıcı, `enhanced_dsl_schema.py` içindeki değişkenler, koşullar, döngüler veya fonksiyonlar gibi gelişmiş özellikleri ayrıştırmak veya üretmek için tasarlanmamış.

**İyileştirme Alanları:**

1.  **Daha Gelişmiş Cümle Ayrıştırma:** NLP dependency parsing kullanarak cümle içindeki fiilleri, nesneleri ve ilişkileri belirleyerek daha doğru segmentasyon yapmak.
2.  **Gelişmiş Görev Tipi Belirleme:** Makine öğrenimi tabanlı bir sınıflandırıcı veya daha sofistike anlamsal analiz kullanarak görev tiplerini daha güvenilir bir şekilde belirlemek.
3.  **Gelişmiş Parametre Çıkarma:** NER (Named Entity Recognition) kullanarak metin içindeki varlıkları (yerler, zamanlar, isimler, nesneler vb.) tanımak ve bunları parametre olarak atamak. İlişki çıkarma (Relation Extraction) teknikleri de kullanılabilir.
4.  **Gelişmiş Bağımlılık Analizi:** Sadece keyword'lere değil, aynı zamanda anlamsal ilişkilere, zaman sıralamasına ve dependency parsing sonuçlarına dayalı olarak segmentler arası bağımlılıkları belirlemek.
5.  **Enhanced DSL Desteği:** Ayrıştırıcıyı, komutlardaki koşul ifadelerini, döngüleri veya değişken atamalarını tanıyacak ve bunları `enhanced_dsl_schema.py`'deki ilgili modellere (örn. `ConditionalBranch`, `Loop`, `Variable`) dönüştürecek şekilde güncellemek.
6.  **Hata İşleme:** Ayrıştırma sırasında oluşabilecek hatalar için daha detaylı hata işleme eklemek.
7.  **Test Kapsamı:** Mevcut testleri (`test_command_parser.py`) gözden geçirmek ve yukarıdaki iyileştirmeleri kapsayacak şekilde genişletmek.

**Sonraki Adımlar:**

*   Öncelikle mevcut `_extract_parameters` ve `_identify_dependencies` fonksiyonlarını iyileştirmeye odaklanmak. NER entegrasyonu (spaCy kullanarak) parametre çıkarma için iyi bir başlangıç olabilir.
*   Bağımlılıklar için daha sağlam bir mantık geliştirmek (örn. sıralamaya ve temel fiil analizine dayalı).
*   Enhanced DSL özelliklerini desteklemek daha büyük bir çaba gerektirecektir ve sonraki adımlarda ele alınabilir.
*   Yapılan değişiklikler için birim testleri yazmak/güncellemek.

