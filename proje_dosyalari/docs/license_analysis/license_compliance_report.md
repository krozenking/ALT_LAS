# ALT_LAS Projesi - Lisans Uygunluk Analizi Raporu

**Tarih:** 06 Mayıs 2025

## 1. Giriş ve Amaç

Bu rapor, ALT_LAS projesinde kullanılan açık kaynaklı yazılım bileşenlerinin ve bu bileşenlere ait lisansların ticari kullanıma uygunluk açısından analizini sunmaktadır. Amaç, potansiyel lisans uyumsuzluklarını, kısıtlamalarını ve risklerini belirleyerek projenin ticari hedefleriyle uyumlu bir şekilde ilerlemesine yardımcı olmaktır.

## 2. Metodoloji

Lisans analizi aşağıdaki adımları içermiştir:

1.  **Lisans Tespiti:** Projenin ana lisansları (README.md ve diğer üst düzey lisans dosyaları aracılığıyla) ve her bir alt servis/modül içerisindeki bağımlılıkların lisansları otomatik araçlar (`license-checker`, `cargo-license`, `pip-licenses`, `go-licenses` denemesi) ve manuel incelemelerle tespit edilmiştir.
2.  **Lisans Analizi:** Tespit edilen her benzersiz lisansın ticari kullanım, dağıtım, değişiklik yapma ve kaynak kodu ifşası gibi temel şartları incelenmiştir.
3.  **Risk Değerlendirmesi:** Her lisansın, projenin ticari kullanımı açısından potansiyel riskleri ve kısıtlamaları değerlendirilmiştir.

**Not Edilen Kısıtlamalar:**
*   `os-integration-service` (Rust tabanlı): `Cargo.toml` dosyasındaki `edition2024` özelliği, mevcut Rust (1.75.0) derleyici sürümüyle uyumsuz olduğu için bu servisin bağımlılık lisansları otomatik olarak **toplanamamıştır**.
*   `archive-service` (Go tabanlı): `go-licenses` aracıyla yapılan denemelerde modül bulunamaması ve `go get` ile ilgili yapılandırma sorunları nedeniyle bu servisin bağımlılık lisansları otomatik olarak **toplanamamıştır**.

Bu iki servisin lisansları manuel olarak detaylı bir şekilde incelenmelidir ve bu rapordaki genel değerlendirmeler bu eksiklik göz önünde bulundurularak okunmalıdır.

## 3. Tespit Edilen Lisans Türleri ve Genel Değerlendirme

Projede çok çeşitli açık kaynak lisansları tespit edilmiştir. Bunlar genel olarak üç ana kategoriye ayrılabilir:

*   **Permissive Lisanslar:** (Örn: MIT, Apache 2.0, BSD, ISC, 0BSD, PostgreSQL, Python Software Foundation License, Unlicense, CC0-1.0). Bu lisanslar genellikle ticari kullanıma çok uygundur ve minimum yükümlülük (genellikle atıf) gerektirir.
*   **Zayıf Copyleft Lisanslar:** (Örn: LGPLv2.1+, LGPLv3, MPL 1.1, MPL 2.0). Bu lisanslar, lisanslı bileşende yapılan değişikliklerin aynı lisans altında paylaşılmasını gerektirir. Kütüphane olarak kullanıldıklarında ve belirli şartlara (dinamik bağlama, kullanıcıya değiştirme hakkı tanıma vb.) uyulduğunda ticari ürünlerle entegre edilebilirler ancak dikkatli uyum takibi şarttır.
*   **Güçlü Copyleft Lisanslar:** (Örn: GPLv2+, GPLv3). Bu lisanslar, lisanslı yazılımı içeren veya ondan türetilen herhangi bir yazılımın tamamının aynı lisans altında yayınlanmasını gerektirir. Kapalı kaynaklı ticari ürünler için genellikle uygun değildirler.
*   **Özel Durum / Belirsiz Lisanslar:** Bazı bağımlılıklarda lisans net olarak belirtilmemiş veya "Other/Proprietary" gibi ifadeler kullanılmıştır.

Detaylı lisans listesi ve her birinin ön analizi için lütfen eke bakınız: `identified_licenses.md`.

## 4. Ticari Kullanıma Uygun Olmayan veya Yüksek Riskli Lisanslar ve Bağımlılıklar

Aşağıda, projenin ticari kullanımı açısından en ciddi riskleri taşıyan veya uygun olmayan lisanslar ve bu lisanslara sahip bağımlılıklar vurgulanmıştır. Detaylı açıklamalar için lütfen eke bakınız: `non_compliant_or_risky_licenses.md`.

### 4.1. Çok Yüksek Riskli / Acil İncelenmesi Gereken:

*   **Bağımlılık:** `qrcode` (segmentation-service, workflow-engine içinde)
    *   **Tespit Edilen Lisans:** "BSD License; Other/Proprietary License"
    *   **Risk:** "Other/Proprietary License" ifadesi, bilinmeyen ve potansiyel olarak çok kısıtlayıcı ticari şartlar anlamına gelebilir. Bu, projenin ticari dağıtımını engelleyebilir veya beklenmedik maliyetler/yükümlülükler doğurabilir.
    *   **Öneri:** **Derhal** bu bağımlılığın gerçek lisans şartları netleştirilmeli, mümkünse üreticisiyle iletişime geçilmeli ve **hukuksal danışmanlık alınmalıdır.** Güvenli bir alternatif ile değiştirilmesi kuvvetle önerilir.

### 4.2. Yüksek Riskli (Güçlü Copyleft - Kapalı Kaynak Ticari Model İçin Uygun Değil):

*   **Lisans:** GNU General Public License v3 (GPLv3)
    *   **Etkilenen Bağımlılık (Örnek):** `ssh-import-id` (segmentation-service, workflow-engine içinde)
    *   **Risk:** Bu bağımlılığın kullanımı, projenin tamamının GPLv3 altında kaynak kodunun yayınlanmasını gerektirebilir.
    *   **Öneri:** Bu bağımlılığın permissive lisanslı bir alternatif ile değiştirilmesi veya projeden çıkarılması şiddetle tavsiye edilir.

*   **Lisans:** GNU General Public License v2 or later (GPLv2+)
    *   **Etkilenen Bağımlılık (Örnek):** `pyphen` (segmentation-service, workflow-engine içinde bir lisans seçeneği olarak GPLv2+ sunar. Kullanılan asıl lisans teyit edilmeli.)
    *   **Risk:** Eğer GPLv2+ seçeneği aktifse, projenin tamamının GPLv2+ altında kaynak kodunun yayınlanmasını gerektirebilir.
    *   **Öneri:** `pyphen` bağımlılığının hangi lisans altında kullanıldığı netleştirilmeli. Eğer GPLv2+ ise, permissive lisanslı bir alternatif ile değiştirilmesi veya projeden çıkarılması şiddetle tavsiye edilir.

### 4.3. Orta-Yüksek Riskli (Zayıf Copyleft - Dikkatli Yönetim ve Uyum Gerektirir):

*   **Lisanslar:** LGPLv2.1+, LGPLv3, MPL 1.1, MPL 2.0
    *   **Etkilenen Bağımlılıklar (Örnekler):**
        *   LGPLv2.1+: `chardet`
        *   LGPLv3: `fpdf`, `fpdf2`, `svglib`
        *   MPL 2.0: `certifi`
        *   MPL 1.1: `pyphen` (bir seçenek olarak)
    *   **Risk:** Bu lisanslar, lisanslı kütüphanede yapılan değişikliklerin kaynak kodunun aynı lisans altında paylaşılmasını ve diğer bazı uyum yükümlülüklerini (dinamik bağlama, kullanıcıya bildirim vb.) gerektirir. Yanlış kullanım veya uyumsuzluk, projenin bu lisansların şartlarına tabi olmasına yol açabilir.
    *   **Öneri:** Bu bağımlılıkların kullanımı devam edecekse, lisans şartlarına tam uyum sağlandığından emin olunmalıdır (özellikle dinamik bağlama, kaynak kodu erişimi ve bildirimler konusunda). Mümkünse, daha az kısıtlayıcı permissive lisanslara sahip alternatifler değerlendirilmelidir. Hukuksal danışmanlık alınarak uyum stratejisi belirlenmelidir.

## 5. Lisans Bilgisi Toplanamayan Servisler (Bilgi Eksiği Kaynaklı Risk)

*   **`os-integration-service` (Rust):** `edition2024` uyumsuzluğu nedeniyle lisansları toplanamadı.
*   **`archive-service` (Go):** Modül ve yapılandırma sorunları nedeniyle lisansları toplanamadı.

**Risk:** Bu servislerin ve içerdikleri bağımlılıkların hangi lisansları kullandığı bilinmemektedir. Aralarında yukarıda belirtilen yüksek riskli veya uygun olmayan lisanslardan herhangi birini içeren bağımlılıklar bulunabilir. Bu durum, projenin geneli için bir belirsizlik ve potansiyel risk oluşturmaktadır.

**Öneri:** Bu iki servis için **acil olarak manuel lisans tespiti ve analizi yapılmalıdır.** Gerekirse, geliştirme ortamları güncellenerek veya farklı araçlar denenerek otomatik analiz tekrar denenmelidir.

## 6. Genel Öneriler

1.  **Hukuksal Danışmanlık:** Bu rapor bir ön analiz niteliğindedir. Özellikle `qrcode` bağımlılığı, GPL, LGPL ve MPL lisanslı bileşenlerin kullanımı ve genel ticari stratejinizle uyumu konusunda **mutlaka uzman bir hukuk danışmanından görüş alınmalıdır.**
2.  **Riskli Bağımlılıkların Değiştirilmesi:** `qrcode`, `ssh-import-id` ve potansiyel olarak GPL lisanslı `pyphen` gibi yüksek riskli bağımlılıkların, ticari kullanıma daha uygun permissive lisanslı alternatiflerle değiştirilmesi öncelikli olarak değerlendirilmelidir.
3.  **Uyum Prosedürleri:** LGPL ve MPL gibi lisanslar kullanılmaya devam edilecekse, bu lisansların gerektirdiği tüm yükümlülüklere (kaynak kodu sağlama, dinamik bağlama, bildirimler vb.) uyum için net prosedürler oluşturulmalı ve belgelenmelidir.
4.  **Eksik Bilgilerin Tamamlanması:** `os-integration-service` ve `archive-service` için lisans analizleri ivedilikle tamamlanmalıdır.
5.  **Lisans Takip Sistemi:** Projeye yeni bağımlılıklar eklendikçe veya mevcutlar güncellendikçe lisans uyumluluğunu sürekli takip edecek bir süreç (örn: CI/CD entegrasyonu ile otomatik lisans tarama) oluşturulmalıdır.
6.  **Atıf Yönetimi:** Tüm permissive lisansların gerektirdiği atıf (attribution) yükümlülüklerinin (genellikle lisans metninin ve telif hakkı bildirimlerinin ürünle birlikte dağıtılması) yerine getirildiğinden emin olunmalıdır.

## 7. Ekler

*   `identified_licenses.md`: Tespit edilen tüm benzersiz lisansların ve ön analizlerinin listesi.
*   `non_compliant_or_risky_licenses.md`: Ticari kullanıma uygun olmayan veya yüksek riskli lisansların detaylı listesi.
*   `license_analysis_todo.md`: Analiz sürecinde kullanılan görev takip listesi.
*   (İsteğe bağlı olarak her servis için oluşturulan `licenses.json` dosyaları da eklenebilir.)

Bu raporun, ALT_LAS projesinin lisans uyumluluğu konusunda net bir yol haritası sunması ve gerekli adımların atılmasına yardımcı olması umulmaktadır.
