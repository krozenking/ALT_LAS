# ALT_LAS Projesi: Hiyerarşik Görev Kırılım Yapısı ve Tamamlama Kriterleri (Güncellenmiş)

Bu belge, ALT_LAS projesinin CUDA entegrasyonu ve diğer geliştirme süreçleri için kullanıcı tarafından talep edilen detaylı hiyerarşik görev kırılım yapısını ve bu görevlerin tamamlanma kriterlerini, yeni oluşturulan `/home/ubuntu/ALT_LAS_Organized/` klasör yapısına uygun olarak tanımlamaktadır.

## 1. Görev Hiyerarşisi Seviyeleri

Proje görevleri aşağıdaki hiyerarşik seviyelere bölünecektir:

1.  **Ana Görevler (Main Tasks / Phases):** Projenin büyük fazlarını veya ana bileşenlerini temsil eder. Örneğin, "CUDA Entegrasyon Planlaması", "AI Orchestrator CUDA Entegrasyonu", "Lisans Uyumluluk Analizi", "Test ve Kalite Güvence", "Belgelendirme ve Raporlama". Bu görevler genellikle `/home/ubuntu/ALT_LAS_Organized/Planlama_Ofisi/cuda_master_integration_plan.md` dosyasındaki ana başlıklara karşılık gelebilir.

2.  **Alt Görevler (Sub-Tasks):** Ana Görevlerin daha küçük, yönetilebilir parçalara bölünmüş halidir. Her bir Alt Görev, belirli bir çıktıya veya hedefe yönelik olmalıdır.
    *   *Örnek:* Ana Görev "AI Orchestrator CUDA Entegrasyonu" ise, bir Alt Görev "Model Çıkarım Motorunun TensorRT ile Optimizasyonu" olabilir.

3.  **Makro Görevler (Macro-Tasks):** Alt Görevlerin daha da detaylandırıldığı, birkaç adımdan oluşan iş paketleridir. Bir Makro Görev, genellikle belirli bir uzmanlık alanına veya birkaç günlük bir çalışma süresine karşılık gelebilir.
    *   *Örnek:* Alt Görev "Model Çıkarım Motorunun TensorRT ile Optimizasyonu" ise, bir Makro Görev "Mevcut Modelin TensorRT için Hazırlanması ve Dönüştürülmesi" olabilir.

4.  **Mikro Görevler (Micro-Tasks):** Makro Görevlerin en küçük, genellikle tek bir kişi tarafından kısa bir sürede (birkaç saat veya bir gün) tamamlanabilecek atomik iş birimleridir. Bir Mikro Görev, çok spesifik bir eylemi veya çıktıyı tanımlar.
    *   *Örnek:* Makro Görev "Mevcut Modelin TensorRT için Hazırlanması ve Dönüştürülmesi" ise, bir Mikro Görev "Modelin ONNX formatına dönüştürülmesi" olabilir.

5.  **Atlas Görevleri (Atlas Tasks):** Kullanıcının tanımına göre, projenin "alt" (en alt seviye) ve "last" (son, temel) görevleridir. Bu görevler, bir nevi yol gösterici niteliğinde olup, bir Mikro Görevin gerçekleştirilmesi için gereken en temel adımları, kullanılacak modülleri, kütüphaneleri, diğer modül/kütüphane/özelliklerle olan ilişkileri ve bağımlılıkları detaylandırır. Her bir Atlas Görevi, bir Mikro Görevin nasıl hayata geçirileceğine dair teknik bir reçete sunar.
    *   **Temel Özellikleri:**
        *   **En Temel Birim:** Daha fazla alt parçaya bölünemeyen, en küçük iş adımıdır.
        *   **Yol Gösterici:** Görevin nasıl yapılacağına dair spesifik talimatlar içerir.
        *   **Modül/Kütüphane Bağlantısı:** Hangi kod modülünün (`/home/ubuntu/ALT_LAS_Organized/Proje_Kodu/` altındaki) etkileneceğini, hangi kütüphanenin (ve versiyonunun) kullanılacağını belirtir.
        *   **Bağımlılık ve İlişki Detayları:** Diğer modüllerle, kütüphanelerle veya proje özellikleriyle olan etkileşimleri ve bağımlılıkları açıklar.
        *   **Lisans Uyumluluğu Notu:** Kullanılacak kütüphane veya aracın lisans uyumluluğu (önceki analizlere göre) burada belirtilmelidir.
    *   *Örnek:* Mikro Görev "Modelin ONNX formatına dönüştürülmesi" ise, bir Atlas Görevi şöyle olabilir:
        *   **Atlas Görevi ID:** AG-ONNX-001
        *   **Açıklama:** TensorFlow/PyTorch modelinin ONNX formatına dönüştürülmesi için `tf2onnx` / `torch.onnx.export` fonksiyonunun kullanılması.
        *   **İlgili Modül:** `/home/ubuntu/ALT_LAS_Organized/Proje_Kodu/ai-orchestrator/model_converter.py`
        *   **Kullanılacak Kütüphane(ler):** `tensorflow` (v2.x, Apache 2.0), `tf2onnx` (v1.x, MIT), `onnx` (v1.x, Apache 2.0) VEYA `pytorch` (v1.x, BSD-benzeri), `onnx` (v1.x, Apache 2.0).
        *   **Bağımlılıklar/İlişkiler:** Dönüştürülen ONNX modelinin, TensorRT optimizasyon (Mikro Görev) adımı için girdi oluşturması.
        *   **Lisans Uyumluluğu:** Kullanılan kütüphaneler (TensorFlow/PyTorch, tf2onnx, onnx) ticari ve kapalı kaynak dağıtıma uygun.

## 2. Görev Tanımlama ve Sorumluluk

*   Her AI çalışanı (persona), kendi uzmanlık alanına ve sorumluluklarına giren Ana Görevler ve Alt Görevler için Makro, Mikro ve Atlas Görevlerini detaylandıracaktır. Bu detaylar, ilgili personanın `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/[Persona_Adi]_Ofisi/Calisma_Dosyalari/` altındaki görev tanım dosyalarında bulunacaktır.
*   Bu detaylandırma, `/home/ubuntu/ALT_LAS_Organized/Planlama_Ofisi/cuda_master_integration_plan.md` ve `/home/ubuntu/ALT_LAS_Organized/Planlama_Ofisi/persona_tasks_and_suggestions_phase1_tasks.md` dosyalarındaki mevcut plan ve görev tanımları üzerine inşa edilecektir.

## 3. Görev Tamamlama Kriterleri (Yeni Klasör Yapısına Uygun)

Kullanıcının belirttiği üzere, her seviyedeki görevin (özellikle Mikro ve Atlas görevlerinin tamamlanmasıyla sonuçlanan Alt Görevlerin) tamamlanması için aşağıdaki adımlar zorunlu olacaktır:

1.  **Raporlama:**
    *   Görevin sonuçları, karşılaşılan zorluklar ve elde edilen çıktılar hakkında kısa bir rapor hazırlanacaktır.
    *   Bu rapor, ilgili personanın ofisindeki `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/[Persona_Adi]_Ofisi/Raporlar/` klasörüne, görevi tanımlayan bir isimlendirme ile (örn: `AG-MIM-PLANREVIEW-001_rapor.md`) kaydedilecektir.
    *   Proje Yöneticisi, bu raporları periyodik olarak gözden geçirecek ve genel proje ilerleme raporlarına dahil edecektir.

2.  **Dokümantasyon Güncellemesi:**
    *   İlgili teknik dokümantasyon (kod içi yorumlar, `/home/ubuntu/ALT_LAS_Organized/Proje_Kodu/` altındaki README dosyaları, `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Genel_Belgeler/` altındaki wiki benzeri belgeler vb.) güncellenecektir.
    *   Örneğin, bir API değişikliği yapıldıysa, API sözleşmesi (`/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Genel_Belgeler/api_contracts.md` gibi merkezi bir yerde veya ilgili servis dokümanında) güncellenmelidir.
    *   Yapılan değişikliğin niteliğine göre, Yazılım Mimarı veya ilgili teknik persona dokümantasyonun doğruluğunu ve bütünlüğünü teyit edecektir.

3.  **GitHub Push:**
    *   Yapılan tüm kod değişiklikleri ve eklenen/güncellenen dokümantasyon dosyaları, projenin ana kod deposunun bulunduğu `/home/ubuntu/ALT_LAS_Organized/Proje_Kodu/` dizininden GitHub reposuna push edilecektir.
    *   Kullanıcı tarafından sağlanan `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` tokenı, bu push işlemleri için yapılandırılmış olmalıdır.
    *   Değişiklikler, genellikle `cuda_integration_feature_branch` gibi bir özellik dalına (feature branch) push edilecek, ardından ana dala (main/master) birleştirme (merge) işlemi için pull request (PR) açılacaktır.
    *   PR açıklamalarında, tamamlanan görev(ler) ve yapılan değişiklikler net bir şekilde belirtilmelidir.
    *   DevOps Mühendisi, CI/CD süreçlerinin bu push işlemlerini doğru şekilde tetiklediğinden ve testlerin başarıyla geçtiğinden emin olacaktır.

4.  **Persona Gelişim Kaydı:**
    *   İlgili AI çalışanı (persona), görevi tamamlarken öğrendiklerini, karşılaştığı zorlukları, geliştirdiği yetkinlikleri ve göreve dair özel notlarını, kendi ofisindeki `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/Persona_Ofisleri/[Persona_Adi]_Ofisi/persona_gelisimi.md` dosyasına ekleyecektir.
    *   Bu kayıt, personanın proje süresince gelişimini izlemek ve gelecekteki görevler için bir bilgi birikimi oluşturmak amacıyla tutulacaktır.
    *   Proje Yöneticisi, bu gelişim kayıtlarının düzenli olarak güncellenmesini teşvik edecektir.

5.  **Yönetici Ofisi Durum Güncellemesi:**
    *   Bir AI persona bir göreve başladığında ve bitirdiğinde, `/home/ubuntu/ALT_LAS_Organized/Yonetici_Ofisi/ofis_durumu.md` dosyasındaki "Koltuk Durumu" ve "Mevcut Aktif Görev" bilgileri Proje Yöneticisi veya görevli persona tarafından güncellenecektir. Bu, projenin anlık durumunu ve hangi personanın ne üzerinde çalıştığını takip etmeyi kolaylaştıracaktır.

Bu hiyerarşik yapı ve güncellenmiş tamamlama kriterleri, projenin karmaşıklığını yönetmeyi, ilerlemeyi daha şeffaf bir şekilde takip etmeyi ve her bir AI çalışanın katkılarını ve gelişimini yeni klasör yapısı içinde etkin bir şekilde belgelemeyi amaçlamaktadır.

