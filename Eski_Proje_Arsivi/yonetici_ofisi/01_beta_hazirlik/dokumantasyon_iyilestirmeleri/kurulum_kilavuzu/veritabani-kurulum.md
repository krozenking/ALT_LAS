# Veritabanı Kurulum Kılavuzu

**Versiyon:** 2.0.0  
**Son Güncelleme:** 16 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)

## 1. Genel Bakış

Bu kılavuz, ALT_LAS sisteminin veritabanı bileşenlerinin kurulumu ve yapılandırması için adım adım talimatlar içermektedir. ALT_LAS, farklı servisler için farklı veritabanları kullanmaktadır:

- **PostgreSQL**: API Gateway, Runner Service ve kullanıcı yönetimi için ilişkisel veritabanı
- **MongoDB**: Segmentation Service ve AI Orchestrator için doküman veritabanı
- **Elasticsearch**: Archive Service için arama veritabanı
- **Redis**: Önbellek ve oturum yönetimi için

Bu kılavuz, bu veritabanlarının kurulumu, yapılandırması, yedeklenmesi ve bakımı için talimatlar sağlar.

## 2. Ön Koşullar

ALT_LAS veritabanlarını kurmak ve yapılandırmak için aşağıdaki ön koşulların sağlanması gerekmektedir:

### 2.1. Donanım Gereksinimleri

**Minimum Gereksinimler (Geliştirme Ortamı):**
- İşlemci: Dual-core 2 GHz veya daha yüksek
- RAM: 8 GB veya daha fazla
- Disk Alanı: 50 GB boş alan

**Önerilen Gereksinimler (Üretim Ortamı):**
- İşlemci: Quad-core 3 GHz veya daha yüksek
- RAM: 16 GB veya daha fazla
- Disk Alanı: 100 GB boş alan (SSD önerilir)

### 2.2. Yazılım Gereksinimleri

- İşletim Sistemi:
  - Linux: Ubuntu 20.04 LTS veya daha yüksek, CentOS 8 veya daha yüksek
  - Windows: Windows Server 2019 (64-bit) veya daha yüksek
  - macOS: macOS 10.15 (Catalina) veya daha yüksek
- Docker Engine 20.10 veya daha yüksek (Docker kullanılacaksa)
- Java 11 veya daha yüksek (PostgreSQL için)
- Python 3.8 veya daha yüksek (MongoDB ve Elasticsearch için)

### 2.3. Ağ Gereksinimleri

- Açık portlar:
  - 5432: PostgreSQL için
  - 27017: MongoDB için
  - 9200, 9300: Elasticsearch için
  - 6379: Redis için
- Güvenlik duvarı yapılandırması
- Statik IP adresleri (üretim ortamı için)

## 3. PostgreSQL Kurulumu ve Yapılandırması

PostgreSQL, ALT_LAS'ın API Gateway ve Runner Service bileşenleri için kullanılan ilişkisel veritabanıdır.

### 3.1. PostgreSQL Kurulumu

#### 3.1.1. Linux Üzerinde PostgreSQL Kurulumu

1. Sistem paketlerini güncelleyin:

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

2. PostgreSQL paketlerini yükleyin:

```bash
sudo apt-get install -y postgresql postgresql-contrib
```

3. PostgreSQL servisinin durumunu kontrol edin:

```bash
sudo systemctl status postgresql
```

4. PostgreSQL servisini başlatın ve sistem başlangıcında otomatik olarak başlamasını sağlayın:

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 3.1.2. Docker ile PostgreSQL Kurulumu

1. PostgreSQL Docker imajını çekin:

```bash
docker pull postgres:13
```

2. PostgreSQL konteynerini çalıştırın:

```bash
docker run -d \
  --name alt-las-postgres \
  -e POSTGRES_USER=altlas \
  -e POSTGRES_PASSWORD=altlas \
  -e POSTGRES_DB=altlas \
  -p 5432:5432 \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:13
```

### 3.2. PostgreSQL Yapılandırması

#### 3.2.1. PostgreSQL Kullanıcı ve Veritabanı Oluşturma

1. PostgreSQL komut satırına bağlanın:

```bash
sudo -u postgres psql
```

2. ALT_LAS için bir kullanıcı oluşturun:

```sql
CREATE USER altlas WITH PASSWORD 'altlas';
```

3. ALT_LAS için bir veritabanı oluşturun:

```sql
CREATE DATABASE altlas;
```

4. Kullanıcıya veritabanı üzerinde yetki verin:

```sql
GRANT ALL PRIVILEGES ON DATABASE altlas TO altlas;
```

