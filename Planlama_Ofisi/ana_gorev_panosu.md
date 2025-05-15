# Ana Görev Panosu (Master Task Board)

Bu belge, ALT_LAS projesindeki tüm ana ve alt görevlerin merkezi olarak takip edildiği ana görev panosudur. Proje Yöneticisi tarafından güncel tutulur ve AI personalarının görevlerini buradan takip etmesi beklenir.

**Durumlar:**
*   **Yapılacak (To Do):** Henüz başlanmamış görevler.
*   **Devam Ediyor (In Progress):** Üzerinde aktif olarak çalışılan görevler.
*   **Engellendi (Blocked):** İlerlemesi bir engele takılmış görevler (engel notlarda belirtilmelidir).
*   **Gözden Geçirilecek (In Review):** Tamamlanmış ancak Proje Yöneticisi veya ilgili bir başka persona tarafından incelenmesi gereken görevler.
*   **Tamamlandı (Completed):** Tüm adımları bitmiş ve onaylanmış görevler.

**Öncelikler:**
*   **P0:** Çok Acil / Kritik Engleyici
*   **P1:** Acil / Yüksek Öncelikli
*   **P2:** Normal Öncelikli
*   **P3:** Düşük Öncelikli
*   **P4:** Ertelenebilir

## Görev Listesi

