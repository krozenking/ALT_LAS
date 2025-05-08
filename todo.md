# ALT_LAS Pre-Alpha Görevleri Takip Listesi

## Görev 1: Temel Altyapı (Proje Geneli)

- [ ] **Docker Stratejisi:**
    - [x] Her servis türü (Node.js, Python, Rust, Go) için temel Docker imajlarını tanımlayın (Mevcut imajlar incelendi ve uygun bulundu: Node.js -> node:18-alpine, Python -> python:3.10-slim, Rust -> rust:1.75-slim & debian:bullseye-slim, Go -> golang:1.18-alpine & alpine:latest).
    - [x] Optimize edilmiş imaj boyutları için çok aşamalı (multi-stage) build'ler uygulayın.
    - [x] `.dockerignore` dosyaları için bir standart oluşturun ve uygulayın.
    - [x] Yerel geliştirme ve test için `docker-compose.yml` dosyasını geliştirin/güncelleyin (servislerin etkili iletişimi).
- [ ] **CI/CD Pipeline (İlk Kurulum):**
    - [x] Bir CI/CD platformu seçin (örn: GitHub Actions).
    - [x] En az bir çekirdek servis için temel build ve test pipeline'larını kurun (api-gateway için oluşturuldu).
    - [ ] Linting ve statik analiz araçlarını pipeline'a entegre edin.
    - [ ] Otomatik Docker imaj build'lerini ve bir container registry'ye push işlemlerini yapılandırın.
- [ ] **Standartlaştırılmış Loglama:**
    - [ ] Tüm servisler için ortak bir loglama kütüphanesi/formatı seçin (örn: JSON formatlı loglar).
    - [ ] Standart log seviyelerini tanımlayın (DEBUG, INFO, WARN, ERROR).
    - [ ] Merkezi loglama çözümü için hazırlık yapın (Pre-Alpha: Docker içinde tutarlı log çıktısı).
- [ ] **İzleme Yer Tutucuları:**
    - [ ] Her servis için anahtar metrikleri belirleyin.
    - [ ] Tüm servislerde temel sağlık kontrolü endpoint'lerini (`/health`) uygulayın.
    - [ ] Bir izleme sistemi için yer tutucular ayarlayın.
- [ ] **Geliştirme Ortamı Standartları:**
    - [ ] Her dil için kodlama standartlarını ve stil kılavuzlarını tanımlayın.
    - [ ] Tutarlı bir geliştirme deneyimi için IDE'ler ve eklentiler önerin.
    - [ ] Net bir Git dallanma stratejisi (örn: Gitflow) oluşturun ve belgeleyin.

## Görev 2: API Gateway (Çekirdek İşlevsellik)
- [ ] (Detaylar eklenecek)

## Görev 3: Segmentation Service (Çekirdek Mantık Uygulaması)
- [ ] (Detaylar eklenecek)

## Görev 4: Runner Service (Temel Görev Yürütme Motoru)
- [ ] (Detaylar eklenecek)

## Görev 5: Archive Service (Çekirdek Veri Kalıcılığı)
- [ ] (Detaylar eklenecek)

## Görev 6: AI Orchestrator (İlk Entegrasyon & Çekirdek Model Adaptörleri)
- [ ] (Detaylar eklenecek)

## Görev 7: UI - Desktop (Minimum Uygulanabilir İş Akışı Arayüzü)
- [ ] (Detaylar eklenecek)

## Görev 8: Güvenlik Katmanı (Temel Korumalar)
- [ ] (Detaylar eklenecek)

## Görev 9: OS Entegrasyonu (Kritik Özellik Prototiplemesi)
- [ ] (Detaylar eklenecek)

## Görev 10: Uçtan Uca İş Akışı Testi ve İyileştirme
- [ ] (Detaylar eklenecek)

---
*Bu todo.md dosyası, `docs/pre_alpha_architecture_tasks.md` belgesindeki ana görevleri yansıtmaktadır ve ilerleme kaydedildikçe güncellenecektir.*
*Genel proje adımları (klonlama, analiz vb.) tamamlanmıştır ve şimdi Pre-Alpha görevlerinin uygulanmasına odaklanılmaktadır.*
