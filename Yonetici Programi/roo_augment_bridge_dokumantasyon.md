# roo_augment_bridge.py Dökümantasyonu

Bu Python programı, Roo Code ile Augment Code arasında bir köprü görevi görür. Amacı, Roo Code tarafından belirlenen görevleri otomatik olarak Augment Code'a iletmektir.

## Nasıl Çalışır?

Program, `pyautogui` kütüphanesini kullanarak fare ve klavye hareketlerini kontrol eder. Temel olarak aşağıdaki adımları izler:

1.  **Koordinatları Al:** Program ilk çalıştığında, Augment'in sohbet kutusunun ve yeni dosya butonunun koordinatlarını alır. Bu koordinatlar, programın fareyi doğru yerlere tıklaması için gereklidir.
2.  **Görev Al:** Program, `get_comment_from_roo_code` fonksiyonunu kullanarak Roo Code'dan bir görev alır. Bu görev, Augment'e gönderilecek olan mesajdır. Şu anda, bu mesaj programın içinde sabit olarak tanımlanmıştır ("Please review the personas").
3.  **Augment'e Gönder:** Program, `send_comment_to_augment` fonksiyonunu kullanarak görevi Augment'e gönderir. Bu fonksiyon aşağıdaki adımları içerir:
    *   Augment'in sohbet kutusuna tıklanır.
    *   Augment'in yeni dosya butonuna tıklanır.
    *   Mesaj yazılır.
    *   Enter tuşuna basılarak mesaj gönderilir.
4.  **Döngü:** Program, sonsuz bir döngü içinde çalışır. Her döngüde, Roo Code'dan yeni bir görev alır ve Augment'e gönderir.

## Fonksiyonlar

*   `get_comment_from_roo_code()`: Roo Code'dan görevi alır. Şu anda, bu fonksiyon sadece sabit bir mesaj döndürmektedir.
*   `send_comment_to_augment(comment_text)`: Verilen metni Augment'e gönderir.
*   `main_loop()`: Ana otomasyon döngüsünü yönetir.

## Kütüphaneler

*   `pyautogui`: Fare ve klavye hareketlerini kontrol etmek için kullanılır.
*   `time`: Bekleme süreleri için kullanılır.
*   `pyperclip`: Panoya kopyalanan metni almak için kullanılır (şu anda kullanılmıyor).

## Kurulum

1.  Python'ı kurun.
2.  Gerekli kütüphaneleri kurun: `pip install pyautogui`
3.  Programı çalıştırın: `python roo_augment_bridge.py`

## Yapılandırma

Programın davranışını değiştirmek için aşağıdaki değişkenleri düzenleyebilirsiniz:

*   `AUGMENT_CHAT_X`, `AUGMENT_CHAT_Y`: Augment'in sohbet kutusunun koordinatları.
*   `AUGMENT_NEW_FILE_X`, `AUGMENT_NEW_FILE_Y`: Augment'in yeni dosya butonunun koordinatları.

## Notlar

*   Bu program, Augment'in arayüzünün belirli bir düzenine göre tasarlanmıştır. Arayüz değişirse, programın koordinatları ve tıklama mantığı güncellenmelidir.
*   Program şu anda sadece sabit bir mesaj göndermektedir. İleride, Roo Code'dan dinamik olarak görev alacak şekilde geliştirilebilir.