| Görev ID | Görev Adı                                      | Detay Linki (Persona Görev Dosyası)                                                                 | Atanan Persona                               | Durum         | Öncelik | Bağımlılıklar (Görev ID) | Tahmini Efor (gün) | Gerçekleşen Efor (gün) | Başlangıç Tarihi | Bitiş Tarihi | Notlar                                                                 |
|----------|------------------------------------------------|-----------------------------------------------------------------------------------------------------|----------------------------------------------|---------------|---------|--------------------------|--------------------|------------------------|------------------|--------------|------------------------------------------------------------------------|
| ÖRN-001  | Örnek Görev 1: Yönetici Ofisi Geliştirme       | `/Yonetici_Ofisi/Persona_Ofisleri/Proje_Yoneticisi_Ofisi/Calisma_Dosyalari/project_manager_detailed_cuda_tasks.md` (ilgili bölüm) | Proje Yöneticisi (AI)                        | Devam Ediyor  | P1      | -                        | 3                  | -                      | 2025-05-14       |              | Yönetici Ofisi özelliklerinin implementasyonu.                         |
| ÖRN-002  | Örnek Görev 2: CUDA PoC Raporu İncelemesi      | `/Yonetici_Ofisi/Persona_Ofisleri/Kidemli_Backend_Gelistirici_Ahmet_Celik_Ofisi/Raporlar/AG-BE-POCREPORT-001_rapor.md` (oluşturulacak) | Yazılım Mimarı (Elif Yılmaz)                 | Yapılacak     | P2      | BE-POC-001               | 1                  | -                      |                  |              | Backend PoC raporunun mimari açıdan değerlendirilmesi.                 |
| KM-1.1   | KM 1.1: Bilgi Paylaşım Mekanizması Aktif     | /Yonetici_Ofisi/Genel_Belgeler/Bilgi_Paylasim_Platformu/bilgi_paylasim_duyurusu.md | Proje Yöneticisi (AI)                        | Tamamlandı    | P1      | -                                                              | 5                  | 5                      | 2025-05-15       | 2025-05-21   | Ekip içi bilgi paylaşım mekanizması aktif ve işler durumda.              |
| KM-1.2   | KM 1.2: Detaylı Faz 1 Planı ve Risk Matrisi  | /Yonetici_Ofisi/Calisma_Dosyalari/project_milestones_dependencies_critical_path.md (S8.1) | Proje Yöneticisi (AI)                        | Yapılacak     | P1      | KM-1.1                                                         | 7                  | -                      | 2025-05-22       | 2025-05-30   | Detaylı Faz 1 planı, kaynak atamaları ve güncellenmiş risk matrisi.    |
| KM-1.3   | KM 1.3: API Meta Veri Tasarımı (GPU)         | /Yonetici_Ofisi/Calisma_Dosyalari/api_meta_veri_tasarimi_gpu.md | Yazılım Mimarı, K. Backend Gel.              | Tamamlandı    | P1      | KM-1.2                                                         | 10                 | 10                     | 2025-05-31       | 2025-06-13   | API yanıtlarında işlem süresi/GPU kaynağı meta verisi için mimari tasarım. |
| KM-1.4   | KM 1.4: Performans Test Planı Güncelleme     | /Yonetici_Ofisi/Calisma_Dosyalari/performans_test_plani_gpu.md | QA Mühendisi, DevOps Mühendisi                 | Tamamlandı    | P1      | KM-1.3                                                         | 5                  | 5                      | 2025-06-14       | 2025-06-20   | 95/99 persentil yanıt süreleri ölçümü için performans test planı.      |
| KM-1.5   | KM 1.5: GPU Ön Isıtma PoC (ai-orchestrator)  | /GPU_On_Isitma_PoC_Dokumantasyonu.md | K. Backend Gel., Veri Bilimcisi              | Tamamlandı    | P1      | KM-1.4                                                         | 10                 | 10                     | 2025-06-21       | 2025-07-04   | GPU ön ısıtma ve önbellekleme mekanizması PoC ve test sonuçları.        |
| KM-1.6   | KM 1.6: Dinamik UI/UX Prototip ve Bileşenler | /Yonetici_Ofisi/Calisma_Dosyalari/dinamik_ui_ux_veri_gorsellestirme.md | UI/UX Tasarımcısı, K. Frontend Gel., Veri Bilimcisi (destek) | Tamamlandı    | P2      | KM-1.2                                                         | 15                 | 15                     | 2025-06-02       | 2025-06-20   | Dinamik, filtrelenebilir arayüzler için UI/UX prototipleri.            |
:start_line:31
-------
| KM-1.7   | KM 1.7: Nsight İzleme Altyapısı Kurulumu     | /Yonetici_Ofisi/Calisma_Dosyalari/nsight_izleme_altyapisi.md | DevOps Mühendisi, K. Backend Gel.              | Tamamlandı    | P1      | KM-1.5                                                         | 7                  | 7                      | 2025-07-05       | 2025-07-15   | Nsight ile detaylı çekirdek izleme altyapısı kurulmuş ve örnek raporlar. |
| KM-1.8   | KM 1.8: Faz 1 Persona Görevleri Tamamlanması | /Yonetici_Ofisi/Calisma_Dosyalari/faz1_persona_gorevleri_tamamlanma_raporu.md | Tüm Personalar (Proje Yöneticisi koord.)       | Tamamlandı    | P1      | KM-1.1,KM-1.2,KM-1.3,KM-1.4,KM-1.5,KM-1.6,KM-1.7                | 5                  | 5                      | 2025-07-16       | 2025-07-22   | Tüm personaların Faz 1 ilk görevleri tamamlanmış.                      |
| DEVOPS-CUDA-001 | CUDA Uyumlu Geliştirme Ortamı Oluşturma | /CUDA_Gelistirme_Ortami_Raporu.md | DevOps Mühendisi - Can Tekin | Tamamlandı | P1 | - | 7 | 7 | 2025-05-15 | 2025-05-22 | CUDA uyumlu geliştirme ortamı oluşturuldu. |
| QA-PERF-001 | CUDA Performans Test Planı Oluşturma | /CUDA_Performans_Test_Plani.md | QA Mühendisi - Ayşe Kaya | Tamamlandı | P1 | - | 7 | 7 | 2025-05-15 | 2025-05-22 | CUDA performans test planı oluşturuldu. |
| KM-2.1   | KM 2.1: Çoklu GPU Desteği                   | /Yonetici_Ofisi/Calisma_Dosyalari/coklu_gpu_destegi_ozet.md | Kıdemli Backend Geliştirici                    | Tamamlandı    | P1      | -                                                              | 15                 | 15                     | 2025-08-01       | 2025-08-15   | Çoklu GPU desteği ile ölçeklenebilirlik sağlanmış.                      |

**Not:** Bu pano, projenin ilerleyişine göre Proje Yöneticisi (AI) tarafından düzenli olarak güncellenecektir. Yeni görevler eklendikçe veya mevcut görevlerin durumu değiştikçe bu tabloya yansıtılacaktır. Detaylı görev tanımları ve Atlas görevleri için "Detay Linki" sütunundaki ilgili persona görev dosyalarına başvurulmalıdır.

## Ayrı Durum Panoları (Opsiyonel)

İleride görev sayısı arttıkça, her durum için ayrı Markdown dosyaları oluşturulabilir ve bu ana panodan linklenebilir:
*   `gorevler_yapilacak.md`
*   `gorevler_devam_eden.md`
*   `gorevler_engellendi.md`
*   `gorevler_gozden_gecirilecek.md`
*   `gorevler_tamamlandi.md`

