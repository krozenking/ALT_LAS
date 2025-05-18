# Kıdemli Frontend Geliştirici (Zeynep Aydın) Detaylı Görev Planı

Bu belge, ALT_LAS projesinin yeni kullanıcı arayüzü (UI) geliştirme planında Kıdemli Frontend Geliştirici (Zeynep Aydın) personasına atanan tüm görevlerin makro, mikro ve atlas seviyesinde detaylı kırılımını içermektedir.

## YUI-KM0-004: Öncelikli Tasarım Sistemi (Design System) Oluşturulması ve Ana Bileşen Kütüphanesi

### Alt Görev 3: Bileşen Kütüphanesinin (Component Library) Frontend Tarafından Geliştirilmesi
*   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
*   **Tahmini Efor:** 5 gün (Bu fazda temel bileşenlerin ilk versiyonları)
*   **Çıktılar:** Temel UI bileşenlerini içeren, yeniden kullanılabilir bir frontend bileşen kütüphanesinin ilk versiyonu

    #### Makro Görev 3.1: Tasarım Sistemindeki Temel Bileşenlerin Kod Olarak Geliştirilmesi
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 3.1.1:** Buton bileşenlerinin (tasarımda belirtilen tüm varyasyon ve durumlarıyla) React (veya seçilen framework) ile kodlanması
        *   **Atlas Görevi 3.1.1.1:** Buton bileşeni için temel yapının oluşturulması (props, state, render fonksiyonu)
        *   **Atlas Görevi 3.1.1.2:** Birincil, ikincil, üçüncül buton varyasyonlarının kodlanması
        *   **Atlas Görevi 3.1.1.3:** Buton durumlarının (default, hover, active, disabled) CSS/styled-components ile kodlanması
        *   **Atlas Görevi 3.1.1.4:** İkonlu buton, tam genişlikli buton gibi varyasyonların eklenmesi
        *   **Atlas Görevi 3.1.1.5:** Bileşenlerin `props` aracılığıyla özelleştirilebilir ve stil açısından tema uyumlu olmasının sağlanması
        *   **Atlas Görevi 3.1.1.6:** Her buton bileşeni için birim testlerinin (unit tests) yazılması
    *   **Mikro Görev 3.1.2:** Form elemanlarının kodlanması ve birim testlerinin yazılması
        *   **Atlas Görevi 3.1.2.1:** Input bileşeninin (text, number, email vb. tipleriyle) kodlanması
        *   **Atlas Görevi 3.1.2.2:** Textarea bileşeninin kodlanması
        *   **Atlas Görevi 3.1.2.3:** Select/Dropdown bileşeninin kodlanması
        *   **Atlas Görevi 3.1.2.4:** Checkbox ve Radio buton bileşenlerinin kodlanması
        *   **Atlas Görevi 3.1.2.5:** Toggle/Switch bileşeninin kodlanması
        *   **Atlas Görevi 3.1.2.6:** Form validasyon ve hata gösterimi mekanizmalarının eklenmesi
        *   **Atlas Görevi 3.1.2.7:** Her form elemanı için birim testlerinin yazılması
    *   **Mikro Görev 3.1.3:** Kart, liste ve tablo bileşenlerinin kodlanması
        *   **Atlas Görevi 3.1.3.1:** Kart bileşeninin (başlık, içerik, alt bilgi alanlarıyla) kodlanması
        *   **Atlas Görevi 3.1.3.2:** Liste bileşeninin (sıralı, sırasız, ikonlu vb. varyasyonlarla) kodlanması
        *   **Atlas Görevi 3.1.3.3:** Tablo bileşeninin (sıralama, filtreleme özellikleriyle) kodlanması
        *   **Atlas Görevi 3.1.3.4:** Her bileşen için birim testlerinin yazılması
    *   **Mikro Görev 3.1.4:** Navigasyon ve bildirim bileşenlerinin kodlanması
        *   **Atlas Görevi 3.1.4.1:** Tab bileşeninin kodlanması
        *   **Atlas Görevi 3.1.4.2:** Breadcrumb bileşeninin kodlanması
        *   **Atlas Görevi 3.1.4.3:** Pagination bileşeninin kodlanması
        *   **Atlas Görevi 3.1.4.4:** Toast/Alert bildirim bileşenlerinin kodlanması
        *   **Atlas Görevi 3.1.4.5:** Modal/Dialog bileşeninin kodlanması
        *   **Atlas Görevi 3.1.4.6:** Tooltip ve Popover bileşenlerinin kodlanması
        *   **Atlas Görevi 3.1.4.7:** Her bileşen için birim testlerinin yazılması

    #### Makro Görev 3.2: Geliştirilen Bileşenlerin Storybook (veya Benzeri Bir Araç) ile Dokümante Edilmesi ve Test Edilmesi
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 3.2.1:** Storybook (veya benzeri bir bileşen geliştirme ve dokümantasyon aracı) projesinin kurulması ve konfigüre edilmesi
        *   **Atlas Görevi 3.2.1.1:** Storybook'un projeye eklenmesi ve temel konfigürasyonunun yapılması
        *   **Atlas Görevi 3.2.1.2:** Tema ve global stillerin Storybook'a entegre edilmesi
        *   **Atlas Görevi 3.2.1.3:** Storybook eklentilerinin (addon-a11y, addon-interactions, addon-docs vb.) kurulması ve konfigüre edilmesi
    *   **Mikro Görev 3.2.2:** Geliştirilen her bileşen için Storybook hikayelerinin (stories) yazılarak farklı `props` ve durumlarının interaktif olarak sergilenmesi
        *   **Atlas Görevi 3.2.2.1:** Buton bileşeni için tüm varyasyon ve durumları gösteren hikayelerin yazılması
        *   **Atlas Görevi 3.2.2.2:** Form elemanları için hikayelerin yazılması
        *   **Atlas Görevi 3.2.2.3:** Kart, liste ve tablo bileşenleri için hikayelerin yazılması
        *   **Atlas Görevi 3.2.2.4:** Navigasyon ve bildirim bileşenleri için hikayelerin yazılması
        *   **Atlas Görevi 3.2.2.5:** Storybook üzerinde erişilebilirlik (addon-a11y) ve etkileşim testleri (addon-interactions) için eklentilerin kullanılması
    *   **Mikro Görev 3.2.3:** Bileşen dokümantasyonunun hazırlanması
        *   **Atlas Görevi 3.2.3.1:** Her bileşen için kullanım örnekleri, props açıklamaları ve best practice'lerin yazılması
        *   **Atlas Görevi 3.2.3.2:** Erişilebilirlik notlarının eklenmesi
        *   **Atlas Görevi 3.2.3.3:** "Do's and Don'ts" örneklerinin hazırlanması

