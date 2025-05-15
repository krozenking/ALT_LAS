# Görev Atama: CUDA Performans Test Planı Oluşturma

## Görev Tanım Bilgileri

*   **Görev ID:** QA-PERF-001
*   **Görev Adı:** CUDA Performans Test Planı Oluşturma
*   **Atanan Persona:** QA Mühendisi - Ayşe Kaya
*   **Atama Tarihi:** 2025-05-15
*   **İstenen Bitiş Tarihi (Tahmini):** 2025-05-22
*   **Öncelik:** P1
*   **Üst Görev(ler) (Varsa):** Yok
*   **Bağlı Olduğu Görev(ler) (Varsa):** DEVOPS-CUDA-001 (CUDA Uyumlu Geliştirme Ortamı Oluşturma)

## Görev Açıklaması ve Kapsamı

Bu görev, ALT\_LAS projesindeki CUDA ile hızlandırılmış fonksiyonların ve servislerin performansını ölçmek için detaylı bir performans test planı oluşturmayı kapsamaktadır. Bu plan, 95. ve 99. persentil yanıt sürelerini de içermelidir.

## Gerekli Girdiler

1.  **CUDA Uyumlu Geliştirme Ortamı:** (DEVOPS-CUDA-001 görevi tamamlandıktan sonra)
    *   **Kaynak/Konum:** Docker Hub'daki CUDA uyumlu geliştirme imajı
    *   **Format/Özellikler:** Çalışır durumda bir Docker container
    *   **Notlar:**
2.  **API Sözleşmeleri:** (ai-orchestrator ve segmentation-service için)
    *   **Kaynak/Konum:** Proje dokümantasyonu
    *   **Format/Özellikler:** API endpoint'leri, istek/yanıt formatları
    *   **Notlar:**
3.  **Kritik İş Akışları:** (ai-orchestrator ve segmentation-service için)
    *   **Kaynak/Konum:** Yazılım Mimarı tarafından belirlenecek
    *   **Format/Özellikler:** Kullanıcı senaryoları, veri akışları
    *   **Notlar:**

## Beklenen Çıktılar (Teslim Edilecekler)

1.  **Performans Test Planı Dokümanı:**
    *   **Teslim Edilecek Konum:** Yönetici Ofisi dokümanları
    *   **Format/Özellikler:** Markdown formatında, aşağıdaki bölümleri içeren:
        *   Giriş (Amaç, kapsam)
        *   Test Ortamı (Donanım, yazılım, konfigürasyon)
        *   Test Senaryoları (Kritik iş akışları için, girdi/çıktı tanımları ile)
        *   Ölçülecek Metrikler (Yanıt süresi, iş hacmi, kaynak kullanımı, hata oranları, 95p/99p yanıt süreleri)
        *   Test Araçları (Seçilen yük testi aracı ve gerekçesi)
        *   Test Prosedürü (Adım adım test yürütme talimatları)
        *   Raporlama (Test sonuçlarının nasıl raporlanacağı)
    *   **Notlar:** Plan, kolayca uygulanabilir ve tekrarlanabilir olmalıdır.
2.  **Yük Testi Scriptleri:** (Seçilen yük testi aracı için)
    *   **Teslim Edilecek Konum:** Proje kök dizini veya ilgili servislerin test klasörleri
    *   **Format/Özellikler:** Seçilen yük testi aracının formatına uygun (örn: Locustfile.py)
    *   **Notlar:** Scriptler, tanımlanan test senaryolarını uygulamalı ve metrikleri toplamalıdır.

## Kabul Kriterleri

*   Performans Test Planı Dokümanı, eksiksiz ve anlaşılır olmalıdır.
*   Test senaryoları, kritik iş akışlarını kapsamalıdır.
*   Ölçülecek metrikler, performansın doğru bir şekilde değerlendirilmesini sağlamalıdır.
*   Seçilen yük testi aracı, projenin gereksinimlerini karşılamalıdır.
*   Yük testi scriptleri, hatasız çalışmalı ve doğru metrikleri toplamalıdır.

## Ek Notlar ve Talimatlar

*   Bu görev, R002 riskini (Beklenen performans kazanımlarının CUDA entegrasyonu ile elde edilememesi) azaltmaya yöneliktir.
*   Lütfen, Yazılım Mimarı ve Kıdemli Backend Geliştirici ile işbirliği yaparak kritik iş akışlarını ve performans hedeflerini netleştirin.
*   DevOps Mühendisi ile iletişim halinde olarak, test ortamı gereksinimlerini belirleyin.
*   Grafana gibi araçlarla görselleştirilebilecek metrikler toplamaya özen gösterin.