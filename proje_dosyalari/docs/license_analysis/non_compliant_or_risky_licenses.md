# ALT_LAS Projesi - Ticari Kullanıma Uygun Olmayan veya Yüksek Riskli Lisanslar

Bu belge, `identified_licenses.md` dosyasında yapılan ön analize dayanarak, ALT_LAS projesinin ticari kullanımı için uygun olmayan veya yüksek risk taşıyan lisansları ve bağımlılıkları listeler.

**Önemli Not:** Aşağıdaki analiz, `os-integration-service` (Rust tabanlı, `edition2024` uyumsuzluğu) ve `archive-service` (Go tabanlı, modül/yapılandırma sorunları) servislerinden otomatik olarak lisans bilgisi toplanamadığı gerçeği göz önünde bulundurularak yapılmıştır. Bu servislerin manuel olarak incelenmesi ve bu rapordaki bulguların bu eksiklikle birlikte değerlendirilmesi kritik öneme sahiptir.

## 1. Güçlü Copyleft Lisanslar (Ticari Kullanım İçin Yüksek Riskli)

Bu lisanslar, genellikle türev çalışmaların da aynı lisans altında yayınlanmasını gerektirdiğinden, kapalı kaynaklı ticari projeler için ciddi kısıtlamalar ve riskler oluşturur.

### 1.1. GNU General Public License v2 or later (GPLv2+)
- **Etkilenen Bağımlılık (Örnek):** `pyphen` (segmentation-service, workflow-engine içinde bir seçenek olarak)
- **Risk:** Eğer projenin bir parçası GPLv2+ lisanslı kodu kullanır veya ondan türetilirse, projenin tamamının kaynak kodunun GPLv2+ altında yayınlanması gerekebilir. Bu, ticari bir ürünün gizliliğini ve özel mülkiyetini ortadan kaldırabilir.
- **Değerlendirme:** Ticari kullanıma **uygun değil** (kapalı kaynaklı model için).

### 1.2. GNU General Public License v3 (GPLv3)
- **Etkilenen Bağımlılık (Örnek):** `ssh-import-id` (segmentation-service, workflow-engine içinde)
- **Risk:** GPLv2+"ya benzer şekilde, projenin tamamının kaynak kodunun GPLv3 altında yayınlanmasını gerektirebilir. Ek olarak, patent ve "anti-tivoization" hükümleri içerir, bu da donanımla entegrasyon durumunda ek kısıtlamalar getirebilir.
- **Değerlendirme:** Ticari kullanıma **uygun değil** (kapalı kaynaklı model için).

## 2. Zayıf Copyleft Lisanslar (Dikkatli Yönetim Gerektiren, Orta-Yüksek Riskli)

Bu lisanslar, lisanslı bileşende yapılan değişikliklerin aynı lisans altında paylaşılmasını gerektirir. Kütüphane olarak kullanıldıklarında genellikle daha yönetilebilirdirler ancak yine de dikkatli uyum takibi şarttır.

### 2.1. GNU Lesser General Public License v2.1 or later (LGPLv2.1+)
- **Etkilenen Bağımlılıklar (Örnekler):** `chardet`, `pyphen` (segmentation-service, workflow-engine içinde)
- **Risk:** Eğer LGPLv2.1+ lisanslı kütüphane statik olarak bağlanırsa veya kaynak kodu doğrudan projeye dahil edilirse, projenin LGPL şartlarına tabi olma riski vardır. Dinamik bağlama ve kullanıcıya kütüphaneyi değiştirme imkanı sunma gibi yükümlülüklere uyulmalıdır.
- **Değerlendirme:** Ticari kullanıma **dikkatle yönetilirse uygun olabilir**, ancak uyum riskleri mevcuttur.

### 2.2. GNU Lesser General Public License v3 (LGPLv3)
- **Etkilenen Bağımlılıklar (Örnekler):** `fpdf`, `fpdf2`, `svglib` (segmentation-service, workflow-engine içinde)
- **Risk:** LGPLv2.1+"a benzer riskler taşır, ek olarak patent ve "anti-tivoization" hükümleri içerir. Uyum sağlanması daha karmaşık olabilir.
- **Değerlendirme:** Ticari kullanıma **dikkatle yönetilirse uygun olabilir**, ancak uyum riskleri LGPLv2.1+"a göre daha yüksektir.

### 2.3. Mozilla Public License 2.0 (MPL 2.0)
- **Etkilenen Bağımlılık (Örnek):** `certifi` (segmentation-service, workflow-engine içinde)
- **Risk:** MPL 2.0 lisanslı dosyalarda yapılan değişikliklerin kaynak kodunun MPL 2.0 altında yayınlanması gerekir. MPL lisanslı kodun diğer kodlardan ayrı tutulması (dosya bazında copyleft) önemlidir. GPL ile uyumsuzluğu sorun yaratabilir.
- **Değerlendirme:** Ticari kullanıma **dikkatle yönetilirse uygun olabilir**, ancak kaynak kodu paylaşım yükümlülükleri ve potansiyel lisans uyumsuzlukları risk teşkil eder.