## YUI-KM0-006: Kullanılacak Frontend Framework ve Ana Kütüphaneler için Versiyon Politikaları ve Güncelleme Stratejileri

### Alt Görev 1: Mevcut ve Potansiyel Frontend Teknolojilerinin Gözden Geçirilmesi
*   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
*   **Tahmini Efor:** 1 gün
*   **Çıktılar:** Onaylanmış frontend framework ve ana kütüphane listesi

    #### Makro Görev 1.1: Proje İhtiyaçları ve Mimari Kararlar Doğrultusunda Frontend Framework Seçiminin Teyit Edilmesi
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 1.1.1:** `comprehensive_ui_development_plan_final_v1.0.md` (Bölüm 9.1) ve `UI_Mimari_Plan_Dokumani_v1.0.md` (YUI-KM0-002 çıktısı) belgelerinde belirtilen frontend teknolojilerinin güncel durumlarının ve proje gereksinimleriyle uyumluluğunun son bir kez değerlendirilmesi
        *   **Atlas Görevi 1.1.1.1:** React, TypeScript, Electron, Chakra UI vb. teknolojilerin en güncel sürümlerinin ve özelliklerinin araştırılması
        *   **Atlas Görevi 1.1.1.2:** Bu teknolojilerin proje gereksinimleriyle uyumluluğunun değerlendirilmesi
        *   **Atlas Görevi 1.1.1.3:** Seçilen framework ve kütüphanelerin topluluk desteği, dokümantasyon kalitesi, performans metrikleri ve güvenlik geçmişlerinin hızlıca gözden geçirilmesi
    *   **Mikro Görev 1.1.2:** Seçilen ana kütüphaneler için alternatiflerin kısa bir analizinin yapılması ve nihai kararın verilmesi
        *   **Atlas Görevi 1.1.2.1:** State management için Redux, Zustand, MobX, Recoil gibi alternatiflerin karşılaştırılması
        *   **Atlas Görevi 1.1.2.2:** Routing için React Router, TanStack Router gibi alternatiflerin karşılaştırılması
        *   **Atlas Görevi 1.1.2.3:** UI bileşen kütüphanesi için Chakra UI, MUI, Ant Design gibi alternatiflerin karşılaştırılması
        *   **Atlas Görevi 1.1.2.4:** Form yönetimi için React Hook Form, Formik gibi alternatiflerin karşılaştırılması
        *   **Atlas Görevi 1.1.2.5:** Veri fetching için React Query, SWR gibi alternatiflerin karşılaştırılması
        *   **Atlas Görevi 1.1.2.6:** Karşılaştırma sonuçlarının dokümante edilmesi ve nihai kararların verilmesi

