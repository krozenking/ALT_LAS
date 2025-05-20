// cypress/e2e/form.cy.ts

describe('Form Component', () => {
  beforeEach(() => {
    // Visit the page with the form
    cy.visit('/');
  });

  it('should display the form', () => {
    cy.get('form[aria-label="Kayıt formu"]').should('be.visible');
    cy.get('input[id^="textfield-isim"]').should('be.visible');
    cy.get('input[id^="textfield-e-posta"]').should('be.visible');
    cy.get('button[id^="dropdown-ülke"]').should('be.visible');
    cy.get('input[id^="checkbox-kullanım"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible').and('contain', 'Gönder');
  });

  it('should show validation errors when submitting empty form', () => {
    // Submit the form without entering any data
    cy.get('button[type="submit"]').click();

    // Check if validation errors are displayed
    cy.contains('İsim alanı zorunludur').should('be.visible');
    cy.contains('E-posta alanı zorunludur').should('be.visible');
    cy.contains('Ülke seçimi zorunludur').should('be.visible');
    cy.contains('Kullanım koşullarını kabul etmelisiniz').should('be.visible');
  });

  it('should validate email format', () => {
    // Enter invalid email
    cy.get('input[id^="textfield-isim"]').type('Test User');
    cy.get('input[id^="textfield-e-posta"]').type('invalid-email');
    
    // Open dropdown and select a country
    cy.get('button[id^="dropdown-ülke"]').click();
    cy.contains('Türkiye').click();
    
    // Check terms
    cy.get('input[id^="checkbox-kullanım"]').click();
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Check if email validation error is displayed
    cy.contains('Geçerli bir e-posta adresi giriniz').should('be.visible');
  });

  it('should submit the form successfully with valid data', () => {
    // Fill out the form
    cy.get('input[id^="textfield-isim"]').type('Test User');
    cy.get('input[id^="textfield-e-posta"]').type('test@example.com');
    
    // Open dropdown and select a country
    cy.get('button[id^="dropdown-ülke"]').click();
    cy.contains('Türkiye').click();
    
    // Check terms
    cy.get('input[id^="checkbox-kullanım"]').click();
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Check if success message is displayed
    cy.contains('Kayıt Başarılı!').should('be.visible');
    cy.contains('Hesabınız başarıyla oluşturuldu').should('be.visible');
  });

  it('should show error message when using existing email', () => {
    // Fill out the form with existing email
    cy.get('input[id^="textfield-isim"]').type('Test User');
    cy.get('input[id^="textfield-e-posta"]').type('existing@example.com');
    
    // Open dropdown and select a country
    cy.get('button[id^="dropdown-ülke"]').click();
    cy.contains('Türkiye').click();
    
    // Check terms
    cy.get('input[id^="checkbox-kullanım"]').click();
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Check if error message is displayed
    cy.contains('Bu e-posta adresi zaten kullanılıyor').should('be.visible');
  });

  it('should clear validation errors when valid input is provided', () => {
    // Submit empty form to trigger validation errors
    cy.get('button[type="submit"]').click();
    
    // Check if validation errors are displayed
    cy.contains('İsim alanı zorunludur').should('be.visible');
    
    // Enter valid name
    cy.get('input[id^="textfield-isim"]').type('Test User');
    
    // Check if name validation error is cleared
    cy.contains('İsim alanı zorunludur').should('not.exist');
  });
});
