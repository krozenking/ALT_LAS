# Entegrasyon Test Senaryoları - Servisler Arası

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Entegrasyon Test Senaryoları - Servisler Arası

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için servisler arası entegrasyon test senaryolarını içermektedir. Bu test senaryoları, ALT_LAS sistemini oluşturan farklı mikroservislerin birbirleriyle doğru şekilde entegre olup olmadığını değerlendirmek için kullanılacaktır.

## 2. API Gateway ve Servisler Entegrasyon Test Senaryoları

### 2.1. API Gateway - Segmentation Service Entegrasyon Testi

| Test ID | IT-SS-001 |
|---------|-----------|
| Test Adı | API Gateway - Segmentation Service Entegrasyon Testi |
| Açıklama | API Gateway üzerinden Segmentation Service'e yapılan isteklerin doğru şekilde yönlendirildiğini ve işlendiğini test etme |
| Ön Koşullar | API Gateway ve Segmentation Service çalışır durumda olmalı |
| Test Adımları | 1. API Gateway üzerinden Segmentation Service endpoint'lerine istek gönder<br>2. Segmentation Service'in istekleri aldığını ve işlediğini doğrula<br>3. Farklı HTTP metodlarıyla (GET, POST, PUT, DELETE) istekler gönder<br>4. Hata durumlarını test et (geçersiz istek, servis kullanılamaz, vb.)<br>5. Yetkilendirme kontrollerini test et |
| Beklenen Sonuç | - API Gateway istekleri doğru şekilde Segmentation Service'e yönlendirmeli<br>- Segmentation Service istekleri doğru şekilde işlemeli<br>- Tüm HTTP metodları doğru çalışmalı<br>- Hata durumları uygun şekilde ele alınmalı<br>- Yetkilendirme kontrolleri doğru uygulanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. API Gateway - Runner Service Entegrasyon Testi

| Test ID | IT-SS-002 |
|---------|-----------|
| Test Adı | API Gateway - Runner Service Entegrasyon Testi |
| Açıklama | API Gateway üzerinden Runner Service'e yapılan isteklerin doğru şekilde yönlendirildiğini ve işlendiğini test etme |
| Ön Koşullar | API Gateway ve Runner Service çalışır durumda olmalı |
| Test Adımları | 1. API Gateway üzerinden Runner Service endpoint'lerine istek gönder<br>2. Runner Service'in istekleri aldığını ve işlediğini doğrula<br>3. Farklı HTTP metodlarıyla (GET, POST, PUT, DELETE) istekler gönder<br>4. Hata durumlarını test et (geçersiz istek, servis kullanılamaz, vb.)<br>5. Yetkilendirme kontrollerini test et |
| Beklenen Sonuç | - API Gateway istekleri doğru şekilde Runner Service'e yönlendirmeli<br>- Runner Service istekleri doğru şekilde işlemeli<br>- Tüm HTTP metodları doğru çalışmalı<br>- Hata durumları uygun şekilde ele alınmalı<br>- Yetkilendirme kontrolleri doğru uygulanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.3. API Gateway - Archive Service Entegrasyon Testi

| Test ID | IT-SS-003 |
|---------|-----------|
| Test Adı | API Gateway - Archive Service Entegrasyon Testi |
| Açıklama | API Gateway üzerinden Archive Service'e yapılan isteklerin doğru şekilde yönlendirildiğini ve işlendiğini test etme |
| Ön Koşullar | API Gateway ve Archive Service çalışır durumda olmalı |
| Test Adımları | 1. API Gateway üzerinden Archive Service endpoint'lerine istek gönder<br>2. Archive Service'in istekleri aldığını ve işlediğini doğrula<br>3. Farklı HTTP metodlarıyla (GET, POST, PUT, DELETE) istekler gönder<br>4. Hata durumlarını test et (geçersiz istek, servis kullanılamaz, vb.)<br>5. Yetkilendirme kontrollerini test et |
| Beklenen Sonuç | - API Gateway istekleri doğru şekilde Archive Service'e yönlendirmeli<br>- Archive Service istekleri doğru şekilde işlemeli<br>- Tüm HTTP metodları doğru çalışmalı<br>- Hata durumları uygun şekilde ele alınmalı<br>- Yetkilendirme kontrolleri doğru uygulanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.4. API Gateway - AI Orchestrator Entegrasyon Testi