### Alt Görev 2: Versiyon Politikalarının Belirlenmesi
*   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
*   **Tahmini Efor:** 1 gün
*   **Çıktılar:** Frontend framework ve ana kütüphaneler için versiyon politikası dokümanı

    #### Makro Görev 2.1: Her Bir Ana Teknoloji İçin Sürüm Stratejisinin (LTS, En Güncel Kararlı Sürüm vb.) Tanımlanması
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 2.1.1:** React, TypeScript, Electron ve diğer ana kütüphaneler için hangi sürüm stratejisinin benimseneceğinin belirlenmesi
        *   **Atlas Görevi 2.1.1.1:** Her teknoloji için resmi sürüm takvimlerinin ve destek politikalarının incelenmesi
        *   **Atlas Görevi 2.1.1.2:** LTS (Uzun Süreli Destek) sürümlerini tercih etme, en güncel kararlı majör/minör sürümleri takip etme gibi stratejilerin değerlendirilmesi
        *   **Atlas Görevi 2.1.1.3:** Her teknoloji için sürüm stratejisinin belirlenmesi ve gerekçelendirilmesi
    *   **Mikro Görev 2.1.2:** Güvenlik açıkları ve kritik hata düzeltmeleri içeren yamaların (patch) ne sıklıkta ve nasıl uygulanacağına dair bir politika oluşturulması
        *   **Atlas Görevi 2.1.2.1:** Güvenlik yamalarının hemen uygulanması, periyodik toplu güncelleme gibi yaklaşımların değerlendirilmesi
        *   **Atlas Görevi 2.1.2.2:** Güvenlik açıkları için izleme mekanizmasının belirlenmesi (npm audit, Dependabot vb.)
        *   **Atlas Görevi 2.1.2.3:** Yama uygulama politikasının dokümante edilmesi

    #### Makro Görev 2.2: Bağımlılık Yönetimi Araçları ve Süreçlerinin Belirlenmesi
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 2.2.1:** Projede kullanılacak paket yöneticisinin (npm, yarn, pnpm) standartlaştırılması
        *   **Atlas Görevi 2.2.1.1:** Paket yöneticilerinin performans, güvenlik ve özellik açısından karşılaştırılması
        *   **Atlas Görevi 2.2.1.2:** Proje ihtiyaçlarına en uygun paket yöneticisinin seçilmesi
        *   **Atlas Görevi 2.2.1.3:** Seçilen paket yöneticisi için best practice'lerin dokümante edilmesi
    *   **Mikro Görev 2.2.2:** Bağımlılıkların kilitlenmesi ve düzenli olarak güncel bağımlılıkların kontrol edilmesi için süreçlerin tanımlanması
        *   **Atlas Görevi 2.2.2.1:** `package-lock.json`, `yarn.lock` gibi kilit dosyalarının kullanımı ve yönetimi için kuralların belirlenmesi
        *   **Atlas Görevi 2.2.2.2:** `npm outdated`, Dependabot gibi araçların kullanımı için süreçlerin tanımlanması
        *   **Atlas Görevi 2.2.2.3:** Dependabot veya benzeri bir aracın GitHub reposuna entegre edilmesi için DevOps Mühendisi ile koordinasyon sağlanması

