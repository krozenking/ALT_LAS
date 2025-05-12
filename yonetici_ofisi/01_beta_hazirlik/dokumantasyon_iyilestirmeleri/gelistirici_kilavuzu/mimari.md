# ALT_LAS Mimari Dokümantasyonu

**Versiyon:** 2.0.0  
**Son Güncelleme:** 16 Haziran 2025  
**Hazırlayan:** Ahmet Yılmaz (Yazılım Mühendisi)

## 1. Genel Bakış

ALT_LAS, mikroservis mimarisi üzerine kurulmuş, Docker ve Kubernetes ile dağıtılan bir sistemdir. Bu dokümantasyon, ALT_LAS'ın mimari yapısını, bileşenlerini ve bunların birbirleriyle nasıl etkileşime girdiğini açıklamaktadır.

## 2. Mimari Prensipler

ALT_LAS mimarisi, aşağıdaki prensiplere dayanmaktadır:

- **Mikroservis Mimarisi**: Sistem, bağımsız olarak dağıtılabilen ve ölçeklendirilebilen küçük servislere ayrılmıştır.
- **API-First Yaklaşımı**: Tüm servisler, iyi tanımlanmış API'ler aracılığıyla iletişim kurar.
- **Konteynerizasyon**: Tüm servisler, Docker konteynerleri olarak paketlenmiştir.
- **Orkestrasyon**: Servisler, Kubernetes ile orkestrasyon edilir.
- **Durumsuzluk (Statelessness)**: Servisler, mümkün olduğunca durumsuz tasarlanmıştır.
- **Asenkron İletişim**: Servisler arasındaki iletişim, mümkün olduğunca asenkron mesajlaşma ile gerçekleştirilir.
- **Yüksek Kullanılabilirlik**: Sistem, tek arıza noktalarını ortadan kaldıracak şekilde tasarlanmıştır.
- **Ölçeklenebilirlik**: Sistem, yatay ve dikey olarak ölçeklenebilir.
- **Güvenlik**: Güvenlik, tasarımın ayrılmaz bir parçasıdır.
- **Gözlemlenebilirlik**: Sistem, kapsamlı izleme, günlük kaydı ve uyarı mekanizmaları ile donatılmıştır.

## 3. Sistem Mimarisi

ALT_LAS, aşağıdaki ana bileşenlerden oluşmaktadır:

![Sistem Mimarisi](../assets/system-architecture.png)

### 3.1. API Gateway

API Gateway, tüm istemci isteklerinin giriş noktasıdır. Aşağıdaki işlevleri yerine getirir:

- İstek yönlendirme
- Kimlik doğrulama ve yetkilendirme
- Hız sınırlama
- İstek doğrulama
- Önbellek
- API versiyonlama
- Dokümantasyon

API Gateway, Spring Cloud Gateway üzerine kurulmuştur ve JWT tabanlı kimlik doğrulama kullanır.

### 3.2. Segmentation Service

Segmentation Service, görüntü segmentasyonu işlemlerini gerçekleştirir. Aşağıdaki işlevleri yerine getirir:

- Görüntü segmentasyonu
- Segmentasyon algoritmaları yönetimi
- Segmentasyon sonuçlarının kaydedilmesi
- Segmentasyon sonuçlarının görselleştirilmesi

Segmentation Service, Python ve FastAPI üzerine kurulmuştur ve TensorFlow, PyTorch gibi derin öğrenme çerçevelerini kullanır.

### 3.3. Runner Service

Runner Service, iş sırası yönetimini gerçekleştirir. Aşağıdaki işlevleri yerine getirir:

- İş sırası yönetimi
- İş durumu izleme
- İş sonuçlarının kaydedilmesi
- İş sonuçlarının bildirilmesi
- İş önceliklendirme
- İş zamanlama
- İş bağımlılıkları

Runner Service, Java ve Spring Boot üzerine kurulmuştur ve RabbitMQ mesaj kuyruğu kullanır.

### 3.4. Archive Service

Archive Service, veri arşivleme işlemlerini gerçekleştirir. Aşağıdaki işlevleri yerine getirir:

- Veri arşivleme
- Arşiv arama
- Arşiv indirme
- Arşiv silme
- Arşiv versiyonlama
- Arşiv paylaşımı

