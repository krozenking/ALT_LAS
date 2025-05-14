# Yedekleme ve Geri Yükleme Stratejisi Raporu

**Tarih:** 13 Mayıs 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Alpha Aşaması - Yedekleme ve Geri Yükleme Stratejisi

## 1. Genel Bakış

Bu rapor, ALT_LAS projesinin alpha aşamasına geçiş için oluşturulan yedekleme ve geri yükleme stratejisini detaylandırmaktadır. Veritabanı ve diğer kalıcı verilerin düzenli olarak yedeklenmesi, veri güvenliğini sağlamak ve olası veri kayıplarını önlemek için kritik bir adımdır.

## 2. Yedekleme ve Geri Yükleme Stratejisi

ALT_LAS projesi için aşağıdaki yedekleme ve geri yükleme stratejisi belirlenmiştir:

1. **Düzenli Yedekleme**: Veritabanı ve kalıcı verilerin düzenli olarak yedeklenmesi
2. **Otomatik Yedekleme**: Kubernetes CronJob kullanarak otomatik yedekleme işlemlerinin planlanması
3. **Yedekleme Depolama**: Yedeklemelerin güvenli bir şekilde depolanması
4. **Geri Yükleme Prosedürü**: Yedeklemelerden verilerin geri yüklenmesi için prosedürlerin oluşturulması
5. **Yedekleme Doğrulama**: Yedeklemelerin doğruluğunun ve bütünlüğünün doğrulanması

## 3. Oluşturulan Yedekleme ve Geri Yükleme Kaynakları

### 3.1. PostgreSQL Yedekleme ve Geri Yükleme

PostgreSQL veritabanı için aşağıdaki kaynaklar oluşturuldu:

- **PersistentVolumeClaim**: `postgres-backup-pvc`
  - Yedekleme dosyalarını depolamak için 10Gi kapasiteli kalıcı depolama alanı

- **ConfigMap**: `postgres-backup-scripts`
  - `backup.sh`: PostgreSQL veritabanını yedeklemek için betik
  - `restore.sh`: PostgreSQL veritabanını geri yüklemek için betik
  - `list-backups.sh`: Mevcut PostgreSQL yedeklemelerini listelemek için betik

- **CronJob**: `postgres-backup`
  - Her gün gece 01:00'de otomatik olarak çalışır
  - PostgreSQL veritabanını yedekler
  - 7 günden eski yedeklemeleri temizler

- **Job**: `postgres-backup-manual`
  - Manuel olarak PostgreSQL veritabanını yedeklemek için kullanılır

- **Job**: `postgres-restore`
  - PostgreSQL veritabanını yedeklemeden geri yüklemek için kullanılır

### 3.2. Redis Yedekleme ve Geri Yükleme

Redis için aşağıdaki kaynaklar oluşturuldu:

- **PersistentVolumeClaim**: `redis-backup-pvc`
  - Yedekleme dosyalarını depolamak için 5Gi kapasiteli kalıcı depolama alanı

- **ConfigMap**: `redis-backup-scripts`
  - `backup.sh`: Redis'i yedeklemek için betik
  - `restore.sh`: Redis'i geri yüklemek için betik
  - `list-backups.sh`: Mevcut Redis yedeklemelerini listelemek için betik

- **CronJob**: `redis-backup`
  - Her gün gece 02:00'de otomatik olarak çalışır
  - Redis'i yedekler
  - 7 günden eski yedeklemeleri temizler

- **Job**: `redis-backup-manual`
  - Manuel olarak Redis'i yedeklemek için kullanılır

### 3.3. Prometheus Yedekleme ve Geri Yükleme

Prometheus için aşağıdaki kaynaklar oluşturuldu:

- **PersistentVolumeClaim**: `prometheus-backup-pvc`
  - Yedekleme dosyalarını depolamak için 10Gi kapasiteli kalıcı depolama alanı

- **ConfigMap**: `prometheus-backup-scripts`
  - `backup.sh`: Prometheus verilerini yedeklemek için betik
  - `restore.sh`: Prometheus verilerini geri yüklemek için betik
  - `list-backups.sh`: Mevcut Prometheus yedeklemelerini listelemek için betik

- **CronJob**: `prometheus-backup`
  - Her gün gece 03:00'de otomatik olarak çalışır
  - Prometheus verilerini yedekler
  - 7 günden eski yedeklemeleri temizler

### 3.4. Loki Yedekleme ve Geri Yükleme

Loki için aşağıdaki kaynaklar oluşturuldu:

- **PersistentVolumeClaim**: `loki-backup-pvc`
  - Yedekleme dosyalarını depolamak için 10Gi kapasiteli kalıcı depolama alanı

- **ConfigMap**: `loki-backup-scripts`
  - `backup.sh`: Loki verilerini yedeklemek için betik
  - `restore.sh`: Loki verilerini geri yüklemek için betik
  - `list-backups.sh`: Mevcut Loki yedeklemelerini listelemek için betik

