# Önceliklendirilmiş Kapsamlı Öneriler İçin Uygulama Planı (ALT_LAS)

**Kaynak:** `/home/ubuntu/prioritized_comprehensive_suggestions.md`
**Hazırlayan:** Proje Yöneticisi

Bu plan, kapsamlı önerilerden önceliklendirilen önerilerin ALT_LAS proje iş akışına entegrasyonunu özetlemektedir. Mevcut proje durumunu (%42 genel ilerleme, Runner Service, UI ve Güvenlik'te kritik darboğazlar) dikkate alır ve değerli geliştirmeleri entegre ederken temel sorunları ele almayı amaçlar.

**Entegrasyon Stratejisi:**

*   **Öncelik 1 görevleri**, kritik yol öğelerini (Runner Service, UI, Güvenlik başlatma) açma çabalarıyla paralel olarak **hemen sonraki sprintlere (Sprint X, X+1)** entegre edilecektir.
*   **Öncelik 2 görevleri**, temel unsurların ve çekirdek bileşen ilerlemesinin stabilizasyonunu takiben **sonraki sprintlere (Sprint X+2, X+3)** entegre edilecektir.
*   **Öncelik 3 görevleri**, çekirdek işlevsellik sağlamlaştığında **daha sonraki sprintler veya Beta sonrası aşama** için planlanacaktır.

**Sprint Entegrasyonu (Örnek - Mevcut Sprint'in bittiği varsayılarak):**

**Sprint X & X+1 (Odak: Temeller, Engelleri Kaldırma, Güvenlik Taban Çizgisi):**

*   **Paralel Olarak:** İşçi 3'ün (Runner Service) engellerini kaldırma, İşçi 5'i (UI) başlatma, İşçi 8'i (Güvenlik) başlatma.
*   **Öncelik 1 Görev Entegrasyonu:**
    *   **Güvenlik (İşçi 8 Lider, Tüm Çalışanlar):** Tehdit Modellemesine Başlama (8), mTLS/En Az Ayrıcalık Uygulama (Tümü), Veri Şifreleme/Erişim Kontrolleri Uygulama (Tümü). *İlk odak çekirdek servisler üzerinde.*
    *   **DevOps/Tümü:** Performans Metrik Toplamayı Kurma (DevOps/Tümü), CI/CD'ye Güvenlik Taramalarını Entegre Etme (DevOps), Derlemeleri/Paketlemeyi Otomatikleştirme (DevOps).
    *   **KG/İşçi 8:** İlk Güvenlik Test Senaryolarını Geliştirme (KG/8).
    *   **KG/Tümü:** Birim/Entegrasyon Test Kapsamını Genişletmeye Devam Etme (Tümü).
    *   **PY/Ürün:** İlk SLO'ları Tanımlama (PY/Ürün).
    *   **PY/Hukuk:** Bağımlılık Lisanslarını Doğrulama (PY/Hukuk).

**Sprint X+2 & X+3 (Odak: Bileşen Kalitesi, Süreç Geliştirme):**

*   **Paralel Olarak:** Runner Service, UI, Güvenlik Katmanı, YZ Bileşenleri üzerinde devam eden geliştirme.
*   **Öncelik 2 Görev Entegrasyonu:**
    *   **YZ (İşçi 7, KG, İşçi 8):** MLOps araçlarını entegre etme (7), YZ Veri Gizliliği önlemlerini uygulama (7/8), YZ Yanlılık/Sağlamlık testleri geliştirme (KG/7).
    *   **Arşiv/YZ (İşçi 4, İşçi 7):** *.atlas geri bildirim döngüsü uygulamasını doğrulama (4/7).
    *   **UI/KG (İşçi 5, KG):** Erişilebilirlik standartlarını (WCAG) uygulama (5), UI Test Otomasyonunu uygulama (KG/5), Çapraz Platform UI Testleri yapma (KG/5).
    *   **UI (İşçi 5):** İstemci Tarafı Girdi Doğrulamasını uygulama (5).
    *   **KG/Tümü:** Servise Özgü Performans/Yük Testlerini uygulama (KG/Tümü).

**Daha Sonraki Sprintler / Beta Sonrası (Odak: Gelişmiş Kalite ve İyileştirmeler):**

*   **Öncelik 3 Görev Entegrasyonu:**
    *   **KG/DevOps:** Kaos mühendisliği uygulamalarını tanıtma (KG/DevOps).
    *   **UI (İşçi 5):** Yerel Görünüm ve Hissi / OS Entegrasyonunu iyileştirme (5).

**Önemli Hususlar ve Bağımlılıklar:**

*   **Çalışan Durumu:** Entegrasyon, çalışanların birincil bileşen görevlerinin yanı sıra kapasitelerine bağlıdır. Güvenlik ve süreç görevleri genellikle işbirliği gerektirir.
*   **Darboğaz Çözümü:** Runner Service, UI ve Güvenlik üzerindeki ilerleme, en yüksek genel proje önceliği olmaya devam etmektedir. Bu temel görevler bu odağı destekler ancak yerine geçmez.
*   **CI/CD Olgunluğu:** Otomatik test ve güvenlik taramasının etkili bir şekilde uygulanması, kararlı bir CI/CD ardışık düzenine dayanır (İşçi 1, DevOps görevi).
*   **SLO'lar:** Tanımlanmış SLO'lar, performans ayarlama ve dayanıklılık çabalarına rehberlik edecektir.

**İletişim:**

*   Bu entegre görevler bir sonraki Sprint Planlama toplantısında tartışılacaktır.
*   Bireysel çalışan görev listelerinin (`workerX_todo.md` veya benzeri) bu atamaları yansıtacak şekilde güncellenmesi gerekir (bu plan üst düzey kılavuz görevi görür).

**Sonraki Adım:** Bu kararları ve üst düzey planı kullanıcıya iletin.
