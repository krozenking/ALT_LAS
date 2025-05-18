# Kıdemli Backend Geliştirici (Ahmet Çelik) Güncellenmiş Görev Planı

Bu belge, ALT_LAS projesinin yeni kullanıcı arayüzü (UI) geliştirme planında Kıdemli Backend Geliştirici (Ahmet Çelik) personasına atanan tüm görevlerin makro, mikro ve atlas seviyesinde detaylı kırılımını içermektedir. Bu plan, önceki simülasyon çalışmasında tespit edilen eksiklikleri gidermek ve önerileri uygulamak için güncellenmiştir.

## YUI-KM0-002: Arayüzün Genel Mimarisi ve Diğer ALT_LAS Servisleriyle Entegrasyon Noktalarının Detaylı Planlanması

### Alt Görev 3: Entegrasyon Stratejisinin ve API Kontratlarının Tanımlanması (İYİLEŞTİRİLMİŞ)
*   **Sorumlu Personalar:** Yazılım Mimarı (Elif Yılmaz), Kıdemli Backend Geliştirici (Ahmet Çelik)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** Entegrasyon Stratejisi Dokümanı, Taslak API Kontratları, API Test Koleksiyonları

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

    #### Makro Görev 3.2: API Kontratlarının Taslak Olarak Hazırlanması (İYİLEŞTİRİLMİŞ)
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 3.2.1:** Gerekli API endpointlerinin listelenmesi
        *   **Atlas Görevi 3.2.1.1:** Kullanıcı yönetimi için gerekli endpointlerin belirlenmesi
        *   **Atlas Görevi 3.2.1.2:** Chat özellikleri için gerekli endpointlerin belirlenmesi
        *   **Atlas Görevi 3.2.1.3:** Görev yönetimi için gerekli endpointlerin belirlenmesi
        *   **Atlas Görevi 3.2.1.4:** Bildirim sistemi için gerekli endpointlerin belirlenmesi
        *   **Atlas Görevi 3.2.1.5:** Dosya yönetimi için gerekli endpointlerin belirlenmesi
    *   **Mikro Görev 3.2.2:** Swagger/OpenAPI şemalarının oluşturulması (YENİ)
        *   **Atlas Görevi 3.2.2.1:** OpenAPI 3.0 şema yapısının tanımlanması
        *   **Atlas Görevi 3.2.2.2:** Her endpoint için şema tanımlarının oluşturulması
        *   **Atlas Görevi 3.2.2.3:** Veri modelleri ve şemalarının tanımlanması
        *   **Atlas Görevi 3.2.2.4:** Örnek istek ve yanıtların oluşturulması
        *   **Atlas Görevi 3.2.2.5:** Hata durumları ve kodlarının tanımlanması
    *   **Mikro Görev 3.2.3:** API dokümantasyon aracının kurulması ve konfigüre edilmesi (YENİ)
        *   **Atlas Görevi 3.2.3.1:** Swagger UI veya ReDoc gibi bir dokümantasyon aracının seçilmesi
        *   **Atlas Görevi 3.2.3.2:** Seçilen aracın kurulması ve konfigüre edilmesi
        *   **Atlas Görevi 3.2.3.3:** API şemalarının dokümantasyon aracına entegre edilmesi
        *   **Atlas Görevi 3.2.3.4:** Dokümantasyon aracının test edilmesi ve erişilebilir hale getirilmesi

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

    #### Makro Görev 3.4: API Test Koleksiyonlarının Hazırlanması (YENİ)
    *   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), QA Mühendisi (Ayşe Kaya)
    *   **Mikro Görev 3.4.1:** Postman veya Insomnia koleksiyonlarının oluşturulması
        *   **Atlas Görevi 3.4.1.1:** Koleksiyon yapısının tasarlanması
        *   **Atlas Görevi 3.4.1.2:** Her endpoint için test isteklerinin oluşturulması
        *   **Atlas Görevi 3.4.1.3:** Ortam değişkenlerinin (environment variables) tanımlanması
        *   **Atlas Görevi 3.4.1.4:** Koleksiyonların paylaşılması ve versiyon kontrolü
    *   **Mikro Görev 3.4.2:** API test senaryolarının geliştirilmesi
        *   **Atlas Görevi 3.4.2.1:** Başarılı senaryo testlerinin yazılması
        *   **Atlas Görevi 3.4.2.2:** Hata durumu testlerinin yazılması
        *   **Atlas Görevi 3.4.2.3:** Sınır değer testlerinin yazılması
        *   **Atlas Görevi 3.4.2.4:** Test koleksiyonlarının dokümante edilmesi

