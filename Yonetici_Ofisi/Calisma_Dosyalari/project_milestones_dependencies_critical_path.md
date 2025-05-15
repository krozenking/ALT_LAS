# Proje Kilometre Taşları, Bağımlılıklar ve Kritik Yol Analizi (Taslak)

Bu belge, ALT_LAS projesinin "Yönetici Ofisi Geliştirme" (ÖRN-001) görevi kapsamında, Proje Yöneticisi (AI) tarafından ana proje kilometre taşlarını, görevler arası bağımlılıkları ve potansiyel kritik yolu belirlemek amacıyla oluşturulmuştur. Bu analiz, `/Planlama_Ofisi/cuda_master_integration_plan.md` ve diğer planlama dokümanları ile persona görev kırılımlarını temel almaktadır.

## 1. Ana Proje Fazları ve Kilometre Taşları

`cuda_master_integration_plan.md` belgesinde belirtilen ana fazlar temel alınarak kilometre taşları aşağıdaki gibi öngörülmektedir:

### Faz 1: Temel Kurulum, Analiz ve Yüksek Öncelikli Entegrasyonlar (İlk 1-2 Ay)
*   **Kilometre Taşı 1.1:** Ekip içi bilgi paylaşım mekanizması aktif ve işler durumda. (S8.2)
*   **Kilometre Taşı 1.2:** Detaylı Faz 1 planı, kaynak atamaları ve güncellenmiş risk matrisi tamamlanmış. (S8.1)
*   **Kilometre Taşı 1.3:** API yanıtlarında işlem süresi/GPU kaynağı meta verisi için mimari tasarım ve örnek implementasyon tamamlanmış. (S1.2)
*   **Kilometre Taşı 1.4:** 95. ve 99. persentil yanıt süreleri ölçümü için performans test planı güncellenmiş ve izleme altyapısına entegre edilmiş. (S5.2)
*   **Kilometre Taşı 1.5:** GPU ön ısıtma ve önbellekleme mekanizması (`ai-orchestrator`) için PoC tamamlanmış ve performans test sonuçları alınmış. (S2.2)
*   **Kilometre Taşı 1.6:** Dinamik, filtrelenebilir arayüzler için UI/UX prototipleri ve geliştirilmiş arayüz bileşenleri sunulmuş. (S6.2)
*   **Kilometre Taşı 1.7:** Nsight ile detaylı çekirdek izleme altyapısı kurulmuş ve örnek raporlar oluşturulmuş. (S3.2)
*   **Kilometre Taşı 1.8:** Tüm personaların Faz 1 için tanımlanan ilk görevleri (planlama, analiz, PoC hazırlık vb.) tamamlanmış.

### Faz 2: Geliştirme, Derinlemesine Optimizasyon ve Kapsamlı Test (Sonraki 2-3 Ay)
*   **Kilometre Taşı 2.1:** GPU İstek Yönlendirme Katmanı geliştirilmiş ve test edilmiş. (S1.1)
*   **Kilometre Taşı 2.2:** Farklı GPU mimarileri için uyumluluk test matrisi oluşturulmuş ve test otomasyonu sağlanmış. (S5.1)
*   **Kilometre Taşı 2.3:** TensorRT için farklı nicemleme stratejileri denenmiş, analiz raporu ve optimize edilmiş modeller sunulmuş. (S7.1)
*   **Kilometre Taşı 2.4:** `segmentation-service` için C++ CUDA çekirdeği ile karşılaştırmalı PoC tamamlanmış ve raporlanmış (eğer faydalı bulunduysa). (S2.1)
*   **Kilometre Taşı 2.5:** `segmentation-service` NLP görevlerinde cuDF ile veri ön işleme entegrasyonu tamamlanmış ve performans iyileştirmesi raporlanmış. (S7.2)

### Faz 3: Genişletilmiş Entegrasyon, Son Ayarlamalar ve Üretime Hazırlık (Devam Eden Aylar)
*   **Kilometre Taşı 3.1:** Kubernetes için Özel CUDA Kaynak Profili CRD geliştirilmiş ve dokümante edilmiş. (S3.1)
*   **Kilometre Taşı 3.2:** WebGPU ile prototip oluşturulmuş ve karşılaştırmalı analiz raporu sunulmuş. (S4.1)
*   **Kilometre Taşı 3.3:** `/cuda_integration_plan.md` dosyasındaki diğer teknik adımlar tamamlanmış ve sistem üretime hazır hale getirilmiş.

