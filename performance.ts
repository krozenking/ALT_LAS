/**
 * Performans izleme ve iyileştirme yardımcı fonksiyonları
 */
import React from 'react';

// Web Vitals metriklerini izleme
export const reportWebVitals = (onPerfEntry?: (metric: unknown) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry); // Cumulative Layout Shift
      getFID(onPerfEntry); // First Input Delay
      getFCP(onPerfEntry); // First Contentful Paint
      getLCP(onPerfEntry); // Largest Contentful Paint
      getTTFB(onPerfEntry); // Time to First Byte
    });
  }
};

/**
 * Bileşen render sayısını ölçmek için hook
 * @param componentName Bileşen adı (loglama için)
 * @param logThreshold Uyarı loglaması için eşik değeri
 * @returns Bileşenin kaç kez render edildiği
 */
export const useRenderCount = (componentName: string, logThreshold = 5) => {
  if (process.env.NODE_ENV === 'development') {
    const renderCountRef = React.useRef(0);

    React.useEffect(() => {
      renderCountRef.current += 1;

      if (renderCountRef.current >= logThreshold) {
        console.warn(
          `Component "${componentName}" has rendered ${renderCountRef.current} times. Consider optimizing with React.memo, useMemo, or useCallback.`
        );
      }
    });

    return renderCountRef.current;
  }

  return 0;
};

/**
 * Bileşen render süresini ölçmek için hook
 * @param componentName Bileşen adı (loglama için)
 * @param logToConsole Konsola log yazılıp yazılmayacağı
 * @returns Render istatistikleri
 */
export const useMeasureRender = (componentName: string, logToConsole = false) => {
  const renderCount = React.useRef(0);
  const startTime = React.useRef(performance.now());
  const totalRenderTime = React.useRef(0);
  const lastRenderTime = React.useRef(0);

  React.useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    lastRenderTime.current = renderTime;
    totalRenderTime.current += renderTime;
    
    if (logToConsole) {
      console.log(`[${componentName}] Render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }
    
    return () => {
      startTime.current = performance.now();
    };
  });

  renderCount.current += 1;

  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current,
    averageRenderTime: totalRenderTime.current / renderCount.current,
  };
};

/**
 * Fonksiyon çalışma süresini ölçer
 * @param fn Ölçülecek fonksiyon
 * @param args Fonksiyona geçirilecek parametreler
 * @returns Fonksiyon sonucu ve çalışma süresi
 */
export const measureExecutionTime = async <T extends (...args: any[]) => any>(
  fn: T,
  ...args: Parameters<T>
): Promise<{ result: ReturnType<T>, executionTime: number }> => {
  const startTime = performance.now();
  
  // Fonksiyon async olabilir, bu yüzden await kullanıyoruz
  const result = await fn(...args);
  
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  
  return { result, executionTime };
};

/**
 * Debounce fonksiyonu - Ardışık çağrıları belirli bir süre sonra tek bir çağrıya indirir
 * @param fn Debounce uygulanacak fonksiyon
 * @param delay Gecikme süresi (ms)
 * @returns Debounce uygulanmış fonksiyon
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
};

/**
 * Throttle fonksiyonu - Fonksiyonu belirli bir süre içinde en fazla bir kez çağırır
 * @param fn Throttle uygulanacak fonksiyon
 * @param limit Limit süresi (ms)
 * @returns Throttle uygulanmış fonksiyon
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  let lastArgs: Parameters<T> | null = null;
  
  return function(...args: Parameters<T>): void {
    const now = Date.now();
    
    if (now - lastCall >= limit) {
      fn(...args);
      lastCall = now;
      lastArgs = null;
    } else {
      lastArgs = args;
      
      // Son çağrıyı zamanı gelince yap
      if (!lastCall) {
        setTimeout(() => {
          if (lastArgs) {
            fn(...lastArgs);
            lastCall = Date.now();
            lastArgs = null;
          }
        }, limit - (now - lastCall));
      }
    }
  };
};

/**
 * Lazy loading için kullanılacak fonksiyon
 * @param factory Bileşen fabrikası
 * @returns Lazy yüklenen bileşen
 */
export const lazyWithPreload = (factory: () => Promise<{ default: React.ComponentType<any> }>) => {
  const Component = React.lazy(factory);
  let factoryPromise: Promise<{ default: React.ComponentType<any> }> | null = null;

  const load = () => {
    if (!factoryPromise) {
      factoryPromise = factory();
    }
    return factoryPromise;
  };

  // @ts-expect-error - Özel özellik ekliyoruz
  Component.preload = load;

  return Component;
};

/**
 * Resim önbelleğe alma
 * @param src Resim URL'si
 * @returns Yüklenen resim
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Eski fonksiyon adını geriye dönük uyumluluk için tut
export const measurePerformance = measureExecutionTime;
