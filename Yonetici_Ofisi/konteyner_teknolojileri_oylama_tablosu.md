# ALT_LAS Projesi Konteyner Teknolojileri Oylama Tablosu

Bu belge, ALT_LAS projesi için en uygun konteyner teknolojisi yaklaşımının belirlenmesi amacıyla düzenlenen oylama için hazırlanmıştır. Her persona, seçenekleri 1-5 arası puanlayacaktır (1: Düşük uygunluk, 5: Yüksek uygunluk).

## Değerlendirme Kriterleri

- **Geliştirme verimliliği**: Geliştirme süreçlerini ne kadar hızlandırır ve kolaylaştırır?
- **Operasyonel karmaşıklık**: Kurulum, yönetim ve bakım ne kadar karmaşıktır?
- **Ölçeklenebilirlik**: Artan yük ve kullanıcı sayısına ne kadar iyi uyum sağlar?
- **Maliyet etkinliği**: Donanım, lisans ve insan kaynağı açısından ne kadar maliyet etkindir?
- **Güvenlik**: Güvenlik açıklarına karşı ne kadar koruma sağlar?
- **Ekip deneyimi**: Ekibin mevcut bilgi ve deneyimine ne kadar uygundur?
- **Proje uygunluğu**: ALT_LAS projesinin özel gereksinimlerine ne kadar uygundur?
- **Sürdürülebilirlik**: Uzun vadede ne kadar sürdürülebilirdir?

## Oylama Tablosu

### 1. Docker Kullanımı (Docker + Docker Compose)

| Persona | Geliştirme Verimliliği | Operasyonel Karmaşıklık | Ölçeklenebilirlik | Maliyet Etkinliği | Güvenlik | Ekip Deneyimi | Proje Uygunluğu | Sürdürülebilirlik | Ortalama |
|---------|------------------------|-------------------------|-------------------|-------------------|----------|---------------|-----------------|-------------------|----------|
| Proje Yöneticisi | | | | | | | | | |
| UI/UX Tasarımcısı | | | | | | | | | |
| Kıdemli Frontend Geliştirici | | | | | | | | | |
| Kıdemli Backend Geliştirici | | | | | | | | | |
| Yazılım Mimarı | | | | | | | | | |
| QA Mühendisi | | | | | | | | | |
| DevOps Mühendisi | | | | | | | | | |
| Veri Bilimcisi | | | | | | | | | |
| **Genel Ortalama** | | | | | | | | | |

### 2. Kubernetes Kullanımı (Docker + Kubernetes)

| Persona | Geliştirme Verimliliği | Operasyonel Karmaşıklık | Ölçeklenebilirlik | Maliyet Etkinliği | Güvenlik | Ekip Deneyimi | Proje Uygunluğu | Sürdürülebilirlik | Ortalama |
|---------|------------------------|-------------------------|-------------------|-------------------|----------|---------------|-----------------|-------------------|----------|
| Proje Yöneticisi | | | | | | | | | |
| UI/UX Tasarımcısı | | | | | | | | | |
| Kıdemli Frontend Geliştirici | | | | | | | | | |
| Kıdemli Backend Geliştirici | | | | | | | | | |
| Yazılım Mimarı | | | | | | | | | |
| QA Mühendisi | | | | | | | | | |
| DevOps Mühendisi | | | | | | | | | |
| Veri Bilimcisi | | | | | | | | | |
| **Genel Ortalama** | | | | | | | | | |

### 3. Alternatif Konteyner Teknolojileri (Podman, Containerd, LXC/LXD)

| Persona | Geliştirme Verimliliği | Operasyonel Karmaşıklık | Ölçeklenebilirlik | Maliyet Etkinliği | Güvenlik | Ekip Deneyimi | Proje Uygunluğu | Sürdürülebilirlik | Ortalama |
|---------|------------------------|-------------------------|-------------------|-------------------|----------|---------------|-----------------|-------------------|----------|
| Proje Yöneticisi | | | | | | | | | |
| UI/UX Tasarımcısı | | | | | | | | | |
| Kıdemli Frontend Geliştirici | | | | | | | | | |
| Kıdemli Backend Geliştirici | | | | | | | | | |
| Yazılım Mimarı | | | | | | | | | |
| QA Mühendisi | | | | | | | | | |
| DevOps Mühendisi | | | | | | | | | |
| Veri Bilimcisi | | | | | | | | | |
| **Genel Ortalama** | | | | | | | | | |

### 4. Serverless Konteyner Yaklaşımı (AWS Fargate, Azure Container Instances, Google Cloud Run)

| Persona | Geliştirme Verimliliği | Operasyonel Karmaşıklık | Ölçeklenebilirlik | Maliyet Etkinliği | Güvenlik | Ekip Deneyimi | Proje Uygunluğu | Sürdürülebilirlik | Ortalama |
|---------|------------------------|-------------------------|-------------------|-------------------|----------|---------------|-----------------|-------------------|----------|
| Proje Yöneticisi | | | | | | | | | |
| UI/UX Tasarımcısı | | | | | | | | | |
| Kıdemli Frontend Geliştirici | | | | | | | | | |
| Kıdemli Backend Geliştirici | | | | | | | | | |
| Yazılım Mimarı | | | | | | | | | |
| QA Mühendisi | | | | | | | | | |
| DevOps Mühendisi | | | | | | | | | |
| Veri Bilimcisi | | | | | | | | | |
| **Genel Ortalama** | | | | | | | | | |

### 5. Konteyner Kullanmama (VM, PaaS, Doğrudan Sunucu)

| Persona | Geliştirme Verimliliği | Operasyonel Karmaşıklık | Ölçeklenebilirlik | Maliyet Etkinliği | Güvenlik | Ekip Deneyimi | Proje Uygunluğu | Sürdürülebilirlik | Ortalama |
|---------|------------------------|-------------------------|-------------------|-------------------|----------|---------------|-----------------|-------------------|----------|
| Proje Yöneticisi | | | | | | | | | |
| UI/UX Tasarımcısı | | | | | | | | | |
| Kıdemli Frontend Geliştirici | | | | | | | | | |
| Kıdemli Backend Geliştirici | | | | | | | | | |
| Yazılım Mimarı | | | | | | | | | |
| QA Mühendisi | | | | | | | | | |
| DevOps Mühendisi | | | | | | | | | |
| Veri Bilimcisi | | | | | | | | | |
| **Genel Ortalama** | | | | | | | | | |

## Oylama Sonrası Yorumlar

Her persona, oylamadan sonra genel değerlendirmelerini ve önerilerini bu bölümde paylaşacaktır.

### Proje Yöneticisi
*Yorum eklenecek*

### UI/UX Tasarımcısı
*Yorum eklenecek*

### Kıdemli Frontend Geliştirici
*Yorum eklenecek*

### Kıdemli Backend Geliştirici
*Yorum eklenecek*

### Yazılım Mimarı
*Yorum eklenecek*

### QA Mühendisi
*Yorum eklenecek*

### DevOps Mühendisi
*Yorum eklenecek*

### Veri Bilimcisi
*Yorum eklenecek*
