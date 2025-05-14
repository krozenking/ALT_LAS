# Standart Görev Atama Şablonu (Girdi/Çıktı Formatı)

Bu şablon, ALT_LAS projesindeki AI personalarına görev ataması yapılırken kullanılacak standart formatı tanımlar. Proje Yöneticisi (veya görev atayan yetkili) tarafından her yeni görev için doldurulur ve ilgili personanın çalışma dosyalarına veya merkezi bir görev tanımına eklenir.

## Görev Tanım Bilgileri

*   **Görev ID:** (Ana Görev Panosundaki ID ile aynı olmalı, örn: `BE-HOTSPOT-SEGSERV-001`)
*   **Görev Adı:** (Ana Görev Panosundaki Ad ile aynı olmalı)
*   **Atanan Persona:** (Görevi yapacak AI personasının adı, örn: Kıdemli Backend Geliştirici - Ahmet Çelik)
*   **Atama Tarihi:** YYYY-AA-GG
*   **İstenen Bitiş Tarihi (Tahmini):** YYYY-AA-GG
*   **Öncelik:** (P0, P1, P2, P3, P4 - Ana Görev Panosu ile uyumlu)
*   **Üst Görev(ler) (Varsa):** (Bu görevin parçası olduğu Makro veya Alt Görev ID/Adı)
*   **Bağlı Olduğu Görev(ler) (Varsa):** (Bu görevin başlayabilmesi için tamamlanması gereken diğer görevlerin IDleri)

## Görev Açıklaması ve Kapsamı

[Bu bölümde görevin ne olduğu, neden yapıldığı ve genel hedefleri detaylı bir şekilde açıklanır. Kullanıcının veya Proje Yöneticisinin beklentileri net bir şekilde ifade edilir.]

## Gerekli Girdiler

Bu bölümde, görevin başarıyla tamamlanabilmesi için AI personasının ihtiyaç duyacağı tüm girdiler listelenir. Her girdi için dosya yolu, veri formatı, erişim bilgileri veya ilgili parametreler belirtilmelidir.

1.  **Girdi Adı/Türü:** [Örn: Ham Metin Veri Seti]
    *   **Kaynak/Konum:** [`/home/ubuntu/ALT_LAS_Organized/Proje_Kodu/datasets/raw_text_corpus.zip`]
    *   **Format/Özellikler:** [Örn: ZIP içinde .txt dosyaları, UTF-8 encoding, her satır bir doküman]
    *   **Notlar:** [Örn: Sadece ilk 1000 doküman üzerinde çalışılacak.]

2.  **Girdi Adı/Türü:** [Örn: Model Konfigürasyon Parametreleri]
    *   **Kaynak/Konum:** [Proje Yöneticisi tarafından sağlanacak JSON string veya dosya yolu]
    *   **Format/Özellikler:** [Örn: `{ "learning_rate": 0.001, "epochs": 10 }`]
    *   **Notlar:**

3.  **Girdi Adı/Türü:** [Örn: Mevcut Kaynak Kodu Modülü]
    *   **Kaynak/Konum:** [`/home/ubuntu/ALT_LAS_Organized/Proje_Kodu/segmentation-service/services/parallel_processing_optimizer.py`]
    *   **Format/Özellikler:** [Python modülü]
    *   **Notlar:** [Örn: Bu modüldeki `calculate_similarity_cpu` fonksiyonu referans alınacak.]

## Beklenen Çıktılar (Teslim Edilecekler)

Bu bölümde, görevin tamamlanması sonucunda AI personasından beklenen tüm çıktılar listelenir. Her çıktı için dosya formatı, kaydedileceği konum ve içeriğine dair beklentiler belirtilmelidir.

1.  **Çıktı Adı/Türü:** [Örn: CUDA ile Hızlandırılmış Fonksiyon]
    *   **Teslim Edilecek Konum:** [`/home/ubuntu/ALT_LAS_Organized/Proje_Kodu/segmentation-service/services/parallel_processing_optimizer.py` (güncellenmiş dosya) veya yeni bir modül]
    *   **Format/Özellikler:** [Örn: `calculate_similarity_gpu_cupy` adında yeni bir Python fonksiyonu, CuPy kütüphanesi kullanılarak yazılmış, detaylı kod içi yorumlar içermeli.]
    *   **Notlar:** [Örn: Fonksiyon, CPU versiyonu ile aynı girdileri alıp aynı formatta çıktı üretmelidir.]

2.  **Çıktı Adı/Türü:** [Örn: Birim Testleri]
    *   **Teslim Edilecek Konum:** [`/home/ubuntu/ALT_LAS_Organized/Proje_Kodu/segmentation-service/tests/gpu/test_cosine_similarity_gpu.py` (yeni dosya)]
    *   **Format/Özellikler:** [Örn: `pytest` formatında yazılmış, pozitif/negatif/sınır durumlarını içeren en az 5 adet test senaryosu.]
    *   **Notlar:**

3.  **Çıktı Adı/Türü:** [Örn: Görev Tamamlama Raporu]
    *   **Teslim Edilecek Konum:** [`/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/[Persona_Adi]_Ofisi/Raporlar/[Görev_ID]_rapor.md`]
    *   **Format/Özellikler:** [Markdown formatında, yapılanlar, karşılaşılan zorluklar, performans karşılaştırması (varsa), öneriler gibi bölümleri içermeli.]
    *   **Notlar:**

4.  **Çıktı Adı/Türü:** [Örn: Güncellenmiş Teknik Dokümantasyon (varsa)]
    *   **Teslim Edilecek Konum:** [İlgili README dosyası veya `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Genel_Belgeler/` altındaki ilgili doküman.]
    *   **Format/Özellikler:** [Yapılan değişiklikleri yansıtan güncellemeler.]
    *   **Notlar:**

## Kabul Kriterleri

*   [Örn: Tüm beklenen çıktılar eksiksiz ve belirtilen formatlarda teslim edilmiştir.]
*   [Örn: Yazılan kod, proje kodlama standartlarına uygundur ve yorum satırları yeterlidir.]
*   [Örn: Birim testleri %100 başarıyla geçmektedir.]
*   [Örn: CUDA ile hızlandırılmış fonksiyon, CPU versiyonuna göre en az %X performans artışı sağlamaktadır (belirli bir test senaryosunda).]
*   [Örn: Görev tamamlama raporu açık, anlaşılır ve tüm gerekli bilgileri içermektedir.]
*   [Örn: İlgili `persona_gelisimi.md` dosyası güncellenmiştir.]
*   [Örn: Tüm değişiklikler GitHub reposuna push edilmiştir (`cuda_integration_feature_branch`).]

## Ek Notlar ve Talimatlar

[Görevle ilgili diğer önemli notlar, özel talimatlar veya dikkat edilmesi gereken hususlar bu bölümde belirtilir.]

