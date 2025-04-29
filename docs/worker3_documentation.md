# İşçi 3: Runner Service Dokümantasyonu

## Genel Bakış

Runner Service, ALT_LAS sisteminin ALT dosyalarını işleyen, görevleri yürüten ve LAST dosyaları üreten temel bileşenidir. Performans, güvenlik ve güvenilirlik için Rust programlama dili ile geliştirilmiştir.

## Tamamlanan Görevler

### ALT Dosya İşleme Mekanizması
- ✅ ALT dosya yapısı ve modelleri geliştirildi
- ✅ JSON ayrıştırma ve doğrulama sistemi uygulandı
- ✅ Dosya okuma ve işleme fonksiyonları geliştirildi
- ✅ Şema doğrulama mekanizması eklendi
- ✅ Hata yakalama ve raporlama sistemi uygulandı

### AI Servisleri İçin Çağrı Sistemi
- ✅ HTTP/gRPC istemci altyapısı geliştirildi
- ✅ Streaming desteği eklendi
- ✅ Model seçimi özellikleri eklendi
- ✅ Hata yönetimi ve yeniden deneme mantığı uygulandı
- ✅ Eşzamanlılık kontrolü eklendi

### Paralel Görev Yönetim Sistemi
- ✅ Görev planlayıcı (scheduler) geliştirildi
- ✅ Bağımlılık tabanlı görev sıralaması uygulandı
- ✅ Öncelik tabanlı görev planlama eklendi
- ✅ Görev durumu izleme sistemi geliştirildi
- ✅ Görev iptal etme ve zaman aşımı mekanizmaları eklendi

### LAST Dosya Üretim Sistemi
- ✅ LAST dosya modelleri ve yapısı geliştirildi
- ✅ Artifact yönetimi eklendi
- ✅ Execution graph görselleştirme desteği eklendi
- ✅ HTML rapor oluşturma özelliği eklendi
- ✅ Sıkıştırılmış dosya formatları desteği eklendi
- ✅ Arşiv oluşturma özelliği eklendi

### Performans Optimizasyonu
- ✅ Paralel işleme desteği eklendi
- ✅ Batch processing özelliği eklendi
- ✅ Asenkron I/O işlemleri eklendi
- ✅ Bellek kullanımı optimizasyonu yapıldı

### Güvenli FFI Katmanı
- ✅ Bellek yönetimi ve güvenliği sağlandı
- ✅ Hata yakalama ve raporlama mekanizması eklendi
- ✅ C ve Python için örnek kullanımlar eklendi
- ✅ Kapsamlı birim testleri yazıldı

## Devam Eden Görevler

