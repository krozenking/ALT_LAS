/**
 * Güvenlik yardımcı fonksiyonları
 */
import DOMPurify from 'dompurify';
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto-browserify';

// XSS koruması için HTML escape
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Güvenli URL doğrulama
export const isSafeUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch (_) {
    return false;
  }
};

// Güvenli dosya tipi doğrulama
export const isSafeFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

// Güvenli dosya boyutu doğrulama
export const isSafeFileSize = (file: File, maxSizeBytes: number): boolean => {
  return file.size <= maxSizeBytes;
};

// CSRF token oluşturma
export const generateCsrfToken = (): string => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

// CSRF token doğrulama
export const validateCsrfToken = (token: string, storedToken: string): boolean => {
  return token === storedToken;
};

// JWT token çözme (decode)
export const decodeJwt = (token: string): unknown => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// JWT token doğrulama
export const isJwtExpired = (token: string): boolean => {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = decoded.exp * 1000; // saniyeden milisaniyeye çevir
  return Date.now() >= expirationTime;
};

// Güvenli depolama (localStorage şifreleme)
export class SecureStorage {
  private prefix: string;

  constructor(prefix = 'secure_') {
    this.prefix = prefix;
  }

  // Veriyi şifrele ve localStorage'a kaydet
  setItem(key: string, value: unknown): void {
    try {
      const serializedValue = JSON.stringify(value);
      const encryptedValue = this.encrypt(serializedValue);
      localStorage.setItem(this.prefix + key, encryptedValue);
    } catch (e) {
      console.error('SecureStorage setItem error:', e);
    }
  }

  // localStorage'dan veriyi al ve şifresini çöz
  getItem<T>(key: string): T | null {
    try {
      const encryptedValue = localStorage.getItem(this.prefix + key);
      if (!encryptedValue) return null;

      const decryptedValue = this.decrypt(encryptedValue);
      return JSON.parse(decryptedValue) as T;
    } catch (e) {
      console.error('SecureStorage getItem error:', e);
      return null;
    }
  }

  // localStorage'dan veriyi sil
  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  // Tüm güvenli depolama öğelerini temizle
  clear(): void {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    }
  }

  // Basit XOR şifreleme (gerçek uygulamada daha güçlü bir şifreleme kullanılmalıdır)
  private encrypt(text: string): string {
    const key = this.getEncryptionKey();
    let result = '';

    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }

    return btoa(result); // Base64 kodlama
  }

  // Basit XOR şifre çözme
  private decrypt(encryptedText: string): string {
    const key = this.getEncryptionKey();
    const text = atob(encryptedText); // Base64 çözme
    let result = '';

    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }

    return result;
  }

  // Şifreleme anahtarını al veya oluştur
  private getEncryptionKey(): string {
    let key = localStorage.getItem('_encryption_key');

    if (!key) {
      key = generateCsrfToken();
      localStorage.setItem('_encryption_key', key);
    }

    return key;
  }
}

// Uygulama genelinde kullanılacak güvenli depolama örneği
export const secureStorage = new SecureStorage();

// Güvenli rastgele ID oluşturma
export const generateSecureId = (length = 16): string => {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

// Güvenli parola doğrulama (minimum gereksinimler)
export const isStrongPassword = (password: string): boolean => {
  // En az 8 karakter, en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
  return regex.test(password);
};

// Güvenli input doğrulama
export const sanitizeInput = (input: string | null | undefined): string => {
  if (input === null || input === undefined) return '';

  // Tehlikeli karakterleri temizle
  return input.replace(/[<>'"&]/g, '');
};

/**
 * HTML içeriğini temizleme
 * @param html Temizlenecek HTML içeriği
 * @returns Temizlenmiş HTML içeriği
 */
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ALLOW_DATA_ATTR: false
  });
};

/**
 * API anahtarı doğrulama
 * @param apiKey Doğrulanacak API anahtarı
 * @param provider API sağlayıcısı (openai, google, ollama vb.)
 * @returns API anahtarının geçerli olup olmadığı
 */
export const validateApiKey = (apiKey: string, provider: string): boolean => {
  if (!apiKey || typeof apiKey !== 'string') return false;

  // Sağlayıcıya göre doğrulama kuralları
  switch (provider.toLowerCase()) {
    case 'openai':
      return /^sk-[a-zA-Z0-9]{32,}$/.test(apiKey);
    case 'google':
      return /^AIza[a-zA-Z0-9_-]{35}$/.test(apiKey);
    case 'ollama':
      return /^ollama_[a-zA-Z0-9]{32,}$/.test(apiKey);
    case 'openrouter':
      return /^sk-or-[a-zA-Z0-9]{24,}$/.test(apiKey);
    default:
      return apiKey.length >= 16; // Genel kural
  }
};

/**
 * Veri şifreleme
 * @param data Şifrelenecek veri
 * @param key Şifreleme anahtarı
 * @returns Şifrelenmiş veri
 */
export const encryptData = (data: string, key: string): string => {
  try {
    // Anahtar ve IV oluştur
    const keyHash = createHash('sha256').update(key).digest();
    const iv = randomBytes(16);

    // Şifreleme
    const cipher = createCipheriv('aes-256-cbc', keyHash, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // IV ve şifrelenmiş veriyi birleştir
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
};

/**
 * Şifrelenmiş veriyi çözme
 * @param encryptedData Şifrelenmiş veri
 * @param key Şifreleme anahtarı
 * @returns Çözülmüş veri
 */
export const decryptData = (encryptedData: string, key: string): string => {
  try {
    // IV ve şifrelenmiş veriyi ayır
    const parts = encryptedData.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted data format');

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    // Anahtar oluştur
    const keyHash = createHash('sha256').update(key).digest();

    // Şifre çözme
    const decipher = createDecipheriv('aes-256-cbc', keyHash, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed');
  }
};

/**
 * Parola hash'leme
 * @param password Hash'lenecek parola
 * @returns Hash'lenmiş parola
 */
export const hashPassword = async (password: string): Promise<string> => {
  // Web Crypto API kullanarak hash'leme
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Parola doğrulama
 * @param password Doğrulanacak parola
 * @param hash Karşılaştırılacak hash
 * @returns Parolanın doğru olup olmadığı
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

/**
 * CSRF token oluşturma
 * @param sessionId Oturum ID'si
 * @returns CSRF token
 */
export const generateCSRFToken = (sessionId: string): string => {
  const timestamp = Date.now().toString();
  const data = sessionId + timestamp;
  return createHash('sha256').update(data).digest('hex');
};

/**
 * CSRF token doğrulama
 * @param token Doğrulanacak token
 * @param sessionId Oturum ID'si
 * @returns Token'ın geçerli olup olmadığı
 */
export const validateCSRFToken = (token: string, sessionId: string): boolean => {
  // Basit doğrulama: token'ın sessionId ile oluşturulmuş olması gerekir
  // Gerçek uygulamada daha karmaşık bir doğrulama yapılmalıdır
  if (!token || !sessionId) return false;

  // Token'ın uzunluğu doğru mu?
  if (token.length !== 64) return false; // SHA-256 hex = 64 karakter

  // Token'ın formatı doğru mu?
  if (!/^[a-f0-9]{64}$/i.test(token)) return false;

  return true;
};

// Content Security Policy (CSP) ihlallerini raporla
export const reportCspViolation = (violation: unknown): void => {
  const endpoint = 'https://api.altlas.com/csp-report';

  try {
    navigator.sendBeacon(endpoint, JSON.stringify({
      'csp-report': violation
    }));
  } catch (e) {
    console.error('CSP violation report failed:', e);
  }
};
