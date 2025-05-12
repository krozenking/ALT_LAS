# Performans Test Senaryoları

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Mehmet Kaya (Yazılım Mühendisi), Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Performans Test Senaryoları

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için performans test senaryolarını içermektedir. Performans test senaryoları, sistemin yük altında nasıl davrandığını ve performans gereksinimlerini karşılayıp karşılamadığını değerlendirmek için kullanılacaktır.

## 2. Yük Testi Senaryoları

### 2.1. API Gateway Yük Testi

| Test ID | PT-LT-001 |
|---------|-----------|
| Test Adı | API Gateway Yük Testi |
| Açıklama | API Gateway'in yüksek istek yükü altında performansını test etme |
| Ön Koşullar | API Gateway çalışır durumda olmalı |
| Test Adımları | 1. JMeter veya benzer bir yük test aracı kullan<br>2. API Gateway'e aşağıdaki parametrelerle istek gönder:<br>   - Eşzamanlı kullanıcı sayısı: 50<br>   - Ramp-up süresi: 60 saniye<br>   - Test süresi: 10 dakika<br>   - İstek türü: GET /api/v1/health |
| Beklenen Sonuç | - Ortalama yanıt süresi < 200ms<br>- 99. yüzdelik yanıt süresi < 500ms<br>- Hata oranı < %1<br>- Saniyedeki istek sayısı > 100 |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. Segmentation Service Yük Testi

| Test ID | PT-LT-002 |
|---------|-----------|
| Test Adı | Segmentation Service Yük Testi |
| Açıklama | Segmentation Service'in yüksek iş yükü altında performansını test etme |
| Ön Koşullar | Segmentation Service çalışır durumda olmalı |
| Test Adımları | 1. Test betiği kullanarak aşağıdaki parametrelerle segmentasyon işleri oluştur:<br>   - Toplam iş sayısı: 50<br>   - Eşzamanlı iş sayısı: 10<br>   - Görüntü boyutu: 1024x1024 piksel |
| Beklenen Sonuç | - Ortalama işlem süresi < 30 saniye/görüntü<br>- Tüm işlerin tamamlanma süresi < 5 dakika<br>- Başarısız iş oranı < %1<br>- CPU kullanımı < %80<br>- Bellek kullanımı < %80 |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.3. Runner Service Yük Testi

| Test ID | PT-LT-003 |
|---------|-----------|
| Test Adı | Runner Service Yük Testi |
| Açıklama | Runner Service'in yüksek iş yükü altında performansını test etme |
| Ön Koşullar | Runner Service çalışır durumda olmalı |
| Test Adımları | 1. Test betiği kullanarak aşağıdaki parametrelerle işler oluştur:<br>   - Toplam iş sayısı: 100<br>   - Eşzamanlı iş sayısı: 20<br>   - Farklı öncelik seviyelerinde işler (1-10) |
| Beklenen Sonuç | - İş sıralaması önceliğe göre doğru yapılmalı<br>- Saniyede işlenen iş sayısı > 5<br>- CPU kullanımı < %70<br>- Bellek kullanımı < %70 |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.4. Archive Service Yük Testi

| Test ID | PT-LT-004 |
|---------|-----------|
| Test Adı | Archive Service Yük Testi |
| Açıklama | Archive Service'in yüksek dosya yükü altında performansını test etme |
| Ön Koşullar | Archive Service çalışır durumda olmalı |
| Test Adımları | 1. Test betiği kullanarak aşağıdaki parametrelerle dosya yükleme işlemleri gerçekleştir:<br>   - Toplam dosya sayısı: 100<br>   - Eşzamanlı yükleme sayısı: 10<br>   - Dosya boyutu: 10MB |
| Beklenen Sonuç | - Ortalama yükleme süresi < 5 saniye/dosya<br>- Tüm dosyaların yüklenme süresi < 10 dakika<br>- Başarısız yükleme oranı < %1<br>- Disk I/O kullanımı < %80 |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.5. AI Orchestrator Yük Testi

| Test ID | PT-LT-005 |
|---------|-----------|
| Test Adı | AI Orchestrator Yük Testi |
| Açıklama | AI Orchestrator'ın yüksek model yükü altında performansını test etme |
| Ön Koşullar | AI Orchestrator çalışır durumda olmalı |
| Test Adımları | 1. Test betiği kullanarak aşağıdaki parametrelerle model dağıtım işlemleri gerçekleştir:<br>   - Toplam model sayısı: 10<br>   - Eşzamanlı dağıtım sayısı: 3<br>   - Model boyutu: 500MB |
| Beklenen Sonuç | - Ortalama dağıtım süresi < 60 saniye/model<br>- Tüm modellerin dağıtım süresi < 5 dakika<br>- Başarısız dağıtım oranı < %1<br>- CPU kullanımı < %80<br>- Bellek kullanımı < %80 |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. Stres Testi Senaryoları

