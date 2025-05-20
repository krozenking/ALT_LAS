import { useEffect, useCallback } from 'react';

interface KeyboardShortcutOptions {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

interface KeyboardShortcut {
  key: string;
  callback: () => void;
  options?: KeyboardShortcutOptions;
}

/**
 * Klavye kısayollarını yönetmek için özel hook
 * @param shortcuts Kısayol tanımları dizisi
 */
const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const { key, callback, options = {} } = shortcut;
        const {
          ctrlKey = false,
          shiftKey = false,
          altKey = false,
          metaKey = false,
          preventDefault = true,
          stopPropagation = false,
        } = options;

        // Tuş kombinasyonunu kontrol et
        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          event.ctrlKey === ctrlKey &&
          event.shiftKey === shiftKey &&
          event.altKey === altKey &&
          event.metaKey === metaKey
        ) {
          // Varsayılan davranışı engelle
          if (preventDefault) {
            event.preventDefault();
          }

          // Olayın yayılmasını durdur
          if (stopPropagation) {
            event.stopPropagation();
          }

          // Kısayol işlevini çağır
          callback();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    // Kısayollar boşsa, dinleyiciyi ekleme
    if (!shortcuts || shortcuts.length === 0) {
      return;
    }

    // Klavye olayı dinleyicisini ekle
    window.addEventListener('keydown', handleKeyDown);

    // Temizleme işlevi
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, handleKeyDown]);
};

export default useKeyboardShortcuts;
