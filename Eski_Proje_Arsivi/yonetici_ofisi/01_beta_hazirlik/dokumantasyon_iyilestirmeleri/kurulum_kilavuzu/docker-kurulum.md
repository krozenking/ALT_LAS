# Docker Kurulum Kılavuzu

**Versiyon:** 2.0.0  
**Son Güncelleme:** 16 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)

## 1. Genel Bakış

Bu kılavuz, ALT_LAS sisteminin Docker üzerinde kurulumu için adım adım talimatlar içermektedir. ALT_LAS, Docker konteynerleri olarak paketlenmiş mikroservislerden oluşmaktadır ve bu kılavuz, Docker Engine kurulumu, Docker Compose kurulumu, ALT_LAS Docker imajlarının çekilmesi ve ALT_LAS konteynerlerinin çalıştırılması için talimatlar sağlar.

## 2. Ön Koşullar

ALT_LAS'ı Docker üzerinde çalıştırmak için aşağıdaki ön koşulların sağlanması gerekmektedir:

### 2.1. Donanım Gereksinimleri

**Minimum Gereksinimler (Geliştirme Ortamı):**
- İşlemci: Dual-core 2 GHz veya daha yüksek
- RAM: 8 GB veya daha fazla
- Disk Alanı: 50 GB boş alan

**Önerilen Gereksinimler (Üretim Ortamı):**
- İşlemci: Quad-core 3 GHz veya daha yüksek
- RAM: 16 GB veya daha fazla
- Disk Alanı: 100 GB boş alan

### 2.2. Yazılım Gereksinimleri

- İşletim Sistemi:
  - Linux: Ubuntu 20.04 LTS veya daha yüksek, CentOS 8 veya daha yüksek
  - Windows: Windows 10 Pro/Enterprise/Education (64-bit) veya Windows Server 2019 (64-bit)
  - macOS: macOS 10.15 (Catalina) veya daha yüksek
- Docker Engine 20.10 veya daha yüksek
- Docker Compose 2.0 veya daha yüksek
- Git 2.30 veya daha yüksek

### 2.3. Ağ Gereksinimleri

- Açık portlar:
  - 80: HTTP trafiği için
  - 443: HTTPS trafiği için
  - 5432: PostgreSQL için
  - 27017: MongoDB için
  - 9200, 9300: Elasticsearch için
  - 5601: Kibana için
  - 6379: Redis için
  - 5672, 15672: RabbitMQ için
  - 9090, 9091: Prometheus için
  - 3000: Grafana için
- İnternet erişimi (Docker imajlarını çekmek için)

## 3. Docker Engine Kurulumu

Bu bölümde, farklı işletim sistemleri için Docker Engine kurulum talimatları verilmektedir.

### 3.1. Linux Üzerinde Docker Engine Kurulumu

#### 3.1.1. Ubuntu

1. Sistem paketlerini güncelleyin:

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

2. Docker kurulumu için gerekli paketleri yükleyin:

```bash
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
```

3. Docker'ın resmi GPG anahtarını ekleyin:

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

4. Docker'ın resmi apt deposunu ekleyin:

```bash
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
```

5. Sistem paketlerini tekrar güncelleyin:

```bash
sudo apt-get update
```

6. Docker Engine'i yükleyin:

```bash
sudo apt-get install -y docker-ce docker-ce-cli containerd.io
```

7. Docker servisini başlatın ve sistem başlangıcında otomatik olarak başlamasını sağlayın:

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

8. Docker'ın doğru bir şekilde kurulduğunu doğrulayın:

```bash
sudo docker --version
sudo docker run hello-world
```

9. (İsteğe bağlı) Kullanıcınızı docker grubuna ekleyerek sudo kullanmadan Docker komutlarını çalıştırabilirsiniz:

```bash
sudo usermod -aG docker $USER
```

Not: Bu değişikliğin etkili olması için oturumu kapatıp tekrar açmanız gerekebilir.

#### 3.1.2. CentOS

1. Sistem paketlerini güncelleyin:

```bash
sudo yum update -y
```

2. Docker kurulumu için gerekli paketleri yükleyin:

```bash
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```

3. Docker'ın resmi yum deposunu ekleyin:

```bash
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

4. Docker Engine'i yükleyin:

```bash
sudo yum install -y docker-ce docker-ce-cli containerd.io
```

5. Docker servisini başlatın ve sistem başlangıcında otomatik olarak başlamasını sağlayın:

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

6. Docker'ın doğru bir şekilde kurulduğunu doğrulayın:

```bash
sudo docker --version
sudo docker run hello-world
```

7. (İsteğe bağlı) Kullanıcınızı docker grubuna ekleyerek sudo kullanmadan Docker komutlarını çalıştırabilirsiniz:

```bash
sudo usermod -aG docker $USER
```

Not: Bu değişikliğin etkili olması için oturumu kapatıp tekrar açmanız gerekebilir.

### 3.2. Windows Üzerinde Docker Engine Kurulumu

#### 3.2.1. Docker Desktop for Windows

1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop) sayfasından Docker Desktop yükleyicisini indirin.

2. İndirilen yükleyiciyi çalıştırın ve ekrandaki talimatları izleyin.

3. Kurulum sırasında, WSL 2 (Windows Subsystem for Linux 2) kullanımını etkinleştirmeniz istenecektir. WSL 2'yi etkinleştirmek için ekrandaki talimatları izleyin.

4. Kurulum tamamlandıktan sonra, bilgisayarınızı yeniden başlatın.

5. Docker Desktop'ı başlatın ve Docker Engine'in çalıştığını doğrulayın:

```powershell
docker --version
docker run hello-world
```

### 3.3. macOS Üzerinde Docker Engine Kurulumu

#### 3.3.1. Docker Desktop for Mac

1. [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop) sayfasından Docker Desktop yükleyicisini indirin.

2. İndirilen .dmg dosyasını açın ve Docker.app'i Applications klasörüne sürükleyin.

3. Applications klasöründen Docker.app'i başlatın.

4. Docker Desktop'ın başlamasını bekleyin ve Docker Engine'in çalıştığını doğrulayın:

```bash
docker --version
docker run hello-world
```

## 4. Docker Compose Kurulumu

Docker Compose, çoklu konteyner Docker uygulamalarını tanımlamak ve çalıştırmak için bir araçtır. ALT_LAS, birden fazla servis içerdiği için Docker Compose kullanılması önerilir.

### 4.1. Linux Üzerinde Docker Compose Kurulumu

1. Docker Compose'un en son sürümünü indirin:

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.5.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

2. İndirilen dosyaya çalıştırma izni verin:

```bash
sudo chmod +x /usr/local/bin/docker-compose
```

3. Docker Compose'un doğru bir şekilde kurulduğunu doğrulayın:

```bash
docker-compose --version
```

### 4.2. Windows ve macOS Üzerinde Docker Compose Kurulumu

Docker Desktop for Windows ve Docker Desktop for Mac, Docker Compose'u içerir, bu nedenle ayrıca kurmanıza gerek yoktur.

## 5. Docker Registry Kurulumu (İsteğe Bağlı)

Eğer özel bir Docker Registry kullanmak istiyorsanız, aşağıdaki adımları izleyebilirsiniz. Bu adım isteğe bağlıdır ve Docker Hub gibi halka açık bir registry kullanıyorsanız gerekli değildir.

### 5.1. Docker Registry Konteynerinin Çalıştırılması

1. Docker Registry konteynerini çalıştırın:

```bash
docker run -d -p 5000:5000 --restart=always --name registry registry:2
```

2. (İsteğe bağlı) Kimlik doğrulama eklemek için:

```bash
mkdir -p auth
docker run --entrypoint htpasswd httpd:2 -Bbn username password > auth/htpasswd
docker run -d -p 5000:5000 --restart=always --name registry \
  -v "$(pwd)"/auth:/auth \
  -e "REGISTRY_AUTH=htpasswd" \
  -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
  -e "REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd" \
  registry:2
```

3. (İsteğe bağlı) TLS eklemek için:

```bash
mkdir -p certs
openssl req -newkey rsa:4096 -nodes -sha256 -keyout certs/domain.key -x509 -days 365 -out certs/domain.crt
docker run -d -p 5000:5000 --restart=always --name registry \
  -v "$(pwd)"/certs:/certs \
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/domain.crt \
  -e REGISTRY_HTTP_TLS_KEY=/certs/domain.key \
  registry:2