### 2.4. Mozilla Public License 1.1 (MPL 1.1)
- **Etkilenen Bağımlılık (Örnek):** `pyphen` (segmentation-service, workflow-engine içinde bir seçenek olarak)
- **Risk:** MPL 2.0"a benzer riskler taşır. Eski bir lisans olması nedeniyle MPL 2.0"a geçiş yapmış projelerle uyum sorunları olabilir.
- **Değerlendirme:** Ticari kullanıma **dikkatle yönetilirse uygun olabilir**, MPL 2.0"a benzer riskler taşır.

## 3. Özel Durum / Acil İncelenmesi Gereken Lisans (Çok Yüksek Riskli)

### 3.1. "BSD License; Other/Proprietary License" (qrcode bağımlılığı)
- **Etkilenen Bağımlılık:** `qrcode` (segmentation-service, workflow-engine içinde)
- **Risk:** "Other/Proprietary License" ifadesi, bu bağımlılığın ticari kullanımı engelleyebilecek, ek ücret talep edebilecek veya öngörülemeyen kısıtlamalar getirebilecek özel, yayınlanmamış şartlara sahip olabileceği anlamına gelir. Bu durum, projenin ticari geleceği için **çok ciddi bir risk** oluşturur.
- **Değerlendirme:** Ticari kullanıma uygunluğu **belirsiz ve potansiyel olarak uygun değil**. Bu bağımlılığın lisansının ne olduğu **acil olarak netleştirilmeli ve detaylı bir hukuksal incelemeden geçirilmelidir.** Alternatif bir kütüphane ile değiştirilmesi kuvvetle muhtemeldir.

## 4. Lisans Bilgisi Toplanamayan Servisler (Bilgi Eksiği Kaynaklı Risk)

### 4.1. `os-integration-service` (Rust Tabanlı)
- **Sorun:** `Cargo.toml` dosyasındaki `edition2024` özelliği, mevcut Rust (1.75.0) sürümüyle uyumsuz olduğu için bağımlılık lisansları otomatik olarak toplanamadı.
- **Risk:** Bu servisin ve bağımlılıklarının hangi lisansları kullandığı bilinmiyor. Aralarında ticari kullanıma uygun olmayan veya yukarıda belirtilen riskli lisanslardan herhangi birini içeren bağımlılıklar olabilir.

### 4.2. `archive-service` (Go Tabanlı)
- **Sorun:** `go-licenses` aracı çalıştırılırken modül bulunamaması ve yapılandırma hataları nedeniyle bağımlılık lisansları otomatik olarak toplanamadı (`go get github.com/nats-io/nats.go` gibi bir eksiklik belirtildi).
- **Risk:** `os-integration-service` ile benzer şekilde, bu servisin ve bağımlılıklarının lisansları bilinmiyor ve riskli lisanslar içerebilir.

## Sonuç ve Acil Eylem Gerektiren Noktalar

1.  **`qrcode` Bağımlılığı:** "Other/Proprietary License" içeren `qrcode` bağımlılığının gerçek lisans şartları **derhal** araştırılmalı ve hukuksal danışmanlık alınmalıdır. Bu bağımlılığın değiştirilmesi gerekebilir.
2.  **GPL Lisanslı Bağımlılıklar:** `pyphen` (GPLv2+ seçeneği) ve `ssh-import-id` (GPLv3) gibi GPL lisanslı bağımlılıkların projede kullanımı, projenin tamamının GPL altına girmesine neden olabilir. Bu bağımlılıkların alternatifleriyle değiştirilmesi veya kullanımlarının yeniden değerlendirilmesi şiddetle tavsiye edilir.
3.  **LGPL ve MPL Lisanslı Bağımlılıklar:** Bu lisanslara sahip bağımlılıkların (örn: `chardet`, `fpdf`, `fpdf2`, `svglib`, `certifi`) kullanımında lisans yükümlülüklerine (kaynak kodu paylaşımı, dinamik bağlama vb.) tam olarak uyulduğundan emin olunmalıdır. Uyum sağlanamıyorsa, alternatifler düşünülmelidir.
4.  **Lisansı Toplanamayan Servisler:** `os-integration-service` ve `archive-service` için manuel lisans tespiti ve analizi yapılmalıdır.

Bu bulgular ışığında, projenin ticari olarak güvenle kullanılabilmesi için belirtilen riskli bağımlılıkların ele alınması ve eksik bilgilerin tamamlanması gerekmektedir.