## 2. Önemli Görev Bağımlılıkları (Örnekler)

*   **Bağımlılık B1:** (Faz 1) GPU ön ısıtma mekanizması PoC (KM 1.5) tamamlanmadan, `ai-orchestrator` servisinin tam ölçekli CUDA entegrasyonuna geçilmesi riskli olabilir.
*   **Bağımlılık B2:** (Faz 1) Nsight ile detaylı çekirdek izleme altyapısı (KM 1.7) kurulmadan, Faz 2'deki derinlemesine optimizasyon çalışmaları eksik kalabilir.
*   **Bağımlılık B3:** (Faz 1) Persona görevlerinin (KM 1.8) tamamlanması, Faz 2'deki geliştirme görevlerinin başlaması için ön koşuldur.
*   **Bağımlılık B4:** (Faz 2) GPU İstek Yönlendirme Katmanı (KM 2.1) geliştirilmeden, diğer servislerin CUDA entegrasyonları standart bir yapıya oturtulamayabilir.
*   **Bağımlılık B5:** (Faz 2) Uyumluluk test matrisi (KM 2.2) oluşturulmadan, farklı ortamlarda kararlılık sorunları yaşanabilir.

## 3. Potansiyel Kritik Yol (Güncellenmiş Değerlendirme - Detaylı Bağımlılıklara Göre)

Kritik yol, projenin genel süresini en çok etkileyen, birbiriyle sıkı sıkıya bağlı görevler dizisidir. `/Yonetici_Ofisi/Calisma_Dosyalari/detailed_dependency_map.md` dosyasında detaylandırılan görev ve kilometre taşı bağımlılıkları ışığında, potansiyel kritik yollar aşağıdaki gibi daha net bir şekilde değerlendirilmektedir:

1.  **Yol A (AI Orchestrator ve Temel Altyapı Odaklı Kritik Yol):
    *   **KM-1.1 (Bilgi Paylaşım Mekanizması):** Proje Yöneticisi (AI) tarafından yönetilen, tüm iletişimin temelini oluşturur.
    *   **KM-1.2 (Detaylı Faz 1 Planı ve Risk Matrisi):** Proje Yöneticisi (AI) tarafından, tüm personaların ilk analizleri ve KM-1.1 tamamlandıktan sonra oluşturulur. Bu, Faz 1'deki tüm geliştirme ve PoC görevlerini doğrudan etkiler.
    *   **KM-1.3 (API Meta Veri Tasarımı):** Yazılım Mimarı ve K. Backend Geliştirici tarafından KM-1.2'ye bağlı olarak yürütülür. Performans testleri (KM-1.4) ve GPU ön ısıtma PoC (KM-1.5) için kritiktir.
    *   **KM-1.4 (Performans Test Planı Güncelleme):** QA ve DevOps tarafından KM-1.3'e bağlı olarak yürütülür. GPU ön ısıtma PoC'sinin (KM-1.5) doğru değerlendirilmesi için gereklidir.
    *   **KM-1.5 (GPU Ön Isıtma PoC - ai-orchestrator):** K. Backend Geliştirici ve Veri Bilimcisi tarafından KM-1.4'e bağlı olarak yürütülür. Nsight izleme (KM-1.7) ve Faz 2 `ai-orchestrator` geliştirmeleri için temel teşkil eder.
    *   **KM-1.7 (Nsight İzleme Altyapısı):** DevOps ve K. Backend Geliştirici tarafından KM-1.5'e bağlı olarak yürütülür. Faz 2 optimizasyonları için kritik öneme sahiptir.
    *   **KM-1.8 (Faz 1 Persona Görevleri Tamamlanması):** Tüm personaların yukarıdaki kilometre taşlarına bağlı ilk görevlerinin tamamlanmasını ifade eder ve Faz 2'nin başlangıcı için zorunludur.
    *   **KM-2.1 (GPU İstek Yönlendirme Katmanı):** Yazılım Mimarı ve K. Backend Geliştirici tarafından KM-1.8'e bağlı olarak geliştirilir. Diğer servislerin standart entegrasyonu için önemlidir.
    *   **KM-2.3 (TensorRT Optimizasyonu - ai-orchestrator):** Veri Bilimcisi ve K. Backend Geliştirici tarafından, `ai-orchestrator` geliştirmeleri ve KM-1.7 (Nsight) tamamlandıktan sonra yapılır.
    *   **Faz 2 - Kapsamlı Testler (ai-orchestrator için):** QA Mühendisi tarafından, KM-2.3 ve ilgili geliştirmeler tamamlandıktan sonra yürütülür.
    *   **KM-3.3 (Üretime Hazırlık):** Tüm ana geliştirmeler ve testler tamamlandıktan sonra.

