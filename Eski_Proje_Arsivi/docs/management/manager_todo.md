# Proje Yöneticisi Görev Listesi (Güncellenmiş - 02 Mayıs 2025)

**Rol:** Proje Yöneticisi

**Giriş:** Bu belge, Proje Yöneticisinin mevcut ve gelecek sprintlerdeki öncelikli görevlerini ve sorumluluklarını özetlemektedir. `manager_action_plan.md` belgesindeki ilk değerlendirmeler ve `sprint_X_plan.md` ile `roadmap_updated.md` belgelerindeki güncel planlar dikkate alınarak hazırlanmıştır.

## Mevcut Sprint (Sprint X) Odak Alanları ve Yönetici Görevleri

*   **[ ] Sprint X İlerleme Takibi:**
    *   Özellikle kritik darboğazlardaki (Runner Service - İşçi 3, UI - İşçi 5, Güvenlik - İşçi 8) ilerlemeyi günlük/düzenli olarak takip et.
    *   Sprint hedeflerine ulaşılıp ulaşılmadığını izle.
    *   Potansiyel engelleri veya gecikmeleri erkenden tespit et ve müdahale et.
*   **[ ] Temel Güvenlik Uygulamalarının Koordinasyonu (İşçi 8 Liderliğinde):**
    *   mTLS, en az ayrıcalık, şifreleme ve erişim kontrollerinin çekirdek servislere (API GW, Segmentation, Runner, Archive, OS Int, AI Orch) entegrasyonunu takip et.
*   **[ ] CI/CD Güvenlik Entegrasyonu Takibi (İşçi 8/DevOps):**
    *   Güvenlik tarama araçlarının (SAST, DAST, bağımlılık) CI/CD ardışık düzenine entegrasyonunu izle.
*   **[ ] Performans Metrik Toplama ve SLO Tanımlama Takibi:**
    *   Performans metrik toplama altyapısının kurulumunu (DevOps/İlgili Çalışanlar) ve ilk SLO'ların tanımlanmasını (PM/Ürün Yöneticisi) takip et.
*   **[ ] Bağımlılık Lisans Doğrulaması (PM/Hukuk):**
    *   Sprint X planında belirtildiği gibi, bağımlılık lisanslarının ticari stratejiyle uyumluluğunu doğrula.
*   **[ ] İletişim ve Koordinasyon:**
    *   Düzenli ekip iletişimini (stand-up'lar, asenkron güncellemeler) sürdür.
    *   Çalışanlar arası koordinasyonu (özellikle güvenlik ve entegrasyon konularında) kolaylaştır.

## Gelecek Sprintler ve Sürekli Sorumluluklar

*   **[ ] Sprint X+1 Planlaması:**
    *   Sprint X'in sonuçlarına göre Sprint X+1'in hedeflerini ve kapsamını belirle.
    *   Önceliklendirilmiş görevleri (hem kapsamlı önerilerden hem de yeni 100 küçük öneriden seçilenleri) sprint backlog'una dahil et.
*   **[ ] Yeni 100 Küçük Önerinin Değerlendirilmesi:**
    *   `comprehensive_recommendations.md` dosyasının sonuna eklenen 100 yeni küçük öneriyi gözden geçir.
    *   Uygulanabilir ve yüksek etkili olanları belirleyerek gelecek sprint planlarına veya backlog'a ekle.
*   **[ ] Yol Haritası ve Zaman Çizelgesi Güncellemesi:**
    *   Sprint X ilerlemesine göre proje yol haritasını (`roadmap_updated.md`) ve kilometre taşı tarihlerini düzenli olarak gözden geçir ve güncelle.
    *   Önemli gecikme risklerini veya değişiklikleri paydaşlara raporla.
*   **[ ] Risk Yönetimi:**
    *   Yol haritasında tanımlanan riskleri (özellikle gecikmeler, entegrasyon, güvenlik) aktif olarak izle ve azaltma stratejilerini uygula.
*   **[ ] Kalite Güvence ve Test Koordinasyonu (KG ile):**
    *   Test kapsamının genişletilmesini ve güvenlik/performans testlerinin uygulanmasını destekle.
*   **[ ] Dokümantasyon Takibi:**
    *   Proje dokümantasyonunun (mimari, geliştirici kılavuzları, görev listeleri vb.) güncel tutulmasını sağla.

## Önceliklendirme Notları

1.  **En Yüksek Öncelik:** Sprint X hedeflerine ulaşmak, özellikle kritik darboğazları (Runner, UI, Security) ilerletmek.
2.  **Yüksek Öncelik:** Temel güvenlik önlemlerinin uygulanması, Sprint X+1 planlaması.
3.  **Orta Öncelik:** Yeni 100 önerinin değerlendirilmesi, yol haritası takibi, risk yönetimi.
4.  **Sürekli:** İletişim, koordinasyon, dokümantasyon takibi.

