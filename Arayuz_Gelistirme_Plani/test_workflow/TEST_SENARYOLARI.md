# ALT_LAS Arayüz Test Senaryoları

Bu doküman, ALT_LAS projesi arayüz geliştirme planının test edilmesi için hazırlanan senaryoları içermektedir.

## 1. Komponent Testi Senaryoları

### 1.1 Button Komponenti

| Test ID | Senaryo | Beklenen Sonuç | Test Tipi |
|---------|---------|----------------|-----------|
| BT-001 | Primary buton render testi | Buton doğru stillerle render edilmeli | Birim |
| BT-002 | Secondary buton render testi | Buton doğru stillerle render edilmeli | Birim |
| BT-003 | Tertiary buton render testi | Buton doğru stillerle render edilmeli | Birim |
| BT-004 | Farklı boyutlarda buton testi | Butonlar doğru boyutlarda render edilmeli | Birim |
| BT-005 | Tam genişlik buton testi | Buton tam genişlikte render edilmeli | Birim |
| BT-006 | Devre dışı buton testi | Buton devre dışı görünmeli ve tıklanamaz olmalı | Birim |
| BT-007 | Tıklama olayı testi | Tıklama fonksiyonu çağrılmalı | Birim |
| BT-008 | İkonlu buton testi | Buton ikon ile birlikte render edilmeli | Birim |
| BT-009 | Erişilebilirlik testi | Buton WCAG standartlarına uygun olmalı | Erişilebilirlik |

### 1.2 Tema Store

| Test ID | Senaryo | Beklenen Sonuç | Test Tipi |
|---------|---------|----------------|-----------|
| TS-001 | Varsayılan tema kontrolü | Başlangıç teması "system" olmalı | Birim |
| TS-002 | Tema değiştirme testi | setTheme fonksiyonu tema değerini güncellenmeli | Birim |
| TS-003 | Tema persistance testi | Sayfa yenilendikten sonra tema korunmalı | Entegrasyon |

## 2. Sayfa Testi Senaryoları

### 2.1 Ana Sayfa

| Test ID | Senaryo | Beklenen Sonuç | Test Tipi |
|---------|---------|----------------|-----------|
| HP-001 | Sayfa render testi | Sayfa tüm bileşenleriyle doğru render edilmeli | Entegrasyon |
| HP-002 | Tema değiştirme testi | Tema butonlarına tıklandığında tema değişmeli | Entegrasyon |
| HP-003 | Responsive tasarım testi | Sayfa farklı ekran boyutlarında doğru görüntülenmeli | UI |
| HP-004 | Erişilebilirlik testi | Sayfa WCAG standartlarına uygun olmalı | Erişilebilirlik |

## 3. Performans Test Senaryoları

| Test ID | Senaryo | Beklenen Sonuç | Test Tipi |
|---------|---------|----------------|-----------|
| PF-001 | İlk yükleme performansı | FCP (First Contentful Paint) < 1.8s olmalı | Performans |
| PF-002 | LCP (Largest Contentful Paint) | LCP < 2.5s olmalı | Performans |
| PF-003 | TTI (Time to Interactive) | TTI < 3.8s olmalı | Performans |
| PF-004 | CLS (Cumulative Layout Shift) | CLS < 0.1 olmalı | Performans |

## 4. CI/CD Pipeline Test Senaryoları

| Test ID | Senaryo | Beklenen Sonuç | Test Tipi |
|---------|---------|----------------|-----------|
| CI-001 | Lint kontrolü | ESLint hataları olmamalı | CI |
| CI-002 | Tip kontrolü | TypeScript hataları olmamalı | CI |
| CI-003 | Birim testleri | Tüm birim testleri geçmeli | CI |
| CI-004 | Build süreci | Build hatasız tamamlanmalı | CI |
| CI-005 | Deployment | Deployment başarıyla tamamlanmalı | CD |

## 5. Erişilebilirlik Test Senaryoları

| Test ID | Senaryo | Beklenen Sonuç | Test Tipi |
|---------|---------|----------------|-----------|
| A11Y-001 | Klavye navigasyonu | Tüm interaktif elementler klavye ile erişilebilir olmalı | Erişilebilirlik |
| A11Y-002 | Ekran okuyucu uyumluluğu | Tüm içerik ekran okuyucular tarafından okunabilir olmalı | Erişilebilirlik |
| A11Y-003 | Renk kontrastı | Metin ve arka plan arasındaki kontrast oranı WCAG AA standartlarına uygun olmalı | Erişilebilirlik |
| A11Y-004 | Alternatif metinler | Tüm görsel öğeler için alternatif metinler bulunmalı | Erişilebilirlik |

## Test Ortamı

- **Tarayıcılar**: Chrome, Firefox, Safari, Edge
- **Cihazlar**: Masaüstü (1920x1080), Tablet (768x1024), Mobil (375x667)
- **Ekran Okuyucular**: NVDA (Windows), VoiceOver (macOS/iOS)
- **Test Araçları**: Jest, React Testing Library, Lighthouse, Axe

## Test Raporlama

Her test senaryosu için aşağıdaki bilgiler kaydedilmelidir:

- Test ID
- Test tarihi
- Test ortamı
- Test sonucu (Başarılı/Başarısız)
- Başarısızlık durumunda hata detayları
- Ekran görüntüleri (gerektiğinde)

## Otomatik Test Çalıştırma

Tüm otomatik testleri çalıştırmak için:

```bash
# Birim testleri
npm run test

# Erişilebilirlik testleri
npm run test:a11y

# Store testleri
npm run test:store

# Entegrasyon testleri
npm run test:integration

# Performans testleri
npm run test:performance
```
