# ALT_LAS Desktop UI Geliştirici Kılavuzu

## İçindekiler

1. [Giriş](#giriş)
2. [Geliştirme Ortamı Kurulumu](#geliştirme-ortamı-kurulumu)
3. [Proje Yapısı](#proje-yapısı)
4. [Geliştirme İş Akışı](#geliştirme-i̇ş-akışı)
5. [Kodlama Standartları](#kodlama-standartları)
6. [Test Etme](#test-etme)
7. [Derleme ve Paketleme](#derleme-ve-paketleme)
8. [Katkıda Bulunma](#katkıda-bulunma)

## Giriş

ALT_LAS Desktop UI, Electron, React, TypeScript ve Chakra UI kullanılarak geliştirilmiş bir masaüstü uygulamasıdır. Bu dokümantasyon, uygulamanın geliştirilmesi, test edilmesi ve dağıtılması için gerekli bilgileri içerir.

### Teknoloji Yığını

- **Electron**: Çapraz platform masaüstü uygulamaları geliştirmek için kullanılan framework
- **React**: Kullanıcı arayüzü geliştirmek için kullanılan JavaScript kütüphanesi
- **TypeScript**: JavaScript'in tip güvenli bir üst kümesi
- **Chakra UI**: React için tasarlanmış bileşen kütüphanesi
- **Webpack**: Modül paketleyici
- **Jest**: Test framework'ü
- **Cypress**: End-to-end test framework'ü
- **Electron Builder**: Electron uygulamalarını paketlemek için kullanılan araç

## Geliştirme Ortamı Kurulumu

### Gereksinimler

- **Node.js**: v18.x veya daha yeni
- **npm**: v9.x veya daha yeni
- **Git**: Sürüm kontrolü için

### Kurulum Adımları

1. Depoyu klonlayın:

```bash
git clone https://github.com/alt-las/desktop-ui.git
cd desktop-ui
```

2. Bağımlılıkları yükleyin:

```bash
npm install
```

3. Geliştirme modunda uygulamayı başlatın:

```bash
npm run dev
```

### Geliştirme Araçları

Aşağıdaki araçları kullanmanızı öneririz:

- **Visual Studio Code**: Kod düzenleme için
- **ESLint**: Kod kalitesi için
- **Prettier**: Kod formatlaması için
- **React Developer Tools**: React bileşenlerini incelemek için
- **Electron DevTools Installer**: Electron DevTools için

VS Code için önerilen eklentiler:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Debugger for Chrome
- Jest
- EditorConfig for VS Code

## Proje Yapısı

```
desktop-ui/
├── .github/                # GitHub Actions ve PR şablonları
├── build/                  # Derleme çıktıları
├── dist/                   # Paketleme çıktıları
├── docs/                   # Dokümantasyon
├── node_modules/           # Bağımlılıklar
├── resources/              # Uygulama kaynakları (simgeler, vb.)
├── src/                    # Kaynak kodları
│   ├── main/               # Electron ana süreci
│   │   ├── ipc/            # IPC işleyicileri
│   │   ├── menu/           # Uygulama menüleri
│   │   ├── services/       # Ana süreç servisleri
│   │   ├── utils/          # Yardımcı fonksiyonlar
│   │   └── main.ts         # Ana giriş noktası
│   ├── renderer/           # Electron renderer süreci (React)
│   │   ├── assets/         # Statik varlıklar
│   │   ├── components/     # React bileşenleri
│   │   │   ├── core/       # Temel bileşenler
│   │   │   ├── composition/# Kompozisyon bileşenleri
│   │   │   ├── feature/    # Özellik bileşenleri
│   │   │   └── layouts/    # Düzen bileşenleri
│   │   ├── hooks/          # Özel React hook'ları
│   │   ├── pages/          # Sayfa bileşenleri
│   │   ├── services/       # Renderer servisleri
│   │   ├── store/          # Durum yönetimi
│   │   ├── styles/         # Global stiller
│   │   ├── utils/          # Yardımcı fonksiyonlar
│   │   ├── App.tsx         # Ana React bileşeni
│   │   ├── index.html      # HTML şablonu
│   │   └── index.tsx       # Renderer giriş noktası
│   └── shared/             # Ana ve renderer süreçleri arasında paylaşılan kod
│       ├── constants/      # Sabitler
│       ├── types/          # TypeScript tipleri
│       └── utils/          # Paylaşılan yardımcı fonksiyonlar
├── test/                   # Test dosyaları
│   ├── e2e/                # End-to-end testler
│   ├── unit/               # Birim testler
│   └── setup.ts            # Test kurulumu
├── .editorconfig           # EditorConfig ayarları
├── .eslintrc.js            # ESLint ayarları
├── .gitignore              # Git tarafından yok sayılacak dosyalar
├── .prettierrc             # Prettier ayarları
├── electron-builder.yml    # Electron Builder yapılandırması
├── jest.config.js          # Jest yapılandırması
├── package.json            # Proje meta verileri ve bağımlılıkları
├── tsconfig.json           # TypeScript yapılandırması
├── webpack.main.config.js  # Ana süreç için Webpack yapılandırması
└── webpack.renderer.config.js # Renderer süreç için Webpack yapılandırması
```

## Geliştirme İş Akışı

### Branching Stratejisi

Projede Git Flow branching stratejisi kullanılmaktadır:

- **main**: Üretim sürümleri
- **develop**: Geliştirme sürümleri
- **feature/xxx**: Yeni özellikler
- **bugfix/xxx**: Hata düzeltmeleri
- **release/x.x.x**: Sürüm hazırlıkları
- **hotfix/xxx**: Acil düzeltmeler

### Özellik Geliştirme

Yeni bir özellik geliştirmek için:

1. `develop` branch'inden yeni bir feature branch'i oluşturun:

```bash
git checkout develop
git pull
git checkout -b feature/my-feature
```

2. Özelliği geliştirin ve testleri yazın.
3. Değişikliklerinizi commit'leyin:

```bash
git add .
git commit -m "feat: add my feature"
```

4. Branch'inizi uzak depoya push'layın:

```bash
git push -u origin feature/my-feature
```

5. GitHub'da bir Pull Request oluşturun.

### Commit Mesajları

Commit mesajları için Conventional Commits standardını kullanıyoruz:

- `feat`: Yeni bir özellik
- `fix`: Bir hata düzeltmesi
- `docs`: Sadece dokümantasyon değişiklikleri
- `style`: Kod davranışını etkilemeyen değişiklikler (boşluk, biçimlendirme, vb.)
- `refactor`: Hata düzeltmesi veya özellik eklemeyen kod değişiklikleri
- `perf`: Performansı artıran değişiklikler
- `test`: Test ekleme veya düzeltme
- `chore`: Derleme süreci veya yardımcı araçlardaki değişiklikler

Örnek:

```
feat: add file upload progress indicator

This commit adds a progress indicator for file uploads to improve user experience.
The indicator shows the upload progress in real-time and allows cancellation.
```

## Kodlama Standartları

### TypeScript

- Tip güvenliği için `any` tipinden kaçının.
- Interface'leri `I` öneki olmadan adlandırın (örn. `User` vs `IUser`).
- Tip tanımlarını ilgili dosyalarda veya `src/shared/types` dizininde tanımlayın.
- Nullable tipleri açıkça belirtin (örn. `string | null`).

### React

- Fonksiyonel bileşenler ve hook'lar kullanın.
- Bileşenleri atomik tasarım prensibine göre organize edin.
- Prop'lar için tip tanımları kullanın.
- Mümkün olduğunca bileşenleri küçük ve tek sorumluluk prensibine uygun tutun.
- Performans için `React.memo`, `useMemo` ve `useCallback` kullanın.

### Stil

- Chakra UI bileşenlerini ve tema sistemini kullanın.
- Global stiller için `src/renderer/styles` dizinini kullanın.
- Responsive tasarım için Chakra UI'ın responsive değerlerini kullanın.
- Tema değişkenlerini doğrudan kullanın, sabit değerlerden kaçının.

### Dosya Organizasyonu

- Bileşenler için `PascalCase` kullanın (örn. `Button.tsx`).
- Hook'lar için `camelCase` ve `use` öneki kullanın (örn. `useAuth.ts`).
- Yardımcı fonksiyonlar için `camelCase` kullanın (örn. `formatDate.ts`).
- Her bileşen kendi dizininde olmalı ve `index.ts` dosyası ile dışa aktarılmalı.

Örnek:

```
components/
└── Button/
    ├── Button.tsx
    ├── Button.test.tsx
    └── index.ts
```

## Test Etme

### Birim Testleri

Birim testleri için Jest ve React Testing Library kullanıyoruz:

```bash
# Tüm testleri çalıştır
npm test

# Belirli bir testi çalıştır
npm test -- -t "Button component"

# Test kapsamını kontrol et
npm test -- --coverage
```

Örnek test:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### End-to-End Testleri

End-to-end testleri için Cypress kullanıyoruz:

```bash
# Cypress test runner'ı aç
npm run e2e

# Headless modda testleri çalıştır
npm run e2e:run
```

Örnek test:

```typescript
describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login with valid credentials', () => {
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Derleme ve Paketleme

### Geliştirme Derlemesi

```bash
# Geliştirme modunda çalıştır
npm run dev

# Ana süreç kodunu derle
npm run build:main

# Renderer süreç kodunu derle
npm run build:renderer
```

### Üretim Derlemesi

```bash
# Tüm kodu derle
npm run build

# Uygulamayı paketleme
npm run package

# Uygulamayı paketleme ve dağıtım dosyalarını oluşturma
npm run make
```

### Sürüm Oluşturma

```bash
# Yeni bir sürüm oluştur
npm run release
```

Bu komut şunları yapar:
1. Sürüm numarasını artırır
2. CHANGELOG.md dosyasını günceller
3. Değişiklikleri commit'ler
4. Sürüm tag'i oluşturur
5. Değişiklikleri uzak depoya push'lar

## Katkıda Bulunma

### Hata Raporlama

Hataları GitHub Issues üzerinden raporlayın. Hata raporlarında şunları belirtin:

- Hatanın açıklaması
- Hatayı yeniden oluşturma adımları
- Beklenen davranış
- Gerçek davranış
- Ekran görüntüleri (varsa)
- Sistem bilgileri (işletim sistemi, uygulama sürümü, vb.)

### Özellik İstekleri

Özellik isteklerini GitHub Issues üzerinden gönderin. İsteklerde şunları belirtin:

- Özelliğin açıklaması
- Kullanım senaryoları
- Alternatif çözümler
- Ek bağlam veya görseller

### Pull Request Süreci

1. Değişikliklerinizi bir feature branch'inde geliştirin.
2. Kodunuzu test edin ve lint kontrollerinden geçtiğinden emin olun.
3. Commit mesajlarınızın Conventional Commits standardına uygun olduğundan emin olun.
4. Pull Request oluşturun ve PR şablonunu doldurun.
5. Code review sürecini bekleyin.
6. Geri bildirimlere göre değişiklikler yapın.
7. PR'ınız onaylandığında, değişiklikleriniz `develop` branch'ine merge edilecektir.

### Kod İnceleme Kontrol Listesi

- Kod, kodlama standartlarına uygun mu?
- Yeterli test kapsamı var mı?
- Dokümantasyon güncel mi?
- Performans sorunları var mı?
- Güvenlik sorunları var mı?
- Kod tekrarı var mı?
- Kod okunabilir ve anlaşılabilir mi?
