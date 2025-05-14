# Detaylı Görev ve Kilometre Taşı Bağımlılık Haritası

Bu belge, ALT_LAS projesinin "Yönetici Ofisi Geliştirme" (ÖRN-001) görevi kapsamında, Proje Yöneticisi (AI) tarafından görevler ve kilometre taşları arasındaki bağımlılıkları daha detaylı bir şekilde haritalandırmak amacıyla oluşturulmuştur. Bu analiz, `project_milestones_dependencies_critical_path.md` belgesini ve tüm persona görev kırılım dosyalarını temel almaktadır.

## Bağımlılık Tanımlama Metodolojisi

*   **Doğrudan Bağımlılık:** Bir görevin (veya kilometre taşının) başlayabilmesi için başka bir görevin (veya kilometre taşının) tamamlanmış olması.
*   **Dolaylı Bağımlılık:** Bir görevin çıktılarının, başka bir görevin girdilerini önemli ölçüde etkilemesi.
*   **Kaynak Bağımlılığı:** Aynı personanın veya kaynağın birden fazla görev için gerekli olması ve sıralama gerektirmesi.

## Faz 1: Temel Kurulum, Analiz ve Yüksek Öncelikli Entegrasyonlar

### KM-1.1: Ekip içi bilgi paylaşım mekanizması aktif ve işler durumda.
*   **Sorumlu:** Proje Yöneticisi (AI)
*   **Bağlı Olduğu Görevler (Örnekler):
    *   `project_manager_detailed_cuda_tasks.md` -> AG-PM-MEETINGS-001 (Toplantı organizasyonu)
    *   `project_manager_detailed_cuda_tasks.md` -> AG-PM-DOCREPORTRULES-001 (Dokümantasyon standartları)
*   **Etkilediği Görevler:** KM-1.2, KM-1.8 ve projedeki tüm işbirliği gerektiren görevler.

### KM-1.2: Detaylı Faz 1 planı, kaynak atamaları ve güncellenmiş risk matrisi tamamlanmış.
*   **Sorumlu:** Proje Yöneticisi (AI)
*   **Bağlı Olduğu Görevler:
    *   KM-1.1
    *   Tüm personaların ilk görev kırılımlarının ve analizlerinin tamamlanması (ilgili `*_detailed_cuda_tasks.md` dosyalarındaki ilk analiz görevleri).
    *   `project_manager_detailed_cuda_tasks.md` -> AG-PM-PLANCONSOL-001, AG-PM-CRITICALPATH-001, AG-PM-RISKMATRIX-001
*   **Etkilediği Görevler:** KM-1.3, KM-1.6, ve Faz 1 kapsamındaki tüm geliştirme ve PoC görevleri.

### KM-1.3: API yanıtlarında işlem süresi/GPU kaynağı meta verisi için mimari tasarım ve örnek implementasyon tamamlanmış.
*   **Sorumlu:** Yazılım Mimarı, Kıdemli Backend Geliştirici
*   **Bağlı Olduğu Görevler:
    *   KM-1.2
    *   `architect_detailed_cuda_tasks.md` -> AG-MIM-APIASYNC-001 (ve ilgili API tasarım görevleri)
    *   `backend_developer_detailed_cuda_tasks.md` -> İlgili API güncelleme ve PoC görevleri.
*   **Etkilediği Görevler:** KM-1.4, KM-1.5, Frontend geliştirmeleri (performans göstergeleri).

### KM-1.4: 95. ve 99. persentil yanıt süreleri ölçümü için performans test planı güncellenmiş ve izleme altyapısına entegre edilmiş.
*   **Sorumlu:** QA Mühendisi, DevOps Mühendisi
*   **Bağlı Olduğu Görevler:
    *   KM-1.3 (API meta verisi olmadan tam ölçüm zorlaşır)
    *   `qa_engineer_detailed_cuda_tasks.md` -> AG-QA-PERFTESTPLAN-001
    *   `devops_engineer_detailed_cuda_tasks.md` -> AG-DEVOPS-MONITOR-DCGMEXPORTER-001 (ve Grafana dashboard görevi)
*   **Etkilediği Görevler:** KM-1.5 (PoC performans değerlendirmesi), Faz 2 performans testleri.

### KM-1.5: GPU ön ısıtma ve önbellekleme mekanizması (`ai-orchestrator`) için PoC tamamlanmış ve performans test sonuçları alınmış.
*   **Sorumlu:** Kıdemli Backend Geliştirici, Veri Bilimcisi
*   **Bağlı Olduğu Görevler:
    *   KM-1.4 (Performans ölçüm altyapısı)
    *   `backend_developer_detailed_cuda_tasks.md` -> `ai-orchestrator` hotspot analizi ve PoC görevleri.
    *   `data_scientist_detailed_cuda_tasks.md` -> Model optimizasyonu ve `ai-orchestrator` entegrasyonu ile ilgili görevler.
*   **Etkilediği Görevler:** KM-1.7, `ai-orchestrator` tam entegrasyonu (Faz 2).