5. PostgreSQL komut satırından çıkın:

```sql
\q
```

#### 3.2.2. PostgreSQL Performans Ayarları

PostgreSQL'in performansını optimize etmek için `postgresql.conf` dosyasında aşağıdaki ayarları yapılandırın:

```bash
sudo nano /etc/postgresql/13/main/postgresql.conf
```

Aşağıdaki ayarları güncelleyin:

```
# Bellek Ayarları
shared_buffers = 2GB                  # min 128kB
work_mem = 16MB                       # min 64kB
maintenance_work_mem = 256MB          # min 1MB
effective_cache_size = 6GB

# Yazma Ayarları
wal_buffers = 16MB                    # min 32kB, -1 shared_buffers'ın 1/32'si
synchronous_commit = off              # synchronization level; off, local, remote_write, remote_apply, or on
checkpoint_timeout = 15min            # range 30s-1d
checkpoint_completion_target = 0.9    # checkpoint target duration, 0.0 - 1.0

# Planlayıcı Ayarları
random_page_cost = 1.1                # SSD için
effective_io_concurrency = 200        # SSD için

# Günlük Ayarları
log_min_duration_statement = 1000     # -1 is disabled, 0 logs all statements
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0                    # log temporary files equal or larger than the specified size in kilobytes; -1 disables, 0 logs all temp files
```

PostgreSQL servisini yeniden başlatın:

```bash
sudo systemctl restart postgresql
```

## 4. MongoDB Kurulumu ve Yapılandırması

MongoDB, ALT_LAS'ın Segmentation Service ve AI Orchestrator bileşenleri için kullanılan doküman veritabanıdır.

### 4.1. MongoDB Kurulumu

#### 4.1.1. Linux Üzerinde MongoDB Kurulumu

1. MongoDB GPG anahtarını içe aktarın:

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
```

2. MongoDB deposunu ekleyin:

```bash
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
```

3. Sistem paketlerini güncelleyin:

```bash
sudo apt-get update
```

4. MongoDB paketlerini yükleyin:

```bash
sudo apt-get install -y mongodb-org
```

5. MongoDB servisini başlatın ve sistem başlangıcında otomatik olarak başlamasını sağlayın:

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

6. MongoDB servisinin durumunu kontrol edin:

```bash
sudo systemctl status mongod
```

#### 4.1.2. Docker ile MongoDB Kurulumu

1. MongoDB Docker imajını çekin:

```bash
docker pull mongo:5
```

2. MongoDB konteynerini çalıştırın:

```bash
docker run -d \
  --name alt-las-mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=altlas \
  -e MONGO_INITDB_ROOT_PASSWORD=altlas \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
  mongo:5
```

### 4.2. MongoDB Yapılandırması

#### 4.2.1. MongoDB Kullanıcı ve Veritabanı Oluşturma

1. MongoDB kabuğuna bağlanın:

```bash
mongosh
```

2. Admin veritabanına geçin:

```javascript
use admin
```

3. Admin kullanıcısı oluşturun:

```javascript
db.createUser({
  user: "admin",
  pwd: "admin",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
```

4. ALT_LAS veritabanına geçin:

```javascript
use altlas
```

5. ALT_LAS kullanıcısı oluşturun:

```javascript
db.createUser({
  user: "altlas",
  pwd: "altlas",
  roles: [ { role: "readWrite", db: "altlas" } ]
})
```

6. MongoDB kabuğundan çıkın:

```javascript
exit
```

#### 4.2.2. MongoDB Performans Ayarları

MongoDB'nin performansını optimize etmek için `mongod.conf` dosyasında aşağıdaki ayarları yapılandırın:

```bash
sudo nano /etc/mongod.conf
```

Aşağıdaki ayarları güncelleyin:

```yaml
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

processManagement:
  timeZoneInfo: /usr/share/zoneinfo

security:
  authorization: enabled
```

MongoDB servisini yeniden başlatın:

```bash
sudo systemctl restart mongod
```

## 5. Elasticsearch Kurulumu ve Yapılandırması

Elasticsearch, ALT_LAS'ın Archive Service bileşeni için kullanılan arama veritabanıdır.

### 5.1. Elasticsearch Kurulumu

#### 5.1.1. Linux Üzerinde Elasticsearch Kurulumu

1. Elasticsearch GPG anahtarını içe aktarın:

```bash
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
```

2. Elasticsearch deposunu ekleyin:

```bash
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
```

3. Sistem paketlerini güncelleyin:

```bash
sudo apt-get update
```

4. Elasticsearch paketini yükleyin:

```bash
sudo apt-get install -y elasticsearch
```

5. Elasticsearch servisini başlatın ve sistem başlangıcında otomatik olarak başlamasını sağlayın:

```bash
sudo systemctl start elasticsearch
sudo systemctl enable elasticsearch
```

6. Elasticsearch servisinin durumunu kontrol edin:

```bash
sudo systemctl status elasticsearch
```

#### 5.1.2. Docker ile Elasticsearch Kurulumu

1. Elasticsearch Docker imajını çekin:

```bash
docker pull elasticsearch:7.17.0
```

2. Elasticsearch konteynerini çalıştırın:

```bash
docker run -d \
  --name alt-las-elasticsearch \
  -e "discovery.type=single-node" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  -p 9200:9200 \
  -p 9300:9300 \
  -v elasticsearch-data:/usr/share/elasticsearch/data \
  elasticsearch:7.17.0
```

### 5.2. Elasticsearch Yapılandırması

#### 5.2.1. Elasticsearch Ayarları

Elasticsearch'ün performansını optimize etmek için `elasticsearch.yml` dosyasında aşağıdaki ayarları yapılandırın:

```bash
sudo nano /etc/elasticsearch/elasticsearch.yml
```

Aşağıdaki ayarları güncelleyin:

```yaml
cluster.name: alt-las
node.name: node-1
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 127.0.0.1
http.port: 9200
discovery.type: single-node
```

Elasticsearch servisini yeniden başlatın:

```bash
sudo systemctl restart elasticsearch
```

#### 5.2.2. Elasticsearch İndeksleri Oluşturma

1. Elasticsearch'e HTTP isteği göndererek indeks oluşturun:

```bash
curl -X PUT "localhost:9200/archives" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "name": { "type": "text" },
      "description": { "type": "text" },
      "createdAt": { "type": "date" },
      "updatedAt": { "type": "date" },
      "tags": { "type": "keyword" },
      "metadata": { "type": "object" }
    }
  }
}
'
```

## 6. Redis Kurulumu ve Yapılandırması

Redis, ALT_LAS'ın önbellek ve oturum yönetimi için kullanılan bellek içi veritabanıdır.

### 6.1. Redis Kurulumu

#### 6.1.1. Linux Üzerinde Redis Kurulumu

1. Redis paketini yükleyin:

```bash
sudo apt-get install -y redis-server
```

2. Redis servisini başlatın ve sistem başlangıcında otomatik olarak başlamasını sağlayın:

```bash
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

3. Redis servisinin durumunu kontrol edin:

```bash
sudo systemctl status redis-server
```

#### 6.1.2. Docker ile Redis Kurulumu

1. Redis Docker imajını çekin:

```bash
docker pull redis:6
```

2. Redis konteynerini çalıştırın:

```bash
docker run -d \
  --name alt-las-redis \
  -p 6379:6379 \
  redis:6
```

### 6.2. Redis Yapılandırması

#### 6.2.1. Redis Ayarları

Redis'in performansını optimize etmek için `redis.conf` dosyasında aşağıdaki ayarları yapılandırın:

```bash
sudo nano /etc/redis/redis.conf
```

Aşağıdaki ayarları güncelleyin:

```
bind 127.0.0.1
port 6379
daemonize yes
supervised systemd
maxmemory 512mb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec
```

Redis servisini yeniden başlatın:

```bash
sudo systemctl restart redis-server
```

## 7. Veritabanı Yedekleme ve Geri Yükleme

Bu bölümde, ALT_LAS veritabanlarının yedeklenmesi ve geri yüklenmesi için talimatlar verilmektedir.

### 7.1. PostgreSQL Yedekleme ve Geri Yükleme

#### 7.1.1. PostgreSQL Yedekleme

1. `pg_dump` ile veritabanını yedekleyin:

```bash
pg_dump -U altlas -h localhost -p 5432 -F c -b -v -f altlas_backup.dump altlas
```

2. Otomatik yedekleme için bir cron görevi oluşturun:

```bash
echo "0 2 * * * pg_dump -U altlas -h localhost -p 5432 -F c -b -v -f /backup/altlas_$(date +\%Y\%m\%d).dump altlas" | sudo tee -a /etc/crontab
```

#### 7.1.2. PostgreSQL Geri Yükleme

1. `pg_restore` ile veritabanını geri yükleyin:

```bash
pg_restore -U altlas -h localhost -p 5432 -d altlas -v altlas_backup.dump
```

### 7.2. MongoDB Yedekleme ve Geri Yükleme

