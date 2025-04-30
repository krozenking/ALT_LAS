# İşçi Dokümantasyon Şablonu

## Genel Bilgiler
- **İşçi Numarası**: İşçi 9
- **Sorumluluk Alanı**: Workflow Engine Geliştiricisi
- **Başlangıç Tarihi**: 30 Nisan 2025

## Görevler ve İlerleme Durumu

### Tamamlanan Görevler
- **Görev 9.1 (Kısmi):** Mimari Seçimlerin İyileştirilmesi (Veritabanı)
  - Tamamlanma Tarihi: 30 Nisan 2025
  - Açıklama: Workflow Engine için veritabanı katmanı tasarlandı. SQLAlchemy ORM ve Alembic migration aracı seçildi. Başlangıçta PostgreSQL hedeflenmişti ancak geliştirme ortamındaki Docker kısıtlamaları nedeniyle geçici olarak SQLite veritabanına geçildi (`aiosqlite` sürücüsü ile).
  - İlgili Commit(ler): 89b7ac7
  - Karşılaşılan Zorluklar ve Çözümler: Geliştirme ortamında Docker servisinin başlatılamaması nedeniyle PostgreSQL kullanılamadı. Çözüm olarak, geliştirme sürecini aksatmamak adına SQLite veritabanına geçildi.

- **Görev 9.4 (Kısmi):** Workflow Yürütme Kalıcılığının Uygulanması (Temel Kurulum ve Entegrasyon)
  - Tamamlanma Tarihi: 30 Nisan 2025
  - Açıklama: SQLAlchemy kullanılarak `WorkflowDefinitionDB` ve `WorkflowRunDB` veritabanı modelleri oluşturuldu. Alembic ile ilk veritabanı migration'ı oluşturuldu ve uygulandı. Temel CRUD işlemleri için test script'i (`test_db.py`) yazılarak veritabanı katmanının çalıştığı doğrulandı. Ardından, bu kalıcılık katmanı `WorkflowExecutor`'a entegre edildi; workflow ve node durumları artık veritabanına kaydediliyor.
  - İlgili Commit(ler): 89b7ac7, [Henüz commit edilmedi]
  - Karşılaşılan Zorluklar ve Çözümler: Alembic'in async sürücü ile kullanımı için `env.py` dosyasında düzenlemeler yapıldı. `pydantic-settings` bağımlılığı eklendi. Veritabanı güncellemeleri için `session.merge()` kullanıldı.

- **Görev 9.3 (Kısmi):** Çekirdek Workflow Yürütme Mantığının Geliştirilmesi
  - Tamamlanma Tarihi: 30 Nisan 2025
  - Açıklama: `WorkflowExecutor`'a veritabanı kalıcılığı entegre edildi. Adımlar için yapılandırılabilir yeniden deneme (retry) mekanizması eklendi (varsayılan 3 deneme, 5sn bekleme). `asyncio.Semaphore` kullanılarak eş zamanlı çalıştırılabilecek node sayısı sınırlandırılarak paralel yürütme mantığı iyileştirildi (varsayılan 5). Temel testler (`test_executor.py`) ile bu geliştirmeler doğrulandı.
  - İlgili Commit(ler): [Henüz commit edilmedi]
  - Karşılaşılan Zorluklar ve Çözümler: Paralel yürütme ve veritabanı işlemlerinin uyumlu çalışması için dikkatli `asyncio` yönetimi gerekti. Test sırasında çeşitli import ve syntax hataları düzeltildi.

### Devam Eden Görevler
- **Görev 9.3 (Devamı):** Çekirdek Workflow Yürütme Mantığının Geliştirilmesi
  - Başlangıç Tarihi: 30 Nisan 2025
  - Mevcut Durum: %70 - Kalıcılık, retry ve paralel yürütme eklendi. Node'lar için gelişmiş input toplama (multiple inputs, handles) mantığı eksik.
  - Planlanan Tamamlanma Tarihi: [Tahmini tarih]
  - Karşılaşılan Zorluklar: [Varsa]

### Planlanan Görevler
- **Görev 9.3 (Devamı):** Çekirdek Workflow Yürütme Mantığının Geliştirilmesi (Kalıcılık Entegrasyonu, Paralel Yürütme, Hata Yönetimi)
  - Planlanan Başlangıç Tarihi: 30 Nisan 2025 (Devam ediyor)
  - Tahmini Süre: 1-2 Hafta
  - Bağımlılıklar: Yok

- **Görev 9.9:** API Gateway ile Entegrasyon
  - Planlanan Başlangıç Tarihi: [Tahmini tarih]
  - Tahmini Süre: 1 Hafta
  - Bağımlılıklar: İşçi 1 (API Gateway)

- **Görev 9.10:** Workflow İzleme ve Loglama
  - Planlanan Başlangıç Tarihi: [Tahmini tarih]
  - Tahmini Süre: 1 Hafta
  - Bağımlılıklar: İşçi 5 (UI)

- **Görev 9.11:** Unit ve Entegrasyon Testleri
  - Planlanan Başlangıç Tarihi: Sürekli (Ongoing)
  - Tahmini Süre: Sürekli
  - Bağımlılıklar: Yok

- **Görev 9.12:** Dokümantasyon (Devamı)
  - Planlanan Başlangıç Tarihi: Sürekli (Ongoing)
  - Tahmini Süre: Sürekli
  - Bağımlılıklar: Yok

## Teknik Detaylar

### Kullanılan Teknolojiler
- Python 3.10: Ana programlama dili.
- FastAPI: Web framework (henüz API endpointleri eklenmedi).
- SQLAlchemy (Asyncio): ORM aracı, veritabanı işlemleri için kullanıldı.
- Alembic: Veritabanı migration yönetimi için kullanıldı.
- aiosqlite: Geliştirme ortamında SQLite veritabanı ile asenkron bağlantı için sürücü.
- Pydantic: Veri doğrulama ve modelleme için kullanıldı (Workflow modelleri, Ayarlar).
- Pydantic-Settings: Ortam değişkenleri ve ayarlar yönetimi için kullanıldı.

### Mimari Kararlar
- Veritabanı Seçimi: Başlangıçta PostgreSQL hedeflendi, ancak geliştirme ortamı kısıtlamaları nedeniyle SQLite'a geçildi. Üretim ortamı için PostgreSQL hala hedeflenmektedir.
- ORM Seçimi: Asenkron yetenekleri ve yaygın kullanımı nedeniyle SQLAlchemy (asyncio extension ile) tercih edildi.
- Migration Yönetimi: SQLAlchemy ile entegrasyonu ve şema evrimini yönetme yetenekleri nedeniyle Alembic seçildi.
- Veritabanı Modelleri: Pydantic modellerinden ayrı olarak SQLAlchemy modelleri (`db_models.py`) oluşturuldu. Bu, veritabanı şeması ile API/iş mantığı modelleri arasında bir ayrım sağlar. Pydantic modelleri, veritabanına kaydedilirken JSON formatına dönüştürülmektedir.
- Paralel Yürütme: `asyncio.Semaphore` kullanılarak aynı anda çalıştırılabilecek node sayısı sınırlandırıldı (varsayılan 5). Bu, kaynak kullanımını kontrol altında tutarken paralelliği sağlar.
- Hata Yönetimi: Node'lar için yapılandırılabilir yeniden deneme (retry) mekanizması eklendi.

### API Dokümantasyonu
- Henüz API endpointleri eklenmemiştir.

## Diğer İşçilerle İş Birliği

### Bağımlılıklar
- İşçi 1 (API Gateway): Workflow Engine API endpointlerinin API Gateway'e entegrasyonu için.
- İşçi 5 (UI): Workflow izleme ve loglama bilgilerinin UI'da gösterilmesi için.

### Ortak Çalışma Alanları
- Henüz aktif bir ortak çalışma alanı bulunmamaktadır.

## Notlar ve Öneriler
- Geliştirme ortamında PostgreSQL yerine SQLite kullanılması geçici bir çözümdür. Üretim ortamı için PostgreSQL altyapısı ve konfigürasyonu ayrıca planlanmalıdır.
- `executor.py` içerisindeki veritabanı etkileşimleri (durum güncellemeleri, node çıktıları) artık uygulanmıştır.
- Paralel yürütme için `max_concurrent_nodes` ve adımlar için `max_retries`, `retry_delay_seconds` gibi ayarlar node config üzerinden yapılandırılabilir.
- Test (`test_executor.py`) sırasında veritabanı temizleme adımında (`cleanup_test_data`) "database is closed" hatası alındı. Bu, ana yürütme mantığını etkilemese de ileride incelenmelidir.

## Sonraki Adımlar
- Node'lar için gelişmiş input toplama mantığını uygulamak (multiple inputs, handles) (Görev 9.3 devamı).
- API endpointlerini (CRUD, execution, monitoring) tasarlamak ve uygulamak (Görev 9.9).
- Workflow izleme ve loglama mekanizmalarını detaylandırmak (Görev 9.10).
- Daha kapsamlı unit ve entegrasyon testleri yazmak (Görev 9.11 devamı).

---

*Son Güncelleme Tarihi: 30 Nisan 2025*



### Piece Framework Dokümantasyonu (Görev 9.5)

İş akışı motorunun temel yapı taşlarından biri "Piece" (Parça) framework'üdür. Bu framework, iş akışlarındaki her bir düğümün (node) işlevselliğini tanımlamak için kullanılır. Her Piece, belirli bir görevi yerine getiren (örneğin, bir HTTP isteği göndermek, bir kodu çalıştırmak, bir olayı tetiklemek) bağımsız bir modüldür.

**Temel Kavramlar:**

*   **`Piece` Sınıfı (`src/pieces/base.py`):** Tüm Piece'ler için soyut (abstract) temel sınıftır. Yeni bir Piece oluşturmak için bu sınıftan kalıtım alınmalıdır.
*   **`__init__(self, node: Node)`:** Piece örneği oluşturulurken çağrılır. İlgili iş akışı düğümünün (`Node`) tanımını alır ve yapılandırmayı (`config`) saklar.
*   **`execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]`:** Piece'in ana mantığının yürütüldüğü soyut metottur. Girdi verilerini alır ve işlenmiş çıktı verilerini döndürür. Her alt sınıf bu metodu kendi mantığına göre implemente etmelidir.
*   **`get_config_schema(cls) -> Dict[str, Any]`:** Piece'in yapılandırma (`config`) parametreleri için JSON şemasını döndüren sınıf metodudur. Bu, UI tarafında veya doğrulama için kullanılabilir.
*   **`get_input_schema(cls) -> Dict[str, Any]`:** Piece'in `execute` metodu için beklediği girdi verisinin JSON şemasını döndüren sınıf metodudur.
*   **`get_output_schema(cls) -> Dict[str, Any]`:** Piece'in `execute` metodundan döndüreceği çıktı verisinin JSON şemasını döndüren sınıf metodudur.
*   **Registry (`src/engine/registry.py`):** Kullanılabilir tüm Piece sınıflarını kaydeder ve yönetir. İş akışı motoru, bir düğümü yürütmesi gerektiğinde ilgili Piece sınıfını registry üzerinden bulur.

**Yeni Bir Piece Oluşturma:**

1.  `src/pieces/` dizini altında uygun bir dosyada (veya yeni bir dosyada) `Piece` sınıfından kalıtım alan yeni bir sınıf oluşturun.
2.  `execute` metodunu implemente ederek Piece'in ana iş mantığını yazın.
3.  Gerekirse `get_config_schema`, `get_input_schema`, ve `get_output_schema` metodlarını override ederek ilgili JSON şemalarını tanımlayın.
4.  Oluşturduğunuz Piece sınıfını `src/main.py` içerisindeki `lifespan` fonksiyonunda registry'ye kaydedin (`piece_registry.register("benzersiz_piece_tipi", YeniPieceSinifi)`).

Bu framework, iş akışı motoruna kolayca yeni işlevsellikler eklemeyi sağlar.