- **CronJob**: `loki-backup`
  - Her gün gece 04:00'de otomatik olarak çalışır
  - Loki verilerini yedekler
  - 7 günden eski yedeklemeleri temizler

### 3.5. Yedekleme Durumu İzleme

Yedekleme durumunu izlemek için aşağıdaki kaynaklar oluşturuldu:

- **ServiceAccount**: `backup-manager`
  - Yedekleme işlemlerini yönetmek için kullanılır

- **Role**: `backup-manager-role`
  - Yedekleme işlemleri için gerekli izinleri tanımlar

- **RoleBinding**: `backup-manager-binding`
  - ServiceAccount'a Role'ü bağlar

- **ConfigMap**: `backup-status-scripts`
  - `check-backup-status.sh`: Yedekleme durumunu kontrol etmek için betik

- **Job**: `backup-status-check`
  - Yedekleme durumunu kontrol etmek için kullanılır

## 4. Yedekleme ve Geri Yükleme Prosedürleri

### 4.1. Manuel Yedekleme Prosedürü

Manuel yedekleme işlemi için aşağıdaki adımlar izlenmelidir:

1. PostgreSQL için manuel yedekleme:
   ```bash
   kubectl apply -f kubernetes-manifests/backup-restore/postgres-backup-job.yaml
   ```

2. Redis için manuel yedekleme:
   ```bash
   kubectl apply -f kubernetes-manifests/backup-restore/redis-backup-job.yaml
   ```

3. Yedekleme durumunu kontrol etme:
   ```bash
   kubectl apply -f kubernetes-manifests/backup-restore/backup-status-job.yaml
   kubectl logs -f job/backup-status-check
   ```

### 4.2. Geri Yükleme Prosedürü

Geri yükleme işlemi için aşağıdaki adımlar izlenmelidir:

1. PostgreSQL için geri yükleme:
   ```bash
   # Varsayılan olarak en son yedeklemeyi kullanır
   kubectl apply -f kubernetes-manifests/backup-restore/postgres-restore-job.yaml
   
   # Belirli bir yedekleme dosyasını kullanmak için:
   # kubectl edit job/postgres-restore
   # args: ["postgres_altlas_db_20250513010000.sql.gz"] ekleyin
   ```

2. Geri yükleme durumunu kontrol etme:
   ```bash
   kubectl logs -f job/postgres-restore
   ```

## 5. Yedekleme Planı

| Bileşen | Yedekleme Sıklığı | Yedekleme Saati | Saklama Süresi |
|---------|-------------------|-----------------|----------------|
| PostgreSQL | Günlük | 01:00 | 7 gün |
| Redis | Günlük | 02:00 | 7 gün |
| Prometheus | Günlük | 03:00 | 7 gün |
| Loki | Günlük | 04:00 | 7 gün |

## 6. Yedekleme Doğrulama

Yedeklemelerin doğruluğunu ve bütünlüğünü doğrulamak için aşağıdaki adımlar izlenmelidir:

1. Yedekleme durumunu kontrol etme:
   ```bash
   kubectl apply -f kubernetes-manifests/backup-restore/backup-status-job.yaml
   kubectl logs -f job/backup-status-check
   ```

2. Yedekleme loglarını kontrol etme:
   ```bash
   kubectl logs -f cronjob/postgres-backup
   kubectl logs -f cronjob/redis-backup
   kubectl logs -f cronjob/prometheus-backup
   kubectl logs -f cronjob/loki-backup
   ```

3. Düzenli olarak test geri yüklemeleri yapma:
   - Test ortamında geri yükleme işlemini gerçekleştirme
   - Verilerin doğruluğunu ve bütünlüğünü kontrol etme

## 7. Sonraki Adımlar

### 7.1. Yedekleme Stratejisinin İyileştirilmesi

Yedekleme stratejisini iyileştirmek için aşağıdaki adımlar atılmalıdır:

- Yedeklemelerin harici bir depolama alanına (S3, GCS vb.) aktarılması
- Yedekleme başarısızlıklarının bildirilmesi için alarm mekanizması oluşturulması
- Yedekleme ve geri yükleme işlemlerinin otomatikleştirilmesi için bir arayüz oluşturulması

### 7.2. Felaket Kurtarma Planı

Felaket kurtarma planı oluşturmak için aşağıdaki adımlar atılmalıdır:

- Tam bir felaket kurtarma prosedürü oluşturulması
- Felaket kurtarma testlerinin düzenli olarak yapılması
- Felaket kurtarma sürecinin dokümante edilmesi

## 8. Sonuç

ALT_LAS projesinin alpha aşamasına geçiş için gerekli yedekleme ve geri yükleme stratejisi oluşturuldu. Bu strateji, veritabanı ve diğer kalıcı verilerin düzenli olarak yedeklenmesini ve gerektiğinde geri yüklenmesini sağlayacaktır. Yedekleme ve geri yükleme işlemlerinin otomatikleştirilmesi, veri güvenliğini artıracak ve olası veri kayıplarını önleyecektir.
