## OpenAI ve Anthropic Adaptörleri için Performans Testleri ve Karşılaştırma Planı

Bu belge, İşçi 6 (AI Entegrasyon Uzmanı) tarafından Makro Görev 6.2.4 kapsamında OpenAI ve Anthropic modelleri için geliştirilen adaptörlerin performansını test etme ve karşılaştırma stratejilerini özetlemektedir. Gerçek testlerin yürütülmesi API anahtarlarına ve uygun bir test ortamına bağlıdır.

### 1. Test Amaçları

*   OpenAI (örn: GPT-3.5-Turbo, GPT-4) ve Anthropic (örn: Claude 3 Haiku, Claude 3 Sonnet, Claude 3 Opus) modellerinin farklı görevlerdeki performansını değerlendirmek.
*   Adaptörlerin yanıt süresi (gecikme), token başına maliyet ve çıktı kalitesi gibi temel metriklerini ölçmek.
*   Farklı prompt yapıları ve parametre ayarlarının performansa etkisini analiz etmek.
*   Modeller arasında belirli kullanım senaryoları için en uygun olanı belirlemeye yardımcı olacak veriler toplamak.

### 2. Test Edilecek Modeller ve Adaptörler

*   **OpenAI Adaptörü:**
    *   Model: `gpt-3.5-turbo` (temel)
    *   Model: `gpt-4` (veya mevcut en güncel ve güçlü model, bütçe dahilinde)
*   **Anthropic Adaptörü:**
    *   Model: `claude-3-haiku-20240307` (hız odaklı)
    *   Model: `claude-3-sonnet-20240229` (dengeli)
    *   Model: `claude-3-opus-20240229` (güç odaklı)

### 3. Test Senaryoları

Aşağıdaki gibi çeşitli görev türlerini kapsayan standartlaştırılmış test senaryoları oluşturulacaktır:

1.  **Soru Cevaplama (Fact-Based QA):**
    *   Örnek: "Fransa'nın başkenti neresidir?", "Suyun kimyasal formülü nedir?"
    *   Metrikler: Yanıt doğruluğu, gecikme süresi.
2.  **Metin Özetleme (Summarization):**
    *   Örnek: Farklı uzunluklarda (örn: 200 kelime, 500 kelime, 1000 kelime) makaleler verilecek ve 50-100 kelimelik özetler istenecek.
    *   Metrikler: Özetin kalitesi (bilgi kaybı, tutarlılık - ROUGE skorları gibi metrikler veya insan değerlendirmesi), gecikme süresi, token kullanımı.
3.  **Metin Üretme (Text Generation - Creative & Technical):**
    *   Örnek (Yaratıcı): "Yapay zeka hakkında kısa bir şiir yaz."
    *   Örnek (Teknik): "Bir Python fonksiyonu için dokümantasyon taslağı oluştur: `calculate_average(numbers_list)`."
    *   Metrikler: Çıktının uygunluğu, yaratıcılığı/teknik doğruluğu, gecikme süresi, token kullanımı.
4.  **Kod Üretme (Code Generation):**
    *   Örnek: "Verilen bir listenin medyanını bulan bir Python fonksiyonu yaz."
    *   Metrikler: Üretilen kodun doğruluğu, çalıştırılabilirliği, verimliliği, gecikme süresi.
5.  **Sınıflandırma (Classification):**
    *   Örnek: Verilen bir müşteri yorumunun pozitif, negatif veya nötr olduğunu sınıflandır.
    *   Metrikler: Sınıflandırma doğruluğu (F1 skoru, kesinlik, duyarlılık), gecikme süresi.
6.  **Çeviri (Translation - Eğer uygulanabilirse):**
    *   Örnek: Basit cümlelerin İngilizce'den Türkçe'ye çevirisi.
    *   Metrikler: Çeviri kalitesi (BLEU skoru veya insan değerlendirmesi), gecikme süresi.

### 4. Toplanacak Metrikler

Her test senaryosu ve model için aşağıdaki metrikler toplanacaktır:

*   **Gecikme Süresi (Latency):** İsteğin gönderilmesinden yanıtın tam olarak alınmasına kadar geçen süre (milisaniye cinsinden).
    *   Ortalama, medyan, 95. persentil (P95) ve 99. persentil (P99) gecikme süreleri kaydedilecektir.
*   **Token Kullanımı:**
    *   Prompt token sayısı.
    *   Completion (üretilen) token sayısı.
    *   Toplam token sayısı.
*   **Maliyet:** Her API çağrısının maliyeti (modelin fiyatlandırmasına göre hesaplanacaktır).
    *   Test başına maliyet, 1000 token başına maliyet.
*   **Çıktı Kalitesi:**
    *   Otomatik metrikler (ROUGE, BLEU, F1 skoru vb. - göreve bağlı).
    *   İnsan değerlendirmesi (önceden tanımlanmış bir rubriğe göre tutarlılık, doğruluk, akıcılık vb. açılarından).
*   **Hata Oranları:** Başarısız olan API çağrılarının yüzdesi.

### 5. Test Ortamı ve Araçları

*   **Test İstemcisi:** API isteklerini göndermek ve yanıtları almak için Python tabanlı bir script (muhtemelen `pytest` veya özel bir test framework'ü kullanılabilir).
*   **Veri Setleri:** Her test senaryosu için standartlaştırılmış girdi veri setleri.
*   **API Anahtarları:** OpenAI ve Anthropic API'lerine erişim için geçerli anahtarlar.
*   **Çevresel Faktörler:** Testler, ağ koşullarının ve istemci makine yükünün sonuçları etkilememesi için kontrollü bir ortamda veya birden fazla kez çalıştırılarak ortalamalar alınarak yapılmalıdır.

### 6. Test Yürütme Süreci

1.  Test senaryoları ve veri setleri hazırlanır.
2.  Her model ve adaptör için test scriptleri yapılandırılır.
3.  Belirlenen sayıda (örn: her senaryo için 50-100 tekrar) test çalıştırılır.
4.  Toplanan ham veriler (gecikme, token kullanımı, API yanıtları) kaydedilir.
5.  Hata oranları ve maliyetler hesaplanır.
6.  Çıktı kalitesi değerlendirilir (otomatik ve/veya manuel).

### 7. Sonuç Analizi ve Raporlama

*   Toplanan metrikler istatistiksel olarak analiz edilir (ortalamalar, standart sapmalar, dağılımlar).
*   Modellerin farklı senaryolardaki güçlü ve zayıf yönleri belirlenir.
*   Gecikme, maliyet ve kalite arasında bir denge analizi yapılır.
*   Sonuçlar, tablolar ve grafiklerle desteklenerek kapsamlı bir raporda sunulur.
*   Rapor, hangi modelin hangi tür görevler için daha uygun olduğuna dair öneriler içerecektir.

### 8. Adaptör Testleri (Ek)

Performans testlerine ek olarak, adaptörlerin kendilerinin de doğru çalıştığından emin olmak için aşağıdaki testler (birim ve entegrasyon testlerinin bir parçası olarak) önemlidir:

*   **Parametre Geçişi:** Tüm desteklenen parametrelerin (örn: `max_tokens`, `temperature`) API'ye doğru şekilde iletildiğinin doğrulanması.
*   **Hata İşleme:** API'den dönen hataların (örn: rate limit, geçersiz anahtar, sunucu hatası) adaptör tarafından doğru şekilde yakalanıp işlendiğinin test edilmesi.
*   **Yanıt Ayrıştırma:** API'den gelen başarılı yanıtların doğru şekilde ayrıştırılıp standart bir formatta döndürüldüğünün kontrol edilmesi.

Bu plan, OpenAI ve Anthropic adaptörlerinin performansını değerlendirmek için bir çerçeve sunmaktadır. Gerçek uygulama, mevcut kaynaklara ve proje önceliklerine göre ayarlanabilir.
