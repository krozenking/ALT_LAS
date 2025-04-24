# ALT_LAS Çalışan Dokümantasyon Kılavuzu

Bu kılavuz, tüm ALT_LAS çalışanları için dokümantasyon oluşturma ve güncelleme süreçlerini standardize etmek amacıyla hazırlanmıştır.

## Dokümantasyon Amacı

ALT_LAS projesinde her çalışanın kendi sorumluluk alanındaki ilerlemesini, karşılaştığı zorlukları ve teknik kararları belgelemesi gerekmektedir. Bu dokümantasyon:

1. Proje yönetiminin ilerlemeyi takip etmesini sağlar
2. Çalışanlar arası bilgi paylaşımını kolaylaştırır
3. Yeni katılan çalışanların hızlı adaptasyonunu destekler
4. Teknik kararların gerekçelerini kayıt altına alır
5. Gelecekteki bakım ve geliştirme çalışmalarını kolaylaştırır

## Dokümantasyon Oluşturma Adımları

1. `/docs/` dizini altında `worker{N}_documentation.md` formatında bir dosya oluşturun (N, çalışan numaranız)
2. Projenin kök dizininde bulunan `worker_documentation_template.md` şablonunu kullanın
3. Şablondaki tüm bölümleri kendi çalışma alanınıza göre doldurun
4. Dokümantasyonu düzenli olarak (en az haftada bir) güncelleyin
5. Her önemli değişiklik veya ilerleme sonrası dokümantasyonu güncelleyin

## Dokümantasyon İçeriği

Her çalışan dokümantasyonu aşağıdaki bölümleri içermelidir:

### 1. Genel Bilgiler
- Çalışan numarası ve sorumluluk alanı
- Projeye başlangıç tarihi
- İletişim bilgileri (opsiyonel)

### 2. Görevler ve İlerleme Durumu
- Tamamlanan görevler (tarih, açıklama, ilgili commit'ler, karşılaşılan zorluklar)
- Devam eden görevler (başlangıç tarihi, mevcut durum, planlanan tamamlanma tarihi)
- Planlanan görevler (planlanan başlangıç tarihi, tahmini süre, bağımlılıklar)

### 3. Teknik Detaylar
- Kullanılan teknolojiler ve gerekçeleri
- Mimari kararlar ve gerekçeleri
- API dokümantasyonu (varsa)
- Veri modelleri (varsa)
- Algoritma açıklamaları (varsa)

### 4. Diğer Çalışanlarla İş Birliği
- Bağımlılıklar (hangi çalışanların işlerine bağımlı olduğunuz)
- Ortak çalışma alanları (hangi çalışanlarla ortak çalıştığınız)
- Koordinasyon gereksinimleri

### 5. Notlar ve Öneriler
- Karşılaşılan zorluklar ve çözüm önerileri
- İyileştirme önerileri
- Diğer çalışanlar için öneriler

### 6. Sonraki Adımlar
- Kısa vadeli planlar
- Uzun vadeli hedefler

## Dokümantasyon Formatı

- Markdown formatını kullanın
- Başlıklar için uygun başlık seviyelerini kullanın (# Ana Başlık, ## Alt Başlık, vb.)
- Kod blokları için uygun sözdizimi vurgulama kullanın (```json, ```python, vb.)
- Listeler ve tablolar kullanarak bilgileri düzenleyin
- Önemli bilgileri **kalın** veya *italik* olarak vurgulayın
- Gerektiğinde bağlantılar ve görseller ekleyin

## Örnek Dokümantasyon

İşçi 6'nın dokümantasyonu örnek olarak incelenebilir: `/docs/worker6_documentation.md`

## Dokümantasyon Güncelleme Sıklığı

- Her sprint sonunda (iki haftada bir)
- Önemli bir görev tamamlandığında
- Önemli bir teknik karar alındığında
- Diğer çalışanları etkileyecek değişiklikler yapıldığında

## Dokümantasyon İnceleme Süreci

1. Dokümantasyonunuzu güncelledikten sonra bir pull request oluşturun
2. En az bir diğer çalışanın incelemesini isteyin
3. Geri bildirimlere göre gerekli düzeltmeleri yapın
4. Onay aldıktan sonra main branch'e merge edin

## Dokümantasyon Kontrol Listesi

Dokümantasyonunuzu tamamlamadan önce aşağıdaki kontrol listesini kullanın:

- [ ] Tüm bölümler dolduruldu mu?
- [ ] Tamamlanan görevler detaylı olarak açıklandı mı?
- [ ] Devam eden görevlerin mevcut durumu belirtildi mi?
- [ ] Teknik detaylar yeterince açıklandı mı?
- [ ] Diğer çalışanlarla iş birliği gereksinimleri belirtildi mi?
- [ ] Sonraki adımlar net bir şekilde tanımlandı mı?
- [ ] Son güncelleme tarihi eklendi mi?

## Dokümantasyon Örnekleri

Her çalışan için örnek dokümantasyon başlangıcı:

### İşçi 1: Backend Lider
```markdown
# İşçi 1 Dokümantasyonu

## Genel Bilgiler
- **İşçi Numarası**: İşçi 1
- **Sorumluluk Alanı**: Backend Lider
- **Başlangıç Tarihi**: [Tarih]

## Görevler ve İlerleme Durumu
...
```

### İşçi 2: Segmentation Uzmanı
```markdown
# İşçi 2 Dokümantasyonu

## Genel Bilgiler
- **İşçi Numarası**: İşçi 2
- **Sorumluluk Alanı**: Segmentation Uzmanı
- **Başlangıç Tarihi**: [Tarih]

## Görevler ve İlerleme Durumu
...
```

### İşçi 3: Runner Geliştirici
```markdown
# İşçi 3 Dokümantasyonu

## Genel Bilgiler
- **İşçi Numarası**: İşçi 3
- **Sorumluluk Alanı**: Runner Geliştirici
- **Başlangıç Tarihi**: [Tarih]

## Görevler ve İlerleme Durumu
...
```

### İşçi 4: Archive ve Veri Yönetimi Uzmanı
```markdown
# İşçi 4 Dokümantasyonu

## Genel Bilgiler
- **İşçi Numarası**: İşçi 4
- **Sorumluluk Alanı**: Archive ve Veri Yönetimi Uzmanı
- **Başlangıç Tarihi**: [Tarih]

## Görevler ve İlerleme Durumu
...
```

### İşçi 5: UI/UX Geliştirici
```markdown
# İşçi 5 Dokümantasyonu

## Genel Bilgiler
- **İşçi Numarası**: İşçi 5
- **Sorumluluk Alanı**: UI/UX Geliştirici
- **Başlangıç Tarihi**: [Tarih]

## Görevler ve İlerleme Durumu
...
```

### İşçi 7: AI Uzmanı
```markdown
# İşçi 7 Dokümantasyonu

## Genel Bilgiler
- **İşçi Numarası**: İşçi 7
- **Sorumluluk Alanı**: AI Uzmanı
- **Başlangıç Tarihi**: [Tarih]

## Görevler ve İlerleme Durumu
...
```

### İşçi 8: Güvenlik ve DevOps Uzmanı
```markdown
# İşçi 8 Dokümantasyonu

## Genel Bilgiler
- **İşçi Numarası**: İşçi 8
- **Sorumluluk Alanı**: Güvenlik ve DevOps Uzmanı
- **Başlangıç Tarihi**: [Tarih]

## Görevler ve İlerleme Durumu
...
```

---

Bu kılavuz, ALT_LAS projesinin dokümantasyon standartlarını belirlemektedir. Tüm çalışanların bu standartlara uyması beklenmektedir.

*Son Güncelleme: 24 Nisan 2025*
