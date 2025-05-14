# Runner Service Beta Güvenlik İyileştirmeleri

## Hazırlayan: Can Tekin (DevOps Mühendisi)
## Tarih: 2023-07-15

## Özet

Bu belge, Runner Service'in beta aşamasına geçiş için gerekli güvenlik iyileştirmelerini ve performans optimizasyonlarını detaylandırmaktadır. Runner Service, ALT_LAS sisteminin kritik bir bileşeni olarak, AI Orchestrator'dan gelen görevleri işlemekte ve sonuçları ilgili servislere iletmektedir. Beta aşamasında, servisin daha güvenli, daha performanslı ve ölçeklenebilir olması hedeflenmektedir.

## Güvenlik İyileştirmeleri

### 1. Konteyner Güvenliği

#### 1.1. Root Olmayan Kullanıcı Kullanımı

**Sorun:** Mevcut Docker imajı, uygulamayı root kullanıcısı olarak çalıştırmaktadır, bu da güvenlik açıklarına neden olabilir.

**Çözüm:** Docker imajında özel bir kullanıcı oluşturulacak ve uygulama bu kullanıcı ile çalıştırılacaktır.

```dockerfile
# Kullanıcı oluşturma
RUN groupadd -r appgroup && \
    useradd -r -g appgroup -d /app -s /sbin/nologin -c "Docker image user" appuser

# Gerekli dizinleri oluşturma ve izinleri ayarlama
RUN mkdir -p /app/alt_files /app/last_files /app/artifacts /app/tmp && \
    chown -R appuser:appgroup /app

# Uygulamaya doğru izinleri verme
RUN chown appuser:appgroup /app/runner-service && \
    chmod 755 /app/runner-service

# Root olmayan kullanıcıya geçiş
USER appuser
```

#### 1.2. Güvenlik Güncellemeleri

**Sorun:** Temel imaj güncel güvenlik yamalarını içermeyebilir.

**Çözüm:** Docker imajı oluşturulurken sistem güncellemeleri yapılacaktır.

```dockerfile
# Güvenlik güncellemelerini yükleme
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    libssl1.1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
```

#### 1.3. Sağlık Kontrolü Ekleme

**Sorun:** Mevcut imajda sağlık kontrolü bulunmamaktadır, bu da servisin durumunun izlenmesini zorlaştırmaktadır.

**Çözüm:** Docker imajına sağlık kontrolü eklenecektir.

```dockerfile
# Sağlık kontrolü ekleme
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1
```

### 2. Kod Güvenliği

#### 2.1. Bağımlılık Güncellemeleri

**Sorun:** Bazı bağımlılıklar eski sürümlerde olabilir ve güvenlik açıkları içerebilir.

**Çözüm:** Cargo.toml dosyasındaki bağımlılıklar güncellenecektir.

```toml
# Güncellenecek bağımlılıklar
actix-web = "4.3.1"
tokio = "1.28.0"
serde = "1.0.160"
serde_json = "1.0.96"
reqwest = { version = "0.11.17", features = ["json"] }
```

#### 2.2. Güvenli Hata İşleme

**Sorun:** Bazı hata durumlarında hassas bilgiler açığa çıkabilir.

**Çözüm:** Hata işleme mekanizması gözden geçirilecek ve hassas bilgilerin açığa çıkması engellenecektir.

```rust
// Güvenli hata işleme örneği
fn handle_error(err: Error) -> HttpResponse {
    error!("İşlem hatası: {}", err);
    HttpResponse::InternalServerError()
        .json(json!({
            "error": "İşlem sırasında bir hata oluştu",
            "error_code": "INTERNAL_ERROR"
        }))
}
```

## Performans İyileştirmeleri

### 1. Eşzamanlı İşlem Optimizasyonu

**Sorun:** Mevcut yapılandırma, yüksek yük altında performans sorunlarına neden olabilir.

**Çözüm:** Eşzamanlı işlem sayısı optimize edilecektir.

```dockerfile
# Çevre değişkenleri
ENV MAX_CONCURRENT_TASKS=8
ENV MAX_CONCURRENT_AI_TASKS=4
```

### 2. Bellek Yönetimi

**Sorun:** Uzun süreli çalışmalarda bellek sızıntıları oluşabilir.

**Çözüm:** Bellek kullanımı optimize edilecek ve düzenli aralıklarla bellek temizliği yapılacaktır.

```rust
// Bellek yönetimi örneği
fn cleanup_resources() {
    // Geçici dosyaları temizle
    if let Err(e) = fs::remove_dir_all("/app/tmp") {
        error!("Geçici dosyalar temizlenemedi: {}", e);
    }
    
    // Geçici dizini yeniden oluştur
    if let Err(e) = fs::create_dir("/app/tmp") {
        error!("Geçici dizin oluşturulamadı: {}", e);
    }
}
```

## Ölçeklenebilirlik İyileştirmeleri

### 1. Yatay Ölçeklendirme Desteği

**Sorun:** Mevcut yapılandırma, yatay ölçeklendirme için optimize edilmemiştir.

**Çözüm:** Servis, durumsuz (stateless) olacak şekilde yeniden yapılandırılacaktır.

```rust
// Durumsuz yapılandırma örneği
#[derive(Clone)]
struct AppState {
    client: Client,
    config: Arc<Config>,
}
```

### 2. Yük Dengeleme

**Sorun:** Yüksek yük altında, bazı işlemler zaman aşımına uğrayabilir.

**Çözüm:** İş kuyruğu sistemi iyileştirilecek ve yük dengeleme mekanizması eklenecektir.

```rust
// İş kuyruğu örneği
struct TaskQueue {
    tasks: Arc<Mutex<VecDeque<Task>>>,
    workers: usize,
}

impl TaskQueue {
    fn new(workers: usize) -> Self {
        Self {
            tasks: Arc::new(Mutex::new(VecDeque::new())),
            workers,
        }
    }
    
    fn add_task(&self, task: Task) {
        let mut tasks = self.tasks.lock().unwrap();
        tasks.push_back(task);
    }
    
    fn start_workers(&self) {
        for _ in 0..self.workers {
            let tasks = self.tasks.clone();
            tokio::spawn(async move {
                loop {
                    let task = {
                        let mut tasks = tasks.lock().unwrap();
                        tasks.pop_front()
                    };
                    
                    if let Some(task) = task {
                        // İşlemi gerçekleştir
                        process_task(task).await;
                    } else {
                        // Kuyrukta iş yoksa kısa bir süre bekle
                        tokio::time::sleep(Duration::from_millis(100)).await;
                    }
                }
            });
        }
    }
}
```

## Sonuç

Bu belgedeki iyileştirmeler uygulandığında, Runner Service'in beta aşamasına geçiş için gerekli güvenlik, performans ve ölçeklenebilirlik gereksinimleri karşılanmış olacaktır. Bu iyileştirmeler, servisin daha güvenli, daha performanslı ve daha ölçeklenebilir olmasını sağlayacaktır.

## Uygulama Planı

1. Güvenlik iyileştirmelerini içeren yeni bir Docker imajı oluşturulacak
2. Performans iyileştirmeleri için kod değişiklikleri yapılacak
3. Ölçeklenebilirlik iyileştirmeleri için gerekli yapılandırmalar eklenecek
4. Test ortamında kapsamlı testler yapılacak
5. Beta ortamına geçiş yapılacak

## Kaynaklar

- [Docker Güvenlik En İyi Uygulamaları](https://docs.docker.com/develop/security-best-practices/)
- [Rust Bellek Güvenliği](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html)
- [Actix-Web Performans Optimizasyonu](https://actix.rs/docs/optimization/)
