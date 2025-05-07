## AI Model API Araştırması ve Dokümantasyonu Özeti

Bu belge, İşçi 6'nın (AI Entegrasyon Uzmanı) Makro Görev 6.1.2 kapsamında gerçekleştirdiği AI model API'leri araştırmasının bir özetini sunmaktadır.

### Araştırılan Temel API'ler ve Özellikleri:

1.  **OpenAI API (GPT-3.5, GPT-4, Embeddings vb.)**
    *   **Erişim:** `openai` Python SDK.
    *   **Temel Fonksiyonlar:** Metin üretimi (`Completion`, `ChatCompletion`), embedding oluşturma (`Embedding`).
    *   **Kimlik Doğrulama:** API Anahtarı (Bearer Token).
    *   **Parametreler:** `model`, `prompt`, `messages`, `max_tokens`, `temperature`, `top_p`, `n`, `stream`, `stop`, `presence_penalty`, `frequency_penalty` vb.
    *   **Dokümantasyon:** [https://platform.openai.com/docs](https://platform.openai.com/docs)

2.  **Anthropic Claude API (Claude 3 Opus, Sonnet, Haiku)**
    *   **Erişim:** `anthropic` Python SDK.
    *   **Temel Fonksiyonlar:** Mesajlaşma tabanlı metin üretimi (`messages.create`).
    *   **Kimlik Doğrulama:** API Anahtarı.
    *   **Parametreler:** `model`, `max_tokens`, `messages`, `system` (sistem promptu), `temperature`, `top_p`, `top_k`, `stream`.
    *   **Dokümantasyon:** [https://docs.anthropic.com/claude/reference/getting-started-with-the-api](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

3.  **Mistral AI API (Mistral Large, Small, 7B)**
    *   **Erişim:** `mistralai` Python SDK.
    *   **Temel Fonksiyonlar:** Chat (`chat`, `chat_stream`), embedding (`embeddings`).
    *   **Kimlik Doğrulama:** API Anahtarı.
    *   **Parametreler:** `model`, `messages`, `temperature`, `top_p`, `max_tokens`, `stream`, `safe_prompt`.
    *   **Dokümantasyon:** [https://docs.mistral.ai/platform/overview/](https://docs.mistral.ai/platform/overview/)

4.  **Hugging Face API'leri (Inference API, Transformers Kütüphanesi)**
    *   **Erişim:** `huggingface_hub` Python kütüphanesi (Inference API için) veya `transformers` kütüphanesi (yerel veya özel modeller için).
    *   **Temel Fonksiyonlar:** Çok çeşitli görevler (metin üretimi, çeviri, özetleme, soru cevaplama, embedding vb.).
    *   **Kimlik Doğrulama:** Hugging Face Token (Inference API için).
    *   **Parametreler:** Modele ve göreve göre değişiklik gösterir.
    *   **Dokümantasyon:**
        *   Inference API: [https://huggingface.co/docs/api-inference/index](https://huggingface.co/docs/api-inference/index)
        *   Transformers: [https://huggingface.co/docs/transformers/index](https://huggingface.co/docs/transformers/index)

5.  **Yerel Modeller (örn: llama.cpp ile)**
    *   **Erişim:** `llama-cpp-python` Python kütüphanesi veya doğrudan `llama.cpp` komut satırı arayüzü.
    *   **Temel Fonksiyonlar:** Metin üretimi, chat.
    *   **Kimlik Doğrulama:** Genellikle gerekmez (yerel çalıştığı için).
    *   **Parametreler:** `prompt`, `max_tokens`, `temperature`, `top_p`, `top_k`, `repeat_penalty` vb. Modelin kendisine ve `llama.cpp` yapılandırmasına bağlıdır.
    *   **Dokümantasyon:**
        *   `llama-cpp-python`: [https://github.com/abetlen/llama-cpp-python](https://github.com/abetlen/llama-cpp-python)
        *   `llama.cpp`: [https://github.com/ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp)

### Genel Gözlemler ve Adaptör Tasarımı İçin Notlar:

*   **Ortak Arayüz:** `BaseAdapter` sınıfında tanımlanan `generate`, `chat`, `embed` metodları, bu farklı API'lerin temel işlevlerini kapsayacak şekilde tasarlanmıştır.
*   **Parametre Standardizasyonu:** Her ne kadar API'ler farklı parametre setlerine sahip olsa da, adaptörler aracılığıyla yaygın kullanılan parametreler (örn: `max_tokens`, `temperature`) standartlaştırılmaya çalışılacaktır.
*   **Hata İşleme:** Her adaptör, ilgili API'nin özel hata kodlarını ve mesajlarını yakalayıp standart bir formatta yukarıya iletmelidir.
*   **Asenkron Destek:** Tüm API çağrıları, `async/await` kullanılarak asenkron olarak gerçekleştirilmelidir.
*   **Yapılandırma:** API anahtarları ve modele özgü diğer yapılandırmalar, güvenli bir şekilde (örn: `.env` dosyaları veya ortam değişkenleri) yönetilmelidir.

Bu araştırma, AI adaptörlerinin geliştirilmesi için temel bir zemin oluşturmaktadır. Her bir adaptörün implementasyonu sırasında, ilgili API'nin detaylı dokümantasyonu ve en iyi pratikleri dikkate alınacaktır.
