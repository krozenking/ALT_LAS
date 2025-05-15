# CUDA Bilgi Paylaşımı Dokümantasyon Standartları

Bu belge, ALT_LAS projesi CUDA entegrasyonu sürecinde ekip üyeleri tarafından oluşturulacak ve paylaşılacak dokümanlar için standartları tanımlar. Bu standartlar, bilgi paylaşımının tutarlı, anlaşılır ve erişilebilir olmasını sağlamak amacıyla oluşturulmuştur.

## Genel Dokümantasyon İlkeleri

1. **Açıklık ve Anlaşılırlık:** Dokümanlar, teknik seviyesi ne olursa olsun, açık ve anlaşılır bir dille yazılmalıdır.
2. **Tutarlılık:** Tüm dokümanlar, bu belgede tanımlanan format ve yapıyı takip etmelidir.
3. **Güncellik:** Dokümanlar, içerdikleri bilgiler güncel olacak şekilde düzenli olarak gözden geçirilmeli ve güncellenmelidir.
4. **Erişilebilirlik:** Dokümanlar, tüm ekip üyeleri tarafından kolayca erişilebilir olmalıdır.
5. **Referans Verme:** Başka kaynaklardan alınan bilgiler için uygun şekilde referans verilmelidir.

## Dosya Adlandırma Kuralları

1. **Genel Format:** `[Kategori]_[Konu]_[YYYY-AA-GG].md`
2. **Toplantı Notları:** `CUDA_Bilgi_Paylasim_Toplantisi_[Numara]_[YYYY-AA-GG].md`
3. **Sunumlar:** `[Kategori]_[Konu]_Sunum_[YYYY-AA-GG].[pptx/pdf]`
4. **Bilgi Tabanı Dokümanları:** `[Konu]_[YYYY-AA-GG].md`

Dosya adlarında:
- Boşluk yerine alt çizgi (_) kullanılmalıdır.
- Türkçe karakterler (ç, ğ, ı, ö, ş, ü) yerine İngilizce karşılıkları (c, g, i, o, s, u) kullanılmalıdır.
- Tarih formatı YYYY-AA-GG (Yıl-Ay-Gün) şeklinde olmalıdır.

## Markdown Formatı ve Yapısı

Tüm dokümanlar Markdown formatında yazılmalı ve aşağıdaki yapıyı takip etmelidir:

1. **Başlık:** Dokümanın başlığı, tek bir # işareti ile belirtilmelidir.
2. **Meta Bilgiler:** Başlığın hemen altında, aşağıdaki meta bilgiler yer almalıdır:
   - **Yazar:** Dokümanı oluşturan persona
   - **Tarih:** Dokümanın oluşturulma tarihi (YYYY-AA-GG)
   - **Güncelleme Tarihi:** Dokümanın son güncellenme tarihi (varsa)
   - **Kategori:** Dokümanın ait olduğu kategori
   - **Etiketler:** Dokümanla ilgili anahtar kelimeler (virgülle ayrılmış)

3. **Özet:** Dokümanın içeriğinin kısa bir özeti (2-3 cümle)

4. **İçindekiler:** Uzun dokümanlar için, içindekiler bölümü eklenmelidir.

5. **Ana İçerik:** Dokümanın ana içeriği, hiyerarşik başlıklar (##, ###, ####) kullanılarak organize edilmelidir.

6. **Kod Blokları:** Kod örnekleri, uygun dil belirtilerek kod blokları içinde paylaşılmalıdır:
   ```python
   # Python kod örneği
   import numpy as np
   import cupy as cp
   
   # CPU üzerinde hesaplama
   a_cpu = np.arange(10000000).reshape(1000, 10000)
   b_cpu = np.arange(10000000).reshape(10000, 1000)
   c_cpu = np.dot(a_cpu, b_cpu)
   
   # GPU üzerinde hesaplama
   a_gpu = cp.arange(10000000).reshape(1000, 10000)
   b_gpu = cp.arange(10000000).reshape(10000, 1000)
   c_gpu = cp.dot(a_gpu, b_gpu)
   ```

7. **Tablolar:** Veriler, uygun durumlarda tablolar halinde sunulmalıdır:
   | Parametre | Açıklama | Varsayılan Değer |
   |-----------|----------|------------------|
   | batch_size | İşlenecek veri boyutu | 32 |
   | learning_rate | Öğrenme oranı | 0.001 |
   | epochs | Eğitim döngüsü sayısı | 100 |

8. **Görseller:** Görseller, uygun açıklamalarla birlikte eklenmelidir:
   ![Görsel Açıklaması](gorsel_yolu.png)

9. **Referanslar:** Dokümanın sonunda, yararlanılan kaynaklar listelenmelidir.

## Bilgi Tabanı Dokümanları için Özel Kurallar

Bilgi tabanına eklenecek dokümanlar, yukarıdaki genel kurallara ek olarak aşağıdaki özelliklere sahip olmalıdır:

1. **Pratik Örnekler:** Teorik bilgilerin yanı sıra, pratik örnekler ve kullanım senaryoları içermelidir.
2. **Sorun Giderme:** Karşılaşılabilecek yaygın sorunlar ve çözümleri belirtilmelidir.
3. **Performans İpuçları:** İlgili konuda performansı artırmak için ipuçları ve en iyi uygulamalar paylaşılmalıdır.
4. **İlgili Kaynaklar:** Konu hakkında daha fazla bilgi edinmek isteyenler için kaynaklar (dokümantasyon, makaleler, videolar vb.) listelenmelidir.

## Örnek Doküman Şablonu

```markdown
# CUDA ile TensorRT Optimizasyonu

**Yazar:** Dr. Elif Demir (Veri Bilimcisi)
**Tarih:** 2025-06-05
**Kategori:** AI Model Optimizasyonu
**Etiketler:** TensorRT, model optimizasyonu, çıkarım hızlandırma, nicemleme

## Özet

Bu doküman, TensorRT kullanarak AI modellerinin çıkarım performansını nasıl optimize edebileceğimizi açıklar. TensorRT'nin sağladığı optimizasyon teknikleri, karma hassasiyet ve nicemleme stratejileri detaylı olarak ele alınmıştır.

## İçindekiler

1. [Giriş](#giriş)
2. [TensorRT Nedir?](#tensorrt-nedir)
3. [TensorRT Kurulumu](#tensorrt-kurulumu)
4. [Model Dönüştürme](#model-dönüştürme)
5. [Karma Hassasiyet (Mixed Precision)](#karma-hassasiyet-mixed-precision)
6. [Nicemleme (Quantization)](#nicemleme-quantization)
7. [Performans Karşılaştırması](#performans-karşılaştırması)
8. [Sorun Giderme](#sorun-giderme)
9. [Referanslar](#referanslar)

## Giriş

...

## Referanslar

1. NVIDIA TensorRT Dokümantasyonu: https://docs.nvidia.com/deeplearning/tensorrt/
2. ...
```

## Dokümantasyon İnceleme Süreci

Oluşturulan tüm dokümanlar, aşağıdaki inceleme sürecinden geçmelidir:

1. **Öz İnceleme:** Dokümanı oluşturan kişi, içeriğin doğruluğunu ve bu standartlara uygunluğunu kontrol eder.
2. **Akran İncelemesi:** Doküman, aynı veya ilgili alanda çalışan başka bir ekip üyesi tarafından incelenir.
3. **Son İnceleme:** Proje Yöneticisi, dokümanın genel kalitesini ve standartlara uygunluğunu kontrol eder.
4. **Yayınlama:** İnceleme sürecini başarıyla tamamlayan dokümanlar, bilgi tabanına eklenir.

---

**Not:** Bu dokümantasyon standartları, projenin ilerleyişine ve ihtiyaçlara göre güncellenebilir.
