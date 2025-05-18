# Proje Yöneticisi (AI) Güncellenmiş Görev Planı

Bu belge, ALT_LAS projesinin yeni kullanıcı arayüzü (UI) geliştirme planında Proje Yöneticisi (AI) personasına atanan tüm görevlerin makro, mikro ve atlas seviyesinde detaylı kırılımını içermektedir. Bu plan, önceki simülasyon çalışmasında tespit edilen eksiklikleri gidermek ve önerileri uygulamak için güncellenmiştir.

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

### Alt Görev 2: Paydaş Görüşmelerinin Planlanması ve Gerçekleştirilmesi (İyileştirilmiş)
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

    #### Makro Görev 2.3: Sanal Paydaş Görüşmelerinin Gerçekleştirilmesi (YENİ)
    *   **Sorumlu Personalar:** Proje Yöneticisi (AI), UI/UX Tasarımcısı (Elif Aydın)
    *   **Mikro Görev 2.3.1:** Sanal paydaş personalarının oluşturulması
        *   **Atlas Görevi 2.3.1.1:** Her kullanıcı grubu için detaylı sanal paydaş personalarının oluşturulması
        *   **Atlas Görevi 2.3.1.2:** Personaların gerçekçi özellikler, ihtiyaçlar ve davranışlarla donatılması
        *   **Atlas Görevi 2.3.1.3:** Personaların doğrulanması ve revize edilmesi
    *   **Mikro Görev 2.3.2:** Sanal görüşme simülasyonlarının gerçekleştirilmesi
        *   **Atlas Görevi 2.3.2.1:** Her sanal persona için görüşme senaryosunun hazırlanması
        *   **Atlas Görevi 2.3.2.2:** Görüşme sorularına personaların verebileceği yanıtların belirlenmesi
        *   **Atlas Görevi 2.3.2.3:** Simüle edilmiş görüşmelerin gerçekleştirilmesi ve kayıt altına alınması
    *   **Mikro Görev 2.3.3:** Uzaktan gerçek paydaş görüşmeleri için anket formlarının hazırlanması (YENİ)
        *   **Atlas Görevi 2.3.3.1:** Detaylı anket sorularının hazırlanması
        *   **Atlas Görevi 2.3.3.2:** Anket formlarının online platformda oluşturulması
        *   **Atlas Görevi 2.3.3.3:** Anket davetlerinin gönderilmesi ve takibi

    #### Makro Görev 2.4: Görüşme Notlarının Derlenmesi ve Yapılandırılması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 2.4.1:** Sanal görüşme notlarının derlenmesi
        *   **Atlas Görevi 2.4.1.1:** Ham notların temize çekilmesi
        *   **Atlas Görevi 2.4.1.2:** Notların kategorilere ayrılması
        *   **Atlas Görevi 2.4.1.3:** Önemli alıntıların ve bulguların işaretlenmesi
    *   **Mikro Görev 2.4.2:** Anket sonuçlarının analizi (YENİ)
        *   **Atlas Görevi 2.4.2.1:** Anket yanıtlarının toplanması ve düzenlenmesi
        *   **Atlas Görevi 2.4.2.2:** Nicel verilerin istatistiksel analizi
        *   **Atlas Görevi 2.4.2.3:** Nitel verilerin tematik analizi

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
    *   **Mikro Görev 3.2.2:** Önceliklendirilmiş gereksinimlerin sanal paydaş personalarıyla doğrulanması (İYİLEŞTİRİLMİŞ)
        *   **Atlas Görevi 3.2.2.1:** Sanal doğrulama toplantısının planlanması
        *   **Atlas Görevi 3.2.2.2:** Gereksinimlerin ve önceliklerin sunulması
        *   **Atlas Görevi 3.2.2.3:** Sanal paydaş personalarının olası geri bildirimlerinin simüle edilmesi
        *   **Atlas Görevi 3.2.2.4:** Geri bildirimlere göre gerekli revizyonların yapılması

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

### Alt Görev 3: Entegrasyon Stratejisinin ve API Kontratlarının Tanımlanması (İYİLEŞTİRİLMİŞ)
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

    #### Makro Görev 3.2: API Kontratlarının Taslak Olarak Hazırlanması (İYİLEŞTİRİLMİŞ)
    *   **Sorumlu Personalar:** Yazılım Mimarı (Elif Yılmaz), Proje Yöneticisi (AI)
    *   **Mikro Görev 3.2.1:** Gerekli API endpointlerinin listelenmesi
        *   **Atlas Görevi 3.2.1.1:** Her özellik için gerekli API endpointlerinin belirlenmesi
        *   **Atlas Görevi 3.2.1.2:** Endpoint listesinin oluşturulması (HTTP metodu, yol, amaç)
        *   **Atlas Görevi 3.2.1.3:** Endpointlerin önceliklendirilmesi
    *   **Mikro Görev 3.2.2:** Swagger/OpenAPI şemalarının oluşturulması (YENİ)
        *   **Atlas Görevi 3.2.2.1:** Swagger/OpenAPI şema yapısının tanımlanması
        *   **Atlas Görevi 3.2.2.2:** Her endpoint için şema tanımlarının oluşturulması
        *   **Atlas Görevi 3.2.2.3:** Şemaların doğrulanması ve test edilmesi
    *   **Mikro Görev 3.2.3:** Taslak API kontratlarının oluşturulması
        *   **Atlas Görevi 3.2.3.1:** Kontrat formatının belirlenmesi (OpenAPI/Swagger)
        *   **Atlas Görevi 3.2.3.2:** Her endpoint için HTTP metodu, yol, istek parametreleri ve yanıt yapısının tanımlanması
        *   **Atlas Görevi 3.2.3.3:** Veri modelleri ve şemalarının tanımlanması
        *   **Atlas Görevi 3.2.3.4:** Örnek istek ve yanıtların oluşturulması
        *   **Atlas Görevi 3.2.3.5:** Hata durumları ve kodlarının belirlenmesi

    #### Makro Görev 3.3: Mock Servislerin Geliştirilmesi (YENİ)
    *   **Sorumlu Personalar:** Proje Yöneticisi (AI), Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 3.3.1:** Mock servis altyapısının kurulması
        *   **Atlas Görevi 3.3.1.1:** Mock servis teknolojisinin seçilmesi (Mirage.js, MSW, json-server vb.)
        *   **Atlas Görevi 3.3.1.2:** Mock servis altyapısının kurulması ve konfigüre edilmesi
        *   **Atlas Görevi 3.3.1.3:** Mock servislerin CI/CD pipeline'a entegrasyonunun planlanması
    *   **Mikro Görev 3.3.2:** API kontratlarına uygun mock servislerin geliştirilmesi
        *   **Atlas Görevi 3.3.2.1:** Her endpoint için mock implementasyonların geliştirilmesi
        *   **Atlas Görevi 3.3.2.2:** Gerçekçi test verilerinin oluşturulması
        *   **Atlas Görevi 3.3.2.3:** Hata durumlarının simüle edilmesi
        *   **Atlas Görevi 3.3.2.4:** Mock servislerin test edilmesi ve doğrulanması

    #### Makro Görev 3.4: API Test Koleksiyonlarının Hazırlanması (YENİ)
    *   **Sorumlu Personalar:** Proje Yöneticisi (AI), QA Mühendisi (Ayşe Kaya)
    *   **Mikro Görev 3.4.1:** Postman veya Insomnia koleksiyonlarının oluşturulması
        *   **Atlas Görevi 3.4.1.1:** Koleksiyon yapısının tasarlanması
        *   **Atlas Görevi 3.4.1.2:** Her endpoint için test isteklerinin oluşturulması
        *   **Atlas Görevi 3.4.1.3:** Ortam değişkenlerinin (environment variables) tanımlanması
    *   **Mikro Görev 3.4.2:** API test senaryolarının geliştirilmesi
        *   **Atlas Görevi 3.4.2.1:** Başarılı senaryo testlerinin yazılması
        *   **Atlas Görevi 3.4.2.2:** Hata durumu testlerinin yazılması
        *   **Atlas Görevi 3.4.2.3:** Performans testlerinin planlanması
        *   **Atlas Görevi 3.4.2.4:** Test koleksiyonlarının dokümante edilmesi ve paylaşılması

