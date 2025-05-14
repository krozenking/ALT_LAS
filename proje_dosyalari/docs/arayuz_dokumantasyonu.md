# ALT_LAS Arayüz Dokümantasyonu

Bu belge, ALT_LAS projesinin arayüz bileşenlerini, etkileşim modellerini ve kullanım senaryolarını detaylı olarak açıklamaktadır.

## İçindekiler

1. [Arayüz Mimarisi](#arayüz-mimarisi)
2. [Ana Bileşenler](#ana-bileşenler)
3. [Etkileşim Modelleri](#etkileşim-modelleri)
4. [Tema Sistemi](#tema-sistemi)
5. [Erişilebilirlik](#erişilebilirlik)
6. [Performans Optimizasyonu](#performans-optimizasyonu)
7. [Mobil Uyumluluk](#mobil-uyumluluk)
8. [Kullanım Senaryoları](#kullanım-senaryoları)
9. [Arayüz Geliştirme Kılavuzu](#arayüz-geliştirme-kılavuzu)

## Arayüz Mimarisi

ALT_LAS arayüzü, modüler ve bileşen tabanlı bir mimari kullanmaktadır. Arayüz, aşağıdaki katmanlardan oluşmaktadır:

### Sunum Katmanı

- **React.js**: Kullanıcı arayüzü bileşenleri
- **Redux**: Durum yönetimi
- **Styled Components**: CSS-in-JS stilendirme
- **React Router**: Sayfa yönlendirme

### İş Mantığı Katmanı

- **Servis Adaptörleri**: API Gateway ile iletişim
- **Durum Yöneticileri**: Uygulama durumu ve veri akışı
- **Komut İşleyicileri**: Kullanıcı komutlarını işleme

### Veri Erişim Katmanı

- **API İstemcileri**: RESTful API çağrıları
- **WebSocket İstemcileri**: Gerçek zamanlı iletişim
- **Yerel Depolama**: Kullanıcı tercihleri ve önbellek

## Ana Bileşenler

### 1. Komut Çubuğu

Komut Çubuğu, kullanıcıların doğal dil komutlarını girmelerini sağlayan ana etkileşim noktasıdır.

**Özellikler**:
- Otomatik tamamlama
- Komut geçmişi
- Bağlam farkındalığı
- Zengin metin desteği
- Emoji ve özel karakter desteği

**Etkileşim**:
- Klavye kısayolu: `Alt+Space`
- Ses girişi: Mikrofon ikonuna tıklama
- Komut gönderme: `Enter` tuşu

### 2. Panel Sistemi

Panel Sistemi, farklı içerik ve işlevleri organize etmek için kullanılan esnek bir düzen sistemidir.

**Özellikler**:
- Sürükle-bırak düzenleme
- Yeniden boyutlandırma
- Panel grupları ve sekmeler
- Düzen kaydetme/yükleme
- Tam ekran modu

**Panel Türleri**:
- Sonuç Paneli
- Görev Paneli
- Dosya Gezgini
- Terminal
- Editör
- Medya Oynatıcı
- Dashboard

### 3. Chat Arayüzü

Chat Arayüzü, kullanıcıların AI ile doğal bir sohbet deneyimi yaşamasını sağlar.

**Özellikler**:
- Mesaj geçmişi
- Dosya paylaşımı
- Kod vurgulama
- Markdown desteği
- Medya gömme

**Etkileşim**:
- Mesaj gönderme: `Enter` tuşu
- Yeni satır: `Shift+Enter`
- Dosya ekleme: Sürükle-bırak veya ataç ikonu

### 4. Görev Paneli

Görev Paneli, aktif ve tamamlanmış görevlerin izlenmesini sağlar.

**Özellikler**:
- Görev durumu göstergeleri
- İlerleme çubukları
- Görev detayları
- Görev filtreleme ve sıralama
- Görev gruplandırma

**Etkileşim**:
- Görev detayları: Görev kartına tıklama
- Görev iptal: İptal ikonuna tıklama
- Görev yeniden çalıştırma: Yeniden çalıştır ikonuna tıklama

### 5. Sonuç Alanı

Sonuç Alanı, komut çıktılarının gösterildiği alandır.

**Özellikler**:
- Zengin içerik gösterimi
- Kod vurgulama
- Medya oynatma
- İnteraktif sonuçlar
- Sonuç paylaşımı

**Etkileşim**:
- Sonuç kopyalama: Kopyala ikonuna tıklama
- Sonuç paylaşma: Paylaş ikonuna tıklama
- Sonuç kaydetme: Kaydet ikonuna tıklama

### 6. Ayarlar Menüsü

Ayarlar Menüsü, kullanıcıların sistem ayarlarını yapılandırmasını sağlar.

**Kategoriler**:
- Genel Ayarlar
- Tema ve Görünüm
- Dil ve Bölge
- Kısayollar
- Gizlilik ve Güvenlik
- AI ve Modeller
- Gelişmiş Ayarlar

**Etkileşim**:
- Ayar değiştirme: İlgili kontrolleri kullanma
- Ayarları sıfırlama: Sıfırla düğmesine tıklama
- Ayarları kaydetme: Kaydet düğmesine tıklama

## Etkileşim Modelleri

### Klavye Kısayolları

| Kısayol | İşlev |
|---------|-------|
| `Alt+Space` | Komut Çubuğunu Aç/Kapat |
| `Ctrl+Shift+P` | Komut Paleti |
| `Ctrl+Tab` | Paneller Arası Geçiş |
| `Ctrl+Shift+S` | Düzeni Kaydet |
| `Ctrl+Shift+L` | Düzeni Yükle |
| `F11` | Tam Ekran Modu |
| `Esc` | Geçerli İşlemi İptal Et |
| `Ctrl+Z` | Geri Al |
| `Ctrl+Shift+Z` | Yinele |
| `Ctrl+F` | Ara |
| `Ctrl+S` | Kaydet |
| `Ctrl+O` | Aç |
| `Ctrl+N` | Yeni |
| `Ctrl+W` | Kapat |
| `Ctrl+Q` | Çıkış |

### Dokunmatik Etkileşimler

| Hareket | İşlev |
|---------|-------|
| Tek Dokunma | Öğe Seçme |
| Çift Dokunma | Öğe Açma |
| Uzun Basma | Bağlam Menüsü |
| Kaydırma | Sayfa/Liste Kaydırma |
| Sıkıştırma/Genişletme | Yakınlaştırma/Uzaklaştırma |
| İki Parmakla Kaydırma | Panel Yeniden Boyutlandırma |
| Üç Parmakla Kaydırma | Panel Taşıma |
| Dört Parmakla Kaydırma | Çalışma Alanları Arası Geçiş |

### Ses Komutları

| Komut | İşlev |
|-------|-------|
| "Hey Atlas" | Ses Asistanını Etkinleştir |
| "Komut [komut metni]" | Komut Çalıştır |
| "Aç [panel adı]" | Panel Aç |
| "Kapat [panel adı]" | Panel Kapat |
| "Kaydet" | Geçerli İçeriği Kaydet |
| "Geri Al" | Son İşlemi Geri Al |
| "Yardım" | Yardım Menüsünü Aç |
| "Çıkış" | Uygulamadan Çık |

## Tema Sistemi

ALT_LAS, kapsamlı bir tema sistemi sunmaktadır:

### Yerleşik Temalar

- **Açık Tema**: Beyaz arka plan, koyu metin
- **Koyu Tema**: Koyu arka plan, açık metin
- **Mavi Tema**: Mavi tonları ağırlıklı tema
- **Yeşil Tema**: Yeşil tonları ağırlıklı tema
- **Mor Tema**: Mor tonları ağırlıklı tema
- **Yüksek Kontrast**: Erişilebilirlik odaklı yüksek kontrast tema

### Mod Temaları

- **Normal Mod**: Standart, profesyonel arayüz
- **Dream Mod**: Mavi tonları, yumuşak geçişler
- **Explore Mod**: Yeşil tonları, dinamik animasyonlar
- **Chaos Mod**: Canlı renkler, sıra dışı animasyonlar

### Tema Özelleştirme

Kullanıcılar aşağıdaki tema öğelerini özelleştirebilir:

- Ana Renk
- Vurgu Rengi
- Arka Plan Rengi
- Metin Rengi
- Yazı Tipi
- Yazı Tipi Boyutu
- Kenar Yuvarlaklığı
- Animasyon Hızı
- Glassmorphism Efekti
- Gölge Efekti

## Erişilebilirlik

ALT_LAS, WCAG 2.1 AA seviyesi erişilebilirlik standartlarını karşılamayı hedeflemektedir:

### Erişilebilirlik Özellikleri

- **Klavye Erişimi**: Tüm işlevler klavye ile erişilebilir
- **Ekran Okuyucu Desteği**: ARIA etiketleri ve uygun semantik HTML
- **Yüksek Kontrast Modu**: Görme zorluğu yaşayanlar için
- **Metin Boyutu Ayarı**: Yazı tipi boyutunu büyütme
- **Animasyon Kontrolü**: Animasyonları azaltma veya devre dışı bırakma
- **Renk Körlüğü Modu**: Renk körlerine uygun renk şemaları
- **Ses Bildirimleri**: Görsel bildirimlere ek olarak ses bildirimleri
- **Ses Komutları**: Ses ile kontrol

## Performans Optimizasyonu

Arayüz performansını optimize etmek için aşağıdaki teknikler kullanılmaktadır:

- **Kod Bölme**: Talep üzerine yüklenen bileşenler
- **Sanal Listeleme**: Büyük veri setleri için verimli görüntüleme
- **Önbellek Stratejileri**: API yanıtları ve hesaplama sonuçları için önbellek
- **Tembel Yükleme**: Görünür olmayan içerik için tembel yükleme
- **Memoizasyon**: Pahalı hesaplamaların sonuçlarını önbelleğe alma
- **Görüntü Optimizasyonu**: Verimli görüntü formatları ve boyutları
- **CSS Optimizasyonu**: Kritik CSS ve CSS-in-JS optimizasyonu
- **Web Worker**: Arka plan işlemleri için web worker kullanımı

## Mobil Uyumluluk

ALT_LAS arayüzü, farklı ekran boyutları ve cihazlar için optimize edilmiştir:

### Responsive Tasarım

- **Esnek Grid Sistemi**: Farklı ekran boyutlarına uyum sağlayan grid
- **Medya Sorguları**: Ekran boyutuna göre stil değişiklikleri
- **Görüntü Ölçeklendirme**: Ekran çözünürlüğüne göre görüntü optimizasyonu
- **Dokunmatik Hedef Boyutları**: Mobil cihazlar için uygun dokunmatik hedef boyutları

### Mobil Özel Özellikler

- **Mobil Navigasyon**: Mobil cihazlar için optimize edilmiş navigasyon
- **Offline Modu**: İnternet bağlantısı olmadan temel işlevleri kullanabilme
- **Düşük Bant Genişliği Modu**: Veri kullanımını azaltan mod
- **Cihaz Sensör Entegrasyonu**: Kamera, mikrofon, GPS gibi sensörlerin kullanımı

## Kullanım Senaryoları

### Senaryo 1: Dosya Organizasyonu

**Kullanıcı Hedefi**: Dağınık dosyaları düzenlemek

**Adımlar**:
1. Komut Çubuğuna "Masaüstündeki dosyaları türlerine göre düzenle" yazın
2. Enter tuşuna basın
3. Görev Panelinde işlemin ilerlemesini izleyin
4. Sonuç Alanında düzenlenen dosyaların raporunu görüntüleyin
5. Raporu kaydetmek için Kaydet ikonuna tıklayın

### Senaryo 2: Metin Analizi

**Kullanıcı Hedefi**: Bir belgenin özetini çıkarmak

**Adımlar**:
1. Belgeyi sürükleyip Chat Arayüzüne bırakın
2. "Bu belgeyi özetle ve ana noktaları vurgula" yazın
3. Enter tuşuna basın
4. Sonuç Alanında belgenin özetini görüntüleyin
5. Özeti kopyalamak için Kopyala ikonuna tıklayın

### Senaryo 3: Sistem Optimizasyonu

**Kullanıcı Hedefi**: Bilgisayar performansını iyileştirmek

**Adımlar**:
1. Komut Çubuğuna "Bilgisayarımı optimize et" yazın
2. Enter tuşuna basın
3. Görev Panelinde optimizasyon adımlarını izleyin
4. Sonuç Alanında optimizasyon raporunu görüntüleyin
5. Önerilen ek optimizasyonları uygulamak için "Önerileri uygula" düğmesine tıklayın

## Arayüz Geliştirme Kılavuzu

### Bileşen Geliştirme

Yeni bir bileşen geliştirirken aşağıdaki adımları izleyin:

1. Bileşen gereksinimlerini belirleyin
2. Bileşen tasarımını oluşturun
3. Bileşen arayüzünü (props, events) tanımlayın
4. Bileşeni geliştirin
5. Birim testleri yazın
6. Bileşeni dokümante edin
7. Bileşeni gözden geçirin
8. Bileşeni entegre edin

### Stil Kılavuzu

Tutarlı bir arayüz için aşağıdaki stil kurallarına uyun:

- **Renk Paleti**: Tema renk paletini kullanın
- **Tipografi**: Tanımlı yazı tipi hiyerarşisini kullanın
- **Boşluk**: Tutarlı boşluk ölçülerini kullanın
- **Bileşen Boyutları**: Standart bileşen boyutlarını kullanın
- **İkonlar**: İkon kütüphanesinden tutarlı ikonlar kullanın
- **Animasyonlar**: Tanımlı animasyon eğrilerini ve sürelerini kullanın

### Performans İpuçları

- Gereksiz yeniden render'ları önleyin
- Büyük listeler için sanal listeleme kullanın
- Ağır hesaplamalar için memoizasyon kullanın
- Görüntüleri optimize edin
- Kritik olmayan içerik için tembel yükleme kullanın
- Arka plan işlemleri için web worker kullanın

### Erişilebilirlik Kontrol Listesi

- Tüm etkileşimli öğeler için klavye erişimi sağlayın
- Tüm görüntüler için alternatif metin ekleyin
- Renk kontrastını WCAG AA standartlarına göre kontrol edin
- Semantik HTML kullanın
- ARIA etiketleri ekleyin
- Ekran okuyucu ile test edin
- Klavye ile test edin
- Yüksek kontrast modunda test edin
