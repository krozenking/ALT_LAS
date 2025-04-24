# ALT_LAS İşçi Görev Dağılımı

Bu belge, ALT_LAS projesinin 8 farklı işçi için görev dağılımını detaylandırmaktadır. Her işçi, projenin belirli bir alanından sorumlu olacak ve kendi uzmanlık alanına göre geliştirme yapacaktır.

## İşçi 1: Backend Lider

### Sorumluluk Alanları
- API Gateway geliştirme ve yönetimi
- Mikroservis mimarisinin koordinasyonu
- Backend servisler arası iletişim protokolleri
- Performans optimizasyonu ve ölçeklendirme

### Teknik Gereksinimler
- Node.js/Express.js deneyimi
- RESTful API tasarım prensipleri
- Mikroservis mimarisi bilgisi
- Docker ve konteyner orkestrasyon deneyimi

### Görevler
1. API Gateway kurulumu ve yapılandırması
2. Kimlik doğrulama ve yetkilendirme sisteminin geliştirilmesi
3. API dokümantasyonu (Swagger/OpenAPI)
4. Rate limiting ve güvenlik önlemlerinin uygulanması
5. Servis keşif mekanizmasının geliştirilmesi
6. Backend performans izleme ve optimizasyon
7. API versiyonlama stratejisinin uygulanması
8. Backend CI/CD pipeline entegrasyonu

### İlk Görevler (İlk 2 Hafta)
1. Monorepo yapısında API Gateway projesinin oluşturulması
2. Temel Express.js uygulamasının kurulumu
3. Swagger/OpenAPI entegrasyonu
4. Basit bir kimlik doğrulama mekanizmasının uygulanması

## İşçi 2: Segmentation Uzmanı

### Sorumluluk Alanları
- Segmentation Service geliştirme
- DSL (Domain Specific Language) tasarımı ve implementasyonu
- *.alt dosya formatı ve işleme
- NLP (Doğal Dil İşleme) entegrasyonu

### Teknik Gereksinimler
- Python ve FastAPI deneyimi
- NLP ve metin işleme bilgisi
- Parser geliştirme deneyimi (PyParsing, Lark vb.)
- Veri modelleme (Pydantic)

### Görevler
1. Segmentation Service mimarisinin tasarlanması
2. DSL şemasının (YAML/JSON) tanımlanması
3. Komut ayrıştırma algoritmasının geliştirilmesi
4. *.alt dosya formatının implementasyonu
5. Metadata ekleme ve etiketleme sisteminin geliştirilmesi
6. Mod ve persona parametrelerinin entegrasyonu
7. Birim ve entegrasyon testlerinin yazılması
8. Servis dokümantasyonunun hazırlanması

### İlk Görevler (İlk 2 Hafta)
1. FastAPI projesinin kurulumu
2. Temel DSL şemasının tanımlanması
3. Basit komut ayrıştırma fonksiyonlarının geliştirilmesi
4. *.alt dosya formatı için prototip oluşturulması

## İşçi 3: Runner Geliştirici

### Sorumluluk Alanları
- Runner Service geliştirme
- Paralel görev yönetimi
- AI servisleri ile entegrasyon
- *.last dosya üretimi

### Teknik Gereksinimler
- Rust programlama dili deneyimi
- Asenkron programlama (Tokio)
- Paralel işleme ve concurrency
- FFI (Foreign Function Interface) deneyimi

### Görevler
1. Runner Service mimarisinin tasarlanması
2. *.alt dosya okuma ve işleme mekanizmasının geliştirilmesi
3. AI servisleri için çağrı sisteminin implementasyonu
4. Paralel görev yönetim sisteminin geliştirilmesi
5. Hata yakalama ve raporlama mekanizmasının uygulanması
6. *.last dosya üretim sisteminin geliştirilmesi
7. Performans optimizasyonu
8. Güvenli FFI katmanının implementasyonu

### İlk Görevler (İlk 2 Hafta)
1. Rust projesinin kurulumu ve temel yapının oluşturulması
2. Tokio asenkron runtime entegrasyonu
3. Basit *.alt dosya okuma fonksiyonlarının geliştirilmesi
4. HTTP/gRPC istemci prototipinin oluşturulması

## İşçi 4: Archive ve Veri Yönetimi Uzmanı

### Sorumluluk Alanları
- Archive Service geliştirme
- Veritabanı tasarımı ve yönetimi
- Mesaj kuyruğu entegrasyonu
- *.atlas arşiv sistemi

### Teknik Gereksinimler
- Go programlama dili deneyimi
- PostgreSQL veritabanı bilgisi
- Mesaj kuyruğu sistemleri (NATS)
- Veri modelleme ve şema tasarımı

