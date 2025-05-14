# ALT_LAS Desktop UI Kullanıcı Kılavuzu

## İçindekiler

1. [Giriş](#giriş)
2. [Kurulum](#kurulum)
3. [Başlarken](#başlarken)
4. [Arayüz Genel Bakış](#arayüz-genel-bakış)
5. [Temel Özellikler](#temel-özellikler)
6. [İleri Düzey Özellikler](#i̇leri-düzey-özellikler)
7. [Sorun Giderme](#sorun-giderme)
8. [Sık Sorulan Sorular](#sık-sorulan-sorular)
9. [Destek](#destek)

## Giriş

ALT_LAS Desktop UI, ALT_LAS sisteminin masaüstü istemcisidir. Bu uygulama, ALT_LAS sisteminin tüm özelliklerine erişmenizi sağlar ve çevrimdışı çalışma imkanı sunar.

### Sistem Gereksinimleri

- **İşletim Sistemi**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+, Debian 10+)
- **İşlemci**: 2 GHz çift çekirdekli işlemci veya daha iyisi
- **RAM**: En az 4 GB (8 GB önerilir)
- **Disk Alanı**: En az 500 MB boş alan
- **Ekran Çözünürlüğü**: En az 1280x720 (1920x1080 önerilir)
- **İnternet Bağlantısı**: İlk kurulum ve senkronizasyon için gerekli

## Kurulum

### Windows

1. [ALT_LAS web sitesi](https://alt-las.example.com/downloads)'nden Windows için en son sürümü indirin.
2. İndirilen `.exe` dosyasını çalıştırın.
3. Kurulum sihirbazını takip edin.
4. Kurulum tamamlandığında, ALT_LAS Desktop UI otomatik olarak başlatılacaktır.

### macOS

1. [ALT_LAS web sitesi](https://alt-las.example.com/downloads)'nden macOS için en son sürümü indirin.
2. İndirilen `.dmg` dosyasını açın.
3. ALT_LAS uygulamasını Uygulamalar klasörüne sürükleyin.
4. Uygulamalar klasöründen ALT_LAS'ı başlatın.

### Linux

1. [ALT_LAS web sitesi](https://alt-las.example.com/downloads)'nden Linux için en son sürümü indirin.
2. Terminal'i açın ve indirilen dosyanın bulunduğu dizine gidin.
3. Aşağıdaki komutları çalıştırın:

```bash
# .deb paketi için
sudo dpkg -i alt-las-desktop_x.x.x_amd64.deb
sudo apt-get install -f

# .rpm paketi için
sudo rpm -i alt-las-desktop-x.x.x.x86_64.rpm
```

4. Uygulama menüsünden ALT_LAS'ı başlatın.

## Başlarken

### İlk Çalıştırma

ALT_LAS Desktop UI'ı ilk kez çalıştırdığınızda, bir karşılama ekranı görüntülenecektir. Bu ekranda, aşağıdaki seçenekler sunulacaktır:

1. **Yeni Hesap Oluştur**: ALT_LAS sisteminde yeni bir hesap oluşturmak için bu seçeneği kullanın.
2. **Mevcut Hesapla Giriş Yap**: Zaten bir ALT_LAS hesabınız varsa, bu seçeneği kullanarak giriş yapabilirsiniz.
3. **Çevrimdışı Mod**: İnternet bağlantısı olmadan çalışmak için bu seçeneği kullanın.

### Hesap Oluşturma

Yeni bir hesap oluşturmak için:

1. "Yeni Hesap Oluştur" seçeneğini tıklayın.
2. İstenen bilgileri (ad, e-posta, şifre) girin.
3. Kullanım şartlarını ve gizlilik politikasını okuyup kabul edin.
4. "Hesap Oluştur" düğmesine tıklayın.
5. E-posta adresinize gönderilen doğrulama bağlantısına tıklayın.
6. Doğrulama tamamlandıktan sonra, uygulamaya giriş yapabilirsiniz.

### Giriş Yapma

Mevcut bir hesapla giriş yapmak için:

1. "Mevcut Hesapla Giriş Yap" seçeneğini tıklayın.
2. E-posta adresinizi ve şifrenizi girin.
3. "Giriş Yap" düğmesine tıklayın.
4. İki faktörlü kimlik doğrulama etkinleştirdiyseniz, doğrulama kodunu girin.

### Çevrimdışı Mod

Çevrimdışı modda çalışmak için:

1. "Çevrimdışı Mod" seçeneğini tıklayın.
2. Daha önce giriş yaptıysanız, yerel verilerinize erişebileceksiniz.
3. İnternet bağlantısı sağlandığında, verileriniz otomatik olarak senkronize edilecektir.

## Arayüz Genel Bakış

ALT_LAS Desktop UI arayüzü, aşağıdaki ana bölümlerden oluşur:

### Üst Çubuk

Üst çubuk, aşağıdaki öğeleri içerir:

- **Logo**: ALT_LAS logosuna tıklayarak ana sayfaya dönebilirsiniz.
- **Arama Çubuğu**: Tüm içerikte arama yapmak için kullanabilirsiniz.
- **Bildirimler**: Yeni bildirimleri görüntülemek için kullanabilirsiniz.
- **Kullanıcı Menüsü**: Hesap ayarlarına erişmek, tema değiştirmek veya çıkış yapmak için kullanabilirsiniz.

### Kenar Çubuğu

Kenar çubuğu, uygulamanın ana bölümlerine hızlı erişim sağlar:

- **Gösterge Paneli**: Genel bakış ve özet bilgiler.
- **Dosyalar**: Dosya yönetimi ve organizasyonu.
- **Projeler**: Proje yönetimi ve takibi.
- **Raporlar**: Rapor oluşturma ve görüntüleme.
- **Ayarlar**: Uygulama ayarlarını yapılandırma.

### Ana İçerik Alanı

Ana içerik alanı, seçilen bölüme göre değişen içeriği görüntüler. Bu alan, çeşitli paneller, tablolar, grafikler ve formlar içerebilir.

### Durum Çubuğu

Durum çubuğu, aşağıdaki bilgileri görüntüler:

- **Bağlantı Durumu**: Çevrimiçi/çevrimdışı durumunu gösterir.
- **Senkronizasyon Durumu**: Son senkronizasyon zamanını ve durumunu gösterir.
- **Versiyon Bilgisi**: Uygulamanın mevcut sürümünü gösterir.

## Temel Özellikler

### Dosya Yönetimi

ALT_LAS Desktop UI, güçlü bir dosya yönetim sistemi sunar:

#### Dosya Yükleme

Dosya yüklemek için:

1. Kenar çubuğundan "Dosyalar" bölümüne gidin.
2. "Yükle" düğmesine tıklayın veya dosyaları doğrudan uygulama penceresine sürükleyip bırakın.
3. Yükleme seçeneklerini ayarlayın (isteğe bağlı).
4. "Yüklemeyi Başlat" düğmesine tıklayın.

#### Dosya Organizasyonu

Dosyalarınızı organize etmek için:

1. Klasörler oluşturabilirsiniz ("Yeni Klasör" düğmesi).
2. Dosyaları sürükleyip bırakarak taşıyabilirsiniz.
3. Dosyaları etiketleyebilir ve kategorize edebilirsiniz.
4. Çeşitli görünüm seçenekleri arasında geçiş yapabilirsiniz (liste, ızgara, vb.).

#### Dosya Paylaşımı

Dosyaları paylaşmak için:

1. Paylaşmak istediğiniz dosyayı seçin.
2. "Paylaş" düğmesine tıklayın.
3. Paylaşım seçeneklerini ayarlayın (e-posta ile gönder, bağlantı oluştur, vb.).
4. İzinleri ayarlayın (görüntüleme, düzenleme, vb.).
5. "Paylaş" düğmesine tıklayın.

### Proje Yönetimi

ALT_LAS Desktop UI, projelerinizi yönetmek için çeşitli araçlar sunar:

#### Proje Oluşturma

Yeni bir proje oluşturmak için:

1. Kenar çubuğundan "Projeler" bölümüne gidin.
2. "Yeni Proje" düğmesine tıklayın.
3. Proje adı, açıklama ve diğer ayrıntıları girin.
4. Proje şablonu seçin (isteğe bağlı).
5. "Oluştur" düğmesine tıklayın.

#### Görev Yönetimi

Projenizdeki görevleri yönetmek için:

1. Bir projeyi açın.
2. "Görevler" sekmesine gidin.
3. "Yeni Görev" düğmesine tıklayın.
4. Görev ayrıntılarını girin (başlık, açıklama, atanan kişi, vb.).
5. "Kaydet" düğmesine tıklayın.

Görevleri sürükleyip bırakarak durumlarını güncelleyebilirsiniz (Yapılacak, Devam Ediyor, Tamamlandı, vb.).

#### Zaman Takibi

Projelerinizde harcanan zamanı takip etmek için:

1. Bir görevi açın.
2. "Zaman Takibi" bölümüne gidin.
3. "Başlat" düğmesine tıklayarak zamanlayıcıyı başlatın.
4. İşiniz bittiğinde "Durdur" düğmesine tıklayın.
5. Harcanan zamanı ve açıklamayı girin.
6. "Kaydet" düğmesine tıklayın.

### Raporlama

ALT_LAS Desktop UI, çeşitli raporlar oluşturmanıza olanak tanır:

#### Rapor Oluşturma

Yeni bir rapor oluşturmak için:

1. Kenar çubuğundan "Raporlar" bölümüne gidin.
2. "Yeni Rapor" düğmesine tıklayın.
3. Rapor türünü seçin (proje ilerleme, zaman takibi, vb.).
4. Rapor parametrelerini ayarlayın (tarih aralığı, projeler, vb.).
5. "Oluştur" düğmesine tıklayın.

#### Rapor Dışa Aktarma

Raporları dışa aktarmak için:

1. Bir raporu açın.
2. "Dışa Aktar" düğmesine tıklayın.
3. Dışa aktarma formatını seçin (PDF, Excel, CSV, vb.).
4. "İndir" düğmesine tıklayın.

## İleri Düzey Özellikler

### Otomatik Senkronizasyon

ALT_LAS Desktop UI, verilerinizi otomatik olarak senkronize eder:

1. Ayarlar > Senkronizasyon bölümüne gidin.
2. Senkronizasyon sıklığını ayarlayın.
3. Senkronize edilecek öğeleri seçin.
4. "Kaydet" düğmesine tıklayın.

### Çevrimdışı Çalışma

İnternet bağlantısı olmadan çalışmak için:

1. Uygulamayı normal şekilde kullanın.
2. Verileriniz yerel olarak saklanacaktır.
3. İnternet bağlantısı sağlandığında, verileriniz otomatik olarak senkronize edilecektir.
4. Çakışma durumunda, hangi versiyonu korumak istediğinizi seçebilirsiniz.

### Özelleştirme

ALT_LAS Desktop UI'ı kişiselleştirmek için:

1. Ayarlar > Görünüm bölümüne gidin.
2. Tema seçin (açık, koyu, sistem).
3. Renk şemasını ayarlayın.
4. Yazı tipi boyutunu değiştirin.
5. Kenar çubuğu konumunu ayarlayın.
6. "Kaydet" düğmesine tıklayın.

### Klavye Kısayolları

ALT_LAS Desktop UI, verimli çalışmanız için çeşitli klavye kısayolları sunar:

- **Ctrl+N**: Yeni öğe oluştur
- **Ctrl+O**: Öğe aç
- **Ctrl+S**: Kaydet
- **Ctrl+F**: Ara
- **Ctrl+Z**: Geri al
- **Ctrl+Y**: Yinele
- **Ctrl+P**: Yazdır
- **F1**: Yardım
- **F5**: Yenile

Tüm klavye kısayollarını görmek için F1 tuşuna basarak yardım menüsünü açabilirsiniz.

## Sorun Giderme

### Genel Sorunlar

#### Uygulama Başlatılamıyor

Eğer uygulama başlatılamıyorsa:

1. Bilgisayarınızı yeniden başlatın.
2. Uygulamayı yeniden yüklemeyi deneyin.
3. Sistem gereksinimlerini karşıladığınızdan emin olun.
4. Antivirüs yazılımınızın uygulamayı engellemediğinden emin olun.

#### Senkronizasyon Sorunları

Senkronizasyon sorunları yaşıyorsanız:

1. İnternet bağlantınızı kontrol edin.
2. Ayarlar > Senkronizasyon bölümünden manuel senkronizasyonu deneyin.
3. Uygulamayı yeniden başlatın.
4. Hala sorun yaşıyorsanız, günlük dosyalarını kontrol edin (Ayarlar > Gelişmiş > Günlükleri Görüntüle).

#### Performans Sorunları

Performans sorunları yaşıyorsanız:

1. Uygulamayı yeniden başlatın.
2. Disk alanınızın yeterli olduğundan emin olun.
3. Önbelleği temizleyin (Ayarlar > Gelişmiş > Önbelleği Temizle).
4. Sistem gereksinimlerini karşıladığınızdan emin olun.

### Günlük Dosyaları

Sorun giderme için günlük dosyalarını kontrol etmek istiyorsanız:

1. Ayarlar > Gelişmiş > Günlükleri Görüntüle bölümüne gidin.
2. İlgili günlük dosyasını seçin.
3. "Dışa Aktar" düğmesine tıklayarak günlük dosyasını kaydedebilirsiniz.
4. Bu dosyayı destek ekibine gönderebilirsiniz.

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

## Destek

### Yardım Alma

Daha fazla yardıma ihtiyacınız varsa:

1. Uygulama içi yardım menüsünü kullanın (F1 tuşu).
2. [ALT_LAS destek portalını](https://support.alt-las.example.com) ziyaret edin.
3. [Bilgi tabanını](https://kb.alt-las.example.com) inceleyin.
4. [Topluluk forumlarına](https://community.alt-las.example.com) katılın.

### İletişim

Destek ekibiyle iletişime geçmek için:

- **E-posta**: support@alt-las.example.com
- **Telefon**: +90 212 123 4567
- **Canlı Sohbet**: Uygulama içindeki "Yardım" menüsünden erişilebilir.

### Geri Bildirim

Geri bildirimleriniz bizim için değerlidir. Önerilerinizi ve sorunlarınızı bildirmek için:

1. Ayarlar > Geri Bildirim bölümüne gidin.
2. Geri bildirim formunu doldurun.
3. "Gönder" düğmesine tıklayın.

---

Bu kullanıcı kılavuzu, ALT_LAS Desktop UI'ın temel ve ileri düzey özelliklerini kapsamaktadır. Daha fazla bilgi için [ALT_LAS web sitesini](https://alt-las.example.com) ziyaret edebilirsiniz.
