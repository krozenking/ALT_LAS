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
| ÖRN-001  | Örnek Görev 1: Yönetici Ofisi Geliştirme       | `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/Proje_Yoneticisi_Ofisi/Calisma_Dosyalari/project_manager_detailed_cuda_tasks.md` (ilgili bölüm) | Proje Yöneticisi (AI)                        | Devam Ediyor  | P1      | -                        | 3                  | -                      | 2025-05-14       |              | Yönetici Ofisi özelliklerinin implementasyonu.                         |
| ÖRN-002  | Örnek Görev 2: CUDA PoC Raporu İncelemesi      | `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/Kidemli_Backend_Gelistirici_Ahmet_Celik_Ofisi/Raporlar/AG-BE-POCREPORT-001_rapor.md` (oluşturulacak) | Yazılım Mimarı (Elif Yılmaz)                 | Yapılacak     | P2      | BE-POC-001               | 1                  | -                      |                  |              | Backend PoC raporunun mimari açıdan değerlendirilmesi.                 |
| ...      | ...                                            | ...                                                                                                 | ...                                          | ...           | ...     | ...                      | ...                | ...                    | ...              | ...          | ...                                                                    |

**Not:** Bu pano, projenin ilerleyişine göre Proje Yöneticisi (AI) tarafından düzenli olarak güncellenecektir. Yeni görevler eklendikçe veya mevcut görevlerin durumu değiştikçe bu tabloya yansıtılacaktır. Detaylı görev tanımları ve Atlas görevleri için "Detay Linki" sütunundaki ilgili persona görev dosyalarına başvurulmalıdır.

## Ayrı Durum Panoları (Opsiyonel)

İleride görev sayısı arttıkça, her durum için ayrı Markdown dosyaları oluşturulabilir ve bu ana panodan linklenebilir:
*   `gorevler_yapilacak.md`
*   `gorevler_devam_eden.md`
*   `gorevler_engellendi.md`
*   `gorevler_gozden_gecirilecek.md`
*   `gorevler_tamamlandi.md`