### Görevler
1. Archive Service mimarisinin tasarlanması
2. PostgreSQL veritabanı şemasının oluşturulması
3. NATS mesaj kuyruğu entegrasyonu
4. *.last dosyalarını dinleme mekanizmasının geliştirilmesi
5. Başarı oranı hesaplama algoritmasının implementasyonu
6. *.atlas kayıt sisteminin geliştirilmesi
7. Veri arşivleme ve yedekleme mekanizmalarının uygulanması
8. Veri analitik altyapısının hazırlanması

### İlk Görevler (İlk 2 Hafta)
1. Go projesinin kurulumu
2. PostgreSQL veritabanı şemasının tasarlanması
3. NATS bağlantı ve abonelik sisteminin kurulması
4. Basit *.last dinleme mekanizmasının geliştirilmesi

## İşçi 5: UI/UX Geliştirici

### Sorumluluk Alanları
- Desktop UI geliştirme (Electron/React)
- Web Dashboard geliştirme
- UI/UX tasarım sistemi
- Kullanıcı deneyimi optimizasyonu

### Teknik Gereksinimler
- React ve TypeScript deneyimi
- Electron framework bilgisi
- UI/UX tasarım prensipleri
- CSS/SCSS ve modern frontend araçları

### Görevler
1. Desktop UI mimarisinin tasarlanması
2. Electron uygulamasının kurulumu ve yapılandırması
3. React bileşen kütüphanesinin geliştirilmesi
4. Tema ve stil sisteminin oluşturulması
5. Web Dashboard arayüzünün geliştirilmesi
6. Sistem tepsisi entegrasyonunun uygulanması
7. Kısayol yönetim sisteminin geliştirilmesi
8. Erişilebilirlik özelliklerinin uygulanması

### İlk Görevler (İlk 2 Hafta)
1. Electron/React projesinin kurulumu
2. Temel UI bileşenlerinin oluşturulması
3. Ana sayfa ve navigasyon yapısının geliştirilmesi
4. Tema ve stil rehberinin hazırlanması

## İşçi 6: OS Entegrasyon Uzmanı

### Sorumluluk Alanları
- OS Integration Service geliştirme
- İşletim sistemi API'leri ile entegrasyon
- Dosya sistemi erişimi ve yönetimi
- Uygulama kontrolü ve otomasyon

### Teknik Gereksinimler
- Rust ve C++ deneyimi
- Windows API, X11/Wayland, macOS Cocoa bilgisi
- Sistem programlama
- FFI (Foreign Function Interface)

### Görevler
1. OS Integration Service mimarisinin tasarlanması
2. Windows entegrasyon modülünün geliştirilmesi
3. macOS entegrasyon modülünün geliştirilmesi
4. Linux entegrasyon modülünün geliştirilmesi
5. Dosya sistemi erişim katmanının implementasyonu
6. Uygulama kontrol mekanizmasının geliştirilmesi
7. Sistem ayarları yönetim modülünün uygulanması
8. Çoklu platform test sisteminin kurulması

### İlk Görevler (İlk 2 Hafta)
1. Rust projesinin kurulumu
2. Temel platform algılama mekanizmasının geliştirilmesi
3. Basit dosya sistemi erişim fonksiyonlarının implementasyonu
4. Windows API entegrasyonu için prototip oluşturulması

## İşçi 7: AI Uzmanı

### Sorumluluk Alanları
- AI Orchestrator geliştirme
- Local LLM entegrasyonu
- Computer Vision ve ses işleme
- Model yönetimi ve optimizasyonu

### Teknik Gereksinimler
- Python ve makine öğrenimi framework'leri deneyimi
- ONNX Runtime, PyTorch bilgisi
- NLP, Computer Vision ve ses işleme deneyimi
- Model optimizasyon teknikleri

### Görevler
1. AI Orchestrator mimarisinin tasarlanması
2. Local LLM entegrasyon sisteminin geliştirilmesi
3. Model seçim ve yönetim mekanizmasının uygulanması
4. Computer Vision servisinin geliştirilmesi
5. Ses işleme ve tanıma sisteminin implementasyonu
6. Model optimizasyon pipeline'ının oluşturulması
7. Çoklu model orkestrasyon sisteminin geliştirilmesi
8. AI performans izleme ve analiz sisteminin uygulanması

### İlk Görevler (İlk 2 Hafta)
1. Python AI projesinin kurulumu
2. ONNX Runtime entegrasyonu
3. Basit LLM çağrı sisteminin geliştirilmesi
4. Model yönetim altyapısının oluşturulması