## YUI-KM0-010: Mock Servisler ve API Simülasyonu (YENİ)

### Alt Görev 1: Mock Servis Altyapısının Kurulması
*   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** Mock servis altyapısı, mock servis implementasyonları

    #### Makro Görev 1.1: Mock Servis Teknolojisinin Seçilmesi ve Kurulması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 1.1.1:** Mock servis teknolojilerinin değerlendirilmesi
        *   **Atlas Görevi 1.1.1.1:** Mirage.js, MSW, json-server, Prism, Mockoon gibi teknolojilerin araştırılması
        *   **Atlas Görevi 1.1.1.2:** Teknolojilerin özelliklerinin ve uyumluluklarının karşılaştırılması
        *   **Atlas Görevi 1.1.1.3:** En uygun teknolojinin seçilmesi
    *   **Mikro Görev 1.1.2:** Seçilen mock servis teknolojisinin kurulması ve konfigüre edilmesi
        *   **Atlas Görevi 1.1.2.1:** Gerekli paketlerin kurulması
        *   **Atlas Görevi 1.1.2.2:** Temel konfigürasyonun yapılması
        *   **Atlas Görevi 1.1.2.3:** Mock servis altyapısının test edilmesi

    #### Makro Görev 1.2: Mock Servis Mimarisinin Tasarlanması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 1.2.1:** Mock servis mimarisinin tasarlanması
        *   **Atlas Görevi 1.2.1.1:** Mock servislerin organizasyon yapısının belirlenmesi
        *   **Atlas Görevi 1.2.1.2:** Mock servislerin API kontratlarıyla uyumluluğunun sağlanması
        *   **Atlas Görevi 1.2.1.3:** Mock servislerin gerçek servislerle geçiş stratejisinin belirlenmesi
    *   **Mikro Görev 1.2.2:** Mock servis veri modellerinin oluşturulması
        *   **Atlas Görevi 1.2.2.1:** Veri modellerinin tanımlanması
        *   **Atlas Görevi 1.2.2.2:** Örnek verilerin oluşturulması
        *   **Atlas Görevi 1.2.2.3:** Veri ilişkilerinin tanımlanması