### Alt Görev 3: Güncelleme Stratejilerinin ve Test Süreçlerinin Tanımlanması
*   **Sorumlu Personalar:** Kıdemli Frontend Geliştirici (Zeynep Aydın), QA Mühendisi (Ayşe Kaya)
*   **Tahmini Efor:** 1 gün
*   **Çıktılar:** Kütüphane güncelleme stratejisi ve test prosedürleri dokümanı

    #### Makro Görev 3.1: Majör, Minör ve Patch Güncellemeleri İçin Bir Değerlendirme ve Uygulama Takviminin Oluşturulması
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 3.1.1:** Minör ve patch güncellemelerinin ne sıklıkta değerlendirileceği ve uygulanacağına dair bir takvim oluşturulması
        *   **Atlas Görevi 3.1.1.1:** Güncelleme sıklığının belirlenmesi (her sprint, aylık vb.)
        *   **Atlas Görevi 3.1.1.2:** Güncelleme değerlendirme sürecinin tanımlanması
        *   **Atlas Görevi 3.1.1.3:** Güncelleme uygulama sürecinin tanımlanması
    *   **Mikro Görev 3.1.2:** Majör sürüm güncellemeleri için daha kapsamlı bir değerlendirme ve planlama sürecinin tanımlanması
        *   **Atlas Görevi 3.1.2.1:** Majör güncellemelerin değerlendirilmesi için kriterlerin belirlenmesi (yeni özellikler, kırılgan değişiklikler - breaking changes, migrasyon eforu)
        *   **Atlas Görevi 3.1.2.2:** Majör güncellemeler öncesinde ayrı bir özellik dalında (feature branch) PoC (Proof of Concept) yapılmasının standartlaştırılması
        *   **Atlas Görevi 3.1.2.3:** Majör güncelleme planının dokümante edilmesi

    #### Makro Görev 3.2: Kütüphane Güncellemeleri Sonrasında Uygulanacak Regresyon Testi Prosedürlerinin Belirlenmesi
    *   **Sorumlu Persona:** QA Mühendisi (Ayşe Kaya)
    *   **Mikro Görev 3.2.1:** Herhangi bir kütüphane güncellemesi sonrasında, uygulamanın ana işlevlerinin bozulmadığından emin olmak için çalıştırılacak temel regresyon test senaryolarının listesinin oluşturulması
        *   **Atlas Görevi 3.2.1.1:** Kritik fonksiyonlar için regresyon test senaryolarının belirlenmesi
        *   **Atlas Görevi 3.2.1.2:** UI bileşenleri için görsel regresyon test senaryolarının belirlenmesi
        *   **Atlas Görevi 3.2.1.3:** Bu regresyon testlerinin mümkün olduğunca otomatize edilmesi için DevOps Mühendisi ile iş birliği yapılması
    *   **Mikro Görev 3.2.2:** Güncelleme sonrası olası risk alanlarının belirlenmesi ve bu alanlara yönelik özel testlerin planlanması
        *   **Atlas Görevi 3.2.2.1:** Güncellenen kütüphanenin değişiklik günlüğünün (changelog) incelenmesi
        *   **Atlas Görevi 3.2.2.2:** Değişikliklerden etkilenebilecek alanların belirlenmesi
        *   **Atlas Görevi 3.2.2.3:** Bu alanlara yönelik özel test senaryolarının oluşturulması

## YUI-KM1-003: Chat Sekmesi Frontend Geliştirmesi (Yap)

### Alt Görev 1: Chat Sekmesi İçin Gerekli Frontend Altyapısının Kurulumu
*   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
*   **Tahmini Efor:** 1 gün
*   **Çıktılar:** Chat sekmesi için özel state management (durum yönetimi) modülü, API servis katmanı

    #### Makro Görev 1.1: Chat Özelliklerine Özel State Management Yapısının (örn: Zustand slice, Redux reducer) Oluşturulması
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 1.1.1:** Sohbet listesi, aktif sohbet mesajları, kullanıcı bilgileri, bildirimler gibi chat ile ilgili verilerin state'de nasıl tutulacağının planlanması
        *   **Atlas Görevi 1.1.1.1:** Chat state modelinin tasarlanması (veri yapıları, ilişkiler)
        *   **Atlas Görevi 1.1.1.2:** Normalleştirme stratejisinin belirlenmesi (normalizr vb. kullanımı)
        *   **Atlas Görevi 1.1.1.3:** Performans optimizasyonu için stratejilerin belirlenmesi (memoization, lazy loading vb.)
    *   **Mikro Görev 1.1.2:** State'i güncelleyecek action'ların ve selector'ların tanımlanması
        *   **Atlas Görevi 1.1.2.1:** Chat action'larının tanımlanması (mesaj gönderme, sohbet listesi güncelleme vb.)
        *   **Atlas Görevi 1.1.2.2:** Selector'ların tanımlanması (filtrelenmiş sohbet listesi, okunmamış mesaj sayısı vb.)
        *   **Atlas Görevi 1.1.2.3:** Seçilen state management kütüphanesine (örn: Zustand) uygun olarak chat modülünün oluşturulması

    #### Makro Görev 1.2: Chat API Endpoint'lerine (YUI-KM1-002) İstek Atacak Servis Katmanının (API Client) Oluşturulması
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 1.2.1:** Onaylanmış API kontratına göre mesaj gönderme, sohbet listesini alma, grup oluşturma gibi her bir API operasyonu için bir fonksiyonun yazılması
        *   **Atlas Görevi 1.2.1.1:** API istek fonksiyonlarının temel yapısının oluşturulması
        *   **Atlas Görevi 1.2.1.2:** API istekleri için `axios` veya `fetch` gibi bir HTTP client kütüphanesinin kullanılması
        *   **Atlas Görevi 1.2.1.3:** Her API endpoint'i için istek fonksiyonlarının yazılması
        *   **Atlas Görevi 1.2.1.4:** API hatalarının (error handling) ve yükleme durumlarının (loading states) yönetimi için standart bir yapının oluşturulması
    *   **Mikro Görev 1.2.2:** Real-time iletişim için WebSocket veya SSE bağlantı yönetimi altyapısının kurulması (eğer API kontratında tanımlanmışsa)
        *   **Atlas Görevi 1.2.2.1:** WebSocket/SSE bağlantı yönetimi için bir servis oluşturulması
        *   **Atlas Görevi 1.2.2.2:** Bağlantı durumu yönetimi (açma, kapatma, yeniden bağlanma) mekanizmalarının eklenmesi
        *   **Atlas Görevi 1.2.2.3:** Mesaj alımı, "yazıyor" bildirimleri gibi real-time olayların dinlenmesi ve işlenmesi için fonksiyonların yazılması

