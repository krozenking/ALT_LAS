# ALT_LAS - Revize Edilmiş Proje Planı (Yönetici: Manus)

Bu belge, `plan_maker_prompt.md` talimatları ve kullanıcının (proje sahibi) en son direktifleri doğrultusunda Proje Yöneticisi (Manus) tarafından oluşturulan `krozenking/ALT_LAS` projesinin revize edilmiş çalışma planıdır. Plan, **mevcut görevleri tamamlamaya, yeni görev eklememeye, bileşen bağımsızlığını artırmaya ve proje kapsamını stabilize etmeye** odaklanmaktadır.

## Genel Hedefler (Revize Edilmiş)

*   Mevcut bileşenlerin kararlılığını sağlamak ve hataları gidermek.
*   Kod kalitesini ve modülerlik/bağımsızlık prensiplerine uyumu denetlemek ve **gerekli minimum düzeltmeleri** yapmak.
*   Proje dokümantasyonunu denetlemek ve mevcut durumu yansıtacak şekilde **gerekli minimum güncellemeleri** yapmak.
*   Projenin mevcut kapsam dahilinde tamamlanmasını sağlamak.

## Revize Edilmiş İlk Görevler

---

### Görev ID: ALT_LAS_MGR_001 (Revize Edilmiş)

*   **Atanan Çalışan:** Yönetici (Manus) / **Mikroservis ve Kod Kalitesi Danışmanı** (Atanacak)
*   **Görev Tanımı:** Tüm proje bileşenlerinde (`api-gateway`, `segmentation-service`, `runner-service`, `archive-service`, `ui-desktop`, `os-integration-service`, `ai-orchestrator`, `workflow-engine`) kod kalitesi, standartlara uygunluk, **bileşen bağımsızlığı** ve mikroservis/modülerlik prensiplerine uyum denetimi yapmak. **Yalnızca stabilite ve bağımsızlık için kritik olan** iyileştirme alanlarını belirlemek.
*   **Başlangıç Kapsamı:** Projenin genel kalitesi, kararlılığı ve bileşen bağımsızlığı.
*   **Uzman Bakış Açısı:** Yazılım Mimarı / Kalite Güvence Uzmanı / **Mikroservis ve Kod Kalitesi Danışmanı**
*   **Bağlılıklar:**
    *   **Alınan Görevler/Bilgiler:** Projenin mevcut klonlanmış hali.
    *   **İncelenmesi Gereken Görevler:** Yok (Bu ilk denetim görevidir).
*   **Makro Adımlar:**
    *   **1. Denetim Kriterlerini Belirleme:** (Özel Kurallar/Kalite: `plan_maker_prompt.md` ve `docs/developer-guide.md` standartları temel alınacak, **bağımsızlık** kriterleri eklenecek.)
        *   Mikro Adım 1.1: Her dil için kodlama standartlarını listele.
        *   Mikro Adım 1.2: Mikroservis, modülerlik ve **bileşen bağımsızlığı** prensiplerini tanımla (API sınırları, gereksiz bağımlılıklar, veri paylaşım mekanizmaları vb.).
        *   Mikro Adım 1.3: Mevcut testlerin yeterliliğini değerlendir.
        *   Mikro Adım 1.4: Lisans uyumluluğunu kontrol et.
    *   **2. Bileşen Bazında Denetim:** (Özel Kurallar/Kalite: **Danışman** ile işbirliği içinde yapılacak. Odak noktası **kritik hatalar ve bağımlılık sorunları** olacak.)
        *   Mikro Adım 2.1: `api-gateway` kodunu denetle (Standartlar, Bağımsızlık, Kritik Hatalar, Testler, Lisanslar).
        *   Mikro Adım 2.2: `segmentation-service` kodunu denetle.
        *   Mikro Adım 2.3: `runner-service` kodunu denetle.
        *   Mikro Adım 2.4: `archive-service` kodunu denetle.
        *   Mikro Adım 2.5: `ui-desktop` kodunu denetle.
        *   Mikro Adım 2.6: `os-integration-service` kodunu denetle.
        *   Mikro Adım 2.7: `ai-orchestrator` kodunu denetle.
        *   Mikro Adım 2.8: `workflow-engine` kodunu denetle.
    *   **3. Bulguları Raporlama:** (Özel Kurallar/Kalite: Rapor, **yalnızca gerekli düzeltmeleri** içerecek, yeni özellik önerileri olmayacak.)
        *   Mikro Adım 3.1: Her bileşen için tespit edilen **kritik uyumsuzlukları, stabilite/bağımsızlık sorunlarını** listele.
        *   Mikro Adım 3.2: Genel bir özet raporu oluştur.
        *   Mikro Adım 3.3: **Yalnızca gerekli düzeltmeler** için görevleri tanımla (Mevcut görevler güncellenebilir veya minimum sayıda yeni düzeltme görevi oluşturulabilir).
*   **Kalite Gereksinimleri:** Üst düzey kod kalitesi, mikroservis mimarisine uygunluk, **bileşen bağımsızlığı**, modüler yapı, test yeterliliği. Denetim süreci şeffaf ve tekrarlanabilir olmalıdır.
*   **Tahmini Süre:** 2 gün.
*   **Teslimat:** Revize edilmiş denetim raporu (`ALT_LAS_MGR_001_documentation.md`) ve **yalnızca gerekli düzeltmeleri** içeren görev tanımları/güncellemeleri.

---

### Görev ID: ALT_LAS_MGR_002 (Revize Edilmiş)

*   **Atanan Çalışan:** Yönetici (Manus) / Teknik Yazar (Atanacak)
*   **Görev Tanımı:** Projenin `docs` klasöründeki mevcut dokümantasyonu (README'ler dahil) denetlemek, güncelliğini, doğruluğunu ve `plan_maker_prompt.md` standartlarına uygunluğunu kontrol etmek. **Yalnızca mevcut durumu yansıtmak için gerekli olan minimum güncellemeleri** belirlemek ve ilgili görevleri oluşturmak/güncellemek.
*   **Başlangıç Kapsamı:** Proje dokümantasyonunun doğruluğu ve güncelliği.
*   **Uzman Bakış Açısı:** Teknik Yazar / Dokümantasyon Uzmanı
*   **Bağlılıklar:**
    *   **Alınan Görevler/Bilgiler:** Projenin mevcut klonlanmış hali.
    *   **İncelenmesi Gereken Görevler:** ALT_LAS_MGR_001 (Revize Edilmiş) (Kod denetimi bulguları dokümantasyonu etkileyebilir).
*   **Makro Adımlar:**
    *   **1. Mevcut Dokümantasyon Envanteri:**
        *   Mikro Adım 1.1: `docs` klasöründeki ve bileşen köklerindeki tüm dokümantasyon dosyalarını listele.
    *   **2. İçerik Denetimi:** (Özel Kurallar/Kalite: Odak noktası **mevcut durumu doğru yansıtma** olacak.)
        *   Mikro Adım 2.1: `README.md` dosyalarının bileşenlerin mevcut işlevselliğini doğru tanımlayıp tanımlamadığını kontrol et.
        *   Mikro Adım 2.2: `developer-guide.md` ve `user-guide.md`'nin mevcut işleyişle tutarlılığını kontrol et.
        *   Mikro Adım 2.3: `architecture.md`'nin mevcut yapıya uygunluğunu kontrol et.
        *   Mikro Adım 2.4: Diğer `docs` dosyalarının gerekliliğini ve güncelliğini değerlendir (Gereksizse arşivleme önerilebilir).
    *   **3. Bulguları ve Güncelleme Görevlerini Raporlama:** (Özel Kurallar/Kalite: **Yeni doküman oluşturma önerilmeyecek**, yalnızca mevcutları düzeltme hedeflenecek.)
        *   Mikro Adım 3.1: Tespit edilen **kritik eksiklikleri ve hataları** listele.
        *   Mikro Adım 3.2: **Yalnızca güncellenmesi zorunlu olan** dokümanları belirle.
        *   Mikro Adım 3.3: Gerekli minimum güncelleme görevlerini tanımla/güncelle.
*   **Kalite Gereksinimleri:** Dokümantasyon açık, anlaşılır, güncel ve doğru olmalıdır. Ancak bu aşamada **minimum eforla** mevcut durumu yansıtması yeterlidir.
*   **Tahmini Süre:** 1 gün.
*   **Teslimat:** Revize edilmiş dokümantasyon denetim raporu (`ALT_LAS_MGR_002_documentation.md`) ve **minimum güncelleme** görevleri.

---

### Görev ID: ALT_LAS_MGR_003 (Revize Edilmiş)

*   **Atanan Çalışan:** Yönetici (Manus) / **Mikroservis ve Kod Kalitesi Danışmanı** (Atanacak)
*   **Görev Tanımı:** `workflow-engine` bileşeninin mevcut durumunu (README mevcut, `main.py` eksik) ve projenin **tamamlanma hedefi** doğrultusunda **gerekliliğini** değerlendirmek. Bileşenin mevcut haliyle bırakılıp bırakılamayacağını, basitleştirilip basitleştirilemeyeceğini veya **projenin tamamlanması için mutlak gerekliyse** minimum düzeyde nasıl işler hale getirilebileceğini belirlemek.
*   **Başlangıç Kapsamı:** Proje kapsamının netleştirilmesi ve tamamlanma hedefi.
*   **Uzman Bakış Açısı:** Yazılım Mimarı / **Mikroservis ve Kod Kalitesi Danışmanı**
*   **Bağlılıklar:**
    *   **Alınan Görevler/Bilgiler:** Projenin mevcut klonlanmış hali, `workflow-engine` README dosyası.
    *   **İncelenmesi Gereken Görevler:** ALT_LAS_MGR_001 (Revize Edilmiş).
*   **Makro Adımlar:**
    *   **1. Durum Tespiti ve Gereklilik Analizi:**
        *   Mikro Adım 1.1: `workflow-engine` klasöründeki mevcut dosyaları ve `README.md`'yi incele.
        *   Mikro Adım 1.2: Diğer bileşenlerin `workflow-engine` olmadan işlevlerini yerine getirip getiremeyeceğini değerlendir.
        *   Mikro Adım 1.3: Projenin temel hedeflerine ulaşmak için bu bileşenin **mutlak gerekli olup olmadığını** belirle.
    *   **2. Seçenekleri Değerlendirme:**
        *   Mikro Adım 2.1: Bileşenin mevcut haliyle bırakılması (ve dokümantasyonda belirtilmesi) seçeneğini değerlendir.
        *   Mikro Adım 2.2: Bileşenin kapsam dışı bırakılması/arşivlenmesi seçeneğini değerlendir.
        *   Mikro Adım 2.3: Bileşenin **minimum işlevsellik** ile (projenin geri kalanını engellemeyecek şekilde) tamamlanması seçeneğini değerlendir (Eğer mutlak gerekliyse).
    *   **3. Öneri Raporlama:**
        *   Mikro Adım 3.1: Değerlendirme sonuçlarını ve her seçeneğin gerekçesini raporla.
        *   Mikro Adım 3.2: Projenin tamamlanma hedefi doğrultusunda en uygun seçeneği öner.
*   **Kalite Gereksinimleri:** Değerlendirme, projenin **tamamlanma önceliği** ve **bileşen bağımsızlığı** hedefleri doğrultusunda yapılmalıdır. Kararlar net ve gerekçeli olmalıdır.
*   **Tahmini Süre:** 0.5 gün.
*   **Teslimat:** `workflow-engine` durum değerlendirme ve öneri raporu (`ALT_LAS_MGR_003_documentation.md`).

---

*(Diğer görevler, bu revize edilmiş hedefler doğrultusunda değerlendirilecek ve gerekirse güncellenecektir)*

