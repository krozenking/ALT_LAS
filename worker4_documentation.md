# İşçi Dokümantasyon Şablonu

## Genel Bilgiler
- **İşçi Numarası**: İşçi 4
- **Sorumluluk Alanı**: Archive ve Veri Yönetimi Uzmanı - Archive Service Geliştirme
- **Başlangıç Tarihi**: [Başlangıç tarihi bilinmiyor, proje başlangıcı varsayılabilir]

## Görevler ve İlerleme Durumu

**Mevcut İlerleme**: %75 (worker_progress_updated.md'den)

### Tamamlanan Görevler (worker_progress_updated.md'den)
- Temel Go yapısı
  - Tamamlanma Tarihi: [Bilinmiyor]
  - Açıklama: Go ile Archive Service projesinin temel yapısı oluşturuldu, go.mod yapılandırıldı.
  - İlgili Commit(ler): [Bilinmiyor]
- Dockerfile oluşturma
  - Tamamlanma Tarihi: [Bilinmiyor]
  - Açıklama: Servis için Docker konteyner yapılandırması tamamlandı.
  - İlgili Commit(ler): [Bilinmiyor]
- NATS kullanarak *.last dinleme modülü
  - Tamamlanma Tarihi: [Bilinmiyor]
  - Açıklama: NATS mesaj kuyruğu entegrasyonu yapıldı, *.last dosyalarını dinleyen mekanizma geliştirildi. Mesaj işleme ve hata yönetimi implemente edildi.
  - İlgili Commit(ler): [Bilinmiyor]
- Başarı oranı kontrolü ve analizi
  - Tamamlanma Tarihi: [Bilinmiyor]
  - Açıklama: *.last dosyalarındaki verilere göre başarı oranı hesaplama ve analiz algoritmaları geliştirildi.
  - İlgili Commit(ler): [Bilinmiyor]
- *.atlas veritabanı entegrasyonu
  - Tamamlanma Tarihi: [Bilinmiyor]
  - Açıklama: *.atlas arşiv sistemi için veritabanı entegrasyonu yapıldı.
  - İlgili Commit(ler): [Bilinmiyor]
- PostgreSQL şema tasarımı ve migrasyonlar
  - Tamamlanma Tarihi: [Bilinmiyor]
  - Açıklama: PostgreSQL veritabanı şeması tasarlandı, tablo yapıları, ilişkiler, indeksler belirlendi. Veritabanı migrasyonları için altyapı kuruldu. Veritabanı erişim katmanı oluşturuldu.
  - İlgili Commit(ler): [Bilinmiyor]
- Arşiv indeksleme ve arama API'leri
  - Tamamlanma Tarihi: [Bilinmiyor]
  - Açıklama: Arşivlenen verilerin indekslenmesi ve aranması için API'ler geliştirildi. Muhtemelen Elasticsearch entegrasyonu bu kapsamda yapıldı.
  - İlgili Commit(ler): [Bilinmiyor]
- Kapsamlı hata işleme ve loglama sistemi
  - Tamamlanma Tarihi: [Bilinmiyor]
  - Açıklama: Servis genelinde yapılandırılabilir loglama ve merkezi hata işleme mekanizmaları implemente edildi.
  - İlgili Commit(ler): [Bilinmiyor]
- Birim ve entegrasyon testleri
  - Tamamlanma Tarihi: [Bilinmiyor]
  - Açıklama: Geliştirilen modüller için birim ve entegrasyon testleri yazıldı.
  - İlgili Commit(ler): [Bilinmiyor]

### Devam Eden Görevler
- Yok

### Planlanan Görevler (worker_progress_updated.md ve updated_worker_tasks.md'den)
- **Görev 4.6.3:** Performans optimizasyonu (%10)
  - Planlanan Başlangıç Tarihi: [Hemen]
  - Tahmini Süre: [~1-2 Hafta]
  - Açıklama: Profiling, bellek optimizasyonu, CPU optimizasyonu, I/O optimizasyonu yapılacak. Sorgu optimizasyonu (Explain plan analizi, indeks optimizasyonu, query caching, N+1 sorgu önleme) yapılacak.
  - Bağımlılıklar: Yok
- **Görev 4.6.5:** Dağıtım ve CI/CD entegrasyonu (%15)
  - Planlanan Başlangıç Tarihi: [Performans optimizasyonundan sonra]
  - Tahmini Süre: [~1-2 Hafta]
  - Açıklama: CI/CD pipeline oluşturulacak, deployment stratejisi belirlenecek, rollback mekanizması kurulacak, monitoring ve alerting entegre edilecek.
  - Bağımlılıklar: Diğer servislerin CI/CD durumu, DevOps (İşçi 8) ile koordinasyon.
- **Görev 4.26:** Veri yedekleme ve kurtarma (updated_worker_tasks.md'de var, progress'te yok)
  - Planlanan Başlangıç Tarihi: [CI/CD sonrası veya paralel]
  - Tahmini Süre: [~1 Hafta]
  - Açıklama: Yedekleme stratejisi belirlenecek, otomatik yedekleme, point-in-time recovery ve disaster recovery planları oluşturulacak.
  - Bağımlılıklar: Altyapı (DB, Depolama)
- **Görev 4.27:** Veri saklama politikaları (updated_worker_tasks.md'de var, progress'te yok)
  - Planlanan Başlangıç Tarihi: [CI/CD sonrası veya paralel]
  - Tahmini Süre: [~1 Hafta]
  - Açıklama: Veri yaşam döngüsü yönetimi, otomatik arşivleme/silme politikaları belirlenecek ve implemente edilecek. Uyumluluk kontrolleri eklenecek.
  - Bağımlılıklar: Yasal/İş gereksinimleri
- **Görev 4.29:** Dokümantasyon güncellemesi (updated_worker_tasks.md'de var, progress'te yok)
  - Planlanan Başlangıç Tarihi: [Sürekli/Son aşama]
  - Tahmini Süre: [Sürekli]
  - Açıklama: API referans dokümanı, *.atlas format dokümanı, mimari dokümanı, sorun giderme kılavuzu güncellenecek/oluşturulacak. Bu doküman da güncellenecek.
  - Bağımlılıklar: Tamamlanan diğer görevler.

## Teknik Detaylar

### Kullanılan Teknolojiler (updated_worker_tasks.md'den)
- Go 1.20+
- Gin 1.9+ (API Framework)
- PostgreSQL 14+ (Veritabanı)
- NATS 2.9+ (Mesaj Kuyruğu)
- Elasticsearch 8.0+ (Arama/Analitik)
- Docker & Docker Compose
- Prometheus (İzleme)
- GitHub Actions (CI/CD)

### Mimari Kararlar
- Mikroservis mimarisi içinde Archive Service'in Go ile geliştirilmesi.
- Veritabanı olarak PostgreSQL kullanımı.
- Asenkron iletişim için NATS mesaj kuyruğu kullanımı.
- Arama ve analitik yetenekleri için Elasticsearch entegrasyonu.
- Repository pattern kullanımı (Veritabanı erişim katmanı).

### API Dokümantasyonu
- [Henüz detaylı API dokümantasyonu bu dosyada yok, API Gateway (İşçi 1) veya servis kodundan alınabilir]

## Diğer İşçilerle İş Birliği

### Bağımlılıklar
- Runner Service (İşçi 3): *.last dosyalarını üretir ve NATS üzerinden Archive Service'e gönderir.
- API Gateway (İşçi 1): Archive Service API'lerini dış dünyaya açar.
- UI (İşçi 5): Arşivlenmiş verilere erişim ve görselleştirme için Archive Service API'lerini kullanabilir.
- DevOps/Güvenlik (İşçi 8): CI/CD ve güvenlik konularında iş birliği.

### Ortak Çalışma Alanları
- Veri formatları (*.last, *.atlas)
- API kontratları (API Gateway ile)
- Mesajlaşma protokolleri (NATS üzerinden Runner Service ile)
- CI/CD süreçleri (DevOps ile)

## Notlar ve Öneriler
- Performans optimizasyonu kritik öneme sahip, özellikle veri hacmi arttıkça.
- CI/CD entegrasyonu, otomatik testler ve dağıtımlar için önemli.
- Veri yedekleme ve kurtarma stratejileri erken aşamada planlanmalı ve test edilmeli.

## Sonraki Adımlar
1. Performans optimizasyonu görevine başla (Görev 4.6.3 / 4.9).
2. CI/CD entegrasyonunu planla ve implemente et (Görev 4.6.5 / 4.30).
3. Veri yönetimi (yedekleme, saklama) görevlerini tamamla (Görev 4.26, 4.27).
4. Dokümantasyonu sürekli güncelle (Görev 4.29).

---

*Son Güncelleme Tarihi: 28 Nisan 2025*
