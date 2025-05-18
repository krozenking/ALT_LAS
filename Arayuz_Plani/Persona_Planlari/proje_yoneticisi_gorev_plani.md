# Proje Yöneticisi (AI) Detaylı Görev Planı

Bu belge, ALT_LAS projesinin yeni kullanıcı arayüzü (UI) geliştirme planında Proje Yöneticisi (AI) personasına atanan tüm görevlerin makro, mikro ve atlas seviyesinde detaylı kırılımını içermektedir.

## YUI-KM0-001: Detaylı Kullanıcı İhtiyaç Analizi ve Genel Gereksinim Dokümanı

### Alt Görev 1: Mevcut Kullanıcı Geri Bildirimlerinin ve Sistem Kullanım Verilerinin Analizi
*   **Sorumlu Persona:** Proje Yöneticisi (AI)
*   **Tahmini Efor:** 1.5 gün
*   **Çıktılar:** Mevcut kullanıcı geri bildirimleri ve sistem kullanım verileri analiz raporu

    #### Makro Görev 1.1: Mevcut Kullanıcı Geri Bildirimlerinin Toplanması ve Kategorize Edilmesi
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 1.1.1:** Önceki kullanıcı anketleri, destek talepleri ve toplantı notlarından kullanıcı geri bildirimlerinin çıkarılması
        *   **Atlas Görevi 1.1.1.1:** Tüm geri bildirim kaynaklarının (e-postalar, destek talepleri, anket sonuçları) belirlenmesi ve erişim sağlanması
        *   **Atlas Görevi 1.1.1.2:** Her bir kaynaktan geri bildirimlerin çıkarılması ve standart bir formatta (tarih, kullanıcı, konu, içerik) listelenmesi
        *   **Atlas Görevi 1.1.1.3:** Geri bildirimlerin bir veri tabanına veya yapılandırılmış bir belgeye aktarılması
    *   **Mikro Görev 1.1.2:** Geri bildirimlerin kategorilere ayrılması (UI/UX sorunları, performans sorunları, özellik talepleri, vb.)
        *   **Atlas Görevi 1.1.2.1:** Kategori sisteminin oluşturulması (ana kategoriler ve alt kategoriler)
        *   **Atlas Görevi 1.1.2.2:** Her bir geri bildirimin ilgili kategorilere atanması
        *   **Atlas Görevi 1.1.2.3:** Kategori bazında geri bildirim sayılarının ve yüzdelerinin hesaplanması

    #### Makro Görev 1.2: Sistem Kullanım Verilerinin Analizi
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 1.2.1:** Mevcut sistem kullanım loglarının ve analitik verilerinin toplanması
        *   **Atlas Görevi 1.2.1.1:** Log dosyalarının ve analitik veritabanlarının belirlenmesi
        *   **Atlas Görevi 1.2.1.2:** Veri erişim izinlerinin alınması ve veri çıkarma scriptlerinin hazırlanması
        *   **Atlas Görevi 1.2.1.3:** Verilerin çıkarılması ve analiz için hazırlanması (temizleme, normalleştirme)
    *   **Mikro Görev 1.2.2:** Kullanım sıklığı, oturum süreleri, hata oranları gibi temel metriklerin hesaplanması
        *   **Atlas Görevi 1.2.2.1:** Analiz edilecek metriklerin belirlenmesi
        *   **Atlas Görevi 1.2.2.2:** Her bir metrik için hesaplama yönteminin tanımlanması
        *   **Atlas Görevi 1.2.2.3:** Metriklerin hesaplanması ve zaman içindeki değişimlerinin grafikleştirilmesi
    *   **Mikro Görev 1.2.3:** Kullanıcı davranış kalıplarının ve sorun yaşanan alanların tespit edilmesi
        *   **Atlas Görevi 1.2.3.1:** Kullanıcı yolculuğu (user journey) haritalarının çıkarılması
        *   **Atlas Görevi 1.2.3.2:** Terk etme (drop-off) noktalarının ve hata yoğunlaşmalarının belirlenmesi
        *   **Atlas Görevi 1.2.3.3:** En çok ve en az kullanılan özelliklerin listelenmesi

