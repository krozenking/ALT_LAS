# ALT_LAS Projesi - Alfa Sonrası Detaylı Görev Planı

**Tarih:** 09 Mayıs 2025
**Hazırlayan:** Yönetici
**Referans Belge:** yonetici_ana_mimari_ve_plan_iskeleti.md
**Konu:** Ana Mimari ve Geliştirme Planı İskeletinin Aşırı Detaylı Makro ve Mikro Görevlere Bölünmesi

## Genel Giriş

Bu belge, "ALT_LAS Projesi - Alfa Sonrası Ana Mimari ve Geliştirme Planı İskeleti" belgesinde ana hatları çizilen geliştirme fazlarının ve mimari bileşenlerinin, her biri için sorumlu uzmanlar, beklenen çıktılar, potansiyel bağımlılıklar ve alt görevler (mikro adımlar) bazında aşırı detaylandırılarak somut bir eylem planına dönüştürülmüş halidir. Bu detaylı plan, projenin Alfa ve sonraki aşamalarında tüm ekip üyeleri için net bir yol haritası sunmayı, görev takibini kolaylaştırmayı ve projenin hedeflerine ulaşmasını sağlamayı amaçlamaktadır.

---

## FAZ 1: Altyapı Güçlendirme ve Temel Entegrasyonlar (Tahmini Süre: 8-12 Hafta)

**Faz Hedefleri:**

*   Projenin çalışacağı temel Kubernetes altyapısını kurmak ve yapılandırmak.
*   Servisler arası iletişimi ve yönetimi kolaylaştıracak Service Mesh çözümünün temel entegrasyonunu sağlamak.
*   Sistemin sağlık durumunu ve performansını izlemek için merkezi bir izlenebilirlik platformu kurmak.
*   Yapay zeka modellerinin geliştirme ve dağıtım süreçlerini yönetmek için MLOps altyapısının temellerini atmak.
*   API Gateway üzerinde geliştirici deneyimini ve güvenliği artıracak temel iyileştirmeleri yapmak.
*   Veritabanı şema değişikliklerini yönetmek için standart araçları benimsemek.
*   Temel güvenlik iyileştirmelerini (özellikle sır yönetimi) başlatmak.
*   CI/CD pipeline'larına statik kod analizi ve temel güvenlik taramalarını ekleyerek yazılım kalitesini ve güvenliğini artırmak.

### 1.1. Kubernetes Altyapısının Kurulumu ve Yapılandırılması

*   **Sorumlu Uzmanlar:** DevOps Mühendisi (Can Tekin), Yazılım Mimarı (Elif Yılmaz)
*   **Tahmini Süre:** 2 Hafta
*   **Beklenen Çıktılar:**
    *   Seçilen yönetilen Kubernetes servisinin (EKS, GKE veya AKS) geliştirme, test ve üretim ortamları için kurulmuş ve temel konfigürasyonunun yapılmış olması.
    *   Temel ağ yapılandırmasının (VPC, subnetler, güvenlik grupları) tamamlanmış olması.
    *   Ingress controller (örn: Nginx Ingress) kurulumu ve konfigürasyonu.
    *   Kalıcı depolama (Persistent Storage) çözümlerinin (örn: EBS, Azure Disk, GCE Persistent Disk) K8s ile entegrasyonu.
    *   IaC (Terraform/Pulumi) ile K8s altyapı tanımının kodlanmış ve versiyonlanmış olması.
    *   Altyapı kurulum ve konfigürasyon dokümantasyonu.