Archive Service, Go üzerine kurulmuştur ve MinIO veya S3 gibi nesne depolama sistemleri kullanır.

### 3.5. AI Orchestrator

AI Orchestrator, yapay zeka modellerinin yönetimini gerçekleştirir. Aşağıdaki işlevleri yerine getirir:

- AI model yönetimi
- AI iş akışı yönetimi
- AI sonuçlarının kaydedilmesi
- AI sonuçlarının görselleştirilmesi
- Model versiyonlama
- Model performans izleme
- Model dağıtımı

AI Orchestrator, Python ve Flask üzerine kurulmuştur ve MLflow, Kubeflow gibi ML operasyon araçlarını kullanır.

### 3.6. Veritabanları

ALT_LAS, farklı servisler için farklı veritabanları kullanır:

- **PostgreSQL**: API Gateway, Runner Service ve AI Orchestrator için ilişkisel veritabanı
- **MongoDB**: Segmentation Service için doküman veritabanı
- **Elasticsearch**: Archive Service için arama veritabanı
- **Redis**: Önbellek ve oturum yönetimi için

### 3.7. Mesaj Kuyruğu

ALT_LAS, servisler arası asenkron iletişim için RabbitMQ mesaj kuyruğu kullanır. Aşağıdaki mesaj türleri tanımlanmıştır:

- **JobCreated**: Yeni bir iş oluşturulduğunda
- **JobUpdated**: Bir işin durumu güncellendiğinde
- **JobCompleted**: Bir iş tamamlandığında
- **JobFailed**: Bir iş başarısız olduğunda
- **FileUploaded**: Yeni bir dosya yüklendiğinde
- **FileDeleted**: Bir dosya silindiğinde
- **ModelDeployed**: Yeni bir model dağıtıldığında
- **ModelUndeployed**: Bir model dağıtımı kaldırıldığında

### 3.8. Frontend

ALT_LAS frontend'i, React ve TypeScript üzerine kurulmuştur. Frontend, aşağıdaki bileşenlerden oluşmaktadır:

- **UI Bileşenleri**: Düğmeler, formlar, tablolar vb.
- **Sayfalar**: Ana sayfa, segmentasyon, iş yönetimi, arşiv, AI modelleri vb.
- **Servis Katmanı**: API istekleri için
- **Durum Yönetimi**: Redux ile
- **Yönlendirme**: React Router ile
- **Tema ve Stil**: Styled Components ile

## 4. Servis Etkileşimleri

Servisler arasındaki etkileşimler, aşağıdaki diyagramda gösterilmiştir:

![Servis Etkileşimleri](../assets/service-interactions.png)

### 4.1. Segmentasyon İş Akışı

1. Kullanıcı, frontend aracılığıyla bir segmentasyon işi oluşturur.
2. İstek, API Gateway üzerinden Runner Service'e yönlendirilir.
3. Runner Service, işi veritabanına kaydeder ve bir JobCreated mesajı yayınlar.
4. Segmentation Service, JobCreated mesajını alır ve segmentasyon işlemini başlatır.
5. Segmentasyon işlemi tamamlandığında, Segmentation Service bir JobCompleted mesajı yayınlar.
6. Runner Service, JobCompleted mesajını alır ve iş durumunu günceller.
7. Archive Service, JobCompleted mesajını alır ve segmentasyon sonuçlarını arşivler.
8. Kullanıcı, frontend aracılığıyla segmentasyon sonuçlarını görüntüler.

### 4.2. AI Model Dağıtım İş Akışı

1. Kullanıcı, frontend aracılığıyla bir AI modelini dağıtmak ister.
2. İstek, API Gateway üzerinden AI Orchestrator'a yönlendirilir.
3. AI Orchestrator, model dağıtım işlemini başlatır.
4. Model dağıtımı tamamlandığında, AI Orchestrator bir ModelDeployed mesajı yayınlar.
5. Runner Service, ModelDeployed mesajını alır ve ilgili işleri günceller.
6. Segmentation Service, ModelDeployed mesajını alır ve yeni modeli kullanmaya başlar.
7. Kullanıcı, frontend aracılığıyla model durumunu görüntüler.

## 5. Dağıtım Mimarisi

ALT_LAS, Kubernetes üzerinde dağıtılır. Dağıtım mimarisi, aşağıdaki diyagramda gösterilmiştir:

