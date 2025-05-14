# ALT_LAS Kullanıcı Kılavuzu

Bu belge, ALT_LAS sisteminin kullanımı hakkında detaylı bilgiler içermektedir. Kurulum, yapılandırma ve temel kullanım senaryoları hakkında rehberlik sağlar.

## İçindekiler

1. [Giriş](#giriş)
2. [Kurulum](#kurulum)
3. [Başlarken](#başlarken)
4. [Temel Kullanım](#temel-kullanım)
5. [Çalışma Modları](#çalışma-modları)
6. [Persona Sistemi](#persona-sistemi)
7. [Arayüzler](#arayüzler)
8. [Gelişmiş Özellikler](#gelişmiş-özellikler)
9. [Sorun Giderme](#sorun-giderme)
10. [SSS](#sss)

## Giriş

ALT_LAS, bilgisayar sistemlerini yapay zeka ile yönetmek için tasarlanmış, modüler bir mikroservis mimarisi kullanan, açık kaynaklı ve ticari kullanıma uygun bir platformdur. Sistem, UI-TARS-desktop'ın kullanıcı arayüzü yetenekleri ile alt_last'ın bilgisayar yönetim özelliklerini birleştirerek daha güçlü bir çözüm sunmaktadır.

### Temel Özellikler

- Modüler mikroservis mimarisi
- Dosya tabanlı iş akışı (*.alt, *.last, *.atlas)
- Çoklu çalışma modları (Normal, Dream, Explore, Chaos)
- Persona sistemi ile kişiselleştirilmiş deneyim
- Masaüstü, web ve mobil arayüzler
- İşletim sistemi entegrasyonu
- Yerel AI modelleri ile düşük gecikme süresi
- Güvenli sandbox izolasyonu

## Kurulum

### Sistem Gereksinimleri

- **İşletim Sistemi**: Windows 10/11, macOS 10.15+, Ubuntu 20.04+
- **İşlemci**: 4 çekirdekli, 2.5 GHz+
- **RAM**: En az 8 GB (16 GB önerilir)
- **Disk**: En az 10 GB boş alan
- **GPU**: AI modelleri için NVIDIA/AMD GPU (opsiyonel)
- **İnternet**: Yüksek hızlı internet bağlantısı

### Kurulum Adımları

#### Windows

1. [ALT_LAS Windows Installer](https://example.com/alt_las_windows.exe) indirin
2. İndirilen dosyayı çalıştırın ve kurulum sihirbazını takip edin
3. Kurulum tamamlandığında, ALT_LAS masaüstü uygulamasını başlatın

#### macOS

1. [ALT_LAS macOS Installer](https://example.com/alt_las_macos.dmg) indirin
2. DMG dosyasını açın ve ALT_LAS uygulamasını Applications klasörüne sürükleyin
3. Uygulamalar klasöründen ALT_LAS'ı başlatın

#### Linux

1. Terminal açın ve aşağıdaki komutları çalıştırın:

```bash
# Repository ekleyin
curl -s https://example.com/alt_las_repo.gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://example.com/apt stable main"

# Paketi yükleyin
sudo apt update
sudo apt install alt-las

# Uygulamayı başlatın
alt-las
```

### Docker ile Kurulum

Geliştiriciler için Docker ile kurulum:

```bash
# Repoyu klonlayın
git clone https://github.com/krozenking/ALT_LAS.git
cd ALT_LAS

# Docker Compose ile başlatın
docker-compose up -d
```

## Başlarken

### İlk Çalıştırma

ALT_LAS'ı ilk kez çalıştırdığınızda, kurulum sihirbazı sizi karşılayacaktır:

1. Dil seçimi yapın
2. Kullanıcı hesabı oluşturun
3. Çalışma modunu seçin (Normal, Dream, Explore, Chaos)
4. Persona seçimi yapın
5. Sistem izinlerini onaylayın
6. Başlangıç eğitimini tamamlayın

### Ana Ekran

Ana ekran aşağıdaki bölümlerden oluşur:

- **Komut Çubuğu**: Komutlarınızı yazabileceğiniz alan
- **Görev Paneli**: Aktif ve tamamlanmış görevlerin listesi
- **Sonuç Alanı**: Komut çıktılarının gösterildiği alan
- **Durum Çubuğu**: Sistem durumu ve bildirimler
- **Ayarlar**: Sistem ayarlarına erişim

## Temel Kullanım

### Komut Gönderme

Komut çubuğuna istediğiniz görevi yazın ve Enter tuşuna basın:

```
Masaüstündeki dosyaları düzenle ve önemli belgeleri bir klasöre taşı
```

### Görev İzleme

Gönderdiğiniz komutlar Görev Panelinde listelenir. Her görevin durumunu ve ilerlemesini buradan takip edebilirsiniz.

### Sonuçları Görüntüleme

Tamamlanan görevlerin sonuçları Sonuç Alanında gösterilir. Sonuçları kaydedebilir veya paylaşabilirsiniz.

### Temel Komut Örnekleri

```
Dosyalarımı türlerine göre düzenle
```

```
Son 1 haftada oluşturduğum belgeleri bul ve özetini çıkar
```

```
Bilgisayarımı optimize et ve gereksiz dosyaları temizle
```

```
Tarayıcımdaki açık sekmeleri organize et ve benzer içerikleri grupla
```

## Çalışma Modları

ALT_LAS, dört farklı çalışma moduna sahiptir:

### Normal Mod

Standart görev işleme ve sistem yönetimi modu. Günlük kullanım için idealdir.

**Örnek Komut**:
```
E-postalarımı kontrol et ve önemli olanları işaretle
```

### Dream Mod

Test senaryoları, log analizi ve otomatik optimizasyon için kullanılır. Sistem performansını iyileştirmek istediğinizde kullanabilirsiniz.

**Örnek Komut**:
```
Bilgisayarımın performansını analiz et ve iyileştirme önerileri sun
```

### Explore Mod

Varyasyon analizi ve alternatif çözüm keşfi için kullanılır. Yaratıcı çözümler aradığınızda faydalıdır.

**Örnek Komut**:
```
Sunum dosyamı farklı tasarım alternatifleriyle yeniden düzenle
```

### Chaos Mod

Yaratıcı düşünme ve farklı bakış açıları için kullanılır. Chaos Level (1-4) ile kontrol edilebilir.

**Örnek Komut**:
```
Chaos level 3 ile yeni bir logo tasarımı için fikirler üret
```

## Persona Sistemi

ALT_LAS, farklı kişilik özellikleriyle çalışabilir:

### empathetic_assistant

Empatik ve yardımsever bir asistan personası. Kullanıcı deneyimini ön planda tutar.

**Örnek Komut**:
```
empathetic_assistant personası ile günlük planımı oluştur
```

### technical_expert

Teknik detaylara odaklanan uzman personası. Karmaşık teknik görevler için idealdir.

**Örnek Komut**:
```
technical_expert personası ile ağ ayarlarımı optimize et
```

### creative_designer

Yaratıcı ve estetik odaklı tasarımcı personası. Görsel içerik oluşturma için uygundur.

**Örnek Komut**:
```
creative_designer personası ile sosyal medya gönderisi hazırla
```

### security_focused

Güvenlik odaklı personası. Sistem güvenliği ve veri koruma için idealdir.

**Örnek Komut**:
```
security_focused personası ile bilgisayarımda güvenlik taraması yap
```

### efficiency_optimizer

Verimlilik odaklı personası. Süreçleri optimize etmek için kullanılır.

**Örnek Komut**:
```
efficiency_optimizer personası ile çalışma akışımı iyileştir
```

### learning_tutor

Öğretici personası. Yeni konuları öğrenmek için idealdir.

**Örnek Komut**:
```
learning_tutor personası ile Python programlama dilini öğrenmeme yardımcı ol
```

## Arayüzler

ALT_LAS, üç farklı arayüz sunar:

### Masaüstü Uygulaması

Tam özellikli masaüstü uygulaması, sistem tepsisi entegrasyonu ve kısayol desteği ile.

**Özellikler**:
- Tam sistem entegrasyonu
- Kısayol tuşları (Alt+Space ile hızlı erişim)
- Sistem tepsisi bildirimleri
- Offline çalışma modu

### Web Dashboard

Web tarayıcısı üzerinden erişilebilen dashboard.

**Özellikler**:
- Görev izleme ve yönetim
- Analitik ve raporlar
- Ayarlar ve yapılandırma
- Uzaktan erişim

### Mobil Uygulama

iOS ve Android için mobil uygulama.

**Özellikler**:
- Bildirimler ve uzaktan kontrol
- Sesli komut desteği
- Kamera ve sensör entegrasyonu
- Senkronizasyon

## Gelişmiş Özellikler

### Zamanlanmış Görevler

Görevleri belirli zamanlarda otomatik olarak çalıştırabilirsiniz:

```
Her gün saat 18:00'de e-postalarımı kontrol et ve özetini hazırla
```

### Koşullu Görevler

Belirli koşullara bağlı görevler oluşturabilirsiniz:

```
Disk alanı %90'ın üzerine çıkarsa gereksiz dosyaları temizle
```

### Makrolar ve Otomasyon

Sık kullanılan görev dizilerini makro olarak kaydedebilirsiniz:

```
"Gün sonu özeti" makrosunu çalıştır
```

### Çoklu Cihaz Senkronizasyonu

Ayarlarınızı ve görevlerinizi cihazlar arasında senkronize edebilirsiniz.

### Veri Analizi ve Raporlama

Sistem kullanımı ve görev performansı hakkında detaylı raporlar alabilirsiniz.

## Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

#### Uygulama Başlatma Sorunu

**Sorun**: Uygulama başlatılamıyor veya hemen kapanıyor.

**Çözüm**:
1. Uygulamayı yönetici olarak çalıştırın
2. Güncel sürümü kullandığınızdan emin olun
3. Sistem gereksinimlerini kontrol edin
4. Log dosyalarını inceleyin: `~/.alt_las/logs/`

#### Komut İşleme Hatası

**Sorun**: Komutlar işlenmiyor veya hata veriyor.

**Çözüm**:
1. İnternet bağlantınızı kontrol edin
2. Servis durumunu kontrol edin: Ayarlar > Sistem > Servis Durumu
3. Uygulamayı yeniden başlatın
4. Geçici dosyaları temizleyin: Ayarlar > Sistem > Temizlik

#### Performans Sorunları

**Sorun**: Uygulama yavaş çalışıyor veya donuyor.

**Çözüm**:
1. Sistem kaynaklarını kontrol edin
2. Arka plan görevlerini kapatın
3. AI model boyutunu küçültün: Ayarlar > AI > Model Boyutu
4. Önbelleği temizleyin: Ayarlar > Sistem > Önbellek Temizleme

### Log Dosyaları

Log dosyaları aşağıdaki konumlarda bulunur:

- **Windows**: `C:\Users\<username>\AppData\Roaming\ALT_LAS\logs\`
- **macOS**: `~/Library/Application Support/ALT_LAS/logs/`
- **Linux**: `~/.alt_las/logs/`

### Destek Alma

Sorun yaşadığınızda aşağıdaki kanallardan destek alabilirsiniz:

- **Dokümantasyon**: [docs.alt-las.com](https://docs.alt-las.com)
- **Forum**: [community.alt-las.com](https://community.alt-las.com)
- **E-posta**: support@alt-las.com
- **Uygulama İçi Destek**: Ayarlar > Yardım > Destek Talebi

## SSS

### Genel Sorular

**S: ALT_LAS internet olmadan çalışır mı?**

C: Evet, temel özellikler internet olmadan da çalışır, ancak bazı gelişmiş AI özellikleri internet bağlantısı gerektirebilir.

**S: ALT_LAS verilerimi nerede saklar?**

C: Verileriniz yerel olarak cihazınızda saklanır. Senkronizasyon özelliğini etkinleştirirseniz, şifrelenmiş veriler bulut depolama alanında da saklanabilir.

**S: ALT_LAS hangi dilleri destekler?**

C: ALT_LAS şu anda Türkçe, İngilizce, Almanca, Fransızca, İspanyolca ve Japonca dillerini desteklemektedir.

### Teknik Sorular

**S: Sistem kaynaklarını nasıl optimize edebilirim?**

C: Ayarlar > Sistem > Performans menüsünden AI model boyutunu, önbellek kullanımını ve paralel işlem sayısını ayarlayabilirsiniz.

**S: Özel AI modelleri ekleyebilir miyim?**

C: Evet, Ayarlar > AI > Modeller menüsünden özel AI modelleri ekleyebilirsiniz.

**S: Verilerimi nasıl yedekleyebilirim?**

C: Ayarlar > Sistem > Yedekleme menüsünden manuel yedekleme yapabilir veya otomatik yedeklemeyi etkinleştirebilirsiniz.

### Lisans ve Gizlilik

**S: ALT_LAS ticari kullanım için ücretsiz mi?**

C: ALT_LAS'ın temel sürümü ücretsizdir, ancak gelişmiş özellikler için ticari lisans gerekebilir.

**S: ALT_LAS verilerimi topluyor mu?**

C: ALT_LAS, yalnızca sistem performansını iyileştirmek için anonim kullanım istatistikleri toplar. Bu özelliği Ayarlar > Gizlilik menüsünden devre dışı bırakabilirsiniz.

**S: ALT_LAS'ı kendi uygulamama entegre edebilir miyim?**

C: Evet, ALT_LAS API'si aracılığıyla kendi uygulamanıza entegre edebilirsiniz. Detaylı bilgi için API dokümantasyonuna bakın.