### Alt Görev 2: Paydaş Görüşmelerinin Planlanması ve Gerçekleştirilmesi
*   **Sorumlu Personalar:** Proje Yöneticisi (AI), UI/UX Tasarımcısı (Elif Aydın)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** Paydaş görüşme notları ve öncelikli gereksinim listesi

    #### Makro Görev 2.1: Görüşme Yapılacak Paydaşların Belirlenmesi ve Görüşme Planının Oluşturulması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 2.1.1:** Farklı kullanıcı gruplarını temsil eden kilit paydaşların belirlenmesi
        *   **Atlas Görevi 2.1.1.1:** Kullanıcı gruplarının (roller, departmanlar, kullanım sıklığı) listelenmesi
        *   **Atlas Görevi 2.1.1.2:** Her gruptan en az bir temsilci belirlenmesi
        *   **Atlas Görevi 2.1.1.3:** Üst yönetim ve karar vericilerin listeye dahil edilmesi
    *   **Mikro Görev 2.1.2:** Görüşme takviminin oluşturulması ve davetlerin gönderilmesi
        *   **Atlas Görevi 2.1.2.1:** Görüşme formatının (bireysel/grup, yüz yüze/çevrimiçi) belirlenmesi
        *   **Atlas Görevi 2.1.2.2:** Takvimin oluşturulması ve uygunlukların alınması
        *   **Atlas Görevi 2.1.2.3:** Davet e-postalarının hazırlanması ve gönderilmesi

    #### Makro Görev 2.2: Görüşme Sorularının ve Senaryolarının Hazırlanması
    *   **Sorumlu Personalar:** Proje Yöneticisi (AI), UI/UX Tasarımcısı (Elif Aydın)
    *   **Mikro Görev 2.2.1:** Yarı yapılandırılmış görüşme sorularının hazırlanması
        *   **Atlas Görevi 2.2.1.1:** Mevcut sistem deneyimi hakkında soruların hazırlanması
        *   **Atlas Görevi 2.2.1.2:** İş akışları ve görevler hakkında soruların hazırlanması
        *   **Atlas Görevi 2.2.1.3:** Beklentiler ve öncelikler hakkında soruların hazırlanması
    *   **Mikro Görev 2.2.2:** Kullanıcı senaryolarının ve görevlerinin hazırlanması
        *   **Atlas Görevi 2.2.2.1:** Tipik kullanım senaryolarının belirlenmesi
        *   **Atlas Görevi 2.2.2.2:** Her senaryo için adım adım görevlerin tanımlanması
        *   **Atlas Görevi 2.2.2.3:** Senaryoların test edilmesi ve revize edilmesi

    #### Makro Görev 2.3: Görüşmelerin Gerçekleştirilmesi ve Notların Tutulması
    *   **Sorumlu Personalar:** Proje Yöneticisi (AI) (Koordinatör), UI/UX Tasarımcısı (Elif Aydın) (Görüşmeci)
    *   **Mikro Görev 2.3.1:** Planlanan görüşmelerin gerçekleştirilmesi
        *   **Atlas Görevi 2.3.1.1:** Görüşme ortamının hazırlanması (fiziksel/sanal)
        *   **Atlas Görevi 2.3.1.2:** Görüşmelerin yürütülmesi ve kayıt altına alınması (izin dahilinde)
        *   **Atlas Görevi 2.3.1.3:** Ek soruların ve takip noktalarının not edilmesi
    *   **Mikro Görev 2.3.2:** Görüşme notlarının derlenmesi ve yapılandırılması
        *   **Atlas Görevi 2.3.2.1:** Ham notların temize çekilmesi
        *   **Atlas Görevi 2.3.2.2:** Notların kategorilere ayrılması
        *   **Atlas Görevi 2.3.2.3:** Önemli alıntıların ve bulguların işaretlenmesi