| Test ID | IT-SS-004 |
|---------|-----------|
| Test Adı | API Gateway - AI Orchestrator Entegrasyon Testi |
| Açıklama | API Gateway üzerinden AI Orchestrator'a yapılan isteklerin doğru şekilde yönlendirildiğini ve işlendiğini test etme |
| Ön Koşullar | API Gateway ve AI Orchestrator çalışır durumda olmalı |
| Test Adımları | 1. API Gateway üzerinden AI Orchestrator endpoint'lerine istek gönder<br>2. AI Orchestrator'ın istekleri aldığını ve işlediğini doğrula<br>3. Farklı HTTP metodlarıyla (GET, POST, PUT, DELETE) istekler gönder<br>4. Hata durumlarını test et (geçersiz istek, servis kullanılamaz, vb.)<br>5. Yetkilendirme kontrollerini test et |
| Beklenen Sonuç | - API Gateway istekleri doğru şekilde AI Orchestrator'a yönlendirmeli<br>- AI Orchestrator istekleri doğru şekilde işlemeli<br>- Tüm HTTP metodları doğru çalışmalı<br>- Hata durumları uygun şekilde ele alınmalı<br>- Yetkilendirme kontrolleri doğru uygulanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.5. API Gateway Yük Dengeleme Testi

| Test ID | IT-SS-005 |
|---------|-----------|
| Test Adı | API Gateway Yük Dengeleme Testi |
| Açıklama | API Gateway'in yük dengeleme özelliğinin doğru çalıştığını test etme |
| Ön Koşullar | API Gateway ve hedef servislerin birden fazla instance'ı çalışır durumda olmalı |
| Test Adımları | 1. Hedef servislerin (Segmentation Service, Runner Service, vb.) birden fazla instance'ını başlat<br>2. API Gateway üzerinden hedef servislere çok sayıda istek gönder<br>3. İsteklerin farklı servis instance'larına dağıtıldığını doğrula<br>4. Bir servis instance'ını devre dışı bırak ve isteklerin diğer instance'lara yönlendirildiğini doğrula<br>5. Yük dengeleme algoritmasının (round-robin, least connections, vb.) doğru çalıştığını kontrol et |
| Beklenen Sonuç | - İstekler farklı servis instance'larına dağıtılmalı<br>- Bir instance devre dışı kaldığında istekler diğer instance'lara yönlendirilmeli<br>- Yük dengeleme algoritması doğru çalışmalı<br>- Servis kesintisi olmamalı<br>- Yük dengeleme performansı iyi olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. Segmentation Service Entegrasyon Test Senaryoları

### 3.1. Segmentation Service - Runner Service Entegrasyon Testi

| Test ID | IT-SS-006 |
|---------|-----------|
| Test Adı | Segmentation Service - Runner Service Entegrasyon Testi |
| Açıklama | Segmentation Service'in Runner Service ile entegrasyonunu test etme |
| Ön Koşullar | Segmentation Service ve Runner Service çalışır durumda olmalı |
| Test Adımları | 1. Segmentation Service üzerinden bir segmentasyon işi başlat<br>2. Segmentation Service'in işi Runner Service'e ilettiğini doğrula<br>3. Runner Service'in işi aldığını ve kuyruğa eklediğini doğrula<br>4. İşin tamamlanmasını bekle<br>5. Segmentation Service'in işin sonucunu doğru şekilde aldığını doğrula |
| Beklenen Sonuç | - Segmentation Service işi doğru şekilde Runner Service'e iletmeli<br>- Runner Service işi doğru şekilde almalı ve kuyruğa eklemeli<br>- İş tamamlandığında sonuç doğru şekilde Segmentation Service'e iletilmeli<br>- İş durumu doğru şekilde güncellenmelidir<br>- Hata durumları uygun şekilde ele alınmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. Segmentation Service - AI Orchestrator Entegrasyon Testi

