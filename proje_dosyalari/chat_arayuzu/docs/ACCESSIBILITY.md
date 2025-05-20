# ALT_LAS Chat Botu Erişilebilirlik Dokümantasyonu

Bu dokümantasyon, ALT_LAS Chat Botu'nun erişilebilirlik özellikleri ve uyumluluğu hakkında bilgiler içerir.

## İçindekiler

1. [Erişilebilirlik Taahhüdü](#erişilebilirlik-taahhüdü)
2. [Uyumluluk Standartları](#uyumluluk-standartları)
3. [Erişilebilirlik Özellikleri](#erişilebilirlik-özellikleri)
4. [Klavye Navigasyonu](#klavye-navigasyonu)
5. [Ekran Okuyucu Desteği](#ekran-okuyucu-desteği)
6. [Renk ve Kontrast](#renk-ve-kontrast)
7. [Metin Boyutu ve Okunabilirlik](#metin-boyutu-ve-okunabilirlik)
8. [Hareket ve Animasyonlar](#hareket-ve-animasyonlar)
9. [Bilinen Sorunlar](#bilinen-sorunlar)
10. [Geri Bildirim](#geri-bildirim)

## Erişilebilirlik Taahhüdü

ALT_LAS Chat Botu, tüm kullanıcılar için erişilebilir ve kullanılabilir olmayı hedefler. Engelli kullanıcılar da dahil olmak üzere herkesin uygulamayı eşit şekilde kullanabilmesini sağlamak için sürekli çalışıyoruz.

## Uyumluluk Standartları

ALT_LAS Chat Botu, aşağıdaki erişilebilirlik standartlarına uygun olarak geliştirilmiştir:

- **WCAG 2.1 AA**: Web İçeriği Erişilebilirlik Yönergeleri (WCAG) 2.1, AA seviyesi
- **EN 301 549**: Avrupa erişilebilirlik standardı
- **Section 508**: ABD federal erişilebilirlik gereksinimleri

## Erişilebilirlik Özellikleri

### Erişilebilirlik Menüsü

ALT_LAS Chat Botu, kullanıcıların erişilebilirlik tercihlerini ayarlayabilecekleri bir erişilebilirlik menüsü sunar. Bu menüye sağ üst köşedeki erişilebilirlik düğmesine tıklayarak erişebilirsiniz.

Erişilebilirlik menüsü aşağıdaki ayarları içerir:

- **Yazı Boyutu**: Küçük, orta, büyük veya çok büyük
- **Yüksek Kontrast Modu**: Açık/Kapalı
- **Hareketi Azaltma Modu**: Açık/Kapalı
- **Ekran Okuyucu Modu**: Açık/Kapalı

### Ayarları Kaydetme

Erişilebilirlik ayarlarınız otomatik olarak kaydedilir ve bir sonraki ziyaretinizde hatırlanır. Ayarlarınız tarayıcınızın yerel depolama alanında saklanır.

## Klavye Navigasyonu

ALT_LAS Chat Botu, tam klavye navigasyonu desteği sunar. Fare kullanmadan uygulamanın tüm özelliklerine erişebilirsiniz.

### Atlama Bağlantıları

Sayfa yüklendiğinde, "Ana içeriğe atla" bağlantısı görünür. Bu bağlantı, klavye kullanıcılarının tekrarlayan navigasyon öğelerini atlayarak doğrudan ana içeriğe gitmelerini sağlar.

### Odak Göstergesi

Klavye ile gezinirken, odaklanılan öğe belirgin bir odak göstergesi ile vurgulanır. Bu, klavye kullanıcılarının sayfada nerede olduklarını takip etmelerine yardımcı olur.

### Klavye Kısayolları

ALT_LAS Chat Botu, uygulamada hızlı gezinmeyi sağlayan klavye kısayolları sunar. Klavye kısayollarının tam listesi için [Klavye Kısayolları](#klavye-kısayolları) bölümüne bakın.

### Odak Tuzakları

Modal pencereler ve çekmeceler gibi öğeler, odağı içeride tutarak kullanıcının yanlışlıkla altta kalan içerikle etkileşime girmesini önler. ESC tuşuna basarak bu öğelerden çıkabilirsiniz.

## Ekran Okuyucu Desteği

ALT_LAS Chat Botu, ekran okuyucularla uyumlu olacak şekilde tasarlanmıştır.

### ARIA Öznitelikleri

Uygulama, ekran okuyucuların içeriği doğru şekilde yorumlamasına yardımcı olmak için ARIA (Accessible Rich Internet Applications) özniteliklerini kullanır.

### Erişilebilir İsimler ve Açıklamalar

Tüm etkileşimli öğeler, ekran okuyucular tarafından duyurulabilecek erişilebilir isimler ve açıklamalar içerir.

### Canlı Bölgeler

Mesaj listesi gibi dinamik olarak güncellenen içerikler, ekran okuyucuların değişiklikleri duyurabilmesi için canlı bölgeler olarak işaretlenmiştir.

### Ekran Okuyucu Modu

Ekran okuyucu modu, ekran okuyucu kullanıcıları için optimize edilmiş bir arayüz sunar. Bu mod, gereksiz görsel öğeleri kaldırır ve ekran okuyucu duyurularını iyileştirir.

## Renk ve Kontrast

### Renk Kontrastı

Tüm metin ve etkileşimli öğeler, WCAG 2.1 AA standardına uygun olarak yeterli kontrast oranına sahiptir:

- Normal metin için en az 4.5:1 kontrast oranı
- Büyük metin için en az 3:1 kontrast oranı
- Etkileşimli öğeler ve kullanıcı arayüzü bileşenleri için en az 3:1 kontrast oranı

### Yüksek Kontrast Modu

Yüksek kontrast modu, görme zorluğu yaşayan kullanıcılar için metinleri ve diğer öğeleri daha görünür hale getirir. Bu mod, arka plan ve metin arasındaki kontrast oranını artırır.

### Renge Bağlı Olmayan Bilgi

Uygulama, renk körü kullanıcılar için erişilebilir olacak şekilde tasarlanmıştır. Bilgiler sadece renkle değil, metin, simgeler ve diğer görsel ipuçlarıyla da iletilir.

## Metin Boyutu ve Okunabilirlik

### Yazı Boyutu Ayarı

Kullanıcılar, erişilebilirlik menüsünden yazı boyutunu ayarlayabilirler. Dört farklı boyut seçeneği mevcuttur: küçük, orta, büyük ve çok büyük.

### Tarayıcı Zoom Desteği

Uygulama, tarayıcının zoom özelliğiyle uyumludur. Kullanıcılar, içeriği %200'e kadar yakınlaştırabilir ve yatay kaydırma olmadan içeriği görüntüleyebilirler.

### Okunabilir Yazı Tipleri

Uygulama, okunabilirliği artırmak için sans-serif yazı tipleri kullanır. Yazı tipi boyutu, satır aralığı ve harf aralığı, optimum okunabilirlik için ayarlanmıştır.

## Hareket ve Animasyonlar

### Hareketi Azaltma Modu

Hareketi azaltma modu, animasyonları ve geçişleri devre dışı bırakarak hareket duyarlılığı olan kullanıcılar için daha rahat bir deneyim sağlar.

### prefers-reduced-motion Desteği

Uygulama, tarayıcının `prefers-reduced-motion` medya sorgusunu destekler. Kullanıcı işletim sisteminde hareketi azaltma ayarını etkinleştirdiyse, uygulama otomatik olarak animasyonları azaltır.

### Otomatik Oynatma Kontrolü

Sesli mesajlar gibi otomatik oynatılan medya öğeleri, kullanıcı kontrolü olmadan otomatik olarak oynatılmaz.

## Bilinen Sorunlar

Aşağıdaki erişilebilirlik sorunları bilinmektedir ve üzerinde çalışılmaktadır:

1. **Dosya Yükleme Diyaloğu**: Bazı ekran okuyucular, dosya yükleme diyaloğunu doğru şekilde duyurmayabilir.
2. **Ses Kaydı**: Ses kayıt arayüzü, tüm ekran okuyucularla tam olarak uyumlu değildir.
3. **Emoji Seçici**: Emoji seçici, klavye navigasyonu için optimize edilmemiştir.

## Geri Bildirim

Erişilebilirlik sorunları veya iyileştirme önerileri için lütfen accessibility@altlas.com adresine e-posta gönderin.

Erişilebilirlik geri bildirimleri öncelikli olarak ele alınır ve sürekli iyileştirme sürecimizin önemli bir parçasıdır.
