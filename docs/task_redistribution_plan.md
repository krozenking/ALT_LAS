# ALT_LAS İşçi 1 ve İşçi 2 Görev Yeniden Dağıtım Planı

Bu belge, API Gateway (İşçi 1) ve Segmentation Service (İşçi 2) arasındaki görev dağılımını yeniden düzenlemek için bir plan sunmaktadır. Mevcut durum analizi, yeniden dağıtılacak görevler ve yeni görev atamaları detaylandırılmıştır.

## 1. Mevcut Durum Analizi

### 1.1. İşçi 1 (API Gateway Geliştirme Uzmanı)

**Mevcut İlerleme**: %75

**Kalan Görevler**:
- OS Integration Service entegrasyonu tamamlama (%5)
- AI Orchestrator entegrasyonu tamamlama (%5)
- Docker yapılandırmasını güncelleme (%5)
- CI/CD pipeline entegrasyonu (%5)
- Performans optimizasyonu (%5)

**İş Yükü Durumu**: Orta seviyede iş yükü, entegrasyon görevlerine odaklanmış durumda.

### 1.2. İşçi 2 (Segmentation Service Geliştirme Uzmanı)

**Mevcut İlerleme**: %95

**Kalan Görevler**:
- Diğer servislerle entegrasyon testleri (%5)

**İş Yükü Durumu**: Düşük seviyede iş yükü, görevlerinin çoğunu tamamlamış durumda.

### 1.3. Dengesizlik Analizi

İşçi 2, görevlerinin %95'ini tamamlamış ve sadece entegrasyon testleri kalmış durumdadır. İşçi 1 ise görevlerinin %75'ini tamamlamış ve hala önemli entegrasyon ve yapılandırma görevleri bulunmaktadır. Bu durum, iş yükünün dengesiz dağılımına neden olmaktadır.

## 2. Yeniden Dağıtılacak Görevler

İşçi 1'den İşçi 2'ye aktarılacak görevler:

### 2.1. OS Integration Service Entegrasyonu (%5)

**Gerekçe**: 
- İşçi 2, integration_module.py dosyasında zaten OS Integration Service için bir istemci sınıfı (OSIntegrationService) geliştirmiştir.
- İşçi 2'nin servis entegrasyonu konusunda deneyimi vardır.
- Bu görev, İşçi 2'nin kalan entegrasyon testleri göreviyle doğrudan ilişkilidir.

**Aktarılacak Alt Görevler**:
- OS Integration Service API endpoint'lerinin tamamlanması
- Hata işleme ve yeniden deneme mekanizmalarının eklenmesi
- Entegrasyon testlerinin yazılması
- Dokümantasyonun güncellenmesi

### 2.2. AI Orchestrator Entegrasyonu (%5)

**Gerekçe**:
- İşçi 2, integration_module.py dosyasında zaten AI Orchestrator için bir istemci sınıfı (AIOrchestrator) geliştirmiştir.
- İşçi 2'nin AI ve NLP konularında uzmanlığı vardır.
- Bu görev, İşçi 2'nin kalan entegrasyon testleri göreviyle doğrudan ilişkilidir.

**Aktarılacak Alt Görevler**:
- AI Orchestrator API endpoint'lerinin tamamlanması
- Model seçimi ve parametre yapılandırması
- Entegrasyon testlerinin yazılması
- Dokümantasyonun güncellenmesi

### 2.3. CI/CD Pipeline Entegrasyonu (%5)

**Gerekçe**:
- İşçi 2, kendi servisinde CI/CD entegrasyonunu başarıyla tamamlamıştır.
- İşçi 2'nin worker2_task_assignments.md dosyasında CI/CD konusunda gelişim alanı olarak belirtilmiştir.
- Bu görev, İşçi 2'nin deneyim kazanmasını sağlayacaktır.

**Aktarılacak Alt Görevler**:
- GitHub Actions workflow dosyalarının oluşturulması
- Test, lint ve build adımlarının otomatikleştirilmesi
- Docker image build ve push işlemlerinin otomatikleştirilmesi
- Deployment scriptlerinin hazırlanması

## 3. İşçi 1'de Kalacak Görevler

### 3.1. Docker Yapılandırmasını Güncelleme (%5)

**Gerekçe**:
- Bu görev, API Gateway'in temel yapısıyla doğrudan ilişkilidir.
- İşçi 1, API Gateway'in mimarisine daha hakimdir.
- Docker yapılandırması, API Gateway'in diğer servislerle iletişimini etkileyecektir.

### 3.2. Performans Optimizasyonu (%5)

**Gerekçe**:
- API Gateway, tüm sistemin giriş noktası olduğundan performans kritik öneme sahiptir.
- İşçi 1, API Gateway'in performans darboğazlarını daha iyi anlayabilir.
- Bu görev, API Gateway'in iç yapısına dair derin bilgi gerektirir.

## 4. Yeni Görev Dağılımı

### 4.1. İşçi 1 (API Gateway Geliştirme Uzmanı)