| Test ID | IT-SS-007 |
|---------|-----------|
| Test Adı | Segmentation Service - AI Orchestrator Entegrasyon Testi |
| Açıklama | Segmentation Service'in AI Orchestrator ile entegrasyonunu test etme |
| Ön Koşullar | Segmentation Service ve AI Orchestrator çalışır durumda olmalı |
| Test Adımları | 1. Segmentation Service üzerinden bir segmentasyon işi başlat<br>2. Segmentation Service'in uygun AI modelini seçmek için AI Orchestrator'a istek gönderdiğini doğrula<br>3. AI Orchestrator'ın model bilgilerini döndürdüğünü doğrula<br>4. Segmentation Service'in dönen model bilgilerini kullanarak segmentasyon işlemini gerçekleştirdiğini doğrula<br>5. Hata durumlarını test et (model bulunamadı, model yüklenemedi, vb.) |
| Beklenen Sonuç | - Segmentation Service uygun AI modelini seçmek için AI Orchestrator'a istek göndermeli<br>- AI Orchestrator model bilgilerini doğru şekilde döndürmeli<br>- Segmentation Service dönen model bilgilerini kullanarak segmentasyon işlemini gerçekleştirmeli<br>- Hata durumları uygun şekilde ele alınmalı<br>- Model seçimi ve kullanımı performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. Segmentation Service - Archive Service Entegrasyon Testi

| Test ID | IT-SS-008 |
|---------|-----------|
| Test Adı | Segmentation Service - Archive Service Entegrasyon Testi |
| Açıklama | Segmentation Service'in Archive Service ile entegrasyonunu test etme |
| Ön Koşullar | Segmentation Service ve Archive Service çalışır durumda olmalı |
| Test Adımları | 1. Segmentation Service üzerinden bir segmentasyon işi başlat ve tamamla<br>2. Segmentation Service'in segmentasyon sonuçlarını Archive Service'e gönderdiğini doğrula<br>3. Archive Service'in sonuçları aldığını ve depoladığını doğrula<br>4. Archive Service üzerinden sonuçları sorgula ve doğru şekilde depolandığını doğrula<br>5. Hata durumlarını test et (arşivleme hatası, dosya bulunamadı, vb.) |
| Beklenen Sonuç | - Segmentation Service segmentasyon sonuçlarını Archive Service'e göndermeli<br>- Archive Service sonuçları doğru şekilde almalı ve depolamalı<br>- Sonuçlar Archive Service üzerinden sorgulanabilmeli<br>- Hata durumları uygun şekilde ele alınmalı<br>- Büyük dosyaların arşivlenmesi performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 4. Runner Service Entegrasyon Test Senaryoları

### 4.1. Runner Service - Segmentation Service Entegrasyon Testi

| Test ID | IT-SS-009 |
|---------|-----------|
| Test Adı | Runner Service - Segmentation Service Entegrasyon Testi |
| Açıklama | Runner Service'in Segmentation Service ile entegrasyonunu test etme |
| Ön Koşullar | Runner Service ve Segmentation Service çalışır durumda olmalı |
| Test Adımları | 1. Runner Service'e bir segmentasyon işi ekle<br>2. Runner Service'in işi işlediğini ve Segmentation Service'i çağırdığını doğrula<br>3. İşin tamamlanmasını bekle<br>4. Runner Service'in işin durumunu doğru şekilde güncellediğini doğrula<br>5. Hata durumlarını test et (servis kullanılamaz, işlem hatası, vb.) |
| Beklenen Sonuç | - Runner Service işi doğru şekilde işlemeli ve Segmentation Service'i çağırmalı<br>- İş tamamlandığında durum doğru şekilde güncellenmeli<br>- İş sonuçları doğru şekilde kaydedilmeli<br>- Hata durumları uygun şekilde ele alınmalı<br>- İş önceliklendirme doğru çalışmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.2. Runner Service - AI Orchestrator Entegrasyon Testi

| Test ID | IT-SS-010 |
|---------|-----------|
| Test Adı | Runner Service - AI Orchestrator Entegrasyon Testi |
| Açıklama | Runner Service'in AI Orchestrator ile entegrasyonunu test etme |
| Ön Koşullar | Runner Service ve AI Orchestrator çalışır durumda olmalı |
| Test Adımları | 1. Runner Service'e bir AI model eğitim işi ekle<br>2. Runner Service'in işi işlediğini ve AI Orchestrator'ı çağırdığını doğrula<br>3. AI Orchestrator'ın model eğitimini başlattığını doğrula<br>4. İşin tamamlanmasını bekle<br>5. Runner Service'in işin durumunu doğru şekilde güncellediğini doğrula |
| Beklenen Sonuç | - Runner Service işi doğru şekilde işlemeli ve AI Orchestrator'ı çağırmalı<br>- AI Orchestrator model eğitimini başlatmalı<br>- İş tamamlandığında durum doğru şekilde güncellenmeli<br>- İş sonuçları doğru şekilde kaydedilmeli<br>- Hata durumları uygun şekilde ele alınmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.3. Runner Service İş Önceliklendirme Testi

