# Fonksiyonel Test Senaryoları

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Mehmet Kaya (Yazılım Mühendisi), Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Fonksiyonel Test Senaryoları

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için fonksiyonel test senaryolarını içermektedir. Fonksiyonel test senaryoları, sistemin temel işlevlerinin doğru çalıştığını doğrulamak için kullanılacaktır.

## 2. Kullanıcı Yönetimi Test Senaryoları

### 2.1. Kullanıcı Girişi

| Test ID | FT-UM-001 |
|---------|-----------|
| Test Adı | Geçerli Kullanıcı Girişi |
| Açıklama | Geçerli kullanıcı adı ve parola ile giriş yapma |
| Ön Koşullar | Kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Giriş sayfasına git<br>2. Geçerli kullanıcı adını gir<br>3. Geçerli parolayı gir<br>4. "Giriş Yap" düğmesine tıkla |
| Beklenen Sonuç | Kullanıcı başarıyla giriş yapmalı ve ana sayfaya yönlendirilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. Geçersiz Kullanıcı Girişi

| Test ID | FT-UM-002 |
|---------|-----------|
| Test Adı | Geçersiz Kullanıcı Girişi |
| Açıklama | Geçersiz kullanıcı adı ve parola ile giriş yapma |
| Ön Koşullar | - |
| Test Adımları | 1. Giriş sayfasına git<br>2. Geçersiz kullanıcı adını gir<br>3. Geçersiz parolayı gir<br>4. "Giriş Yap" düğmesine tıkla |
| Beklenen Sonuç | Kullanıcı giriş yapamamalı ve "Geçersiz kullanıcı adı veya parola" hata mesajı görüntülenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.3. Kullanıcı Çıkışı

| Test ID | FT-UM-003 |
|---------|-----------|
| Test Adı | Kullanıcı Çıkışı |
| Açıklama | Sistemden çıkış yapma |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Üst menüdeki kullanıcı adına tıkla<br>2. Açılan menüden "Çıkış" seçeneğine tıkla |
| Beklenen Sonuç | Kullanıcı başarıyla çıkış yapmalı ve giriş sayfasına yönlendirilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.4. Şifre Değiştirme

| Test ID | FT-UM-004 |
|---------|-----------|
| Test Adı | Şifre Değiştirme |
| Açıklama | Kullanıcı şifresini değiştirme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Üst menüdeki kullanıcı adına tıkla<br>2. Açılan menüden "Profil" seçeneğine tıkla<br>3. "Şifre Değiştir" düğmesine tıkla<br>4. Mevcut şifreyi gir<br>5. Yeni şifreyi gir<br>6. Yeni şifreyi tekrar gir<br>7. "Kaydet" düğmesine tıkla |
| Beklenen Sonuç | Kullanıcı şifresi başarıyla değiştirilmeli ve başarı mesajı görüntülenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.5. Kullanıcı Profili Güncelleme

| Test ID | FT-UM-005 |
|---------|-----------|
| Test Adı | Kullanıcı Profili Güncelleme |
| Açıklama | Kullanıcı profil bilgilerini güncelleme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Üst menüdeki kullanıcı adına tıkla<br>2. Açılan menüden "Profil" seçeneğine tıkla<br>3. Profil bilgilerini güncelle (ad, soyad, e-posta, vb.)<br>4. "Kaydet" düğmesine tıkla |
| Beklenen Sonuç | Kullanıcı profil bilgileri başarıyla güncellenmeli ve başarı mesajı görüntülenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. Segmentasyon Test Senaryoları

### 3.1. Görüntü Yükleme

| Test ID | FT-SG-001 |
|---------|-----------|
| Test Adı | Görüntü Yükleme |
| Açıklama | Sisteme görüntü yükleme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Ana menüden "Segmentasyon" seçeneğine tıkla<br>2. "Yeni Görüntü Yükle" düğmesine tıkla<br>3. Yerel dosya sisteminden bir görüntü seç<br>4. "Yükle" düğmesine tıkla |
| Beklenen Sonuç | Görüntü başarıyla yüklenmeli ve görüntü önizlemesi gösterilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. Segmentasyon İşi Oluşturma