## YUI-KM0-008: Dokümantasyon ve Eğitim Materyallerinin Hazırlanması (YENİ)

### Alt Görev 1: Kapsamlı Dokümantasyon Stratejisinin Geliştirilmesi
*   **Sorumlu Persona:** Proje Yöneticisi (AI)
*   **Tahmini Efor:** 1 gün
*   **Çıktılar:** Dokümantasyon stratejisi ve şablonları

    #### Makro Görev 1.1: Dokümantasyon İhtiyaçlarının Belirlenmesi
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 1.1.1:** Farklı kullanıcı grupları için dokümantasyon ihtiyaçlarının belirlenmesi
        *   **Atlas Görevi 1.1.1.1:** Son kullanıcılar için dokümantasyon ihtiyaçlarının belirlenmesi
        *   **Atlas Görevi 1.1.1.2:** Geliştiriciler için dokümantasyon ihtiyaçlarının belirlenmesi
        *   **Atlas Görevi 1.1.1.3:** Sistem yöneticileri için dokümantasyon ihtiyaçlarının belirlenmesi
    *   **Mikro Görev 1.1.2:** Dokümantasyon formatlarının ve dağıtım kanallarının belirlenmesi
        *   **Atlas Görevi 1.1.2.1:** Online ve offline dokümantasyon formatlarının belirlenmesi
        *   **Atlas Görevi 1.1.2.2:** Dokümantasyon dağıtım kanallarının belirlenmesi
        *   **Atlas Görevi 1.1.2.3:** Dokümantasyon güncelleştirme stratejisinin belirlenmesi

    #### Makro Görev 1.2: Dokümantasyon Şablonlarının Oluşturulması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 1.2.1:** Farklı dokümantasyon türleri için şablonların oluşturulması
        *   **Atlas Görevi 1.2.1.1:** Kullanıcı kılavuzu şablonunun oluşturulması
        *   **Atlas Görevi 1.2.1.2:** Teknik dokümantasyon şablonunun oluşturulması
        *   **Atlas Görevi 1.2.1.3:** API dokümantasyonu şablonunun oluşturulması
        *   **Atlas Görevi 1.2.1.4:** Eğitim materyalleri şablonunun oluşturulması
    *   **Mikro Görev 1.2.2:** Şablonların test edilmesi ve iyileştirilmesi
        *   **Atlas Görevi 1.2.2.1:** Şablonların örnek içerikle doldurulması
        *   **Atlas Görevi 1.2.2.2:** Şablonların kullanılabilirlik açısından değerlendirilmesi
        *   **Atlas Görevi 1.2.2.3:** Şablonların iyileştirilmesi ve son halinin verilmesi

### Alt Görev 2: Wiki ve Bilgi Tabanının Oluşturulması
*   **Sorumlu Persona:** Proje Yöneticisi (AI)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** Proje wiki'si ve bilgi tabanı

    #### Makro Görev 2.1: Wiki Altyapısının Kurulması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 2.1.1:** Wiki platformunun seçilmesi ve kurulması
        *   **Atlas Görevi 2.1.1.1:** Wiki platformu alternatiflerinin değerlendirilmesi
        *   **Atlas Görevi 2.1.1.2:** Seçilen platformun kurulması ve konfigüre edilmesi
        *   **Atlas Görevi 2.1.1.3:** Wiki erişim izinlerinin ve kullanıcı rollerinin tanımlanması
    *   **Mikro Görev 2.1.2:** Wiki yapısının ve kategorilerinin tasarlanması
        *   **Atlas Görevi 2.1.2.1:** Ana kategorilerin ve alt kategorilerin belirlenmesi
        *   **Atlas Görevi 2.1.2.2:** Sayfa şablonlarının oluşturulması
        *   **Atlas Görevi 2.1.2.3:** Navigasyon yapısının tasarlanması

    #### Makro Görev 2.2: Wiki İçeriğinin Oluşturulması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 2.2.1:** Temel wiki sayfalarının oluşturulması
        *   **Atlas Görevi 2.2.1.1:** Ana sayfa ve giriş sayfalarının oluşturulması
        *   **Atlas Görevi 2.2.1.2:** Proje genel bakış sayfalarının oluşturulması
        *   **Atlas Görevi 2.2.1.3:** Sık sorulan sorular (SSS) sayfasının oluşturulması
    *   **Mikro Görev 2.2.2:** Teknik dokümantasyon sayfalarının oluşturulması
        *   **Atlas Görevi 2.2.2.1:** Mimari dokümantasyon sayfalarının oluşturulması
        *   **Atlas Görevi 2.2.2.2:** API dokümantasyon sayfalarının oluşturulması
        *   **Atlas Görevi 2.2.2.3:** Geliştirici kılavuzu sayfalarının oluşturulması
    *   **Mikro Görev 2.2.3:** Kullanıcı dokümantasyon sayfalarının oluşturulması
        *   **Atlas Görevi 2.2.3.1:** Kullanım kılavuzu sayfalarının oluşturulması
        *   **Atlas Görevi 2.2.3.2:** Öğretici (tutorial) sayfalarının oluşturulması
        *   **Atlas Görevi 2.2.3.3:** Sorun giderme (troubleshooting) sayfalarının oluşturulması

### Alt Görev 3: Video Eğitim Materyallerinin Hazırlanması
*   **Sorumlu Personalar:** Proje Yöneticisi (AI), UI/UX Tasarımcısı (Elif Aydın)
*   **Tahmini Efor:** 3 gün
*   **Çıktılar:** Video eğitim materyalleri

    #### Makro Görev 3.1: Video Eğitim İçeriklerinin Planlanması
    *   **Sorumlu Persona:** Proje Yöneticisi (AI)
    *   **Mikro Görev 3.1.1:** Eğitim video konularının ve kapsamının belirlenmesi
        *   **Atlas Görevi 3.1.1.1:** Temel kullanım senaryoları için video konularının belirlenmesi
        *   **Atlas Görevi 3.1.1.2:** Gelişmiş özellikler için video konularının belirlenmesi
        *   **Atlas Görevi 3.1.1.3:** Sorun giderme için video konularının belirlenmesi
    *   **Mikro Görev 3.1.2:** Video senaryolarının ve scriptlerinin hazırlanması
        *   **Atlas Görevi 3.1.2.1:** Her video için detaylı senaryonun yazılması
        *   **Atlas Görevi 3.1.2.2:** Video scriptlerinin hazırlanması
        *   **Atlas Görevi 3.1.2.3:** Ekran görüntülerinin ve görsellerin hazırlanması

    #### Makro Görev 3.2: Video Eğitimlerin Oluşturulması
    *   **Sorumlu Personalar:** Proje Yöneticisi (AI), UI/UX Tasarımcısı (Elif Aydın)
    *   **Mikro Görev 3.2.1:** Ekran kaydı ve ses kaydı için teknik altyapının hazırlanması
        *   **Atlas Görevi 3.2.1.1:** Ekran kaydı yazılımının seçilmesi ve kurulması
        *   **Atlas Görevi 3.2.1.2:** Ses kaydı ekipmanının hazırlanması
        *   **Atlas Görevi 3.2.1.3:** Kayıt ortamının hazırlanması
    *   **Mikro Görev 3.2.2:** Video eğitimlerin kaydedilmesi ve düzenlenmesi
        *   **Atlas Görevi 3.2.2.1:** Ekran kayıtlarının yapılması
        *   **Atlas Görevi 3.2.2.2:** Ses kayıtlarının yapılması
        *   **Atlas Görevi 3.2.2.3:** Video düzenleme ve montaj işlemlerinin yapılması
        *   **Atlas Görevi 3.2.2.4:** Alt yazı ve açıklamaların eklenmesi
    *   **Mikro Görev 3.2.3:** Video eğitimlerin yayınlanması ve entegrasyonu
        *   **Atlas Görevi 3.2.3.1:** Video hosting platformunun seçilmesi
        *   **Atlas Görevi 3.2.3.2:** Videoların yüklenmesi ve organize edilmesi
        *   **Atlas Görevi 3.2.3.3:** Videoların wiki ve dokümantasyona entegre edilmesi