### Alt Görev 2: Chat Sekmesi Ana Arayüz Bileşenlerinin Geliştirilmesi
*   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
*   **Tahmini Efor:** 4 gün
*   **Çıktılar:** Geliştirilmiş ve test edilmiş ana chat arayüz bileşenleri

    #### Makro Görev 2.1: Sohbet Listesi Bileşeninin (Conversation List) Geliştirilmesi
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 2.1.1:** Tasarım sistemindeki (YUI-KM0-004) bileşenler kullanılarak ve onaylanmış tasarıma (YUI-KM1-001) göre sohbet listesi arayüzünün kodlanması
        *   **Atlas Görevi 2.1.1.1:** Sohbet listesi container bileşeninin oluşturulması
        *   **Atlas Görevi 2.1.1.2:** Her bir sohbet öğesi için (kullanıcı avatarı, son mesaj, zaman damgası, okunmamış mesaj sayısı) alt bileşenlerin oluşturulması
        *   **Atlas Görevi 2.1.1.3:** Sohbet listesi başlığı ve arama alanının eklenmesi
        *   **Atlas Görevi 2.1.1.4:** Sohbet listesi filtreleme ve sıralama özelliklerinin eklenmesi
    *   **Mikro Görev 2.1.2:** Sohbet listesinin API'den gelen verilerle doldurulması ve yeni mesaj geldiğinde güncellenmesinin sağlanması
        *   **Atlas Görevi 2.1.2.1:** Sohbet listesini API'den çekme fonksiyonunun eklenmesi
        *   **Atlas Görevi 2.1.2.2:** Sohbet listesinin state'e bağlanması
        *   **Atlas Görevi 2.1.2.3:** Yeni mesaj geldiğinde sohbet listesinin güncellenmesi için WebSocket/SSE dinleyicilerinin eklenmesi
        *   **Atlas Görevi 2.1.2.4:** Sohbet listesi için sonsuz kaydırma (infinite scroll) veya sayfalama (pagination) özelliğinin eklenmesi

    #### Makro Görev 2.2: Mesajlaşma Alanı (Message Pane) Bileşeninin Geliştirilmesi
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 2.2.1:** Seçili sohbete ait mesajların listelendiği, mesaj giriş alanının (metin, emoji, dosya ekleme butonları) ve gönderme butonunun bulunduğu arayüzün kodlanması
        *   **Atlas Görevi 2.2.1.1:** Mesajlaşma alanı container bileşeninin oluşturulması
        *   **Atlas Görevi 2.2.1.2:** Mesaj baloncukları (gönderen/alıcı) için ayrı bileşenlerin oluşturulması
        *   **Atlas Görevi 2.2.1.3:** Mesaj içeriği render bileşeninin oluşturulması (metin, emoji, bağlantı, dosya önizleme desteği ile)
        *   **Atlas Görevi 2.2.1.4:** Mesaj giriş alanı ve gönderme butonu bileşenlerinin oluşturulması
        *   **Atlas Görevi 2.2.1.5:** Emoji seçici, dosya ekleme gibi yardımcı bileşenlerin eklenmesi
        *   **Atlas Görevi 2.2.1.6:** Sonsuz kaydırma (infinite scroll) veya sayfalama (pagination) ile eski mesajların yüklenmesi özelliğinin eklenmesi
    *   **Mikro Görev 2.2.2:** Mesaj gönderme ve alma işlevselliğinin API ile entegre edilmesi
        *   **Atlas Görevi 2.2.2.1:** Mesaj gönderme fonksiyonunun API servis katmanı ile entegre edilmesi
        *   **Atlas Görevi 2.2.2.2:** Mesaj listesini API'den çekme fonksiyonunun eklenmesi
        *   **Atlas Görevi 2.2.2.3:** Yeni mesaj geldiğinde mesaj listesinin güncellenmesi için WebSocket/SSE dinleyicilerinin eklenmesi
        *   **Atlas Görevi 2.2.2.4:** "Yazıyor..." göstergesinin WebSocket/SSE ile entegre edilmesi
        *   **Atlas Görevi 2.2.2.5:** Dosya yükleme ve paylaşma fonksiyonlarının API ile entegre edilmesi

    #### Makro Görev 2.3: Chat Başlığı (Chat Header) ve Kullanıcı/Grup Bilgi Alanlarının Geliştirilmesi
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 2.3.1:** Aktif sohbetin başlığını (kişi adı veya grup adı), arama ve diğer eylem butonlarını içeren header bileşeninin kodlanması
        *   **Atlas Görevi 2.3.1.1:** Chat header container bileşeninin oluşturulması
        *   **Atlas Görevi 2.3.1.2:** Kişi/grup bilgisi ve avatar bileşeninin eklenmesi
        *   **Atlas Görevi 2.3.1.3:** Arama, ayarlar, diğer eylemler için butonların eklenmesi
        *   **Atlas Görevi 2.3.1.4:** Online durum göstergesinin eklenmesi
    *   **Mikro Görev 2.3.2:** Kullanıcı veya grup detaylarının (profil resmi, durum, üyeler vb.) gösterildiği bir yan panel veya modal bileşeninin geliştirilmesi
        *   **Atlas Görevi 2.3.2.1:** Kullanıcı/grup detay paneli container bileşeninin oluşturulması
        *   **Atlas Görevi 2.3.2.2:** Profil bilgileri bölümünün eklenmesi
        *   **Atlas Görevi 2.3.2.3:** Grup üyeleri listesi bileşeninin eklenmesi (grup sohbetleri için)
        *   **Atlas Görevi 2.3.2.4:** Paylaşılan medya/dosya galerisi bileşeninin eklenmesi
        *   **Atlas Görevi 2.3.2.5:** Bildirim ayarları, engelleme gibi eylem butonlarının eklenmesi

### Alt Görev 3: Chat Sekmesi Yardımcı Fonksiyonlarının Geliştirilmesi
*   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
*   **Tahmini Efor:** 3 gün
*   **Çıktılar:** Geliştirilmiş ve test edilmiş yardımcı chat fonksiyonları

    #### Makro Görev 3.1: Kişi/Grup Arama Fonksiyonunun Geliştirilmesi
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 3.1.1:** Arama giriş alanı ve arama sonuçlarının listelendiği arayüzün kodlanması
        *   **Atlas Görevi 3.1.1.1:** Arama giriş alanı bileşeninin oluşturulması
        *   **Atlas Görevi 3.1.1.2:** Arama sonuçları listesi bileşeninin oluşturulması
        *   **Atlas Görevi 3.1.1.3:** Arama filtreleri bileşeninin eklenmesi
        *   **Atlas Görevi 3.1.1.4:** Arama sonucu olmadığında gösterilecek boş durum (empty state) bileşeninin oluşturulması
    *   **Mikro Görev 3.1.2:** Arama işleminin API ile entegre edilmesi
        *   **Atlas Görevi 3.1.2.1:** Arama API fonksiyonunun servis katmanına eklenmesi
        *   **Atlas Görevi 3.1.2.2:** Arama sonuçlarının state'e bağlanması
        *   **Atlas Görevi 3.1.2.3:** Debounce veya throttle mekanizmasının eklenmesi
        *   **Atlas Görevi 3.1.2.4:** Arama geçmişi özelliğinin eklenmesi

    #### Makro Görev 3.2: Grup Yönetimi Fonksiyonlarının (Oluşturma, Üye Ekleme/Çıkarma) Geliştirilmesi
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 3.2.1:** Yeni grup oluşturma formu/sihirbazının ve grup bilgilerini düzenleme arayüzünün kodlanması
        *   **Atlas Görevi 3.2.1.1:** Grup oluşturma modal/sihirbaz bileşeninin oluşturulması
        *   **Atlas Görevi 3.2.1.2:** Grup adı, açıklama, avatar gibi bilgilerin giriş formunun oluşturulması
        *   **Atlas Görevi 3.2.1.3:** Üye seçme ve ekleme arayüzünün oluşturulması
        *   **Atlas Görevi 3.2.1.4:** Grup düzenleme formunun oluşturulması
    *   **Mikro Görev 3.2.2:** Grup yönetimi işlemlerinin API ile entegre edilmesi
        *   **Atlas Görevi 3.2.2.1:** Grup oluşturma API fonksiyonunun servis katmanına eklenmesi
        *   **Atlas Görevi 3.2.2.2:** Grup bilgilerini güncelleme API fonksiyonunun eklenmesi
        *   **Atlas Görevi 3.2.2.3:** Üye ekleme/çıkarma API fonksiyonlarının eklenmesi
        *   **Atlas Görevi 3.2.2.4:** Grup silme API fonksiyonunun eklenmesi

    #### Makro Görev 3.3: Anlık Bildirimlerin (Yeni Mesaj, Yazıyor Bilgisi) Arayüzde Gösterilmesi
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 3.3.1:** WebSocket veya SSE üzerinden gelen bildirimlerin dinlenmesi ve arayüzde uygun şekilde gösterilmesinin sağlanması
        *   **Atlas Görevi 3.3.1.1:** Bildirim dinleyicilerinin oluşturulması
        *   **Atlas Görevi 3.3.1.2:** Yeni mesaj bildirimlerinin toast/notification olarak gösterilmesi
        *   **Atlas Görevi 3.3.1.3:** Okunmamış mesaj sayaçlarının güncellenmesi
        *   **Atlas Görevi 3.3.1.4:** "Yazıyor..." göstergesinin eklenmesi
        *   **Atlas Görevi 3.3.1.5:** Çevrimiçi/çevrimdışı durum göstergelerinin güncellenmesi
    *   **Mikro Görev 3.3.2:** Bildirim tercihlerinin yönetimi için arayüzün geliştirilmesi
        *   **Atlas Görevi 3.3.2.1:** Bildirim ayarları formunun oluşturulması
        *   **Atlas Görevi 3.3.2.2:** Bildirim tercihleri API fonksiyonlarının servis katmanına eklenmesi
        *   **Atlas Görevi 3.3.2.3:** Bildirim tercihlerinin state'e bağlanması

### Alt Görev 4: Geliştirilen Tüm Chat Bileşenleri ve Fonksiyonları İçin Birim Testlerinin Yazılması
*   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
*   **Tahmini Efor:** 2 gün
*   **Çıktılar:** Chat sekmesi frontend kodu için yüksek (%80+) birim testi kapsamı

    #### Makro Görev 4.1: Her Bir React Bileşeni İçin Birim Testlerinin (Jest, React Testing Library Kullanılarak) Yazılması
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 4.1.1:** Bileşenlerin doğru render olup olmadığının, kullanıcı etkileşimlerine doğru tepki verip vermediğinin ve beklenen çıktıları üretip üretmediğinin test edilmesi
        *   **Atlas Görevi 4.1.1.1:** Test ortamının ve yapılandırmasının hazırlanması
        *   **Atlas Görevi 4.1.1.2:** Sohbet listesi bileşeni için test senaryolarının yazılması
        *   **Atlas Görevi 4.1.1.3:** Mesajlaşma alanı bileşeni için test senaryolarının yazılması
        *   **Atlas Görevi 4.1.1.4:** Chat başlığı ve bilgi alanları için test senaryolarının yazılması
        *   **Atlas Görevi 4.1.1.5:** Arama ve grup yönetimi bileşenleri için test senaryolarının yazılması
        *   **Atlas Görevi 4.1.1.6:** Bildirim bileşenleri için test senaryolarının yazılması
    *   **Mikro Görev 4.1.2:** Bileşenlerin erişilebilirlik (accessibility) açısından test edilmesi
        *   **Atlas Görevi 4.1.2.1:** Jest-axe veya benzeri bir kütüphane ile erişilebilirlik testlerinin yazılması
        *   **Atlas Görevi 4.1.2.2:** Klavye navigasyonu testlerinin yazılması
        *   **Atlas Görevi 4.1.2.3:** Ekran okuyucu uyumluluğu testlerinin yazılması

    #### Makro Görev 4.2: State Management ve API Servis Katmanı Fonksiyonları İçin Birim Testlerinin Yazılması
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 4.2.1:** State güncellemelerinin (action dispatch sonrası) doğru yapıldığının test edilmesi
        *   **Atlas Görevi 4.2.1.1:** State reducer'ları için test senaryolarının yazılması
        *   **Atlas Görevi 4.2.1.2:** Selector'lar için test senaryolarının yazılması
        *   **Atlas Görevi 4.2.1.3:** Action creator'lar için test senaryolarının yazılması
    *   **Mikro Görev 4.2.2:** API servis fonksiyonlarının (mock API kullanarak) doğru istekleri oluşturup doğru yanıtları işlediğinin test edilmesi
        *   **Atlas Görevi 4.2.2.1:** API mock yapısının oluşturulması
        *   **Atlas Görevi 4.2.2.2:** Her API servis fonksiyonu için test senaryolarının yazılması
        *   **Atlas Görevi 4.2.2.3:** Hata durumları için test senaryolarının yazılması
        *   **Atlas Görevi 4.2.2.4:** WebSocket/SSE servislerinin test edilmesi