### KM-1.6: Dinamik, filtrelenebilir arayüzler için UI/UX prototipleri ve geliştirilmiş arayüz bileşenleri sunulmuş.
*   **Sorumlu:** UI/UX Tasarımcısı, Kıdemli Frontend Geliştirici
*   **Bağlı Olduğu Görevler:
    *   KM-1.2 (Genel plan ve öncelikler)
    *   `ui_ux_designer_detailed_cuda_tasks.md` -> İlgili UI tasarım ve prototipleme görevleri.
    *   `frontend_developer_detailed_cuda_tasks.md` -> İlgili frontend bileşen geliştirme görevleri.
*   **Etkilediği Görevler:** Kullanıcı geri bildirimleri, Faz 2 UI geliştirmeleri.

### KM-1.7: Nsight ile detaylı çekirdek izleme altyapısı kurulmuş ve örnek raporlar oluşturulmuş.
*   **Sorumlu:** DevOps Mühendisi, Kıdemli Backend Geliştirici
*   **Bağlı Olduğu Görevler:
    *   KM-1.5 (İzlenecek bir PoC veya erken entegrasyon olması faydalı)
    *   `devops_engineer_detailed_cuda_tasks.md` -> AG-DEVOPS-NSIGHT-SETUP-001
    *   `backend_developer_detailed_cuda_tasks.md` -> Nsight kullanarak profilleyeceği kod parçaları.
*   **Etkilediği Görevler:** Faz 2 derinlemesine optimizasyon çalışmaları.

### KM-1.8: Tüm personaların Faz 1 için tanımlanan ilk görevleri (planlama, analiz, PoC hazırlık vb.) tamamlanmış.
*   **Sorumlu:** Tüm Personalar (Proje Yöneticisi koordinasyonunda)
*   **Bağlı Olduğu Görevler:** KM-1.1, KM-1.2, KM-1.3, KM-1.4, KM-1.5, KM-1.6, KM-1.7 (Bu kilometre taşlarının tamamlanması, personaların ilgili ilk görevlerini bitirmesini içerir).
*   **Etkilediği Görevler:** Faz 2 geliştirme görevlerinin başlaması.

## Faz 2: Geliştirme, Derinlemesine Optimizasyon ve Kapsamlı Test

### KM-2.1: GPU İstek Yönlendirme Katmanı geliştirilmiş ve test edilmiş.
*   **Sorumlu:** Yazılım Mimarı, Kıdemli Backend Geliştirici
*   **Bağlı Olduğu Görevler:
    *   KM-1.8
    *   `architect_detailed_cuda_tasks.md` -> İlgili mimari tasarım görevleri (örn. AG-MIM-MICROSERV-001, AG-MIM-VISION-001)
    *   `backend_developer_detailed_cuda_tasks.md` -> Katmanın implementasyon görevleri.
*   **Etkilediği Görevler:** Diğer servislerin standart CUDA entegrasyonu, KM-2.2.

### KM-2.2: Farklı GPU mimarileri için uyumluluk test matrisi oluşturulmuş ve test otomasyonu sağlanmış.
*   **Sorumlu:** QA Mühendisi, DevOps Mühendisi
*   **Bağlı Olduğu Görevler:
    *   KM-2.1 (Test edilecek standart bir katman olması)
    *   `qa_engineer_detailed_cuda_tasks.md` -> AG-QA-COMPATIBILITYMATRIX-001
    *   `devops_engineer_detailed_cuda_tasks.md` -> CI/CD pipeline'ında GPU destekli test runner konfigürasyonu (AG-DEVOPS-CICD-GPURUNNER-001)
*   **Etkilediği Görevler:** Üretim dağıtımları, projenin genel kararlılığı.

*(Diğer Faz 2 ve Faz 3 kilometre taşları için benzer detaylı bağımlılık haritalandırması yapılacaktır.)*

## Kritik Bağımlılık Zincirleri (Örnekler)

*   **Zincir 1 (AI Orchestrator Gelişimi):**
    KM-1.2 (Plan) -> KM-1.3 (API Meta) -> KM-1.4 (Perf. Test Plan) -> KM-1.5 (GPU Isıtma PoC) -> KM-1.7 (Nsight) -> KM-1.8 (Faz 1 Tamamlama) -> Faz 2 `ai-orchestrator` Geliştirme -> KM-2.3 (TensorRT Opt.) -> Kapsamlı Testler -> KM-3.3

*   **Zincir 2 (Altyapı ve Standartlar):**
    KM-1.1 (Bilgi Paylaşımı) -> KM-1.2 (Plan) -> KM-1.8 (Faz 1 Tamamlama) -> KM-2.1 (Yönlendirme Katmanı) -> KM-2.2 (Uyumluluk Testi) -> KM-3.1 (K8s CRD) -> KM-3.3

Bu belge, proje ilerledikçe ve görev detayları netleştikçe Proje Yöneticisi (AI) tarafından düzenli olarak güncellenecektir.