```

## 6. ALT_LAS Docker İmajlarının Çekilmesi

ALT_LAS Docker imajları, Docker Hub'da veya özel Docker Registry'de bulunabilir. Bu bölümde, ALT_LAS Docker imajlarının nasıl çekileceği açıklanmaktadır.

### 6.1. Docker Hub'dan İmajların Çekilmesi

1. Docker Hub'a giriş yapın (isteğe bağlı):

```bash
docker login
```

2. ALT_LAS Docker imajlarını çekin:

```bash
docker pull alt-las/api-gateway:latest
docker pull alt-las/segmentation-service:latest
docker pull alt-las/runner-service:latest
docker pull alt-las/archive-service:latest
docker pull alt-las/ai-orchestrator:latest
```

### 6.2. Özel Docker Registry'den İmajların Çekilmesi

1. Özel Docker Registry'ye giriş yapın:

```bash
docker login registry.example.com
```

2. ALT_LAS Docker imajlarını çekin:

```bash
docker pull registry.example.com/alt-las/api-gateway:latest
docker pull registry.example.com/alt-las/segmentation-service:latest
docker pull registry.example.com/alt-las/runner-service:latest
docker pull registry.example.com/alt-las/archive-service:latest
docker pull registry.example.com/alt-las/ai-orchestrator:latest
```

## 7. ALT_LAS Konteynerlerinin Çalıştırılması

ALT_LAS konteynerlerini çalıştırmak için Docker Compose kullanılması önerilir. Bu bölümde, ALT_LAS konteynerlerinin Docker Compose ile nasıl çalıştırılacağı açıklanmaktadır.

### 7.1. Docker Compose Dosyasının Oluşturulması

1. Yeni bir dizin oluşturun ve bu dizine geçin:

```bash
mkdir alt-las
cd alt-las
```

2. `docker-compose.yml` dosyasını oluşturun:

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Veritabanları
  postgres:
    image: postgres:13
    container_name: alt-las-postgres
    environment:
      POSTGRES_USER: altlas
      POSTGRES_PASSWORD: altlas
      POSTGRES_DB: altlas
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - alt-las-network
    restart: always

  mongodb:
    image: mongo:5
    container_name: alt-las-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: altlas
      MONGO_INITDB_ROOT_PASSWORD: altlas
    volumes:
      - mongodb-data:/data/db
    ports:
      - "27017:27017"
    networks:
      - alt-las-network
    restart: always

  elasticsearch:
    image: elasticsearch:7.17.0
    container_name: alt-las-elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
      - "9300:9300"
    networks:
      - alt-las-network
    restart: always

  redis:
    image: redis:6
    container_name: alt-las-redis
    ports:
      - "6379:6379"
    networks:
      - alt-las-network
    restart: always

  rabbitmq:
    image: rabbitmq:3-management
    container_name: alt-las-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: altlas
      RABBITMQ_DEFAULT_PASS: altlas
    ports:
      - "5672:5672"
      - "15672:15672"
    networks:
      - alt-las-network
    restart: always

  # ALT_LAS Servisleri
  api-gateway:
    image: alt-las/api-gateway:latest
    container_name: alt-las-api-gateway
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/altlas
      SPRING_DATASOURCE_USERNAME: altlas
      SPRING_DATASOURCE_PASSWORD: altlas
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
      SPRING_RABBITMQ_HOST: rabbitmq
      SPRING_RABBITMQ_PORT: 5672
      SPRING_RABBITMQ_USERNAME: altlas
      SPRING_RABBITMQ_PASSWORD: altlas
      SEGMENTATION_SERVICE_URL: http://segmentation-service:8080
      RUNNER_SERVICE_URL: http://runner-service:8080
      ARCHIVE_SERVICE_URL: http://archive-service:8080
      AI_ORCHESTRATOR_URL: http://ai-orchestrator:8080
    ports:
      - "8080:8080"
    networks:
      - alt-las-network
    depends_on:
      - postgres
      - redis
      - rabbitmq
    restart: always

  segmentation-service:
    image: alt-las/segmentation-service:latest
    container_name: alt-las-segmentation-service
    environment:
      MONGODB_URI: mongodb://altlas:altlas@mongodb:27017/altlas
      RABBITMQ_HOST: rabbitmq
      RABBITMQ_PORT: 5672
      RABBITMQ_USERNAME: altlas
      RABBITMQ_PASSWORD: altlas
      ARCHIVE_SERVICE_URL: http://archive-service:8080
    networks:
      - alt-las-network
    depends_on:
      - mongodb
      - rabbitmq
    restart: always

  runner-service:
    image: alt-las/runner-service:latest
    container_name: alt-las-runner-service
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/altlas
      SPRING_DATASOURCE_USERNAME: altlas
      SPRING_DATASOURCE_PASSWORD: altlas
      SPRING_RABBITMQ_HOST: rabbitmq
      SPRING_RABBITMQ_PORT: 5672
      SPRING_RABBITMQ_USERNAME: altlas
      SPRING_RABBITMQ_PASSWORD: altlas
    networks:
      - alt-las-network
    depends_on:
      - postgres
      - rabbitmq
    restart: always

  archive-service:
    image: alt-las/archive-service:latest
    container_name: alt-las-archive-service
    environment:
      ELASTICSEARCH_HOST: elasticsearch
      ELASTICSEARCH_PORT: 9200
    volumes:
      - archive-data:/data
    networks:
      - alt-las-network
    depends_on:
      - elasticsearch
    restart: always

  ai-orchestrator:
    image: alt-las/ai-orchestrator:latest
    container_name: alt-las-ai-orchestrator
    environment:
      MONGODB_URI: mongodb://altlas:altlas@mongodb:27017/altlas
      RABBITMQ_HOST: rabbitmq
      RABBITMQ_PORT: 5672
      RABBITMQ_USERNAME: altlas
      RABBITMQ_PASSWORD: altlas
    networks:
      - alt-las-network
    depends_on:
      - mongodb
      - rabbitmq
    restart: always

networks:
  alt-las-network:
    driver: bridge

volumes:
  postgres-data:
  mongodb-data:
  elasticsearch-data:
  archive-data:
EOF
```