- 🔄 Ek programlama dilleri için FFI örnekleri (Java, C#, Go)
- 🔄 Daha kapsamlı entegrasyon testleri
- 🔄 Performans benchmark'ları ve iyileştirmeleri

## Teknik Detaylar

### ALT Dosya Yapısı

ALT dosyaları, JSON formatında olup aşağıdaki temel yapıya sahiptir:

```json
{
  "id": "alt_example_001",
  "title": "Örnek ALT Dosyası",
  "description": "Bu bir örnek ALT dosyasıdır",
  "version": "1.0",
  "mode": "normal",
  "persona": "default",
  "tasks": [
    {
      "id": "task1",
      "description": "İlk görev",
      "dependencies": null,
      "parameters": {
        "param1": "değer1"
      }
    },
    {
      "id": "task2",
      "description": "İkinci görev",
      "dependencies": ["task1"],
      "parameters": {
        "param2": "değer2"
      }
    }
  ]
}
```

### LAST Dosya Yapısı

LAST dosyaları, ALT dosyalarının işlenmesi sonucunda oluşturulan JSON dosyalarıdır:

```json
{
  "id": "last_12345",
  "version": "1.0",
  "created_at": "2025-04-26T20:00:00Z",
  "alt_file_id": "alt_example_001",
  "alt_file_title": "Örnek ALT Dosyası",
  "execution_id": "exec_67890",
  "status": "success",
  "mode": "normal",
  "persona": "default",
  "task_results": {
    "task1": {
      "task_id": "task1",
      "status": "completed",
      "start_time": "2025-04-26T20:00:01Z",
      "end_time": "2025-04-26T20:00:02Z",
      "duration_ms": 1000,
      "output": {
        "result": "Task 1 sonucu"
      }
    },
    "task2": {
      "task_id": "task2",
      "status": "completed",
      "start_time": "2025-04-26T20:00:03Z",
      "end_time": "2025-04-26T20:00:05Z",
      "duration_ms": 2000,
      "output": {
        "result": "Task 2 sonucu"
      }
    }
  },
  "summary": "Execution Summary...",
  "success_rate": 1.0,
  "execution_time_ms": 3000,
  "artifacts": [
    {
      "id": "artifact_1",
      "name": "output.txt",
      "artifact_type": "text",
      "task_id": "task2",
      "path": "/path/to/output.txt",
      "size_bytes": 1024,
      "mime_type": "text/plain",
      "created_at": "2025-04-26T20:00:05Z"
    }
  ],
  "execution_graph": {
    "nodes": [...],
    "edges": [...]
  }
}
```

### FFI Katmanı

FFI katmanı, diğer programlama dillerinden Runner Service'e erişim sağlar. Aşağıdaki fonksiyonları içerir:

```c
// FFI fonksiyonları
int runner_init();
char* runner_get_last_error();
void runner_free_string(char* ptr);
int runner_parse_alt_file(const char* json_str);
int runner_add_task_result(const char* alt_id, const char* json_str);
char* runner_generate_last_file(const char* alt_id, const char* output_dir);
char* runner_get_last_file_json(const char* last_id);
char* runner_batch_process(const char* alt_ids_json, const char* output_dir);
int runner_cleanup();
char* runner_get_version();
```

## API Dokümantasyonu

### ALT Dosya İşleme API'si

```rust
// ALT dosyası oluşturma
let mut alt_file = AltFile::new("Örnek ALT Dosyası".to_string());

// Görev ekleme
let task = Task {
    id: "task1".to_string(),
    description: "İlk görev".to_string(),
    dependencies: None,
    parameters: None,
    timeout_seconds: None,
    retry_count: None,
    status: None,
    priority: None,
    tags: None,
};
alt_file.add_task(task);

// ALT dosyasını JSON'a dönüştürme
let json = serde_json::to_string_pretty(&alt_file).unwrap();

// JSON'dan ALT dosyası oluşturma
let alt_file: AltFile = serde_json::from_str(&json).unwrap();
```

### Görev Yönetim API'si

```rust
// Görev planlayıcı oluşturma
let mut scheduler = TaskScheduler::new(4); // 4 eşzamanlı görev

// ALT dosyasından görevleri yükleme
scheduler.initialize_from_alt_file(&alt_file);

// Tüm görevleri çalıştırma
let results = scheduler.run_all_tasks().await;

// Belirli bir görevi çalıştırma
let result = scheduler.run_task("task1").await;
```

### LAST Dosya Üretim API'si

```rust
// LAST dosyası oluşturma
let last_file = generate_last_file(&alt_file, task_results);

// Artifact'ları çıkarma
let enhanced_last_file = extract_artifacts_from_results(last_file, &output_dir);

// Execution graph görselleştirme
let graph_path = generate_execution_graph_visualization(&enhanced_last_file, &output_dir);

// HTML rapor oluşturma
let html_path = export_last_file_to_html(&enhanced_last_file, &output_dir);

// LAST dosyasını diske yazma
let file_path = write_last_file(&enhanced_last_file, &output_dir).unwrap();
```

### Performans Optimizasyonu API'si

```rust
// Performans optimizasyonu için işlemci yapılandırması
let config = LastFileProcessorConfig {
    output_dir: PathBuf::from("/tmp/last_files"),
    enable_compression: true,
    enable_html_export: true,
    enable_graph_visualization: true,
    enable_artifact_extraction: true,
    enable_ai_enhancement: false,
    parallel_processing: true,
    max_workers: num_cpus::get(),
};

// İşlemci oluşturma
let processor = LastFileProcessor::with_config(config);

// ALT dosyasını işleme
let last_file = processor.process(&alt_file, task_results).await.unwrap();

// Toplu işleme
let results = processor.batch_process(alt_files, task_results_map).await;
```

## Diğer İşçilerle İş Birliği

### İşçi 2 (Segmentation Service) ile İş Birliği
- Segmentation Service'den gelen ALT dosyalarını işlemek için entegrasyon noktaları oluşturuldu
- Veri formatları standardize edildi

### İşçi 4 (Archive Service) ile İş Birliği
- LAST dosyalarının Archive Service'e aktarılması için API'ler geliştirildi
- Artifact yönetimi için ortak format belirlendi

### İşçi 7 (AI Uzmanı) ile İş Birliği
- AI servisleri için çağrı sistemi, AI Orchestrator ile uyumlu olacak şekilde geliştirildi
- Model seçimi ve parametre formatları standardize edildi

## Kurulum ve Kullanım

### Gereksinimler
- Rust 1.54 veya üzeri
- Cargo
- GraphViz (isteğe bağlı, execution graph görselleştirme için)

### Derleme
```bash
cd runner-service
cargo build --release
```

### Test
```bash
cargo test
```

### FFI Kütüphanesi Derleme
```bash
cargo build --release --features ffi
```

## Gelecek Planlar

1. Daha fazla programlama dili için FFI örnekleri geliştirme
2. Performans iyileştirmeleri ve benchmark'lar
3. Daha kapsamlı entegrasyon testleri
4. Dokümantasyon geliştirmeleri

## Kaynaklar ve Referanslar

- [Rust Dokümantasyonu](https://doc.rust-lang.org/book/)
- [Tokio Asenkron Runtime](https://tokio.rs/)
- [Serde JSON](https://serde.rs/)
- [GraphViz](https://graphviz.org/)
