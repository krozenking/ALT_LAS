import pyautogui
import time
import pyperclip  # Panodan metin almak için (opsiyonel, doğrudan giriş de alabiliriz)
import time
import datetime

# --- KULLANICI AYARLARI (Program başında bir kere istenecek) ---
AUGMENT_CHAT_X = 110
AUGMENT_CHAT_Y = 924
AUGMENT_NEW_FILE_X = 104
AUGMENT_NEW_FILE_Y = 926

def get_comment_from_roo_code(filename="Planlama_Ofisi/ana_gorev_panosu.md"):
    """Roo Code'dan gelen yorumu/görevi bir dosyadan okur."""
    augment_gorev = "devam et"
    return augment_gorev


def send_comment_to_augment(comment_text):
    """Verilen metni Augment'in sohbet kutusuna gönderir."""
    if not comment_text:
        print("Gönderilecek mesaj boş. İşlem atlanıyor.")
        return False

    try:
        print(f"\nAugment sohbet kutusuna (X:{AUGMENT_CHAT_X}, Y:{AUGMENT_CHAT_Y}) tıklanıyor...")
        pyautogui.click(AUGMENT_CHAT_X, AUGMENT_CHAT_Y)
        time.sleep(1)  # Tıklama sonrası arayüzün odaklanması için kısa bir bekleme

        print(f"Augment yeni dosya (X:{AUGMENT_NEW_FILE_X}, Y:{AUGMENT_NEW_FILE_Y}) tıklanıyor...")
        pyautogui.click(AUGMENT_NEW_FILE_X, AUGMENT_NEW_FILE_Y)
        time.sleep(1)  # Tıklama sonrası arayüzün odaklanması için kısa bir bekleme

        print(f"Augment'e gönderilen mesaj: '{comment_text}'")  # Log eklendi
        print(f"Mesaj yazılıyor: '{comment_text}'")
        pyautogui.write(comment_text, interval=0.05)  # Harfler arasına küçük bir gecikme ekleyerek daha stabil yazım
        time.sleep(0.5)

        print("Enter tuşuna basılıyor...")
        pyautogui.press('enter')
        print("Mesaj Augment'e gönderildi.")
        # Augment'e her adımdan sonra yönetici ofisinde bir doküman tutmasını söyleyen ifade
        augment_talimat = "\nHer adımdan sonra yönetici ofisinde doküman tut."
        print(f"Ek talimat ekleniyor: '{augment_talimat}'")
        pyautogui.write(augment_talimat, interval=0.05)
        time.sleep(0.5)
        pyautogui.press('enter')
        return True
    except Exception as e:
        print(f"Augment'e mesaj gönderilirken hata oluştu: {e}")
        pyautogui.alert(text=f"Augment'e mesaj gönderilirken hata oluştu:\n{e}\nLütfen VS Code penceresinin açık ve görünür olduğundan emin olun.", title="Otomasyon Hatası")
        return False

def main_loop():
    """Ana otomasyon döngüsü."""
    print("Otomasyon başlıyor. Lütfen VS Code ve Augment arayüzünün hazır olduğundan emin olun.")
    print("Programı durdurmak için terminalde Ctrl+C tuşlarına basın.")

    # Başlangıçta koordinatları al
    # Koordinatlar artık sabit, bu yüzden sormaya gerek yok

    time.sleep(3)  # Kullanıcının diğer pencereye geçmesi için zaman

    while True:
        print("\n================================================")
        print(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - Yeni döngü başlıyor.")

        # 1. Roo Code'dan yorumu/görevi al
        roo_task = get_comment_from_roo_code(filename="Yonetici Programi/cikti.txt")

        if not roo_task:
            print("Roo Code'dan görev alınamadı. Bu döngü atlanıyor.")
            print(f"10 dakika sonra tekrar denenecek...")
            time.sleep(900)  # 15 dakika bekle
            continue

        # 2. Alınan görevi Augment'e gönder
        success = send_comment_to_augment(roo_task)

        if success:
            print("Görev başarıyla Augment'e iletildi.")
        else:
            print("Görev Augment'e iletilemedi. Lütfen logları kontrol edin.")

        # 3. Bir sonraki döngü için bekle
        print(f"15 dakika ({900} saniye) bekleniyor...")
        time.sleep(900)  # 15 dakika

if __name__ == "__main__":
    try:
        main_loop()
    except KeyboardInterrupt:
        print("\nProgram kullanıcı tarafından sonlandırıldı.")
    except Exception as e:
        print(f"\nBeklenmedik bir hata oluştu: {e}")