| Test ID | FT-SG-002 |
|---------|-----------|
| Test Adı | Segmentasyon İşi Oluşturma |
| Açıklama | Yeni bir segmentasyon işi oluşturma |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve bir görüntü yüklenmiş olmalı |
| Test Adımları | 1. Ana menüden "Segmentasyon" seçeneğine tıkla<br>2. Yüklenen görüntüyü seç<br>3. "Segmentasyon İşi Oluştur" düğmesine tıkla<br>4. Segmentasyon algoritmasını seç (UNet, MaskRCNN, vb.)<br>5. Segmentasyon parametrelerini ayarla<br>6. "Başlat" düğmesine tıkla |
| Beklenen Sonuç | Segmentasyon işi başarıyla oluşturulmalı ve iş listesinde görüntülenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. Segmentasyon Sonuçlarını Görüntüleme

| Test ID | FT-SG-003 |
|---------|-----------|
| Test Adı | Segmentasyon Sonuçlarını Görüntüleme |
| Açıklama | Tamamlanan segmentasyon işinin sonuçlarını görüntüleme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve bir segmentasyon işi tamamlanmış olmalı |
| Test Adımları | 1. Ana menüden "Segmentasyon" seçeneğine tıkla<br>2. İş listesinden tamamlanan işi seç<br>3. "Sonuçları Görüntüle" düğmesine tıkla |
| Beklenen Sonuç | Segmentasyon sonuçları görsel olarak gösterilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.4. Segmentasyon Sonuçlarını İndirme

| Test ID | FT-SG-004 |
|---------|-----------|
| Test Adı | Segmentasyon Sonuçlarını İndirme |
| Açıklama | Tamamlanan segmentasyon işinin sonuçlarını indirme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve bir segmentasyon işi tamamlanmış olmalı |
| Test Adımları | 1. Ana menüden "Segmentasyon" seçeneğine tıkla<br>2. İş listesinden tamamlanan işi seç<br>3. "Sonuçları Görüntüle" düğmesine tıkla<br>4. "İndir" düğmesine tıkla<br>5. İndirme formatını seç (PNG, JPEG, JSON, vb.) |
| Beklenen Sonuç | Segmentasyon sonuçları seçilen formatta indirilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.5. Batch Segmentasyon

| Test ID | FT-SG-005 |
|---------|-----------|
| Test Adı | Batch Segmentasyon |
| Açıklama | Toplu segmentasyon işi oluşturma |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve birden fazla görüntü yüklenmiş olmalı |
| Test Adımları | 1. Ana menüden "Segmentasyon" seçeneğine tıkla<br>2. "Toplu İşlem" düğmesine tıkla<br>3. İşlem yapılacak görüntüleri seç<br>4. Segmentasyon algoritmasını seç<br>5. Segmentasyon parametrelerini ayarla<br>6. "Başlat" düğmesine tıkla |
| Beklenen Sonuç | Toplu segmentasyon işi başarıyla oluşturulmalı ve iş listesinde görüntülenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 4. İş Yönetimi Test Senaryoları

### 4.1. İş Listesini Görüntüleme

| Test ID | FT-JM-001 |
|---------|-----------|
| Test Adı | İş Listesini Görüntüleme |
| Açıklama | Tüm işlerin listesini görüntüleme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Ana menüden "İş Yönetimi" seçeneğine tıkla |
| Beklenen Sonuç | Tüm işlerin listesi görüntülenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.2. İş Filtreleme

| Test ID | FT-JM-002 |
|---------|-----------|
| Test Adı | İş Filtreleme |
| Açıklama | İşleri belirli kriterlere göre filtreleme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve işler oluşturulmuş olmalı |
| Test Adımları | 1. Ana menüden "İş Yönetimi" seçeneğine tıkla<br>2. Filtre seçeneklerini kullan (durum, tür, tarih aralığı, vb.) |
| Beklenen Sonuç | İşler seçilen kriterlere göre filtrelenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.3. İş Detaylarını Görüntüleme

| Test ID | FT-JM-003 |
|---------|-----------|
| Test Adı | İş Detaylarını Görüntüleme |
| Açıklama | Bir işin detaylarını görüntüleme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve en az bir iş oluşturulmuş olmalı |
| Test Adımları | 1. Ana menüden "İş Yönetimi" seçeneğine tıkla<br>2. İş listesinden bir işi seç<br>3. "Detaylar" düğmesine tıkla |
| Beklenen Sonuç | İşin detayları görüntülenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.4. İş İptal Etme

