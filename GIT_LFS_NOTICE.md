# Git LFS Kullanımı Hakkında Önemli Duyuru

Değerli ALT_LAS Proje Ekibi,

Projemizde büyük dosyaların daha verimli yönetilmesi için **Git Large File Storage (LFS)** sistemine geçiş yapılmıştır. Bu duyuru, tüm çalışanlar için Git LFS kullanımı hakkında bilgilendirme amacıyla hazırlanmıştır.

## Git LFS Nedir?

Git LFS, büyük dosyaları (binary dosyalar, derlenmiş dosyalar, görüntüler vb.) Git deposunda daha verimli bir şekilde yönetmek için kullanılan bir uzantıdır. Normal Git, metin dosyaları için optimize edilmiştir ve büyük binary dosyalar için performans sorunları yaşanabilir.

## Neden Git LFS'e Geçiyoruz?

- GitHub'ın dosya boyutu sınırlamaları (50MB önerilen maksimum)
- Derleme çıktıları ve binary dosyaların daha verimli yönetimi
- Depo boyutunun küçültülmesi ve klonlama/çekme işlemlerinin hızlandırılması
- Daha iyi versiyon kontrolü ve performans

## Git LFS Tarafından İzlenen Dosya Türleri

Aşağıdaki dosya türleri artık Git LFS tarafından izlenmektedir:

- `*.exe` - Çalıştırılabilir dosyalar
- `*.dll` - Windows dinamik bağlantı kütüphaneleri
- `*.so` - Linux paylaşılan nesneler
- `*.dylib` - macOS dinamik kütüphaneler
- `*.a` - Statik kütüphaneler
- `*.o` - Nesne dosyaları
- `target/debug/deps/*` - Rust debug derleme çıktıları
- `target/release/deps/*` - Rust release derleme çıktıları

## Kurulum ve Kullanım

Her çalışanın kendi geliştirme ortamında Git LFS'i kurması ve yapılandırması gerekmektedir:

1. **Git LFS Kurulumu**:
   ```bash
   # Debian/Ubuntu
   sudo apt-get install git-lfs
   
   # macOS (Homebrew)
   brew install git-lfs
   
   # Windows (Git Bash)
   # https://git-lfs.github.com/ adresinden indirip kurabilirsiniz
   ```

2. **Git LFS'i Etkinleştirme**:
   ```bash
   git lfs install
   ```

3. **Depoyu Klonlama veya Güncelleme**:
   ```bash
   # Yeni klonlama
   git clone https://github.com/krozenking/ALT_LAS.git
   
   # Mevcut depoyu güncelleme
   git pull
   ```

## Önemli Notlar

- Büyük dosyaları commit etmeden önce Git LFS'in kurulu olduğundan emin olun
- `.gitattributes` dosyasını değiştirmeyin, bu dosya Git LFS yapılandırmasını içerir
- Sorun yaşarsanız, İşçi 6 ile iletişime geçebilirsiniz

## Şu Ana Kadar Katkıda Bulunan Çalışanlar

Şu ana kadar depoya katkıda bulunan çalışanlar:
- ALT_LAS Developer
- İşçi 6

Diğer çalışanların (İşçi 1-5, İşçi 7-8) da en kısa sürede katkıda bulunmalarını bekliyoruz.

---

Bu duyuru İşçi 6 tarafından hazırlanmıştır.
Tarih: 24 Nisan 2025
