## AI Model Performans Değerlendirme Metrikleri

Bu belge, İşçi 6 (AI Entegrasyon Uzmanı) tarafından AI modellerinin performansını değerlendirmek ve karşılaştırmak için kullanılacak temel metrikleri tanımlamaktadır. Bu metrikler, Makro Görev 6.1.4 kapsamında belirlenmiştir ve adaptörlerin geliştirilmesi ve test edilmesi sırasında dikkate alınacaktır.

### 1. Kalite Metrikleri

*   **Doğruluk (Accuracy):**
    *   **Tanım:** Modelin ürettiği yanıtların veya yaptığı çıkarımların ne kadar doğru olduğu.
    *   **Ölçüm Yöntemleri:**
        *   **Göreve Özgü Metrikler:** Sınıflandırma görevleri için F1-skoru, kesinlik (precision), duyarlılık (recall); çeviri için BLEU, ROUGE; soru-cevap için Exact Match (EM), F1.
        *   **İnsan Değerlendirmesi:** Üretilen metinlerin kalitesinin, tutarlılığının, akıcılığının ve göreve uygunluğunun insanlar tarafından değerlendirilmesi.
        *   **Referans Veri Setleri:** Standartlaşmış veri setleri üzerinde model performansının ölçülmesi.
*   **Tutarlılık (Coherence & Consistency):**
    *   **Tanım:** Modelin ürettiği metinlerin kendi içinde ve verilen bağlamla ne kadar tutarlı olduğu.
    *   **Ölçüm Yöntemleri:** İnsan değerlendirmesi, çelişki tespiti (contradiction detection) modelleri.
*   **Akıcılık (Fluency):**
    *   **Tanım:** Modelin ürettiği metinlerin dilbilgisi açısından ne kadar doğru ve doğal olduğu.
    *   **Ölçüm Yöntemleri:** İnsan değerlendirmesi, dilbilgisi kontrol araçları.
*   **İlgililik (Relevance):**
    *   **Tanım:** Modelin ürettiği yanıtların verilen prompt veya soru ile ne kadar ilgili olduğu.
    *   **Ölçüm Yöntemleri:** İnsan değerlendirmesi, anlamsal benzerlik ölçümleri.

### 2. Hız ve Verimlilik Metrikleri

*   **Yanıt Süresi (Latency):**
    *   **Tanım:** Bir istek gönderildikten sonra modelden ilk yanıtın (veya tam yanıtın) alınmasına kadar geçen süre.
    *   **Ölçüm Yöntemleri:** Ortalama yanıt süresi, P90/P95/P99 gecikme süreleri.
    *   **Not:** Streaming API'ler için "time to first token" (ilk tokena kadar geçen süre) ve "inter-token latency" (tokenlar arası gecikme) önemlidir.
*   **İş Çıktısı (Throughput):**
    *   **Tanım:** Birim zamanda işlenebilen istek sayısı veya üretilebilen token sayısı.
    *   **Ölçüm Yöntemleri:** Saniyedeki istek sayısı (RPS), saniyedeki token sayısı (TPS).
*   **Token Üretim Hızı:**
    *   **Tanım:** Modelin saniyede kaç token üretebildiği.
    *   **Ölçüm Yöntemleri:** Özellikle büyük metin üretim görevleri için önemlidir.

### 3. Maliyet Metrikleri

*   **API Kullanım Maliyeti:**
    *   **Tanım:** Ticari API'lerin (OpenAI, Anthropic, Mistral AI vb.) kullanımı için ödenen ücret.
    *   **Ölçüm Yöntemleri:** Genellikle token başına (giriş ve çıkış tokenları ayrı ayrı) veya istek başına ücretlendirilir. Her modelin ve sağlayıcının fiyatlandırma politikası dikkate alınmalıdır.
*   **Altyapı Maliyeti (Yerel Modeller İçin):**
    *   **Tanım:** Yerel modellerin çalıştırılması için gereken donanım (GPU, CPU, RAM, depolama) ve enerji maliyeti.
    *   **Ölçüm Yöntemleri:** Donanım amortismanı, enerji tüketimi, bakım maliyetleri.

### 4. Kaynak Kullanımı Metrikleri (Özellikle Yerel Modeller İçin)

*   **GPU Kullanımı:**
    *   **Tanım:** Modelin çalışması sırasında GPU belleği (VRAM) ve işlem gücü kullanımı.
    *   **Ölçüm Yöntemleri:** `nvidia-smi` gibi araçlarla izleme.
*   **CPU Kullanımı:**
    *   **Tanım:** Modelin çalışması sırasında CPU kullanımı.
    *   **Ölçüm Yöntemleri:** Sistem izleme araçları.
*   **Bellek (RAM) Kullanımı:**
    *   **Tanım:** Modelin çalışması sırasında sistem belleği kullanımı.
    *   **Ölçüm Yöntemleri:** Sistem izleme araçları.

### 5. Diğer Önemli Hususlar

*   **Ölçeklenebilirlik:** Modelin artan yük altında performansını ne kadar koruyabildiği.
*   **Güvenilirlik:** Modelin tutarlı ve öngörülebilir sonuçlar üretme yeteneği.
*   **Kullanım Kolaylığı (Ease of Use):** API entegrasyonunun ve model yönetiminin ne kadar kolay olduğu.
*   **Güvenlik ve Etik Hususlar:** Modelin zararlı, taraflı veya yanıltıcı içerik üretme eğilimi; veri gizliliği.

Bu metrikler, farklı AI modellerini objektif bir şekilde karşılaştırmak ve projenin gereksinimlerine en uygun olanları seçmek için bir çerçeve sunar. Testler sırasında bu metrikler düzenli olarak toplanacak ve raporlanacaktır.