## YUI-KM1-004: Chat Sekmesi Backend Entegrasyonu (Gerekiyorsa) (Yap)

### Alt Görev 3: Frontend ve Backend Arasında Entegrasyonun Sağlanması ve Test Edilmesi
*   **Sorumlu Personalar:** Kıdemli Frontend Geliştirici (Zeynep Aydın), Kıdemli Backend Geliştirici (Ahmet Çelik)
*   **Tahmini Efor:** 1 gün (Frontend geliştirici için)
*   **Çıktılar:** Başarıyla entegre edilmiş ve temel işlevleri çalışan Chat sekmesi

    #### Makro Görev 3.1: Frontend API Client'ının (YUI-KM1-003) Geliştirilmiş/Güncellenmiş Backend Endpoint'lerine Bağlanması
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 3.1.1:** Frontend kodunda API isteklerinin doğru endpoint'lere yönlendirildiğinden ve doğru request/response formatlarının kullanıldığından emin olunması
        *   **Atlas Görevi 3.1.1.1:** API servis katmanındaki endpoint URL'lerinin güncellenmesi
        *   **Atlas Görevi 3.1.1.2:** Request/response formatlarının API kontratına uygunluğunun kontrol edilmesi
        *   **Atlas Görevi 3.1.1.3:** Kimlik doğrulama (authentication) mekanizmasının entegre edilmesi
        *   **Atlas Görevi 3.1.1.4:** WebSocket/SSE bağlantı parametrelerinin güncellenmesi

    #### Makro Görev 3.2: Temel Chat Fonksiyonlarının (Mesaj Gönderme/Alma, Grup Oluşturma vb.) Uçtan Uca (End-to-End) Test Edilmesi
    *   **Sorumlu Personalar:** Kıdemli Frontend Geliştirici (Zeynep Aydın), Kıdemli Backend Geliştirici (Ahmet Çelik)
    *   **Mikro Görev 3.2.1:** Geliştirme ortamında (development environment) chat sekmesinin temel özelliklerinin manuel olarak test edilmesi
        *   **Atlas Görevi 3.2.1.1:** Mesaj gönderme/alma fonksiyonlarının test edilmesi
        *   **Atlas Görevi 3.2.1.2:** Grup oluşturma ve yönetme fonksiyonlarının test edilmesi
        *   **Atlas Görevi 3.2.1.3:** Arama ve filtreleme fonksiyonlarının test edilmesi
        *   **Atlas Görevi 3.2.1.4:** Bildirim ve real-time özelliklerin test edilmesi
        *   **Atlas Görevi 3.2.1.5:** Tespit edilen entegrasyon sorunlarının (veri uyuşmazlığı, hatalı yanıtlar vb.) anında çözülmesi için frontend ve backend geliştiricileri arasında yakın işbirliği yapılması

## YUI-KM1-006: Chat Sekmesi Birim ve Entegrasyon Testleri (Test Et)

### Alt Görev 2: Frontend Birim Testlerinin Gözden Geçirilmesi ve Kapsamının Artırılması (Gerekiyorsa)
*   **Sorumlu Personalar:** Kıdemli Frontend Geliştirici (Zeynep Aydın), QA Mühendisi (Ayşe Kaya)
*   **Tahmini Efor:** 1 gün
*   **Çıktılar:** Güncellenmiş ve kapsamı artırılmış frontend birim testleri

    #### Makro Görev 2.2: Eksik Kalan veya İyileştirilebilecek Birim Testlerinin Yazılması/Güncellenmesi
    *   **Sorumlu Persona:** Kıdemli Frontend Geliştirici (Zeynep Aydın)
    *   **Mikro Görev 2.2.1:** QA Mühendisinin geri bildirimleri doğrultusunda eksik birim testlerinin eklenmesi veya mevcutların iyileştirilmesi
        *   **Atlas Görevi 2.2.1.1:** Test kapsamı raporlarının incelenmesi
        *   **Atlas Görevi 2.2.1.2:** Eksik test senaryolarının belirlenmesi
        *   **Atlas Görevi 2.2.1.3:** Özellikle köşe durumları (edge cases) ve hata senaryoları için birim testlerinin güçlendirilmesi
        *   **Atlas Görevi 2.2.1.4:** Yeni testlerin yazılması ve mevcut testlerin güncellenmesi
        *   **Atlas Görevi 2.2.1.5:** Test kapsamının hedeflenen seviyeye (%80+) ulaştığının doğrulanması
