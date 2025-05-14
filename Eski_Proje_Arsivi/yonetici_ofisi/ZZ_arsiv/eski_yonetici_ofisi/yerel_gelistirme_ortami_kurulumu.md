# ALT_LAS Projesi - Yerel Geliştirme Ortamı Kurulumu

**Tarih:** 10 Mayıs 2025
**Hazırlayan:** Yönetici
**Konu:** Yerel Geliştirme Ortamının Kurulumu ve ALT_LAS Projesinin Çalıştırılması

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin yerel geliştirme ortamında kurulması ve çalıştırılması için gerekli adımları detaylandırmaktadır. Belge, geliştirme ekibinin yerel makinelerinde tutarlı bir geliştirme ortamı kurmasını ve projeyi bu ortamda çalıştırmasını sağlamak amacıyla hazırlanmıştır.

## 2. Gerekli Araçlar

Yerel geliştirme ortamı için aşağıdaki araçların kurulması gerekmektedir:

1. **Node.js**: API Gateway için JavaScript/TypeScript çalışma ortamı (v18 veya üzeri)
2. **Python**: Segmentation Service ve AI Orchestrator için (v3.10 veya üzeri)
3. **Rust**: Runner Service için (v1.70 veya üzeri)
4. **Docker**: Konteynerleştirme için
5. **Docker Compose**: Çoklu konteyner uygulamalarını yönetmek için
6. **PostgreSQL**: Veritabanı (opsiyonel, Docker Compose ile de çalıştırılabilir)
7. **Redis**: Önbellek ve mesaj kuyruk sistemi (opsiyonel, Docker Compose ile de çalıştırılabilir)
8. **VS Code**: Önerilen geliştirme ortamı

## 3. Kurulum Adımları

### 3.1. Node.js Kurulumu