### Alt Görev 3: Gereksinim Dokümanının Hazırlanması ve Önceliklendirme
*   **Sorumlu Personalar:** Proje Yöneticisi (AI), UI/UX Tasarımcısı (Elif Aydın)
*   **Tahmini Efor:** 1.5 gün
*   **Çıktılar:** Onaylanmış Genel Gereksinim Dokümanı

    #### Makro Görev 3.1: Tüm Kaynaklardan Elde Edilen Verilerin Sentezlenmesi ve Gereksinimlerin Çıkarılması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 3.1.1:** Kullanıcı geri bildirimleri, sistem verileri ve görüşme notlarının birleştirilmesi
        *   **Atlas Görevi 3.1.1.1:** Tüm veri kaynaklarının tek bir yapıda birleştirilmesi
        *   **Atlas Görevi 3.1.1.2:** Tekrar eden temaların ve kalıpların belirlenmesi
        *   **Atlas Görevi 3.1.1.3:** Çelişen verilerin işaretlenmesi ve çözümlenmesi
    *   **Mikro Görev 3.1.2:** Fonksiyonel ve fonksiyonel olmayan gereksinimlerin listelenmesi
        *   **Atlas Görevi 3.1.2.1:** Fonksiyonel gereksinimlerin (özellikler, işlevler) çıkarılması
        *   **Atlas Görevi 3.1.2.2:** Fonksiyonel olmayan gereksinimlerin (performans, güvenlik, kullanılabilirlik) çıkarılması
        *   **Atlas Görevi 3.1.2.3:** Her gereksinimin benzersiz bir ID ile etiketlenmesi

    #### Makro Görev 3.2: Gereksinimlerin Önceliklendirilmesi ve Doğrulanması
    *   **Sorumlu Personalar:** Proje Yöneticisi (AI), UI/UX Tasarımcısı (Elif Aydın)
    *   **Mikro Görev 3.2.1:** Gereksinimlerin MoSCoW metoduna göre önceliklendirilmesi (Must have, Should have, Could have, Won't have)
        *   **Atlas Görevi 3.2.1.1:** Önceliklendirme kriterlerinin belirlenmesi (iş değeri, kullanıcı etkisi, teknik zorluk)
        *   **Atlas Görevi 3.2.1.2:** Her gereksinimin kriterlere göre değerlendirilmesi
        *   **Atlas Görevi 3.2.1.3:** MoSCoW kategorilerinin atanması
    *   **Mikro Görev 3.2.2:** Önceliklendirilmiş gereksinimlerin kilit paydaşlarla doğrulanması
        *   **Atlas Görevi 3.2.2.1:** Doğrulama toplantısının planlanması
        *   **Atlas Görevi 3.2.2.2:** Gereksinimlerin ve önceliklerin sunulması
        *   **Atlas Görevi 3.2.2.3:** Geri bildirimlerin toplanması ve gerekli revizyonların yapılması

    #### Makro Görev 3.3: Nihai Gereksinim Dokümanının Hazırlanması ve Onaya Sunulması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 3.3.1:** Gereksinim dokümanının yazılması
        *   **Atlas Görevi 3.3.1.1:** Doküman şablonunun hazırlanması
        *   **Atlas Görevi 3.3.1.2:** Giriş, kapsam, metodoloji bölümlerinin yazılması
        *   **Atlas Görevi 3.3.1.3:** Gereksinim listelerinin ve açıklamalarının eklenmesi
        *   **Atlas Görevi 3.3.1.4:** Önceliklendirme ve fazlara göre planlama bölümlerinin yazılması
    *   **Mikro Görev 3.3.2:** Dokümanın gözden geçirilmesi ve onay alınması
        *   **Atlas Görevi 3.3.2.1:** Dokümanın teknik ekip tarafından gözden geçirilmesi
        *   **Atlas Görevi 3.3.2.2:** Geri bildirimlere göre revizyonların yapılması
        *   **Atlas Görevi 3.3.2.3:** Nihai dokümanın onay için üst yönetime sunulması
        *   **Atlas Görevi 3.3.2.4:** Onaylanan dokümanın `/Arayuz_Gelistirme_Plani/Dokumanlar/Genel_Gereksinim_Dokumani_v1.0.md` olarak kaydedilmesi

## YUI-KM0-002: Arayüzün Genel Mimarisi ve Diğer ALT_LAS Servisleriyle Entegrasyon Noktalarının Detaylı Planlanması

### Alt Görev 1: Mevcut ALT_LAS Servislerinin ve Mimarisinin Analizi
*   **Sorumlu Personalar:** Proje Yöneticisi (AI), Yazılım Mimarı (Elif Yılmaz)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** Mevcut servis mimarisi analiz raporu ve entegrasyon noktaları listesi

    #### Makro Görev 1.1: Mevcut ALT_LAS Servislerinin Envanterinin Çıkarılması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 1.1.1:** Tüm mevcut servislerin ve bileşenlerin listelenmesi
        *   **Atlas Görevi 1.1.1.1:** Sistem dokümantasyonunun ve mimari diyagramların incelenmesi
        *   **Atlas Görevi 1.1.1.2:** Servis listesinin oluşturulması (ad, amaç, teknoloji yığını)
        *   **Atlas Görevi 1.1.1.3:** Servislerin kategorilere ayrılması (core, yardımcı, entegrasyon)
    *   **Mikro Görev 1.1.2:** Her servisin sorumluluklarının ve sağladığı fonksiyonların belirlenmesi
        *   **Atlas Görevi 1.1.2.1:** Servis dokümantasyonlarının incelenmesi
        *   **Atlas Görevi 1.1.2.2:** Her servisin ana fonksiyonlarının listelenmesi
        *   **Atlas Görevi 1.1.2.3:** Servisler arası bağımlılıkların haritalanması

    #### Makro Görev 1.2: Mevcut Servislerle Entegrasyon Noktalarının Belirlenmesi
    *   **Sorumlu Personalar:** Proje Yöneticisi (AI), Yazılım Mimarı (Elif Yılmaz)
    *   **Mikro Görev 1.2.1:** Yeni UI'ın ihtiyaç duyacağı veri ve işlevleri sağlayan servislerin belirlenmesi
        *   **Atlas Görevi 1.2.1.1:** Gereksinim dokümanındaki her özellik için gerekli backend servislerinin eşleştirilmesi
        *   **Atlas Görevi 1.2.1.2:** Eksik servis veya fonksiyonların işaretlenmesi
        *   **Atlas Görevi 1.2.1.3:** Servis-özellik matrisinin oluşturulması
    *   **Mikro Görev 1.2.2:** Her entegrasyon noktası için mevcut API'lerin veya entegrasyon mekanizmalarının incelenmesi
        *   **Atlas Görevi 1.2.2.1:** Mevcut API dokümantasyonlarının toplanması
        *   **Atlas Görevi 1.2.2.2:** API'lerin yeterlilik ve uygunluğunun değerlendirilmesi
        *   **Atlas Görevi 1.2.2.3:** Eksik veya güncellenmesi gereken API'lerin belirlenmesi

### Alt Görev 2: Yeni UI Mimarisinin Tasarlanması
*   **Sorumlu Personalar:** Yazılım Mimarı (Elif Yılmaz), Proje Yöneticisi (AI)
*   **Tahmini Efor:** 3 gün
*   **Çıktılar:** UI Mimari Tasarım Dokümanı

    #### Makro Görev 2.1: Mimari Yaklaşımın ve Prensiplerin Belirlenmesi
    *   **Sorumlu Persona:** Yazılım Mimarı (Elif Yılmaz)
    *   **Mikro Görev 2.1.1:** Mimari stil ve desenin seçilmesi (örn: mikro-frontend, monolitik, modüler)
        *   **Atlas Görevi 2.1.1.1:** Farklı mimari yaklaşımların avantaj ve dezavantajlarının değerlendirilmesi
        *   **Atlas Görevi 2.1.1.2:** Proje gereksinimlerine en uygun yaklaşımın seçilmesi
        *   **Atlas Görevi 2.1.1.3:** Seçimin gerekçelendirilmesi ve dokümante edilmesi
    *   **Mikro Görev 2.1.2:** Mimari prensiplerin ve kısıtlamaların tanımlanması
        *   **Atlas Görevi 2.1.2.1:** Ölçeklenebilirlik, bakım yapılabilirlik, performans gibi kalite özelliklerinin belirlenmesi
        *   **Atlas Görevi 2.1.2.2:** Teknoloji seçimlerindeki kısıtlamaların belirlenmesi
        *   **Atlas Görevi 2.1.2.3:** Güvenlik ve uyumluluk gereksinimlerinin tanımlanması

    #### Makro Görev 2.2: UI Katmanlarının ve Bileşenlerinin Tasarlanması
    *   **Sorumlu Personalar:** Yazılım Mimarı (Elif Yılmaz), Proje Yöneticisi (AI)
    *   **Mikro Görev 2.2.1:** UI katmanlarının (sunum, iş mantığı, veri erişim) tanımlanması
        *   **Atlas Görevi 2.2.1.1:** Her katmanın sorumluluklarının belirlenmesi
        *   **Atlas Görevi 2.2.1.2:** Katmanlar arası iletişim mekanizmalarının tanımlanması
        *   **Atlas Görevi 2.2.1.3:** Katman diyagramlarının oluşturulması
    *   **Mikro Görev 2.2.2:** Ana bileşenlerin ve modüllerin tanımlanması
        *   **Atlas Görevi 2.2.2.1:** Özellik bazlı modüllerin belirlenmesi
        *   **Atlas Görevi 2.2.2.2:** Ortak/paylaşılan bileşenlerin belirlenmesi
        *   **Atlas Görevi 2.2.2.3:** Bileşen diyagramlarının oluşturulması

    #### Makro Görev 2.3: Veri Akışı ve Durum Yönetiminin Tasarlanması
    *   **Sorumlu Persona:** Yazılım Mimarı (Elif Yılmaz)
    *   **Mikro Görev 2.3.1:** Veri akışı modelinin tasarlanması
        *   **Atlas Görevi 2.3.1.1:** Veri kaynakları ve hedeflerinin belirlenmesi
        *   **Atlas Görevi 2.3.1.2:** Veri akış diyagramlarının oluşturulması
        *   **Atlas Görevi 2.3.1.3:** Asenkron işlemlerin ve hata yönetiminin planlanması
    *   **Mikro Görev 2.3.2:** Durum yönetimi stratejisinin belirlenmesi
        *   **Atlas Görevi 2.3.2.1:** Durum yönetimi kütüphanesi/yaklaşımının seçilmesi
        *   **Atlas Görevi 2.3.2.2:** Global ve lokal durum ayrımının yapılması
        *   **Atlas Görevi 2.3.2.3:** Durum değişikliklerinin izlenmesi ve loglama stratejisinin belirlenmesi

### Alt Görev 3: Entegrasyon Stratejisinin ve API Kontratlarının Tanımlanması
*   **Sorumlu Personalar:** Yazılım Mimarı (Elif Yılmaz), Proje Yöneticisi (AI)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** Entegrasyon Stratejisi Dokümanı ve Taslak API Kontratları

    #### Makro Görev 3.1: Entegrasyon Stratejisinin Belirlenmesi
    *   **Sorumlu Persona:** Yazılım Mimarı (Elif Yılmaz)
    *   **Mikro Görev 3.1.1:** Entegrasyon yaklaşımının seçilmesi (REST, GraphQL, WebSocket, vb.)
        *   **Atlas Görevi 3.1.1.1:** Her entegrasyon yaklaşımının avantaj ve dezavantajlarının değerlendirilmesi
        *   **Atlas Görevi 3.1.1.2:** Gereksinimler doğrultusunda en uygun yaklaşımın seçilmesi
        *   **Atlas Görevi 3.1.1.3:** Seçimin gerekçelendirilmesi ve dokümante edilmesi
    *   **Mikro Görev 3.1.2:** Kimlik doğrulama ve yetkilendirme stratejisinin belirlenmesi
        *   **Atlas Görevi 3.1.2.1:** Mevcut kimlik doğrulama sisteminin incelenmesi
        *   **Atlas Görevi 3.1.2.2:** UI için kimlik doğrulama ve yetkilendirme mekanizmasının tasarlanması
        *   **Atlas Görevi 3.1.2.3:** Token yönetimi ve güvenlik önlemlerinin planlanması

    #### Makro Görev 3.2: API Kontratlarının Taslak Olarak Hazırlanması
    *   **Sorumlu Personalar:** Yazılım Mimarı (Elif Yılmaz), Proje Yöneticisi (AI)
    *   **Mikro Görev 3.2.1:** Gerekli API endpointlerinin listelenmesi
        *   **Atlas Görevi 3.2.1.1:** Her özellik için gerekli API endpointlerinin belirlenmesi
        *   **Atlas Görevi 3.2.1.2:** Endpoint listesinin oluşturulması (HTTP metodu, yol, amaç)
        *   **Atlas Görevi 3.2.1.3:** Endpointlerin önceliklendirilmesi
    *   **Mikro Görev 3.2.2:** Taslak API kontratlarının oluşturulması
        *   **Atlas Görevi 3.2.2.1:** Kontrat formatının belirlenmesi (OpenAPI/Swagger)
        *   **Atlas Görevi 3.2.2.2:** Örnek request/response yapılarının tanımlanması
        *   **Atlas Görevi 3.2.2.3:** Hata durumları ve kodlarının belirlenmesi

    #### Makro Görev 3.3: Entegrasyon Testleri ve Doğrulama Stratejisinin Planlanması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 3.3.1:** Entegrasyon test yaklaşımının belirlenmesi
        *   **Atlas Görevi 3.3.1.1:** Test senaryolarının ve kapsamının tanımlanması
        *   **Atlas Görevi 3.3.1.2:** Test ortamı gereksinimlerinin belirlenmesi
        *   **Atlas Görevi 3.3.1.3:** Test otomasyon stratejisinin planlanması
    *   **Mikro Görev 3.3.2:** Doğrulama ve kabul kriterleri listesinin oluşturulması
        *   **Atlas Görevi 3.3.2.1:** Entegrasyon başarı kriterlerinin tanımlanması
        *   **Atlas Görevi 3.3.2.2:** Performans ve güvenilirlik metriklerinin belirlenmesi
        *   **Atlas Görevi 3.3.2.3:** Doğrulama sürecinin ve sorumluların belirlenmesi

## YUI-KM0-008: Her Faz İçin Net Giriş/Çıkış Kriterleri ve Kilometre Taşı Onay Süreçlerinin Tanımlanması

### Alt Görev 1: Genel Faz ve Kilometre Taşı Yönetim Prensiplerinin Belirlenmesi
*   **Sorumlu Persona:** Proje Yöneticisi (AI)
*   **Tahmini Efor:** 1 gün
*   **Çıktılar:** Faz ve KM yönetim prensipleri dokümanı

    #### Makro Görev 1.1: Faz Geçişleri İçin Standart Prosedürlerin Tanımlanması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 1.1.1:** Bir fazın tamamlanması ve bir sonraki faza geçiş için gerekli olan minimum koşulların tanımlanması
        *   **Atlas Görevi 1.1.1.1:** Faz tamamlanma kriterlerinin belirlenmesi (tüm KM'lerin tamamlanması, belirli kalite metriklerinin karşılanması)
        *   **Atlas Görevi 1.1.1.2:** Faz geçişi için gerekli onay mekanizmasının tanımlanması
        *   **Atlas Görevi 1.1.1.3:** Faz geçişi için bir "Go/No-Go" karar toplantısı formatının ve katılımcılarının belirlenmesi
    *   **Mikro Görev 1.1.2:** Faz geçişi toplantılarının yapısının ve gündeminin standardize edilmesi
        *   **Atlas Görevi 1.1.2.1:** Toplantı gündem şablonunun oluşturulması
        *   **Atlas Görevi 1.1.2.2:** Toplantı katılımcılarının ve rollerinin belirlenmesi
        *   **Atlas Görevi 1.1.2.3:** Toplantı çıktılarının ve kararların dokümantasyon formatının belirlenmesi

    #### Makro Görev 1.2: Kilometre Taşı (KM) Tamamlama ve Onay Süreçlerinin Detaylandırılması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 1.2.1:** Her bir KM için sorumlu personanın/personaların ve onay verecek paydaşların netleştirilmesi
        *   **Atlas Görevi 1.2.1.1:** KM sorumluluk matrisinin oluşturulması (RACI - Responsible, Accountable, Consulted, Informed)
        *   **Atlas Görevi 1.2.1.2:** Onay yetkisi olan paydaşların belirlenmesi
        *   **Atlas Görevi 1.2.1.3:** Sorumluluk ve yetki dağılımının dokümante edilmesi
    *   **Mikro Görev 1.2.2:** KM tamamlama kanıtlarının nasıl sunulacağı ve nerede saklanacağının standartlaştırılması
        *   **Atlas Görevi 1.2.2.1:** Tamamlama kanıtları için standart format ve şablonların oluşturulması
        *   **Atlas Görevi 1.2.2.2:** Kanıtların saklanacağı merkezi depo/sistem yapısının tanımlanması
        *   **Atlas Görevi 1.2.2.3:** KM onay sürecinde kullanılacak bir kontrol listesi (checklist) şablonunun oluşturulması

### Alt Görev 2: Her Bir Tanımlı Faz ve Kilometre Taşı İçin Spesifik Giriş/Çıkış Kriterlerinin Yazılması
*   **Sorumlu Persona:** Proje Yöneticisi (AI)
*   **Tahmini Efor:** 1.5 gün
*   **Çıktılar:** Her KM için giriş/çıkış kriterlerini içeren doküman

    #### Makro Görev 2.1: Faz 0 (Genel Hazırlık, Mimari ve Tasarım Temelleri) KM'leri İçin Giriş/Çıkış Kriterlerinin Tanımlanması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 2.1.1:** YUI-KM0-001 için giriş ve çıkış kriterlerinin belirlenmesi
        *   **Atlas Görevi 2.1.1.1:** Giriş kriterlerinin tanımlanması (proje başlangıç onayı, kaynak tahsisi)
        *   **Atlas Görevi 2.1.1.2:** Çıkış kriterlerinin tanımlanması (onaylanmış gereksinim dokümanı, paydaş onayları)
        *   **Atlas Görevi 2.1.1.3:** Kriterlerin ölçülebilir ve doğrulanabilir olmasının sağlanması
    *   **Mikro Görev 2.1.2:** YUI-KM0-002 için giriş/çıkış kriterlerinin belirlenmesi
        *   **Atlas Görevi 2.1.2.1:** Giriş kriterlerinin tanımlanması (onaylanmış gereksinim dokümanı)
        *   **Atlas Görevi 2.1.2.2:** Çıkış kriterlerinin tanımlanması (onaylanmış mimari tasarım dokümanı, entegrasyon stratejisi)
        *   **Atlas Görevi 2.1.2.3:** Kriterlerin ölçülebilir ve doğrulanabilir olmasının sağlanması
    *   **Mikro Görev 2.1.3:** Diğer Faz 0 KM'leri için giriş/çıkış kriterlerinin belirlenmesi
        *   **Atlas Görevi 2.1.3.1:** YUI-KM0-003 için giriş/çıkış kriterlerinin tanımlanması
        *   **Atlas Görevi 2.1.3.2:** YUI-KM0-004 için giriş/çıkış kriterlerinin tanımlanması
        *   **Atlas Görevi 2.1.3.3:** YUI-KM0-005 için giriş/çıkış kriterlerinin tanımlanması
        *   **Atlas Görevi 2.1.3.4:** YUI-KM0-006 için giriş/çıkış kriterlerinin tanımlanması
        *   **Atlas Görevi 2.1.3.5:** YUI-KM0-007 için giriş/çıkış kriterlerinin tanımlanması
        *   **Atlas Görevi 2.1.3.6:** YUI-KM0-008 için giriş/çıkış kriterlerinin tanımlanması

    #### Makro Görev 2.2: Faz 1 (Chat Sekmesi Geliştirme ve Test) KM'leri İçin Giriş/Çıkış Kriterlerinin Tanımlanması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 2.2.1:** YUI-KM1-001 için giriş ve çıkış kriterlerinin belirlenmesi
        *   **Atlas Görevi 2.2.1.1:** Giriş kriterlerinin tanımlanması (Faz 0 tamamlanmış, onaylanmış genel tasarım)
        *   **Atlas Görevi 2.2.1.2:** Çıkış kriterlerinin tanımlanması (onaylanmış chat sekmesi detaylı tasarımı)
        *   **Atlas Görevi 2.2.1.3:** Kriterlerin ölçülebilir ve doğrulanabilir olmasının sağlanması
    *   **Mikro Görev 2.2.2:** Diğer Faz 1 KM'leri için giriş/çıkış kriterlerinin belirlenmesi
        *   **Atlas Görevi 2.2.2.1:** YUI-KM1-002 için giriş/çıkış kriterlerinin tanımlanması
        *   **Atlas Görevi 2.2.2.2:** YUI-KM1-003 için giriş/çıkış kriterlerinin tanımlanması
        *   **Atlas Görevi 2.2.2.3:** YUI-KM1-004 için giriş/çıkış kriterlerinin tanımlanması
        *   **Atlas Görevi 2.2.2.4:** YUI-KM1-005 için giriş/çıkış kriterlerinin tanımlanması
        *   **Atlas Görevi 2.2.2.5:** YUI-KM1-006 için giriş/çıkış kriterlerinin tanımlanması
        *   **Atlas Görevi 2.2.2.6:** YUI-KM1-007 için giriş/çıkış kriterlerinin tanımlanması
        *   **Atlas Görevi 2.2.2.7:** YUI-KM1-008 için giriş/çıkış kriterlerinin tanımlanması

### Alt Görev 3: Persona Oylama Süreçlerinin Faz/KM Onaylarına Entegrasyonunun Planlanması
*   **Sorumlu Persona:** Proje Yöneticisi (AI)
*   **Tahmini Efor:** 0.5 gün
*   **Çıktılar:** Oylama süreçlerinin onay mekanizmalarına nasıl dahil edileceğini açıklayan prosedür

    #### Makro Görev 3.1: Hangi KM Onaylarında Persona Oylamasının Gerekli Olabileceğinin Belirlenmesi
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 3.1.1:** Oylama gerektiren karar noktalarının belirlenmesi
        *   **Atlas Görevi 3.1.1.1:** Tasarım alternatifleri, özellik önceliklendirme revizyonları gibi konuların listelenmesi
        *   **Atlas Görevi 3.1.1.2:** Her bir KM için oylama gerektiren karar noktalarının belirlenmesi
        *   **Atlas Görevi 3.1.1.3:** Örneğin, YUI-KM1-008 (Chat Sekmesi Onayı) gibi bir KM için oylama sonucunun onay kriterlerinden biri olarak eklenmesi
    *   **Mikro Görev 3.1.2:** Oylama sürecinin detaylarının tanımlanması
        *   **Atlas Görevi 3.1.2.1:** Oy kullanacak personaların belirlenmesi
        *   **Atlas Görevi 3.1.2.2:** Oylama formatının tanımlanması (evet/hayır, puanlama, vb.)
        *   **Atlas Görevi 3.1.2.3:** Oylama sonuçlarının değerlendirilme kriterlerinin belirlenmesi

    #### Makro Görev 3.2: Oylama Sonuçlarının KM Tamamlama Kanıtlarına Nasıl Dahil Edileceğinin Tanımlanması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 3.2.1:** Oylama sonuçlarının dokümantasyon formatının belirlenmesi
        *   **Atlas Görevi 3.2.1.1:** Oylama sonuçları şablonunun oluşturulması
        *   **Atlas Görevi 3.2.1.2:** Oylama gerekçelerinin nasıl kaydedileceğinin belirlenmesi
        *   **Atlas Görevi 3.2.1.3:** Oylama sonuçlarının ve gerekçelerinin standart bir formatta dokümante edilmesi ve ilgili KM tamamlama raporlarına eklenmesi sürecinin belirlenmesi
    *   **Mikro Görev 3.2.2:** Oylama sonuçlarının arşivlenmesi ve erişim yönetiminin planlanması
        *   **Atlas Görevi 3.2.2.1:** Oylama sonuçlarının saklanacağı merkezi depo/sistem yapısının tanımlanması
        *   **Atlas Görevi 3.2.2.2:** Oylama sonuçlarına erişim yetkilerinin belirlenmesi
        *   **Atlas Görevi 3.2.2.3:** Geçmiş oylama sonuçlarının referans olarak kullanılması sürecinin tanımlanması

### Alt Görev 4: Giriş/Çıkış Kriterleri ve Onay Süreçleri Dokümantasyonunun Onaylanması
*   **Sorumlu Personalar:** Proje Yöneticisi (AI)
*   **Tahmini Efor:** Entegre bir süreç, toplamda <1 gün
*   **Çıktılar:** Onaylanmış Giriş/Çıkış Kriterleri ve KM Onay Süreçleri Dokümanı

    #### Makro Görev 4.1: Hazırlanan Dokümanın İlgili Paydaşlarla (Özellikle Teknik Liderler) Gözden Geçirilmesi
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 4.1.1:** Dokümanın gözden geçirilmesi için ilgili paydaşların belirlenmesi
        *   **Atlas Görevi 4.1.1.1:** Gözden geçirme sürecine dahil edilecek paydaşların listesinin oluşturulması
        *   **Atlas Görevi 4.1.1.2:** Gözden geçirme takviminin oluşturulması
        *   **Atlas Görevi 4.1.1.3:** Gözden geçirme davetlerinin gönderilmesi
    *   **Mikro Görev 4.1.2:** Geri bildirimlerin toplanması ve değerlendirilmesi
        *   **Atlas Görevi 4.1.2.1:** Geri bildirim toplama yönteminin belirlenmesi
        *   **Atlas Görevi 4.1.2.2:** Geri bildirimlerin konsolide edilmesi
        *   **Atlas Görevi 4.1.2.3:** Çelişen geri bildirimlerin çözümlenmesi

    #### Makro Görev 4.2: Nihai Dokümanın Onaylanması ve Kaydedilmesi
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 4.2.1:** Geri bildirimler ışığında dokümanın revize edilmesi
        *   **Atlas Görevi 4.2.1.1:** Gerekli revizyonların yapılması
        *   **Atlas Görevi 4.2.1.2:** Revizyonların ilgili paydaşlarla teyit edilmesi
        *   **Atlas Görevi 4.2.1.3:** Nihai dokümanın formatlanması ve son kontrollerinin yapılması
    *   **Mikro Görev 4.2.2:** Nihai dokümanın onay için sunulması ve kaydedilmesi
        *   **Atlas Görevi 4.2.2.1:** Onay sürecinin başlatılması
        *   **Atlas Görevi 4.2.2.2:** Onayların toplanması
        *   **Atlas Görevi 4.2.2.3:** Onaylanan dokümanın `/Arayuz_Gelistirme_Plani/Dokumanlar/KM_Giris_Cikis_Kriterleri_ve_Onay_Surecleri_v1.0.md` adıyla kaydedilmesi

## Genel Koordinasyon ve İzleme Görevleri

### Alt Görev 1: Proje İlerleme Takibi ve Raporlama
*   **Sorumlu Persona:** Proje Yöneticisi (AI)
*   **Tahmini Efor:** Sürekli (haftalık)
*   **Çıktılar:** Haftalık ilerleme raporları, güncel görev panosu

    #### Makro Görev 1.1: Görev Panosunun Güncel Tutulması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 1.1.1:** Görev durumlarının düzenli olarak güncellenmesi
        *   **Atlas Görevi 1.1.1.1:** Personalardan ilerleme bilgilerinin toplanması
        *   **Atlas Görevi 1.1.1.2:** Görev durumlarının ana görev panosuna işlenmesi
        *   **Atlas Görevi 1.1.1.3:** Engellenen görevlerin işaretlenmesi ve çözüm önerilerinin not edilmesi
    *   **Mikro Görev 1.1.2:** Yeni görevlerin eklenmesi ve görev detaylarının güncellenmesi
        *   **Atlas Görevi 1.1.2.1:** Yeni görevlerin tanımlanması ve ID atanması
        *   **Atlas Görevi 1.1.2.2:** Görev detaylarının ve bağımlılıklarının güncellenmesi
        *   **Atlas Görevi 1.1.2.3:** Görev panosunun formatının ve okunabilirliğinin korunması

    #### Makro Görev 1.2: Haftalık İlerleme Raporlarının Hazırlanması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 1.2.1:** İlerleme verilerinin toplanması ve analiz edilmesi
        *   **Atlas Görevi 1.2.1.1:** Tamamlanan görevlerin listelenmesi
        *   **Atlas Görevi 1.2.1.2:** Planlanan vs. gerçekleşen efor analizinin yapılması
        *   **Atlas Görevi 1.2.1.3:** Kritik yol üzerindeki görevlerin durumunun değerlendirilmesi
    *   **Mikro Görev 1.2.2:** İlerleme raporunun yazılması ve dağıtılması
        *   **Atlas Görevi 1.2.2.1:** Rapor şablonunun doldurulması
        *   **Atlas Görevi 1.2.2.2:** Önemli başarıların, risklerin ve engellerin vurgulanması
        *   **Atlas Görevi 1.2.2.3:** Raporun ilgili paydaşlara dağıtılması

### Alt Görev 2: Paydaş İletişimi ve Toplantı Yönetimi
*   **Sorumlu Persona:** Proje Yöneticisi (AI)
*   **Tahmini Efor:** Sürekli (haftalık)
*   **Çıktılar:** Toplantı notları, karar kayıtları

    #### Makro Görev 2.1: Düzenli Proje Toplantılarının Organizasyonu
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 2.1.1:** Haftalık durum toplantılarının planlanması ve yürütülmesi
        *   **Atlas Görevi 2.1.1.1:** Toplantı gündeminin hazırlanması
        *   **Atlas Görevi 2.1.1.2:** Toplantı davetlerinin gönderilmesi
        *   **Atlas Görevi 2.1.1.3:** Toplantının yönetilmesi ve notların tutulması
    *   **Mikro Görev 2.1.2:** Kilometre taşı değerlendirme toplantılarının organizasyonu
        *   **Atlas Görevi 2.1.2.1:** KM değerlendirme toplantısı için gerekli dokümanların hazırlanması
        *   **Atlas Görevi 2.1.2.2:** İlgili paydaşların davet edilmesi
        *   **Atlas Görevi 2.1.2.3:** Toplantının yönetilmesi ve kararların kaydedilmesi

    #### Makro Görev 2.2: Paydaş Beklentilerinin Yönetimi
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 2.2.1:** Paydaş beklentilerinin düzenli olarak gözden geçirilmesi
        *   **Atlas Görevi 2.2.1.1:** Paydaş beklentilerinin dokümante edilmesi
        *   **Atlas Görevi 2.2.1.2:** Beklentilerdeki değişikliklerin takip edilmesi
        *   **Atlas Görevi 2.2.1.3:** Beklenti-kapsam uyumunun değerlendirilmesi
    *   **Mikro Görev 2.2.2:** Paydaşlarla düzenli iletişimin sürdürülmesi
        *   **Atlas Görevi 2.2.2.1:** Kilit paydaşlarla bire bir görüşmelerin planlanması
        *   **Atlas Görevi 2.2.2.2:** Paydaş geri bildirimlerinin toplanması ve değerlendirilmesi
        *   **Atlas Görevi 2.2.2.3:** Paydaş memnuniyetinin izlenmesi

### Alt Görev 3: Risk ve Sorun Yönetimi
*   **Sorumlu Persona:** Proje Yöneticisi (AI)
*   **Tahmini Efor:** Sürekli (haftalık)
*   **Çıktılar:** Güncel risk kaydı, sorun çözüm kayıtları

    #### Makro Görev 3.1: Risk Yönetimi
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 3.1.1:** Risklerin tanımlanması ve değerlendirilmesi
        *   **Atlas Görevi 3.1.1.1:** Yeni risklerin belirlenmesi
        *   **Atlas Görevi 3.1.1.2:** Risklerin olasılık ve etki açısından değerlendirilmesi
        *   **Atlas Görevi 3.1.1.3:** Risk kaydının güncellenmesi
    *   **Mikro Görev 3.1.2:** Risk azaltma stratejilerinin geliştirilmesi ve uygulanması
        *   **Atlas Görevi 3.1.2.1:** Her risk için azaltma stratejisinin belirlenmesi
        *   **Atlas Görevi 3.1.2.2:** Risk sahiplerinin atanması
        *   **Atlas Görevi 3.1.2.3:** Risk azaltma eylemlerinin takibi

    #### Makro Görev 3.2: Sorun Yönetimi
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 3.2.1:** Sorunların kaydedilmesi ve önceliklendirilmesi
        *   **Atlas Görevi 3.2.1.1:** Sorunların tanımlanması ve dokümante edilmesi
        *   **Atlas Görevi 3.2.1.2:** Sorunların önceliklendirilmesi
        *   **Atlas Görevi 3.2.1.3:** Sorun kaydının güncellenmesi
    *   **Mikro Görev 3.2.2:** Sorunların çözümü için eylem planlarının oluşturulması
        *   **Atlas Görevi 3.2.2.1:** Her sorun için çözüm önerilerinin geliştirilmesi
        *   **Atlas Görevi 3.2.2.2:** Çözüm sahiplerinin atanması
        *   **Atlas Görevi 3.2.2.3:** Çözüm ilerlemesinin takibi ve raporlanması
