/**
 * Uygulama yapılandırma yardımcı fonksiyonları
 * 
 * Bu modül, .env dosyalarından yapılandırma değerlerini almak için yardımcı fonksiyonlar sağlar.
 * Vite, .env dosyalarındaki VITE_ önekine sahip değişkenleri otomatik olarak import.meta.env nesnesine ekler.
 */

// Ortam değişkenlerini tiplendir
interface EnvVariables {
  // API Yapılandırması
  VITE_API_BASE_URL: string;
  VITE_API_TIMEOUT: string;
  VITE_API_RETRY_COUNT: string;
  
  // AI Yapılandırması
  VITE_AI_SERVICE_URL: string;
  VITE_DEFAULT_AI_MODEL: string;
  VITE_ENABLE_STREAMING: string;
  VITE_MAX_TOKENS: string;
  
  // Dosya Yükleme Yapılandırması
  VITE_MAX_FILE_SIZE: string;
  VITE_ALLOWED_FILE_TYPES: string;
  
  // Ses Tanıma Yapılandırması
  VITE_SPEECH_RECOGNITION_API: string;
  VITE_MAX_RECORDING_TIME: string;
  
  // Uygulama Yapılandırması
  VITE_APP_NAME: string;
  VITE_DEFAULT_LANGUAGE: string;
  VITE_AVAILABLE_LANGUAGES: string;
  VITE_ENABLE_ANALYTICS: string;
  VITE_ENABLE_ERROR_REPORTING: string;
  
  // Depolama Yapılandırması
  VITE_STORAGE_PREFIX: string;
  VITE_MAX_CONVERSATION_HISTORY: string;
  
  // Erişilebilirlik Yapılandırması
  VITE_DEFAULT_FONT_SIZE: string;
  VITE_DEFAULT_HIGH_CONTRAST: string;
  VITE_DEFAULT_REDUCE_MOTION: string;
  VITE_DEFAULT_SCREEN_READER_MODE: string;
  
  // Tema Yapılandırması
  VITE_DEFAULT_COLOR_MODE: string;
  VITE_DEFAULT_THEME: string;
  
  // Geliştirme Araçları
  VITE_ENABLE_DEV_TOOLS: string;
  VITE_MOCK_API: string;
  VITE_LOG_LEVEL: string;
  
  // Ortam
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
}

// Ortam değişkenlerini al
const env = import.meta.env as unknown as EnvVariables;

/**
 * Ortam değişkenini string olarak al
 * @param key Ortam değişkeni anahtarı
 * @param defaultValue Varsayılan değer
 * @returns Ortam değişkeni değeri veya varsayılan değer
 */
export const getEnvString = (key: keyof EnvVariables, defaultValue: string = ''): string => {
  const value = env[key];
  return value !== undefined ? String(value) : defaultValue;
};

/**
 * Ortam değişkenini number olarak al
 * @param key Ortam değişkeni anahtarı
 * @param defaultValue Varsayılan değer
 * @returns Ortam değişkeni değeri veya varsayılan değer
 */
export const getEnvNumber = (key: keyof EnvVariables, defaultValue: number = 0): number => {
  const value = env[key];
  if (value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Ortam değişkenini boolean olarak al
 * @param key Ortam değişkeni anahtarı
 * @param defaultValue Varsayılan değer
 * @returns Ortam değişkeni değeri veya varsayılan değer
 */
export const getEnvBoolean = (key: keyof EnvVariables, defaultValue: boolean = false): boolean => {
  const value = env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1' || value === 'yes';
};

/**
 * Ortam değişkenini string dizisi olarak al
 * @param key Ortam değişkeni anahtarı
 * @param separator Ayırıcı karakter
 * @param defaultValue Varsayılan değer
 * @returns Ortam değişkeni değeri veya varsayılan değer
 */
export const getEnvArray = (key: keyof EnvVariables, separator: string = ',', defaultValue: string[] = []): string[] => {
  const value = env[key];
  if (value === undefined || value === '') return defaultValue;
  return value.split(separator).map(item => item.trim());
};

// Uygulama yapılandırması
export const config = {
  // API Yapılandırması
  api: {
    baseUrl: getEnvString('VITE_API_BASE_URL', 'http://localhost:3000/api'),
    timeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
    retryCount: getEnvNumber('VITE_API_RETRY_COUNT', 3)
  },
  
  // AI Yapılandırması
  ai: {
    serviceUrl: getEnvString('VITE_AI_SERVICE_URL', 'http://localhost:5000'),
    defaultModel: getEnvString('VITE_DEFAULT_AI_MODEL', 'openai-gpt4'),
    enableStreaming: getEnvBoolean('VITE_ENABLE_STREAMING', true),
    maxTokens: getEnvNumber('VITE_MAX_TOKENS', 4096)
  },
  
  // Dosya Yükleme Yapılandırması
  fileUpload: {
    maxSize: getEnvNumber('VITE_MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB
    allowedTypes: getEnvArray('VITE_ALLOWED_FILE_TYPES', ',', [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain'
    ])
  },
  
  // Ses Tanıma Yapılandırması
  speechRecognition: {
    api: getEnvString('VITE_SPEECH_RECOGNITION_API', 'browser'),
    maxRecordingTime: getEnvNumber('VITE_MAX_RECORDING_TIME', 60000) // 60 saniye
  },
  
  // Uygulama Yapılandırması
  app: {
    name: getEnvString('VITE_APP_NAME', 'ALT_LAS Chat Botu'),
    defaultLanguage: getEnvString('VITE_DEFAULT_LANGUAGE', 'tr'),
    availableLanguages: getEnvArray('VITE_AVAILABLE_LANGUAGES', ',', ['tr', 'en']),
    enableAnalytics: getEnvBoolean('VITE_ENABLE_ANALYTICS', false),
    enableErrorReporting: getEnvBoolean('VITE_ENABLE_ERROR_REPORTING', false)
  },
  
  // Depolama Yapılandırması
  storage: {
    prefix: getEnvString('VITE_STORAGE_PREFIX', 'altlas_chat_'),
    maxConversationHistory: getEnvNumber('VITE_MAX_CONVERSATION_HISTORY', 50)
  },
  
  // Erişilebilirlik Yapılandırması
  accessibility: {
    defaultFontSize: getEnvString('VITE_DEFAULT_FONT_SIZE', 'md'),
    defaultHighContrast: getEnvBoolean('VITE_DEFAULT_HIGH_CONTRAST', false),
    defaultReduceMotion: getEnvBoolean('VITE_DEFAULT_REDUCE_MOTION', false),
    defaultScreenReaderMode: getEnvBoolean('VITE_DEFAULT_SCREEN_READER_MODE', false)
  },
  
  // Tema Yapılandırması
  theme: {
    defaultColorMode: getEnvString('VITE_DEFAULT_COLOR_MODE', 'light'),
    defaultTheme: getEnvString('VITE_DEFAULT_THEME', 'default')
  },
  
  // Geliştirme Araçları
  dev: {
    enableDevTools: getEnvBoolean('VITE_ENABLE_DEV_TOOLS', true),
    mockApi: getEnvBoolean('VITE_MOCK_API', true),
    logLevel: getEnvString('VITE_LOG_LEVEL', 'debug')
  },
  
  // Ortam
  env: {
    mode: getEnvString('MODE', 'development'),
    isDev: env.DEV || false,
    isProd: env.PROD || false,
    isSsr: env.SSR || false
  }
};

export default config;
