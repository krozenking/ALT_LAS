// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Özel komutları tanımla
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Kullanıcı girişi yapar
       * @example cy.login('test@example.com', 'password')
       */
      login(email: string, password: string): Chainable<Element>;

      /**
       * Mesaj gönderir
       * @example cy.sendMessage('Merhaba, dünya!')
       */
      sendMessage(message: string): Chainable<Element>;

      /**
       * Dosya yükler
       * @example cy.uploadFile('test.txt', 'text/plain')
       */
      uploadFile(fileName: string, fileType: string, fileContent?: string): Chainable<Element>;

      /**
       * Dil değiştirir
       * @example cy.changeLanguage('en')
       */
      changeLanguage(language: 'tr' | 'en'): Chainable<Element>;

      /**
       * Tema değiştirir
       * @example cy.changeTheme('dark')
       */
      changeTheme(theme: 'light' | 'dark'): Chainable<Element>;

      /**
       * Erişilebilirlik ayarlarını değiştirir
       * @example cy.changeAccessibility({ fontSize: 'lg', highContrast: true })
       */
      changeAccessibility(options: {
        fontSize?: 'sm' | 'md' | 'lg';
        highContrast?: boolean;
        reduceMotion?: boolean;
        screenReaderMode?: boolean;
      }): Chainable<Element>;

      /**
       * API anahtarı ayarlar
       * @example cy.setApiKey('openai', 'sk-1234567890')
       */
      setApiKey(provider: 'openai' | 'openrouter' | 'ollama', apiKey: string): Chainable<Element>;

      /**
       * Kullanıcı profilini günceller
       * @example cy.updateUserProfile('John Doe', 'avatar.jpg')
       */
      updateUserProfile(name: string, avatarFile?: string | null): Chainable<Element>;

      /**
       * Konuşma geçmişini temizler
       * @example cy.clearChatHistory()
       */
      clearChatHistory(): Chainable<Element>;

      /**
       * Konuşma geçmişini dışa aktarır
       * @example cy.exportChatHistory()
       */
      exportChatHistory(): Chainable<Element>;
    }
  }
}

// Cypress'in uncaught exception'ları yakalamasını engelle
Cypress.on('uncaught:exception', (err, runnable) => {
  // Hataları konsola yazdır
  console.error('Uncaught exception:', err);

  // Testin devam etmesine izin ver
  return false;
});

// Cypress'in fail etmeden önce yeniden deneme sayısını artır
Cypress.config('retries', {
  runMode: 2,
  openMode: 1
});

// Cypress'in viewport'unu ayarla
Cypress.config('viewportWidth', 1280);
Cypress.config('viewportHeight', 720);

// Cypress'in screenshot'ları kaydetme yolunu ayarla
Cypress.Screenshot.defaults({
  capture: 'viewport',
  scale: false,
  disableTimersAndAnimations: true
});
