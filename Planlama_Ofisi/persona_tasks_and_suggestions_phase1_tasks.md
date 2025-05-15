# Persona Görev Tanımları ve Önerileri (CUDA Entegrasyonu)

Bu belge, ALT_LAS projesine CUDA entegrasyonu sürecinde her bir çalışanın (persona) kendi tanımladığı görevleri ve bu görevlere ilişkin ilk düşüncelerini içermektedir. Bu görevler, daha sonraki öneri toplama, oylama ve ana plan oluşturma aşamalarına temel teşkil edecektir.

## Tanımlanmış Görevler

### 1. Yazılım Mimarı (Elif Yılmaz)

*   **Kendi Tanımladığı Görev:** `/cuda_integration_plan.md` dosyasında yer alan genel CUDA entegrasyon planını detaylı bir şekilde incelemek, projenin mikroservis mimarisi, ölçeklenebilirlik hedefleri ve uzun vadeli vizyonuyla tam uyumunu sağlamak üzere mimari yaklaşımı rafine etmek. CUDA ile hızlandırılacak servisler arasındaki etkileşim desenlerini, veri akış diyagramlarını ve API sözleşmelerini net bir şekilde tanımlamak. Özellikle `ai-orchestrator` ve `segmentation-service` gibi kritik servislerin CUDA entegrasyonu için detaylı mimari şemalarını oluşturmak.

### 2. Kıdemli Backend Geliştirici (Ahmet Çelik)

*   **Kendi Tanımladığı Görev:** `ai-orchestrator` ve `segmentation-service` başta olmak üzere, backend servislerindeki mevcut algoritmalardan ve veri işleme adımlarından CUDA ile hızlandırmaya en uygun 2-3 adet yüksek etkili adayı (hotspot) belirlemek. Bu adaylardan biri için (örneğin, `segmentation-service` içerisindeki `parallel_processing_optimizer.py` modülündeki bir algoritma veya `ai-orchestrator` içerisindeki bir model çıkarım süreci) bir Ön Çalışma (Proof-of-Concept - PoC) planı hazırlamak. Bu PoC planı, seçilen algoritmanın CUDA C/C++ veya Python için CUDA kütüphaneleri (CuPy, Numba) ile nasıl implemente edileceğini, beklenen performans kazanımlarını ve test stratejisini içermelidir.

### 3. DevOps Mühendisi (Can Tekin)

*   **Kendi Tanımladığı Görev:** CUDA destekli servisler için CI/CD (Sürekli Entegrasyon/Sürekli Dağıtım) süreçlerini detaylandıran bir plan geliştirmek. Bu plan, GPU destekli Docker imajlarının (NVIDIA Container Toolkit kullanarak) oluşturulması ve yönetilmesi, Kubernetes ortamında GPU kaynaklarının etkin bir şekilde zamanlanması (NVIDIA device plugin konfigürasyonu), GPU sürücülerinin ve CUDA toolkit versiyonlarının farklı ortamlarda (geliştirme, test, üretim) tutarlılığının sağlanması ve GPU performansının (NVIDIA DCGM, Prometheus/Grafana entegrasyonu) izlenmesi için gerekli altyapı ve otomasyon adımlarını kapsamalıdır.

### 4. Kıdemli Frontend Geliştirici (Zeynep Arslan)

*   **Kendi Tanımladığı Görev:** CUDA ile hızlandırılmış backend servislerinden elde edilecek performans kazanımlarının (örneğin, daha hızlı API yanıtları, AI destekli özelliklerin anlık geri bildirimleri) son kullanıcı arayüzüne nasıl en etkili şekilde yansıtılacağını araştırmak ve somut öneriler geliştirmek. Ek olarak, eğer projede karmaşık veri görselleştirmeleri veya interaktif 3D simülasyonlar gibi istemci tarafında yoğun hesaplama gerektiren bileşenler varsa, WebGPU gibi tarayıcı tabanlı GPU hızlandırma teknolojilerinin ALT_LAS projesindeki potansiyel kullanım alanlarını ve fizibilitesini değerlendirmek.

### 5. QA Mühendisi (Ayşe Kaya)

*   **Kendi Tanımladığı Görev:** CUDA ile hızlandırılacak tüm bileşenler ve servisler için kapsamlı bir Kalite Güvence (QA) stratejisi ve detaylı test planı oluşturmak. Bu plan, performans testlerini (CUDA öncesi ve sonrası karşılaştırmalar, farklı yük senaryoları), doğruluk ve geçerlilik testlerini (GPU vs CPU sonuçlarının karşılaştırılması, hassasiyet toleransları), stres testlerini (uzun süreli çalıştırma, maksimum yük), entegrasyon testlerini ve GPU’ya özgü potansiyel hata durumlarını (örn. bellek yönetimi, senkronizasyon sorunları) kapsamalıdır. Gerekli test araçları (örn. NVIDIA Nsight paketi, özel test scriptleri) ve test verisi hazırlama süreçleri de bu görev dahilinde tanımlanmalıdır.

### 6. UI/UX Tasarımcısı (Elif Aydın)

*   **Kendi Tanımladığı Görev:** CUDA entegrasyonu sonucunda elde edilecek performans artışlarının ve potansiyel yeni yeteneklerin (örn. gerçek zamanlı karmaşık veri analiz sonuçları, anlık AI tabanlı öneriler) kullanıcı deneyimini (UX) nasıl zenginleştirebileceğine dair tasarım konseptleri ve prototipler geliştirmek. Özellikle, Frontend Geliştirici ve Veri Bilimcisi ile işbirliği yaparak, hızlandırılmış süreçlerden gelen bilgilerin kullanıcı arayüzünde (UI) nasıl sezgisel, anlaşılır ve etkileşimli bir şekilde sunulabileceğini tasarlamak. Kullanıcıların bu yeni yetenekleri kolayca keşfetmesini ve kullanmasını sağlayacak arayüz akışlarını ve bileşenlerini belirlemek.

### 7. Veri Bilimcisi (Dr. Elif Demir)

*   **Kendi Tanımladığı Görev:** ALT_LAS projesindeki mevcut ve planlanan makine öğrenimi modellerinin (özellikle `ai-orchestrator` servisinde yönetilenler) eğitim ve çıkarım (inference) süreçlerinden hangilerinin CUDA ile hızlandırılmasından en yüksek faydayı sağlayacağını detaylı bir analizle belirlemek. Seçilen her bir model/süreç için uygun CUDA tabanlı kütüphaneleri (örn. TensorFlow/PyTorch GPU desteği, TensorRT, RAPIDS cuML/cuDF, Triton Inference Server) ve optimizasyon tekniklerini (örn. karma hassasiyet, model nicemleme) araştırmak ve önermek. Bu öneriler, beklenen hızlanma oranları ve implementasyon karmaşıklığı gibi faktörleri de içermelidir.

### 8. Yönetici (Proje Yöneticisi ve Baş Mimar)

*   **Kendi Tanımladığı Görev:** Tüm ekip üyeleri tarafından tanımlanan CUDA entegrasyon görevlerini ve ilk düşüncelerini konsolide etmek. Bu görevleri, `/cuda_integration_plan.md` dosyasındaki genel teknik planla ve projenin genel yol haritasıyla uyumlu hale getirmek. CUDA entegrasyonu için gerekli kaynakların (insan gücü, GPU donanımı, bütçe) tahsisini planlamak, potansiyel riskleri (teknik, operasyonel, takvimsel) belirlemek ve bu riskler için azaltma stratejileri geliştirmek. Ekip içi koordinasyonu sağlamak ve CUDA entegrasyon sürecinin genel ilerleyişini takip etmek.

