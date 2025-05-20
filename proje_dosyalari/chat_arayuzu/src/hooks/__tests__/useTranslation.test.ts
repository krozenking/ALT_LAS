import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useTranslation, { Language } from '../../hooks/useTranslation';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock çeviri dosyaları
vi.mock('../../locales/tr.json', () => ({
  default: {
    common: {
      welcome: 'Hoş Geldiniz',
      submit: 'Gönder',
      cancel: 'İptal'
    },
    chat: {
      title: 'Sohbet',
      placeholder: 'Mesajınızı yazın...'
    }
  }
}));

vi.mock('../../locales/en.json', () => ({
  default: {
    common: {
      welcome: 'Welcome',
      submit: 'Submit',
      cancel: 'Cancel'
    },
    chat: {
      title: 'Chat',
      placeholder: 'Type your message...'
    }
  }
}));

describe('useTranslation Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should use default language when no language is stored', () => {
    const { result } = renderHook(() => useTranslation());
    
    expect(result.current.language).toBe('tr');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('language');
  });

  it('should use stored language when available', () => {
    localStorageMock.getItem.mockReturnValueOnce('en');
    
    const { result } = renderHook(() => useTranslation());
    
    expect(result.current.language).toBe('en');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('language');
  });

  it('should change language correctly', () => {
    const { result } = renderHook(() => useTranslation());
    
    act(() => {
      result.current.changeLanguage('en');
    });
    
    expect(result.current.language).toBe('en');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'en');
  });

  it('should translate keys correctly for Turkish', () => {
    const { result } = renderHook(() => useTranslation());
    
    expect(result.current.t('common.welcome')).toBe('Hoş Geldiniz');
    expect(result.current.t('chat.title')).toBe('Sohbet');
    expect(result.current.t('chat.placeholder')).toBe('Mesajınızı yazın...');
  });

  it('should translate keys correctly for English', () => {
    localStorageMock.getItem.mockReturnValueOnce('en');
    
    const { result } = renderHook(() => useTranslation());
    
    expect(result.current.t('common.welcome')).toBe('Welcome');
    expect(result.current.t('chat.title')).toBe('Chat');
    expect(result.current.t('chat.placeholder')).toBe('Type your message...');
  });

  it('should return key when translation is not found', () => {
    const { result } = renderHook(() => useTranslation());
    
    expect(result.current.t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('should handle nested keys correctly', () => {
    const { result } = renderHook(() => useTranslation());
    
    expect(result.current.t('chat.placeholder')).toBe('Mesajınızı yazın...');
  });

  it('should handle language change and update translations', () => {
    const { result } = renderHook(() => useTranslation());
    
    expect(result.current.t('common.welcome')).toBe('Hoş Geldiniz');
    
    act(() => {
      result.current.changeLanguage('en');
    });
    
    expect(result.current.t('common.welcome')).toBe('Welcome');
  });

  it('should handle invalid language and fallback to default', () => {
    const { result } = renderHook(() => useTranslation());
    
    act(() => {
      // @ts-expect-error - Testing invalid language
      result.current.changeLanguage('invalid');
    });
    
    expect(result.current.language).toBe('tr');
  });
});