| Test ID | IT-SS-011 |
|---------|-----------|
| Test Adı | Runner Service İş Önceliklendirme Testi |
| Açıklama | Runner Service'in iş önceliklendirme özelliğinin doğru çalıştığını test etme |
| Ön Koşullar | Runner Service çalışır durumda olmalı |
| Test Adımları | 1. Farklı öncelik seviyelerine sahip işler oluştur<br>2. İşlerin öncelik sırasına göre işlendiğini doğrula<br>3. Yüksek öncelikli bir iş ekleyerek mevcut iş sırasının değiştiğini doğrula<br>4. İş önceliklerini dinamik olarak değiştir ve sıranın güncellendiğini doğrula<br>5. Kaynak kısıtlamaları altında önceliklendirmenin davranışını test et |
| Beklenen Sonuç | - İşler öncelik sırasına göre işlenmeli<br>- Yüksek öncelikli işler düşük öncelikli işlerden önce işlenmeli<br>- İş öncelikleri dinamik olarak değiştirilebilmeli<br>- Önceliklendirme algoritması kaynak kısıtlamaları altında doğru çalışmalı<br>- Öncelik değişiklikleri anında uygulanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 5. Archive Service Entegrasyon Test Senaryoları

### 5.1. Archive Service - Segmentation Service Entegrasyon Testi

| Test ID | IT-SS-012 |
|---------|-----------|
| Test Adı | Archive Service - Segmentation Service Entegrasyon Testi |
| Açıklama | Archive Service'in Segmentation Service ile entegrasyonunu test etme |
| Ön Koşullar | Archive Service ve Segmentation Service çalışır durumda olmalı |
| Test Adımları | 1. Archive Service'den bir görüntü dosyasını al<br>2. Görüntü dosyasını Segmentation Service'e gönder<br>3. Segmentation Service'in görüntüyü işlediğini doğrula<br>4. Segmentasyon sonuçlarının Archive Service'e geri gönderildiğini doğrula<br>5. Archive Service'in sonuçları doğru şekilde depoladığını doğrula |
| Beklenen Sonuç | - Archive Service görüntü dosyasını doğru şekilde sağlamalı<br>- Segmentation Service görüntüyü işleyebilmeli<br>- Segmentasyon sonuçları Archive Service'e geri gönderilmeli<br>- Archive Service sonuçları doğru şekilde depolamalı<br>- Büyük dosyaların transferi performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.2. Archive Service Dosya Versiyonlama Testi

| Test ID | IT-SS-013 |
|---------|-----------|
| Test Adı | Archive Service Dosya Versiyonlama Testi |
| Açıklama | Archive Service'in dosya versiyonlama özelliğinin doğru çalıştığını test etme |
| Ön Koşullar | Archive Service çalışır durumda olmalı |
| Test Adımları | 1. Archive Service'e bir dosya yükle<br>2. Aynı dosyanın güncellenmiş bir versiyonunu yükle<br>3. Dosya versiyonlarını listele ve her iki versiyonun da mevcut olduğunu doğrula<br>4. Her iki versiyonu da indir ve içeriklerinin doğru olduğunu doğrula<br>5. Bir versiyonu sil ve diğer versiyonun etkilenmediğini doğrula |
| Beklenen Sonuç | - Archive Service dosya versiyonlarını doğru şekilde yönetmeli<br>- Tüm versiyonlar listelenebilmeli<br>- Her versiyon ayrı ayrı indirilebilmeli<br>- Versiyon silme işlemi diğer versiyonları etkilememeli<br>- Versiyon metadata'sı doğru şekilde saklanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.3. Archive Service Metadata Yönetimi Testi

