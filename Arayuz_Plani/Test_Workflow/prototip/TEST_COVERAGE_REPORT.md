# ALT_LAS UI Test Kapsama Raporu

Bu rapor, ALT_LAS UI projesi için mevcut test kapsamını ve eksik testleri belgelemektedir.

## Mevcut Test Kapsamı

### Bileşenler

| Bileşen | Birim Testleri | Entegrasyon Testleri | Erişilebilirlik Testleri | Görsel Regresyon Testleri | Uçtan Uca Testleri |
|---------|----------------|----------------------|--------------------------|----------------------------|---------------------|
| Button | ✅ | ✅ | ✅ | ❌ | ❌ |
| TextField | ✅ | ❌ | ✅ | ❌ | ❌ |
| Dropdown | ✅ | ❌ | ✅ | ✅ | ❌ |
| Checkbox | ✅ | ❌ | ✅ | ❌ | ❌ |
| LoginForm | ✅ | ✅ | ✅ | ❌ | ❌ |
| Form | ✅ | ✅ | ✅ | ✅ | ✅ |

### Servisler

| Servis | Birim Testleri | Entegrasyon Testleri |
|--------|----------------|----------------------|
| Auth | ✅ | ✅ |

### Store'lar

| Store | Birim Testleri | Entegrasyon Testleri |
|-------|----------------|----------------------|
| ThemeStore | ✅ | ✅ |

### Sayfalar

| Sayfa | Birim Testleri | Entegrasyon Testleri | Erişilebilirlik Testleri | Görsel Regresyon Testleri | Uçtan Uca Testleri |
|-------|----------------|----------------------|--------------------------|----------------------------|---------------------|
| Home | ✅ | ✅ | ✅ | ✅ | ❌ |

## Eksik Testler

### Bileşenler

1. **Button**
   - Görsel regresyon testleri
   - Uçtan uca testler

2. **TextField**
   - Entegrasyon testleri
   - Görsel regresyon testleri
   - Uçtan uca testler

3. **Dropdown**
   - Entegrasyon testleri
   - Uçtan uca testler

4. **Checkbox**
   - Entegrasyon testleri
   - Görsel regresyon testleri
   - Uçtan uca testler

5. **LoginForm**
   - Görsel regresyon testleri
   - Uçtan uca testler

### Sayfalar

1. **Home**
   - Uçtan uca testler

## Öncelikli Testler

Aşağıdaki testler öncelikli olarak eklenmelidir:

1. **Button Görsel Regresyon Testleri**
   - Farklı varyantlar, boyutlar ve durumlar için görsel testler

2. **TextField Entegrasyon Testleri**
   - Form içinde TextField kullanımı için entegrasyon testleri

3. **LoginForm Uçtan Uca Testleri**
   - Giriş akışı için uçtan uca testler

4. **Home Sayfası Uçtan Uca Testleri**
   - Ana sayfa navigasyonu ve etkileşimleri için uçtan uca testler

## Test Kapsama Hedefleri

| Kategori | Mevcut Kapsama | Hedef Kapsama |
|----------|----------------|---------------|
| Satırlar | ~70% | 85% |
| Dallar | ~65% | 80% |
| Fonksiyonlar | ~75% | 90% |
| İfadeler | ~70% | 85% |

## Eylem Planı

1. **Hafta 1**: Button ve TextField için eksik testleri tamamla
2. **Hafta 2**: Dropdown ve Checkbox için eksik testleri tamamla
3. **Hafta 3**: LoginForm ve Home sayfası için eksik testleri tamamla
4. **Hafta 4**: Tüm bileşenler için uçtan uca testleri tamamla

## Sonuç

Mevcut test kapsamı iyi bir başlangıç noktasıdır, ancak daha fazla iyileştirme gereklidir. Özellikle görsel regresyon testleri ve uçtan uca testler için daha fazla çalışma yapılmalıdır. Yukarıdaki eylem planı, test kapsamını artırmak ve test kalitesini iyileştirmek için bir yol haritası sağlamaktadır.
