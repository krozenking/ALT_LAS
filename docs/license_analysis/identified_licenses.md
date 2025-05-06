# ALT_LAS Projesi - Tespit Edilen Benzersiz Lisanslar ve Ticari Uygunluk Ön Analizi

Bu belge, ALT_LAS projesinin çeşitli bileşenlerinde ve bağımlılıklarında tespit edilen benzersiz açık kaynak lisanslarını listeler. Her lisans için ticari kullanıma uygunluğu, temel yükümlülükleri ve potansiyel riskleri hakkında kısa bir ön analiz sunulmaktadır.

**Not:** `os-integration-service` (Rust tabanlı, `edition2024` uyumsuzluğu nedeniyle) ve `archive-service` (Go tabanlı, modül/yapılandırma sorunları nedeniyle) servisleri için otomatik lisans toplama işlemi tamamlanamamıştır. Bu servislerin lisansları manuel olarak incelenmeli ve bu rapordaki analizler bu eksiklik göz önünde bulundurularak değerlendirilmelidir.

## 1. Genellikle Ticari Kullanıma Uygun (Permissive) Lisanslar

Bu lisanslar genellikle ticari ürünlerde kullanıma izin verir, kaynak kodun tamamının açılmasını gerektirmez ve çoğunlukla sadece atıf (attribution) şartı koşar.

### 1.1. MIT Lisansı
- **Ticari Uygunluk:** Yüksek.
- **Temel Yükümlülükler:** Lisans metninin ve telif hakkı bildiriminin kopyalarının yazılımla birlikte dağıtılması.
- **Potansiyel Riskler:** Düşük. Yükümlülüklere uyulmaması.
- **Bulunduğu Yerler:** Projenin ana lisanslarından biri, api-gateway, runner-service, segmentation-service, workflow-engine, ui-desktop bağımlılıkları.

### 1.2. Apache Lisansı 2.0 (Apache-2.0)
- **Ticari Uygunluk:** Yüksek.
- **Temel Yükümlülükler:** Lisans metninin kopyasının dağıtılması, yapılan önemli değişikliklerin belirtilmesi, patent hakları ile ilgili hükümler.
- **Potansiyel Riskler:** Düşük. Patent hükümleri ve değişiklik bildirimi gereksinimlerine dikkat edilmeli.
- **Bulunduğu Yerler:** Projenin ana lisanslarından biri, api-gateway, runner-service, segmentation-service, workflow-engine, ui-desktop bağımlılıkları. (Playwright muhtemelen bu lisans altında)

### 1.3. BSD Lisansları (BSD-3-Clause, BSD-2-Clause)
- **Ticari Uygunluk:** Yüksek.
- **Temel Yükümlülükler:** Lisans metninin ve telif hakkı bildiriminin dağıtılması. BSD-3-Clause, ürünün tanıtımında orijinal yazarın adının kullanılmamasını şart koşar.
- **Potansiyel Riskler:** Düşük. Atıf ve tanıtım kısıtlamalarına uyulması.
- **Bulunduğu Yerler:** Projenin ana lisanslarından biri, api-gateway, runner-service, segmentation-service, workflow-engine, ui-desktop bağımlılıkları.

### 1.4. ISC Lisansı
- **Ticari Uygunluk:** Yüksek (MIT ve BSD-2-Clause'a çok benzer).
- **Temel Yükümlülükler:** Lisans metninin ve telif hakkı bildiriminin dağıtılması.
- **Potansiyel Riskler:** Çok düşük.
- **Bulunduğu Yerler:** api-gateway, ui-desktop bağımlılıkları.

### 1.5. 0BSD Lisansı (Zero-Clause BSD)
- **Ticari Uygunluk:** Çok Yüksek (Kamu malına yakın).
- **Temel Yükümlülükler:** Neredeyse yok, atıf bile gerektirmez.
- **Potansiyel Riskler:** Çok düşük.
- **Bulunduğu Yerler:** runner-service, ui-desktop bağımlılıkları.

### 1.6. PostgreSQL Lisansı
- **Ticari Uygunluk:** Yüksek (Permissive, MIT benzeri).
- **Temel Yükümlülükler:** Lisans metninin ve telif hakkı bildiriminin dağıtılması.
- **Potansiyel Riskler:** Düşük.
- **Bulunduğu Yerler:** Projenin ana lisanslarından biri (README.md'de belirtilmiş).

### 1.7. Python Software Foundation Lisansı (PSF Lisansı)
- **Ticari Uygunluk:** Yüksek (GPL ile uyumlu permissive lisans).
- **Temel Yükümlülükler:** Lisans metninin ve telif hakkı bildiriminin dağıtılması, yapılan değişikliklerin belirtilmesi.
- **Potansiyel Riskler:** Düşük.
- **Bulunduğu Yerler:** segmentation-service, workflow-engine bağımlılıkları (örn: defusedxml, distlib, matplotlib). (typing_extensions muhtemelen bu lisans altında)

### 1.8. The Unlicense
- **Ticari Uygunluk:** Çok Yüksek (Kamu malına adanmıştır).
- **Temel Yükümlülükler:** Yok.
- **Potansiyel Riskler:** Çok düşük. Bazı yargı bölgelerinde kamu malına adamanın tam olarak geçerli olmaması gibi teorik durumlar.
- **Bulunduğu Yerler:** runner-service, segmentation-service, workflow-engine bağımlılıkları (örn: filelock).

### 1.9. Creative Commons Zero v1.0 Universal (CC0-1.0)
- **Ticari Uygunluk:** Çok Yüksek (Kamu malına adanmıştır).
- **Temel Yükümlülükler:** Yok.
- **Potansiyel Riskler:** Çok düşük. The Unlicense'a benzer.
- **Bulunduğu Yerler:** runner-service bağımlılıkları.

### 1.10. PIL Software Lisansı (Pillow Lisansı)
- **Ticari Uygunluk:** Yüksek (Permissive, MIT benzeri).
- **Temel Yükümlülükler:** Lisans metninin ve telif hakkı bildiriminin dağıtılması.
- **Potansiyel Riskler:** Düşük. (Pillow için "UNKNOWN" olarak listelenmişti, genellikle bu lisansı kullanır.)
- **Bulunduğu Yerler:** segmentation-service, workflow-engine (Pillow bağımlılığı).

### 1.11. BSD-derived (http://www.repoze.org/LICENSE.txt - Supervisor Lisansı)
- **Ticari Uygunluk:** Yüksek (Permissive BSD tarzı).
- **Temel Yükümlülükler:** Atıf ve lisans metninin korunması.
- **Potansiyel Riskler:** Düşük.
- **Bulunduğu Yerler:** segmentation-service, workflow-engine (supervisor bağımlılığı).

### 1.12. urllib3 Lisansı (Muhtemelen MIT)
- **Ticari Uygunluk:** (Eğer MIT ise) Yüksek.
- **Temel Yükümlülükler:** (Eğer MIT ise) Lisans metninin ve telif hakkı bildiriminin kopyalarının yazılımla birlikte dağıtılması.
- **Potansiyel Riskler:** Düşük. Lisansın kesin olarak teyit edilmesi gerekir.
- **Bulunduğu Yerler:** segmentation-service, workflow-engine (urllib3 bağımlılığı "UNKNOWN" olarak listelenmişti).

## 2. Zayıf Copyleft Lisanslar

Bu lisanslar, lisanslı bileşende yapılan değişikliklerin aynı lisans altında yayınlanmasını gerektirebilir, ancak projenin tamamının aynı lisansla yayınlanmasını zorunlu kılmaz (genellikle kütüphane olarak kullanıldığında). Ticari kullanıma genellikle izin verirler ancak dikkatli olunmalıdır.

### 2.1. Mozilla Public License 2.0 (MPL 2.0)
- **Ticari Uygunluk:** Orta. Ticari kullanıma izin verir.
- **Temel Yükümlülükler:** MPL lisanslı dosyalarda yapılan değişikliklerin kaynak kodunun MPL altında yayınlanması. MPL lisanslı kodun ayrı dosyalarda tutulması önerilir. Lisans metninin ve bildirimlerin dağıtılması.
- **Potansiyel Riskler:** Yüksek. Yükümlülüklere uyulmaması durumunda projenin MPL kapsamına girmesi veya uyumsuzluk. GPL ile uyumsuzdur (bazı istisnalar hariç).
- **Bulunduğu Yerler:** segmentation-service, workflow-engine bağımlılıkları (örn: certifi).

### 2.2. Mozilla Public License 1.1 (MPL 1.1)
- **Ticari Uygunluk:** Orta. MPL 2.0'a benzer ancak daha eski bir versiyondur.
- **Temel Yükümlülükler:** MPL 2.0'a benzer şekilde, MPL 1.1 lisanslı dosyalarda yapılan değişikliklerin kaynak kodunun MPL 1.1 altında yayınlanması.
- **Potansiyel Riskler:** Yüksek. MPL 2.0'a benzer riskler. GPL ile uyumsuzdur.
- **Bulunduğu Yerler:** segmentation-service, workflow-engine (pyphen bağımlılığı MPL 1.1 seçeneği sunar).

### 2.3. GNU Lesser General Public License v2.1 or later (LGPLv2.1+)
- **Ticari Uygunluk:** Orta. Kütüphane olarak dinamik bağlama ile kullanıldığında genellikle ticari ürünlerle uyumludur.
- **Temel Yükümlülükler:** LGPL lisanslı kütüphanede yapılan değişikliklerin kaynak kodunun LGPL altında yayınlanması. Kullanıcının kütüphanenin LGPL lisanslı olduğunu bilmesi ve lisans metnine erişebilmesi. Kullanıcının kütüphanenin farklı bir versiyonuyla çalıştırabilme imkanı (dinamik bağlama ile sağlanır).
- **Potansiyel Riskler:** Yüksek. Statik bağlama veya kütüphane kodunun doğrudan projeye dahil edilmesi durumunda projenin tamamının LGPL şartlarına tabi olma riski. Yükümlülüklere uyulmaması.
- **Bulunduğu Yerler:** segmentation-service, workflow-engine bağımlılıkları (örn: chardet, pyphen).

### 2.4. GNU Lesser General Public License v3 (LGPLv3)
- **Ticari Uygunluk:** Orta. LGPLv2.1+'a benzer ancak bazı ek şartlar ve patent hükümleri içerir.
- **Temel Yükümlülükler:** LGPLv2.1+'a benzer, ancak tivoization'a karşı ek önlemler ve patent hükümleri içerir.
- **Potansiyel Riskler:** Yüksek. LGPLv2.1+'a benzer riskler, ek olarak patent ve anti-tivoization hükümleri.
- **Bulunduğu Yerler:** segmentation-service, workflow-engine bağımlılıkları (örn: fpdf, fpdf2, svglib).

## 3. Güçlü Copyleft Lisanslar

Bu lisanslar, lisanslı yazılımı içeren veya ondan türetilen herhangi bir yazılımın tamamının aynı lisans altında yayınlanmasını gerektirir. Ticari ürünlerde kullanımı genellikle çok kısıtlayıcıdır ve özel dikkat gerektirir.

### 3.1. GNU General Public License v2 or later (GPLv2+)
- **Ticari Uygunluk:** Düşük (Kapalı kaynaklı ticari ürünler için).
- **Temel Yükümlülükler:** GPL lisanslı kodu içeren veya ondan türetilen tüm projenin kaynak kodunun GPL altında yayınlanması. Lisans metninin dağıtılması.
- **Potansiyel Riskler:** Çok Yüksek. Projenin tamamının açık kaynak kodlu hale gelmesi ve GPL şartlarına tabi olması. Ticari modelle uyumsuzluk.
- **Bulunduğu Yerler:** segmentation-service, workflow-engine (pyphen bağımlılığı GPLv2+ seçeneği sunar).

### 3.2. GNU General Public License v3 (GPLv3)
- **Ticari Uygunluk:** Düşük (Kapalı kaynaklı ticari ürünler için). GPLv2+'a benzer ancak daha fazla kısıtlama ve patent hükümleri içerir.
- **Temel Yükümlülükler:** GPLv2+'a benzer, ancak tivoization'a karşı ek önlemler ve daha güçlü patent hükümleri içerir.
- **Potansiyel Riskler:** Çok Yüksek. GPLv2+'a benzer riskler, ek olarak patent ve anti-tivoization hükümleri.
- **Bulunduğu Yerler:** segmentation-service, workflow-engine (ssh-import-id bağımlılığı).

## 4. Özel Durum / İncelenmesi Gereken Lisanslar

### 4.1. "MIT AND Python-2.0" (greenlet)
- **Analiz:** Bu genellikle her iki lisansın şartlarının da karşılanması gerektiği anlamına gelir. Hem MIT hem de PSF Lisansı permissive olduğu için ticari kullanıma genellikle uygundur.
- **Ticari Uygunluk:** Yüksek.
- **Temel Yükümlülükler:** Her iki lisansın atıf ve dağıtım şartlarına uyulması.
- **Potansiyel Riskler:** Düşük.

### 4.2. "BSD License; Other/Proprietary License" (qrcode)
- **Analiz:** "Other/Proprietary" kısmı büyük bir endişe kaynağıdır. Bu, ticari kullanımı kısıtlayabilecek veya ek ücret/şartlar gerektirebilecek özel bir lisans anlamına gelebilir. Bu bağımlılığın lisansının detaylı incelenmesi ve "Other/Proprietary" kısmının ne anlama geldiğinin netleştirilmesi **kritiktir**.
- **Ticari Uygunluk:** Belirsiz/Potansiyel Olarak Düşük.
- **Temel Yükümlülükler:** Bilinmiyor, detaylı inceleme gerektirir.
- **Potansiyel Riskler:** Çok Yüksek. Beklenmedik kısıtlamalar, ücretler veya yasal sorunlar.
- **Bulunduğu Yerler:** segmentation-service, workflow-engine (qrcode bağımlılığı).

---

Bu ön analiz, genel bilgilere dayanmaktadır. Her bir lisansın tam metni ve projenin kullanım senaryosu dikkate alınarak daha detaylı bir hukuksal inceleme yapılması önerilir.

