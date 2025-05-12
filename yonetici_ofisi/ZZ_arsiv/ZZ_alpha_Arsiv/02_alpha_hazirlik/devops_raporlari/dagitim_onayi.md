# Dağıtım Onayı Mekanizması Raporu

**Tarih:** 22 Mayıs 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Alpha Aşaması - Dağıtım Onayı Mekanizması

## 1. Genel Bakış

Bu rapor, ALT_LAS projesinin alpha aşamasına geçiş için oluşturulan Dağıtım Onayı mekanizmasını detaylandırmaktadır. Dağıtım Onayı, yeni sürümlerin dağıtılmadan önce belirli kontrolleri geçmesini ve yetkili kişiler tarafından onaylanmasını sağlayan bir mekanizmadır. Bu, ALT_LAS projesinin alpha aşamasında dağıtım kalitesini artıracak ve dağıtım risklerini daha da azaltacaktır.

## 2. Dağıtım Onayı Stratejisi

ALT_LAS projesi için aşağıdaki Dağıtım Onayı stratejisi belirlenmiştir:

1. **Otomatik Kontroller**: Dağıtım öncesi otomatik kontroller
2. **Manuel Onay**: Yetkili kişiler tarafından manuel onay
3. **Dağıtım Aşamaları**: Aşamalı dağıtım ve her aşamada onay
4. **Dağıtım Bildirimi**: Dağıtım durumu bildirimleri
5. **Dağıtım Kaydı**: Dağıtım işlemlerinin kaydedilmesi

## 3. Oluşturulan Dağıtım Onayı Kaynakları

### 3.1. Dağıtım Onayı Yapılandırması

Dağıtım Onayı için yapılandırma kaynakları oluşturuldu:

- **ConfigMap**: `deployment-approval-config`
  - `approval-strategy.yaml`: Dağıtım Onayı stratejisi
  - `approval-workflow.yaml`: Dağıtım Onayı iş akışı

### 3.2. Dağıtım Onayı İsteği

Dağıtım Onayı İsteği için aşağıdaki kaynaklar oluşturuldu:

- **request-approval.sh**:
  - Dağıtım Onayı İsteği oluşturma
  - Dağıtım öncesi kontrolleri çalıştırma
  - Onay bildirimi gönderme

### 3.3. Dağıtım Onayı Verme

Dağıtım Onayı verme için aşağıdaki kaynaklar oluşturuldu:

- **approve-deployment.sh**:
  - Dağıtım Onayı verme
  - Tüm onayların tamamlanıp tamamlanmadığını kontrol etme
  - Dağıtımı başlatma
  - Dağıtım bildirimi gönderme

### 3.4. Dağıtım Onayı Reddetme

Dağıtım Onayı reddetme için aşağıdaki kaynaklar oluşturuldu:

- **reject-deployment.sh**:
  - Dağıtım Onayı reddetme
  - Dağıtım reddi bildirimi gönderme

### 3.5. Dağıtım Onayı Durumu Kontrolü

Dağıtım Onayı durumu kontrolü için aşağıdaki kaynaklar oluşturuldu:

- **check-approval-status.sh**:
  - Dağıtım Onayı durumunu kontrol etme
  - Onayları görüntüleme
  - Kontrolleri görüntüleme
  - Red sebebini görüntüleme

## 4. Dağıtım Onayı Aşamaları

### 4.1. Geliştirme Ortamı

Geliştirme ortamı için Dağıtım Onayı aşaması aşağıdaki gibidir:

- **Otomatik Onay**: Evet
- **Onaylayanlar**:
  - Geliştirici (1 kişi)
- **Kontroller**:
  - Birim Testleri (zorunlu)
  - Kod Kalitesi (zorunlu)
  - Güvenlik Taraması (isteğe bağlı)

### 4.2. Test Ortamı

Test ortamı için Dağıtım Onayı aşaması aşağıdaki gibidir:

- **Otomatik Onay**: Hayır
- **Onaylayanlar**:
  - Geliştirici (1 kişi)
  - QA (1 kişi)
- **Kontroller**:
  - Birim Testleri (zorunlu)
  - Entegrasyon Testleri (zorunlu)
  - Kod Kalitesi (zorunlu)
  - Güvenlik Taraması (zorunlu)

### 4.3. Staging Ortamı

Staging ortamı için Dağıtım Onayı aşaması aşağıdaki gibidir:

- **Otomatik Onay**: Hayır
- **Onaylayanlar**:
  - Geliştirici (1 kişi)
  - QA (1 kişi)
  - DevOps (1 kişi)
