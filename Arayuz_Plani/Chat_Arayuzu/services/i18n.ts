/**
 * Internationalization (i18n) Service
 * 
 * This service manages translations and language settings for the chat application.
 */

// Available languages
export type Language = 'tr' | 'en' | 'de' | 'fr' | 'es';

// Translation namespace
export type TranslationNamespace = 'common' | 'chat' | 'auth' | 'settings' | 'errors';

// Translation key structure
export interface TranslationKeys {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    close: string;
    search: string;
    loading: string;
    retry: string;
    send: string;
    online: string;
    offline: string;
    yes: string;
    no: string;
    ok: string;
  };
  chat: {
    newMessage: string;
    typing: string;
    startConversation: string;
    noMessages: string;
    noConversations: string;
    noUsers: string;
    searchUsers: string;
    searchConversations: string;
    createGroup: string;
    addParticipants: string;
    leaveGroup: string;
    deleteConversation: string;
    uploadFile: string;
    today: string;
    yesterday: string;
    messageDeleted: string;
    messageEdited: string;
    userOffline: string;
    userOnline: string;
    userAway: string;
  };
  auth: {
    login: string;
    logout: string;
    register: string;
    forgotPassword: string;
    resetPassword: string;
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    username: string;
    loginSuccess: string;
    loginError: string;
    registerSuccess: string;
    registerError: string;
    logoutSuccess: string;
    sessionExpired: string;
  };
  settings: {
    profile: string;
    account: string;
    notifications: string;
    privacy: string;
    language: string;
    theme: string;
    accessibility: string;
    security: string;
    twoFactorAuth: string;
    changePassword: string;
    devices: string;
    darkMode: string;
    lightMode: string;
    systemMode: string;
    highContrast: string;
    largeText: string;
    reducedMotion: string;
    keyboardMode: string;
  };
  errors: {
    generic: string;
    network: string;
    unauthorized: string;
    notFound: string;
    validation: string;
    serverError: string;
    timeout: string;
    offline: string;
    fileSize: string;
    fileType: string;
    maxFiles: string;
  };
}

// Translation type
export type Translation = {
  [K in TranslationNamespace]: {
    [key: string]: string | { [key: string]: string };
  };
};

class I18nService {
  private static instance: I18nService;
  private currentLanguage: Language = 'tr';
  private translations: { [key in Language]?: Translation } = {};
  private listeners: Function[] = [];
  
  private constructor() {
    this.loadLanguageFromStorage();
    this.loadTranslations();
  }
  
