// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Kullanıcı girişi yapma komutu
Cypress.Commands.add('login', (email, password) => {
  cy.log(`Logging in as ${email}`);

  // Gerçek uygulamada API çağrısı yapılır
  // Bu örnek için localStorage'a doğrudan kullanıcı bilgilerini kaydediyoruz
  const user = {
    id: '1',
    name: 'Test Kullanıcı',
    email: email,
    avatar: null,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');

  // Sayfayı yenile
  cy.reload();
});

// Mesaj gönderme komutu
Cypress.Commands.add('sendMessage', (message) => {
  cy.log(`Sending message: ${message}`);

  // Mesaj giriş alanını bul ve mesajı yaz
  cy.get('[data-testid="message-input"]')
    .should('be.visible')
    .clear()
    .type(message);

  // Gönder düğmesine tıkla
  cy.get('[data-testid="send-button"]')
    .should('be.visible')
    .click();

  // Mesajın gönderildiğini kontrol et
  cy.contains(message)
    .should('be.visible');
});

// Dosya yükleme komutu
Cypress.Commands.add('uploadFile', (fileName, fileType, fileContent = 'Test file content') => {
  cy.log(`Uploading file: ${fileName}`);

  // Dosya oluştur
  cy.window().then((win) => {
    const file = new win.File([fileContent], fileName, { type: fileType });
    const dataTransfer = new win.DataTransfer();
    dataTransfer.items.add(file);

    // Dosya yükleme alanını bul ve dosyayı yükle
    cy.get('[data-testid="file-input"]')
      .then((input) => {
        const inputEl = input[0] as HTMLInputElement;
        inputEl.files = dataTransfer.files;
        cy.wrap(input).trigger('change', { force: true });
      });
  });

  // Dosyanın yüklendiğini kontrol et
  cy.contains(fileName)
    .should('be.visible');
});

// Dil değiştirme komutu
Cypress.Commands.add('changeLanguage', (language) => {
  cy.log(`Changing language to: ${language}`);

  // Dil seçici düğmesine tıkla
  cy.get('[data-testid="language-selector"]')
    .should('be.visible')
    .click();

  // Dil seçeneğine tıkla
  cy.get(`[data-testid="language-option-${language}"]`)
    .should('be.visible')
    .click();

  // Dilin değiştiğini kontrol et
  cy.get('html')
    .should('have.attr', 'lang', language);
});

// Tema değiştirme komutu
Cypress.Commands.add('changeTheme', (theme) => {
  cy.log(`Changing theme to: ${theme}`);

  // Tema düğmesine tıkla
  cy.get('[data-testid="theme-toggle"]')
    .should('be.visible')
    .click();

  // Temanın değiştiğini kontrol et
  if (theme === 'dark') {
    cy.get('body')
      .should('have.class', 'chakra-ui-dark');
  } else {
    cy.get('body')
      .should('have.class', 'chakra-ui-light');
  }
});

// Erişilebilirlik ayarlarını değiştirme komutu
Cypress.Commands.add('changeAccessibility', (options) => {
  cy.log(`Changing accessibility settings: ${JSON.stringify(options)}`);

  // Erişilebilirlik menüsü düğmesine tıkla
  cy.get('[data-testid="accessibility-menu-button"]')
    .should('be.visible')
    .click();

  // Yazı boyutunu değiştir
  if (options.fontSize) {
    cy.get(`[data-testid="font-size-${options.fontSize}"]`)
      .should('be.visible')
      .click();
  }

  // Yüksek kontrast modunu değiştir
  if (options.highContrast !== undefined) {
    cy.get('[data-testid="high-contrast-switch"]')
      .should('be.visible')
      .then(($switch) => {
        const isChecked = $switch.prop('checked');
        if ((options.highContrast && !isChecked) || (!options.highContrast && isChecked)) {
          cy.wrap($switch).click();
        }
      });
  }

  // Hareketi azaltma modunu değiştir
  if (options.reduceMotion !== undefined) {
    cy.get('[data-testid="reduce-motion-switch"]')
      .should('be.visible')
      .then(($switch) => {
        const isChecked = $switch.prop('checked');
        if ((options.reduceMotion && !isChecked) || (!options.reduceMotion && isChecked)) {
          cy.wrap($switch).click();
        }
      });
  }

  // Ekran okuyucu modunu değiştir
  if (options.screenReaderMode !== undefined) {
    cy.get('[data-testid="screen-reader-switch"]')
      .should('be.visible')
      .then(($switch) => {
        const isChecked = $switch.prop('checked');
        if ((options.screenReaderMode && !isChecked) || (!options.screenReaderMode && isChecked)) {
          cy.wrap($switch).click();
        }
      });
  }

  // Erişilebilirlik menüsünü kapat
  cy.get('body').click({ force: true });
});

// API anahtarı ayarlama komutu
Cypress.Commands.add('setApiKey', (provider, apiKey) => {
  cy.log(`Setting ${provider} API key: ${apiKey}`);

  // Ayarlar düğmesine tıkla
  cy.get('[data-testid="settings-button"]')
    .should('be.visible')
    .click();

  // API anahtarları sekmesine tıkla
  cy.contains('API Anahtarları').click();

  // API anahtarını gir
  cy.get(`[data-testid="${provider}-api-key-input"]`)
    .should('be.visible')
    .clear()
    .type(apiKey);

  // Kaydet düğmesine tıkla
  cy.get('[data-testid="save-api-keys-button"]')
    .should('be.visible')
    .click();

  // Başarı mesajının görüntülendiğini kontrol et
  cy.contains('API anahtarları başarıyla kaydedildi')
    .should('be.visible');

  // Ayarları kapat
  cy.get('[data-testid="close-settings-button"]')
    .should('be.visible')
    .click();
});

// Kullanıcı profilini güncelleme komutu
Cypress.Commands.add('updateUserProfile', (name, avatarFile = null) => {
  cy.log(`Updating user profile: ${name}`);

  // Profil düğmesine tıkla
  cy.get('[data-testid="user-profile-button"]')
    .should('be.visible')
    .click();

  // Kullanıcı adını değiştir
  cy.get('[data-testid="user-name-input"]')
    .should('be.visible')
    .clear()
    .type(name);

  // Profil resmini değiştir
  if (avatarFile) {
    cy.get('[data-testid="user-avatar-upload"]')
      .should('be.visible')
      .then((input) => {
        cy.fixture(avatarFile, 'base64').then((fileContent) => {
          const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
          const file = new File([blob], avatarFile, { type: 'image/jpeg' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          const inputEl = input[0] as HTMLInputElement;
          inputEl.files = dataTransfer.files;
          cy.wrap(input).trigger('change', { force: true });
        });
      });
  }

  // Kaydet düğmesine tıkla
  cy.get('[data-testid="save-profile-button"]')
    .should('be.visible')
    .click();

  // Başarı mesajının görüntülendiğini kontrol et
  cy.contains('Profil başarıyla güncellendi')
    .should('be.visible');

  // Profili kapat
  cy.get('[data-testid="close-profile-button"]')
    .should('be.visible')
    .click();
});

// Konuşma geçmişini temizleme komutu
Cypress.Commands.add('clearChatHistory', () => {
  cy.log('Clearing chat history');

  // Temizle düğmesine tıkla
  cy.get('[data-testid="clear-chat-button"]')
    .should('be.visible')
    .click();

  // Onay modalını onayla
  cy.get('[data-testid="confirm-clear-button"]')
    .should('be.visible')
    .click();

  // Konuşma başlatıcının görüntülendiğini kontrol et
  cy.get('[data-testid="conversation-starter"]')
    .should('be.visible');
});

// Konuşma geçmişini dışa aktarma komutu
Cypress.Commands.add('exportChatHistory', () => {
  cy.log('Exporting chat history');

  // Menü düğmesine tıkla
  cy.get('[data-testid="header-menu-button"]')
    .should('be.visible')
    .click();

  // Dışa aktar düğmesine tıkla
  cy.get('[data-testid="export-conversation-button"]')
    .should('be.visible')
    .click();

  // Dosya indirme işlemini simüle et
  cy.window().then((win) => {
    cy.stub(win.document, 'createElement').callsFake((element) => {
      const el = win.document.createElement(element);
      if (element === 'a') {
        setTimeout(() => {
          el.dispatchEvent(new Event('click'));
        }, 0);
      }
      return el;
    });
  });
});
