# roo_augment_bridge.py Geliştirme Planı

Bu belge, `roo_augment_bridge.py` programının geliştirilmesi için oluşturulan planı içermektedir.

## 1. Amaç

Bu planın amacı, `roo_augment_bridge.py` programını geliştirerek, Roo Code tarafından belirlenen görevleri otomatik olarak Augment Code'a iletmektir. Bu sayede, proje yönetimi süreçleri daha verimli hale getirilecektir.

## 2. Hedefler

*   `get_comment_from_roo_code()` fonksiyonunun, `ana_gorev_panosu.md` dosyasından yeni görevleri okuyacak şekilde güncellenmesi.
*   `send_comment_to_augment(comment_text)` fonksiyonunun, okunan görevleri Augment'e gönderecek şekilde yapılandırılması.
*   `AUGMENT_CHAT_X`, `AUGMENT_CHAT_Y`, `AUGMENT_NEW_FILE_X`, `AUGMENT_NEW_FILE_Y` koordinatlarının doğru değerlerle güncellenmesi.
*   Her 10 dakikada bir `ana_gorev_panosu.md` dosyasını kontrol edecek ve yeni görevler varsa Augment'e gönderecek bir döngünün oluşturulması.
*   Augment'in her adımdan sonra yönetici ofisinde döküman tutmasını sağlayacak talimatın eklenmesi.
*   Hata durumunda, kullanıcıya daha detaylı bilgi veren bir hata mesajının gösterilmesi.
*   Arşivlerdeki eski dosyaların projeden ayrı tutulması için gerekli talimatların Augment'e iletilmesi.

## 3. Detaylı Plan

1.  **`get_comment_from_roo_code()` Fonksiyonunun Güncellenmesi:**
    *   `ana_gorev_panosu.md` dosyasını okuyacak ve "Yapılacak" durumunda olan görevleri belirleyecek bir kod eklenecektir.
    *   Görevler, öncelik sırasına göre (P0, P1, P2...) ve görev bağımlılıkları dikkate alınarak seçilecektir.
    *   Görev tamamlandığında, `ana_gorev_panosu.md` dosyasındaki görevin durumu "Tamamlandı" olarak güncellenecektir.
    *   Görev tamamlandıktan sonra, sıradaki göreve geçilmesi için Augment'e talimat verilecektir.
    *   Augment'e, her 10 dakikada bir görevin bitip bitmediğini kontrol etmesi ve bittiyse sıradaki göreve devam etmesi talimatı verilecektir.
    *   Augment'e, görevleri yaparken ilgili personalara girmesi talimatı verilecektir.
2.  **`send_comment_to_augment(comment_text)` Fonksiyonunun Yapılandırılması:**
    *   Okunan görevlerin Augment'e gönderilmesi için gerekli kod eklenecektir.
3.  **Koordinatların Güncellenmesi:**
    *   `AUGMENT_CHAT_X`, `AUGMENT_CHAT_Y`, `AUGMENT_NEW_FILE_X`, `AUGMENT_NEW_FILE_Y` koordinatları, kullanıcının ekran çözünürlüğüne ve Augment arayüzünün konumuna göre doğru değerlerle güncellenecektir.
4.  **Döngü Oluşturulması:**
    *   Her 10 dakikada bir `ana_gorev_panosu.md` dosyasını kontrol edecek ve yeni görevler varsa Augment'e gönderecek bir döngü oluşturulacaktır.
5.  **Talimat Eklenmesi:**
    *   Augment'in her adımdan sonra yönetici ofisinde döküman tutmasını sağlayacak talimat, `send_comment_to_augment(comment_text)` fonksiyonuna eklenecektir.
6.  **Hata Yönetimi:**
    *   Hata durumunda, kullanıcıya daha detaylı bilgi veren bir hata mesajı gösterilecektir.
7.  **Arşiv Talimatı:**
     * Arşivlerdeki eski dosyaların projeden ayrı tutulması için gerekli talimatlar Augment'e iletilecektir.

## 4. Zaman Çizelgesi

Bu planın tamamlanması için tahmini süre 1-2 gündür.

## 5. Sorumlu Personalar

*   Roo (AI)

## 6. Riskler

*   Augment arayüzünün değişmesi durumunda, koordinatların ve tıklama mantığının güncellenmesi gerekebilir.
*   `ana_gorev_panosu.md` dosyasının formatının değişmesi durumunda, görev okuma fonksiyonunun güncellenmesi gerekebilir.

## 7. Başarı Kriterleri

*   `roo_augment_bridge.py` programı, `ana_gorev_panosu.md` dosyasından yeni görevleri otomatik olarak okuyabilmeli ve Augment'e gönderebilmelidir.
*   Program, hatalı durumlarda kullanıcıya anlamlı hata mesajları göstermelidir.
*   Program, belirtilen koordinatları kullanarak Augment arayüzü ile doğru şekilde etkileşim kurabilmelidir.