# Arayüz Tanıtımı

**Versiyon:** 2.0.0  
**Son Güncelleme:** 16 Haziran 2025  
**Hazırlayan:** Ayşe Demir (UX/UI Tasarımcısı)

Bu bölümde, ALT_LAS kullanıcı arayüzünün genel yapısını ve temel bileşenlerini tanıtacağız. ALT_LAS arayüzü, kullanıcı dostu ve sezgisel bir tasarıma sahiptir. Arayüz, aşağıdaki temel bileşenlerden oluşmaktadır:

## 1. Ana Sayfa

Ana sayfa, ALT_LAS'a giriş yaptığınızda karşınıza çıkan ilk ekrandır. Bu ekranda, sistemin genel durumunu gösteren bir gösterge paneli (dashboard) bulunmaktadır.

![Ana Sayfa](../assets/home-screen.png)

Ana sayfada aşağıdaki bileşenler bulunmaktadır:

### 1.1. Özet Kartları

Özet kartları, sistemin genel durumunu hızlıca görmenizi sağlar. Bu kartlarda aşağıdaki bilgiler yer alır:

- **Aktif İşler**: Şu anda çalışan işlerin sayısı
- **Bekleyen İşler**: Sırada bekleyen işlerin sayısı
- **Tamamlanan İşler**: Son 24 saat içinde tamamlanan işlerin sayısı
- **Başarısız İşler**: Son 24 saat içinde başarısız olan işlerin sayısı
- **Disk Kullanımı**: Arşiv servisinin disk kullanım oranı
- **CPU Kullanımı**: Sistem genelinde CPU kullanım oranı

### 1.2. Son İşler

Son işler bölümünde, en son oluşturulan veya güncellenen işlerin listesi bulunmaktadır. Her iş için aşağıdaki bilgiler gösterilir:

- İş ID'si
- İş türü (Segmentasyon, Analiz, Eğitim)
- Durum (Bekliyor, İşleniyor, Tamamlandı, Başarısız)
- Oluşturulma zamanı
- Son güncelleme zamanı

### 1.3. Sistem Durumu

Sistem durumu bölümünde, ALT_LAS'ın çeşitli bileşenlerinin durumu gösterilir. Her bileşen için bir durum göstergesi (yeşil, sarı, kırmızı) bulunmaktadır.

### 1.4. Hızlı Erişim

Hızlı erişim bölümünde, sık kullanılan işlevlere hızlıca erişmenizi sağlayan düğmeler bulunmaktadır:

- Yeni Segmentasyon İşi Oluştur
- Arşive Git
- Raporları Görüntüle
- Ayarları Aç

## 2. Üst Menü

Üst menü, ekranın en üstünde yer alan ve her sayfada görünen bir menüdür. Bu menüde aşağıdaki öğeler bulunmaktadır:

![Üst Menü](../assets/top-menu.png)

### 2.1. Logo

Sol üst köşede ALT_LAS logosu bulunmaktadır. Logoya tıkladığınızda ana sayfaya yönlendirilirsiniz.

### 2.2. Arama Kutusu

Üst menünün ortasında bir arama kutusu bulunmaktadır. Bu kutuya anahtar kelimeler yazarak sistem genelinde arama yapabilirsiniz. Arama sonuçları, aşağıdaki kategorilere ayrılmış olarak gösterilir:

- İşler
- Dosyalar
- Kullanıcılar
- Modeller
- Ayarlar

### 2.3. Bildirimler

Üst menünün sağ tarafında bir bildirim zili simgesi bulunmaktadır. Bu simgeye tıkladığınızda, son bildirimleri görüntüleyebilirsiniz. Okunmamış bildirimler, simgenin üzerinde bir sayı ile gösterilir.

### 2.4. Kullanıcı Menüsü

En sağda, kullanıcı adınız ve profil resminiz bulunmaktadır. Bu öğeye tıkladığınızda, aşağıdaki seçenekleri içeren bir menü açılır:

- Profil
- Ayarlar
- Yardım
- Çıkış

## 3. Yan Menü

Yan menü, ekranın sol tarafında yer alan ve her sayfada görünen bir menüdür. Bu menüde, sistemin ana bölümlerine erişim sağlayan düğmeler bulunmaktadır.

![Yan Menü](../assets/side-menu.png)

### 3.1. Ana Sayfa

Ana sayfaya erişim sağlar.

### 3.2. Segmentasyon

Segmentasyon bölümüne erişim sağlar. Bu bölümde, segmentasyon işleri oluşturabilir, yönetebilir ve sonuçları görüntüleyebilirsiniz.

### 3.3. İş Yönetimi

İş yönetimi bölümüne erişim sağlar. Bu bölümde, tüm işleri (segmentasyon, analiz, eğitim) listeleyebilir, filtreleyebilir ve yönetebilirsiniz.

### 3.4. Arşiv

Arşiv bölümüne erişim sağlar. Bu bölümde, arşivlenen dosyaları listeleyebilir, arayabilir, indirebilir ve yönetebilirsiniz.

### 3.5. AI Modelleri

AI modelleri bölümüne erişim sağlar. Bu bölümde, yapay zeka modellerini listeleyebilir, oluşturabilir, eğitebilir, dağıtabilir ve yönetebilirsiniz.

### 3.6. Raporlama

Raporlama bölümüne erişim sağlar. Bu bölümde, sistem genelinde çeşitli raporlar oluşturabilir ve görüntüleyebilirsiniz.

### 3.7. Ayarlar

Ayarlar bölümüne erişim sağlar. Bu bölümde, sistem ayarlarını yapılandırabilirsiniz.

### 3.8. Yardım

Yardım bölümüne erişim sağlar. Bu bölümde, kullanıcı kılavuzu, sık sorulan sorular ve video eğitimleri bulunmaktadır.

## 4. İçerik Alanı

İçerik alanı, ekranın ana bölümüdür ve seçilen menü öğesine göre değişen içeriği gösterir. İçerik alanının yapısı, görüntülenen bölüme göre değişiklik gösterir, ancak genel olarak aşağıdaki bileşenleri içerir:

![İçerik Alanı](../assets/content-area.png)

### 4.1. Başlık

İçerik alanının en üstünde, mevcut bölümün başlığı bulunmaktadır.

### 4.2. Eylem Düğmeleri

Başlığın yanında, mevcut bölümle ilgili eylemleri gerçekleştirmenizi sağlayan düğmeler bulunmaktadır. Örneğin, "Yeni Oluştur", "İçe Aktar", "Dışa Aktar" gibi.

### 4.3. Filtreler

Bazı bölümlerde, içeriği filtrelemenizi sağlayan filtre seçenekleri bulunmaktadır. Filtreler, içerik alanının üst kısmında yer alır.

### 4.4. Ana İçerik

İçerik alanının ana kısmı, seçilen bölüme göre değişen içeriği gösterir. Bu içerik, tablolar, formlar, grafikler, kartlar veya diğer UI bileşenleri olabilir.

### 4.5. Sayfalama

Listeleme ekranlarında, içeriğin sayfalar halinde görüntülenmesini sağlayan sayfalama kontrolleri bulunmaktadır. Bu kontroller, içerik alanının alt kısmında yer alır.

## 5. Formlar ve Diyaloglar

ALT_LAS'ta çeşitli işlemleri gerçekleştirmek için formlar ve diyaloglar kullanılmaktadır. Bu bileşenler, kullanıcı dostu bir tasarıma sahiptir ve adım adım talimatlar içerir.

![Form Örneği](../assets/form-example.png)

### 5.1. Formlar

Formlar, veri girişi yapmanızı sağlayan bileşenlerdir. Formlar, aşağıdaki öğeleri içerebilir:

- Metin kutuları
- Açılır listeler
- Onay kutuları
- Radyo düğmeleri
- Dosya yükleyiciler
- Tarih seçiciler
- Zaman seçiciler
- Kaydırıcılar
- Renk seçiciler

### 5.2. Diyaloglar

Diyaloglar, belirli bir işlemi gerçekleştirmek veya bilgi göstermek için açılan pencerelerdir. Diyaloglar, aşağıdaki türlerde olabilir:

- Bilgi diyalogları
- Onay diyalogları
- Uyarı diyalogları
- Hata diyalogları
- Form diyalogları
- Çoklu adım diyalogları

## 6. Bildirimler ve Uyarılar

ALT_LAS, çeşitli bildirimler ve uyarılar aracılığıyla sizi bilgilendirir. Bu bildirimler, aşağıdaki türlerde olabilir:

![Bildirim Örneği](../assets/notification-example.png)

### 6.1. Başarı Bildirimleri

Yeşil renkli bildirimler, bir işlemin başarıyla tamamlandığını gösterir.

### 6.2. Bilgi Bildirimleri

Mavi renkli bildirimler, bilgilendirme amaçlı mesajları gösterir.

### 6.3. Uyarı Bildirimleri

Sarı renkli bildirimler, dikkat edilmesi gereken durumları gösterir.

### 6.4. Hata Bildirimleri

Kırmızı renkli bildirimler, bir hata oluştuğunu gösterir.

