# Kıdemli Backend Geliştirici (Ahmet Çelik) Detaylı Görev Planı

Bu belge, ALT_LAS projesinin yeni kullanıcı arayüzü (UI) geliştirme planında Kıdemli Backend Geliştirici (Ahmet Çelik) personasına atanan tüm görevlerin makro, mikro ve atlas seviyesinde detaylı kırılımını içermektedir.

## YUI-KM0-002: Arayüzün Genel Mimarisi ve Diğer ALT_LAS Servisleriyle Entegrasyon Noktalarının Detaylı Planlanması

### Alt Görev 3: Entegrasyon Stratejisinin ve API Kontratlarının Tanımlanması
*   **Sorumlu Personalar:** Yazılım Mimarı (Elif Yılmaz), Kıdemli Backend Geliştirici (Ahmet Çelik)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** Entegrasyon Stratejisi Dokümanı ve Taslak API Kontratları

    #### Makro Görev 3.1: Entegrasyon Stratejisinin Belirlenmesi
    *   **Sorumlu Personalar:** Yazılım Mimarı (Elif Yılmaz), Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 3.1.1:** Entegrasyon yaklaşımının seçilmesi (REST, GraphQL, WebSocket, vb.)
        *   **Atlas Görevi 3.1.1.1:** Her entegrasyon yaklaşımının avantaj ve dezavantajlarının değerlendirilmesi
        *   **Atlas Görevi 3.1.1.2:** Mevcut ALT_LAS servisleriyle uyumluluk açısından değerlendirme yapılması
        *   **Atlas Görevi 3.1.1.3:** Performans, ölçeklenebilirlik ve bakım kolaylığı açısından değerlendirme yapılması
        *   **Atlas Görevi 3.1.1.4:** Seçilen yaklaşımın gerekçelendirilmesi ve dokümante edilmesi
    *   **Mikro Görev 3.1.2:** Kimlik doğrulama ve yetkilendirme stratejisinin belirlenmesi
        *   **Atlas Görevi 3.1.2.1:** Mevcut kimlik doğrulama sisteminin incelenmesi
        *   **Atlas Görevi 3.1.2.2:** JWT, OAuth, API Key gibi alternatiflerin değerlendirilmesi
        *   **Atlas Görevi 3.1.2.3:** Rol tabanlı erişim kontrolü (RBAC) stratejisinin tanımlanması
        *   **Atlas Görevi 3.1.2.4:** Token yönetimi, yenileme stratejisi ve güvenlik önlemlerinin planlanması

    #### Makro Görev 3.2: API Kontratlarının Taslak Olarak Hazırlanması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 3.2.1:** Gerekli API endpointlerinin listelenmesi
        *   **Atlas Görevi 3.2.1.1:** Kullanıcı yönetimi için gerekli endpointlerin belirlenmesi
        *   **Atlas Görevi 3.2.1.2:** Chat özellikleri için gerekli endpointlerin belirlenmesi
        *   **Atlas Görevi 3.2.1.3:** Görev yönetimi için gerekli endpointlerin belirlenmesi
        *   **Atlas Görevi 3.2.1.4:** Bildirim sistemi için gerekli endpointlerin belirlenmesi
        *   **Atlas Görevi 3.2.1.5:** Dosya yönetimi için gerekli endpointlerin belirlenmesi
    *   **Mikro Görev 3.2.2:** Taslak API kontratlarının oluşturulması
        *   **Atlas Görevi 3.2.2.1:** OpenAPI/Swagger formatında API şemasının oluşturulması
        *   **Atlas Görevi 3.2.2.2:** Her endpoint için HTTP metodu, yol, istek parametreleri ve yanıt yapısının tanımlanması
        *   **Atlas Görevi 3.2.2.3:** Veri modelleri ve şemalarının tanımlanması
        *   **Atlas Görevi 3.2.2.4:** Örnek istek ve yanıtların oluşturulması
        *   **Atlas Görevi 3.2.2.5:** Hata durumları ve kodlarının belirlenmesi

    #### Makro Görev 3.3: Entegrasyon Testleri ve Doğrulama Stratejisinin Planlanması
    *   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), QA Mühendisi (Ayşe Kaya)
    *   **Mikro Görev 3.3.1:** Entegrasyon test yaklaşımının belirlenmesi
        *   **Atlas Görevi 3.3.1.1:** Test senaryolarının ve kapsamının tanımlanması
        *   **Atlas Görevi 3.3.1.2:** Test ortamı gereksinimlerinin belirlenmesi
        *   **Atlas Görevi 3.3.1.3:** Mock servis stratejisinin belirlenmesi
        *   **Atlas Görevi 3.3.1.4:** Test otomasyon stratejisinin planlanması
    *   **Mikro Görev 3.3.2:** Doğrulama ve kabul kriterleri listesinin oluşturulması
        *   **Atlas Görevi 3.3.2.1:** Entegrasyon başarı kriterlerinin tanımlanması
        *   **Atlas Görevi 3.3.2.2:** Performans ve güvenilirlik metriklerinin belirlenmesi
        *   **Atlas Görevi 3.3.2.3:** Doğrulama sürecinin ve sorumluların belirlenmesi

## YUI-KM0-007: API Endpointleri, Veri Modelleri ve Kontratların Tanımlanması

