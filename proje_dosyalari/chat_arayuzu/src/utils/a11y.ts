/**
 * Erişilebilirlik (a11y) yardımcı fonksiyonları
 */
import { useEffect, useRef } from 'react';

// Erişilebilirlik özelliklerini başlat
export const initAccessibility = () => {
  // Erişilebilirlik tercihlerini yerel depolamadan yükle
  const fontSize = localStorage.getItem('a11y_fontSize') || 'md';
  const highContrast = localStorage.getItem('a11y_highContrast') === 'true';
  const reduceMotion = localStorage.getItem('a11y_reduceMotion') === 'true';
  const screenReaderMode = localStorage.getItem('a11y_screenReaderMode') === 'true';
  
  // HTML özniteliklerini ayarla
  document.documentElement.setAttribute('data-font-size', fontSize);
  document.documentElement.setAttribute('data-high-contrast', String(highContrast));
  document.documentElement.setAttribute('data-reduce-motion', String(reduceMotion));
  document.documentElement.setAttribute('data-screen-reader', String(screenReaderMode));
  
  // Sistem tercihlerini kontrol et
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
  
  // Sistem tercihleri ayarlanmışsa ve kullanıcı tercihi yoksa, sistem tercihlerini kullan
  if (prefersReducedMotion && localStorage.getItem('a11y_reduceMotion') === null) {
    document.documentElement.setAttribute('data-reduce-motion', 'true');
  }
  
  if (prefersHighContrast && localStorage.getItem('a11y_highContrast') === null) {
    document.documentElement.setAttribute('data-high-contrast', 'true');
  }
  
  // Erişilebilirlik CSS sınıflarını ekle
  if (highContrast) {
    document.body.classList.add('high-contrast');
  }
  
  if (reduceMotion) {
    document.body.classList.add('reduce-motion');
  }
  
  if (screenReaderMode) {
    document.body.classList.add('screen-reader-mode');
  }
  
  // Yazı boyutunu ayarla
  document.body.classList.add(`font-size-${fontSize}`);
};

// Atlama bağlantısı hook'u
export const useSkipLink = (targetId: string) => {
  const skipLinkRef = useRef<HTMLAnchorElement>(null);
  
  useEffect(() => {
    const skipLink = skipLinkRef.current;
    if (!skipLink) return;
    
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.tabIndex = -1;
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    };
    
    skipLink.addEventListener('click', handleClick);
    
    return () => {
      skipLink.removeEventListener('click', handleClick);
    };
  }, [targetId]);
  
  return skipLinkRef;
};

// Odak tuzağı hook'u
export const useFocusTrap = (isActive: boolean, containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // İlk öğeye odaklan
    if (firstElement && !container.contains(document.activeElement)) {
      firstElement.focus();
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, containerRef]);
};

// Erişilebilirlik duyuruları için hook
export const useA11yAnnounce = () => {
  const announceRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    // Duyuru bölgesi oluştur
    if (!announceRef.current) {
      const div = document.createElement('div');
      div.setAttribute('aria-live', 'polite');
      div.setAttribute('aria-atomic', 'true');
      div.setAttribute('role', 'status');
      div.style.position = 'absolute';
      div.style.width = '1px';
      div.style.height = '1px';
      div.style.padding = '0';
      div.style.margin = '-1px';
      div.style.overflow = 'hidden';
      div.style.clip = 'rect(0, 0, 0, 0)';
      div.style.whiteSpace = 'nowrap';
      div.style.border = '0';
      
      document.body.appendChild(div);
      announceRef.current = div;
    }
  }, []);
  
  const announce = (message: string, assertive = false) => {
    if (!announceRef.current) return;
    
    // Duyuru türünü ayarla
    announceRef.current.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
    
    // Duyuruyu temizle ve yeniden ekle (ekran okuyucuların tekrar okuması için)
    announceRef.current.textContent = '';
    
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = message;
      }
    }, 50);
  };
  
  return announce;
};

// ARIA genişletilmiş durumu için hook
export const useAriaExpanded = (isExpanded: boolean, buttonRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!buttonRef.current) return;
    
    buttonRef.current.setAttribute('aria-expanded', String(isExpanded));
  }, [isExpanded, buttonRef]);
};

// Erişilebilirlik klavye navigasyonu için hook
export const useA11yKeyboardNav = (
  containerRef: React.RefObject<HTMLElement>,
  itemSelector: string,
  onSelect: (item: HTMLElement) => void,
  isActive = true
) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', ' '].includes(e.key)) return;
      
      const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[];
      if (items.length === 0) return;
      
      const currentIndex = items.findIndex(item => item === document.activeElement);
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            items[currentIndex - 1].focus();
          } else {
            items[items.length - 1].focus();
          }
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < items.length - 1) {
            items[currentIndex + 1].focus();
          } else {
            items[0].focus();
          }
          break;
          
        case 'Home':
          e.preventDefault();
          items[0].focus();
          break;
          
        case 'End':
          e.preventDefault();
          items[items.length - 1].focus();
          break;
          
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (currentIndex !== -1) {
            onSelect(items[currentIndex]);
          }
          break;
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, itemSelector, onSelect, isActive]);
};

// Erişilebilirlik özelliklerini kontrol et
export const checkA11y = (element: HTMLElement): string[] => {
  const issues: string[] = [];
  
  // Alt metni kontrol et
  const images = element.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('alt')) {
      issues.push(`Image missing alt text: ${img.src}`);
    }
  });
  
  // Form etiketlerini kontrol et
  const inputs = element.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const id = input.getAttribute('id');
    if (id) {
      const label = element.querySelector(`label[for="${id}"]`);
      if (!label) {
        issues.push(`Input missing label: ${id}`);
      }
    } else {
      issues.push('Input missing id attribute');
    }
  });
  
  // ARIA özniteliklerini kontrol et
  const ariaElements = element.querySelectorAll('[role]');
  ariaElements.forEach(el => {
    const role = el.getAttribute('role');
    if (role === 'button' && !el.hasAttribute('tabindex')) {
      issues.push('Button role missing tabindex attribute');
    }
  });
  
  // Renk kontrastını kontrol et (basit kontrol)
  const elements = element.querySelectorAll('*');
  elements.forEach(el => {
    const style = window.getComputedStyle(el);
    const bgColor = style.backgroundColor;
    const color = style.color;
    
    if (bgColor && color && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      // Burada gerçek kontrast hesaplaması yapılabilir
      // Basitlik için sadece not ekliyoruz
      if (bgColor === color) {
        issues.push('Element has same background and text color');
      }
    }
  });
  
  return issues;
};