**Yeni Görevler**:
1. Docker yapılandırmasını güncelleme (%5)
2. Performans optimizasyonu (%5)
3. Entegrasyon testleri için API Gateway tarafındaki hazırlıklar (%5)
4. API Gateway dokümantasyonunu güncelleme (%5)

**Toplam Kalan İş**: %20

### 4.2. İşçi 2 (Segmentation Service Geliştirme Uzmanı)

**Yeni Görevler**:
1. Diğer servislerle entegrasyon testleri (%5) - Mevcut görev
2. OS Integration Service entegrasyonu tamamlama (%5) - İşçi 1'den aktarılan
3. AI Orchestrator entegrasyonu tamamlama (%5) - İşçi 1'den aktarılan
4. CI/CD pipeline entegrasyonu (%5) - İşçi 1'den aktarılan
5. Entegrasyon test planının uygulanması (%5) - Yeni görev

**Toplam Kalan İş**: %25

## 5. Entegrasyon Testleri Görev Dağılımı

Entegrasyon test planı doğrultusunda, İşçi 1 ve İşçi 2 arasındaki görev dağılımı:

### 5.1. İşçi 1 (API Gateway) Görevleri

- API Gateway'deki mock implementasyonları gerçek Segmentation Service çağrılarıyla değiştirme
- API Gateway - Segmentation Service entegrasyon testlerini yazma
- API Gateway tarafındaki hata işleme mekanizmalarını geliştirme
- API Gateway dokümantasyonunu güncelleme

### 5.2. İşçi 2 (Segmentation Service) Görevleri

- Segmentation Service'teki entegrasyon modülünü tamamlama
- Segmentation Service - Runner Service entegrasyon testlerini yazma
- Segmentation Service - AI Orchestrator entegrasyon testlerini yazma
- Segmentation Service - OS Integration Service entegrasyon testlerini yazma
- Segmentation Service dokümantasyonunu güncelleme
- Mock servislerin hazırlanması
- Test ortamı için Docker Compose yapılandırması

## 6. Uygulama Planı

### 6.1. Hazırlık Aşaması (1-2 gün)

1. İşçi 1 ve İşçi 2 ile görev yeniden dağıtımı hakkında toplantı
2. Entegrasyon noktalarının ve API'lerin gözden geçirilmesi
3. Test ortamının kurulması için gerekli kaynakların belirlenmesi

### 6.2. Geliştirme Aşaması (1-2 hafta)

1. İşçi 2'nin OS Integration Service ve AI Orchestrator entegrasyonlarını tamamlaması
2. İşçi 1'in Docker yapılandırmasını güncellemesi
3. İşçi 2'nin CI/CD pipeline entegrasyonunu gerçekleştirmesi
4. İşçi 1'in performans optimizasyonu yapması

### 6.3. Test Aşaması (1 hafta)

1. Entegrasyon test planının uygulanması
2. Hataların tespit edilmesi ve düzeltilmesi
3. Performans testlerinin yapılması

### 6.4. Dokümantasyon ve Tamamlama (2-3 gün)

1. API dokümantasyonunun güncellenmesi
2. Entegrasyon test sonuçlarının raporlanması
3. Proje dokümantasyonunun güncellenmesi

## 7. Beklenen Faydalar

1. **İş Yükü Dengesi**: İşçi 1 ve İşçi 2 arasındaki iş yükü daha dengeli hale gelecektir.
2. **Uzmanlık Kullanımı**: İşçi 2'nin entegrasyon ve CI/CD konularındaki deneyimi daha iyi kullanılacaktır.
3. **Entegrasyon Kalitesi**: Servisler arasındaki entegrasyon daha kapsamlı test edilecektir.
4. **Bilgi Paylaşımı**: İşçi 1 ve İşçi 2 arasında bilgi paylaşımı artacaktır.
5. **Proje İlerlemesi**: Beta sürümüne daha hızlı ulaşılacaktır.

## 8. Riskler ve Azaltma Stratejileri

1. **Bilgi Transferi Riski**: İşçi 1'den İşçi 2'ye aktarılan görevler için bilgi transferi gerekebilir.
   - **Azaltma**: Detaylı dokümantasyon ve bilgi paylaşımı toplantıları düzenlenecektir.

2. **Entegrasyon Sorunları**: Farklı işçiler tarafından geliştirilen entegrasyonlar arasında uyumsuzluklar olabilir.
   - **Azaltma**: Ortak API standartları ve entegrasyon testleri kullanılacaktır.

3. **Zaman Aşımı**: Yeniden dağıtılan görevler beklenenden uzun sürebilir.
   - **Azaltma**: Haftalık ilerleme toplantıları ve risk değerlendirmeleri yapılacaktır.

Bu görev yeniden dağıtım planı, İşçi 1 ve İşçi 2 arasındaki iş yükünü dengelemek, entegrasyon testlerini gerçekleştirmek ve projenin beta sürümüne daha hızlı ulaşmasını sağlamak amacıyla hazırlanmıştır.
