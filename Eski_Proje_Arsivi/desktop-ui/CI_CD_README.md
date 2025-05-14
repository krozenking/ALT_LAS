# ALT_LAS Desktop UI CI/CD Pipeline

Bu belge, ALT_LAS Desktop UI için oluşturulan CI/CD (Sürekli Entegrasyon/Sürekli Dağıtım) pipeline'ını açıklamaktadır.

## Genel Bakış

CI/CD pipeline'ı, GitHub Actions kullanılarak oluşturulmuştur ve aşağıdaki aşamaları içermektedir:

1. **Lint ve Test**: Kod kalitesini kontrol eder ve testleri çalıştırır.
2. **Build**: Windows, macOS ve Linux için uygulama paketlerini oluşturur.
3. **Release**: Oluşturulan paketleri GitHub Releases'e yükler.

## Workflow Tetikleyicileri

Pipeline, aşağıdaki durumlarda otomatik olarak tetiklenir:

- `main` branch'ine yapılan push'lar (sadece `desktop-ui` klasöründeki değişiklikler için)
- `main` branch'ine açılan pull request'ler (sadece `desktop-ui` klasöründeki değişiklikler için)
- Manuel tetikleme (workflow_dispatch)

## İş Akışları

### 1. Lint ve Test

Bu aşamada, kod kalitesi kontrol edilir ve testler çalıştırılır:

- ESLint ile kod linting
- Vitest ile birim testleri
- Test sonuçları artifact olarak kaydedilir

### 2. Build

Bu aşamada, farklı platformlar için uygulama paketleri oluşturulur:

#### Windows Build

- Squirrel.Windows installer (.exe)
- MSI installer
- NuGet paketi

#### macOS Build

- DMG installer
- ZIP arşivi
- (Opsiyonel) Apple notarization

#### Linux Build

- Debian paketi (.deb)
- RPM paketi (.rpm)

### 3. Release

Bu aşamada, oluşturulan paketler GitHub Releases'e yüklenir:

- Sürüm numarası package.json'dan alınır
- Beta veya final sürüm olarak işaretlenir
- Tüm paketler release'e eklenir

## Ortam Değişkenleri ve Sırlar

Pipeline, aşağıdaki GitHub Secrets'ları kullanır:

- `API_GATEWAY_URL`: API Gateway URL'si
- `APPLE_ID`: macOS notarization için Apple ID
- `APPLE_ID_PASSWORD`: macOS notarization için Apple ID şifresi
- `APPLE_TEAM_ID`: macOS notarization için Apple Team ID

## Manuel Release Oluşturma

Manuel bir release oluşturmak için:

1. GitHub repository'de "Actions" sekmesine gidin
2. "Desktop UI CI/CD" workflow'unu seçin
3. "Run workflow" butonuna tıklayın
4. "Release Type" olarak "beta" veya "release" seçin
5. "Run workflow" butonuna tıklayın

## Notlar

- Pipeline, sadece `desktop-ui` klasöründeki değişiklikler için çalışır
- Her başarılı build, GitHub Artifacts'a yüklenir
- Release'ler otomatik olarak draft olarak oluşturulur ve manuel inceleme gerektirir
- Beta sürümler "prerelease" olarak işaretlenir