### Alt Görev 2: Mock Servislerin Geliştirilmesi
*   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
*   **Tahmini Efor:** 3 gün
*   **Çıktılar:** Tüm API endpointleri için mock implementasyonlar

    #### Makro Görev 2.1: Temel API Endpointleri için Mock Servislerin Geliştirilmesi
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 2.1.1:** Kullanıcı yönetimi endpointleri için mock servislerin geliştirilmesi
        *   **Atlas Görevi 2.1.1.1:** Kullanıcı kimlik doğrulama endpointlerinin mock implementasyonu
        *   **Atlas Görevi 2.1.1.2:** Kullanıcı profil yönetimi endpointlerinin mock implementasyonu
        *   **Atlas Görevi 2.1.1.3:** Kullanıcı izin yönetimi endpointlerinin mock implementasyonu
    *   **Mikro Görev 2.1.2:** Görev yönetimi endpointleri için mock servislerin geliştirilmesi
        *   **Atlas Görevi 2.1.2.1:** Görev listeleme endpointlerinin mock implementasyonu
        *   **Atlas Görevi 2.1.2.2:** Görev oluşturma ve güncelleme endpointlerinin mock implementasyonu
        *   **Atlas Görevi 2.1.2.3:** Görev atama ve takip endpointlerinin mock implementasyonu

    #### Makro Görev 2.2: İleri Düzey API Özellikleri için Mock Servislerin Geliştirilmesi
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 2.2.1:** Bildirim sistemi endpointleri için mock servislerin geliştirilmesi
        *   **Atlas Görevi 2.2.1.1:** Bildirim listeleme endpointlerinin mock implementasyonu
        *   **Atlas Görevi 2.2.1.2:** Bildirim oluşturma endpointlerinin mock implementasyonu
        *   **Atlas Görevi 2.2.1.3:** Bildirim durumu güncelleme endpointlerinin mock implementasyonu
    *   **Mikro Görev 2.2.2:** Dosya yönetimi endpointleri için mock servislerin geliştirilmesi
        *   **Atlas Görevi 2.2.2.1:** Dosya yükleme endpointlerinin mock implementasyonu
        *   **Atlas Görevi 2.2.2.2:** Dosya indirme endpointlerinin mock implementasyonu
        *   **Atlas Görevi 2.2.2.3:** Dosya listeleme ve silme endpointlerinin mock implementasyonu

    #### Makro Görev 2.3: Hata Durumları ve Edge Case'lerin Simülasyonu
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 2.3.1:** Hata durumlarının simülasyonu
        *   **Atlas Görevi 2.3.1.1:** Sunucu hatalarının (5xx) simülasyonu
        *   **Atlas Görevi 2.3.1.2:** İstemci hatalarının (4xx) simülasyonu
        *   **Atlas Görevi 2.3.1.3:** Ağ hatalarının simülasyonu
    *   **Mikro Görev 2.3.2:** Edge case'lerin simülasyonu
        *   **Atlas Görevi 2.3.2.1:** Boş veri durumlarının simülasyonu
        *   **Atlas Görevi 2.3.2.2:** Büyük veri setlerinin simülasyonu
        *   **Atlas Görevi 2.3.2.3:** Gecikme ve zaman aşımı durumlarının simülasyonu

### Alt Görev 3: Mock Servislerin Test Edilmesi ve Dokümantasyonu
*   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), QA Mühendisi (Ayşe Kaya)
*   **Tahmini Efor:** 1 gün
*   **Çıktılar:** Mock servis test raporları, mock servis dokümantasyonu

    #### Makro Görev 3.1: Mock Servislerin Test Edilmesi
    *   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), QA Mühendisi (Ayşe Kaya)
    *   **Mikro Görev 3.1.1:** Mock servislerin API kontratlarına uygunluğunun test edilmesi
        *   **Atlas Görevi 3.1.1.1:** Endpoint yapılarının kontrol edilmesi
        *   **Atlas Görevi 3.1.1.2:** İstek ve yanıt formatlarının kontrol edilmesi
        *   **Atlas Görevi 3.1.1.3:** Hata durumlarının kontrol edilmesi
    *   **Mikro Görev 3.1.2:** Mock servislerin frontend ile entegrasyonunun test edilmesi
        *   **Atlas Görevi 3.1.2.1:** Frontend bileşenleriyle entegrasyon testlerinin yapılması
        *   **Atlas Görevi 3.1.2.2:** Kullanıcı akışlarıyla entegrasyon testlerinin yapılması
        *   **Atlas Görevi 3.1.2.3:** Test sonuçlarının raporlanması

    #### Makro Görev 3.2: Mock Servislerin Dokümantasyonu
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 3.2.1:** Mock servis kullanım kılavuzunun hazırlanması
        *   **Atlas Görevi 3.2.1.1:** Mock servislerin kurulum ve konfigürasyon dokümantasyonu
        *   **Atlas Görevi 3.2.1.2:** Mock servislerin kullanım dokümantasyonu
        *   **Atlas Görevi 3.2.1.3:** Mock servislerin özelleştirme dokümantasyonu
    *   **Mikro Görev 3.2.2:** Mock servis API dokümantasyonunun hazırlanması
        *   **Atlas Görevi 3.2.2.1:** Mock API endpointlerinin dokümantasyonu
        *   **Atlas Görevi 3.2.2.2:** Mock veri modellerinin dokümantasyonu
        *   **Atlas Görevi 3.2.2.3:** Örnek kullanım senaryolarının dokümantasyonu

