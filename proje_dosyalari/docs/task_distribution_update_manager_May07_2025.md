# ALT_LAS Projesi - Yeni Görev Dağılımı ve Stratejik Yönlendirmeler

**Tarih:** 07 Mayıs 2025
**Dağıtan:** Manus (Yönetici Rolünde)

Bu belge, ALT_LAS projesinin genel stratejisini güçlendirmek ve geliştirme süreçlerini iyileştirmek amacıyla belirlenen yeni görevleri ve öncelikleri ilgili işçilere atamaktadır. Lütfen aşağıdaki maddeleri dikkatlice inceleyiniz ve kendi sorumluluk alanlarınızdaki uygulamaları başlatınız.

## 1. Önceliklendirme ve Odaklanma

**Genel Strateji:** Projenin tüm bileşenlerini aynı anda geliştirmek yerine, çekirdek bileşenlere odaklanarak aşamalı bir yaklaşım benimsenecektir.

**Uygulama Adımları ve Sorumlular:**

*   **Çekirdek Servislere Odaklanma:** İlk aşamada **API Gateway (İşçi 1)**, **Segmentation Service (İşçi 2)** ve **Runner Service (İşçi 3)** ana odak noktalarımız olacaktır.
*   **Minimum İşlevsel Sürüm (MVP):** Yukarıda belirtilen her bir çekirdek servisin MVP (Minimum Viable Product) versiyonlarının tamamlanması hedeflenmelidir. İlgili işçiler (İşçi 1, İşçi 2, İşçi 3) kendi servislerinin MVP kapsamlarını belirleyip hızla tamamlamalıdır.
*   **Temel İş Akışı Önceliği:** `*.alt` dosyasının alınıp işlenerek `*.last` dosyasına dönüştürülmesini sağlayan temel iş akışı, tüm diğer geliştirmelerden önce stabil hale getirilmelidir. Bu, İşçi 2 (Segmentation) ve İşçi 3 (Runner) arasındaki koordinasyonu gerektirir.

## 2. Mikroservis Bağımsızlığının Güçlendirilmesi

**Genel Strateji:** Her mikroservisin bağımsız olarak geliştirilebilmesi, test edilebilmesi ve dağıtılabilmesi sağlanarak sistemin esnekliği ve bakım kolaylığı artırılacaktır.

**Uygulama Adımları ve Sorumlular:**

*   **Net API Sözleşmeleri:** Servisler arası iletişim için açık ve net API sözleşmeleri (OpenAPI/Swagger standartlarında) tanımlanmalıdır. Bu süreç **İşçi 1 (API Gateway Lideri)** tarafından koordine edilecek olup, **İşçi 2 (Segmentation)**, **İşçi 3 (Runner)** ve **İşçi 4 (Archive Service)** kendi servislerinin API tanımlarını sağlayacaktır.
*   **Ayrı Veritabanı/Depolama Stratejisi:** Her mikroservis için (API Gateway, Segmentation, Runner, Archive vb.) mümkün olduğunca bağımsız veritabanı veya depolama çözümleri planlanmalı ve uygulanmalıdır. İlgili servis geliştiricileri (İşçi 1, 2, 3, 4 ve diğerleri) kendi servisleri için bu stratejiyi belirleyecektir.
*   **Asenkron İletişim Kullanımı:** Servisler arası bağımlılıkları azaltmak ve sistemin dayanıklılığını artırmak için uygun noktalarda (örneğin, uzun süren işlemler, bildirimler) mesaj kuyrukları gibi asenkron iletişim mekanizmaları değerlendirilmelidir. Bu mimari karar **İşçi 1 (API Gateway Lideri)** ve **İşçi 5 (AI Orchestrator)** tarafından değerlendirilip, gerekirse ilgili servis işçileri tarafından implemente edilecektir.
*   **Bağımsız CI/CD Pipeline'ları:** Her ana mikroservis için bağımsız Sürekli Entegrasyon/Sürekli Dağıtım (CI/CD) pipeline'ları oluşturulmalıdır. Bu görev **İşçi 6 (OS Integration & DevOps)** sorumluluğundadır.

## 3. Test Stratejisinin Geliştirilmesi

**Genel Strateji:** Kapsamlı bir test stratejisi uygulanarak kod kalitesi artırılacak ve sistem güvenilirliği sağlanacaktır.

**Uygulama Adımları ve Sorumlular:**

*   **Birim Test Kapsamı:** Her servis için birim test kapsamı minimum %80 olmalıdır. Tüm işçiler (İşçi 1, 2, 3, 4, 5, 6, 7, 8) kendi geliştirdikleri modüller ve servisler için bu hedefe ulaşmaktan sorumludur.
*   **Entegrasyon Testleri:** Servisler arası etkileşimleri doğrulayan entegrasyon testleri oluşturulmalıdır. Bu testlerin planlanması ve koordinasyonu **İşçi 1 (API Gateway Lideri)** tarafından yapılacak, ilgili tüm servis geliştiricileri katkıda bulunacaktır.
*   **Uçtan Uca (E2E) Test Senaryoları:** Kullanıcı senaryolarını kapsayan E2E testler tanımlanmalı ve otomatikleştirilmelidir. Bu süreç **İşçi 7 (UI/UX Lideri)** ve **İşçi 1 (API Gateway Lideri)** tarafından yönetilecek, diğer işçiler de senaryo tanımlama ve test geliştirme süreçlerine destek olacaktır.
*   **Performans ve Yük Testleri Altyapısı:** Sistem performansını ve yük altındaki davranışını ölçmek için gerekli altyapı kurulmalı ve testler periyodik olarak çalıştırılmalıdır. Bu görev **İşçi 6 (OS Integration & DevOps)** sorumluluğundadır.

## 4. Dokümantasyon İyileştirmesi

**Genel Strateji:** Proje dokümantasyonu daha yapılandırılmış, güncel ve kapsamlı hale getirilerek geliştirici ve kullanıcı deneyimi iyileştirilecektir.

**Uygulama Adımları ve Sorumlular:**

*   **Ayrıntılı API Dokümantasyonu:** Her servis için (API Gateway, Segmentation, Runner, Archive vb.) OpenAPI/Swagger formatında ayrıntılı API dokümantasyonu oluşturulmalı ve güncel tutulmalıdır. İlgili servis geliştiricileri (İşçi 1, 2, 3, 4 ve diğerleri) kendi servislerinin dokümantasyonundan sorumludur. **İşçi 1 (API Gateway Lideri)** genel tutarlılığı sağlayacaktır.
*   **Geliştirici Kılavuzları ve Kurulum Talimatları:** Projenin genel geliştirici kılavuzları ve kurulum talimatları (`docs/developer-guide.md`, `README.md` vb.) düzenli olarak gözden geçirilmeli ve güncellenmelidir. Bu, **İşçi 1 (API Gateway Lideri)** ve **İşçi 6 (OS Integration & DevOps)** tarafından koordine edilecektir.
*   **Mimari Kararlar ve Tasarım Prensipleri:** Önemli mimari kararlar ve tasarım prensipleri belgelenmeli ve tüm ekibin erişimine açık olmalıdır. Bu dokümantasyonun oluşturulması ve güncellenmesi **İşçi 1 (API Gateway Lideri)** ve ilgili teknik liderlerin sorumluluğundadır.
*   **Örnek Kullanım Senaryoları ve Kod Örnekleri:** API'ların ve servislerin nasıl kullanılacağını gösteren pratik örnekler ve kod parçacıkları dokümantasyona eklenmelidir. Tüm işçiler kendi geliştirdikleri alanlarla ilgili örnekler sunabilir.

Bu görevlerin zamanında ve eksiksiz bir şekilde tamamlanması projenin başarısı için kritik öneme sahiptir. Lütfen sorumluluklarınızı gözden geçirin ve gerekli aksiyonları planlayın. Herhangi bir soru veya engel durumunda yöneticinize başvurunuz.