*   **Bağımlılıklar:** Bulut sağlayıcı seçimi, bütçe onayı.
*   **Mikro Adımlar:**
    1.  **1.1.1. Kubernetes Platform Seçimi ve Araştırması (DevOps, Mimar):**
        *   EKS, GKE, AKS ve potansiyel on-premise çözümlerin maliyet, özellik, yönetim kolaylığı ve mevcut ekip yetkinlikleri açısından karşılaştırılması.
        *   Seçim kriterlerinin belirlenmesi ve yöneticiye sunulması.
        *   Nihai platform kararının verilmesi.
    2.  **1.1.2. Altyapı Tasarımı ve Planlaması (DevOps, Mimar):**
        *   Ağ mimarisi (VPC, alt ağlar, CIDR blokları, güvenlik grupları, NAT Gateway'ler) tasarımı.
        *   Worker node gruplarının (instance tipleri, sayıları, otomatik ölçeklendirme politikaları) planlanması.
        *   Depolama sınıfları (storage classes) ve kalıcı hacim (persistent volume) stratejisinin belirlenmesi.
        *   Ingress stratejisinin (load balancer tipi, SSL sonlandırma) planlanması.
        *   RBAC (Role-Based Access Control) ve güvenlik politikalarının K8s için tasarlanması.
    3.  **1.1.3. IaC Araç Seçimi ve Kurulumu (DevOps):**
        *   Terraform veya Pulumi arasında seçim yapılması.
        *   Seçilen IaC aracının yerel geliştirme ortamlarına ve CI/CD sistemine kurulumu.
        *   Temel IaC modül yapısının oluşturulması.
    4.  **1.1.4. Geliştirme Ortamı K8s Kümesinin Kurulumu (DevOps):**
        *   IaC scriptleri kullanılarak geliştirme ortamı için K8s kümesinin seçilen platformda kurulması.
        *   Temel ağ, depolama ve ingress controller konfigürasyonlarının yapılması.
        *   `kubectl` erişiminin ve Kubeconfig dosyalarının güvenli bir şekilde yönetilmesi.
    5.  **1.1.5. Test Ortamı K8s Kümesinin Kurulumu (DevOps):**
        *   IaC scriptleri kullanılarak test ortamı için K8s kümesinin kurulması.
        *   Geliştirme ortamı ile benzer konfigürasyonların uygulanması.
    6.  **1.1.6. Üretim Ortamı K8s Kümesinin Kurulumu (DevOps):**
        *   IaC scriptleri kullanılarak üretim ortamı için K8s kümesinin kurulması (daha yüksek güvenlik ve dayanıklılık önlemleriyle).
    7.  **1.1.7. Ingress Controller Kurulumu ve Konfigürasyonu (DevOps):**
        *   Seçilen Ingress Controller'ın (örn: Nginx, Traefik) tüm ortamlara kurulması.
        *   Temel yönlendirme kurallarının ve SSL/TLS sertifikalarının (Let's Encrypt ile otomatik veya manuel) yapılandırılması.
    8.  **1.1.8. Kalıcı Depolama Çözümlerinin Entegrasyonu (DevOps):**
        *   Bulut sağlayıcısının sunduğu kalıcı disk servislerinin K8s ile entegrasyonu.
        *   StorageClass tanımlarının yapılması.
    9.  **1.1.9. K8s Altyapı Dokümantasyonunun Hazırlanması (DevOps, Mimar):**
        *   Kurulum adımları, ağ diyagramları, konfigürasyon detayları ve erişim bilgilerini içeren dokümantasyonun oluşturulması.

### 1.2. Service Mesh (Istio/Linkerd) Temel Entegrasyonu

*   **Sorumlu Uzmanlar:** DevOps Mühendisi (Can Tekin), Yazılım Mimarı (Elif Yılmaz), Backend Geliştirici (Ahmet Çelik)
*   **Tahmini Süre:** 3 Hafta (1.1 ile paralel başlayabilir)
*   **Beklenen Çıktılar:**
    *   Seçilen Service Mesh çözümünün (Istio veya Linkerd) geliştirme ve test ortamlarındaki K8s kümelerine kurulmuş olması.
    *   En az 2-3 temel mikroservisin (örn: API Gateway, Segmentation Service) Service Mesh'e entegre edilmiş (sidecar proxy enjeksiyonu) olması.
    *   Servisler arası temel mTLS (mutual TLS) iletişiminin yapılandırılmış ve doğrulanmış olması.
    *   Service Mesh dashboard'u üzerinden temel trafik yönetimi ve izleme yeteneklerinin (örn: servis grafiği, temel metrikler) gözlemlenebilir olması.
    *   Entegrasyon dokümantasyonu ve ilk yapılandırma rehberi.
*   **Bağımlılıklar:** 1.1 (Kubernetes Altyapısının Kurulumu).
*   **Mikro Adımlar:**
    1.  **1.2.1. Service Mesh Platform Seçimi (Mimar, DevOps, Backend):**
        *   Istio ve Linkerd'in özellik seti, karmaşıklığı, performans etkisi ve topluluk desteği açısından karşılaştırılması.
        *   Proje ihtiyaçlarına en uygun platformun seçilmesi.
    2.  **1.2.2. Service Mesh Kurulumu (Geliştirme Ortamı) (DevOps):**
        *   Seçilen Service Mesh'in geliştirme K8s kümesine kurulumu (Helm chart veya operatör ile).
        *   Kontrol düzlemi (control plane) bileşenlerinin doğrulanması.
    3.  **1.2.3. Örnek Servislerin Service Mesh'e Entegrasyonu (DevOps, Backend):**
        *   API Gateway ve Segmentation Service için K8s deployment manifestolarının güncellenerek sidecar proxy enjeksiyonunun etkinleştirilmesi.
        *   Servislerin Service Mesh altında başarıyla çalıştığının doğrulanması.
    4.  **1.2.4. Temel mTLS Konfigürasyonu ve Doğrulaması (DevOps, Mimar):**
        *   Service Mesh üzerinde varsayılan mTLS politikalarının (örn: STRICT) etkinleştirilmesi.
        *   Servisler arası iletişimin şifrelendiğinin doğrulanması (trafik analizi, loglar).
    5.  **1.2.5. Service Mesh Dashboard ve Temel İzleme (DevOps):**
        *   Service Mesh'in sunduğu dashboard'a (örn: Kiali, Istio Dashboard) erişimin sağlanması.
        *   Servis grafiğinin, temel metriklerin (istek sayısı, hata oranları, gecikme süreleri) incelenmesi.
    6.  **1.2.6. Service Mesh Kurulumu (Test Ortamı) (DevOps):**
        *   Geliştirme ortamındaki adımların test K8s kümesi için tekrarlanması.
    7.  **1.2.7. Service Mesh Entegrasyon Dokümantasyonunun Hazırlanması (DevOps, Mimar):**
        *   Kurulum adımları, temel konfigürasyonlar ve sorun giderme ipuçlarını içeren dokümantasyon.

(... Diğer Faz 1 başlıkları ve Faz 2, 3, 4 için benzer detaylandırma yapılacaktır ...)




### 1.3. Merkezi İzlenebilirlik Platformu Kurulumu (Prometheus, Grafana, ELK/Loki, Jaeger)

*   **Sorumlu Uzmanlar:** DevOps Mühendisi (Can Tekin)
*   **Tahmini Süre:** 3 Hafta (1.1 ve 1.2 ile paralel başlayabilir)
*   **Beklenen Çıktılar:**
    *   Prometheus, Grafana, ELK Stack (veya Grafana Loki) ve Jaeger (veya Zipkin/OpenTelemetry Collector) geliştirme ve test ortamlarındaki K8s kümelerine kurulmuş ve temel konfigürasyonları yapılmış olması.
    *   Temel K8s metriklerinin (node, pod, container CPU/Memory/Network/Disk) Prometheus tarafından toplanıyor ve Grafana üzerinden görselleştiriliyor olması.
    *   En az bir servisin (örn: API Gateway) loglarının ELK/Loki tarafından toplanıyor ve Kibana/Grafana üzerinden aranabilir olması.
    *   En az iki servis arasında (örn: API Gateway -> Segmentation Service) dağıtık izlerin (distributed traces) Jaeger/Zipkin tarafından toplanıyor ve görselleştiriliyor olması.
    *   Temel dashboardların (K8s genel durumu, API Gateway performansı) Grafana üzerinde oluşturulmuş olması.
    *   İzlenebilirlik platformu kurulum ve temel kullanım dokümantasyonu.
*   **Bağımlılıklar:** 1.1 (Kubernetes Altyapısının Kurulumu).
*   **Mikro Adımlar:**
    1.  **1.3.1. İzlenebilirlik Araç Seti Seçimi ve Planlaması (DevOps, Mimar):**
        *   Log toplama için ELK Stack vs Grafana Loki karşılaştırması.
        *   Dağıtık izleme için Jaeger vs Zipkin vs OpenTelemetry Collector seçimi.
        *   Veri saklama politikaları ve depolama gereksinimlerinin planlanması.
    2.  **1.3.2. Prometheus ve Grafana Kurulumu (Geliştirme Ortamı) (DevOps):**
        *   Prometheus Operatörü ve Grafana Helm chart'ları kullanılarak K8s'e kurulum.
        *   Kube-state-metrics ve Node Exporter gibi bileşenlerin kurulumu.
        *   Prometheus'un K8s servislerini ve podlarını otomatik keşfetmesi (service discovery) için konfigürasyon.
        *   Grafana'da Prometheus veri kaynağının (data source) eklenmesi.
    3.  **1.3.3. Log Toplama Sistemi Kurulumu (ELK/Loki - Geliştirme Ortamı) (DevOps):**
        *   Elasticsearch, Logstash (veya Fluentd/Fluent Bit), Kibana (ELK için) veya Loki ve Promtail (Loki için) kurulumu.
        *   Konteyner loglarının merkezi sisteme yönlendirilmesi.
    4.  **1.3.4. Dağıtık İzleme Sistemi Kurulumu (Jaeger/Zipkin - Geliştirme Ortamı) (DevOps):**
        *   Jaeger Operatörü veya Zipkin Helm chart'ı kullanılarak K8s'e kurulum.
        *   Servislerin OpenTelemetry SDK'ları ile enstrümantasyonu için hazırlık (Backend ekibi ile koordinasyon).
    5.  **1.3.5. Temel Servislerin Enstrümantasyonu (Backend, DevOps):**
        *   API Gateway ve Segmentation Service'e OpenTelemetry SDK'larının eklenmesi ve temel izlerin (traces) gönderilmesi.
        *   Log formatlarının yapılandırılmış loglamaya (structured logging) uygun hale getirilmesi.
    6.  **1.3.6. Temel Grafana Dashboardlarının Oluşturulması (DevOps):**
        *   K8s küme genel sağlık durumu dashboard'u.
        *   API Gateway için temel performans metrikleri (istek sayısı, hata oranı, gecikme) dashboard'u.
    7.  **1.3.7. İzlenebilirlik Platformu Kurulumu (Test Ortamı) (DevOps):**
        *   Geliştirme ortamındaki adımların test K8s kümesi için tekrarlanması.
    8.  **1.3.8. İzlenebilirlik Platformu Dokümantasyonunun Hazırlanması (DevOps):**
        *   Kurulum, konfigürasyon, dashboard kullanımı ve temel sorun giderme adımlarını içeren dokümantasyon.

### 1.4. MLOps Altyapısının Temellerinin Atılması (MLflow, Kubeflow Temel Kurulum)

*   **Sorumlu Uzmanlar:** Veri Bilimcisi (Dr. Elif Demir), DevOps Mühendisi (Can Tekin)
*   **Tahmini Süre:** 2 Hafta (1.1 ile paralel başlayabilir)
*   **Beklenen Çıktılar:**
    *   MLflow (tracking server, artifact store, model registry) ve Kubeflow (temel pipeline yönetimi için) geliştirme ortamındaki K8s kümesine kurulmuş olması.
    *   En az bir basit makine öğrenmesi modelinin MLflow ile deney takibinin (experiment tracking) yapılmış olması.
    *   Modelin MLflow artifact store'a kaydedilmiş ve model registry'ye versiyonlanarak eklenmiş olması.
    *   Kubeflow Pipelines ile basit bir eğitim pipeline'ının (veri ön işleme -> eğitim -> değerlendirme) PoC olarak çalıştırılmış olması.
    *   MLOps altyapısı temel kurulum ve kullanım dokümantasyonu.
*   **Bağımlılıklar:** 1.1 (Kubernetes Altyapısının Kurulumu).
*   **Mikro Adımlar:**
    1.  **1.4.1. MLOps Araç Seti Seçimi ve Detaylı Planlama (Veri Bilimcisi, DevOps, Mimar):**
        *   MLflow, Kubeflow, Seldon Core, Feast gibi araçların proje ihtiyaçlarına göre değerlendirilmesi.
        *   Özellik deposu (feature store) ihtiyacının ve çözümünün belirlenmesi (Faz 1 için opsiyonel).
        *   Model sunumu (model serving) stratejisinin ilk değerlendirmesi.
    2.  **1.4.2. MLflow Kurulumu ve Konfigürasyonu (Geliştirme Ortamı) (DevOps, Veri Bilimcisi):**
        *   MLflow Tracking Server'ın K8s üzerinde konuşlandırılması.
        *   Artifact Store için S3/MinIO veya benzeri bir depolama çözümünün entegrasyonu.
        *   Model Registry için backend veritabanının (örn: PostgreSQL) yapılandırılması.
    3.  **1.4.3. Kubeflow Temel Kurulumu (Geliştirme Ortamı) (DevOps):**
        *   Kubeflow'un K8s üzerine kurulumu (sadece pipeline ve notebook özellikleri öncelikli).
        *   Kubeflow dashboard'una erişimin sağlanması.
    4.  **1.4.4. Örnek Model ile MLflow Deney Takibi PoC (Veri Bilimcisi):**
        *   Basit bir sınıflandırma veya regresyon modelinin (örn: scikit-learn tabanlı) MLflow ile entegrasyonu.
        *   Farklı parametrelerle yapılan eğitimlerin MLflow'a kaydedilmesi (parametreler, metrikler, artifact'ler).
        *   Modelin artifact olarak kaydedilmesi ve Model Registry'ye eklenmesi.
    5.  **1.4.5. Kubeflow Pipelines ile Basit Eğitim Pipeline PoC (Veri Bilimcisi, DevOps):**
        *   Basit bir eğitim pipeline'ının (veri yükleme, ön işleme, model eğitimi, model değerlendirme adımları) Kubeflow Pipelines DSL (Python SDK) ile tanımlanması.
        *   Pipeline'ın Kubeflow üzerinde çalıştırılması ve sonuçlarının izlenmesi.
    6.  **1.4.6. MLOps Altyapısı Temel Dokümantasyonunun Hazırlanması (Veri Bilimcisi, DevOps):**
        *   MLflow ve Kubeflow kurulum adımları, temel kullanım senaryoları ve örnek kodları içeren dokümantasyon.

### 1.5. API Gateway Geliştirmeleri (API Anahtar Yönetimi, Gelişmiş Caching)

*   **Sorumlu Uzmanlar:** Backend Geliştirici (Ahmet Çelik)
*   **Tahmini Süre:** 2 Hafta
*   **Beklenen Çıktılar:**
    *   API Gateway üzerinde API anahtarı tabanlı kimlik doğrulama ve yetkilendirme mekanizmasının implemente edilmiş olması.
    *   API anahtarlarının güvenli bir şekilde üretilmesi, saklanması ve yönetilmesi için bir süreç tanımlanmış olması.
    *   Sık erişilen ve nadiren değişen endpoint'ler için ETag/Last-Modified tabanlı veya Redis ile sunucu tarafı caching mekanizmasının implemente edilmiş olması.
    *   Geliştirilmiş API Gateway özelliklerinin dokümantasyonu ve test senaryoları.
*   **Bağımlılıklar:** Temel API Gateway yapısı.
*   **Mikro Adımlar:**
    1.  **1.5.1. API Anahtar Yönetimi Tasarımı (Backend, Mimar):**
        *   API anahtarı formatı, geçerlilik süresi, yetki kapsamı gibi özelliklerin belirlenmesi.
        *   Anahtar üretme, dağıtma, iptal etme ve yenileme süreçlerinin tasarlanması.
        *   Anahtarların güvenli depolanması için strateji (örn: HashiCorp Vault ile entegrasyon planı).
    2.  **1.5.2. API Anahtar Mekanizmasının API Gateway'e Entegrasyonu (Backend):**
        *   API isteklerinde anahtarın nasıl taşınacağının belirlenmesi (örn: Header).
        *   Anahtar doğrulama ve yetkilendirme mantığının API Gateway koduna eklenmesi.
    3.  **1.5.3. Gelişmiş Caching Stratejisi Tasarımı (Backend, Mimar):**
        *   Hangi endpoint'lerin caching için uygun olduğunun belirlenmesi.
        *   ETag/Last-Modified başlıklarının kullanımı veya Redis gibi harici bir cache store ile entegrasyon kararının verilmesi.
        *   Cache invalidation (önbellek geçersizleştirme) stratejilerinin belirlenmesi.
    4.  **1.5.4. Caching Mekanizmasının API Gateway'e Entegrasyonu (Backend):**
        *   Seçilen caching stratejisinin kodlanması ve API Gateway'e entegrasyonu.
    5.  **1.5.5. Birim ve Entegrasyon Testlerinin Yazılması (Backend, QA):**
        *   API anahtar yönetimi ve caching özelliklerinin doğruluğunu teyit eden test senaryolarının oluşturulması ve çalıştırılması.
    6.  **1.5.6. API Gateway Dokümantasyonunun Güncellenmesi (Backend):**
        *   Yeni eklenen özelliklerin (API anahtarı kullanımı, caching davranışları) geliştirici dokümantasyonuna eklenmesi.

### 1.6. Veritabanı Göç Araçlarının Standartlaştırılması (Backend, DevOps)

*   **Sorumlu Uzmanlar:** Backend Geliştirici (Ahmet Çelik), DevOps Mühendisi (Can Tekin)
*   **Tahmini Süre:** 1 Hafta
*   **Beklenen Çıktılar:**
    *   Projedeki tüm servisler için (PostgreSQL, MongoDB vb. kullanan) standart bir veritabanı göç (migration) aracının (örn: Flyway, Alembic, migrate-mongo) seçilmiş ve entegre edilmiş olması.
    *   Mevcut veritabanı şemalarının ilk göç script'lerinin oluşturulmuş olması.
    *   Veritabanı göçlerinin CI/CD pipeline'larına entegre edilmesi için bir strateji belirlenmiş olması.
    *   Veritabanı göç süreci dokümantasyonu.
*   **Bağımlılıklar:** Mevcut servislerin veritabanı yapıları.
*   **Mikro Adımlar:**
    1.  **1.6.1. Veritabanı Göç Aracı Seçimi (Backend, DevOps, Mimar):**
        *   Projedeki farklı veritabanı teknolojileri (PostgreSQL, MongoDB vb.) için uygun göç araçlarının araştırılması (Flyway, Liquibase, Alembic, migrate-mongo vb.).
        *   Her teknoloji için standart bir aracın seçilmesi.
    2.  **1.6.2. Göç Aracının Servislere Entegrasyonu (Backend):**
        *   Seçilen göç aracının her bir servisin geliştirme ortamına ve projesine entegre edilmesi.
        *   Mevcut şemalar için başlangıç (baseline) göç script'lerinin oluşturulması.
    3.  **1.6.3. Göç Scriptlerinin Versiyon Kontrolüne Eklenmesi (Backend):**
        *   Tüm göç script'lerinin Git repositorisine eklenmesi.
    4.  **1.6.4. CI/CD Entegrasyon Stratejisinin Planlanması (DevOps, Backend):**
        *   Veritabanı göçlerinin dağıtım pipeline'larında hangi aşamada ve nasıl çalıştırılacağının belirlenmesi (örn: uygulama dağıtımından önce).
        *   Rollback stratejilerinin değerlendirilmesi.
    5.  **1.6.5. Veritabanı Göç Süreci Dokümantasyonunun Hazırlanması (Backend, DevOps):**
        *   Yeni göç script'i oluşturma, çalıştırma ve sorun giderme adımlarını içeren dokümantasyon.

### 1.7. Temel Güvenlik İyileştirmeleri (Vault Entegrasyonu Başlangıcı)

*   **Sorumlu Uzmanlar:** DevOps Mühendisi (Can Tekin), Yazılım Mimarı (Elif Yılmaz)
*   **Tahmini Süre:** 2 Hafta (1.1 ile paralel başlayabilir)
*   **Beklenen Çıktılar:**
    *   HashiCorp Vault'un geliştirme ve test ortamlarındaki K8s kümelerine kurulmuş ve temel konfigürasyonunun yapılmış olması.
    *   En az bir servis için veritabanı şifreleri veya API anahtarları gibi hassas bilgilerin Vault'a taşınmış ve servis tarafından Vault üzerinden okunuyor olması.
    *   Vault erişim politikalarının (policies) ve kimlik doğrulama metotlarının (auth methods, örn: Kubernetes Auth Method) temel düzeyde yapılandırılmış olması.
    *   Vault kurulumu ve temel sır yönetimi dokümantasyonu.
*   **Bağımlılıklar:** 1.1 (Kubernetes Altyapısının Kurulumu).
*   **Mikro Adımlar:**
    1.  **1.7.1. Sır Yönetimi Stratejisi ve Vault Planlaması (Mimar, DevOps):**
        *   Hangi tür sırların (veritabanı credentials, API tokenları, sertifikalar vb.) Vault'ta yönetileceğinin belirlenmesi.
        *   Vault için depolama backend'i (storage backend) ve HA (High Availability) stratejisinin planlanması.
        *   Erişim politikaları ve kimlik doğrulama yöntemlerinin genel hatlarıyla tasarlanması.
    2.  **1.7.2. Vault Kurulumu (Geliştirme Ortamı) (DevOps):**
        *   Vault Helm chart'ı kullanılarak K8s üzerine kurulum.
        *   Vault'un başlatılması (initialize) ve unseal edilmesi. Root token'ın güvenli bir şekilde saklanması.
        *   Temel depolama backend'inin (örn: Consul, entegre Raft storage) yapılandırılması.
    3.  **1.7.3. Kubernetes Auth Method Konfigürasyonu (DevOps):**
        *   Vault'un K8s ile entegrasyonu için Kubernetes Auth Method'un etkinleştirilmesi.
        *   Servislerin K8s Service Account'ları üzerinden Vault'a kimlik doğrulaması yapabilmesi için rollerin ve politikaların tanımlanması.
    4.  **1.7.4. Örnek Servis Sırlarının Vault'a Taşınması (DevOps, Backend):**
        *   API Gateway veya Segmentation Service'in veritabanı şifresinin Vault'a KV (Key-Value) store olarak eklenmesi.
        *   Servis kodunun, başlangıçta bu sırrı Vault'tan okuyacak şekilde güncellenmesi (Vault Agent veya SDK kullanımı).
    5.  **1.7.5. Vault Kurulumu (Test Ortamı) (DevOps):**
        *   Geliştirme ortamındaki adımların test K8s kümesi için tekrarlanması.
    6.  **1.7.6. Vault Temel Kullanım Dokümantasyonunun Hazırlanması (DevOps, Mimar):**
        *   Kurulum, unseal süreci, temel politika ve auth method yönetimi, sır ekleme/okuma adımlarını içeren dokümantasyon.

### 1.8. CI/CD Pipeline'larına Statik Kod Analizi ve Temel Güvenlik Taramalarının Eklenmesi

*   **Sorumlu Uzmanlar:** DevOps Mühendisi (Can Tekin), QA Mühendisi (Ayşe Kaya)
*   **Tahmini Süre:** 2 Hafta
*   **Beklenen Çıktılar:**
    *   SonarQube (veya benzeri bir statik kod analiz aracı) entegrasyonunun CI pipeline'larına eklenmiş olması ve her birleştirme isteği (pull request) için kod kalitesi, bug'lar ve güvenlik açıkları hakkında rapor üretmesi.
    *   Trivy (veya Clair/Snyk) gibi bir konteyner imaj tarama aracının CI pipeline'larına eklenmiş olması ve üretilen Docker imajlarında bilinen güvenlik açıklarını taraması.
    *   OWASP Dependency-Check (veya Snyk) gibi bir bağımlılık tarama aracının CI pipeline'larına eklenmiş olması ve projelerin kullandığı kütüphanelerdeki bilinen zafiyetleri raporlaması.
    *   Bu taramaların sonuçlarının CI/CD arayüzünde ve/veya birleştirme isteği yorumlarında görünür olması.
    *   Entegrasyon dokümantasyonu ve rapor okuma rehberi.
*   **Bağımlılıklar:** Mevcut CI/CD pipeline'ları (GitHub Actions).
*   **Mikro Adımlar:**
    1.  **1.8.1. Statik Kod Analiz Aracı Seçimi ve Kurulumu (DevOps, QA, Mimar):**
        *   SonarQube, CodeClimate, Codacy gibi araçların karşılaştırılması.
        *   Seçilen aracın (örn: SonarQube) sunucu kurulumu veya bulut servisinin konfigürasyonu.
    2.  **1.8.2. SonarQube Entegrasyonunun CI Pipeline'ına Eklenmesi (DevOps):**
        *   GitHub Actions workflow'larının, her build sırasında SonarScanner'ı çalıştıracak ve sonuçları SonarQube sunucusuna gönderecek şekilde güncellenmesi.
        *   Kalite kapıları (Quality Gates) için temel kuralların tanımlanması.
    3.  **1.8.3. Konteyner İmaj Tarama Aracı Seçimi ve Entegrasyonu (DevOps):**
        *   Trivy, Clair, Snyk Container gibi araçların karşılaştırılması.
        *   Seçilen aracın (örn: Trivy) CI pipeline'ına (Docker imajı build edildikten sonra) entegre edilmesi.
        *   Tarama sonuçlarının raporlanması ve kritik zafiyetlerde build'in fail etmesi için konfigürasyon.
    4.  **1.8.4. Bağımlılık Tarama Aracı Seçimi ve Entegrasyonu (DevOps):**
        *   OWASP Dependency-Check, Snyk Open Source gibi araçların karşılaştırılması.
        *   Seçilen aracın CI pipeline'ına (proje bağımlılıkları kurulduktan sonra) entegre edilmesi.
        *   Tarama sonuçlarının raporlanması.
    5.  **1.8.5. Raporlama ve Bildirim Mekanizmalarının Ayarlanması (DevOps):**
        *   Tarama sonuçlarının GitHub PR yorumları, Slack bildirimleri veya CI/CD arayüzünde özetlenmesi.
    6.  **1.8.6. Güvenlik Tarama Araçları Kullanım Dokümantasyonunun Hazırlanması (DevOps, QA):**
        *   Raporların nasıl okunacağı, false positive'lerin nasıl yönetileceği ve bulunan zafiyetlerin nasıl giderileceğine dair rehber.

---

## FAZ 2: Servis Olgunlaştırma ve Gelişmiş Özellikler (Tahmini Süre: 10-16 Hafta)

**Faz Hedefleri:**

*   Tüm mikroservislerin Kubernetes üzerinde stabil ve optimize bir şekilde çalışmasını sağlamak.
*   Archive Service için Elasticsearch entegrasyonunu tamamlayarak gelişmiş arama ve analiz yetenekleri kazandırmak.
*   Segmentation Service'in NLP yeteneklerini önemli ölçüde artırmak.
*   Asenkron iletişim paternlerini yaygınlaştırarak sistemin genel dayanıklılığını ve performansını artırmak.
*   Kullanıcı deneyimini zenginleştirecek kişiselleştirme motorunun ilk sürümünü hayata geçirmek.
*   UI-Desktop ve UI-Web arayüzlerinde performans ve erişilebilirlik standartlarını yükseltmek.
*   Kapsamlı bir test otomasyon framework'ü kurarak regresyon testlerini otomatize etmek.
*   Detaylı kullanıcı araştırmaları yaparak UX'i sürekli iyileştirmek.

(... Faz 2, 3 ve 4 için benzer detaylandırma yapılacaktır ...)