## YUI-KM0-011: API Güvenlik Testleri ve Optimizasyonu (YENİ)

### Alt Görev 1: API Güvenlik Testleri
*   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), QA Mühendisi (Ayşe Kaya)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** API güvenlik test planı, güvenlik test raporları

    #### Makro Görev 1.1: OWASP API Güvenlik Kontrol Listesinin Hazırlanması
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 1.1.1:** OWASP API Security Top 10 risklerinin incelenmesi
        *   **Atlas Görevi 1.1.1.1:** OWASP API Security Top 10 risklerinin araştırılması
        *   **Atlas Görevi 1.1.1.2:** Her risk için kontrol noktalarının belirlenmesi
        *   **Atlas Görevi 1.1.1.3:** Kontrol listesinin oluşturulması
    *   **Mikro Görev 1.1.2:** API güvenlik test senaryolarının hazırlanması
        *   **Atlas Görevi 1.1.2.1:** Her risk için test senaryolarının hazırlanması
        *   **Atlas Görevi 1.1.2.2:** Test senaryolarının önceliklendirilmesi
        *   **Atlas Görevi 1.1.2.3:** Test senaryolarının dokümante edilmesi

    #### Makro Görev 1.2: Güvenlik Test Araçlarının Entegrasyonu
    *   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), QA Mühendisi (Ayşe Kaya)
    *   **Mikro Görev 1.2.1:** OWASP ZAP entegrasyonu
        *   **Atlas Görevi 1.2.1.1:** OWASP ZAP'in kurulması ve konfigüre edilmesi
        *   **Atlas Görevi 1.2.1.2:** API tarama profillerinin oluşturulması
        *   **Atlas Görevi 1.2.1.3:** OWASP ZAP'in CI/CD pipeline'a entegrasyonunun planlanması
    *   **Mikro Görev 1.2.2:** Diğer güvenlik test araçlarının entegrasyonu
        *   **Atlas Görevi 1.2.2.1:** API Fuzzer araçlarının değerlendirilmesi ve entegrasyonu
        *   **Atlas Görevi 1.2.2.2:** JWT güvenlik test araçlarının değerlendirilmesi ve entegrasyonu
        *   **Atlas Görevi 1.2.2.3:** Güvenlik test araçlarının CI/CD pipeline'a entegrasyonunun planlanması

    #### Makro Görev 1.3: Güvenlik Testlerinin Gerçekleştirilmesi ve Raporlanması
    *   **Sorumlu Personalar:** Kıdemli Backend Geliştirici (Ahmet Çelik), QA Mühendisi (Ayşe Kaya)
    *   **Mikro Görev 1.3.1:** Manuel güvenlik testlerinin gerçekleştirilmesi
        *   **Atlas Görevi 1.3.1.1:** Kimlik doğrulama ve yetkilendirme testlerinin gerçekleştirilmesi
        *   **Atlas Görevi 1.3.1.2:** Veri doğrulama ve sanitizasyon testlerinin gerçekleştirilmesi
        *   **Atlas Görevi 1.3.1.3:** Oturum yönetimi testlerinin gerçekleştirilmesi
    *   **Mikro Görev 1.3.2:** Otomatik güvenlik testlerinin gerçekleştirilmesi
        *   **Atlas Görevi 1.3.2.1:** OWASP ZAP taramalarının gerçekleştirilmesi
        *   **Atlas Görevi 1.3.2.2:** API Fuzzer testlerinin gerçekleştirilmesi
        *   **Atlas Görevi 1.3.2.3:** JWT güvenlik testlerinin gerçekleştirilmesi
    *   **Mikro Görev 1.3.3:** Güvenlik test sonuçlarının analizi ve raporlanması
        *   **Atlas Görevi 1.3.3.1:** Güvenlik açıklarının analiz edilmesi ve önceliklendirilmesi
        *   **Atlas Görevi 1.3.3.2:** Güvenlik açıklarının giderilmesi için önerilerin geliştirilmesi
        *   **Atlas Görevi 1.3.3.3:** Güvenlik test raporunun hazırlanması

### Alt Görev 2: API Performans Optimizasyonu
*   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** API performans test planı, performans optimizasyon raporu

    #### Makro Görev 2.1: API Performans Metriklerinin Belirlenmesi
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 2.1.1:** Performans metriklerinin tanımlanması
        *   **Atlas Görevi 2.1.1.1:** Yanıt süresi, throughput, hata oranı gibi metriklerin tanımlanması
        *   **Atlas Görevi 2.1.1.2:** Her metrik için hedef değerlerin belirlenmesi
        *   **Atlas Görevi 2.1.1.3:** Metriklerin ölçüm metodolojisinin belirlenmesi
    *   **Mikro Görev 2.1.2:** Performans test senaryolarının hazırlanması
        *   **Atlas Görevi 2.1.2.1:** Temel yük test senaryolarının hazırlanması
        *   **Atlas Görevi 2.1.2.2:** Stres test senaryolarının hazırlanması
        *   **Atlas Görevi 2.1.2.3:** Dayanıklılık test senaryolarının hazırlanması

    #### Makro Görev 2.2: Performans Test Araçlarının Entegrasyonu
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 2.2.1:** JMeter veya k6 entegrasyonu
        *   **Atlas Görevi 2.2.1.1:** Performans test aracının kurulması ve konfigüre edilmesi
        *   **Atlas Görevi 2.2.1.2:** Test senaryolarının test aracına implementasyonu
        *   **Atlas Görevi 2.2.1.3:** Test aracının CI/CD pipeline'a entegrasyonunun planlanması
    *   **Mikro Görev 2.2.2:** Performans izleme araçlarının entegrasyonu
        *   **Atlas Görevi 2.2.2.1:** Prometheus, Grafana gibi izleme araçlarının değerlendirilmesi
        *   **Atlas Görevi 2.2.2.2:** Seçilen izleme araçlarının kurulması ve konfigüre edilmesi
        *   **Atlas Görevi 2.2.2.3:** İzleme araçlarının test ortamına entegrasyonu

    #### Makro Görev 2.3: Performans Testlerinin Gerçekleştirilmesi ve Optimizasyon
    *   **Sorumlu Persona:** Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 2.3.1:** Performans testlerinin gerçekleştirilmesi
        *   **Atlas Görevi 2.3.1.1:** Temel yük testlerinin gerçekleştirilmesi
        *   **Atlas Görevi 2.3.1.2:** Stres testlerinin gerçekleştirilmesi
        *   **Atlas Görevi 2.3.1.3:** Dayanıklılık testlerinin gerçekleştirilmesi
    *   **Mikro Görev 2.3.2:** Performans darboğazlarının tespit edilmesi ve optimizasyon
        *   **Atlas Görevi 2.3.2.1:** Performans test sonuçlarının analiz edilmesi
        *   **Atlas Görevi 2.3.2.2:** Darboğazların tespit edilmesi
        *   **Atlas Görevi 2.3.2.3:** Optimizasyon önerilerinin geliştirilmesi
        *   **Atlas Görevi 2.3.2.4:** Optimizasyonların uygulanması ve doğrulanması
    *   **Mikro Görev 2.3.3:** Performans optimizasyon raporunun hazırlanması
        *   **Atlas Görevi 2.3.3.1:** Test sonuçlarının dokümante edilmesi
        *   **Atlas Görevi 2.3.3.2:** Yapılan optimizasyonların dokümante edilmesi
        *   **Atlas Görevi 2.3.3.3:** Gelecek optimizasyon önerilerinin dokümante edilmesi
