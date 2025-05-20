/**
 * Klavye ve fare kullanımını izleyen yardımcı fonksiyonlar
 */

/**
 * Klavye navigasyonu için fare kullanımını izler
 * Fare kullanıldığında odaklanma halkasını gizler
 */
export const setupKeyboardNavigation = (): void => {
  let usingMouse = false;

  // Fare kullanımını izle
  const handleMouseDown = () => {
    usingMouse = true;
    document.body.classList.add('using-mouse');
  };

  // Klavye kullanımını izle
  const handleKeyDown = (event: KeyboardEvent) => {
    // Tab tuşu kullanıldığında
    if (event.key === 'Tab') {
      usingMouse = false;
      document.body.classList.remove('using-mouse');
    }
  };

  // Olay dinleyicilerini ekle
  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('keydown', handleKeyDown);

  // Temizleme fonksiyonu
  return () => {
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Atlama bağlantısı ekler
 * Klavye kullanıcıları için ana içeriğe atlama bağlantısı
 */
export const addSkipLink = (): void => {
  // Zaten varsa ekleme
  if (document.querySelector('.skip-link')) {
    return;
  }

  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Ana içeriğe atla';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  // Ana içerik bölümüne id ekle
  const mainContent = document.querySelector('main') || document.querySelector('.chat-container');
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content';
  }
};

/**
 * ARIA özniteliklerini kontrol eder ve eksik olanları ekler
 */
export const checkAriaAttributes = (): void => {
  // Butonlar için aria-label kontrolü
  document.querySelectorAll('button').forEach(button => {
    if (!button.getAttribute('aria-label') && !button.textContent?.trim()) {
      console.warn('Button without aria-label or text content:', button);
    }
  });
  
  // Resimler için alt özniteliği kontrolü
  document.querySelectorAll('img').forEach(img => {
    if (!img.alt) {
      console.warn('Image without alt attribute:', img);
    }
  });
  
  // Form elemanları için label kontrolü
  document.querySelectorAll('input, select, textarea').forEach(input => {
    const id = input.id;
    if (id) {
      const hasLabel = document.querySelector(`label[for="${id}"]`);
      if (!hasLabel && !input.getAttribute('aria-label')) {
        console.warn('Form element without associated label:', input);
      }
    } else if (!input.getAttribute('aria-label')) {
      console.warn('Form element without id or aria-label:', input);
    }
  });
};

/**
 * Erişilebilirlik özelliklerini başlatır
 */
export const initAccessibility = (): (() => void) => {
  // Klavye navigasyonu kurulumu
  const cleanupKeyboardNav = setupKeyboardNavigation();
  
  // Atlama bağlantısı ekle
  addSkipLink();
  
  // ARIA özniteliklerini kontrol et
  checkAriaAttributes();
  
  // Temizleme fonksiyonu
  return () => {
    cleanupKeyboardNav();
  };
};

export default {
  setupKeyboardNavigation,
  addSkipLink,
  checkAriaAttributes,
  initAccessibility
};