### 3.1. API Gateway Stres Testi

| Test ID | PT-ST-001 |
|---------|-----------|
| Test Adı | API Gateway Stres Testi |
| Açıklama | API Gateway'in maksimum kapasitesini test etme |
| Ön Koşullar | API Gateway çalışır durumda olmalı |
| Test Adımları | 1. JMeter veya benzer bir stres test aracı kullan<br>2. API Gateway'e aşağıdaki parametrelerle istek gönder:<br>   - Başlangıç eşzamanlı kullanıcı sayısı: 50<br>   - Her 30 saniyede kullanıcı sayısını 50 artır<br>   - Maksimum kullanıcı sayısı: 500<br>   - Test süresi: 30 dakika<br>   - İstek türü: GET /api/v1/health |
| Beklenen Sonuç | - Sistem çökmeden maksimum yükü kaldırabilmeli<br>- Maksimum eşzamanlı kullanıcı sayısı > 200<br>- Maksimum saniyedeki istek sayısı > 200<br>- Hata oranı < %5 (maksimum yükte) |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. Segmentation Service Stres Testi

| Test ID | PT-ST-002 |
|---------|-----------|
| Test Adı | Segmentation Service Stres Testi |
| Açıklama | Segmentation Service'in maksimum kapasitesini test etme |
| Ön Koşullar | Segmentation Service çalışır durumda olmalı |
| Test Adımları | 1. Test betiği kullanarak aşağıdaki parametrelerle segmentasyon işleri oluştur:<br>   - Başlangıç eşzamanlı iş sayısı: 10<br>   - Her 5 dakikada iş sayısını 10 artır<br>   - Maksimum eşzamanlı iş sayısı: 50<br>   - Test süresi: 30 dakika<br>   - Görüntü boyutu: 1024x1024 piksel |
| Beklenen Sonuç | - Sistem çökmeden maksimum yükü kaldırabilmeli<br>- Maksimum eşzamanlı iş sayısı > 30<br>- CPU kullanımı < %95<br>- Bellek kullanımı < %95<br>- Başarısız iş oranı < %10 (maksimum yükte) |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. Veritabanı Stres Testi

| Test ID | PT-ST-003 |
|---------|-----------|
| Test Adı | Veritabanı Stres Testi |
| Açıklama | Veritabanlarının maksimum kapasitesini test etme |
| Ön Koşullar | Veritabanları çalışır durumda olmalı |
| Test Adımları | 1. Test betiği kullanarak aşağıdaki parametrelerle veritabanı işlemleri gerçekleştir:<br>   - PostgreSQL: Saniyede 100 sorgu (okuma/yazma karışık)<br>   - MongoDB: Saniyede 100 sorgu (okuma/yazma karışık)<br>   - Elasticsearch: Saniyede 50 sorgu (okuma/yazma karışık)<br>   - Test süresi: 15 dakika |
| Beklenen Sonuç | - Veritabanları çökmeden maksimum yükü kaldırabilmeli<br>- PostgreSQL ortalama sorgu süresi < 50ms<br>- MongoDB ortalama sorgu süresi < 50ms<br>- Elasticsearch ortalama sorgu süresi < 100ms<br>- Hata oranı < %1 |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 4. Dayanıklılık Testi Senaryoları

### 4.1. Sistem Dayanıklılık Testi