## 7. Klavye Kısayolları

ALT_LAS, çeşitli klavye kısayolları sunarak işlerinizi daha hızlı gerçekleştirmenizi sağlar. Aşağıda, en sık kullanılan klavye kısayolları listelenmiştir:

| Kısayol | İşlev |
|---------|-------|
| `Ctrl + /` | Yardım menüsünü açar |
| `Ctrl + F` | Arama kutusuna odaklanır |
| `Ctrl + N` | Yeni öğe oluşturur |
| `Ctrl + S` | Mevcut formu kaydeder |
| `Ctrl + D` | Seçili öğeyi çoğaltır |
| `Ctrl + Del` | Seçili öğeyi siler |
| `Ctrl + H` | Ana sayfaya gider |
| `Ctrl + 1-7` | Yan menüdeki ilgili öğeye gider |
| `Esc` | Açık diyaloğu kapatır |
| `F1` | Bağlama duyarlı yardımı gösterir |

Tüm klavye kısayollarının listesini görmek için, `Ctrl + /` tuşlarına basarak yardım menüsünü açabilirsiniz.

## 8. Mobil Arayüz

ALT_LAS, mobil cihazlarda da kullanılabilir. Mobil arayüz, masaüstü arayüzüne benzer, ancak küçük ekranlara uygun olarak optimize edilmiştir.

![Mobil Arayüz](../assets/mobile-interface.png)

### 8.1. Mobil Menü

Mobil cihazlarda, yan menü ekranın sol üst köşesindeki menü simgesine tıklanarak açılır. Menü açıldığında, masaüstü arayüzündeki yan menüyle aynı öğeleri içerir.

### 8.2. Mobil İçerik

Mobil cihazlarda, içerik alanı ekranın tamamını kaplar. Tablolar ve diğer geniş içerikler, yatay kaydırma ile görüntülenebilir.

### 8.3. Mobil Formlar

Mobil cihazlarda, formlar tek sütun halinde gösterilir ve ekran boyutuna uygun olarak optimize edilir.

## 9. Erişilebilirlik Özellikleri

ALT_LAS, çeşitli erişilebilirlik özellikleri sunarak herkesin sistemi kullanabilmesini sağlar:

### 9.1. Klavye Navigasyonu

Tüm arayüz öğeleri, klavye ile erişilebilir ve kullanılabilir.

### 9.2. Ekran Okuyucu Desteği

ALT_LAS, ekran okuyucularla uyumludur ve tüm içerik ve etkileşimler için uygun ARIA etiketleri sağlar.

### 9.3. Yüksek Kontrast Modu

Görme zorluğu yaşayan kullanıcılar için yüksek kontrast modu bulunmaktadır. Bu modu, ayarlar menüsünden etkinleştirebilirsiniz.

### 9.4. Metin Boyutu Ayarı

Metin boyutunu ayarlayarak içeriği daha büyük veya daha küçük görüntüleyebilirsiniz. Bu ayarı, ayarlar menüsünden değiştirebilirsiniz.

## 10. Tema ve Kişiselleştirme

ALT_LAS, arayüzü kişiselleştirmenize olanak tanır:

### 10.1. Açık/Karanlık Mod

ALT_LAS, açık ve karanlık mod arasında geçiş yapmanıza olanak tanır. Modu değiştirmek için, kullanıcı menüsündeki "Ayarlar" seçeneğine tıklayın ve "Görünüm" sekmesinden tercih ettiğiniz modu seçin.

### 10.2. Renk Teması

ALT_LAS, çeşitli renk temaları sunar. Tema değiştirmek için, kullanıcı menüsündeki "Ayarlar" seçeneğine tıklayın ve "Görünüm" sekmesinden tercih ettiğiniz temayı seçin.

### 10.3. Gösterge Paneli Kişiselleştirme

Ana sayfadaki gösterge panelini kişiselleştirebilirsiniz. Kartları yeniden düzenlemek, eklemek veya kaldırmak için, gösterge panelinin sağ üst köşesindeki "Düzenle" düğmesine tıklayın.

## Video Eğitimi

ALT_LAS arayüzünü tanıtan video eğitimini izlemek için [buraya tıklayın](https://www.alt-las.com/tutorials/interface-overview).

## Sonraki Adımlar

Arayüzü tanıdıktan sonra, aşağıdaki bölümlere geçerek ALT_LAS'ın temel özelliklerini öğrenebilirsiniz:

- [Segmentasyon](segmentasyon.md)
- [İş Yönetimi](is-yonetimi.md)
- [Arşiv](arsiv.md)
- [AI Modelleri](ai-modelleri.md)
