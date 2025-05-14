# Yönetici Ofisi Kullanım Kılavuzu

Bu kılavuz, ALT_LAS projesi kapsamında geliştirilen Yönetici Ofisi özelliklerinin nasıl kullanılacağını açıklar. Amaç, AI personalarına görev atama, takip ve genel proje yönetim süreçlerini kolaylaştırmaktır.

## 1. Temel Klasör Yapısı

Yönetici Ofisi ve ilgili planlama dosyaları `/home/ubuntu/ALT_LAS_Organized/` ana dizini altında aşağıdaki gibi yapılandırılmıştır:

*   **`/home/ubuntu/ALT_LAS_Organized/Planlama_Ofisi/`**: Ana planlama belgelerini içerir.
    *   `ana_gorev_panosu.md`: Tüm görevlerin merkezi olarak takip edildiği ana pano.
    *   `hierarchical_task_structure_definition.md`: Görev hiyerarşisi, tamamlama kriterleri ve raporlama süreçlerini tanımlar.
*   **`/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/`**: Yönetimsel dosyalar ve persona ofislerini barındırır.
    *   `ofis_durumu.md`: Yönetici Ofisi'nin anlık durumunu ve önemli metrikleri gösteren panel.
    *   `Genel_Belgeler/`:
        *   `standart_gorev_atama_sablonu.md`: AI personalarına görev atamak için kullanılacak standart şablon.
        *   `license_analysis_summary.md`, `api_contracts.md` vb. genel proje dokümanları.
    *   `Persona_Ofisleri/`: Her AI persona için ayrı bir ofis.
        *   `[Persona_Adi]_Ofisi/Calisma_Dosyalari/`: Personaya özel detaylı görev tanımları.
        *   `[Persona_Adi]_Ofisi/Raporlar/`: Personanın tamamladığı görevlere ait raporlar.
        *   `[Persona_Adi]_Ofisi/persona_gelisimi.md`: Personanın gelişim ve öğrenme kayıtları.
    *   `yonetici_ofisi_gelistirme_todo.md`: Bu geliştirme sürecinin takibi için kullanılan yapılacaklar listesi.

## 2. Ana Görev Panosu (`ana_gorev_panosu.md`)

*   **Amaç:** Projedeki tüm ana ve alt görevlerin merkezi olarak listelenmesi, durumlarının, önceliklerinin, atanan personaların ve diğer önemli bilgilerin takip edilmesi.
*   **Kullanım:**
    1.  **Proje Yöneticisi (AI):** Yeni görevleri bu panoya ekler, mevcut görevlerin durumunu, önceliğini, atanan personayı, efor ve tarih bilgilerini günceller.
    2.  **AI Personaları:** Kendilerine atanan görevleri ve bu görevlerin detaylarını (Detay Linki üzerinden) buradan takip eder.
    3.  **Sütunlar:**
        *   `Görev ID`: Benzersiz görev tanımlayıcı.
        *   `Görev Adı`: Görevin kısa açıklaması.
        *   `Detay Linki`: İlgili personanın çalışma dosyasındaki detaylı görev tanımına bağlantı.
        *   `Atanan Persona`: Görevden sorumlu AI persona.
        *   `Durum`: Yapılacak, Devam Ediyor, Engellendi, Gözden Geçirilecek, Tamamlandı.
        *   `Öncelik`: P0 (Çok Acil) - P4 (Ertelenebilir).
        *   `Bağımlılıklar`: Bu görevin başlaması için tamamlanması gereken diğer görevlerin ID'leri.
        *   `Tahmini/Gerçekleşen Efor`: Görevin tamamlanması için öngörülen ve harcanan süre (gün).
        *   `Başlangıç/Bitiş Tarihi`: Görevin planlanan veya gerçekleşen tarihleri.
        *   `Notlar`: Görevle ilgili ek açıklamalar, engeller vb.
*   **Güncelleme Sıklığı:** Proje Yöneticisi tarafından sürekli güncel tutulmalıdır.

## 3. Standart Görev Atama Şablonu (`standart_gorev_atama_sablonu.md`)

*   **Amaç:** AI personalarına görev atarken tutarlı ve eksiksiz bilgi sağlamak.
*   **Kullanım:**
    1.  **Proje Yöneticisi (AI):** Yeni bir görev atayacağı zaman bu şablonu kopyalar ve göreve özel bilgilerle doldurur.
    2.  Doldurulan görev tanımı, ya `ana_gorev_panosu.md`'deki ilgili görevin "Notlar" kısmına eklenir ya da ilgili personanın `Calisma_Dosyalari/` klasörüne ayrı bir `.md` dosyası olarak kaydedilir ve panodan linklenir.
    3.  **Bölümler:**
        *   `Görev Tanım Bilgileri`: ID, ad, atanan, tarihler, öncelik, bağımlılıklar.
        *   `Görev Açıklaması ve Kapsamı`: Detaylı görev tanımı.
        *   `Gerekli Girdiler`: Görevin yapılması için gereken tüm dosyalar, veriler, parametreler ve konumları.
        *   `Beklenen Çıktılar (Teslim Edilecekler)`: Görev sonunda teslim edilmesi beklenen tüm dosyalar, raporlar, kodlar ve konumları/formatları.
        *   `Kabul Kriterleri`: Görevin tamamlanmış sayılması için karşılanması gereken şartlar.
        *   `Ek Notlar ve Talimatlar`: Diğer önemli bilgiler.

## 4. Yönetici Ofisi Durum Paneli (`ofis_durumu.md`)

*   **Amaç:** Projenin ve Yönetici Ofisi'nin anlık durumuna dair hızlı bir genel bakış sunmak.
*   **Kullanım:**
    1.  **Proje Yöneticisi (AI):** Bu paneli düzenli olarak günceller.
        *   Ofis doluluk durumu ve aktif çalışan persona bilgilerini günceller.
        *   `ana_gorev_panosu.md`'den özet metrikleri (aktif görev sayısı, engellenmiş görev sayısı vb.) bu panele taşır.
        *   Acil görevler ve en yüksek öncelikli işler hakkında bilgi verir.
        *   Proje sağlığı ve önemli kilometre taşları hakkında özet bilgi sunar.
    2.  **Tüm Ekip Üyeleri:** Projenin genel durumu hakkında hızlı bilgi almak için bu paneli kullanabilir.
*   **Bölümler:** Ofis Doluluk, Merkezi Görev Panosu Özeti, Acil Görevler, Proje Sağlığı, Hızlı Erişim Bağlantıları.

## 5. Görev Tamamlama Süreci (Genel Akış)

1.  **Görev Atama:** Proje Yöneticisi, `ana_gorev_panosu.md`'ye yeni bir görev ekler ve `standart_gorev_atama_sablonu.md` kullanarak görev detaylarını oluşturur. Görevi bir AI personasına atar.
2.  **Görev Başlangıcı:** Atanan AI persona, `ofis_durumu.md`'yi (veya Proje Yöneticisi) güncelleyerek göreve başladığını belirtir.
3.  **Görev Yürütme:** AI persona, görev tanımındaki girdileri kullanarak ve beklenen çıktıları hedefleyerek görevi yürütür.
4.  **Görev Tamamlama Kriterlerinin Yerine Getirilmesi:**
    *   **Raporlama:** Görev raporunu `/Raporlar/` klasörüne kaydeder.
    *   **Dokümantasyon:** Gerekli teknik dokümanları günceller.
    *   **GitHub Push:** Kod ve doküman değişikliklerini GitHub'a push eder.
    *   **Persona Gelişim Kaydı:** `persona_gelisimi.md` dosyasını günceller.
5.  **Durum Güncelleme:** AI persona, `ana_gorev_panosu.md`'deki görevin durumunu "Gözden Geçirilecek" olarak günceller (veya Proje Yöneticisine bildirir).
6.  **Gözden Geçirme:** Proje Yöneticisi (veya ilgili diğer persona) çıktıyı inceler.
7.  **Onay ve Kapanış:** Görev kabul edilirse, Proje Yöneticisi durumu "Tamamlandı" olarak günceller. `ofis_durumu.md` de buna göre güncellenir.

Bu kılavuz, Yönetici Ofisi'nin etkin kullanımına yardımcı olmayı amaçlamaktadır. Süreçler ve belgeler, projenin ihtiyaçlarına göre zamanla daha da geliştirilebilir.