| Test ID | PT-ET-001 |
|---------|-----------|
| Test Adı | Sistem Dayanıklılık Testi |
| Açıklama | Sistemin uzun süreli çalışma altında performansını test etme |
| Ön Koşullar | Tüm sistem bileşenleri çalışır durumda olmalı |
| Test Adımları | 1. Test betiği kullanarak aşağıdaki parametrelerle sürekli iş yükü oluştur:<br>   - Orta seviyede yük (kapasitenin %50'si)<br>   - Test süresi: 24 saat<br>   - Düzenli aralıklarla farklı türde işlemler (segmentasyon, arşivleme, model dağıtımı, vb.) |
| Beklenen Sonuç | - Sistem 24 saat boyunca kesintisiz çalışabilmeli<br>- Bellek sızıntısı olmamalı<br>- Performans zamanla düşmemeli<br>- Hata oranı < %0.1<br>- Tüm servisler ayakta kalmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.2. Veritabanı Dayanıklılık Testi

| Test ID | PT-ET-002 |
|---------|-----------|
| Test Adı | Veritabanı Dayanıklılık Testi |
| Açıklama | Veritabanlarının uzun süreli çalışma altında performansını test etme |
| Ön Koşullar | Veritabanları çalışır durumda olmalı |
| Test Adımları | 1. Test betiği kullanarak aşağıdaki parametrelerle sürekli veritabanı işlemleri gerçekleştir:<br>   - Orta seviyede yük (kapasitenin %50'si)<br>   - Test süresi: 24 saat<br>   - Düzenli aralıklarla veri ekleme, güncelleme, silme ve sorgulama işlemleri |
| Beklenen Sonuç | - Veritabanları 24 saat boyunca kesintisiz çalışabilmeli<br>- Veritabanı boyutu kontrollü bir şekilde artmalı<br>- Sorgu performansı zamanla düşmemeli<br>- Hata oranı < %0.1 |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 5. Ölçeklenebilirlik Testi Senaryoları

### 5.1. Yatay Ölçeklendirme Testi

| Test ID | PT-SC-001 |
|---------|-----------|
| Test Adı | Yatay Ölçeklendirme Testi |
| Açıklama | Servislerin yatay ölçeklenebilirliğini test etme |
| Ön Koşullar | Kubernetes cluster çalışır durumda olmalı |
| Test Adımları | 1. Başlangıçta her servis için 1 replika ayarla<br>2. Yük test betiği kullanarak kademeli olarak yükü artır<br>3. HorizontalPodAutoscaler'ın servisleri otomatik olarak ölçeklendirmesini gözlemle<br>4. Maksimum yüke ulaşıldığında, manuel olarak replika sayısını artır<br>5. Yükü kademeli olarak azalt ve ölçeklendirme davranışını gözlemle |
| Beklenen Sonuç | - Servisler yük arttıkça otomatik olarak ölçeklendirilmeli<br>- Ölçeklendirme sonrası performans iyileşmeli<br>- Yük azaldığında servisler otomatik olarak küçülmeli<br>- Ölçeklendirme sırasında hizmet kesintisi olmamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.2. Dikey Ölçeklendirme Testi

| Test ID | PT-SC-002 |
|---------|-----------|
| Test Adı | Dikey Ölçeklendirme Testi |
| Açıklama | Servislerin dikey ölçeklenebilirliğini test etme |
| Ön Koşullar | Kubernetes cluster çalışır durumda olmalı |
| Test Adımları | 1. Başlangıçta her servis için düşük kaynak limitleri ayarla (CPU: 200m, Bellek: 256Mi)<br>2. Yük test betiği kullanarak kademeli olarak yükü artır<br>3. Servislerin kaynak kullanımını gözlemle<br>4. Kaynak limitleri aşıldığında, manuel olarak kaynak limitlerini artır (CPU: 500m, Bellek: 512Mi)<br>5. Performans değişimini gözlemle |
| Beklenen Sonuç | - Servisler daha yüksek kaynak limitleriyle daha iyi performans göstermeli<br>- Kaynak limitleri artırıldıktan sonra CPU ve bellek kullanımı dengelenmeli<br>- Dikey ölçeklendirme sırasında kısa süreli hizmet kesintisi olabilir (pod yeniden başlatma) |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 6. Ağ Performansı Test Senaryoları

### 6.1. Servisler Arası İletişim Testi

| Test ID | PT-NP-001 |
|---------|-----------|
| Test Adı | Servisler Arası İletişim Testi |
| Açıklama | Servisler arasındaki iletişim performansını test etme |
| Ön Koşullar | Tüm servisler çalışır durumda olmalı |
| Test Adımları | 1. Test betiği kullanarak servisler arası çağrılar gerçekleştir<br>2. Farklı servis çiftleri arasında (API Gateway -> Segmentation Service, Segmentation Service -> Archive Service, vb.) iletişim sürelerini ölç<br>3. Eşzamanlı çağrı sayısını kademeli olarak artır |
| Beklenen Sonuç | - Servisler arası ortalama iletişim süresi < 50ms<br>- Eşzamanlı çağrı sayısı arttıkça iletişim süresi kabul edilebilir sınırlar içinde artmalı<br>- Hata oranı < %0.1 |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 6.2. Dış Ağ Bağlantısı Testi

| Test ID | PT-NP-002 |
|---------|-----------|
| Test Adı | Dış Ağ Bağlantısı Testi |
| Açıklama | Sistemin dış ağ bağlantısı performansını test etme |
| Ön Koşullar | Sistem dış ağa bağlanabilir durumda olmalı |
| Test Adımları | 1. Test betiği kullanarak dış API'lere çağrılar gerçekleştir<br>2. Büyük dosyaları (100MB) dış kaynaklardan indirme ve dış kaynaklara yükleme işlemleri gerçekleştir<br>3. Eşzamanlı dış bağlantı sayısını kademeli olarak artır |
| Beklenen Sonuç | - Dış API çağrıları için ortalama yanıt süresi < 500ms<br>- Dosya indirme/yükleme hızı > 10MB/s<br>- Eşzamanlı bağlantı sayısı arttıkça performans kabul edilebilir sınırlar içinde düşmeli<br>- Hata oranı < %1 |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 7. Veritabanı Performansı Test Senaryoları

### 7.1. PostgreSQL Performans Testi

| Test ID | PT-DB-001 |
|---------|-----------|
| Test Adı | PostgreSQL Performans Testi |
| Açıklama | PostgreSQL veritabanının performansını test etme |
| Ön Koşullar | PostgreSQL veritabanı çalışır durumda olmalı |
| Test Adımları | 1. Test betiği kullanarak aşağıdaki veritabanı işlemlerini gerçekleştir:<br>   - Veri ekleme: 10,000 kayıt<br>   - Veri sorgulama: Farklı karmaşıklıkta 100 sorgu<br>   - Veri güncelleme: 5,000 kayıt<br>   - Veri silme: 1,000 kayıt<br>2. Eşzamanlı bağlantı sayısını kademeli olarak artır (1, 5, 10, 20, 50) |
| Beklenen Sonuç | - Veri ekleme hızı > 1,000 kayıt/saniye<br>- Basit sorgu yanıt süresi < 10ms<br>- Karmaşık sorgu yanıt süresi < 100ms<br>- Eşzamanlı bağlantı sayısı arttıkça performans kabul edilebilir sınırlar içinde düşmeli<br>- Veritabanı bağlantı havuzu doğru çalışmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 7.2. MongoDB Performans Testi

| Test ID | PT-DB-002 |
|---------|-----------|
| Test Adı | MongoDB Performans Testi |
| Açıklama | MongoDB veritabanının performansını test etme |
| Ön Koşullar | MongoDB veritabanı çalışır durumda olmalı |
| Test Adımları | 1. Test betiği kullanarak aşağıdaki veritabanı işlemlerini gerçekleştir:<br>   - Veri ekleme: 10,000 doküman<br>   - Veri sorgulama: Farklı karmaşıklıkta 100 sorgu<br>   - Veri güncelleme: 5,000 doküman<br>   - Veri silme: 1,000 doküman<br>2. Eşzamanlı bağlantı sayısını kademeli olarak artır (1, 5, 10, 20, 50) |
| Beklenen Sonuç | - Veri ekleme hızı > 2,000 doküman/saniye<br>- Basit sorgu yanıt süresi < 10ms<br>- Karmaşık sorgu yanıt süresi < 100ms<br>- Eşzamanlı bağlantı sayısı arttıkça performans kabul edilebilir sınırlar içinde düşmeli<br>- İndeksler doğru çalışmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 7.3. Elasticsearch Performans Testi

| Test ID | PT-DB-003 |
|---------|-----------|
| Test Adı | Elasticsearch Performans Testi |
| Açıklama | Elasticsearch veritabanının performansını test etme |
| Ön Koşullar | Elasticsearch veritabanı çalışır durumda olmalı |
| Test Adımları | 1. Test betiği kullanarak aşağıdaki veritabanı işlemlerini gerçekleştir:<br>   - Veri ekleme: 10,000 doküman<br>   - Veri sorgulama: Farklı karmaşıklıkta 100 sorgu (tam metin araması, filtreleme, agregasyon)<br>   - Veri güncelleme: 5,000 doküman<br>   - Veri silme: 1,000 doküman<br>2. Eşzamanlı bağlantı sayısını kademeli olarak artır (1, 5, 10, 20, 50) |
| Beklenen Sonuç | - Veri ekleme hızı > 1,000 doküman/saniye<br>- Basit sorgu yanıt süresi < 50ms<br>- Karmaşık sorgu yanıt süresi < 200ms<br>- Tam metin araması doğru ve hızlı çalışmalı<br>- Eşzamanlı bağlantı sayısı arttıkça performans kabul edilebilir sınırlar içinde düşmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |
