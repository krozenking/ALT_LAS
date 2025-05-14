// Animasyon Optimizasyonu Dokümantasyonu
// ALT_LAS Projesi - İşçi 5 (UI/UX Geliştirici)

# Animasyon Optimizasyonu Dokümantasyonu

Bu doküman, ALT_LAS projesinde uygulanan animasyon optimizasyonlarını ve en iyi uygulamaları açıklamaktadır.

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [GPU Hızlandırmalı Animasyonlar](#gpu-hızlandırmalı-animasyonlar)
3. [Cihaz Adaptif Animasyonlar](#cihaz-adaptif-animasyonlar)
4. [Animasyon Performans Testleri](#animasyon-performans-testleri)
5. [Animasyon Presetleri](#animasyon-presetleri)
6. [Erişilebilirlik ve Hareket Azaltma](#erişilebilirlik-ve-hareket-azaltma)
7. [En İyi Uygulamalar](#en-i̇yi-uygulamalar)

## Genel Bakış

ALT_LAS uygulamasında animasyonlar, kullanıcı deneyimini iyileştirmek ve arayüz etkileşimlerini daha sezgisel hale getirmek için kullanılmaktadır. Animasyonlar, `animations.ts` dosyasında merkezi olarak yönetilmekte ve tüm uygulama genelinde tutarlı bir şekilde kullanılmaktadır.

Animasyon sistemi şu bileşenlerden oluşur:
- Easing fonksiyonları
- Süre sabitleri
- Transform animasyonları
- Keyframe animasyonları
- Animasyon presetleri
- Performans optimizasyon araçları
- Test ve ölçüm araçları

## GPU Hızlandırmalı Animasyonlar

Modern tarayıcılarda, belirli CSS özellikleri GPU tarafından hızlandırılabilir, bu da daha akıcı animasyonlar sağlar.

### Kullanılan Teknikler

1. **transform3d Kullanımı**: Tüm transform animasyonları, GPU hızlandırmasını tetiklemek için `translate3d`, `scale3d` ve `rotate3d` kullanacak şekilde optimize edilmiştir.

```javascript
// Optimize edilmemiş
transform: 'translateY(20px)'

// Optimize edilmiş
transform: 'translate3d(0, 20px, 0)'
```

2. **will-change Özelliği**: Tarayıcıya hangi özelliklerin değişeceğini önceden bildirerek optimizasyon sağlar.

```javascript
willChange: 'transform, opacity'
```

3. **Gelişmiş GPU Hızlandırma**: Karmaşık animasyonlar için birden fazla tekniği birleştiren `enhancedGPU` yardımcı fonksiyonu:

```javascript
enhancedGPU: {
  transform: 'translate3d(0, 0, 0)',
  backfaceVisibility: 'hidden',
  perspective: 1000,
  willChange: 'transform, opacity',
}
```

### Kullanım Örneği

```jsx
import { animations } from '@/styles/animations';

<Box
  transition="transform 200ms ease"
  _hover={{ transform: 'translate3d(0, -4px, 0)' }}
  {...animations.performanceUtils.enhancedGPU}
>
  Hover Me
</Box>
```

## Cihaz Adaptif Animasyonlar

Farklı cihazlarda tutarlı bir kullanıcı deneyimi sağlamak için, animasyonlar cihaz performansına göre otomatik olarak ayarlanır.

### Düşük Performanslı Cihaz Tespiti

```javascript
detectLowPerformanceDevice: () => {
  if (typeof window === 'undefined') return false;
  
  return navigator.hardwareConcurrency <= 4 || 
    /Android [4-6]/.test(navigator.userAgent) || 
    /iPhone OS [7-9]|iPhone OS 1[0-1]/.test(navigator.userAgent);
}
```

### Adaptif Süreler

```javascript
durations.adaptive = {
  ultraFast: { default: 50, lowPerformance: 0 },
  veryFast: { default: 100, lowPerformance: 50 },
  fast: { default: 150, lowPerformance: 100 },
  normal: { default: 200, lowPerformance: 150 },
  slow: { default: 300, lowPerformance: 200 },
  verySlow: { default: 500, lowPerformance: 300 },
  ultraSlow: { default: 800, lowPerformance: 500 },
}
```

### Adaptif Geçiş Oluşturma

```javascript
createAdaptiveTransition(
  ['transform', 'opacity'], 
  'normal',  // 'normal' süre, cihaz performansına göre ayarlanacak
  easings.easeOut
)
```

## Animasyon Performans Testleri

Animasyon performansını ölçmek ve optimize etmek için test araçları eklenmiştir.

### Performans Ölçümü

```javascript
animations.testUtils.measurePerformance('slideIn', () => {
  // Animasyon kodu burada
});
```

### Düşen Kareleri Tespit Etme

```javascript
animations.testUtils.detectDroppedFrames(1000, (metrics) => {
  console.log(`
    Süre: ${metrics.duration}ms
    Render edilen kareler: ${metrics.framesRendered}
    Beklenen kareler: ${metrics.expectedFrames}
    Düşen kareler: ${metrics.droppedFrames}
    Düşen kare yüzdesi: ${metrics.droppedPercentage}%
  `);
});
```

### Test Bileşeni

Animasyon performansını test etmek için `AnimationTest.tsx` bileşeni oluşturulmuştur. Bu bileşen:

- Farklı animasyon tiplerini test etme
- GPU hızlandırmayı açıp kapatma
- Düşük performans modunu simüle etme
- Performans metriklerini görüntüleme

özellikleri sunar.

## Animasyon Presetleri

Yaygın UI elementleri için önceden tanımlanmış animasyon presetleri:

### Buton Animasyonları

```javascript
button: {
  hover: {
    transform: 'translate3d(0, -2px, 0)',
    boxShadow: 'lg',
    transition: `all ${durations.fast}ms ${easings.easeOut}`,
  },
  active: {
    transform: 'translate3d(0, 0, 0)',
    boxShadow: 'md',
    transition: `all ${durations.fast}ms ${easings.easeOut}`,
  },
  tap: {
    transform: 'scale3d(0.98, 0.98, 1)',
    transition: `all ${durations.ultraFast}ms ${easings.easeOut}`,
  },
}
```

### Kart Animasyonları

```javascript
card: {
  hover: {
    transform: 'translate3d(0, -4px, 0)',
    boxShadow: 'xl',
    transition: `all ${durations.normal}ms ${easings.easeOut}`,
  },
  tap: {
    transform: 'scale3d(0.98, 0.98, 1) translate3d(0, -2px, 0)',
    transition: `all ${durations.fast}ms ${easings.easeOut}`,
  },
}
```

### Modal Animasyonları

```javascript
modal: {
  overlay: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: `opacity ${durations.normal}ms ${easings.easeOut}`,
    },
    exit: { 
      opacity: 0,
      transition: `opacity ${durations.fast}ms ${easings.easeIn}`,
    },
  },
  content: {
    initial: { opacity: 0, transform: 'scale3d(0.95, 0.95, 1)' },
    animate: { 
      opacity: 1, 
      transform: 'scale3d(1, 1, 1)',
      transition: `all ${durations.normal}ms ${easings.easeOutBack}`,
    },
    exit: { 
      opacity: 0, 
      transform: 'scale3d(0.95, 0.95, 1)',
      transition: `all ${durations.fast}ms ${easings.easeIn}`,
    },
  },
}
```

## Erişilebilirlik ve Hareket Azaltma

İşletim sistemi ayarlarında "hareketi azalt" seçeneğini etkinleştiren kullanıcılar için alternatif animasyonlar sağlanmıştır.

### Hareket Tercihi Algılama

```css
@media (prefers-reduced-motion: reduce) {
  /* Alternatif animasyonlar veya animasyonsuz stiller */
}
```

### Alternatif Animasyonlar

```javascript
reducedMotionAlternatives: {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  instant: {
    initial: {},
    animate: {},
    exit: {},
  },
}
```

### Kullanım Örneği

```jsx
<Box
  {...(prefersReducedMotion 
    ? animations.performanceUtils.reducedMotionAlternatives.fade
    : animations.transforms.slideUp)}
>
  Content
</Box>
```

## En İyi Uygulamalar

1. **Sadece transform ve opacity Özelliklerini Animate Edin**
   - `transform` ve `opacity` özellikleri GPU tarafından hızlandırılabilir
   - `width`, `height`, `margin`, `padding` gibi özellikleri animate etmekten kaçının

2. **Animasyon Sürelerini Kısa Tutun**
   - Çoğu UI animasyonu 200-300ms arasında olmalıdır
   - 500ms'den uzun animasyonlar kullanıcı deneyimini yavaşlatabilir

3. **Büyük Listelerde Animasyonları Sınırlayın**
   - Çok sayıda öğe içeren listelerde, sadece görünür öğeleri animate edin
   - Stagger efektlerini makul bir sayıda öğeyle sınırlayın (maksimum 10-15)

4. **Animasyon Katmanlarını Sınırlayın**
   - Aynı anda çok fazla animasyon çalıştırmaktan kaçının
   - Karmaşık sayfalarda animasyonları önceliklendirin

5. **Cihaz Performansını Göz Önünde Bulundurun**
   - Düşük performanslı cihazlarda animasyonları basitleştirin
   - Adaptif süreleri ve alternatif animasyonları kullanın

6. **Animasyonları Erişilebilir Yapın**
   - Her zaman `prefers-reduced-motion` medya sorgusunu destekleyin
   - Animasyonlar bilgi iletmek için tek yöntem olmamalıdır

7. **Animasyonları Test Edin**
   - Farklı cihazlarda ve tarayıcılarda test edin
   - Performans metriklerini düzenli olarak ölçün

---

Bu dokümantasyon, ALT_LAS projesindeki animasyon optimizasyonlarını ve en iyi uygulamaları kapsamaktadır. Sorularınız veya önerileriniz için lütfen geliştirici ekibiyle iletişime geçin.
