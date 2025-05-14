## OpenAI ve Anthropic Adaptörleri için Prompt Engineering Stratejileri

Bu belge, İşçi 6 (AI Entegrasyon Uzmanı) tarafından Makro Görev 6.2.3 kapsamında OpenAI ve Anthropic modelleri için geliştirilen adaptörlerde kullanılacak prompt engineering stratejilerini ve optimizasyon yaklaşımlarını özetlemektedir.

### Genel Prompt Engineering İlkeleri:

1.  **Açıklık ve Kesinlik:** Promptlar, modelden ne beklendiğini net bir şekilde ifade etmelidir. Belirsizlikten kaçınılmalı, görev açıkça tanımlanmalıdır.
2.  **Bağlam Sağlama:** Modele yeterli bağlam sunmak, daha doğru ve ilgili yanıtlar alınmasını sağlar. Bu, önceki konuşma geçmişi, ilgili doküman parçaları veya kullanıcı profili gibi bilgileri içerebilir.
3.  **Rol Tanımlama (Role Playing):** Modele belirli bir rol (örn: "Sen bir uzman yazılımcısın", "Sen bir yaratıcı metin yazarısın") atamak, yanıtların tonunu ve stilini yönlendirebilir.
4.  **Örneklerle Öğretme (Few-Shot Learning):** Karmaşık görevler için, prompt içinde birkaç örnek (girdi-çıktı çifti) sunmak, modelin istenen formatı ve davranışı daha iyi anlamasına yardımcı olur.
5.  **Adım Adım Düşünme (Chain-of-Thought / Step-by-Step Thinking):** Özellikle karmaşık problem çözme veya mantık yürütme gerektiren görevlerde, modelden adım adım düşünmesini istemek (örn: "Let's think step by step.") sonuçların doğruluğunu artırabilir.
6.  **Negatif Promptlar / Kısıtlamalar:** Modelin ne yapmaması gerektiğini belirtmek (örn: "Şu konudan bahsetme", "Bu formatta yazma") istenmeyen çıktıları azaltabilir.
7.  **Çıktı Formatını Belirleme:** Modelden istenen çıktının formatını (örn: JSON, Markdown, liste) prompt içinde belirtmek, sonuçların işlenmesini kolaylaştırır.
8.  **Iterasyon ve Test:** En iyi promptu bulmak genellikle bir iterasyon sürecidir. Farklı prompt varyasyonları denenmeli ve sonuçları değerlendirilmelidir.

### OpenAI Modelleri (GPT-3.5, GPT-4) için Spesifik Stratejiler:

*   **Sistem Mesajları (System Prompts):** `ChatCompletion` API'sinde sistem mesajları, modelin genel davranışını ve rolünü belirlemek için güçlü bir araçtır. Bu mesaj, konuşmanın başında verilmeli ve genellikle kullanıcı mesajlarından daha fazla ağırlığa sahiptir.
    *   Örnek: `{"role": "system", "content": "You are a helpful assistant that translates English to French."}`
*   **Kullanıcı Mesajları (User Prompts):** Kullanıcının doğrudan taleplerini içerir.
*   **Asistan Mesajları (Assistant Prompts):** Few-shot learning senaryolarında, modelin vermesi beklenen örnek yanıtları göstermek için kullanılabilir.
*   **Parametre Ayarları:**
    *   `temperature`: Daha yaratıcı (yüksek değer) veya daha deterministik (düşük değer) yanıtlar için ayarlanabilir.
    *   `top_p`: Çekirdek örnekleme (nucleus sampling) için kullanılır. `temperature` ile alternatif olarak veya birlikte kullanılabilir.
    *   `frequency_penalty` ve `presence_penalty`: Tekrarlayan veya belirli konulara aşırı odaklanan yanıtları engellemek için kullanılabilir.

### Anthropic Claude Modelleri (Claude 3 Opus, Sonnet, Haiku) için Spesifik Stratejiler:

*   **Sistem Promptu (System Prompt):** OpenAI'ye benzer şekilde, `messages.create` API'sinde `system` parametresi ile modelin genel talimatları ve rolü belirlenebilir.
    *   Claude modelleri, özellikle uzun ve karmaşık sistem promptlarını takip etmede başarılıdır.
*   **Mesaj Yapısı:** Claude API'si, `user` ve `assistant` rollerini içeren bir mesaj listesi bekler. Promptlar, bu mesaj yapısına uygun olarak düzenlenmelidir.
    *   Claude, bir konuşmanın sonundaki `assistant` rolüyle başlayan bir mesajla devam etmeye (örneğin, bir görevi tamamlamaya veya bir formatı takip etmeye) özellikle yatkındır.
*   **XML Etiketleri:** Claude, promptlar içinde XML etiketlerini kullanarak belirli metin bölümlerine dikkat çekme veya yapılandırma konusunda iyi performans gösterir. Bu, talimatları, örnekleri veya önemli bağlamı vurgulamak için kullanılabilir.
    *   Örnek: `<document_to_summarize>...</document_to_summarize>`
*   **Parametre Ayarları:**
    *   `temperature`: OpenAI'ye benzer şekilde yaratıcılığı kontrol eder.
    *   `top_p` ve `top_k`: Örnekleme stratejilerini ayarlamak için kullanılır.
    *   `max_tokens`: Üretilecek maksimum token sayısını belirler.

### Optimizasyon ve Test Yaklaşımları:

1.  **Temel Prompt Oluşturma:** Her model ve görev için temel bir prompt ile başlanır.
2.  **Varyasyon Denemeleri:** Farklı ifadeler, anahtar kelimeler, rol tanımları ve formatlama teknikleri denenir.
3.  **Parametre Optimizasyonu:** `temperature`, `max_tokens`, `top_p`, `top_k` gibi parametrelerin farklı kombinasyonları test edilir.
4.  **A/B Testleri:** Farklı promptların veya parametre setlerinin performansını karşılaştırmak için A/B testleri yapılabilir (eğer altyapı destekliyorsa).
5.  **Kalitatif Değerlendirme:** Üretilen çıktıların kalitesi, belirlenen metrikler (bkz. `ai_model_performance_metrics.md`) ve insan değerlendirmesi ile analiz edilir.
6.  **Kullanıcı Geri Bildirimi:** Mümkünse, gerçek kullanıcı geri bildirimleri promptların iyileştirilmesinde kullanılır.
7.  **Prompt Kütüphanesi Oluşturma:** Başarılı prompt şablonları ve stratejileri, gelecekteki kullanımlar için bir kütüphanede saklanabilir.

Bu stratejiler, OpenAI ve Anthropic adaptörlerinin geliştirilmesi ve test edilmesi sırasında uygulanacak ve `worker_tasks_detailed.md` dosyasında belirtilen Makro Görev 6.2.3 kapsamındaki prompt engineering ve optimizasyon çalışmalarına rehberlik edecektir.
