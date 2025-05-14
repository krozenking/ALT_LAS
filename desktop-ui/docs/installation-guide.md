# ALT_LAS Desktop UI Kurulum ve Yapılandırma Kılavuzu

## İçindekiler

1. [Giriş](#giriş)
2. [Sistem Gereksinimleri](#sistem-gereksinimleri)
3. [Kurulum](#kurulum)
   - [Windows](#windows)
   - [macOS](#macos)
   - [Linux](#linux)
4. [İlk Yapılandırma](#i̇lk-yapılandırma)
5. [Gelişmiş Yapılandırma](#gelişmiş-yapılandırma)
   - [Uygulama Ayarları](#uygulama-ayarları)
   - [Senkronizasyon Ayarları](#senkronizasyon-ayarları)
   - [Ağ Ayarları](#ağ-ayarları)
   - [Güvenlik Ayarları](#güvenlik-ayarları)
6. [Sorun Giderme](#sorun-giderme)
7. [Sık Sorulan Sorular](#sık-sorulan-sorular)

## Giriş

Bu kılavuz, ALT_LAS Desktop UI uygulamasının kurulumu ve yapılandırılması için adım adım talimatlar sağlar. Uygulama, Windows, macOS ve Linux işletim sistemlerinde çalışabilir.

## Sistem Gereksinimleri

ALT_LAS Desktop UI'ı çalıştırmak için aşağıdaki minimum sistem gereksinimlerini karşılamanız gerekmektedir:

### Windows

- **İşletim Sistemi**: Windows 10 (64-bit) veya Windows 11
- **İşlemci**: 2 GHz çift çekirdekli işlemci veya daha iyisi
- **RAM**: En az 4 GB (8 GB önerilir)
- **Disk Alanı**: En az 500 MB boş alan
- **Ekran Çözünürlüğü**: En az 1280x720 (1920x1080 önerilir)
- **İnternet Bağlantısı**: İlk kurulum ve senkronizasyon için gerekli

### macOS

- **İşletim Sistemi**: macOS 10.15 (Catalina) veya daha yeni
- **İşlemci**: Intel veya Apple Silicon işlemci
- **RAM**: En az 4 GB (8 GB önerilir)
- **Disk Alanı**: En az 500 MB boş alan
- **Ekran Çözünürlüğü**: En az 1280x720 (1920x1080 önerilir)
- **İnternet Bağlantısı**: İlk kurulum ve senkronizasyon için gerekli

### Linux

- **İşletim Sistemi**: Ubuntu 20.04+, Debian 10+, Fedora 34+ veya diğer modern dağıtımlar
- **İşlemci**: 2 GHz çift çekirdekli işlemci veya daha iyisi
- **RAM**: En az 4 GB (8 GB önerilir)
- **Disk Alanı**: En az 500 MB boş alan
- **Ekran Çözünürlüğü**: En az 1280x720 (1920x1080 önerilir)
- **İnternet Bağlantısı**: İlk kurulum ve senkronizasyon için gerekli

## Kurulum

### Windows

1. [ALT_LAS İndirme Sayfası](https://alt-las.example.com/downloads)'ndan Windows için en son sürümü indirin.
2. İndirilen `ALT_LAS_Desktop_Setup_x.x.x.exe` dosyasını çift tıklayın.
3. Güvenlik uyarısı görünürse, "Çalıştır" veya "Evet" seçeneğini tıklayın.
4. Kurulum sihirbazını başlatmak için "İleri" düğmesine tıklayın.
5. Lisans sözleşmesini okuyun ve kabul edin.
6. Kurulum konumunu seçin veya varsayılan konumu kullanın.
7. Başlat menüsü klasörünü seçin.
8. Ek seçenekleri belirleyin:
   - Masaüstü kısayolu oluştur
   - Windows başlangıcında otomatik başlat
   - Dosya ilişkilendirmelerini kur
9. "Kur" düğmesine tıklayın ve kurulumun tamamlanmasını bekleyin.
10. Kurulum tamamlandığında, "Bitir" düğmesine tıklayın.

#### Komut Satırı Kurulumu (Sistem Yöneticileri İçin)

Komut satırından sessiz kurulum yapmak için:

```cmd
ALT_LAS_Desktop_Setup_x.x.x.exe /S /D=C:\Program Files\ALT_LAS
```

Parametreler:
- `/S`: Sessiz kurulum
- `/D=path`: Kurulum dizini (boşluk içermemelidir)

### macOS

1. [ALT_LAS İndirme Sayfası](https://alt-las.example.com/downloads)'ndan macOS için en son sürümü indirin.
2. İndirilen `ALT_LAS_Desktop-x.x.x.dmg` dosyasını çift tıklayın.
3. Açılan pencerede ALT_LAS simgesini Uygulamalar klasörüne sürükleyin.
4. Kurulum tamamlandıktan sonra, Uygulamalar klasöründen ALT_LAS'ı başlatın.
5. İlk kez çalıştırırken, "Doğrulanmamış geliştirici" uyarısı alabilirsiniz.
6. Bu durumda, Sistem Tercihleri > Güvenlik ve Gizlilik bölümüne gidin.
7. "Genel" sekmesinde, "Bu uygulamayı açmak için 'Aç' düğmesine tıklayın" mesajının yanındaki "Aç" düğmesine tıklayın.

#### Homebrew ile Kurulum

Homebrew kullanarak kurulum yapmak için:

```bash
brew install --cask alt-las-desktop
```

### Linux

#### Debian/Ubuntu Tabanlı Dağıtımlar

1. [ALT_LAS İndirme Sayfası](https://alt-las.example.com/downloads)'ndan Debian/Ubuntu için en son sürümü indirin.
2. İndirilen `.deb` paketini çift tıklayın ve paket yöneticisi ile yükleyin.

Alternatif olarak, terminal kullanarak:

```bash
sudo dpkg -i alt-las-desktop_x.x.x_amd64.deb
sudo apt-get install -f  # Eksik bağımlılıkları yükler
```

#### Red Hat/Fedora Tabanlı Dağıtımlar

1. [ALT_LAS İndirme Sayfası](https://alt-las.example.com/downloads)'ndan Red Hat/Fedora için en son sürümü indirin.
2. İndirilen `.rpm` paketini çift tıklayın ve paket yöneticisi ile yükleyin.

Alternatif olarak, terminal kullanarak:

```bash
sudo rpm -i alt-las-desktop-x.x.x.x86_64.rpm
```

#### AppImage

AppImage sürümü, kurulum gerektirmeden çalıştırılabilir:

1. [ALT_LAS İndirme Sayfası](https://alt-las.example.com/downloads)'ndan AppImage sürümünü indirin.
2. İndirilen `.AppImage` dosyasına çalıştırma izni verin:

```bash
chmod +x ALT_LAS_Desktop-x.x.x.AppImage
```

3. Dosyayı çift tıklayarak veya terminal kullanarak çalıştırın:

```bash
./ALT_LAS_Desktop-x.x.x.AppImage
```

## İlk Yapılandırma

ALT_LAS Desktop UI'ı ilk kez çalıştırdığınızda, bir kurulum sihirbazı görüntülenecektir. Bu sihirbaz, uygulamayı temel ihtiyaçlarınıza göre yapılandırmanıza yardımcı olacaktır.

### Adım 1: Dil Seçimi

1. Tercih ettiğiniz dili seçin.
2. "İleri" düğmesine tıklayın.

### Adım 2: Hesap Oluşturma veya Giriş Yapma

1. Aşağıdaki seçeneklerden birini seçin:
   - **Yeni Hesap Oluştur**: ALT_LAS sisteminde yeni bir hesap oluşturmak için bu seçeneği kullanın.
   - **Mevcut Hesapla Giriş Yap**: Zaten bir ALT_LAS hesabınız varsa, bu seçeneği kullanarak giriş yapabilirsiniz.
   - **Çevrimdışı Mod**: İnternet bağlantısı olmadan çalışmak için bu seçeneği kullanın.
2. Seçiminize göre gerekli bilgileri girin.
3. "İleri" düğmesine tıklayın.

### Adım 3: Veri Konumu

1. Verilerinizin nerede saklanacağını seçin:
   - **Varsayılan Konum**: Uygulamanın varsayılan veri dizinini kullanır.
   - **Özel Konum**: Verilerinizi saklamak için özel bir dizin seçmenize olanak tanır.
2. "İleri" düğmesine tıklayın.

### Adım 4: Senkronizasyon Ayarları

1. Senkronizasyon sıklığını seçin:
   - **Otomatik**: Değişiklikler olduğunda otomatik olarak senkronize eder.
   - **Manuel**: Yalnızca manuel olarak tetiklendiğinde senkronize eder.
   - **Zamanlı**: Belirli aralıklarla senkronize eder (15 dakika, 30 dakika, 1 saat, vb.).
2. Senkronize edilecek öğeleri seçin:
   - Dosyalar
   - Projeler
   - Görevler
   - Ayarlar
3. "İleri" düğmesine tıklayın.

### Adım 5: Görünüm Ayarları

1. Tema seçin:
   - **Açık**: Açık renkli tema
   - **Koyu**: Koyu renkli tema
   - **Sistem**: Sistem temasını kullanır
2. Yazı tipi boyutunu seçin.
3. Kenar çubuğu konumunu seçin (Sol veya Sağ).
4. "İleri" düğmesine tıklayın.

### Adım 6: Tamamlama

1. Yapılandırma özetini gözden geçirin.
2. "Tamamla" düğmesine tıklayın.

Kurulum sihirbazını tamamladıktan sonra, ALT_LAS Desktop UI kullanıma hazır olacaktır.

## Gelişmiş Yapılandırma

### Uygulama Ayarları

Uygulama ayarlarına erişmek için:

1. Üst menüden "Ayarlar" > "Uygulama Ayarları" seçeneğini tıklayın.
2. Aşağıdaki kategorilerde ayarları yapılandırabilirsiniz:

#### Genel

- **Dil**: Uygulama dilini değiştirin.
- **Tema**: Açık, koyu veya sistem temasını seçin.
- **Yazı Tipi Boyutu**: Yazı tipi boyutunu ayarlayın.
- **Kenar Çubuğu Konumu**: Kenar çubuğunun konumunu ayarlayın (Sol veya Sağ).
- **Başlangıçta Otomatik Başlat**: Sistem başlangıcında uygulamayı otomatik olarak başlatın.
- **Sistem Tepsisine Küçült**: Kapatıldığında uygulamayı sistem tepsisine küçültün.
- **Güncellemeleri Otomatik Kontrol Et**: Güncellemeleri otomatik olarak kontrol edin.
- **Güncellemeleri Otomatik İndir**: Güncellemeleri otomatik olarak indirin.

#### Görünüm

- **Renk Şeması**: Uygulama renk şemasını özelleştirin.
- **Animasyonlar**: Animasyonları etkinleştirin veya devre dışı bırakın.
- **Bildirim Konumu**: Bildirimlerin konumunu ayarlayın.
- **Bildirim Süresi**: Bildirimlerin görüntülenme süresini ayarlayın.
- **Gösterge Paneli Düzeni**: Gösterge paneli düzenini özelleştirin.

#### Dosyalar

- **Varsayılan Görünüm Modu**: Dosya gezgini için varsayılan görünüm modunu ayarlayın (Liste, Izgara, Galeri).
- **Dosya Önizlemeleri**: Dosya önizlemelerini etkinleştirin veya devre dışı bırakın.
- **Dosya Sıralama**: Varsayılan dosya sıralama düzenini ayarlayın.
- **Dosya Filtreleme**: Varsayılan dosya filtreleme seçeneklerini ayarlayın.
- **Çift Tıklama Davranışı**: Dosyalara çift tıklama davranışını ayarlayın.

#### Projeler

- **Varsayılan Proje Görünümü**: Varsayılan proje görünümünü ayarlayın (Liste, Kart, Gantt).
- **Görev Tahtası Sütunları**: Görev tahtası sütunlarını özelleştirin.
- **Görev Öncelikleri**: Görev önceliklerini özelleştirin.
- **Görev Durumları**: Görev durumlarını özelleştirin.
- **Zaman Takibi**: Zaman takibi ayarlarını yapılandırın.

### Senkronizasyon Ayarları

Senkronizasyon ayarlarına erişmek için:

1. Üst menüden "Ayarlar" > "Senkronizasyon Ayarları" seçeneğini tıklayın.
2. Aşağıdaki ayarları yapılandırabilirsiniz:

- **Senkronizasyon Sıklığı**: Otomatik, manuel veya zamanlı senkronizasyon.
- **Senkronizasyon Kapsamı**: Senkronize edilecek öğeleri seçin.
- **Çakışma Çözümü**: Çakışma durumunda nasıl davranılacağını belirleyin.
- **Bant Genişliği Sınırlaması**: Senkronizasyon için bant genişliği sınırlaması ayarlayın.
- **Çevrimdışı Mod**: Çevrimdışı mod ayarlarını yapılandırın.
- **Senkronizasyon Günlükleri**: Senkronizasyon günlüklerini görüntüleyin ve yönetin.

### Ağ Ayarları

Ağ ayarlarına erişmek için:

1. Üst menüden "Ayarlar" > "Ağ Ayarları" seçeneğini tıklayın.
2. Aşağıdaki ayarları yapılandırabilirsiniz:

- **API Sunucusu**: ALT_LAS API sunucusunun URL'sini ayarlayın.
- **Proxy Ayarları**: Proxy sunucusu ayarlarını yapılandırın.
- **Bağlantı Zaman Aşımı**: Bağlantı zaman aşımı süresini ayarlayın.
- **Yeniden Deneme Stratejisi**: Bağlantı hatası durumunda yeniden deneme stratejisini ayarlayın.
- **SSL/TLS Ayarları**: SSL/TLS ayarlarını yapılandırın.
- **Ağ Günlükleri**: Ağ günlüklerini görüntüleyin ve yönetin.

### Güvenlik Ayarları

Güvenlik ayarlarına erişmek için:

1. Üst menüden "Ayarlar" > "Güvenlik Ayarları" seçeneğini tıklayın.
2. Aşağıdaki ayarları yapılandırabilirsiniz:

- **Oturum Süresi**: Oturum süresini ayarlayın.
- **Otomatik Kilitleme**: Belirli bir süre sonra uygulamayı otomatik olarak kilitleyin.
- **İki Faktörlü Kimlik Doğrulama**: İki faktörlü kimlik doğrulamayı yapılandırın.
- **Veri Şifreleme**: Yerel veri şifreleme ayarlarını yapılandırın.
- **Güvenli Bağlantılar**: Güvenli bağlantı ayarlarını yapılandırın.
- **Güvenlik Günlükleri**: Güvenlik günlüklerini görüntüleyin ve yönetin.

## Sorun Giderme

### Genel Sorunlar

#### Uygulama Başlatılamıyor

1. Sistem gereksinimlerini karşıladığınızdan emin olun.
2. Uygulamayı yönetici olarak çalıştırmayı deneyin.
3. Antivirüs yazılımınızın uygulamayı engellemediğinden emin olun.
4. Uygulamayı yeniden yüklemeyi deneyin.

#### Senkronizasyon Sorunları

1. İnternet bağlantınızı kontrol edin.
2. API sunucusunun doğru yapılandırıldığından emin olun.
3. Senkronizasyon günlüklerini kontrol edin.
4. Uygulamayı yeniden başlatın.

#### Performans Sorunları

1. Sistem gereksinimlerini karşıladığınızdan emin olun.
2. Uygulamayı yeniden başlatın.
3. Önbelleği temizleyin (Ayarlar > Gelişmiş > Önbelleği Temizle).
4. Disk alanınızın yeterli olduğundan emin olun.

### Günlük Dosyaları

Sorun giderme için günlük dosyalarını kontrol etmek istiyorsanız:

1. Üst menüden "Yardım" > "Günlükleri Görüntüle" seçeneğini tıklayın.
2. İlgili günlük dosyasını seçin.
3. "Dışa Aktar" düğmesine tıklayarak günlük dosyasını kaydedebilirsiniz.

Günlük dosyaları aşağıdaki konumlarda bulunur:

- **Windows**: `%APPDATA%\ALT_LAS\logs`
- **macOS**: `~/Library/Logs/ALT_LAS`
- **Linux**: `~/.config/ALT_LAS/logs`

## Sık Sorulan Sorular

### Genel Sorular

**S: ALT_LAS Desktop UI'ı birden fazla cihazda kullanabilir miyim?**

E: Evet, ALT_LAS hesabınızla birden fazla cihazda oturum açabilirsiniz. Verileriniz otomatik olarak senkronize edilecektir.

**S: Verilerim nerede saklanıyor?**

E: Verileriniz hem yerel olarak cihazınızda hem de ALT_LAS bulut sunucularında şifreli olarak saklanır.

**S: Uygulamayı güncellemek için ne yapmalıyım?**

E: ALT_LAS Desktop UI, otomatik güncelleme özelliğine sahiptir. Yeni bir sürüm mevcut olduğunda, size bildirilecek ve güncellemeyi yüklemek için yönlendirileceksiniz.

### Teknik Sorular

**S: Veri senkronizasyonu ne sıklıkla gerçekleşir?**

E: Varsayılan olarak, veriler her 15 dakikada bir senkronize edilir. Bu ayarı Ayarlar > Senkronizasyon bölümünden değiştirebilirsiniz.

**S: Çevrimdışı modda ne kadar süre çalışabilirim?**

E: Çevrimdışı modda istediğiniz kadar çalışabilirsiniz. Ancak, verilerinizi düzenli olarak senkronize etmeniz önerilir.

**S: Verilerimi nasıl yedekleyebilirim?**

E: Ayarlar > Yedekleme bölümünden manuel yedekleme oluşturabilir veya otomatik yedeklemeyi etkinleştirebilirsiniz.