### Alt Görev 1: Mevcut ALT_LAS Veri Modellerinin ve API'lerinin Analizi
*   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** Mevcut veri modelleri ve API'lerin analiz raporu

    #### Makro Görev 1.1: Mevcut Veri Modellerinin İncelenmesi ve Dokümante Edilmesi
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 1.1.1:** ALT_LAS veritabanı şemasının incelenmesi
        *   **Atlas Görevi 1.1.1.1:** Veritabanı diyagramlarının ve dokümantasyonunun incelenmesi
        *   **Atlas Görevi 1.1.1.2:** Tablo yapılarının, ilişkilerin ve kısıtlamaların analiz edilmesi
        *   **Atlas Görevi 1.1.1.3:** Veri tipleri, indeksler ve performans özelliklerinin incelenmesi
    *   **Mikro Görev 1.1.2:** Mevcut veri modellerinin yeni UI gereksinimleri açısından değerlendirilmesi
        *   **Atlas Görevi 1.1.2.1:** Kullanıcı, mesaj, grup, görev gibi temel veri modellerinin incelenmesi
        *   **Atlas Görevi 1.1.2.2:** Veri modellerinin yeni UI gereksinimleriyle uyumluluğunun değerlendirilmesi
        *   **Atlas Görevi 1.1.2.3:** Eksik veya güncellenmesi gereken veri modellerinin belirlenmesi

    #### Makro Görev 1.2: Mevcut API'lerin İncelenmesi ve Dokümante Edilmesi
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 1.2.1:** Mevcut API endpointlerinin ve fonksiyonlarının incelenmesi
        *   **Atlas Görevi 1.2.1.1:** API dokümantasyonunun incelenmesi
        *   **Atlas Görevi 1.2.1.2:** Endpoint listesinin, HTTP metodlarının ve parametrelerinin çıkarılması
        *   **Atlas Görevi 1.2.1.3:** İstek ve yanıt formatlarının analiz edilmesi
    *   **Mikro Görev 1.2.2:** Mevcut API'lerin yeni UI gereksinimleri açısından değerlendirilmesi
        *   **Atlas Görevi 1.2.2.1:** API'lerin yeni UI gereksinimleriyle uyumluluğunun değerlendirilmesi
        *   **Atlas Görevi 1.2.2.2:** Eksik veya güncellenmesi gereken API'lerin belirlenmesi
        *   **Atlas Görevi 1.2.2.3:** Performans, güvenlik ve ölçeklenebilirlik açısından değerlendirme yapılması

### Alt Görev 2: Yeni UI İçin Gerekli Veri Modellerinin Tasarlanması
*   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), Yazılım Mimarı (Elif Yılmaz)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** Yeni ve güncellenmiş veri modelleri dokümanı

    #### Makro Görev 2.1: Yeni UI Özelliklerini Destekleyecek Veri Modellerinin Tasarlanması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 2.1.1:** Chat sekmesi için gerekli veri modellerinin tasarlanması
        *   **Atlas Görevi 2.1.1.1:** Mesaj veri modelinin tasarlanması (içerik, zaman damgası, okundu bilgisi, vb.)
        *   **Atlas Görevi 2.1.1.2:** Sohbet veri modelinin tasarlanması (birebir, grup)
        *   **Atlas Görevi 2.1.1.3:** Grup veri modelinin tasarlanması (üyeler, roller, ayarlar)
        *   **Atlas Görevi 2.1.1.4:** Dosya paylaşımı veri modelinin tasarlanması
    *   **Mikro Görev 2.1.2:** Diğer UI özellikleri için gerekli veri modellerinin tasarlanması
        *   **Atlas Görevi 2.1.2.1:** Bildirim veri modelinin tasarlanması
        *   **Atlas Görevi 2.1.2.2:** Kullanıcı tercihleri veri modelinin tasarlanması
        *   **Atlas Görevi 2.1.2.3:** Arama ve filtreleme için gerekli indeks yapılarının tasarlanması

    #### Makro Görev 2.2: Mevcut Veri Modellerinde Yapılması Gereken Değişikliklerin Belirlenmesi
    *   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), Yazılım Mimarı (Elif Yılmaz)
    *   **Mikro Görev 2.2.1:** Mevcut veri modellerinde yapılması gereken güncellemelerin belirlenmesi
        *   **Atlas Görevi 2.2.1.1:** Kullanıcı veri modelinde yapılması gereken değişikliklerin belirlenmesi
        *   **Atlas Görevi 2.2.1.2:** Görev veri modelinde yapılması gereken değişikliklerin belirlenmesi
        *   **Atlas Görevi 2.2.1.3:** Diğer mevcut veri modellerinde yapılması gereken değişikliklerin belirlenmesi
    *   **Mikro Görev 2.2.2:** Veri modeli değişikliklerinin mevcut sistemle uyumluluğunun değerlendirilmesi
        *   **Atlas Görevi 2.2.2.1:** Geriye dönük uyumluluk (backward compatibility) analizinin yapılması
        *   **Atlas Görevi 2.2.2.2:** Veri migrasyon ihtiyaçlarının belirlenmesi
        *   **Atlas Görevi 2.2.2.3:** Değişikliklerin mevcut sistemdeki potansiyel etkilerinin değerlendirilmesi

### Alt Görev 3: API Kontratlarının Detaylı Olarak Tanımlanması
*   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
*   **Tahmini Efor:** 3 gün
*   **Çıktılar:** Detaylı API kontratları dokümanı (OpenAPI/Swagger formatında)

    #### Makro Görev 3.1: Yeni UI İçin Gerekli API Endpointlerinin Detaylı Olarak Tanımlanması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 3.1.1:** Chat sekmesi için gerekli API endpointlerinin tanımlanması
        *   **Atlas Görevi 3.1.1.1:** Mesaj gönderme/alma endpointlerinin tanımlanması
        *   **Atlas Görevi 3.1.1.2:** Sohbet listesi ve detayları endpointlerinin tanımlanması
        *   **Atlas Görevi 3.1.1.3:** Grup oluşturma/yönetme endpointlerinin tanımlanması
        *   **Atlas Görevi 3.1.1.4:** Dosya paylaşımı endpointlerinin tanımlanması
        *   **Atlas Görevi 3.1.1.5:** Arama ve filtreleme endpointlerinin tanımlanması
    *   **Mikro Görev 3.1.2:** Diğer UI özellikleri için gerekli API endpointlerinin tanımlanması
        *   **Atlas Görevi 3.1.2.1:** Kullanıcı yönetimi endpointlerinin tanımlanması
        *   **Atlas Görevi 3.1.2.2:** Bildirim endpointlerinin tanımlanması
        *   **Atlas Görevi 3.1.2.3:** Kullanıcı tercihleri endpointlerinin tanımlanması

    #### Makro Görev 3.2: Real-time İletişim İçin WebSocket veya SSE API'lerinin Tanımlanması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 3.2.1:** Real-time mesajlaşma için WebSocket veya SSE protokolünün tasarlanması
        *   **Atlas Görevi 3.2.1.1:** Bağlantı kurma ve yönetme protokolünün tanımlanması
        *   **Atlas Görevi 3.2.1.2:** Mesaj formatlarının ve event tiplerinin tanımlanması
        *   **Atlas Görevi 3.2.1.3:** Hata durumları ve yeniden bağlanma stratejisinin tanımlanması
    *   **Mikro Görev 3.2.2:** Diğer real-time özellikler için WebSocket veya SSE protokolünün tasarlanması
        *   **Atlas Görevi 3.2.2.1:** "Yazıyor..." bildirimleri için protokolün tanımlanması
        *   **Atlas Görevi 3.2.2.2:** Çevrimiçi durum bildirimleri için protokolün tanımlanması
        *   **Atlas Görevi 3.2.2.3:** Anlık bildirimler için protokolün tanımlanması

    #### Makro Görev 3.3: API Dokümantasyonunun Hazırlanması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 3.3.1:** OpenAPI/Swagger formatında API dokümantasyonunun hazırlanması
        *   **Atlas Görevi 3.3.1.1:** API şemasının oluşturulması
        *   **Atlas Görevi 3.3.1.2:** Endpoint açıklamalarının ve örneklerinin eklenmesi
        *   **Atlas Görevi 3.3.1.3:** Veri modelleri ve şemalarının dokümante edilmesi
        *   **Atlas Görevi 3.3.1.4:** Hata kodları ve açıklamalarının dokümante edilmesi
    *   **Mikro Görev 3.3.2:** API dokümantasyonunun interaktif olarak sunulması
        *   **Atlas Görevi 3.3.2.1:** Swagger UI veya ReDoc gibi bir araçla dokümantasyonun sunulması
        *   **Atlas Görevi 3.3.2.2:** API'lerin test edilebilmesi için örnek istek ve yanıtların eklenmesi
        *   **Atlas Görevi 3.3.2.3:** Dokümantasyonun erişilebilir bir URL'de yayınlanması

### Alt Görev 4: API Kontratlarının Gözden Geçirilmesi ve Onaylanması
*   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), Kıdemli Frontend Geliştirici (Zeynep Aydın), Yazılım Mimarı (Elif Yılmaz)
*   **Tahmini Efor:** 1 gün
*   **Çıktılar:** Onaylanmış API kontratları dokümanı

    #### Makro Görev 4.1: API Kontratlarının İlgili Paydaşlarla Gözden Geçirilmesi
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 4.1.1:** Frontend ekibiyle API kontratlarının gözden geçirilmesi
        *   **Atlas Görevi 4.1.1.1:** Gözden geçirme toplantısının planlanması
        *   **Atlas Görevi 4.1.1.2:** Frontend ekibinden geri bildirimlerin toplanması
        *   **Atlas Görevi 4.1.1.3:** Geri bildirimlere göre API kontratlarının güncellenmesi
    *   **Mikro Görev 4.1.2:** Yazılım mimarı ve diğer paydaşlarla API kontratlarının gözden geçirilmesi
        *   **Atlas Görevi 4.1.2.1:** Gözden geçirme toplantısının planlanması
        *   **Atlas Görevi 4.1.2.2:** Yazılım mimarı ve diğer paydaşlardan geri bildirimlerin toplanması
        *   **Atlas Görevi 4.1.2.3:** Geri bildirimlere göre API kontratlarının güncellenmesi

    #### Makro Görev 4.2: Nihai API Kontratlarının Onaylanması ve Yayınlanması
    *   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), Yazılım Mimarı (Elif Yılmaz)
    *   **Mikro Görev 4.2.1:** API kontratlarının son kontrollerinin yapılması
        *   **Atlas Görevi 4.2.1.1:** Tutarlılık ve tamlık kontrollerinin yapılması
        *   **Atlas Görevi 4.2.1.2:** Güvenlik ve performans açısından değerlendirme yapılması
        *   **Atlas Görevi 4.2.1.3:** Dokümantasyon kalitesinin kontrol edilmesi
    *   **Mikro Görev 4.2.2:** Nihai API kontratlarının onaylanması ve yayınlanması
        *   **Atlas Görevi 4.2.2.1:** Onay sürecinin tamamlanması
        *   **Atlas Görevi 4.2.2.2:** Onaylanan API kontratlarının `/home/ubuntu/ALT_LAS/Arayuz_Gelistirme_Plani/Dokumanlar/API_Kontratlari_v1.0.yaml` olarak kaydedilmesi
        *   **Atlas Görevi 4.2.2.3:** API dokümantasyonunun ilgili sistemlerde yayınlanması

## YUI-KM1-002: Chat Sekmesi Backend API Endpointleri ve Veri Modelleri

### Alt Görev 1: Chat Sekmesi İçin Detaylı Veri Modellerinin Oluşturulması
*   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** Chat sekmesi için detaylı veri modelleri dokümanı

    #### Makro Görev 1.1: Mesaj ve Sohbet Veri Modellerinin Detaylandırılması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 1.1.1:** Mesaj veri modelinin detaylandırılması
        *   **Atlas Görevi 1.1.1.1:** Mesaj veri modelinin tüm alanlarının (gönderen, alıcı, içerik, zaman damgası, okundu bilgisi, vb.) tanımlanması
        *   **Atlas Görevi 1.1.1.2:** Mesaj içerik tiplerinin (metin, emoji, dosya, konum, vb.) tanımlanması
        *   **Atlas Görevi 1.1.1.3:** Mesaj durumlarının (gönderildi, iletildi, okundu, vb.) tanımlanması
        *   **Atlas Görevi 1.1.1.4:** Mesaj ilişkilerinin (yanıtlanan mesaj, iletilen mesaj, vb.) tanımlanması
    *   **Mikro Görev 1.1.2:** Sohbet veri modelinin detaylandırılması
        *   **Atlas Görevi 1.1.2.1:** Birebir sohbet veri modelinin tanımlanması
        *   **Atlas Görevi 1.1.2.2:** Grup sohbeti veri modelinin tanımlanması
        *   **Atlas Görevi 1.1.2.3:** Sohbet meta verilerinin (son mesaj, okunmamış mesaj sayısı, vb.) tanımlanması
        *   **Atlas Görevi 1.1.2.4:** Sohbet ayarlarının (bildirimler, gizlilik, vb.) tanımlanması

    #### Makro Görev 1.2: Kullanıcı ve Grup Veri Modellerinin Chat Özellikleri İçin Genişletilmesi
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 1.2.1:** Kullanıcı veri modelinin chat özellikleri için genişletilmesi
        *   **Atlas Görevi 1.2.1.1:** Kullanıcı çevrimiçi durumu ve son görülme bilgisinin eklenmesi
        *   **Atlas Görevi 1.2.1.2:** Kullanıcı mesajlaşma tercihlerinin eklenmesi
        *   **Atlas Görevi 1.2.1.3:** Engellenen kullanıcılar listesinin eklenmesi
    *   **Mikro Görev 1.2.2:** Grup veri modelinin detaylandırılması
        *   **Atlas Görevi 1.2.2.1:** Grup üyeleri ve rolleri (admin, üye, vb.) yapısının tanımlanması
        *   **Atlas Görevi 1.2.2.2:** Grup ayarları ve izinlerinin tanımlanması
        *   **Atlas Görevi 1.2.2.3:** Grup meta verilerinin (oluşturulma tarihi, üye sayısı, vb.) tanımlanması

    #### Makro Görev 1.3: Dosya Paylaşımı ve Medya Veri Modellerinin Oluşturulması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 1.3.1:** Dosya ve medya veri modellerinin tanımlanması
        *   **Atlas Görevi 1.3.1.1:** Dosya meta verilerinin (ad, boyut, tip, vb.) tanımlanması
        *   **Atlas Görevi 1.3.1.2:** Görsel medya için önizleme ve boyut bilgilerinin tanımlanması
        *   **Atlas Görevi 1.3.1.3:** Dosya depolama stratejisinin (dosya sistemi, bulut depolama, vb.) belirlenmesi
    *   **Mikro Görev 1.3.2:** Dosya paylaşımı izinleri ve kısıtlamalarının tanımlanması
        *   **Atlas Görevi 1.3.2.1:** Dosya boyutu ve tip kısıtlamalarının belirlenmesi
        *   **Atlas Görevi 1.3.2.2:** Dosya paylaşımı izinlerinin tanımlanması
        *   **Atlas Görevi 1.3.2.3:** Dosya saklama politikasının (ne kadar süre saklanacağı, vb.) belirlenmesi

### Alt Görev 2: Chat Sekmesi İçin API Endpointlerinin Tasarlanması
*   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** Chat sekmesi için detaylı API endpointleri dokümanı

    #### Makro Görev 2.1: Mesajlaşma API Endpointlerinin Tasarlanması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 2.1.1:** Mesaj gönderme ve alma endpointlerinin tasarlanması
        *   **Atlas Görevi 2.1.1.1:** Mesaj gönderme endpoint'inin (POST /messages) tasarlanması
        *   **Atlas Görevi 2.1.1.2:** Mesaj listesi alma endpoint'inin (GET /conversations/{id}/messages) tasarlanması
        *   **Atlas Görevi 2.1.1.3:** Mesaj detayı alma endpoint'inin (GET /messages/{id}) tasarlanması
        *   **Atlas Görevi 2.1.1.4:** Mesaj güncelleme endpoint'inin (PUT /messages/{id}) tasarlanması
        *   **Atlas Görevi 2.1.1.5:** Mesaj silme endpoint'inin (DELETE /messages/{id}) tasarlanması
    *   **Mikro Görev 2.1.2:** Mesaj durumu ve okundu bilgisi endpointlerinin tasarlanması
        *   **Atlas Görevi 2.1.2.1:** Mesaj okundu işaretleme endpoint'inin (PUT /messages/{id}/read) tasarlanması
        *   **Atlas Görevi 2.1.2.2:** Mesaj iletildi işaretleme endpoint'inin (PUT /messages/{id}/delivered) tasarlanması
        *   **Atlas Görevi 2.1.2.3:** Toplu mesaj okundu işaretleme endpoint'inin (PUT /conversations/{id}/read) tasarlanması

    #### Makro Görev 2.2: Sohbet Yönetimi API Endpointlerinin Tasarlanması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 2.2.1:** Sohbet listesi ve detayları endpointlerinin tasarlanması
        *   **Atlas Görevi 2.2.1.1:** Sohbet listesi alma endpoint'inin (GET /conversations) tasarlanması
        *   **Atlas Görevi 2.2.1.2:** Sohbet detayı alma endpoint'inin (GET /conversations/{id}) tasarlanması
        *   **Atlas Görevi 2.2.1.3:** Yeni birebir sohbet başlatma endpoint'inin (POST /conversations) tasarlanması
        *   **Atlas Görevi 2.2.1.4:** Sohbet arşivleme/silme endpoint'inin (DELETE /conversations/{id}) tasarlanması
    *   **Mikro Görev 2.2.2:** Grup sohbeti yönetimi endpointlerinin tasarlanması
        *   **Atlas Görevi 2.2.2.1:** Grup oluşturma endpoint'inin (POST /groups) tasarlanması
        *   **Atlas Görevi 2.2.2.2:** Grup bilgilerini güncelleme endpoint'inin (PUT /groups/{id}) tasarlanması
        *   **Atlas Görevi 2.2.2.3:** Gruba üye ekleme endpoint'inin (POST /groups/{id}/members) tasarlanması
        *   **Atlas Görevi 2.2.2.4:** Gruptan üye çıkarma endpoint'inin (DELETE /groups/{id}/members/{userId}) tasarlanması
        *   **Atlas Görevi 2.2.2.5:** Grup rollerini güncelleme endpoint'inin (PUT /groups/{id}/members/{userId}/role) tasarlanması

    #### Makro Görev 2.3: Dosya Paylaşımı ve Arama API Endpointlerinin Tasarlanması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 2.3.1:** Dosya yükleme ve paylaşma endpointlerinin tasarlanması
        *   **Atlas Görevi 2.3.1.1:** Dosya yükleme endpoint'inin (POST /files) tasarlanması
        *   **Atlas Görevi 2.3.1.2:** Dosya indirme endpoint'inin (GET /files/{id}) tasarlanması
        *   **Atlas Görevi 2.3.1.3:** Dosya önizleme endpoint'inin (GET /files/{id}/preview) tasarlanması
        *   **Atlas Görevi 2.3.1.4:** Sohbetteki dosyaları listeleme endpoint'inin (GET /conversations/{id}/files) tasarlanması
    *   **Mikro Görev 2.3.2:** Arama ve filtreleme endpointlerinin tasarlanması
        *   **Atlas Görevi 2.3.2.1:** Mesaj içeriğinde arama endpoint'inin (GET /messages/search) tasarlanması
        *   **Atlas Görevi 2.3.2.2:** Kişi ve grup arama endpoint'inin (GET /users/search) tasarlanması
        *   **Atlas Görevi 2.3.2.3:** Sohbet filtreleme endpoint'inin (GET /conversations?filter=...) tasarlanması