2.  **Yol B (Segmentation Service ve NLP Odaklı Kritik Yol):
    *   KM-1.1, KM-1.2 (Yukarıdaki gibi)
    *   KM-1.8 (Faz 1 Persona Görevleri Tamamlanması - özellikle `segmentation-service` ile ilgili analiz ve PoC hazırlıkları)
    *   KM-2.4 (`segmentation-service` C++ CUDA PoC - eğer önceliklendirilirse): K. Backend Geliştirici ve Veri Bilimcisi tarafından, KM-1.8'e bağlı olarak.
    *   KM-2.5 (`segmentation-service` cuDF Entegrasyonu): Veri Bilimcisi ve K. Backend Geliştirici tarafından, KM-1.8'e ve ilgili analizlere bağlı olarak.
    *   Faz 2 - Kapsamlı Testler (`segmentation-service` için): QA Mühendisi tarafından, KM-2.4/KM-2.5 tamamlandıktan sonra.
    *   KM-3.3 (Üretime Hazırlık).

3.  **Yol C (Genel Altyapı, Test ve Dağıtım Odaklı Kritik Yol):
    *   KM-1.1, KM-1.2 (Yukarıdaki gibi)
    *   KM-1.8 (Faz 1 Persona Görevleri Tamamlanması)
    *   KM-2.1 (GPU İstek Yönlendirme Katmanı)
    *   KM-2.2 (Uyumluluk Test Matrisi ve Otomasyonu): QA ve DevOps tarafından KM-2.1'e bağlı olarak.
    *   KM-3.1 (Kubernetes için Özel CUDA Kaynak Profili CRD): DevOps Mühendisi tarafından, Faz 2 geliştirmeleri ve testleri sonrası.
    *   KM-3.3 (Üretime Hazırlık).

**Not:** Bu güncellenmiş değerlendirme, görevlerin tahmini eforları ve kaynak atamaları (`ana_gorev_panosu.md` içinde belirtilmiştir) dikkate alınarak yapılmıştır. Proje ilerledikçe ve görevlerin fiili süreleri netleştikçe, kritik yol dinamik olarak değişebilir. Bu analiz, Proje Yöneticisi (AI) tarafından periyodik olarak gözden geçirilecektir.

## 4. Sonraki Adımlar ve Sürekli Yönetim

*   **Kritik Yolun Periyodik Gözden Geçirilmesi:** Proje ilerlemesi, tamamlanan görevler ve olası gecikmeler dikkate alınarak kritik yol analizi düzenli olarak (örn. haftalık) güncellenecektir.
*   **Proje Takviminin Güncellenmesi:** `ana_gorev_panosu.md` dosyasındaki başlangıç ve bitiş tarihleri, kritik yol analizindeki değişikliklere ve fiili ilerlemeye göre periyodik olarak güncellenecektir.
*   **Risklerin Yeniden Değerlendirilmesi:** Kritik yoldaki değişiklikler veya yeni ortaya çıkan bağımlılıklar, `project_risk_matrix.md` dosyasındaki risklerin yeniden değerlendirilmesini gerektirebilir.
*   **Görsel Proje Planı (Gantt Şeması Taslağı):** Kritik yol ve görev takvimi netleştikçe, bu bilgilerin görsel bir proje planına (örn. Mermaid.js ile Gantt şeması taslağı oluşturularak bir `.md` dosyasına eklenmesi) aktarılması planlanmaktadır.
*   **Düzenli İlerleme Raporları:** Proje ilerlemesi, kritik görevlerin durumu ve riskler hakkında düzenli raporlar oluşturularak kullanıcıya sunulacaktır.

Bu belge, Yönetici Ofisi çalışmaları kapsamında sürekli olarak güncellenecek ve proje yönetiminin temel bir aracı olarak kullanılacaktır.
