# ALT_LAS Chat Botu Katkıda Bulunma Kılavuzu

ALT_LAS Chat Botu'na katkıda bulunmak istediğiniz için teşekkür ederiz! Bu belge, projeye katkıda bulunmak isteyenler için rehber niteliğindedir.

## İçindekiler

1. [Davranış Kuralları](#davranış-kuralları)
2. [Başlarken](#başlarken)
3. [Geliştirme Ortamı](#geliştirme-ortamı)
4. [Kod Standartları](#kod-standartları)
5. [Commit Mesajları](#commit-mesajları)
6. [Branch Stratejisi](#branch-stratejisi)
7. [Pull Request Süreci](#pull-request-süreci)
8. [Test](#test)
9. [Dokümantasyon](#dokümantasyon)
10. [Hata Raporlama](#hata-raporlama)
11. [Özellik İstekleri](#özellik-istekleri)
12. [İletişim](#iletişim)

## Davranış Kuralları

Bu proje, [Contributor Covenant](https://www.contributor-covenant.org/version/2/0/code_of_conduct/) davranış kurallarını benimsemiştir. Projeye katkıda bulunan herkesin bu kurallara uyması beklenir.

## Başlarken

1. Depoyu fork'layın
2. Yerel makinenize klonlayın
3. Bağımlılıkları yükleyin
4. Yeni bir branch oluşturun
5. Değişikliklerinizi yapın
6. Testleri çalıştırın
7. Değişikliklerinizi commit'leyin
8. Branch'inizi push'layın
9. Pull Request oluşturun

## Geliştirme Ortamı

### Gereksinimler

- Node.js 18 veya üzeri
- npm 9 veya üzeri
- Git

### Kurulum

```bash
# Depoyu klonlayın
git clone https://github.com/YOUR_USERNAME/ALT_LAS.git
cd ALT_LAS/proje_dosyalari/chat_arayuzu

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

## Kod Standartları

### Genel Kurallar

- Kodunuz ESLint ve Prettier yapılandırmamıza uygun olmalıdır
- TypeScript tip güvenliği sağlanmalıdır
- Erişilebilirlik standartlarına uyulmalıdır
- Performans ve güvenlik en iyi uygulamaları takip edilmelidir

### TypeScript

- Tip tanımları için `any` kullanmaktan kaçının
- İşlevler ve bileşenler için açık dönüş tipleri belirtin
- Tip tanımlarını `src/types` dizininde tutun

### React

- Fonksiyonel bileşenler ve hook'lar kullanın
- Gereksiz yeniden render'lamaları önlemek için `React.memo`, `useMemo` ve `useCallback` kullanın
- Prop'lar için tip tanımları yapın
- Erişilebilirlik için ARIA öznitelikleri kullanın

### CSS

- CSS-in-JS için Chakra UI kullanın
- Tema değişkenlerini kullanın
- Responsive tasarım için Chakra UI'nin responsive API'sini kullanın

## Commit Mesajları

Commit mesajları için [Conventional Commits](https://www.conventionalcommits.org/) standardını kullanıyoruz:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Tipler

- `feat`: Yeni bir özellik
- `fix`: Hata düzeltmesi
- `docs`: Sadece dokümantasyon değişiklikleri
- `style`: Kod davranışını etkilemeyen değişiklikler (boşluk, biçimlendirme, vb.)
- `refactor`: Hata düzeltmesi veya özellik eklemeyen kod değişiklikleri
- `perf`: Performans iyileştirmeleri
- `test`: Test ekleme veya düzeltme
- `chore`: Yapı süreci veya yardımcı araçlardaki değişiklikler

### Örnekler

```
feat(chat): add file upload functionality
fix(auth): resolve login issue with special characters
docs(readme): update installation instructions
```

## Branch Stratejisi

- `main`: Üretim sürümü
- `develop`: Geliştirme sürümü
- `feature/*`: Yeni özellikler
- `bugfix/*`: Hata düzeltmeleri
- `hotfix/*`: Acil düzeltmeler
- `release/*`: Sürüm hazırlıkları

## Pull Request Süreci

1. PR başlığı için Conventional Commits formatını kullanın
2. PR açıklamasında değişiklikleri detaylı olarak açıklayın
3. İlgili issue'ları bağlayın
4. Tüm testlerin geçtiğinden emin olun
5. Kod incelemesi için en az bir onay alın
6. Tüm CI kontrolleri geçtikten sonra birleştirin

## Test

### Birim Testleri

```bash
# Tüm testleri çalıştır
npm test

# Testleri izleme modunda çalıştır
npm run test:watch

# Test kapsamını görüntüle
npm run test:coverage
```

### E2E Testleri

```bash
# E2E testleri çalıştır
npm run test:e2e

# Cypress'i açık modda çalıştır
npm run test:e2e:open
```

### Test Kuralları

- Her yeni özellik veya hata düzeltmesi için test yazın
- Birim testleri için Vitest ve React Testing Library kullanın
- E2E testleri için Cypress kullanın
- Test kapsamı en az %80 olmalıdır

## Dokümantasyon

- Kod içi dokümantasyon için JSDoc kullanın
- API dokümantasyonu için API.md dosyasını güncelleyin
- Kullanıcı dokümantasyonu için USER_GUIDE.md dosyasını güncelleyin
- Erişilebilirlik dokümantasyonu için ACCESSIBILITY.md dosyasını güncelleyin

## Hata Raporlama

Hata raporlarken lütfen aşağıdaki bilgileri sağlayın:

- Hatanın açık ve özlü bir açıklaması
- Hatayı yeniden oluşturmak için adımlar
- Beklenen davranış
- Gerçekleşen davranış
- Ekran görüntüleri (mümkünse)
- Ortam bilgileri (tarayıcı, işletim sistemi, vb.)

## Özellik İstekleri

Özellik isteklerinde lütfen aşağıdaki bilgileri sağlayın:

- Özelliğin açık ve özlü bir açıklaması
- Özelliğin neden gerekli olduğuna dair gerekçe
- Özelliğin nasıl çalışması gerektiğine dair detaylar
- Alternatif çözümler veya özellikler
- Mockup'lar veya tasarım fikirleri (mümkünse)

## İletişim

- E-posta: contribute@altlas.com
- Discord: [ALT_LAS Discord Sunucusu](https://discord.gg/altlas)
- GitHub Discussions: [ALT_LAS Discussions](https://github.com/krozenking/ALT_LAS/discussions)

---

Katkılarınız için teşekkür ederiz! 🎉