| Test ID | FT-JM-004 |
|---------|-----------|
| Test Adı | İş İptal Etme |
| Açıklama | Bekleyen veya işlenen bir işi iptal etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve bekleyen veya işlenen bir iş olmalı |
| Test Adımları | 1. Ana menüden "İş Yönetimi" seçeneğine tıkla<br>2. İş listesinden bekleyen veya işlenen bir işi seç<br>3. "İptal Et" düğmesine tıkla<br>4. Onay iletişim kutusunda "Evet" düğmesine tıkla |
| Beklenen Sonuç | İş başarıyla iptal edilmeli ve durumu "İptal Edildi" olarak güncellenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.5. İş Yeniden Başlatma

| Test ID | FT-JM-005 |
|---------|-----------|
| Test Adı | İş Yeniden Başlatma |
| Açıklama | Başarısız veya iptal edilmiş bir işi yeniden başlatma |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve başarısız veya iptal edilmiş bir iş olmalı |
| Test Adımları | 1. Ana menüden "İş Yönetimi" seçeneğine tıkla<br>2. İş listesinden başarısız veya iptal edilmiş bir işi seç<br>3. "Yeniden Başlat" düğmesine tıkla |
| Beklenen Sonuç | İş başarıyla yeniden başlatılmalı ve durumu "Bekliyor" olarak güncellenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 5. Arşiv Yönetimi Test Senaryoları

### 5.1. Dosya Yükleme

| Test ID | FT-AM-001 |
|---------|-----------|
| Test Adı | Dosya Yükleme |
| Açıklama | Arşive dosya yükleme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Ana menüden "Arşiv" seçeneğine tıkla<br>2. "Dosya Yükle" düğmesine tıkla<br>3. Yerel dosya sisteminden bir dosya seç<br>4. Dosya metadata bilgilerini gir<br>5. "Yükle" düğmesine tıkla |
| Beklenen Sonuç | Dosya başarıyla yüklenmeli ve dosya listesinde görüntülenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.2. Dosya İndirme

| Test ID | FT-AM-002 |
|---------|-----------|
| Test Adı | Dosya İndirme |
| Açıklama | Arşivden dosya indirme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve arşivde en az bir dosya olmalı |
| Test Adımları | 1. Ana menüden "Arşiv" seçeneğine tıkla<br>2. Dosya listesinden bir dosyayı seç<br>3. "İndir" düğmesine tıkla |
| Beklenen Sonuç | Dosya başarıyla indirilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.3. Dosya Arama

| Test ID | FT-AM-003 |
|---------|-----------|
| Test Adı | Dosya Arama |
| Açıklama | Arşivde dosya arama |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve arşivde dosyalar olmalı |
| Test Adımları | 1. Ana menüden "Arşiv" seçeneğine tıkla<br>2. Arama kutusuna arama terimini gir<br>3. "Ara" düğmesine tıkla |
| Beklenen Sonuç | Arama terimiyle eşleşen dosyalar listelenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.4. Dosya Metadata Düzenleme

| Test ID | FT-AM-004 |
|---------|-----------|
| Test Adı | Dosya Metadata Düzenleme |
| Açıklama | Dosya metadata bilgilerini düzenleme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve arşivde en az bir dosya olmalı |
| Test Adımları | 1. Ana menüden "Arşiv" seçeneğine tıkla<br>2. Dosya listesinden bir dosyayı seç<br>3. "Düzenle" düğmesine tıkla<br>4. Metadata bilgilerini güncelle<br>5. "Kaydet" düğmesine tıkla |
| Beklenen Sonuç | Dosya metadata bilgileri başarıyla güncellenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.5. Dosya Silme

| Test ID | FT-AM-005 |
|---------|-----------|
| Test Adı | Dosya Silme |
| Açıklama | Arşivden dosya silme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve arşivde en az bir dosya olmalı |
| Test Adımları | 1. Ana menüden "Arşiv" seçeneğine tıkla<br>2. Dosya listesinden bir dosyayı seç<br>3. "Sil" düğmesine tıkla<br>4. Onay iletişim kutusunda "Evet" düğmesine tıkla |
| Beklenen Sonuç | Dosya başarıyla silinmeli ve dosya listesinden kaldırılmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |
