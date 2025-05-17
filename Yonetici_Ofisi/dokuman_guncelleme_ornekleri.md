# ALT_LAS Projesi Dokümantasyon Güncelleme Örnekleri

Bu belge, toplantı sonucunda belirlenen öncelikli iyileştirme alanlarına göre yapılacak dokümantasyon güncellemelerinin örneklerini içermektedir.

## 1. Merkezi Görev Takip Sistemi Güncellemesi

### Önceki Hali (`/Planlama_Ofisi/ana_gorev_panosu.md`):

```markdown
# Ana Görev Panosu

| Görev ID | Görev Adı | Atanan | Durum | Öncelik |
|----------|-----------|--------|-------|---------|
| UI-001 | Arayüz tasarımı | Elif | Devam Ediyor | Yüksek |
| BE-002 | API geliştirme | Ahmet | Beklemede | Orta |
...
```

### Güncellenmiş Hali:

```markdown
# Ana Görev Panosu

## Görev Durumu Tanımları
- **Yapılacak**: Henüz başlanmamış görevler
- **Devam Ediyor**: Aktif olarak çalışılan görevler
- **İncelemede**: Tamamlanmış ve inceleme bekleyen görevler
- **Tamamlandı**: İncelemesi tamamlanmış ve onaylanmış görevler
- **Engellendi**: Bağımlılık veya başka nedenlerle ilerlenemeyen görevler

## Öncelik Seviyeleri
- **P0**: Kritik - Hemen çözülmeli
- **P1**: Yüksek - Bu sprint içinde tamamlanmalı
- **P2**: Orta - Planlandığı gibi ilerlemeli
- **P3**: Düşük - Zaman kalırsa yapılabilir

| Görev ID | Görev Adı | Detay Linki | Atanan Persona | Durum | Öncelik | Bağımlılıklar | Tahmini Efor | Başlangıç | Bitiş | Notlar |
|----------|-----------|-------------|----------------|-------|---------|---------------|--------------|-----------|-------|--------|
| UI-001 | Arayüz tasarımı | [Detay](/Arayuz_Gelistirme_Plani/Persona_Planlari/ui_ux_tasarimcisi_gorev_plani.md#UI-001) | Elif Aydın | Devam Ediyor | P1 | - | 5 gün | 2025-05-15 | 2025-05-20 | Erişilebilirlik standartları eklenecek |
| BE-002 | API geliştirme | [Detay](/Arayuz_Gelistirme_Plani/Persona_Planlari/kidemli_backend_gelistirici_gorev_plani.md#BE-002) | Ahmet Çelik | Engellendi | P1 | UI-001 | 3 gün | 2025-05-18 | 2025-05-21 | UI tasarımı tamamlandıktan sonra başlanacak |
...
```

## 2. Standart Şablon Örneği

### Yeni Oluşturulan Görev Tanımlama Şablonu (`/Yonetici_Ofisi/Genel_Belgeler/Dokuman_Sablonlari/gorev_tanimlama_sablonu.md`):

```markdown
# Görev Tanımlama Şablonu

## Görev Bilgileri

- **Görev ID**: [Benzersiz görev tanımlayıcısı, örn: UI-001]
- **Görev Adı**: [Kısa ve açıklayıcı başlık]
- **Sorumlu Persona**: [Görevi üstlenen persona]
- **Tahmini Efor**: [Gün/saat cinsinden]
- **Öncelik**: [P0, P1, P2, P3]
- **Durum**: [Yapılacak, Devam Ediyor, İncelemede, Tamamlandı, Engellendi]
- **Bağımlılıklar**: [Bağımlı olunan diğer görevlerin ID'leri]
- **Başlangıç Tarihi**: [YYYY-MM-DD]
- **Bitiş Tarihi**: [YYYY-MM-DD]

## Görev Tanımı

[Görevin detaylı açıklaması, amaç ve kapsamı]

## Gerekli Girdiler

- [Görevin tamamlanması için gerekli bilgi, doküman veya kaynaklar]
- ...

## Beklenen Çıktılar

- [Görev sonucunda oluşturulacak doküman, kod, tasarım vb.]
- ...

## Kabul Kriterleri

- [Görevin tamamlanmış sayılması için karşılanması gereken kriterler]
- ...

## Notlar ve Referanslar

- [Ek bilgiler, ipuçları, referans dokümanlar]
- ...
```

## 3. Arayüz Teknolojisi Güncellemesi

### Önceki Hali (`/Arayuz_Gelistirme_Plani/Dokumanlar/kapsamli_ui_gelistirme_plani.md`):

```markdown
## Frontend Framework ve Kütüphane Seçimleri

Uygun teknolojilerin seçilmesi ve versiyon politikalarının belirlenmesi:

- React
- TypeScript
- Redux
- React Router
- Styled Components
```

### Güncellenmiş Hali:

```markdown
## Frontend Framework ve Kütüphane Seçimleri

Uygun teknolojilerin seçilmesi ve versiyon politikalarının belirlenmesi:

### Ana Framework
- **Next.js** (React meta-framework)
  - Server-side rendering ve statik site generation desteği
  - File-based routing sistemi
  - API routes ile backend entegrasyonu
  - Image ve Font optimizasyonu
  - Edge runtime desteği

### Dil ve Tip Sistemi
- **TypeScript**
  - Zorunlu tip tanımlamaları
  - Strict mode aktif
  - ESLint ve Prettier entegrasyonu

### State Management
- **Zustand** (Redux yerine)
  - Daha az boilerplate kod
  - Daha iyi performans
  - Daha kolay öğrenme eğrisi
  - TypeScript ile tam uyumluluk

### Stil ve Komponent Kütüphanesi
- **Tailwind CSS** + **Headless UI**
  - Utility-first yaklaşım
  - Erişilebilir komponentler
  - Tema desteği
  - Responsive tasarım

### Form Yönetimi
- **React Hook Form**
  - Performans odaklı
  - Uncontrolled komponentler
  - Validasyon entegrasyonu

### Veri Fetching
- **React Query**
  - Önbellek yönetimi
  - Otomatik yeniden deneme
  - Bağımlılık yönetimi
  - Mutation desteği
```

## 4. Component-based Testing Yaklaşımı

### Önceki Hali (`/Arayuz_Gelistirme_Plani/Persona_Planlari/qa_muhendisi_gorev_plani.md`):

```markdown
## Test Stratejisi

- Birim testleri
- Entegrasyon testleri
- E2E testleri
- Manuel testler
```

### Güncellenmiş Hali:

```markdown
## Test Stratejisi

### Component-based Testing Yaklaşımı

Component-based testing, UI bileşenlerinin izole edilmiş ortamlarda test edilmesini sağlayan bir yaklaşımdır. Bu yaklaşım, hataların erken tespit edilmesini, test süresinin kısalmasını ve test kapsamının artmasını sağlar.

#### Test Piramidi

1. **Birim Testleri**
   - Fonksiyonlar, hooks ve yardımcı metodlar
   - Jest ile test edilecek
   - %80+ kod kapsamı hedefi

2. **Komponent Testleri**
   - İzole edilmiş UI bileşenleri
   - React Testing Library ile test edilecek
   - Tüm kullanıcı etkileşimleri ve durumlar test edilecek

3. **Entegrasyon Testleri**
   - Birlikte çalışan bileşen grupları
   - React Testing Library + MSW (API mock) ile test edilecek
   - Kritik kullanıcı akışları test edilecek

4. **E2E Testleri**
   - Tam kullanıcı senaryoları
   - Playwright ile test edilecek
   - Kritik iş akışları ve happy path senaryoları test edilecek

5. **Görsel Regresyon Testleri**
   - UI bileşenlerinin görsel değişikliklerinin tespiti
   - Storybook + Chromatic ile test edilecek
   - Tüm UI bileşenleri ve sayfalar test edilecek

#### Test Araçları

- **Jest**: Birim ve entegrasyon testleri için
- **React Testing Library**: Komponent testleri için
- **Playwright**: E2E testleri için
- **MSW (Mock Service Worker)**: API mock'ları için
- **Storybook + Chromatic**: Görsel regresyon testleri için
- **Testing Library User Event**: Kullanıcı etkileşimlerini simüle etmek için

#### Test Süreçleri

1. Geliştirme öncesi test senaryolarının yazılması (TDD yaklaşımı)
2. Geliştirme sırasında birim ve komponent testlerinin yazılması
3. Geliştirme sonrası entegrasyon ve E2E testlerinin yazılması
4. CI/CD pipeline'ında tüm testlerin otomatik çalıştırılması
5. Görsel regresyon testlerinin her PR'da çalıştırılması
```

## 5. Erişilebilirlik Standartları Bölümü

### Yeni Eklenen Bölüm (`/Arayuz_Gelistirme_Plani/Dokumanlar/kapsamli_ui_gelistirme_plani.md`):

```markdown
## Erişilebilirlik Standartları

ALT_LAS projesi, WCAG 2.1 AA seviyesi erişilebilirlik standartlarına uygun olarak geliştirilecektir. Bu bölüm, projenin erişilebilirlik gereksinimlerini ve uygulanacak standartları detaylandırmaktadır.

### Erişilebilirlik Prensipleri

1. **Algılanabilirlik**
   - Tüm içerik ve UI bileşenleri, kullanıcıların algılayabileceği şekilde sunulmalıdır
   - Metin olmayan içerikler için alternatifler sağlanmalıdır
   - İçerik, yardımcı teknolojiler tarafından okunabilir olmalıdır

2. **Çalıştırılabilirlik**
   - UI bileşenleri ve navigasyon, kullanıcılar tarafından çalıştırılabilir olmalıdır
   - Klavye erişilebilirliği sağlanmalıdır
   - Kullanıcılara içeriği okumak ve kullanmak için yeterli zaman verilmelidir

3. **Anlaşılabilirlik**
   - Metin içeriği okunabilir ve anlaşılabilir olmalıdır
   - Web sayfaları öngörülebilir şekilde çalışmalıdır
   - Kullanıcıların hataları önlemesine ve düzeltmesine yardımcı olunmalıdır

4. **Sağlamlık**
   - İçerik, yardımcı teknolojiler dahil çeşitli kullanıcı ajanları tarafından yorumlanabilir olmalıdır
   - Maksimum uyumluluk sağlanmalıdır

### Teknik Gereksinimler

#### Semantik HTML
- Doğru HTML elementleri kullanılmalıdır (başlıklar için `<h1>-<h6>`, listeler için `<ul>`, `<ol>`, `<li>` vb.)
- ARIA rolleri ve özellikleri gerektiğinde kullanılmalıdır
- Landmark bölgeleri tanımlanmalıdır (`<header>`, `<nav>`, `<main>`, `<footer>` vb.)

#### Klavye Erişilebilirliği
- Tüm işlevler klavye ile kullanılabilir olmalıdır
- Mantıklı bir sekme sırası sağlanmalıdır
- Klavye tuzakları olmamalıdır
- Odaklanma göstergeleri görsel olarak belirgin olmalıdır

#### Renk ve Kontrast
- Metin ve arka plan arasında en az 4.5:1 kontrast oranı sağlanmalıdır
- Büyük metin için en az 3:1 kontrast oranı sağlanmalıdır
- Bilgi iletmek için sadece renk kullanılmamalıdır

#### Metin Alternatifleri
- Tüm görüntüler için anlamlı alt metinleri sağlanmalıdır
- Dekoratif görüntüler için boş alt metinleri kullanılmalıdır
- Karmaşık görüntüler için uzun açıklamalar sağlanmalıdır

#### Form Elemanları
- Tüm form elemanları için etiketler sağlanmalıdır
- Hata mesajları açık ve anlaşılır olmalıdır
- Form doğrulama hem istemci hem de sunucu tarafında yapılmalıdır

### Test ve Doğrulama

#### Otomatik Testler
- ESLint ile jsx-a11y kuralları uygulanacaktır
- Jest ve React Testing Library ile erişilebilirlik testleri yazılacaktır
- Lighthouse ve axe-core ile otomatik erişilebilirlik testleri yapılacaktır

#### Manuel Testler
- Ekran okuyucu testleri (NVDA, VoiceOver)
- Klavye navigasyon testleri
- Büyütme testleri
- Kontrast ve renk testleri

### Erişilebilirlik Kontrol Listesi

Geliştirme ve test süreçlerinde kullanılacak erişilebilirlik kontrol listesi:

1. Tüm görüntüler için alt metinleri var mı?
2. Başlık hiyerarşisi mantıklı ve sıralı mı?
3. Form elemanları için etiketler var mı?
4. Renk kontrastı yeterli mi?
5. Klavye ile tüm işlevler kullanılabilir mi?
6. Odaklanma göstergeleri görünür mü?
7. ARIA rolleri ve özellikleri doğru kullanılmış mı?
8. Hata mesajları açık ve anlaşılır mı?
9. Dinamik içerik ekran okuyuculara bildirilmiş mi?
10. Sayfa yapısı landmark bölgeleri ile tanımlanmış mı?
```

Bu örnekler, toplantıda belirlenen öncelikli iyileştirme alanlarına göre yapılacak dokümantasyon güncellemelerinin nasıl olacağını göstermektedir. Tüm dokümanlar bu örneklerdeki yaklaşımla güncellenecektir.
