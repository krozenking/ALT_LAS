# Proje Yöneticisi için Detaylı CUDA Görev Kırılımı ve Yönetimsel Sorumluluklar

Bu belge, Proje Yöneticisi'nin ALT_LAS projesi kapsamında, özellikle CUDA entegrasyonu ve genel proje yönetimi süreçlerindeki görevlerini hiyerarşik bir yapıda detaylandırmaktadır. Bu görevler, yeni oluşturulan "Yönetici Ofisi" yapısı ve diğer AI personalarının etkin koordinasyonunu sağlamaya odaklanmıştır.

## Ana Görev 1: Proje Planlama, Takip ve Raporlama (Yönetici Ofisi Entegrasyonu)

### Alt Görev 1.1: Detaylı Proje Planının Oluşturulması ve Güncel Tutulması
    *   **Makro Görev 1.1.1:** Tüm Personalardan Gelen Görev Kırılımlarının Entegrasyonu ve Ana Proje Planının Konsolidasyonu
        *   **Mikro Görev 1.1.1.1:** Her persona için oluşturulan detaylı görev kırılım dosyalarının (`*_detailed_cuda_tasks.md`) toplanması ve `/Planlama_Ofisi/` altındaki ana plan belgeleriyle (örn: `cuda_master_integration_plan.md`) senkronizasyonunun sağlanması.
            *   **Atlas Görevi AG-PM-PLANCONSOL-001:** Planlama dosyalarının versiyon kontrolü ve merkezi bir zaman çizelgesi oluşturulması. İlgili Modül: Yok (Belge Yönetimi). Kütüphane/Araç: Proje Yönetim Yazılımı (varsa, örn: Jira, Trello veya Markdown tabanlı takip). Bağımlılık: Tüm persona görev kırılımları. Lisans: N/A.
        *   **Mikro Görev 1.1.1.2:** Proje kilometre taşlarının, bağımlılıkların ve kritik yolun belirlenmesi.
            *   **Atlas Görevi AG-PM-CRITICALPATH-001:** Gantt şeması veya benzeri bir görselleştirme aracı ile kritik yol analizi. İlgili Modül: Yok (Analiz). Kütüphane/Araç: Proje Yönetim Yazılımı. Bağımlılık: Konsolide plan. Lisans: N/A.
    *   **Makro Görev 1.1.2:** "Yönetici Ofisi" Yapısının İşlerliğinin Sağlanması ve Takibi
        *   **Mikro Görev 1.1.2.1:** `/Yonetici_Ofisi/ofis_durumu.md` dosyasının oluşturulması ve "Koltuk Durumu" (1 adet, dolu/boş) ile "Mevcut Aktif Görev" bilgilerinin güncel tutulması için bir süreç tanımlanması.
            *   **Atlas Görevi AG-PM-OFFICESTATUS-001:** `ofis_durumu.md` için şablon oluşturma, hangi AI personanın ne zaman güncelleyeceğine dair protokol belirleme. İlgili Modül: Yok (Belge Yönetimi). Kütüphane/Araç: Yok. Bağımlılık: Yok. Lisans: N/A.
        *   **Mikro Görev 1.1.2.2:** Her persona için "Persona Gelişimi" kayıt dosyalarının (`/Yonetici_Ofisi/Persona_Ofisleri/[Persona_Adi]_Ofisi/persona_gelisimi.md`) düzenli olarak güncellenmesinin teşvik edilmesi ve takibi.
            *   **Atlas Görevi AG-PM-PERSONADEVTAKIP-001:** Haftalık veya görev bazlı hatırlatmalar, gelişim kayıtlarının gözden geçirilmesi. İlgili Modül: Yok (Koordinasyon). Kütüphane/Araç: Yok. Bağımlılık: Persona Gelişimi dosyaları. Lisans: N/A.

### Alt Görev 1.2: Risk Yönetimi ve Proaktif Sorun Çözümü
    *   **Makro Görev 1.2.1:** Potansiyel Proje Risklerinin Belirlenmesi ve Önleyici Faaliyetlerin Planlanması
        *   **Mikro Görev 1.2.1.1:** Risk matrisinin oluşturulması ve düzenli olarak güncellenmesi.
            *   **Atlas Görevi AG-PM-RISKMATRIX-001:** Teknik, operasyonel, zamanlama ve bütçe risklerinin tanımlanması, olasılık ve etki değerlendirmesi. İlgili Modül: Yok (Belge Yönetimi). Kütüphane/Araç: Yok. Bağımlılık: Proje planı. Lisans: N/A.
    *   **Makro Görev 1.2.2:** Acil Durum Görevlerinin Yönetimi ve Takibi
        *   **Mikro Görev 1.2.2.1:** `/Acil_Gorevler/` klasörüne gelen görevlerin önceliklendirilmesi ve ilgili personalara atanması.
            *   **Atlas Görevi AG-PM-URGENTTASK-001:** Acil görevler için bir triyaj ve atama süreci tanımlanması. İlgili Modül: Yok (Koordinasyon). Kütüphane/Araç: Yok. Bağımlılık: Yok. Lisans: N/A.