### 7.2. Docker Compose ile Konteynerlerin Çalıştırılması

1. Docker Compose ile konteynerleri başlatın:

```bash
docker-compose up -d
```

2. Konteynerlerin durumunu kontrol edin:

```bash
docker-compose ps
```

3. Konteyner günlüklerini görüntüleyin:

```bash
docker-compose logs -f
```

### 7.3. ALT_LAS Uygulamasına Erişim

ALT_LAS uygulamasına aşağıdaki URL'den erişebilirsiniz:

```
http://localhost:8080
```

## 8. Sorun Giderme

Bu bölümde, Docker kurulumu ve ALT_LAS konteynerlerinin çalıştırılması sırasında karşılaşılabilecek yaygın sorunlar ve çözümleri açıklanmaktadır.

### 8.1. Docker Engine Sorunları

#### 8.1.1. Docker Daemon Başlatılamıyor

**Sorun**: Docker daemon başlatılamıyor veya çalışmıyor.

**Çözüm**:
1. Docker servisinin durumunu kontrol edin:
```bash
sudo systemctl status docker
```

2. Docker servisini yeniden başlatın:
```bash
sudo systemctl restart docker
```

3. Docker günlüklerini kontrol edin:
```bash
sudo journalctl -u docker
```

#### 8.1.2. Docker Komutları Yetki Hatası Veriyor

**Sorun**: Docker komutları çalıştırıldığında "permission denied" hatası alınıyor.

**Çözüm**:
1. Kullanıcınızı docker grubuna ekleyin:
```bash
sudo usermod -aG docker $USER
```

2. Oturumu kapatıp tekrar açın veya şu komutu çalıştırın:
```bash
newgrp docker
```

### 8.2. Docker Compose Sorunları

#### 8.2.1. Docker Compose Komutu Bulunamıyor

**Sorun**: `docker-compose` komutu bulunamıyor.

**Çözüm**:
1. Docker Compose'un kurulu olduğunu doğrulayın:
```bash
which docker-compose
```

2. Docker Compose'u yeniden kurun:
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.5.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 8.2.2. Docker Compose Up Hatası

**Sorun**: `docker-compose up` komutu hata veriyor.

**Çözüm**:
1. Docker Compose dosyasının doğru olduğunu kontrol edin:
```bash
docker-compose config
```

2. Docker Compose günlüklerini kontrol edin:
```bash
docker-compose logs
```

3. Docker Compose'u yeniden başlatın:
```bash
docker-compose down
docker-compose up -d
```

### 8.3. ALT_LAS Konteyner Sorunları

#### 8.3.1. Konteynerler Başlatılamıyor

**Sorun**: ALT_LAS konteynerleri başlatılamıyor veya çalışmıyor.

**Çözüm**:
1. Konteyner durumlarını kontrol edin:
```bash
docker-compose ps
```

2. Konteyner günlüklerini kontrol edin:
```bash
docker-compose logs -f
```

3. Bağımlılıkların hazır olduğundan emin olun (veritabanı, mesaj kuyruğu vb.).

#### 8.3.2. Servisler Birbirine Erişemiyor

**Sorun**: ALT_LAS servisleri birbirine erişemiyor.

**Çözüm**:
1. Ağ yapılandırmasını kontrol edin:
```bash
docker network inspect alt-las_alt-las-network
```

2. Servis isimlerinin ve portların doğru olduğunu kontrol edin.

3. Servislerin aynı ağda olduğunu kontrol edin.

## 9. Kaynaklar

- [Docker Dokümantasyonu](https://docs.docker.com/)
- [Docker Compose Dokümantasyonu](https://docs.docker.com/compose/)
- [Docker Hub](https://hub.docker.com/)
- [ALT_LAS GitHub Deposu](https://github.com/alt-las/alt-las)
