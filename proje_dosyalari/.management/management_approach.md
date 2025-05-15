# ALT_LAS Projesi Yönetim Yaklaşımı (Yönetici: Manus) - Revize Edilmiş

Bu belge, Proje Yöneticisi (Manus) olarak `krozenking/ALT_LAS` projesini yönetirken izleyeceğim yaklaşımı ve yöntemleri açıklamaktadır. Bu yaklaşım, `plan_maker_prompt.md` dosyasında belirtilen ilkelere ve kullanıcının (proje sahibi) en son direktiflerine dayanmaktadır.

## Yönetim İlkeleri

*   **Tamamlama Odaklılık:** Yeni görevler eklemek yerine mevcut görevleri tamamlamaya öncelik verilecektir. Projenin mevcut kapsam dahilinde bitirilmesi hedeflenmektedir.
*   **Plan Odaklılık:** Tüm çalışmalar, revize edilecek proje planına göre yürütülecektir.
*   **Kalite Önceliği:** Kod kalitesi, modülerlik, test kapsamı ve dokümantasyon standartlarına (`plan_maker_prompt.md` ve `docs/developer-guide.md` temel alınarak) en üst düzeyde önem verilecektir.
*   **Stabilizasyon ve Bağımsızlık:** Öncelik, mevcut proje kapsamının stabilize edilmesi, kalitesinin artırılması ve bileşenlerin/özelliklerin mümkün olduğunca bağımsız çalışmasının sağlanması olacaktır.
*   **Şeffaflık:** Tüm görevler, ilerlemeler ve kararlar ilgili görev dokümantasyonları aracılığıyla şeffaf bir şekilde takip edilecektir.
*   **İşbirliği:** Çalışanlar arası (kavramsal veya atanmış) işbirliği teşvik edilecek, görev devirleri ve geri bildirimler dokümantasyonla yönetilecektir.

## Yönetim Süreçleri

1.  **Plan Güncelliği:** Her yönetimsel faaliyete başlamadan önce `planmakerpromp` deposundaki `plan_maker_prompt.md` dosyasının güncelliği kontrol edilecektir.
2.  **Görev Yönetimi ve Takip:**
    *   Proje planı, tamamlama odaklı olacak şekilde revize edilecektir.
    *   Mevcut görevler önceliklendirilecek ve atanacaktır.
    *   Görevlerin ilerleyişi, ilgili görev dokümantasyonları (`[Görev ID]_documentation.md`) üzerinden takip edilecektir.
3.  **Kalite Kontrol ve Gözden Geçirme:**
    *   Tamamlanan her görevin kodu ve dokümantasyonu, atanmış kalite standartlarına ve mimari prensiplere (özellikle mikroservis ve bağımsızlık) uygunluk açısından gözden geçirilecektir.
    *   Bu süreçte, atanacak **Mikroservis ve Kod Kalitesi Danışmanı**'ndan destek alınacaktır.
    *   Kural ihlalleri veya kalite eksiklikleri tespit edildiğinde, ilgili çalışana geri bildirim verilecek ve düzeltici görevler tanımlanacaktır (ancak yeni özellik eklememeye özen gösterilecektir).
4.  **Dokümantasyon Yönetimi:**
    *   Tüm çalışanların (kavramsal veya gerçek) `plan_maker_prompt.md`'de belirtilen standart dokümantasyon formatına uyması sağlanacaktır.
    *   Proje dokümantasyonunun (`docs` klasörü) güncel ve doğru tutulması için denetimler yapılacak ve gerekli güncellemeler mevcut görevler kapsamında ele alınacaktır.
5.  **Git İş Akışı:**
    *   Tüm çalışmalar `main` branch üzerinde yapılacaktır.
    *   Yönetici olarak, gerektiğinde (büyük değişiklikler, riskli denemeler) yeni branch oluşturma yetkimi kullanabilirim, ancak genel kural `main` üzerinde çalışmaktır.
    *   Çalışanlar `pull` -> (çakışma çözümü) -> `push` -> iletişim akışını takip edecektir.
    *   `main` branch'ine push işlemleri sırasında `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` belirteci kullanılacaktır. Eğer push işlemi başarısız olursa, 3 dakika beklenip tekrar denenecektir. İkinci deneme de başarısız olursa, durum kullanıcıya (proje sahibi) bildirilecektir.
6.  **İletişim:**
    *   Ana iletişim kanalı, görev dokümantasyonları olacaktır. Yönetici yanıtları ve önerileri de bu dokümanlara işlenecektir.
    *   Gerektiğinde, kullanıcı (proje sahibi) ile mesajlaşma araçları üzerinden doğrudan iletişim kurulacaktır.
7.  **Delegasyon (Yönetim Takımı):**
    *   Başlangıçta görevler doğrudan yönetilecek veya kavramsal rollere atanacaktır.
    *   Özellikle, mikroservis ve kod kalitesi konularında destek sağlamak üzere bir **Mikroservis ve Kod Kalitesi Danışmanı** rolü oluşturulacaktır. Bu rol, Yönetim Takımı'nın bir parçası olarak kabul edilebilir.
    *   Projenin ilerleyen aşamalarında iş yükü artarsa veya özel uzmanlık gerekirse, `plan_maker_prompt.md`'de belirtildiği gibi en fazla 8 kişilik bir Yönetim Takımı (Danışmanlar, Sekreterler vb.) oluşturularak belirli görevler delege edilebilir.

## Sonraki Adımlar

1.  Bu güncellenmiş yönetim yaklaşımına göre `alt_las_initial_plan.md` revize edilecektir (tamamlama odaklı, bağımsızlık vurgusu ile).
2.  Mikroservis ve Kod Kalitesi Danışmanı rolü için bir görev tanımı oluşturulacaktır.
3.  Revize edilmiş plandaki görevlerin yürütülmesine başlanacaktır.
4.  Kullanıcıdan (proje sahibi) projenin hedefleri veya öncelikleri hakkında ek girdi veya yönlendirme beklenecektir.