![Dağıtım Mimarisi](../assets/deployment-architecture.png)

### 5.1. Kubernetes Cluster

ALT_LAS, aşağıdaki node havuzlarına sahip bir Kubernetes cluster üzerinde çalışır:

- **Genel Node Havuzu**: API Gateway, Runner Service ve Archive Service için
- **CPU-Optimized Node Havuzu**: Segmentation Service ve AI Orchestrator için
- **Memory-Optimized Node Havuzu**: Veritabanları ve mesaj kuyruğu için

### 5.2. Kubernetes Kaynakları

ALT_LAS, aşağıdaki Kubernetes kaynaklarını kullanır:

- **Deployment**: Stateless servisler için
- **StatefulSet**: Veritabanları ve mesaj kuyruğu için
- **Service**: Servisler arası iletişim için
- **Ingress**: Dış erişim için
- **ConfigMap**: Yapılandırma için
- **Secret**: Hassas veriler için
- **PersistentVolume**: Kalıcı depolama için
- **HorizontalPodAutoscaler**: Otomatik ölçeklendirme için
- **NetworkPolicy**: Ağ güvenliği için
- **PodDisruptionBudget**: Yüksek kullanılabilirlik için

### 5.3. Servis Mesh

ALT_LAS, servisler arası iletişim için Istio servis mesh kullanır. Istio, aşağıdaki özellikleri sağlar:

- Trafik yönetimi
- Güvenlik
- Gözlemlenebilirlik
- Politika yönetimi

### 5.4. CI/CD Pipeline

ALT_LAS, aşağıdaki adımları içeren bir CI/CD pipeline kullanır:

1. Kod değişikliklerinin GitHub'a push edilmesi
2. GitHub Actions ile otomatik testlerin çalıştırılması
3. Docker imajlarının oluşturulması ve Docker Hub'a push edilmesi
4. Kubernetes manifestolarının güncellenmesi
5. ArgoCD ile Kubernetes cluster'a dağıtım

## 6. Güvenlik Mimarisi

ALT_LAS, aşağıdaki güvenlik mekanizmalarını kullanır:

### 6.1. Kimlik Doğrulama ve Yetkilendirme

- JWT tabanlı kimlik doğrulama
- RBAC (Role-Based Access Control)
- OAuth 2.0 ve OpenID Connect desteği

### 6.2. Ağ Güvenliği

- TLS/SSL şifreleme
- Kubernetes NetworkPolicy
- Istio mTLS
- API Gateway güvenlik duvarı

### 6.3. Veri Güvenliği

- Veritabanı şifreleme
- Hassas verilerin maskelenmesi
- Veri sızıntısı önleme

### 6.4. Konteyner Güvenliği

- Minimal temel imajlar
- Konteyner tarama
- Pod güvenlik politikaları
- Root olmayan kullanıcılar

## 7. Gözlemlenebilirlik Mimarisi

ALT_LAS, aşağıdaki gözlemlenebilirlik mekanizmalarını kullanır:

### 7.1. İzleme (Monitoring)

- Prometheus ile metrik toplama
- Grafana ile metrik görselleştirme
- Alertmanager ile uyarı yönetimi

### 7.2. Günlük Kaydı (Logging)

- Fluentd ile günlük toplama
- Elasticsearch ile günlük depolama
- Kibana ile günlük görselleştirme

### 7.3. İzleme (Tracing)

- Jaeger ile dağıtık izleme
- OpenTelemetry ile enstrümantasyon

## 8. Ölçeklenebilirlik Mimarisi

ALT_LAS, aşağıdaki ölçeklenebilirlik mekanizmalarını kullanır:

### 8.1. Yatay Ölçeklendirme

- Kubernetes HorizontalPodAutoscaler
- CPU ve bellek kullanımına dayalı otomatik ölçeklendirme
- Özel metriklerle ölçeklendirme

### 8.2. Dikey Ölçeklendirme

- Kaynak limitlerinin ve isteklerinin optimize edilmesi
- Node havuzlarının boyutlandırılması

### 8.3. Veritabanı Ölçeklendirme

- Veritabanı sharding
- Read replica'lar
- Bağlantı havuzu optimizasyonu

### 8.4. Önbellek Stratejisi

- Redis önbellek
- API Gateway önbelleği
- CDN entegrasyonu

