# ALT_LAS UI Erişilebilirlik İyileştirmeleri Dokümantasyonu

Bu belge, ALT_LAS projesinin UI bileşenlerine yapılan erişilebilirlik iyileştirmelerini detaylandırmaktadır. Bu iyileştirmeler, WCAG 2.1 AA standartlarına uygunluk sağlamak amacıyla yapılmıştır.

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Uygulanan Erişilebilirlik Prensipleri](#uygulanan-erişilebilirlik-prensipleri)
3. [Bileşen İyileştirmeleri](#bileşen-iyileştirmeleri)
   - [Temel Bileşenler](#temel-bileşenler)
   - [Kompozisyon Bileşenleri](#kompozisyon-bileşenleri)
4. [Klavye Navigasyonu](#klavye-navigasyonu)
5. [Ekran Okuyucu Desteği](#ekran-okuyucu-desteği)
6. [Test Stratejisi](#test-stratejisi)
7. [Bilinen Sınırlamalar ve Gelecek İyileştirmeler](#bilinen-sınırlamalar-ve-gelecek-iyileştirmeler)

## Genel Bakış

ALT_LAS UI bileşenleri, tüm kullanıcılar için kapsayıcı bir deneyim sunmak amacıyla erişilebilirlik standartlarına uygun olarak iyileştirilmiştir. Bu iyileştirmeler, WCAG 2.1 AA uyumluluğu hedeflenerek yapılmıştır ve aşağıdaki ana alanlara odaklanmıştır:

- ARIA rolleri ve özellikleri
- Klavye navigasyonu ve odak yönetimi
- Ekran okuyucu desteği
- Renk kontrastı ve görsel ipuçları

## Uygulanan Erişilebilirlik Prensipleri

### 1. Algılanabilirlik

- **Metin Alternatifleri**: Tüm görsel öğeler için metin alternatifleri sağlanmıştır.
- **Adaptif Tasarım**: Bileşenler, farklı ekran boyutları ve görüntüleme modlarına uyum sağlayacak şekilde tasarlanmıştır.
- **Ayırt Edilebilirlik**: Yeterli renk kontrastı ve görsel ipuçları sağlanmıştır.

### 2. Kullanılabilirlik

- **Klavye Erişilebilirliği**: Tüm işlevler klavye ile erişilebilir hale getirilmiştir.
- **Yeterli Zaman**: Kullanıcıların etkileşimleri için yeterli zaman sağlanmıştır.
- **Navigasyon**: Kullanıcıların içeriği bulmasına ve konumlarını belirlemesine yardımcı olacak yöntemler sağlanmıştır.

### 3. Anlaşılabilirlik

- **Okunabilirlik**: İçerik okunabilir ve anlaşılabilir hale getirilmiştir.
- **Tahmin Edilebilirlik**: Bileşenler tutarlı ve tahmin edilebilir şekilde davranmaktadır.
- **Giriş Yardımı**: Kullanıcılara hataları önleme ve düzeltme konusunda yardım sağlanmıştır.

### 4. Sağlamlık

- **Uyumluluk**: Bileşenler, mevcut ve gelecekteki kullanıcı aracıları ile uyumlu olacak şekilde geliştirilmiştir.
- **Erişilebilirlik API'leri**: Bileşenler, erişilebilirlik API'leri ile uyumlu çalışacak şekilde tasarlanmıştır.

## Bileşen İyileştirmeleri

### Temel Bileşenler

#### Button

```tsx
<Button
  variant="glass-primary"
  size="md"
  ariaLabel="Kaydet"
  onClick={handleSave}
>
  Kaydet
</Button>
```

- **Eklenen Özellikler**:
  - `role="button"` ARIA rolü
  - `aria-disabled` özelliği (devre dışı durumunda)
  - `aria-label` özelliği (içerik açıklayıcı değilse)
  - Klavye aktivasyonu (Enter ve Space tuşları)
  - Odak göstergesi ve stilleri
  - Duruma bağlı ARIA özellikleri (aria-busy, aria-pressed)

#### Card

```tsx
<Card
  variant="glass"
  ariaLabel="Kullanıcı Profili"
  ariaRole="region"
  header={<h2>Kullanıcı Profili</h2>}
>
  Kart içeriği
</Card>
```

- **Eklenen Özellikler**:
  - `role="region"` veya özelleştirilebilir ARIA rolü
  - `aria-labelledby` veya `aria-label` özelliği
  - Başlık için semantik yapı (`role="heading"`)
  - Odak yönetimi ve klavye navigasyonu
  - İçerik bölümleri için uygun ARIA rolleri

#### Input

```tsx
<Input
  id="email"
  label="E-posta Adresi"
  isRequired={true}
  error="Geçerli bir e-posta adresi giriniz"
  description="İletişim için kullanılacaktır"
/>
```

- **Eklenen Özellikler**:
  - Etiket-input ilişkilendirmesi (htmlFor/id)
  - `aria-describedby` özelliği (açıklama ve hata mesajları için)
  - `aria-required` özelliği
  - `aria-invalid` özelliği (hata durumunda)
  - Hata mesajları için `role="alert"`
  - Görsel ve programatik etiketleme

#### IconButton

```tsx
<IconButton
  icon={<CloseIcon />}
  ariaLabel="Kapat"
  variant="glass"
  onClick={handleClose}
/>
```

- **Eklenen Özellikler**:
  - `aria-label` özelliği (zorunlu)
  - Klavye aktivasyonu (Enter ve Space tuşları)
  - Odak göstergesi ve stilleri
  - Duruma bağlı ARIA özellikleri (aria-disabled, aria-busy)

### Kompozisyon Bileşenleri

#### Panel

```tsx
<Panel
  title="Görev Listesi"
  isDraggable={true}
  isResizable={true}
  ariaLabel="Görev Listesi Paneli"
>
  Panel içeriği
</Panel>
```

- **Eklenen Özellikler**:
  - `role="region"` ARIA rolü
  - `aria-labelledby` veya `aria-label` özelliği
  - Başlık için semantik yapı (`role="heading"`)
  - Sürüklenebilir başlık için klavye desteği
  - Yeniden boyutlandırma kolu için erişilebilirlik özellikleri
  - Duruma bağlı ARIA özellikleri (aria-grabbed)

#### SplitView

```tsx
<SplitView
  direction="horizontal"
  leftOrTopContent={<LeftPanel />}
  rightOrBottomContent={<RightPanel />}
  ariaLabel="Bölünmüş Görünüm"
/>
```

- **Eklenen Özellikler**:
  - `role="group"` ARIA rolü
  - Bölme çubuğu için `role="separator"` ve `aria-orientation`
  - Bölme çubuğu için klavye kontrolü (ok tuşları)
  - `aria-valuemin`, `aria-valuemax`, `aria-valuenow` özellikleri
  - Bölme çubuğu için odak yönetimi

#### DragHandle

```tsx
<DragHandle
  orientation="horizontal"
  ariaLabel="Sürükleme Kolu"
  onDragStart={handleDragStart}
/>
```

- **Eklenen Özellikler**:
  - `role="button"` ARIA rolü
  - `aria-label` özelliği
  - `aria-grabbed` özelliği
  - Klavye aktivasyonu (Enter ve Space tuşları)
  - Odak göstergesi ve stilleri

#### DropZone

```tsx
<DropZone
  id="main-dropzone"
  ariaLabel="Bırakma Bölgesi"
  ariaDescription="Panelleri birleştirmek için buraya sürükleyin"
/>
```

- **Eklenen Özellikler**:
  - `role="region"` ARIA rolü
  - `aria-label` ve `aria-describedby` özellikleri
  - `aria-dropeffect` özelliği
  - Odak yönetimi ve klavye navigasyonu
  - Ekran okuyucular için gizli açıklama metni

#### ResizeHandle

```tsx
<ResizeHandle
  orientation="corner"
  ariaLabel="Yeniden Boyutlandırma Kolu"
  onResize={handleResize}
/>
```

- **Eklenen Özellikler**:
  - `role="button"` ARIA rolü
  - `aria-label` özelliği
  - `aria-pressed` özelliği (yeniden boyutlandırma sırasında)
  - Klavye kontrolü (ok tuşları)
  - Odak göstergesi ve stilleri

#### PanelContainer

```tsx
<PanelContainer
  ariaLabel="Panel Konteyneri"
  allowDragDrop={true}
  allowResize={true}
/>
```

- **Eklenen Özellikler**:
  - `role="region"` ARIA rolü
  - `aria-label` özelliği
  - Ekran okuyucular için canlı bölge (live region)
  - Dinamik içerik değişiklikleri için bildirimler
  - Panel ekleme/kaldırma/taşıma için erişilebilir bildirimler

## Klavye Navigasyonu

Tüm etkileşimli bileşenler, aşağıdaki klavye navigasyon desteğine sahiptir:

| Tuş | İşlev |
|-----|-------|
| Tab | Odağı bir sonraki etkileşimli öğeye taşır |
| Shift+Tab | Odağı bir önceki etkileşimli öğeye taşır |
| Enter/Space | Düğmeleri ve diğer etkileşimli öğeleri etkinleştirir |
| Escape | Açık diyalogları, menüleri veya açılır pencereleri kapatır |
| Arrow Keys | Kaydırıcılar, bölme çubukları ve yeniden boyutlandırma kolları için değerleri ayarlar |

### Özel Klavye Etkileşimleri

#### Panel Sürükleme

- **Space/Enter**: Sürüklemeyi başlatır/bitirir
- **Escape**: Sürüklemeyi iptal eder

#### Bölme Çubuğu

- **Sol/Sağ Ok**: Yatay bölme çubuğunu hareket ettirir
- **Yukarı/Aşağı Ok**: Dikey bölme çubuğunu hareket ettirir

#### Yeniden Boyutlandırma

- **Ok Tuşları**: Yeniden boyutlandırma yönüne göre boyutu değiştirir
- **Escape**: Yeniden boyutlandırmayı iptal eder

## Ekran Okuyucu Desteği

Bileşenler, ekran okuyucular için aşağıdaki özelliklere sahiptir:

### Semantik Yapı

- Uygun HTML öğeleri ve ARIA rolleri kullanılmıştır
- İçerik hiyerarşisi mantıksal bir yapıya sahiptir
- Başlıklar ve bölümler doğru şekilde etiketlenmiştir

### Bildirimler

- Dinamik içerik değişiklikleri için canlı bölgeler (live regions) kullanılmıştır
- Panel taşıma, yeniden boyutlandırma ve birleştirme işlemleri bildirilir
- Hata mesajları ve sistem bildirimleri duyurulur

### Etiketleme

- Tüm form kontrolleri uygun şekilde etiketlenmiştir
- Görsel öğeler için metin alternatifleri sağlanmıştır
- Karmaşık bileşenler için açıklayıcı metinler eklenmiştir

## Test Stratejisi

Erişilebilirlik iyileştirmeleri, aşağıdaki test stratejileri kullanılarak doğrulanmıştır:

### Otomatik Testler

- Jest ve React Testing Library ile birim testleri
- jest-axe ile otomatik erişilebilirlik kontrolleri
- ARIA özellikleri ve rolleri için doğrulama testleri

### Manuel Testler

- Klavye navigasyonu testleri
- Ekran okuyucu testleri (NVDA, VoiceOver)
- Yüksek kontrast modu testleri
- Farklı ekran boyutları ve cihazlarda testler

## Bilinen Sınırlamalar ve Gelecek İyileştirmeler

### Bilinen Sınırlamalar

- Karmaşık sürükle-bırak işlemleri için ekran okuyucu desteği sınırlıdır
- Bazı bileşenler, özellikle PanelContainer, karmaşık klavye navigasyonu gerektirmektedir
- Yüksek kontrast modu tam olarak optimize edilmemiştir

### Gelecek İyileştirmeler

- Yüksek kontrast teması implementasyonu
- Daha gelişmiş klavye navigasyon şemaları
- Ekran okuyucu deneyiminin iyileştirilmesi
- Erişilebilirlik tercihlerinin kullanıcı tarafından özelleştirilebilmesi
- Daha kapsamlı erişilebilirlik testleri ve dokümantasyonu

## Sonuç

Bu erişilebilirlik iyileştirmeleri, ALT_LAS UI bileşenlerinin WCAG 2.1 AA standartlarına uygun hale getirilmesi için atılan ilk adımdır. İlerleyen süreçte, kullanıcı geri bildirimleri ve ek testler doğrultusunda daha fazla iyileştirme yapılacaktır.