### Alt Görev 3: Real-time İletişim Altyapısının Tasarlanması
*   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** Real-time iletişim altyapısı tasarım dokümanı

    #### Makro Görev 3.1: WebSocket veya SSE Protokolünün Tasarlanması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 3.1.1:** WebSocket veya SSE bağlantı yönetimi protokolünün tasarlanması
        *   **Atlas Görevi 3.1.1.1:** Bağlantı kurma ve kimlik doğrulama mekanizmasının tasarlanması
        *   **Atlas Görevi 3.1.1.2:** Bağlantı durumu yönetimi (heartbeat, timeout) mekanizmasının tasarlanması
        *   **Atlas Görevi 3.1.1.3:** Yeniden bağlanma stratejisinin tasarlanması
    *   **Mikro Görev 3.1.2:** Mesaj formatları ve event tiplerinin tanımlanması
        *   **Atlas Görevi 3.1.2.1:** Mesaj event formatının tanımlanması
        *   **Atlas Görevi 3.1.2.2:** Durum değişikliği event formatlarının tanımlanması
        *   **Atlas Görevi 3.1.2.3:** Hata ve sistem mesajları formatlarının tanımlanması

    #### Makro Görev 3.2: Real-time Özelliklerin Tasarlanması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 3.2.1:** Anlık mesajlaşma özelliklerinin tasarlanması
        *   **Atlas Görevi 3.2.1.1:** Yeni mesaj bildirimlerinin tasarlanması
        *   **Atlas Görevi 3.2.1.2:** Mesaj durumu güncellemelerinin (iletildi, okundu) tasarlanması
        *   **Atlas Görevi 3.2.1.3:** Mesaj düzenleme ve silme bildirimlerinin tasarlanması
    *   **Mikro Görev 3.2.2:** Diğer real-time özelliklerin tasarlanması
        *   **Atlas Görevi 3.2.2.1:** "Yazıyor..." bildirimlerinin tasarlanması
        *   **Atlas Görevi 3.2.2.2:** Çevrimiçi durum güncellemelerinin tasarlanması
        *   **Atlas Görevi 3.2.2.3:** Grup üyeliği değişikliği bildirimlerinin tasarlanması

    #### Makro Görev 3.3: Ölçeklenebilirlik ve Performans Stratejisinin Belirlenmesi
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 3.3.1:** Yüksek trafik altında ölçeklenebilirlik stratejisinin belirlenmesi
        *   **Atlas Görevi 3.3.1.1:** Yatay ölçeklendirme stratejisinin tasarlanması
        *   **Atlas Görevi 3.3.1.2:** Bağlantı havuzu ve yük dengeleme stratejisinin tasarlanması
        *   **Atlas Görevi 3.3.1.3:** Mesaj kuyruğu ve dağıtım stratejisinin tasarlanması
    *   **Mikro Görev 3.3.2:** Performans optimizasyonu stratejisinin belirlenmesi
        *   **Atlas Görevi 3.3.2.1:** Önbellek (cache) stratejisinin tasarlanması
        *   **Atlas Görevi 3.3.2.2:** Veritabanı indeksleme ve sorgu optimizasyonu stratejisinin tasarlanması
        *   **Atlas Görevi 3.3.2.3:** Mesaj paketleme ve sıkıştırma stratejisinin tasarlanması

### Alt Görev 4: Chat Sekmesi API ve Veri Modellerinin Gözden Geçirilmesi ve Onaylanması
*   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), Kıdemli Frontend Geliştirici (Zeynep Aydın), Yazılım Mimarı (Elif Yılmaz)
*   **Tahmini Efor:** 1 gün
*   **Çıktılar:** Onaylanmış Chat Sekmesi API ve Veri Modelleri Dokümanı

    #### Makro Görev 4.1: Tasarlanan API ve Veri Modellerinin İlgili Paydaşlarla Gözden Geçirilmesi
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 4.1.1:** Frontend ekibiyle API ve veri modellerinin gözden geçirilmesi
        *   **Atlas Görevi 4.1.1.1:** Gözden geçirme toplantısının planlanması
        *   **Atlas Görevi 4.1.1.2:** Frontend ekibinden geri bildirimlerin toplanması
        *   **Atlas Görevi 4.1.1.3:** Geri bildirimlere göre API ve veri modellerinin güncellenmesi
    *   **Mikro Görev 4.1.2:** Yazılım mimarı ve diğer paydaşlarla API ve veri modellerinin gözden geçirilmesi
        *   **Atlas Görevi 4.1.2.1:** Gözden geçirme toplantısının planlanması
        *   **Atlas Görevi 4.1.2.2:** Yazılım mimarı ve diğer paydaşlardan geri bildirimlerin toplanması
        *   **Atlas Görevi 4.1.2.3:** Geri bildirimlere göre API ve veri modellerinin güncellenmesi

    #### Makro Görev 4.2: Nihai API ve Veri Modellerinin Onaylanması ve Dokümante Edilmesi
    *   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), Yazılım Mimarı (Elif Yılmaz)
    *   **Mikro Görev 4.2.1:** API ve veri modellerinin son kontrollerinin yapılması
        *   **Atlas Görevi 4.2.1.1:** Tutarlılık ve tamlık kontrollerinin yapılması
        *   **Atlas Görevi 4.2.1.2:** Güvenlik ve performans açısından değerlendirme yapılması
        *   **Atlas Görevi 4.2.1.3:** Dokümantasyon kalitesinin kontrol edilmesi
    *   **Mikro Görev 4.2.2:** Nihai API ve veri modellerinin onaylanması ve dokümante edilmesi
        *   **Atlas Görevi 4.2.2.1:** Onay sürecinin tamamlanması
        *   **Atlas Görevi 4.2.2.2:** Onaylanan API ve veri modellerinin `/home/ubuntu/ALT_LAS/Arayuz_Gelistirme_Plani/Dokumanlar/Chat_Sekmesi_API_ve_Veri_Modelleri_v1.0.yaml` olarak kaydedilmesi
        *   **Atlas Görevi 4.2.2.3:** API dokümantasyonunun ilgili sistemlerde yayınlanması

## YUI-KM1-004: Chat Sekmesi Backend Entegrasyonu (Gerekiyorsa) (Yap)

### Alt Görev 1: Backend Servislerinin Geliştirilmesi
*   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
*   **Tahmini Efor:** 5 gün
*   **Çıktılar:** Geliştirilmiş ve test edilmiş backend servisleri

    #### Makro Görev 1.1: Veritabanı Şemasının Oluşturulması veya Güncellenmesi
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 1.1.1:** Tasarlanan veri modellerine göre veritabanı şemasının oluşturulması veya güncellenmesi
        *   **Atlas Görevi 1.1.1.1:** Veritabanı migration scriptlerinin yazılması
        *   **Atlas Görevi 1.1.1.2:** Tabloların, ilişkilerin ve kısıtlamaların oluşturulması
        *   **Atlas Görevi 1.1.1.3:** İndekslerin oluşturulması
        *   **Atlas Görevi 1.1.1.4:** Veritabanı şemasının test edilmesi
    *   **Mikro Görev 1.1.2:** Veri migrasyon stratejisinin uygulanması (gerekiyorsa)
        *   **Atlas Görevi 1.1.2.1:** Mevcut verilerin yeni şemaya migrasyon scriptlerinin yazılması
        *   **Atlas Görevi 1.1.2.2:** Test ortamında migrasyon testlerinin yapılması
        *   **Atlas Görevi 1.1.2.3:** Migrasyon sürecinin dokümante edilmesi

    #### Makro Görev 1.2: REST API Endpointlerinin Geliştirilmesi
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 1.2.1:** Mesajlaşma API endpointlerinin geliştirilmesi
        *   **Atlas Görevi 1.2.1.1:** Mesaj gönderme, alma, güncelleme ve silme endpointlerinin kodlanması
        *   **Atlas Görevi 1.2.1.2:** Mesaj durumu ve okundu bilgisi endpointlerinin kodlanması
        *   **Atlas Görevi 1.2.1.3:** Endpointlerin birim testlerinin yazılması
    *   **Mikro Görev 1.2.2:** Sohbet yönetimi API endpointlerinin geliştirilmesi
        *   **Atlas Görevi 1.2.2.1:** Sohbet listesi ve detayları endpointlerinin kodlanması
        *   **Atlas Görevi 1.2.2.2:** Grup sohbeti yönetimi endpointlerinin kodlanması
        *   **Atlas Görevi 1.2.2.3:** Endpointlerin birim testlerinin yazılması
    *   **Mikro Görev 1.2.3:** Dosya paylaşımı ve arama API endpointlerinin geliştirilmesi
        *   **Atlas Görevi 1.2.3.1:** Dosya yükleme, indirme ve önizleme endpointlerinin kodlanması
        *   **Atlas Görevi 1.2.3.2:** Arama ve filtreleme endpointlerinin kodlanması
        *   **Atlas Görevi 1.2.3.3:** Endpointlerin birim testlerinin yazılması

    #### Makro Görev 1.3: Real-time İletişim Altyapısının Geliştirilmesi
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 1.3.1:** WebSocket veya SSE sunucu uygulamasının geliştirilmesi
        *   **Atlas Görevi 1.3.1.1:** Bağlantı yönetimi ve kimlik doğrulama mekanizmasının kodlanması
        *   **Atlas Görevi 1.3.1.2:** Mesaj formatları ve event tiplerinin kodlanması
        *   **Atlas Görevi 1.3.1.3:** Hata yönetimi ve loglama mekanizmalarının kodlanması
    *   **Mikro Görev 1.3.2:** Real-time özelliklerin geliştirilmesi
        *   **Atlas Görevi 1.3.2.1:** Anlık mesajlaşma özelliklerinin kodlanması
        *   **Atlas Görevi 1.3.2.2:** "Yazıyor..." bildirimleri ve çevrimiçi durum güncellemelerinin kodlanması
        *   **Atlas Görevi 1.3.2.3:** Ölçeklenebilirlik ve performans optimizasyonlarının uygulanması
        *   **Atlas Görevi 1.3.2.4:** Real-time özelliklerin birim testlerinin yazılması

### Alt Görev 2: Backend Servislerinin Test Edilmesi
*   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), QA Mühendisi (Ayşe Kaya)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** Test raporları ve düzeltilmiş hatalar

    #### Makro Görev 2.1: Birim ve Entegrasyon Testlerinin Yazılması ve Çalıştırılması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 2.1.1:** REST API endpointleri için birim ve entegrasyon testlerinin yazılması
        *   **Atlas Görevi 2.1.1.1:** Her endpoint için birim testlerinin yazılması
        *   **Atlas Görevi 2.1.1.2:** Endpointler arası entegrasyon testlerinin yazılması
        *   **Atlas Görevi 2.1.1.3:** Veritabanı entegrasyon testlerinin yazılması
    *   **Mikro Görev 2.1.2:** Real-time iletişim altyapısı için birim ve entegrasyon testlerinin yazılması
        *   **Atlas Görevi 2.1.2.1:** WebSocket veya SSE sunucu uygulaması için birim testlerinin yazılması
        *   **Atlas Görevi 2.1.2.2:** Real-time özelliklerin entegrasyon testlerinin yazılması
        *   **Atlas Görevi 2.1.2.3:** Yük ve performans testlerinin yazılması

    #### Makro Görev 2.2: Manuel Testlerin Yapılması ve Hataların Düzeltilmesi
    *   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), QA Mühendisi (Ayşe Kaya)
    *   **Mikro Görev 2.2.1:** Backend servislerinin manuel olarak test edilmesi
        *   **Atlas Görevi 2.2.1.1:** API endpointlerinin Postman veya benzeri bir araçla manuel olarak test edilmesi
        *   **Atlas Görevi 2.2.1.2:** Real-time özelliklerin manuel olarak test edilmesi
        *   **Atlas Görevi 2.2.1.3:** Hata senaryolarının test edilmesi
    *   **Mikro Görev 2.2.2:** Tespit edilen hataların düzeltilmesi ve yeniden test edilmesi
        *   **Atlas Görevi 2.2.2.1:** Hataların önceliklendirilmesi
        *   **Atlas Görevi 2.2.2.2:** Hataların düzeltilmesi
        *   **Atlas Görevi 2.2.2.3:** Düzeltilen hataların yeniden test edilmesi

### Alt Görev 3: Frontend ve Backend Arasında Entegrasyonun Sağlanması ve Test Edilmesi
*   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), Kıdemli Frontend Geliştirici (Zeynep Aydın)
*   **Tahmini Efor:** 1 gün
*   **Çıktılar:** Başarıyla entegre edilmiş ve temel işlevleri çalışan Chat sekmesi

    #### Makro Görev 3.1: Frontend ve Backend Entegrasyonunun Sağlanması
    *   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 3.1.1:** API endpointlerinin frontend ile entegrasyonunun sağlanması
        *   **Atlas Görevi 3.1.1.1:** CORS ayarlarının yapılması
        *   **Atlas Görevi 3.1.1.2:** Kimlik doğrulama ve yetkilendirme mekanizmalarının entegre edilmesi
        *   **Atlas Görevi 3.1.1.3:** API yanıtlarının frontend beklentilerine uygun olduğunun doğrulanması
    *   **Mikro Görev 3.1.2:** Real-time iletişim altyapısının frontend ile entegrasyonunun sağlanması
        *   **Atlas Görevi 3.1.2.1:** WebSocket veya SSE bağlantılarının frontend ile test edilmesi
        *   **Atlas Görevi 3.1.2.2:** Real-time özelliklerin frontend ile test edilmesi
        *   **Atlas Görevi 3.1.2.3:** Bağlantı kopması ve yeniden bağlanma senaryolarının test edilmesi

    #### Makro Görev 3.2: Entegrasyon Testlerinin Yapılması ve Sorunların Giderilmesi
    *   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), Kıdemli Frontend Geliştirici (Zeynep Aydın), QA Mühendisi (Ayşe Kaya)
    *   **Mikro Görev 3.2.1:** Uçtan uca (end-to-end) testlerin yapılması
        *   **Atlas Görevi 3.2.1.1:** Temel kullanıcı senaryolarının test edilmesi
        *   **Atlas Görevi 3.2.1.2:** Hata senaryolarının test edilmesi
        *   **Atlas Görevi 3.2.1.3:** Performans ve yük testlerinin yapılması
    *   **Mikro Görev 3.2.2:** Tespit edilen entegrasyon sorunlarının giderilmesi
        *   **Atlas Görevi 3.2.2.1:** Sorunların önceliklendirilmesi
        *   **Atlas Görevi 3.2.2.2:** Sorunların giderilmesi
        *   **Atlas Görevi 3.2.2.3:** Düzeltilen sorunların yeniden test edilmesi

## YUI-KM1-006: Chat Sekmesi Birim ve Entegrasyon Testleri (Test Et)