1. [Node.js](https://nodejs.org/) web sitesinden LTS sürümünü indirin ve kurun.
2. Kurulumu doğrulamak için komut satırında şu komutu çalıştırın:
   ```
   node --version
   npm --version
   ```

### 3.2. Python Kurulumu

1. [Python](https://www.python.org/downloads/) web sitesinden Python 3.10 veya üzeri sürümü indirin ve kurun.
2. Kurulumu doğrulamak için komut satırında şu komutu çalıştırın:
   ```
   python --version
   pip --version
   ```

### 3.3. Rust Kurulumu

1. [Rust](https://www.rust-lang.org/tools/install) web sitesindeki talimatları izleyerek Rust'ı kurun.
2. Windows için rustup-init.exe dosyasını indirin ve çalıştırın.
3. Kurulumu doğrulamak için komut satırında şu komutu çalıştırın:
   ```
   rustc --version
   cargo --version
   ```

### 3.4. Docker ve Docker Compose Kurulumu

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) web sitesinden işletim sisteminize uygun sürümü indirin ve kurun.
2. Docker Desktop, Docker Compose'u da içerir.
3. Kurulumu doğrulamak için komut satırında şu komutları çalıştırın:
   ```
   docker --version
   docker-compose --version
   ```

### 3.5. VS Code Kurulumu ve Eklentileri

1. [VS Code](https://code.visualstudio.com/) web sitesinden indirin ve kurun.
2. Aşağıdaki eklentileri kurun:
   - ESLint
   - Prettier
   - TypeScript
   - Python
   - Rust Analyzer
   - Docker
   - Remote - Containers

## 4. Proje Kurulumu

### 4.1. Projeyi Klonlama

1. Git kullanarak projeyi klonlayın:
   ```
   git clone https://github.com/krozenking/ALT_LAS.git
   cd ALT_LAS
   ```

### 4.2. Ortam Değişkenlerini Yapılandırma

1. Kök dizindeki `.env.example` dosyasını `.env` olarak kopyalayın:
   ```
   cp .env.example .env
   ```
2. `.env` dosyasını açın ve gerekli değişkenleri yapılandırın:
   - JWT_SECRET: JWT token'ları için gizli anahtar
   - REDIS_PASSWORD: Redis şifresi
   - POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB: PostgreSQL veritabanı bilgileri
   - OPENAI_API_KEY: OpenAI API anahtarı (AI Orchestrator için)

### 4.3. API Gateway Kurulumu

1. API Gateway dizinine gidin:
   ```
   cd api-gateway
   ```
2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```
3. TypeScript kodunu derleyin:
   ```
   npm run build
   ```

### 4.4. Segmentation Service Kurulumu

1. Segmentation Service dizinine gidin:
   ```
   cd segmentation-service
   ```
2. Python sanal ortamı oluşturun ve etkinleştirin:
   ```
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```
3. Bağımlılıkları yükleyin:
   ```
   pip install -r requirements.txt
   ```

### 4.5. Runner Service Kurulumu

1. Runner Service dizinine gidin:
   ```
   cd runner-service
   ```
2. Rust bağımlılıklarını derleyin:
   ```
   cargo build
   ```

### 4.6. Archive Service Kurulumu

1. Archive Service dizinine gidin:
   ```
   cd archive-service
   ```
2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```
3. TypeScript kodunu derleyin:
   ```
   npm run build
   ```

### 4.7. AI Orchestrator Kurulumu

1. AI Orchestrator dizinine gidin:
   ```
   cd ai-orchestrator
   ```
2. Python sanal ortamı oluşturun ve etkinleştirin:
   ```
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```
3. Bağımlılıkları yükleyin:
   ```
   pip install -r requirements.txt
   ```

## 5. Projeyi Çalıştırma

### 5.1. Docker Compose ile Çalıştırma

Tüm servisleri Docker Compose ile çalıştırmak için:

1. Kök dizine gidin:
   ```
   cd ALT_LAS
   ```
2. Docker Compose ile servisleri başlatın:
   ```
   docker-compose up -d
   ```
3. Servislerin durumunu kontrol edin:
   ```
   docker-compose ps
   ```
4. Logları izleyin:
   ```
   docker-compose logs -f
   ```

### 5.2. Servisleri Ayrı Ayrı Çalıştırma

Geliştirme sırasında servisleri ayrı ayrı çalıştırmak isteyebilirsiniz:

#### 5.2.1. API Gateway

```
cd api-gateway
npm run dev
```

#### 5.2.2. Segmentation Service

```
cd segmentation-service
python app.py
```

#### 5.2.3. Runner Service

```
cd runner-service
cargo run
```

#### 5.2.4. Archive Service

```
cd archive-service
npm run dev
```

#### 5.2.5. AI Orchestrator

```
cd ai-orchestrator
python app.py
```

### 5.3. Veritabanı ve Redis'i Docker ile Çalıştırma

Sadece veritabanı ve Redis'i Docker ile çalıştırmak için:

```
docker-compose up -d postgres_db redis nats
```

## 6. API'leri Test Etme

### 6.1. API Gateway Sağlık Kontrolü

```
curl http://localhost:3000/health
```

### 6.2. Swagger Dokümantasyonu

API Gateway'in Swagger dokümantasyonuna erişmek için tarayıcınızda şu URL'yi açın:

```
http://localhost:3000/api-docs
```

## 7. Sorun Giderme

### 7.1. Docker Compose Sorunları

1. **Servisler başlatılamıyor**: Docker Compose loglarını kontrol edin:
   ```
   docker-compose logs -f <servis-adı>
   ```

2. **Port çakışmaları**: Kullanılan portların başka uygulamalar tarafından kullanılmadığından emin olun:
   ```
   # Windows
   netstat -ano | findstr <port>
   # Linux/Mac
   lsof -i :<port>
   ```

### 7.2. Bağımlılık Sorunları

1. **Node.js bağımlılık hataları**: node_modules dizinini silin ve yeniden yükleyin:
   ```
   rm -rf node_modules
   npm install
   ```

2. **Python bağımlılık hataları**: Sanal ortamı yeniden oluşturun:
   ```
   rm -rf venv
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   pip install -r requirements.txt
   ```

### 7.3. Veritabanı Sorunları

1. **PostgreSQL bağlantı hataları**: Veritabanı bağlantı bilgilerini kontrol edin:
   ```
   docker-compose exec postgres_db psql -U postgres -d altlas
   ```

## 8. Geliştirme İş Akışı

1. Değişiklikleri yapın
2. Testleri çalıştırın:
   ```
   # API Gateway
   cd api-gateway
   npm test
   
   # Runner Service
   cd runner-service
   cargo test
   ```
3. Değişiklikleri commit edin ve push edin
4. CI/CD pipeline'ının çalışmasını bekleyin

## 9. Referanslar

- [Node.js Dokümantasyonu](https://nodejs.org/en/docs/)
- [Python Dokümantasyonu](https://docs.python.org/3/)
- [Rust Dokümantasyonu](https://doc.rust-lang.org/book/)
- [Docker Dokümantasyonu](https://docs.docker.com/)
- [Docker Compose Dokümantasyonu](https://docs.docker.com/compose/)
