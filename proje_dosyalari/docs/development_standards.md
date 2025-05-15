# ALT_LAS Geliştirme Ortamı Standartları

Bu belge, ALT_LAS projesinde tutarlı ve verimli bir geliştirme süreci sağlamak amacıyla oluşturulmuş geliştirme ortamı standartlarını tanımlamaktadır.

## 1. Kodlama Standartları ve Stil Kılavuzları

Projede kullanılan her programlama dili için genel kabul görmüş ve topluluk tarafından önerilen stil kılavuzlarına uyulacaktır. Bu, kod okunabilirliğini artıracak ve bakımını kolaylaştıracaktır.

*   **JavaScript/TypeScript (Node.js, React, Electron):**
    *   **Stil Kılavuzu:** Airbnb JavaScript Stil Kılavuzu (ESLint konfigürasyonu ile zorunlu kılınacak).
    *   **Formatlayıcı:** Prettier, tutarlı kod formatlaması için kullanılacaktır.
    *   **Linting:** ESLint, potansiyel hataları ve stil sorunlarını yakalamak için yapılandırılacaktır.
*   **Python (FastAPI, AI Servisleri):**
    *   **Stil Kılavuzu:** PEP 8.
    *   **Formatlayıcı:** Black.
    *   **Linting:** Flake8 (veya Pylint), kod kalitesini sağlamak için kullanılacaktır.
*   **Rust (Runner Service, OS Integration):**
    *   **Stil Kılavuzu:** Resmi Rust API Kılavuzları ve `rustfmt` tarafından uygulanan standartlar.
    *   **Formatlayıcı:** `rustfmt` (Rust kurulumuyla birlikte gelir).
    *   **Linting:** Clippy (Rust kurulumuyla birlikte gelir).
*   **Go (Archive Service):**
    *   **Stil Kılavuzu:** Effective Go ve `gofmt` tarafından uygulanan standartlar.
    *   **Formatlayıcı:** `gofmt` (Go kurulumuyla birlikte gelir).
    *   **Linting:** `golint` veya Staticcheck.

## 2. IDE (Entegre Geliştirme Ortamı) Önerileri

Geliştiricilerin tercih ettikleri IDE'yi kullanmaları serbest olmakla birlikte, aşağıdaki IDE'ler ve eklentiler proje ile uyumlu ve verimli bir çalışma ortamı sunmaktadır:

*   **Visual Studio Code (VS Code):**
    *   **Genel Öneri:** Tüm diller için güçlü destek ve geniş eklenti ekosistemi nedeniyle önerilir.
    *   **Önerilen Eklentiler:**
        *   ESLint, Prettier - Code formatter (JavaScript/TypeScript için)
        *   Python (Microsoft)
        *   rust-analyzer (Rust için)
        *   Go (Microsoft)
        *   Docker
        *   GitLens — Git supercharged
        *   EditorConfig for VS Code (Proje genelinde tutarlı editör ayarları için)
*   **JetBrains IDE'leri (WebStorm, PyCharm, IntelliJ IDEA with Rust/Go plugins, GoLand):**
    *   Belirli dillere odaklanmış güçlü özellikler sunar. Lisanslı ürünlerdir.

## 3. Editör Yapılandırması (EditorConfig)

Proje kök dizinine bir `.editorconfig` dosyası eklenecektir. Bu dosya, farklı editörler ve IDE'ler arasında temel kodlama stili tutarlılığını (örneğin, girinti stili, satır sonu karakterleri) sağlamaya yardımcı olacaktır.

```.editorconfig
# EditorConfig is awesome: https://EditorConfig.org

# Top-most EditorConfig file
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

## 4. Git Dallanma Stratejisi

Projede **Gitflow** benzeri bir dallanma stratejisi benimsenecektir. Bu, geliştirme süreçlerini organize etmeye, özellikleri izole etmeye ve kararlı sürümler yayınlamaya yardımcı olur.

*   **`main` (veya `master`):**
    *   Her zaman üretime hazır, kararlı sürüm kodunu içerir.
    *   Doğrudan commit yapılmaz. Yalnızca `develop` veya `hotfix` branch'lerinden merge edilir.
    *   Her merge işlemi bir sürüm etiketi (tag) ile işaretlenmelidir (örn: `v0.1.0`).
*   **`develop`:**
    *   En son geliştirilmiş özellikleri içeren ana geliştirme branch'idir.
    *   Yeni özellikler için `feature` branch'leri buradan oluşturulur.
    *   Tamamlanan özellikler ve düzeltmeler buraya merge edilir.
    *   `main` branch'ine merge edilmeden önce kapsamlı testlerden geçmelidir.
*   **`feature/<feature-name>`:**
    *   Yeni özellikler geliştirmek için `develop` branch'inden oluşturulur.
    *   Örnek: `feature/user-authentication`, `feature/new-segmentation-algorithm`.
    *   Tamamlandığında `develop` branch'ine pull request ile merge edilir.
*   **`release/<release-version>` (Pre-Alpha sonrası için daha relevant):**
    *   Yeni bir üretim sürümü hazırlamak için `develop` branch'inden oluşturulur.
    *   Bu branch üzerinde yalnızca hata düzeltmeleri, dokümantasyon güncellemeleri ve sürüme özgü küçük değişiklikler yapılır.
    *   Hazır olduğunda hem `main` hem de `develop` branch'ine merge edilir.
*   **`hotfix/<fix-description>`:**
    *   Üretimdeki (`main`) kritik bir hatayı acilen düzeltmek için `main` branch'inden oluşturulur.
    *   Tamamlandığında hem `main` hem de `develop` branch'ine (veya aktif `release` branch'ine) merge edilir.

**Commit Mesajları:**

*   Anlamlı ve açıklayıcı commit mesajları yazılmalıdır.
*   Tercihen [Conventional Commits](https://www.conventionalcommits.org/) formatına uyulması önerilir (örn: `feat: implement user login endpoint`, `fix: resolve issue with task parsing`).

## 5. Bağımlılık Yönetimi

*   Her servis kendi bağımlılıklarını kendi `package.json` (Node.js), `requirements.txt` veya `pyproject.toml` (Python), `Cargo.toml` (Rust), `go.mod` (Go) dosyalarında yönetecektir.
*   Mümkün olduğunca kilit dosyaları (`package-lock.json`, `poetry.lock`, `Cargo.lock`, `go.sum`) repoya dahil edilerek tekrarlanabilir build'ler sağlanacaktır.
*   Bağımlılıklar düzenli olarak güncellenmeli ve güvenlik açıkları için taranmalıdır.

Bu standartlar, projenin büyümesi ve daha fazla geliştiricinin katılmasıyla birlikte gözden geçirilebilir ve güncellenebilir.