## İşçi 8: Güvenlik ve DevOps Uzmanı

### Sorumluluk Alanları
- Güvenlik katmanı geliştirme
- CI/CD pipeline kurulumu
- Konteyner orkestrasyon ve dağıtım
- İzleme ve günlük kaydı sistemleri

### Teknik Gereksinimler
- DevOps araçları (Docker, Kubernetes, GitHub Actions)
- Güvenlik prensipleri ve uygulamaları
- Konteyner teknolojileri
- İzleme ve günlük kaydı sistemleri (Prometheus, Grafana)

### Görevler
1. CI/CD pipeline kurulumu ve yapılandırması
2. Docker konteyner yapılandırmalarının oluşturulması
3. Sandbox izolasyon sisteminin geliştirilmesi
4. Güvenlik politikaları ve uygulamalarının implementasyonu
5. İzleme ve günlük kaydı altyapısının kurulması
6. Denetim sisteminin geliştirilmesi
7. Otomatik test ve dağıtım sisteminin uygulanması
8. Güvenlik denetimi ve penetrasyon testlerinin yürütülmesi

### İlk Görevler (İlk 2 Hafta)
1. GitHub Actions workflow'larının oluşturulması
2. Temel Docker yapılandırmalarının hazırlanması
3. Kod kalite analiz araçlarının entegrasyonu
4. Basit izleme sisteminin kurulması

## Görev Bağımlılıkları ve İş Birliği

### Kritik Bağımlılıklar
1. API Gateway (İşçi 1) → Tüm servisler için giriş noktası
2. Segmentation Service (İşçi 2) → Runner Service için girdi sağlar
3. Runner Service (İşçi 3) → Archive Service için girdi sağlar
4. OS Integration (İşçi 6) → AI Orchestrator (İşçi 7) için sistem erişimi sağlar

### İş Birliği Gerektiren Alanlar
1. API Tasarımı: İşçi 1, 2, 3, 4 arasında koordinasyon
2. Veri Formatları: İşçi 2, 3, 4 arasında standardizasyon
3. UI-Backend Entegrasyonu: İşçi 1 ve 5 arasında iş birliği
4. Güvenlik Uygulamaları: Tüm işçiler ve İşçi 8 arasında koordinasyon

## İlerleme Takibi ve Raporlama

Her işçi, aşağıdaki şekilde ilerleme raporlaması yapacaktır:

1. Günlük commit'ler ve pull request'ler
2. Haftalık ilerleme raporları (GitHub Issues üzerinden)
3. İki haftalık sprint değerlendirmeleri
4. Kilometre taşı tamamlama raporları
5. **Detaylı dokümantasyon**: Her işçi, `/docs/worker{N}_documentation.md` formatında kendi çalışmalarını belgeleyecektir

## Dokümantasyon Gereksinimleri

Her işçi, aşağıdaki dokümantasyon gereksinimlerini yerine getirmelidir:

1. **Dokümantasyon Şablonu**: Projenin kök dizininde bulunan `worker_documentation_template.md` şablonunu kullanarak kendi dokümantasyonunuzu oluşturun
2. **Düzenli Güncelleme**: Dokümantasyonunuzu en az haftada bir güncelleyin
3. **İçerik Gereksinimleri**: Tamamlanan görevler, devam eden görevler, teknik detaylar, API dokümantasyonu ve diğer işçilerle iş birliği bilgilerini içermelidir
4. **Dokümantasyon Kılavuzu**: Detaylı dokümantasyon gereksinimleri için `/docs/documentation_guidelines.md` dosyasını inceleyin

## Başlangıç Kılavuzu

Her işçi için başlangıç adımları:

1. GitHub reposunu klonlayın: `git clone https://github.com/krozenking/ALT_LAS.git`
2. Kendi sorumlu olduğunuz modül dizinine gidin
3. README.md dosyasını okuyun ve kurulum adımlarını takip edin
4. İlk görevlerinizi GitHub Issues'dan alın
5. Geliştirme ortamınızı kurun ve ilk commit'inizi yapın
6. Dokümantasyon şablonunu kullanarak kendi dokümantasyonunuzu oluşturun
7. Git LFS'i kurun ve yapılandırın (detaylar için `GIT_LFS_NOTICE.md` dosyasını inceleyin)

## İletişim ve İş Birliği

- Günlük stand-up toplantıları (15 dakika)
- Haftalık teknik tartışma oturumları (1 saat)
- GitHub Issues üzerinden görev takibi
- Slack/Discord üzerinden anlık iletişim
- Kod incelemeleri için pull request'ler
- Dokümantasyon incelemeleri ve geri bildirimler