#### 7.2.1. MongoDB Yedekleme

1. `mongodump` ile veritabanını yedekleyin:

```bash
mongodump --uri="mongodb://altlas:altlas@localhost:27017/altlas" --out=/backup/mongodb_$(date +%Y%m%d)
```

2. Otomatik yedekleme için bir cron görevi oluşturun:

```bash
echo "0 2 * * * mongodump --uri=\"mongodb://altlas:altlas@localhost:27017/altlas\" --out=/backup/mongodb_$(date +\%Y\%m\%d)" | sudo tee -a /etc/crontab
```

#### 7.2.2. MongoDB Geri Yükleme

1. `mongorestore` ile veritabanını geri yükleyin:

```bash
mongorestore --uri="mongodb://altlas:altlas@localhost:27017/altlas" --drop /backup/mongodb_20250616/altlas
```

### 7.3. Elasticsearch Yedekleme ve Geri Yükleme

#### 7.3.1. Elasticsearch Yedekleme

1. Elasticsearch için bir depo oluşturun:

```bash
curl -X PUT "localhost:9200/_snapshot/backup" -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/backup/elasticsearch"
  }
}
'
```

2. Elasticsearch indekslerini yedekleyin:

```bash
curl -X PUT "localhost:9200/_snapshot/backup/snapshot_$(date +%Y%m%d)?wait_for_completion=true" -H 'Content-Type: application/json' -d'
{
  "indices": "archives",
  "ignore_unavailable": true,
  "include_global_state": false
}
'
```

#### 7.3.2. Elasticsearch Geri Yükleme

1. Elasticsearch indekslerini geri yükleyin:

```bash
curl -X POST "localhost:9200/_snapshot/backup/snapshot_20250616/_restore" -H 'Content-Type: application/json' -d'
{
  "indices": "archives",
  "ignore_unavailable": true,
  "include_global_state": false
}
'
```

### 7.4. Redis Yedekleme ve Geri Yükleme

#### 7.4.1. Redis Yedekleme

1. Redis'in otomatik yedekleme özelliğini yapılandırın:

```bash
sudo nano /etc/redis/redis.conf
```

Aşağıdaki ayarları ekleyin:

```
save 900 1
save 300 10
save 60 10000
dir /var/lib/redis
dbfilename dump.rdb
```

2. Manuel olarak Redis veritabanını yedekleyin:

```bash
redis-cli save
```

3. RDB dosyasını kopyalayın:

```bash
sudo cp /var/lib/redis/dump.rdb /backup/redis_$(date +%Y%m%d).rdb
```

#### 7.4.2. Redis Geri Yükleme

1. Redis servisini durdurun:

```bash
sudo systemctl stop redis-server
```

2. RDB dosyasını geri yükleyin:

```bash
sudo cp /backup/redis_20250616.rdb /var/lib/redis/dump.rdb
sudo chown redis:redis /var/lib/redis/dump.rdb
```

3. Redis servisini başlatın:

```bash
sudo systemctl start redis-server
```

## 8. Veritabanı İzleme ve Bakım

Bu bölümde, ALT_LAS veritabanlarının izlenmesi ve bakımı için talimatlar verilmektedir.

### 8.1. PostgreSQL İzleme ve Bakım

#### 8.1.1. PostgreSQL İzleme

1. PostgreSQL durumunu kontrol edin:

```bash
sudo -u postgres pg_ctl status -D /var/lib/postgresql/13/main
```

2. PostgreSQL istatistiklerini görüntüleyin:

```sql
SELECT * FROM pg_stat_activity;
```

3. PostgreSQL tablo boyutlarını görüntüleyin:

```sql
SELECT
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS total_size
FROM
  information_schema.tables
WHERE
  table_schema = 'public'
ORDER BY
  pg_total_relation_size(quote_ident(table_name)) DESC;
```

#### 8.1.2. PostgreSQL Bakım

1. PostgreSQL veritabanını vakumla:

```sql
VACUUM ANALYZE;
```

2. PostgreSQL indekslerini yeniden oluşturun:

```sql
REINDEX DATABASE altlas;
```

### 8.2. MongoDB İzleme ve Bakım

#### 8.2.1. MongoDB İzleme

1. MongoDB durumunu kontrol edin:

```bash
mongosh --eval "db.serverStatus()"
```

2. MongoDB koleksiyon istatistiklerini görüntüleyin:

```javascript
use altlas
db.stats()
db.getCollectionNames().forEach(function(collection) {
  print(collection + ": " + db[collection].count() + " documents");
})
```

