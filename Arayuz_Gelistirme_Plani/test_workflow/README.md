# ALT_LAS Arayüz Geliştirme Planı Test Workflow

Bu klasör, ALT_LAS projesi arayüz geliştirme planının test edilebilir bir workflow ile uygulanmasını sağlayan araçları ve dokümanları içermektedir.

## Amaç

Bu test workflow'u, arayüz geliştirme planında yapılan güncellemelerin ve alınan kararların pratikte test edilebilmesini, doğrulanabilmesini ve ölçülebilmesini sağlamak amacıyla oluşturulmuştur.

## İçerik

1. **Next.js + TypeScript Prototip**
   - Arayüz teknolojisi güncellemesinin (React'tan Next.js + TypeScript'e geçiş) test edilebilmesi için minimal bir prototip
   - Modern state management (Zustand) entegrasyonu
   - Component-based testing örnekleri

2. **CI/CD Pipeline**
   - GitHub Actions workflow dosyaları
   - Otomatik test, build ve deployment süreçleri
   - Kalite kontrol ve doğrulama adımları

3. **Erişilebilirlik Test Suite**
   - WCAG standartlarına uygunluk testleri
   - Otomatik erişilebilirlik kontrolleri
   - Manuel test senaryoları

4. **Performans Ölçüm Araçları**
   - Lighthouse entegrasyonu
   - Web Vitals ölçümleri
   - Karşılaştırmalı performans testleri (React vs Next.js)

## Kurulum ve Kullanım

Detaylı kurulum ve kullanım talimatları için [KURULUM.md](./KURULUM.md) dosyasını inceleyiniz.

## Test Senaryoları

Arayüz geliştirme planının test edilmesi için hazırlanan senaryolar [TEST_SENARYOLARI.md](./TEST_SENARYOLARI.md) dosyasında bulunmaktadır.

## Doğrulama Kriterleri

Test sonuçlarının değerlendirilmesi için kullanılacak doğrulama kriterleri [DOGRULAMA_KRITERLERI.md](./DOGRULAMA_KRITERLERI.md) dosyasında detaylandırılmıştır.
