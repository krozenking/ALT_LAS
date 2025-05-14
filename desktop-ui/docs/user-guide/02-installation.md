# 2. Kurulum

Bu bölüm, ALT_LAS Desktop UI'ın farklı işletim sistemlerine nasıl kurulacağını adım adım açıklamaktadır.

## İndirme

ALT_LAS Desktop UI'ın en son sürümünü [ALT_LAS İndirme Sayfası](https://alt-las.example.com/downloads)'ndan indirebilirsiniz. İşletim sisteminize uygun sürümü seçtiğinizden emin olun.

## Windows

### Sistem Gereksinimleri

- Windows 10 (64-bit) veya Windows 11
- 2 GHz çift çekirdekli işlemci veya daha iyisi
- En az 4 GB RAM (8 GB önerilir)
- En az 500 MB boş disk alanı

### Kurulum Adımları

1. İndirilen `ALT_LAS_Desktop_Setup_x.x.x.exe` dosyasını çift tıklayın.
2. Güvenlik uyarısı görünürse, "Çalıştır" veya "Evet" seçeneğini tıklayın.
3. Kurulum sihirbazını başlatmak için "İleri" düğmesine tıklayın.
4. Lisans sözleşmesini okuyun ve kabul edin.
5. Kurulum konumunu seçin veya varsayılan konumu kullanın.
6. Başlat menüsü klasörünü seçin.
7. Ek seçenekleri belirleyin:
   - Masaüstü kısayolu oluştur
   - Windows başlangıcında otomatik başlat
   - Dosya ilişkilendirmelerini kur
8. "Kur" düğmesine tıklayın ve kurulumun tamamlanmasını bekleyin.
9. Kurulum tamamlandığında, "Bitir" düğmesine tıklayın.

### Sessiz Kurulum (Sistem Yöneticileri İçin)

Komut satırından sessiz kurulum yapmak için:

```cmd
ALT_LAS_Desktop_Setup_x.x.x.exe /S /D=C:\Program Files\ALT_LAS
```

Parametreler:
- `/S`: Sessiz kurulum
- `/D=path`: Kurulum dizini (boşluk içermemelidir)

## macOS

### Sistem Gereksinimleri

- macOS 10.15 (Catalina) veya daha yeni
- Intel veya Apple Silicon işlemci
- En az 4 GB RAM (8 GB önerilir)
- En az 500 MB boş disk alanı

### Kurulum Adımları

1. İndirilen `ALT_LAS_Desktop-x.x.x.dmg` dosyasını çift tıklayın.
2. Açılan pencerede ALT_LAS simgesini Uygulamalar klasörüne sürükleyin.
3. Kurulum tamamlandıktan sonra, Uygulamalar klasöründen ALT_LAS'ı başlatın.
4. İlk kez çalıştırırken, "Doğrulanmamış geliştirici" uyarısı alabilirsiniz.
5. Bu durumda, Sistem Tercihleri > Güvenlik ve Gizlilik bölümüne gidin.
6. "Genel" sekmesinde, "Bu uygulamayı açmak için 'Aç' düğmesine tıklayın" mesajının yanındaki "Aç" düğmesine tıklayın.

### Apple Silicon (M1/M2) Notları

Apple Silicon işlemcili Mac'lerde, uygulama Rosetta 2 aracılığıyla çalışacaktır. İlk çalıştırmada Rosetta 2'nin yüklenmesi istenebilir. Yüklemeyi onaylayın ve devam edin.

## Linux

### Sistem Gereksinimleri

- Ubuntu 20.04+, Debian 10+, Fedora 34+ veya diğer modern dağıtımlar
- 2 GHz çift çekirdekli işlemci veya daha iyisi
- En az 4 GB RAM (8 GB önerilir)
- En az 500 MB boş disk alanı

### Debian/Ubuntu Tabanlı Dağıtımlar

1. İndirilen `.deb` paketini çift tıklayın ve paket yöneticisi ile yükleyin.

Alternatif olarak, terminal kullanarak:

```bash
sudo dpkg -i alt-las-desktop_x.x.x_amd64.deb
sudo apt-get install -f  # Eksik bağımlılıkları yükler
```

### Red Hat/Fedora Tabanlı Dağıtımlar

1. İndirilen `.rpm` paketini çift tıklayın ve paket yöneticisi ile yükleyin.

Alternatif olarak, terminal kullanarak:

```bash
sudo rpm -i alt-las-desktop-x.x.x.x86_64.rpm
```

### AppImage

AppImage sürümü, kurulum gerektirmeden çalıştırılabilir:

1. İndirilen `.AppImage` dosyasına çalıştırma izni verin:

```bash
chmod +x ALT_LAS_Desktop-x.x.x.AppImage
```

2. Dosyayı çift tıklayarak veya terminal kullanarak çalıştırın:

```bash
./ALT_LAS_Desktop-x.x.x.AppImage
```

## Portable Sürüm

ALT_LAS Desktop UI'ın taşınabilir sürümü, kurulum gerektirmeden çalıştırılabilir. Bu sürüm, USB bellek gibi taşınabilir depolama aygıtlarında kullanım için idealdir.

### Windows Portable

1. İndirilen `ALT_LAS_Desktop_Portable_x.x.x.zip` dosyasını istediğiniz konuma çıkarın.
2. `ALT_LAS_Desktop.exe` dosyasını çalıştırın.

### macOS Portable

1. İndirilen `ALT_LAS_Desktop_Portable_x.x.x.zip` dosyasını istediğiniz konuma çıkarın.
2. `ALT_LAS_Desktop.app` uygulamasını çalıştırın.

## Kaldırma

### Windows

1. Başlat menüsü > Ayarlar > Uygulamalar > Uygulamalar ve özellikler bölümüne gidin.
2. Listeden "ALT_LAS Desktop" uygulamasını bulun.
3. "Kaldır" düğmesine tıklayın ve kaldırma sihirbazını takip edin.

Alternatif olarak, Denetim Masası > Programlar > Programlar ve Özellikler bölümünden de kaldırabilirsiniz.

### macOS

1. Uygulamalar klasörünü açın.
2. ALT_LAS uygulamasını bulun.
3. Uygulamayı Çöp Kutusu'na sürükleyin veya sağ tıklayıp "Çöp Kutusuna Taşı" seçeneğini seçin.
4. Çöp Kutusu'nu boşaltın.

Uygulama verilerini tamamen kaldırmak için:

```bash
rm -rf ~/Library/Application\ Support/ALT_LAS
```

### Linux

#### Debian/Ubuntu

```bash
sudo apt-get remove alt-las-desktop
```

#### Red Hat/Fedora

```bash
sudo rpm -e alt-las-desktop
```

Uygulama verilerini tamamen kaldırmak için:

```bash
rm -rf ~/.config/ALT_LAS
```

## Güncelleme

ALT_LAS Desktop UI, otomatik güncelleme özelliğine sahiptir. Yeni bir sürüm mevcut olduğunda, uygulama sizi bilgilendirecek ve güncellemeyi yüklemenizi isteyecektir.

### Otomatik Güncelleme

Varsayılan olarak, uygulama her başlatıldığında güncellemeleri kontrol eder. Bu ayarı değiştirmek için:

1. Ayarlar > Genel bölümüne gidin.
2. "Güncellemeleri otomatik olarak kontrol et" seçeneğini açın veya kapatın.
3. "Güncellemeleri otomatik olarak indir ve yükle" seçeneğini açın veya kapatın.

### Manuel Güncelleme

Güncellemeleri manuel olarak kontrol etmek için:

1. Yardım > Güncellemeleri Kontrol Et menüsüne tıklayın.
2. Yeni bir sürüm mevcutsa, "Güncelle" düğmesine tıklayın.

## Çoklu Sürüm Kurulumu

Farklı sürümleri yan yana kurmak mümkündür. Bunun için:

1. Farklı bir kurulum dizini seçin.
2. Portable sürümü kullanın.

Bu, test veya geliştirme amaçları için farklı sürümleri karşılaştırmak isteyenler için faydalı olabilir.

## Sorun Giderme

### Kurulum Sorunları

#### Windows

- **Hata: "Windows bu uygulamayı korudu"**: "Daha fazla bilgi" ve ardından "Yine de çalıştır" seçeneğini tıklayın.
- **Hata: "MSVCP140.dll eksik"**: [Visual C++ Redistributable](https://support.microsoft.com/en-us/help/2977003/the-latest-supported-visual-c-downloads) paketini yükleyin.

#### macOS

- **Hata: "Doğrulanmamış geliştirici"**: Ctrl tuşunu basılı tutarak uygulamaya tıklayın, ardından "Aç" seçeneğini seçin.
- **Hata: "Uygulama açılamıyor"**: Terminal'de `xattr -cr /Applications/ALT_LAS.app` komutunu çalıştırın.

#### Linux

- **Bağımlılık hataları**: `sudo apt-get install -f` (Debian/Ubuntu) veya `sudo dnf install --allowerasing` (Fedora) komutunu çalıştırın.
- **Çalıştırma izni hataları**: `chmod +x` komutunu kullanarak dosyaya çalıştırma izni verin.

### Kurulum Günlükleri

Kurulum sorunlarını gidermek için kurulum günlüklerini kontrol edebilirsiniz:

- **Windows**: `%TEMP%\ALT_LAS_Desktop_Install_Log.txt`
- **macOS**: `~/Library/Logs/ALT_LAS/install.log`
- **Linux**: `/var/log/alt-las-install.log`
