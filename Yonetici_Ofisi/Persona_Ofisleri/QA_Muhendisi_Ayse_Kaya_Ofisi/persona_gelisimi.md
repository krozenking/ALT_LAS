# Persona Gelişim Kaydı: QA Mühendisi - Ayşe Kaya

Bu belge, QA Mühendisi Ayşe Kaya\_nın ALT_LAS projesi süresince edindiği bilgileri, karşılaştığı zorlukları, geliştirdiği yetkinlikleri ve gelecekteki öğrenme hedeflerini kaydetmek amacıyla oluşturulmuştur.

## Tamamlanan Görevlerden Edinilen Bilgiler ve Öğrenimler

*   **Görev ID/Adı:** AG-100 Test Otomasyonu Altyapısının Kurulması
    *   **Öğrenilenler:** Modern JavaScript/TypeScript projelerinde test otomasyonu altyapısının kurulması, Vitest ve Cypress gibi test araçlarının yapılandırılması, statik analiz araçlarının entegrasyonu.
    *   **Uygulanan Yeni Teknikler/Araçlar:** Vitest (Jest uyumlu test çerçevesi), Cypress (E2E test aracı), ESLint ve TypeScript ile statik analiz, Husky ve lint-staged ile commit öncesi kontroller.
    *   **İyi Giden Yönler:** Test araçlarının modüler yapılandırılması, farklı test türleri (birim, entegrasyon, E2E) için ayrı yapılandırmaların oluşturulması, test çalıştırma scriptlerinin hazırlanması.

*   **Görev ID/Adı:** AG-101 Test Otomasyonu için Docker ve Kubernetes Entegrasyonu
    *   **Öğrenilenler:** Test ortamlarının Docker ve Kubernetes ile izole edilmesi, test sonuçlarının ve kapsam raporlarının kalıcı olarak saklanması, CI/CD süreçlerine entegrasyon.
    *   **Uygulanan Yeni Teknikler/Araçlar:** Docker, Docker Compose, Kubernetes Job ve CronJob, PowerShell ve Bash scriptleri.
    *   **İyi Giden Yönler:** Farklı işletim sistemleri için script desteği, test ortamlarının izolasyonu, test sonuçlarının ve kapsam raporlarının saklanması.

*   **Görev ID/Adı:** AG-102 Örnek Test Senaryolarının Oluşturulması
    *   **Öğrenilenler:** Farklı test türleri için etkili test senaryolarının tasarlanması, mock nesnelerin oluşturulması, asenkron işlemlerin test edilmesi.
    *   **Uygulanan Yeni Teknikler/Araçlar:** Vitest mock fonksiyonları, Cypress komutları, React Testing Library.
    *   **İyi Giden Yönler:** Kapsamlı test senaryolarının oluşturulması, test edilebilirliği artırmak için bileşenlere data-testid özniteliklerinin eklenmesi, farklı test türleri için örnek senaryoların hazırlanması.

## Karşılaşılan Zorluklar ve Çözüm Yolları

*   **Zorluk Tanımı:** Vitest ve Cypress gibi modern test araçlarının bağımlılık çakışmaları
    *   **Etkileri:** Test altyapısının kurulması sırasında paket bağımlılıklarında çakışmalar yaşandı, bu da test araçlarının düzgün çalışmasını engelledi.
    *   **Uygulanan Çözüm Yöntemi:** `--legacy-peer-deps` bayrağı kullanılarak npm paket yöneticisinin bağımlılık çakışmalarını görmezden gelmesi sağlandı. Ayrıca, Docker konteynerlerinde izole test ortamları oluşturularak bağımlılık sorunları en aza indirildi.
    *   **Alınan Dersler:** Modern JavaScript/TypeScript ekosisteminde bağımlılık yönetimi karmaşık olabilir. Projenin başında bağımlılık yönetimi stratejisi belirlenmeli ve düzenli olarak güncellenmelidir.

*   **Zorluk Tanımı:** Chakra UI bileşenlerinin test edilmesi
    *   **Etkileri:** Chakra UI bileşenleri, özel stil ve davranışlar içerdiği için standart test yaklaşımlarıyla test edilmesi zordu.
    *   **Uygulanan Çözüm Yöntemi:** Bileşenlere `data-testid` öznitelikleri eklenerek test edilebilirlik artırıldı. Ayrıca, Cypress için özel bir `mountWithChakra` komutu oluşturularak Chakra UI bileşenlerinin doğru şekilde test edilmesi sağlandı.
    *   **Alınan Dersler:** UI kütüphaneleri kullanırken, test edilebilirliği baştan düşünmek ve bileşenlere uygun test öznitelikleri eklemek önemlidir.

## Geliştirilen Yetkinlikler

*   **Teknik Yetkinlikler:**
    *   Modern JavaScript/TypeScript test araçlarının (Vitest, Cypress) yapılandırılması ve kullanımı
    *   Docker ve Kubernetes ile test ortamlarının izolasyonu ve ölçeklendirilmesi
    *   Mock nesnelerin oluşturulması ve asenkron işlemlerin test edilmesi
*   **Metodolojik Yetkinlikler:**
    *   Test piramidi yaklaşımı (birim, entegrasyon, E2E testleri) uygulama
    *   Test edilebilirliği artırmak için kod tasarımı ve refaktörleme
    *   Test otomasyonu stratejisi geliştirme ve uygulama
*   **Araç Kullanım Yetkinlikleri:**
    *   Vitest, Cypress, ESLint, TypeScript gibi modern test ve statik analiz araçları
    *   Docker, Docker Compose, Kubernetes Job ve CronJob
    *   PowerShell ve Bash script yazımı

## Gelecekteki Öğrenme Hedefleri (Proje Kapsamında)

*   Güvenlik testleri (OWASP metodolojileri, penetrasyon testleri) konusunda bilgi ve deneyim kazanmak
*   Performans testleri için k6 ve JMeter gibi araçların kullanımını derinleştirmek
*   Görsel regresyon testleri için Percy, Applitools gibi araçları öğrenmek
*   Test verisi yönetimi ve test ortamı otomasyonu konularında ileri seviye bilgi edinmek

## Görevlere Özel Notlar ve Gözlemler

*   **Görev ID/Adı:** AG-100 Test Otomasyonu Altyapısının Kurulması
    *   **Notlar/Gözlemler:** Test altyapısı kurulurken, projenin gelecekteki ihtiyaçlarını karşılayabilecek esneklikte tasarlanması önemlidir. Özellikle, farklı test türlerinin (birim, entegrasyon, E2E) aynı altyapı üzerinde çalışabilmesi ve CI/CD süreçlerine entegre edilebilmesi için modüler bir yapı tercih edilmiştir.

*   **Görev ID/Adı:** AG-101 Test Otomasyonu için Docker ve Kubernetes Entegrasyonu
    *   **Notlar/Gözlemler:** Docker ve Kubernetes entegrasyonu, test ortamlarının izolasyonunu ve tekrarlanabilirliğini sağlamak için kritik öneme sahiptir. Özellikle, farklı test ortamlarında (geliştirme, test, üretim) tutarlı sonuçlar elde etmek için bu entegrasyon büyük fayda sağlamaktadır.

*   **Görev ID/Adı:** AG-102 Örnek Test Senaryolarının Oluşturulması
    *   **Notlar/Gözlemler:** Örnek test senaryoları, gelecekteki test geliştirme çalışmaları için temel oluşturmaktadır. Bu senaryolar, test edilebilirliği artırmak için kod tasarımı ve refaktörleme konularında da yol gösterici olmaktadır.
