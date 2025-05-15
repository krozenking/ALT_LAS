# Görev Atama: CUDA Uyumlu Geliştirme Ortamı Oluşturma

## Görev Tanım Bilgileri

*   **Görev ID:** DEVOPS-CUDA-001
*   **Görev Adı:** CUDA Uyumlu Geliştirme Ortamı Oluşturma
*   **Atanan Persona:** DevOps Mühendisi - Can Tekin
*   **Atama Tarihi:** 2025-05-15
*   **İstenen Bitiş Tarihi (Tahmini):** 2025-05-22
*   **Öncelik:** P1
*   **Üst Görev(ler) (Varsa):** Yok
*   **Bağlı Olduğu Görev(ler) (Varsa):** Yok

## Görev Açıklaması ve Kapsamı

Bu görev, ALT\_LAS projesi için CUDA tabanlı geliştirmeler yapacak olan geliştiricilerin ve QA ekibinin kullanabileceği, standartlaştırılmış ve güncel bir geliştirme ortamı oluşturmayı kapsamaktadır. Bu ortam, Docker imajı olarak sağlanacak ve gerekli tüm CUDA araçlarını ve bağımlılıklarını içerecektir.

## Gerekli Girdiler

1.  **CUDA Toolkit Versiyonu:** (Aşağıdaki notlara göre belirlenecek)
    *   **Kaynak/Konum:** NVIDIA'nın web sitesi veya sistemdeki DxDiag.txt dosyası
    *   **Format/Özellikler:** Belirtilen ekran kartı ve sürücü ile uyumlu bir versiyon
    *   **Notlar:** NVIDIA GeForce RTX 4060 ekran kartı ve 32.0.15.7283 sürücüsü ile uyumlu bir CUDA Toolkit versiyonu seçilmelidir.
2.  **Python Versiyonu:** 3.11
    *   **Kaynak/Konum:** Dockerfile
    *   **Format/Özellikler:** Python 3.11
    *   **Notlar:** Proje genelinde kullanılan Python versiyonu ile uyumlu olmalıdır.
3.  **Gerekli Python Kütüphaneleri:** requirements.txt ve requirements-gpu.txt dosyalarındaki tüm kütüphaneler
    *   **Kaynak/Konum:** Proje kök dizini
    *   **Format/Özellikler:** pip uyumlu requirements dosyaları
    *   **Notlar:** TensorFlow, PyTorch, CuPy, Numba ve RAPIDS gibi kütüphanelerin en güncel CUDA uyumlu versiyonları kurulmalıdır.
4.  **Docker Hub Hesabı:** (İmajın push edileceği hesap)
    *   **Kaynak/Konum:** Proje yöneticisi tarafından sağlanacak
    *   **Format/Özellikler:** Geçerli bir Docker Hub kullanıcı adı ve şifresi
    *   **Notlar:**

## Beklenen Çıktılar (Teslim Edilecekler)

1.  **Dockerfile.dev:** CUDA uyumlu geliştirme ortamını tanımlayan Dockerfile
    *   **Teslim Edilecek Konum:** Proje kök dizini
    *   **Format/Özellikler:** Dockerfile formatında, gerekli tüm kurulum adımlarını içeren
    *   **Notlar:** Dockerfile, kolayca build edilebilir ve çalıştırılabilir olmalıdır.
2.  **Docker Immajı:** Oluşturulan Dockerfile'dan build edilmiş, CUDA uyumlu geliştirme ortamını içeren Docker imajı
    *   **Teslim Edilecek Konum:** Docker Hub (belirtilen hesap altında)
    *   **Format/Özellikler:** Etiketlenmiş ve versiyonlanmış (örn: altlas-dev:cuda-11.8-py3.11-v1.0)
    *   **Notlar:** İmaj, minimum boyutta olmalı ve gereksiz bağımlılıklar içermemelidir.
3.  **Kurulum ve Kullanım Talimatları:** Geliştirme ortamının nasıl kurulacağını ve kullanılacağını açıklayan bir README dosyası
    *   **Teslim Edilecek Konum:** Proje kök dizini veya Yönetici Ofisi dokümanları
    *   **Format/Özellikler:** Markdown formatında, adım adım talimatlar içeren
    *   **Notlar:** Talimatlar, yeni başlayanlar için bile kolayca anlaşılabilir olmalıdır.

## Kabul Kriterleri

*   Dockerfile, belirtilen CUDA Toolkit ve NVIDIA sürücü versiyonu ile uyumlu olmalıdır.
*   Docker imajı, başarıyla build edilmeli ve çalıştırılabilmelidir.
*   İmaj içinde, gerekli tüm Python kütüphaneleri ve araçları kurulmuş olmalıdır.
*   Geliştirme ortamı, temel CUDA örneklerini çalıştırabilmelidir.
*   Kurulum ve kullanım talimatları açık, anlaşılır ve eksiksiz olmalıdır.
*   İmaj, Docker Hub'a başarıyla push edilmiş olmalıdır.

## Ek Notlar ve Talimatlar

*   Bu görev, R001 riskini (CUDA Toolkit ve NVIDIA sürücü versiyonları arasında uyumsuzluk sorunları) azaltmaya yöneliktir.
*   Lütfen, NVIDIA'nın dökümantasyonunu ve uyumluluk tablolarını inceleyerek doğru CUDA Toolkit ve NVIDIA sürücü versiyonlarını seçin.
*   Oluşturulan Docker imajının boyutunu optimize etmeye özen gösterin.
*   İmajın, farklı geliştiriciler tarafından kolayca kullanılabilir olduğundan emin olun.
*   Bu görev tamamlandıktan sonra, QA Mühendisi'ne performans testleri tasarlama görevi atanacaktır.