#### 8.2.2. MongoDB Bakım

1. MongoDB koleksiyonlarını kompakt hale getirin:

```javascript
use altlas
db.runCommand({ compact: "collection_name" })
```

2. MongoDB indekslerini yeniden oluşturun:

```javascript
use altlas
db.collection_name.reIndex()
```

### 8.3. Elasticsearch İzleme ve Bakım

#### 8.3.1. Elasticsearch İzleme

1. Elasticsearch durumunu kontrol edin:

```bash
curl -X GET "localhost:9200/_cluster/health?pretty"
```

2. Elasticsearch indeks istatistiklerini görüntüleyin:

```bash
curl -X GET "localhost:9200/_cat/indices?v"
```

#### 8.3.2. Elasticsearch Bakım

1. Elasticsearch indekslerini optimize edin:

```bash
curl -X POST "localhost:9200/archives/_forcemerge?max_num_segments=1"
```

2. Elasticsearch indekslerini yeniden indeksleyin:

```bash
curl -X POST "localhost:9200/_reindex" -H 'Content-Type: application/json' -d'
{
  "source": {
    "index": "archives"
  },
  "dest": {
    "index": "archives_new"
  }
}
'
```

### 8.4. Redis İzleme ve Bakım

#### 8.4.1. Redis İzleme

1. Redis durumunu kontrol edin:

```bash
redis-cli ping
```

2. Redis istatistiklerini görüntüleyin:

```bash
redis-cli info
```

#### 8.4.2. Redis Bakım

1. Redis veritabanını temizleyin:

```bash
redis-cli flushall
```

2. Redis bellek kullanımını optimize edin:

```bash
redis-cli config set maxmemory-policy allkeys-lru
```

## 9. Sorun Giderme

Bu bölümde, ALT_LAS veritabanlarının kurulumu ve yapılandırması sırasında karşılaşılabilecek yaygın sorunlar ve çözümleri açıklanmaktadır.

### 9.1. PostgreSQL Sorunları

#### 9.1.1. PostgreSQL Bağlantı Hatası

**Sorun**: PostgreSQL'e bağlanılamıyor.

**Çözüm**:
1. PostgreSQL servisinin çalıştığını kontrol edin:
```bash
sudo systemctl status postgresql
```

2. PostgreSQL yapılandırma dosyasını kontrol edin:
```bash
sudo nano /etc/postgresql/13/main/postgresql.conf
```

3. PostgreSQL istemci kimlik doğrulama dosyasını kontrol edin:
```bash
sudo nano /etc/postgresql/13/main/pg_hba.conf
```

### 9.2. MongoDB Sorunları

#### 9.2.1. MongoDB Bağlantı Hatası

**Sorun**: MongoDB'ye bağlanılamıyor.

**Çözüm**:
1. MongoDB servisinin çalıştığını kontrol edin:
```bash
sudo systemctl status mongod
```

2. MongoDB yapılandırma dosyasını kontrol edin:
```bash
sudo nano /etc/mongod.conf
```

3. MongoDB günlüklerini kontrol edin:
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

### 9.3. Elasticsearch Sorunları

#### 9.3.1. Elasticsearch Bağlantı Hatası

**Sorun**: Elasticsearch'e bağlanılamıyor.

**Çözüm**:
1. Elasticsearch servisinin çalıştığını kontrol edin:
```bash
sudo systemctl status elasticsearch
```

2. Elasticsearch yapılandırma dosyasını kontrol edin:
```bash
sudo nano /etc/elasticsearch/elasticsearch.yml
```

3. Elasticsearch günlüklerini kontrol edin:
```bash
sudo tail -f /var/log/elasticsearch/elasticsearch.log
```

### 9.4. Redis Sorunları

#### 9.4.1. Redis Bağlantı Hatası

**Sorun**: Redis'e bağlanılamıyor.

**Çözüm**:
1. Redis servisinin çalıştığını kontrol edin:
```bash
sudo systemctl status redis-server
```

2. Redis yapılandırma dosyasını kontrol edin:
```bash
sudo nano /etc/redis/redis.conf
```

3. Redis günlüklerini kontrol edin:
```bash
sudo tail -f /var/log/redis/redis-server.log
```

## 10. Kaynaklar

- [PostgreSQL Dokümantasyonu](https://www.postgresql.org/docs/)
- [MongoDB Dokümantasyonu](https://docs.mongodb.com/)
- [Elasticsearch Dokümantasyonu](https://www.elastic.co/guide/index.html)
- [Redis Dokümantasyonu](https://redis.io/documentation)
