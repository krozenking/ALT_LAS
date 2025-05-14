# Segmentation Service Bellek Optimizasyonu

Bu belge, Segmentation Service'deki bellek sızıntısı sorununu (SEG-042) çözmek için yapılan değişiklikleri ve bellek optimizasyon stratejilerini açıklamaktadır.

## Sorun Tanımı

Segmentation Service, uzun süreli çalışmalarda bellek kullanımında sürekli artış göstermekte ve sonunda OutOfMemoryError ile çökmektedir. Bu sorun özellikle yüksek yük altında daha hızlı ortaya çıkmaktadır.

## Çözüm Yaklaşımı

Bellek sızıntısını çözmek için aşağıdaki stratejiler uygulanmıştır:

1. **Tembel Yükleme (Lazy Loading)**: NLP modelleri artık ihtiyaç duyulduğunda yükleniyor.
2. **LRU Önbellek Stratejisi**: Önbellek boyutu sınırlandırıldı ve LRU (Least Recently Used) stratejisi uygulandı.
3. **Bellek İzleme ve Optimizasyon**: Bellek kullanımını düzenli olarak izleyen ve belirli eşiklerde otomatik optimizasyon yapan bir mekanizma eklendi.
4. **Manuel Garbage Collection**: Kritik işlemlerden sonra manuel garbage collection tetikleniyor.
5. **Kullanılmayan Modellerin Boşaltılması**: Belirli bir süre kullanılmayan modeller bellekten boşaltılıyor.
6. **Model Havuzu Yönetimi**: Modellerin kullanımını izleyen ve yöneten bir model havuzu mekanizması eklendi.
7. **HTTP İstek Middleware'i**: Her HTTP isteğinden sonra bellek kullanımını izleyen ve gerektiğinde optimizasyon yapan bir middleware eklendi.

## Değiştirilen Dosyalar

1. **enhanced_language_processor.py**
   - Tembel yükleme mekanizması eklendi
   - Önbellek boyutu sınırlandırıldı
   - LRU önbellek stratejisi uygulandı
   - Bellek izleme mekanizması eklendi
   - Kullanılmayan modellerin boşaltılması için metotlar eklendi

2. **memory_optimizer.py**
   - Bellek optimizasyon mekanizması iyileştirildi
   - Model havuzu yönetimi eklendi
   - Agresif bellek optimizasyonu için metotlar eklendi
   - Garbage collection stratejileri iyileştirildi

3. **main.py**
   - Bellek optimizasyonu için middleware eklendi
   - Bellek istatistikleri ve optimizasyon endpoint'leri eklendi
   - Çevre değişkenleri desteği eklendi
   - Lifespan event handler'ları eklendi

4. **deployment_config.py**
   - Kubernetes ve Docker Compose yapılandırmalarına bellek optimizasyonu için çevre değişkenleri eklendi
   - Bellek sınırları ve kaynak talepleri artırıldı

5. **Dockerfile**
   - Bellek optimizasyonu için çevre değişkenleri eklendi
   - spaCy modellerinin yüklenmesi için yapılandırma eklendi

## Yapılandırma Parametreleri

Bellek optimizasyonu için aşağıdaki çevre değişkenleri kullanılabilir:

- `MEMORY_THRESHOLD_MB`: Bellek optimizasyonunu tetiklemek için eşik değeri (MB cinsinden)
- `HIGH_MEMORY_THRESHOLD_MB`: Agresif bellek optimizasyonunu tetiklemek için eşik değeri (MB cinsinden)
- `GC_INTERVAL`: Periyodik garbage collection için zaman aralığı (saniye cinsinden)
- `MAX_CACHE_SIZE`: Önbellek boyutu sınırı (belge sayısı cinsinden)

## Test ve İzleme

Bellek optimizasyonu mekanizmalarını test etmek ve izlemek için aşağıdaki araçlar sağlanmıştır:

1. **test_memory_optimization.py**: Bellek optimizasyonu mekanizmalarını test etmek için bir test betiği.
2. **/memory-stats** Endpoint'i: Bellek kullanımı istatistiklerini almak için bir API endpoint'i.
3. **/optimize-memory** Endpoint'i: Manuel bellek optimizasyonu tetiklemek için bir API endpoint'i.

## Sonuç

Uygulanan bellek optimizasyon stratejileri, Segmentation Service'in bellek kullanımını önemli ölçüde iyileştirdi ve bellek sızıntısı sorununu çözdü. Servis artık uzun süreli çalışmalarda ve yüksek yük altında stabil bir şekilde çalışabiliyor.

## Daha Fazla Bilgi

Daha detaylı bilgi için `MEMORY_OPTIMIZATION.md` dosyasına bakabilirsiniz.