## 9. Mimari Kararlar ve Gerekçeler

Bu bölümde, ALT_LAS mimarisinde alınan önemli kararlar ve bunların gerekçeleri açıklanmaktadır.

### 9.1. Mikroservis Mimarisi

**Karar**: Sistem, mikroservis mimarisi üzerine kurulmuştur.

**Gerekçe**: Mikroservis mimarisi, aşağıdaki avantajları sağlar:
- Bağımsız dağıtım ve ölçeklendirme
- Teknoloji çeşitliliği
- Hata izolasyonu
- Daha kolay bakım ve geliştirme
- Ekip otonomisi

### 9.2. Farklı Programlama Dilleri

**Karar**: Farklı servisler için farklı programlama dilleri kullanılmıştır.

**Gerekçe**: Her servis için en uygun programlama dili seçilmiştir:
- Segmentation Service ve AI Orchestrator için Python (ML kütüphaneleri için)
- Runner Service için Java (kurumsal özellikler için)
- Archive Service için Go (performans için)
- Frontend için TypeScript (tip güvenliği için)

### 9.3. Asenkron İletişim

**Karar**: Servisler arası iletişim için asenkron mesajlaşma kullanılmıştır.

**Gerekçe**: Asenkron mesajlaşma, aşağıdaki avantajları sağlar:
- Gevşek bağlantı
- Daha iyi ölçeklenebilirlik
- Daha yüksek dayanıklılık
- Yük dengeleme
- Zirve yüklerini yönetme

### 9.4. Kubernetes Orkestrasyon

**Karar**: Konteyner orkestrasyon için Kubernetes kullanılmıştır.

**Gerekçe**: Kubernetes, aşağıdaki avantajları sağlar:
- Otomatik ölçeklendirme
- Kendini iyileştirme
- Servis keşfi
- Yük dengeleme
- Deklaratif yapılandırma
- Geniş ekosistem

## 10. Gelecek Mimari Geliştirmeler

ALT_LAS mimarisi için planlanan gelecek geliştirmeler aşağıdaki gibidir:

- **Serverless Bileşenler**: Bazı işlevler için AWS Lambda veya Knative gibi serverless çözümler
- **GraphQL API**: REST API'ye ek olarak GraphQL API desteği
- **Çoklu Bölge Dağıtımı**: Yüksek kullanılabilirlik için çoklu bölge dağıtımı
- **Hibrit Bulut Desteği**: Farklı bulut sağlayıcıları ve on-premise dağıtım desteği
- **Daha Fazla AI Entegrasyonu**: Daha fazla AI modeli ve algoritma desteği
- **Gerçek Zamanlı İşleme**: Streaming veri işleme yetenekleri
- **Blockchain Entegrasyonu**: Veri bütünlüğü ve izlenebilirlik için blockchain entegrasyonu

## 11. Mimari Diyagramlar

Bu bölümde, ALT_LAS mimarisini gösteren çeşitli diyagramlar bulunmaktadır.

### 11.1. Sistem Bağlam Diyagramı

![Sistem Bağlam Diyagramı](../assets/system-context-diagram.png)

### 11.2. Konteyner Diyagramı

![Konteyner Diyagramı](../assets/container-diagram.png)

### 11.3. Bileşen Diyagramı

![Bileşen Diyagramı](../assets/component-diagram.png)

### 11.4. Sıralama Diyagramı

![Sıralama Diyagramı](../assets/sequence-diagram.png)

### 11.5. Dağıtım Diyagramı

![Dağıtım Diyagramı](../assets/deployment-diagram.png)

## 12. Kaynaklar

- [Mikroservis Mimarisi](https://microservices.io/)
- [Kubernetes Dokümantasyonu](https://kubernetes.io/docs/)
- [Docker Dokümantasyonu](https://docs.docker.com/)
- [Spring Cloud Dokümantasyonu](https://spring.io/projects/spring-cloud)
- [FastAPI Dokümantasyonu](https://fastapi.tiangolo.com/)
- [React Dokümantasyonu](https://reactjs.org/docs/getting-started.html)
- [Istio Dokümantasyonu](https://istio.io/latest/docs/)
- [Prometheus Dokümantasyonu](https://prometheus.io/docs/introduction/overview/)
- [Grafana Dokümantasyonu](https://grafana.com/docs/)