### Alt Görev 1: Backend Birim Testlerinin Gözden Geçirilmesi ve Kapsamının Artırılması (Gerekiyorsa)
*   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), QA Mühendisi (Ayşe Kaya)
*   **Tahmini Efor:** 1 gün
*   **Çıktılar:** Güncellenmiş ve kapsamı artırılmış backend birim testleri

    #### Makro Görev 1.1: Mevcut Backend Birim Testlerinin Gözden Geçirilmesi ve Test Kapsamının Değerlendirilmesi
    *   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), QA Mühendisi (Ayşe Kaya)
    *   **Mikro Görev 1.1.1:** Mevcut birim testlerinin gözden geçirilmesi ve test kapsamının (code coverage) ölçülmesi
        *   **Atlas Görevi 1.1.1.1:** Test raporlarının incelenmesi
        *   **Atlas Görevi 1.1.1.2:** Test kapsamı raporlarının oluşturulması
        *   **Atlas Görevi 1.1.1.3:** Eksik test alanlarının belirlenmesi
    *   **Mikro Görev 1.1.2:** Test kalitesinin değerlendirilmesi
        *   **Atlas Görevi 1.1.2.1:** Testlerin etkinliğinin değerlendirilmesi
        *   **Atlas Görevi 1.1.2.2:** Testlerin bakım yapılabilirliğinin değerlendirilmesi
        *   **Atlas Görevi 1.1.2.3:** İyileştirme alanlarının belirlenmesi

    #### Makro Görev 1.2: Eksik Kalan veya İyileştirilebilecek Birim Testlerinin Yazılması/Güncellenmesi
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 1.2.1:** Eksik birim testlerinin eklenmesi
        *   **Atlas Görevi 1.2.1.1:** REST API endpointleri için eksik testlerin yazılması
        *   **Atlas Görevi 1.2.1.2:** Veri modelleri ve servis katmanı için eksik testlerin yazılması
        *   **Atlas Görevi 1.2.1.3:** Real-time iletişim altyapısı için eksik testlerin yazılması
    *   **Mikro Görev 1.2.2:** Mevcut testlerin iyileştirilmesi
        *   **Atlas Görevi 1.2.2.1:** Test kalitesinin artırılması (daha kapsamlı assertions, edge case'lerin eklenmesi)
        *   **Atlas Görevi 1.2.2.2:** Test performansının iyileştirilmesi
        *   **Atlas Görevi 1.2.2.3:** Test bakım yapılabilirliğinin artırılması (test yardımcı fonksiyonları, fixture'lar)

### Alt Görev 3: Entegrasyon Testlerinin Geliştirilmesi ve Çalıştırılması
*   **Sorumlu Personalar:** QA Mühendisi (Ayşe Kaya), Kıdemli Backend Geliştirici (Ahmet Çelik), Kıdemli Frontend Geliştirici (Zeynep Aydın)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** Geliştirilmiş ve çalıştırılmış entegrasyon testleri, test raporları

    #### Makro Görev 3.1: Backend-Frontend Entegrasyon Testlerinin Geliştirilmesi
    *   **Sorumlu Personalar:** QA Mühendisi (Ayşe Kaya), Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 3.1.1:** API entegrasyon testlerinin geliştirilmesi
        *   **Atlas Görevi 3.1.1.1:** REST API endpointleri için entegrasyon testlerinin yazılması
        *   **Atlas Görevi 3.1.1.2:** Veri akışı ve dönüşümlerinin test edilmesi
        *   **Atlas Görevi 3.1.1.3:** Hata durumlarının ve sınır koşullarının test edilmesi
    *   **Mikro Görev 3.1.2:** Real-time iletişim entegrasyon testlerinin geliştirilmesi
        *   **Atlas Görevi 3.1.2.1:** WebSocket veya SSE bağlantıları için entegrasyon testlerinin yazılması
        *   **Atlas Görevi 3.1.2.2:** Mesaj gönderme ve alma senaryolarının test edilmesi
        *   **Atlas Görevi 3.1.2.3:** Bağlantı kopması ve yeniden bağlanma senaryolarının test edilmesi

    #### Makro Görev 3.2: Entegrasyon Testlerinin Çalıştırılması ve Sonuçların Değerlendirilmesi
    *   **Sorumlu Personalar:** QA Mühendisi (Ayşe Kaya), Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 3.2.1:** Entegrasyon testlerinin çalıştırılması
        *   **Atlas Görevi 3.2.1.1:** Test ortamının hazırlanması
        *   **Atlas Görevi 3.2.1.2:** Testlerin çalıştırılması
        *   **Atlas Görevi 3.2.1.3:** Test sonuçlarının kaydedilmesi
    *   **Mikro Görev 3.2.2:** Test sonuçlarının değerlendirilmesi ve raporlanması
        *   **Atlas Görevi 3.2.2.1:** Başarısız testlerin analiz edilmesi
        *   **Atlas Görevi 3.2.2.2:** Hataların önceliklendirilmesi
        *   **Atlas Görevi 3.2.2.3:** Test raporunun hazırlanması

### Alt Görev 4: Performans ve Yük Testlerinin Yapılması
*   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), QA Mühendisi (Ayşe Kaya)
*   **Tahmini Efor:** 1 gün
*   **Çıktılar:** Performans ve yük testi raporları, optimizasyon önerileri

    #### Makro Görev 4.1: Performans ve Yük Test Senaryolarının Hazırlanması
    *   **Sorumlu Personalar:** QA Mühendisi (Ayşe Kaya), Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 4.1.1:** Performans test senaryolarının hazırlanması
        *   **Atlas Görevi 4.1.1.1:** API yanıt süresi test senaryolarının hazırlanması
        *   **Atlas Görevi 4.1.1.2:** Veritabanı sorgu performansı test senaryolarının hazırlanması
        *   **Atlas Görevi 4.1.1.3:** Real-time iletişim performansı test senaryolarının hazırlanması
    *   **Mikro Görev 4.1.2:** Yük test senaryolarının hazırlanması
        *   **Atlas Görevi 4.1.2.1:** Eşzamanlı kullanıcı yükü test senaryolarının hazırlanması
        *   **Atlas Görevi 4.1.2.2:** Yüksek mesaj trafiği test senaryolarının hazırlanması
        *   **Atlas Görevi 4.1.2.3:** Dosya yükleme/indirme yükü test senaryolarının hazırlanması

    #### Makro Görev 4.2: Performans ve Yük Testlerinin Çalıştırılması ve Sonuçların Değerlendirilmesi
    *   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), QA Mühendisi (Ayşe Kaya)
    *   **Mikro Görev 4.2.1:** Testlerin çalıştırılması
        *   **Atlas Görevi 4.2.1.1:** Test ortamının hazırlanması
        *   **Atlas Görevi 4.2.1.2:** Performans testlerinin çalıştırılması
        *   **Atlas Görevi 4.2.1.3:** Yük testlerinin çalıştırılması
    *   **Mikro Görev 4.2.2:** Test sonuçlarının değerlendirilmesi ve optimizasyon önerilerinin hazırlanması
        *   **Atlas Görevi 4.2.2.1:** Performans darboğazlarının belirlenmesi
        *   **Atlas Görevi 4.2.2.2:** Ölçeklenebilirlik sınırlarının belirlenmesi
        *   **Atlas Görevi 4.2.2.3:** Optimizasyon önerilerinin hazırlanması
        *   **Atlas Görevi 4.2.2.4:** Performans ve yük testi raporunun hazırlanması
