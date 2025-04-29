# Yüksek Kontrast Tema Dokümantasyonu

Bu belge, ALT_LAS projesinin UI bileşenlerine eklenen yüksek kontrast tema özelliğini detaylandırmaktadır. Bu özellik, WCAG 2.1 AA standartlarına uygunluk sağlamak ve görme zorluğu yaşayan kullanıcılar için erişilebilirliği artırmak amacıyla geliştirilmiştir.

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Tasarım Prensipleri](#tasarım-prensipleri)
3. [Renk Paleti](#renk-paleti)
4. [Bileşen Varyantları](#bileşen-varyantları)
5. [Kullanım Kılavuzu](#kullanım-kılavuzu)
6. [Test Stratejisi](#test-stratejisi)
7. [Bilinen Sınırlamalar ve Gelecek İyileştirmeler](#bilinen-sınırlamalar-ve-gelecek-iyileştirmeler)

## Genel Bakış

Yüksek kontrast tema, düşük görüş keskinliği, renk körlüğü veya yaşa bağlı görme değişiklikleri olan kullanıcılar için uygulamanın kullanılabilirliğini artırmak amacıyla tasarlanmıştır. Bu tema, standart temaya alternatif olarak sunulmakta ve kullanıcılar tarafından tercih edilebilmektedir.

Yüksek kontrast tema, aşağıdaki özelliklere sahiptir:

- Yüksek kontrast renk paleti (4.5:1 veya daha yüksek kontrast oranı)
- Belirgin odak göstergeleri
- Daha kalın kenarlıklar ve çerçeveler
- Daha net metin ve simgeler
- Renk körlüğü dostu renk kombinasyonları

## Tasarım Prensipleri

Yüksek kontrast tema, aşağıdaki tasarım prensiplerine dayanmaktadır:

### 1. Kontrast Maksimizasyonu

- Metin ve arka plan arasında en az 4.5:1 kontrast oranı
- Etkileşimli öğeler için en az 3:1 kontrast oranı
- Açık ve koyu temalar için optimize edilmiş renk paletleri

### 2. Belirgin Sınırlar ve Kenarlar

- Tüm etkileşimli öğeler için kalın kenarlıklar (2-3px)
- Bileşenler arasında net ayrımlar
- Glassmorphism efektlerinin azaltılması veya kaldırılması

### 3. Odak Göstergeleri

- Belirgin ve yüksek kontrastlı odak göstergeleri
- Turuncu renkli odak halkası (hem açık hem koyu temada görünür)
- Odaklanılan öğelerin boyutunda hafif artış

### 4. Renk Semantiği

- Renk körlüğü dostu renk paleti
- Renklerin anlamlarının tutarlı kullanımı
- Sadece renge bağlı olmayan bilgi iletimi (ek simgeler veya metinler)

## Renk Paleti

Yüksek kontrast tema, iki farklı renk paleti sunar: açık tema ve koyu tema.

### Açık Tema Renk Paleti

| Renk Adı | Hex Kodu | Kullanım Alanı |
|----------|----------|----------------|
| Metin | `#000000` | Ana metin rengi |
| Arka Plan | `#FFFFFF` | Sayfa arka planı |
| Birincil | `#000080` | Birincil düğmeler, vurgu |
| İkincil | `#800000` | İkincil düğmeler |
| Kenarlık | `#000000` | Bileşen kenarlıkları |
| Odak | `#FF8000` | Odak göstergeleri |
| Bağlantı | `#0000FF` | Bağlantılar |
| Ziyaret Edilmiş | `#800080` | Ziyaret edilmiş bağlantılar |
| Başarı | `#008000` | Başarı mesajları |
| Hata | `#FF0000` | Hata mesajları |
| Uyarı | `#FF8000` | Uyarı mesajları |
| Bilgi | `#0000FF` | Bilgi mesajları |

### Koyu Tema Renk Paleti

| Renk Adı | Hex Kodu | Kullanım Alanı |
|----------|----------|----------------|
| Metin | `#FFFFFF` | Ana metin rengi |
| Arka Plan | `#000000` | Sayfa arka planı |
| Birincil | `#00FFFF` | Birincil düğmeler, vurgu |
| İkincil | `#FFFF00` | İkincil düğmeler |
| Kenarlık | `#FFFFFF` | Bileşen kenarlıkları |
| Odak | `#FF8000` | Odak göstergeleri |
| Bağlantı | `#00FFFF` | Bağlantılar |
| Ziyaret Edilmiş | `#FF00FF` | Ziyaret edilmiş bağlantılar |
| Başarı | `#00FF00` | Başarı mesajları |
| Hata | `#FF0000` | Hata mesajları |
| Uyarı | `#FFFF00` | Uyarı mesajları |
| Bilgi | `#00FFFF` | Bilgi mesajları |

## Bileşen Varyantları

Yüksek kontrast tema, aşağıdaki bileşenler için özel varyantlar sunar:

### Düğmeler (Button)

Yüksek kontrast tema, üç farklı düğme varyantı sunar:

1. **high-contrast**: Birincil düğme varyantı
   ```tsx
   <Button variant="high-contrast">Birincil Düğme</Button>
   ```

2. **high-contrast-secondary**: İkincil düğme varyantı
   ```tsx
   <Button variant="high-contrast-secondary">İkincil Düğme</Button>
   ```

3. **high-contrast-outline**: Çerçeveli düğme varyantı
   ```tsx
   <Button variant="high-contrast-outline">Çerçeveli Düğme</Button>
   ```

### Kartlar (Card)

Yüksek kontrast tema, kartlar için özel bir stil sunar:

```tsx
<Card colorScheme="highContrast">
  <CardHeader>Kart Başlığı</CardHeader>
  <CardBody>Kart İçeriği</CardBody>
  <CardFooter>Kart Altbilgisi</CardFooter>
</Card>
```

### Paneller (Panel)

Yüksek kontrast tema, paneller için özel bir stil sunar:

```tsx
<Panel 
  title="Panel Başlığı" 
  colorScheme="highContrast"
>
  Panel İçeriği
</Panel>
```

### Giriş Alanları (Input)

Yüksek kontrast tema, giriş alanları için özel bir varyant sunar:

```tsx
<Input 
  variant="high-contrast" 
  placeholder="Metin girin"
/>
```

### Bağlantılar (Link)

Yüksek kontrast tema, bağlantılar için özel bir stil sunar:

```tsx
<Link colorScheme="highContrast" href="#">Bağlantı Metni</Link>
```

## Kullanım Kılavuzu

### Yüksek Kontrast Temayı Etkinleştirme

Yüksek kontrast temayı etkinleştirmek için, `createHighContrastTheme` fonksiyonunu kullanarak mevcut temayı genişletin:

```tsx
import { ChakraProvider } from '@chakra-ui/react';
import { theme, createHighContrastTheme } from '@/styles/theme';

// Mevcut renk moduna göre yüksek kontrast tema oluşturma
const { colorMode } = useColorMode();
const highContrastTheme = createHighContrastTheme(colorMode);

// ChakraProvider ile temayı uygulama
<ChakraProvider theme={{ ...theme, ...highContrastTheme }}>
  <App />
</ChakraProvider>
```

### Tema Geçiş Kontrolü Ekleme

Kullanıcıların standart tema ile yüksek kontrast tema arasında geçiş yapabilmesi için bir kontrol ekleyin:

```tsx
import { useColorMode, Button, useColorModeValue } from '@chakra-ui/react';
import { useState } from 'react';
import { theme, createHighContrastTheme } from '@/styles/theme';

const ThemeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isHighContrast, setIsHighContrast] = useState(false);
  
  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
    // Tema değişikliğini uygulama mantığı burada
  };
  
  return (
    <>
      <Button onClick={toggleColorMode}>
        {colorMode === 'light' ? 'Koyu Tema' : 'Açık Tema'}
      </Button>
      <Button onClick={toggleHighContrast}>
        {isHighContrast ? 'Standart Kontrast' : 'Yüksek Kontrast'}
      </Button>
    </>
  );
};
```

### Bileşen Bazlı Kullanım

Belirli bileşenlerde yüksek kontrast stillerini kullanmak için:

```tsx
// Düğmeler
<Button variant="high-contrast">Yüksek Kontrastlı Düğme</Button>
<Button variant="high-contrast-secondary">İkincil Düğme</Button>
<Button variant="high-contrast-outline">Çerçeveli Düğme</Button>

// Giriş Alanları
<Input variant="high-contrast" placeholder="Yüksek kontrastlı giriş alanı" />

// Kartlar ve Paneller
<Card colorScheme="highContrast">...</Card>
<Panel colorScheme="highContrast">...</Panel>

// Bağlantılar
<Link colorScheme="highContrast">Yüksek kontrastlı bağlantı</Link>
```

## Test Stratejisi

Yüksek kontrast tema, aşağıdaki test stratejileri kullanılarak doğrulanmıştır:

### Otomatik Testler

- Jest ve React Testing Library ile birim testleri
- Tema geçişlerinin doğru çalıştığını doğrulama
- Bileşen varyantlarının doğru uygulandığını kontrol etme

### Manuel Testler

- Kontrast oranı kontrolleri (WebAIM Contrast Checker)
- Renk körlüğü simülasyonları
- Ekran okuyucu uyumluluğu testleri
- Klavye navigasyonu testleri

### Erişilebilirlik Kontrolleri

- WCAG 2.1 AA uyumluluğu kontrolleri
- Kontrast oranlarının en az 4.5:1 olduğunu doğrulama
- Odak göstergelerinin belirgin olduğunu kontrol etme
- Renk körlüğü durumunda kullanılabilirliği doğrulama

## Bilinen Sınırlamalar ve Gelecek İyileştirmeler

### Bilinen Sınırlamalar

- Bazı üçüncü taraf bileşenler yüksek kontrast temadan tam olarak etkilenmeyebilir
- Karmaşık veri görselleştirmeleri için yüksek kontrast optimizasyonu sınırlıdır
- Tema geçişleri sırasında bazı bileşenlerde geçici görsel sorunlar oluşabilir

### Gelecek İyileştirmeler

- Kullanıcı tercihlerinin yerel depolamada saklanması
- Daha fazla bileşen için yüksek kontrast varyantları
- Metin boyutu ayarları ve satır aralığı kontrolleri
- Animasyon ve geçiş efektlerini azaltma seçeneği
- Daha kapsamlı erişilebilirlik testleri ve dokümantasyonu

## Sonuç

Yüksek kontrast tema, ALT_LAS uygulamasının erişilebilirliğini önemli ölçüde artırmaktadır. Bu özellik, görme zorluğu yaşayan kullanıcılar için daha iyi bir deneyim sağlarken, WCAG 2.1 AA standartlarına uyumluluğu da desteklemektedir. Gelecekteki iyileştirmelerle birlikte, uygulama daha geniş bir kullanıcı kitlesine hizmet edebilecektir.