  // Get singleton instance
  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }
  
  // Load language from local storage
  private loadLanguageFromStorage(): void {
    try {
      const storedLanguage = localStorage.getItem('language');
      if (storedLanguage) {
        this.currentLanguage = storedLanguage as Language;
      } else {
        // Use browser language if available
        const browserLanguage = navigator.language.split('-')[0] as Language;
        if (this.isValidLanguage(browserLanguage)) {
          this.currentLanguage = browserLanguage;
        }
      }
    } catch (error) {
      console.error('Error loading language from storage:', error);
    }
  }
  
  // Check if language is valid
  private isValidLanguage(language: string): language is Language {
    return ['tr', 'en', 'de', 'fr', 'es'].includes(language);
  }
  
  // Load translations
  private async loadTranslations(): Promise<void> {
    try {
      // Load translations for current language
      await this.loadTranslationForLanguage(this.currentLanguage);
      
      // Load English as fallback
      if (this.currentLanguage !== 'en') {
        await this.loadTranslationForLanguage('en');
      }
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }
  
  // Load translation for a specific language
  private async loadTranslationForLanguage(language: Language): Promise<void> {
    try {
      // In a real application, this would load translations from a server or file
      // For now, we'll use hardcoded translations
      this.translations[language] = this.getMockTranslations(language);
    } catch (error) {
      console.error(`Error loading translations for ${language}:`, error);
    }
  }
  
  // Get mock translations (for demo purposes)
  private getMockTranslations(language: Language): Translation {
    switch (language) {
      case 'tr':
        return {
          common: {
            save: 'Kaydet',
            cancel: 'İptal',
            delete: 'Sil',
            edit: 'Düzenle',
            close: 'Kapat',
            search: 'Ara',
            loading: 'Yükleniyor',
            retry: 'Yeniden Dene',
            send: 'Gönder',
            online: 'Çevrimiçi',
            offline: 'Çevrimdışı',
            yes: 'Evet',
            no: 'Hayır',
            ok: 'Tamam',
          },
          chat: {
            newMessage: 'Yeni Mesaj',
            typing: '{user} yazıyor...',
            startConversation: 'Sohbet başlat',
            noMessages: 'Henüz mesaj yok',
            noConversations: 'Henüz sohbet yok',
            noUsers: 'Kullanıcı yok',
            searchUsers: 'Kullanıcı ara...',
            searchConversations: 'Sohbet ara...',
            createGroup: 'Grup Oluştur',
            addParticipants: 'Katılımcı Ekle',
            leaveGroup: 'Gruptan Ayrıl',
            deleteConversation: 'Sohbeti Sil',
            uploadFile: 'Dosya Yükle',
            today: 'Bugün',
            yesterday: 'Dün',
            messageDeleted: 'Bu mesaj silindi',
            messageEdited: 'Düzenlendi',
            userOffline: 'Çevrimdışı',
            userOnline: 'Çevrimiçi',
            userAway: 'Uzakta',
          },
          auth: {
            login: 'Giriş Yap',
            logout: 'Çıkış Yap',
            register: 'Kayıt Ol',
            forgotPassword: 'Şifremi Unuttum',
            resetPassword: 'Şifre Sıfırla',
            email: 'E-posta',
            password: 'Şifre',
            confirmPassword: 'Şifre Tekrar',
            name: 'Ad Soyad',
            username: 'Kullanıcı Adı',
            loginSuccess: 'Giriş başarılı',
            loginError: 'Giriş başarısız',
            registerSuccess: 'Kayıt başarılı',
            registerError: 'Kayıt başarısız',
            logoutSuccess: 'Çıkış başarılı',
            sessionExpired: 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.',
          },
          settings: {
            profile: 'Profil',
            account: 'Hesap',
            notifications: 'Bildirimler',
            privacy: 'Gizlilik',
            language: 'Dil',
            theme: 'Tema',
            accessibility: 'Erişilebilirlik',
            security: 'Güvenlik',
            twoFactorAuth: 'İki Faktörlü Kimlik Doğrulama',
            changePassword: 'Şifre Değiştir',
            devices: 'Cihazlar',
            darkMode: 'Koyu Mod',
            lightMode: 'Açık Mod',
            systemMode: 'Sistem Modu',
            highContrast: 'Yüksek Kontrast',
            largeText: 'Büyük Metin',
            reducedMotion: 'Azaltılmış Hareket',
            keyboardMode: 'Klavye Modu',
          },
          errors: {
            generic: 'Bir hata oluştu',
            network: 'Ağ hatası',
            unauthorized: 'Yetkisiz erişim',
            notFound: 'Bulunamadı',
            validation: 'Doğrulama hatası',
            serverError: 'Sunucu hatası',
            timeout: 'Zaman aşımı',
            offline: 'Çevrimdışısınız',
            fileSize: 'Dosya boyutu çok büyük',
            fileType: 'Dosya türü desteklenmiyor',
            maxFiles: 'Maksimum dosya sayısına ulaşıldı',
          },
        };
      case 'en':
        return {
          common: {
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            close: 'Close',
            search: 'Search',
            loading: 'Loading',
            retry: 'Retry',
            send: 'Send',
            online: 'Online',
            offline: 'Offline',
            yes: 'Yes',
            no: 'No',
            ok: 'OK',
          },
          chat: {
            newMessage: 'New Message',
            typing: '{user} is typing...',
            startConversation: 'Start conversation',
            noMessages: 'No messages yet',
            noConversations: 'No conversations yet',
            noUsers: 'No users',
            searchUsers: 'Search users...',
            searchConversations: 'Search conversations...',
            createGroup: 'Create Group',
            addParticipants: 'Add Participants',
            leaveGroup: 'Leave Group',
            deleteConversation: 'Delete Conversation',
            uploadFile: 'Upload File',
            today: 'Today',
            yesterday: 'Yesterday',
            messageDeleted: 'This message was deleted',
            messageEdited: 'Edited',
            userOffline: 'Offline',
            userOnline: 'Online',
            userAway: 'Away',
          },
          auth: {
            login: 'Login',
            logout: 'Logout',
            register: 'Register',
            forgotPassword: 'Forgot Password',
            resetPassword: 'Reset Password',
            email: 'Email',
            password: 'Password',
            confirmPassword: 'Confirm Password',
            name: 'Full Name',
            username: 'Username',
            loginSuccess: 'Login successful',
            loginError: 'Login failed',
            registerSuccess: 'Registration successful',
            registerError: 'Registration failed',
            logoutSuccess: 'Logout successful',
            sessionExpired: 'Your session has expired. Please log in again.',
          },
          settings: {
            profile: 'Profile',
            account: 'Account',
            notifications: 'Notifications',
            privacy: 'Privacy',
            language: 'Language',
            theme: 'Theme',
            accessibility: 'Accessibility',
            security: 'Security',
            twoFactorAuth: 'Two-Factor Authentication',
            changePassword: 'Change Password',
            devices: 'Devices',
            darkMode: 'Dark Mode',
            lightMode: 'Light Mode',
            systemMode: 'System Mode',
            highContrast: 'High Contrast',
            largeText: 'Large Text',
            reducedMotion: 'Reduced Motion',
            keyboardMode: 'Keyboard Mode',
          },
          errors: {
            generic: 'An error occurred',
            network: 'Network error',
            unauthorized: 'Unauthorized access',
            notFound: 'Not found',
            validation: 'Validation error',
            serverError: 'Server error',
            timeout: 'Timeout',
            offline: 'You are offline',
            fileSize: 'File size is too large',
            fileType: 'File type is not supported',
            maxFiles: 'Maximum number of files reached',
          },
        };
      default:
        // Return English translations as fallback
        return this.getMockTranslations('en');
    }
  }
  
  // Get current language
  public getLanguage(): Language {
    return this.currentLanguage;
  }
  
  // Set language
  public async setLanguage(language: Language): Promise<void> {
    if (this.currentLanguage === language) {
      return;
    }
    
    this.currentLanguage = language;
    
    // Save language to local storage
    try {
      localStorage.setItem('language', language);
    } catch (error) {
      console.error('Error saving language to storage:', error);
    }
    
    // Load translations for the new language
    await this.loadTranslationForLanguage(language);
    
    // Notify listeners
    this.notifyListeners();
  }
  
  // Get available languages
  public getAvailableLanguages(): { code: Language; name: string }[] {
    return [
      { code: 'tr', name: 'Türkçe' },
      { code: 'en', name: 'English' },
      { code: 'de', name: 'Deutsch' },
      { code: 'fr', name: 'Français' },
      { code: 'es', name: 'Español' },
    ];
  }
  
  // Translate a key
  public translate(namespace: TranslationNamespace, key: string, params?: { [key: string]: string }): string {
    // Get translation for current language
    const translation = this.translations[this.currentLanguage];
    
    if (!translation) {
      return key;
    }
    
    // Get translation for namespace
    const namespaceTranslation = translation[namespace];
    
    if (!namespaceTranslation) {
      return key;
    }
    
    // Get translation for key
    let result = this.getNestedTranslation(namespaceTranslation, key);
    
    // If translation not found, try fallback language
    if (!result && this.currentLanguage !== 'en') {
      const fallbackTranslation = this.translations['en'];
      
      if (fallbackTranslation) {
        const fallbackNamespaceTranslation = fallbackTranslation[namespace];
        
        if (fallbackNamespaceTranslation) {
          result = this.getNestedTranslation(fallbackNamespaceTranslation, key);
        }
      }
    }
    
    // If still no translation, return key
    if (!result) {
      return key;
    }
    
    // Replace parameters
    if (params) {
      Object.keys(params).forEach(param => {
        result = result.replace(`{${param}}`, params[param]);
      });
    }
    
    return result;
  }
  
  // Get nested translation
  private getNestedTranslation(obj: any, key: string): string {
    const keys = key.split('.');
    let result = obj;
    
    for (const k of keys) {
      if (result[k] === undefined) {
        return '';
      }
      
      result = result[k];
    }
    
    return typeof result === 'string' ? result : '';
  }
  
  // Add listener for language changes
  public addListener(callback: Function): void {
    this.listeners.push(callback);
  }
  
  // Remove listener
  public removeListener(callback: Function): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  // Notify listeners of language change
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentLanguage);
      } catch (error) {
        console.error('Error in language change listener:', error);
      }
    });
  }
}

// Export singleton instance
export const i18n = I18nService.getInstance();

// Helper function for easier translation
export const t = (namespace: TranslationNamespace, key: string, params?: { [key: string]: string }): string => {
  return i18n.translate(namespace, key, params);
};