- **Kontroller**:
  - Birim Testleri (zorunlu)
  - Entegrasyon Testleri (zorunlu)
  - Sistem Testleri (zorunlu)
  - Kod Kalitesi (zorunlu)
  - Güvenlik Taraması (zorunlu)
  - Performans Testleri (zorunlu)

### 4.4. Production Ortamı

Production ortamı için Dağıtım Onayı aşaması aşağıdaki gibidir:

- **Otomatik Onay**: Hayır
- **Onaylayanlar**:
  - Geliştirici (1 kişi)
  - QA (1 kişi)
  - DevOps (1 kişi)
  - Yönetici (1 kişi)
- **Kontroller**:
  - Birim Testleri (zorunlu)
  - Entegrasyon Testleri (zorunlu)
  - Sistem Testleri (zorunlu)
  - Kod Kalitesi (zorunlu)
  - Güvenlik Taraması (zorunlu)
  - Performans Testleri (zorunlu)
  - Uyumluluk Kontrolü (zorunlu)

## 5. Dağıtım Onayı Kontrolleri

### 5.1. Birim Testleri

Birim testleri için aşağıdaki kontrol yapılır:

- **Komut**: `npm test`
- **Başarı Kriteri**: Çıkış kodu 0

### 5.2. Entegrasyon Testleri

Entegrasyon testleri için aşağıdaki kontrol yapılır:

- **Komut**: `npm run test:integration`
- **Başarı Kriteri**: Çıkış kodu 0

### 5.3. Sistem Testleri

Sistem testleri için aşağıdaki kontrol yapılır:

- **Komut**: `npm run test:system`
- **Başarı Kriteri**: Çıkış kodu 0

### 5.4. Kod Kalitesi

Kod kalitesi için aşağıdaki kontrol yapılır:

- **Komut**: `npm run lint && npm run sonar`
- **Başarı Kriteri**: Çıkış kodu 0

### 5.5. Güvenlik Taraması

Güvenlik taraması için aşağıdaki kontrol yapılır:

- **Komut**: `npm run security-scan`
- **Başarı Kriteri**: Çıkış kodu 0

### 5.6. Performans Testleri

Performans testleri için aşağıdaki kontrol yapılır:

- **Komut**: `npm run test:performance`
- **Başarı Kriteri**: Çıkış kodu 0

### 5.7. Uyumluluk Kontrolü

Uyumluluk kontrolü için aşağıdaki kontrol yapılır:

- **Komut**: `npm run compliance-check`
- **Başarı Kriteri**: Çıkış kodu 0

## 6. Dağıtım Onayı Rolleri

### 6.1. Geliştirici

Geliştirici rolü için aşağıdaki kullanıcılar tanımlanmıştır:

- ahmet.celik@altlas.com
- mehmet.yilmaz@altlas.com

### 6.2. QA

QA rolü için aşağıdaki kullanıcılar tanımlanmıştır:

- ayse.demir@altlas.com
- fatma.kaya@altlas.com

### 6.3. DevOps

DevOps rolü için aşağıdaki kullanıcılar tanımlanmıştır:

- can.tekin@altlas.com
- ali.veli@altlas.com

### 6.4. Yönetici

Yönetici rolü için aşağıdaki kullanıcılar tanımlanmıştır:

- zeynep.ozturk@altlas.com
- mustafa.sahin@altlas.com

## 7. Dağıtım Onayı İş Akışı

### 7.1. Dağıtım Öncesi Kontroller

Dağıtım öncesi aşağıdaki kontroller yapılır:

1. **Kod Kalitesi Kontrolü**: Kod kalitesi kontrolü yapılır
2. **Güvenlik Taraması**: Güvenlik taraması yapılır
3. **Test Kontrolü**: Birim ve entegrasyon testleri çalıştırılır
4. **Docker İmaj Kontrolü**: Docker imajı güvenlik taraması yapılır
5. **Kubernetes Manifest Kontrolü**: Kubernetes manifest dosyaları güvenlik taraması yapılır

### 7.2. Dağıtım Aşamaları

Dağıtım aşamaları aşağıdaki gibidir:

1. **Geliştirme Ortamı**: Geliştirme ortamına dağıtım yapılır
2. **Test Ortamı**: Test ortamına dağıtım yapılır
3. **Staging Ortamı**: Staging ortamına dağıtım yapılır
4. **Production Ortamı**: Production ortamına dağıtım yapılır

### 7.3. Dağıtım Sonrası Kontroller

Dağıtım sonrası aşağıdaki kontroller yapılır:

1. **Servis Erişilebilirlik Kontrolü**: Servisin erişilebilir olduğu kontrol edilir
2. **Hata Oranı Kontrolü**: Hata oranının normal olduğu kontrol edilir
3. **Gecikme Süresi Kontrolü**: Gecikme süresinin normal olduğu kontrol edilir

## 8. Dağıtım Onayı Süreci

### 8.1. Dağıtım Onayı İsteği Oluşturma

Dağıtım Onayı İsteği oluşturma süreci aşağıdaki gibidir:

1. **Dağıtım Onayı İsteği Oluşturma**: `request-approval.sh` betiği çalıştırılır
2. **Dağıtım Öncesi Kontroller**: Dağıtım öncesi kontroller çalıştırılır
3. **Onay Bildirimi**: Onay bildirimi gönderilir

### 8.2. Dağıtım Onayı Verme

Dağıtım Onayı verme süreci aşağıdaki gibidir:

1. **Dağıtım Onayı Verme**: `approve-deployment.sh` betiği çalıştırılır
2. **Tüm Onayların Kontrolü**: Tüm onayların tamamlanıp tamamlanmadığı kontrol edilir
3. **Dağıtımı Başlatma**: Tüm onaylar tamamlandıysa dağıtım başlatılır
4. **Dağıtım Bildirimi**: Dağıtım bildirimi gönderilir

### 8.3. Dağıtım Onayı Reddetme

Dağıtım Onayı reddetme süreci aşağıdaki gibidir:

1. **Dağıtım Onayı Reddetme**: `reject-deployment.sh` betiği çalıştırılır
2. **Dağıtım Reddi Bildirimi**: Dağıtım reddi bildirimi gönderilir

### 8.4. Dağıtım Onayı Durumu Kontrolü

Dağıtım Onayı durumu kontrolü süreci aşağıdaki gibidir:

1. **Dağıtım Onayı Durumu Kontrolü**: `check-approval-status.sh` betiği çalıştırılır
2. **Onayları Görüntüleme**: Onaylar görüntülenir
3. **Kontrolleri Görüntüleme**: Kontroller görüntülenir
4. **Red Sebebini Görüntüleme**: Red sebebi görüntülenir

## 9. Dağıtım Onayı Mekanizmasının Avantajları

1. **Kalite Artışı**: Dağıtım öncesi kontroller ile dağıtım kalitesi artar
2. **Risk Azaltma**: Dağıtım öncesi onay ile dağıtım riskleri azalır
3. **İzlenebilirlik**: Dağıtım işlemleri kaydedilir ve izlenebilir
4. **Sorumluluk Paylaşımı**: Dağıtım sorumluluğu paylaşılır
5. **Otomatik Kontroller**: Dağıtım öncesi otomatik kontroller yapılır

## 10. Sonraki Adımlar

### 10.1. CI/CD Pipeline Entegrasyonu

Dağıtım Onayı mekanizmasının CI/CD pipeline'ına entegre edilmesi için aşağıdaki adımlar atılmalıdır:

- Dağıtım Onayı betiklerinin CI/CD pipeline'ına eklenmesi
- Dağıtım Onayı kontrol ve onay adımlarının CI/CD pipeline'ına entegre edilmesi
- Dağıtım Onayı bildirimlerinin CI/CD pipeline'ına entegre edilmesi

### 10.2. Web Arayüzü Oluşturma

Dağıtım Onayı mekanizması için web arayüzü oluşturulması için aşağıdaki adımlar atılmalıdır:

- Dağıtım Onayı İsteklerini görüntüleme
- Dağıtım Onayı verme ve reddetme
- Dağıtım Onayı durumunu görüntüleme

### 10.3. Bildirim Entegrasyonu

Dağıtım Onayı bildirimlerinin entegre edilmesi için aşağıdaki adımlar atılmalıdır:

- E-posta bildirimlerinin yapılandırılması
- Slack bildirimlerinin yapılandırılması
- Microsoft Teams bildirimlerinin yapılandırılması

## 11. Sonuç

ALT_LAS projesinin alpha aşamasına geçiş için gerekli Dağıtım Onayı mekanizması oluşturuldu. Bu mekanizma, yeni sürümlerin dağıtılmadan önce belirli kontrolleri geçmesini ve yetkili kişiler tarafından onaylanmasını sağlayacaktır. Otomatik kontroller, manuel onay, dağıtım aşamaları, dağıtım bildirimleri ve dağıtım kaydı ile ALT_LAS projesinin alpha aşamasında dağıtım kalitesi artırılacak ve dağıtım riskleri daha da azaltılacaktır.