## Ana Görev 2: İletişim, Koordinasyon ve Paydaş Yönetimi

### Alt Görev 2.1: Ekip İçi ve Ekipler Arası Etkili İletişimin Sağlanması
    *   **Makro Görev 2.1.1:** Düzenli Proje Toplantılarının Organize Edilmesi ve Yönetilmesi
        *   **Mikro Görev 2.1.1.1:** Haftalık ilerleme toplantıları ve gerektiğinde özel konu toplantılarının planlanması, gündemlerinin hazırlanması ve toplantı notlarının tutularak `/Yonetici_Ofisi/Genel_Belgeler/Toplanti_Notlari/` altında arşivlenmesi.
            *   **Atlas Görevi AG-PM-MEETINGS-001:** Toplantı davetleri, gündem şablonu, karar ve aksiyon takibi. İlgili Modül: Yok (Organizasyon). Kütüphane/Araç: Takvim, E-posta. Bağımlılık: Yok. Lisans: N/A.
    *   **Makro Görev 2.1.2:** Dokümantasyon ve Raporlama Standartlarının Uygulanmasının Sağlanması
        *   **Mikro Görev 2.1.2.1:** Her görevin tamamlanma kriterleri arasında yer alan raporlama, dokümantasyon güncelleme ve GitHub push işlemlerinin takibi ve kalite kontrolü.
            *   **Atlas Görevi AG-PM-DOCREPORTRULES-001:** `hierarchical_task_structure_definition.md` dosyasında belirtilen tamamlama kriterlerine uyumun denetlenmesi. İlgili Modül: Yok (Denetim). Kütüphane/Araç: GitHub. Bağımlılık: Persona görev çıktıları. Lisans: N/A.

### Alt Görev 2.2: Proje İlerleyişinin Üst Yönetime ve Kullanıcıya Raporlanması
    *   **Makro Görev 2.2.1:** Periyodik İlerleme Raporlarının Hazırlanması
        *   **Mikro Görev 2.2.1.1:** Haftalık/Aylık ilerleme raporlarının derlenmesi, önemli başarıların ve karşılaşılan sorunların vurgulanması.
            *   **Atlas Görevi AG-PM-PROGRESSREPORT-001:** Rapor şablonu oluşturma, personalardan gelen bilgilerin konsolidasyonu. İlgili Modül: Yok (Belge Hazırlama). Kütüphane/Araç: Yok. Bağımlılık: Persona raporları. Lisans: N/A.

## Ana Görev 3: Kaynak Yönetimi ve Proje Arşivlerinin Düzenlenmesi

### Alt Görev 3.1: Proje Kaynaklarının (İnsan, Zaman, Araçlar) Etkin Kullanımının Sağlanması
    *   **Makro Görev 3.1.1:** Görev Atamalarının ve İş Yükü Dağılımının Optimize Edilmesi
        *   **Mikro Görev 3.1.1.1:** Personalara görev atamalarının yapılması ve iş yüklerinin dengeli bir şekilde dağıtıldığından emin olunması.
            *   **Atlas Görevi AG-PM-TASKASSIGN-001:** Persona yetkinlikleri ve mevcut iş yükleri dikkate alınarak görev dağılımı. İlgili Modül: Yok (Koordinasyon). Kütüphane/Araç: Proje Yönetim Yazılımı. Bağımlılık: Görev listesi. Lisans: N/A.

### Alt Görev 3.2: Proje Çıktılarının ve Belgelerinin Arşivlenmesi
    *   **Makro Görev 3.2.1:** `/Proje_Arsivi/` ve `/Yonetici_Ofisi/Yonetim_Arsivi/` Klasörlerinin Düzenli Tutulması
        *   **Mikro Görev 3.2.1.1:** Tamamlanan görevlere ait eski veya artık aktif olmayan dosyaların ilgili arşiv klasörlerine taşınması için bir süreç oluşturulması ve denetlenmesi.
            *   **Atlas Görevi AG-PM-ARCHIVING-001:** Arşivleme politikalarının belirlenmesi, düzenli arşivleme periyotları. İlgili Modül: Yok (Yönetim). Kütüphane/Araç: Yok. Bağımlılık: Yok. Lisans: N/A.
        *   **Mikro Görev 3.2.1.2:** Klonlanan ana proje kodunun (`/Proje_Kodu/`) ve diğer önemli proje dosyalarının düzenli olarak yedeklenmesi için DevOps Mühendisi ile koordinasyon.
            *   **Atlas Görevi AG-PM-BACKUPCOORD-001:** Yedekleme sıklığı ve yönteminin belirlenmesi. İlgili Modül: Yok (Koordinasyon). Kütüphane/Araç: Yok. Bağımlılık: DevOps Mühendisi. Lisans: N/A.

