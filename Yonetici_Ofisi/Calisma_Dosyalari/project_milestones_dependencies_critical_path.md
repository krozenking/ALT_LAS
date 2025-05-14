# Proje Kilometre Taşları, Bağımlılıklar ve Kritik Yol Analizi (Taslak)

Bu belge, ALT_LAS projesinin "Yönetici Ofisi Geliştirme" (ÖRN-001) görevi kapsamında, Proje Yöneticisi (AI) tarafından ana proje kilometre taşlarını, görevler arası bağımlılıkları ve potansiyel kritik yolu belirlemek amacıyla oluşturulmuştur. Bu analiz, `/home/ubuntu/ALT_LAS_Organized/Planlama_Ofisi/cuda_master_integration_plan.md` ve diğer planlama dokümanları ile persona görev kırılımlarını temel almaktadır.

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
*   **Kilometre Taşı 3.3:** `/home/ubuntu/cuda_integration_plan.md` dosyasındaki diğer teknik adımlar tamamlanmış ve sistem üretime hazır hale getirilmiş.

## 2. Önemli Görev Bağımlılıkları (Örnekler)

*   **Bağımlılık B1:** (Faz 1) GPU ön ısıtma mekanizması PoC (KM 1.5) tamamlanmadan, `ai-orchestrator` servisinin tam ölçekli CUDA entegrasyonuna geçilmesi riskli olabilir.
*   **Bağımlılık B2:** (Faz 1) Nsight ile detaylı çekirdek izleme altyapısı (KM 1.7) kurulmadan, Faz 2'deki derinlemesine optimizasyon çalışmaları eksik kalabilir.
*   **Bağımlılık B3:** (Faz 1) Persona görevlerinin (KM 1.8) tamamlanması, Faz 2'deki geliştirme görevlerinin başlaması için ön koşuldur.
*   **Bağımlılık B4:** (Faz 2) GPU İstek Yönlendirme Katmanı (KM 2.1) geliştirilmeden, diğer servislerin CUDA entegrasyonları standart bir yapıya oturtulamayabilir.
*   **Bağımlılık B5:** (Faz 2) Uyumluluk test matrisi (KM 2.2) oluşturulmadan, farklı ortamlarda kararlılık sorunları yaşanabilir.

## 3. Potansiyel Kritik Yol (İlk Değerlendirme)

Kritik yol, projenin genel süresini en çok etkileyen, birbiriyle sıkı sıkıya bağlı görevler dizisidir. İlk değerlendirmeye göre potansiyel kritik yol adayları şunlardır:

1.  **Yol A (AI Orchestrator Odaklı):**
    *   KM 1.2 (Detaylı Faz 1 Planı)
    *   KM 1.5 (GPU Ön Isıtma PoC)
    *   KM 1.8 (Personal Görevleri - AI Orchestrator ile ilgili olanlar)
    *   Faz 2 - `ai-orchestrator` için TensorRT optimizasyonu (KM 2.3 ile ilişkili)
    *   Faz 2 - Kapsamlı Testler
    *   KM 3.3 (Üretime Hazırlık)

2.  **Yol B (Segmentation Service Odaklı):**
    *   KM 1.2 (Detaylı Faz 1 Planı)
    *   KM 1.8 (Personal Görevleri - Segmentation Service ile ilgili olanlar)
    *   Faz 2 - `segmentation-service` için PoC ve CUDA entegrasyonu (KM 2.4, KM 2.5)
    *   Faz 2 - Kapsamlı Testler
    *   KM 3.3 (Üretime Hazırlık)

3.  **Yol C (Altyapı ve Genel Entegrasyon Odaklı):**
    *   KM 1.2 (Detaylı Faz 1 Planı)
    *   KM 1.7 (Nsight İzleme Altyapısı)
    *   KM 2.1 (GPU İstek Yönlendirme Katmanı)
    *   KM 2.2 (Uyumluluk Test Matrisi)
    *   KM 3.1 (Kubernetes CRD)
    *   KM 3.3 (Üretime Hazırlık)

**Not:** Bu kritik yol analizi bir taslaktır. Görevlerin detaylı efor tahminleri yapıldıkça ve bağımlılıklar netleştikçe güncellenecektir. Gantt şeması veya benzeri bir proje yönetim aracı ile bu analiz daha kesin hale getirilecektir.

## 4. Sonraki Adımlar

*   Her bir kilometre taşı için sorumlu personaların ve tahmini tamamlanma tarihlerinin `ana_gorev_panosu.md` ile senkronize edilmesi.
*   Bağımlılıkların daha detaylı bir şekilde haritalandırılması.
*   Kritik yol analizinin periyodik olarak gözden geçirilmesi ve güncellenmesi.
*   Bu bilgilerin görsel bir proje planına (örn. Gantt şeması taslağı) aktarılması.

Bu belge, Yönetici Ofisi çalışmaları kapsamında düzenli olarak güncellenecektir.