| Test ID | IT-SS-014 |
|---------|-----------|
| Test Adı | Archive Service Metadata Yönetimi Testi |
| Açıklama | Archive Service'in dosya metadata yönetimi özelliğinin doğru çalıştığını test etme |
| Ön Koşullar | Archive Service çalışır durumda olmalı |
| Test Adımları | 1. Archive Service'e metadata ile birlikte bir dosya yükle<br>2. Dosya metadata'sını sorgula ve doğru olduğunu doğrula<br>3. Metadata'yı güncelle ve değişikliklerin uygulandığını doğrula<br>4. Metadata'ya göre dosya arama yap ve doğru sonuçların döndüğünü doğrula<br>5. Metadata şemasını değiştir ve geriye dönük uyumluluğu test et |
| Beklenen Sonuç | - Archive Service dosya metadata'sını doğru şekilde yönetmeli<br>- Metadata sorgulanabilmeli ve güncellenebilmeli<br>- Metadata'ya göre dosya araması yapılabilmeli<br>- Metadata şema değişiklikleri geriye dönük uyumlu olmalı<br>- Metadata işlemleri performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 6. AI Orchestrator Entegrasyon Test Senaryoları

### 6.1. AI Orchestrator - Segmentation Service Entegrasyon Testi

| Test ID | IT-SS-015 |
|---------|-----------|
| Test Adı | AI Orchestrator - Segmentation Service Entegrasyon Testi |
| Açıklama | AI Orchestrator'ın Segmentation Service ile entegrasyonunu test etme |
| Ön Koşullar | AI Orchestrator ve Segmentation Service çalışır durumda olmalı |
| Test Adımları | 1. AI Orchestrator'dan bir segmentasyon modeli al<br>2. Modeli Segmentation Service'e gönder<br>3. Segmentation Service'in modeli yüklediğini ve kullandığını doğrula<br>4. Model parametrelerini değiştir ve değişikliklerin Segmentation Service'e yansıdığını doğrula<br>5. Hata durumlarını test et (model uyumsuzluğu, model yüklenemedi, vb.) |
| Beklenen Sonuç | - AI Orchestrator segmentasyon modelini doğru şekilde sağlamalı<br>- Segmentation Service modeli yükleyebilmeli ve kullanabilmeli<br>- Model parametreleri değişiklikleri Segmentation Service'e yansımalı<br>- Hata durumları uygun şekilde ele alınmalı<br>- Model değişiklikleri performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 6.2. AI Orchestrator Model Yönetimi Testi

| Test ID | IT-SS-016 |
|---------|-----------|
| Test Adı | AI Orchestrator Model Yönetimi Testi |
| Açıklama | AI Orchestrator'ın model yönetimi özelliğinin doğru çalıştığını test etme |
| Ön Koşullar | AI Orchestrator çalışır durumda olmalı |
| Test Adımları | 1. AI Orchestrator'a yeni bir model ekle<br>2. Modeli listele ve eklendiğini doğrula<br>3. Model versiyonunu güncelle ve değişikliklerin uygulandığını doğrula<br>4. Modeli etkinleştir/devre dışı bırak ve durumunun değiştiğini doğrula<br>5. Modeli sil ve listeden kaldırıldığını doğrula |
| Beklenen Sonuç | - AI Orchestrator model ekleme işlemini doğru şekilde gerçekleştirmeli<br>- Modeller listelenebilmeli<br>- Model versiyonları güncellenebilmeli<br>- Modeller etkinleştirilebilmeli/devre dışı bırakılabilmeli<br>- Model silme işlemi doğru çalışmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 6.3. AI Orchestrator Model Dağıtım Testi

| Test ID | IT-SS-017 |
|---------|-----------|
| Test Adı | AI Orchestrator Model Dağıtım Testi |
| Açıklama | AI Orchestrator'ın model dağıtım özelliğinin doğru çalıştığını test etme |
| Ön Koşullar | AI Orchestrator çalışır durumda olmalı ve en az bir model eklenmiş olmalı |
| Test Adımları | 1. AI Orchestrator üzerinden bir modeli dağıtıma al<br>2. Modelin dağıtım durumunu kontrol et<br>3. Dağıtılan modeli kullanarak bir tahmin işlemi gerçekleştir<br>4. Modeli dağıtımdan kaldır ve durumunun değiştiğini doğrula<br>5. Birden fazla model versiyonunu aynı anda dağıtıma al ve çalışmalarını doğrula |
| Beklenen Sonuç | - AI Orchestrator model dağıtım işlemini doğru şekilde gerçekleştirmeli<br>- Dağıtım durumu doğru şekilde raporlanmalı<br>- Dağıtılan model tahmin işlemleri için kullanılabilmeli<br>- Model dağıtımdan kaldırma işlemi doğru çalışmalı<br>- Birden fazla model versiyonu aynı anda dağıtılabilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |
