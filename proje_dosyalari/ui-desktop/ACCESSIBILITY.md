# ALT_LAS UI Erişilebilirlik Dokümantasyonu

Bu belge, ALT_LAS masaüstü uygulamasının kullanıcı arayüzünde (UI) uygulanan erişilebilirlik özelliklerini ve standartlarını özetlemektedir.

## Hedeflenen Standart

Uygulama, Web İçeriği Erişilebilirlik Yönergeleri (WCAG) 2.1 Seviye AA standardına uymayı hedeflemektedir.

## Uygulanan Özellikler

### WCAG 2.1 AA Uyumluluğu (Görev 5.1)

- **ARIA Rolleri ve Özellikleri:** Anlamsal HTML öğelerinin yetersiz kaldığı durumlarda, bileşenlerin rollerini, durumlarını ve özelliklerini yardımcı teknolojilere (örneğin ekran okuyucular) iletmek için WAI-ARIA (Web Accessibility Initiative - Accessible Rich Internet Applications) rolleri ve özellikleri aktif olarak kullanılmıştır. Bu, özel kontrollerin ve dinamik içeriğin erişilebilir olmasını sağlar.
- **Klavye Navigasyonu ve Odak Yönetimi:** Tüm interaktif öğelere klavye kullanılarak erişilebilir ve bu öğeler arasında mantıksal bir sırada gezilebilir. Odak göstergesi her zaman belirgindir, böylece kullanıcılar hangi öğenin aktif olduğunu kolayca anlayabilirler. Odak yönetimi, özellikle modal pencereler ve dinamik içeriklerde dikkatlice ele alınmıştır.
- **Renk Kontrastı ve Görsel İpuçları:** Metin ve arka plan renkleri arasındaki kontrast oranı, WCAG 2.1 AA gereksinimlerini karşılayacak şekilde ayarlanmıştır (metin için en az 4.5:1, büyük metin için 3:1). Bilgiyi iletmek için yalnızca renge dayanılmaz; ek olarak simgeler, metin etiketleri veya diğer görsel ipuçları kullanılır.
- **Ekran Okuyucu Uyumluluğu:** Uygulama, popüler ekran okuyucular (örneğin NVDA, JAWS, VoiceOver) ile test edilmiştir. Anlamsal HTML, ARIA özellikleri ve doğru etiketleme sayesinde ekran okuyucu kullanıcıları arayüzü anlayabilir ve etkileşimde bulunabilir.

### Yüksek Kontrast Tema (Görev 5.2)

- **Tasarım ve Implementasyon:** Görme engelli veya düşük görme yetisine sahip kullanıcılar için özel bir yüksek kontrast tema tasarlanmış ve uygulanmıştır. Bu tema, metin okunabilirliğini ve arayüz öğelerinin ayırt edilebilirliğini artırmak için belirgin renk farklılıkları kullanır.
- **Tema Geçiş Mekanizması:** Kullanıcılar, uygulama ayarlarından standart tema ile yüksek kontrast tema arasında kolayca geçiş yapabilirler.
- **Sistem Teması Algılama:** Uygulama, işletim sisteminin yüksek kontrast ayarlarını algılayabilir ve otomatik olarak uygun temayı etkinleştirebilir (bu özellik platforma bağlı olarak değişiklik gösterebilir).

## Devam Eden Çalışmalar ve Gelecek İyileştirmeler

Erişilebilirlik sürekli bir çabadır. Gelecekteki geliştirmeler şunları içerebilir:

- Daha kapsamlı erişilebilirlik testleri (otomatik ve manuel).
- Kullanıcı geri bildirimlerine dayalı iyileştirmeler.
- Yeni özelliklerin erişilebilirlik standartlarına uygun olarak geliştirilmesi.

Bu dokümantasyon, erişilebilirlik iyileştirmeleri yapıldıkça güncellenecektir.

