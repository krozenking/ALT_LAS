# ALT_LAS Projesi Dokümantasyon Güncelleme Planı

Bu belge, toplantı sonucunda belirlenen öncelikli iyileştirme alanlarına göre dokümantasyon güncelleme planını detaylandırmaktadır.

## Öncelikli Güncelleme Alanları

Toplantı sonucunda aşağıdaki iyileştirme alanları öncelikli olarak belirlenmiştir:

1. Merkezi görev takip sisteminin iyileştirilmesi
2. Tüm doküman türleri için standart şablonların oluşturulması
3. Arayüz teknolojisinin React'tan Next.js + TypeScript'e geçirilmesi
4. Tüm dokümanların güncellik kontrolü ve güncellenmesi
5. Component-based testing yaklaşımının benimsenmesi
6. Proje genelinde terminoloji standardizasyonu
7. Dokümanlar arası çapraz referans sisteminin iyileştirilmesi
8. Erişilebilirlik standartları için özel bölüm eklenmesi

## Güncelleme Adımları

### 1. Merkezi Görev Takip Sisteminin İyileştirilmesi

- **Hedef Dokümanlar**:
  - `/Planlama_Ofisi/ana_gorev_panosu.md`
  - `/Yonetici_Ofisi/ofis_durumu.md`
  - `/Planlama_Ofisi/hierarchical_task_structure_definition.md`

- **Yapılacak Değişiklikler**:
  - Ana görev panosunun yapısının standardizasyonu
  - Görev durumu, öncelik ve bağımlılık takibi için tutarlı bir sistem oluşturulması
  - Görev ID'leri ve referans sisteminin iyileştirilmesi
  - Görev atama ve takip süreçlerinin netleştirilmesi

### 2. Tüm Doküman Türleri İçin Standart Şablonların Oluşturulması

- **Oluşturulacak Şablonlar**:
  - Görev tanımlama şablonu
  - Teknik dokümantasyon şablonu
  - Toplantı tutanağı şablonu
  - Persona görev planı şablonu
  - Test dokümantasyonu şablonu
  - API dokümantasyonu şablonu

- **Hedef Klasör**: `/Yonetici_Ofisi/Genel_Belgeler/Dokuman_Sablonlari/`

### 3. Arayüz Teknolojisinin React'tan Next.js + TypeScript'e Geçirilmesi

- **Hedef Dokümanlar**:
  - `/Arayuz_Gelistirme_Plani/Dokumanlar/kapsamli_ui_gelistirme_plani.md`
  - `/Arayuz_Gelistirme_Plani/Persona_Planlari/kidemli_frontend_gelistirici_gorev_plani.md`
  - `/Arayuz_Gelistirme_Plani/Persona_Planlari/yazilim_mimari_gorev_plani.md`
  - Diğer ilgili frontend dokümantasyonu

- **Yapılacak Değişiklikler**:
  - Teknoloji stack'inin güncellenmesi
  - Next.js'in sağladığı avantajların dokümante edilmesi
  - Geçiş stratejisinin detaylandırılması
  - TypeScript kullanım standartlarının belirlenmesi
  - Modern state management alternatiflerinin entegrasyonu

### 4. Tüm Dokümanların Güncellik Kontrolü ve Güncellenmesi

- **Hedef**: Tüm aktif dokümantasyon

- **Yapılacak Değişiklikler**:
  - Güncel olmayan bilgilerin tespit edilmesi ve güncellenmesi
  - Eksik bilgilerin tamamlanması
  - Çelişkili bilgilerin düzeltilmesi
  - Doküman meta bilgilerinin (versiyon, tarih, yazar) güncellenmesi

### 5. Component-based Testing Yaklaşımının Benimsenmesi

- **Hedef Dokümanlar**:
  - `/Arayuz_Gelistirme_Plani/Persona_Planlari/qa_muhendisi_gorev_plani.md`
  - `/Arayuz_Gelistirme_Plani/Persona_Planlari/kidemli_frontend_gelistirici_gorev_plani.md`
  - Test stratejisi dokümanları

- **Yapılacak Değişiklikler**:
  - Component-based testing yaklaşımının detaylandırılması
  - Test stratejisinin güncellenmesi
  - Test araçları ve kütüphanelerinin belirlenmesi
  - Test süreçlerinin dokümante edilmesi

### 6. Proje Genelinde Terminoloji Standardizasyonu

- **Hedef**: Tüm dokümantasyon

- **Yapılacak Değişiklikler**:
  - Standart terimler sözlüğünün oluşturulması
  - Tutarsız terminolojinin tespit edilmesi ve düzeltilmesi
  - Teknik terimlerin açıklamalarının eklenmesi

### 7. Dokümanlar Arası Çapraz Referans Sisteminin İyileştirilmesi

- **Hedef**: Tüm dokümantasyon

- **Yapılacak Değişiklikler**:
  - Dokümanlar arası bağlantıların standardizasyonu
  - İlgili dokümanların referans olarak eklenmesi
  - Çapraz referans indeksinin oluşturulması

### 8. Erişilebilirlik Standartları İçin Özel Bölüm Eklenmesi

- **Hedef Dokümanlar**:
  - `/Arayuz_Gelistirme_Plani/Dokumanlar/kapsamli_ui_gelistirme_plani.md`
  - `/Arayuz_Gelistirme_Plani/Persona_Planlari/ui_ux_tasarimcisi_gorev_plani.md`

- **Yapılacak Değişiklikler**:
  - Erişilebilirlik standartlarının (WCAG) dokümante edilmesi
  - Erişilebilirlik test süreçlerinin tanımlanması
  - Erişilebilirlik kontrol listelerinin oluşturulması

## Güncelleme Süreci

1. Her güncelleme alanı için sorumlu personaların atanması
2. Güncellenecek dokümanların tespit edilmesi
3. Değişikliklerin taslak olarak hazırlanması
4. Taslakların gözden geçirilmesi ve onaylanması
5. Onaylanan değişikliklerin uygulanması
6. Güncellenen dokümanların tutarlılık kontrolü
7. Final versiyonların GitHub'a push'lanması

## Zaman Çizelgesi

| Güncelleme Alanı | Başlangıç | Bitiş | Sorumlu |
|------------------|-----------|-------|---------|
| Merkezi görev takip sistemi | 19.05.2025 | 21.05.2025 | Proje Yöneticisi |
| Standart şablonlar | 19.05.2025 | 23.05.2025 | Proje Yöneticisi, Tüm Personalar |
| Next.js + TypeScript geçişi | 19.05.2025 | 28.05.2025 | Frontend Geliştirici, Yazılım Mimarı |
| Doküman güncelliği | 22.05.2025 | 28.05.2025 | Tüm Personalar |
| Component-based testing | 24.05.2025 | 28.05.2025 | QA Mühendisi, Frontend Geliştirici |
| Terminoloji standardizasyonu | 22.05.2025 | 25.05.2025 | Yazılım Mimarı |
| Çapraz referans sistemi | 26.05.2025 | 28.05.2025 | Proje Yöneticisi |
| Erişilebilirlik standartları | 24.05.2025 | 27.05.2025 | UI/UX Tasarımcısı |

## İlerleme Takibi

Güncelleme çalışmalarının ilerlemesi, haftalık toplantılarla takip edilecek ve ana görev panosunda güncellenecektir. Tüm değişiklikler tamamlandıktan sonra, dokümantasyonun tutarlılığı ve bütünlüğü kontrol edilecek ve final versiyonlar GitHub'a push'lanacaktır.
