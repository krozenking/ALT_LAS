describe('Accessibility Features', () => {
  beforeEach(() => {
    // Uygulamayı ziyaret et
    cy.visit('/');
    
    // Yükleme tamamlanana kadar bekle
    cy.get('[data-testid="loading-indicator"]', { timeout: 10000 }).should('not.exist');
  });
  
  it('has proper heading structure', () => {
    // Başlık hiyerarşisini kontrol et
    cy.get('h1').should('exist');
    cy.get('h2').should('exist');
  });
  
  it('has proper ARIA attributes', () => {
    // Mesaj giriş alanının erişilebilirlik özelliklerini kontrol et
    cy.get('[data-testid="message-input"]')
      .should('have.attr', 'aria-label')
      .and('not.be.empty');
    
    // Gönder düğmesinin erişilebilirlik özelliklerini kontrol et
    cy.get('[data-testid="send-button"]')
      .should('have.attr', 'aria-label')
      .and('not.be.empty');
  });
  
  it('supports keyboard navigation', () => {
    // Tab tuşu ile gezinme
    cy.get('body').tab();
    
    // İlk odaklanabilir öğenin odaklandığını kontrol et
    cy.focused().should('exist');
    
    // Tab tuşu ile gezinmeye devam et
    cy.focused().tab();
    
    // İkinci odaklanabilir öğenin odaklandığını kontrol et
    cy.focused().should('exist');
  });
  
  it('allows changing font size', () => {
    // Erişilebilirlik menüsü düğmesine tıkla
    cy.get('[data-testid="accessibility-menu-button"]').click();
    
    // Yazı boyutu seçeneklerinin görüntülendiğini kontrol et
    cy.get('[data-testid="font-size-options"]').should('be.visible');
    
    // Büyük yazı boyutunu seç
    cy.get('[data-testid="font-size-lg"]').click();
    
    // Yazı boyutunun değiştiğini kontrol et
    cy.get('body').should('have.class', 'font-size-lg');
  });
  
  it('allows enabling high contrast mode', () => {
    // Erişilebilirlik menüsü düğmesine tıkla
    cy.get('[data-testid="accessibility-menu-button"]').click();
    
    // Yüksek kontrast düğmesinin görüntülendiğini kontrol et
    cy.get('[data-testid="high-contrast-switch"]').should('be.visible');
    
    // Yüksek kontrast modunu etkinleştir
    cy.get('[data-testid="high-contrast-switch"]').click();
    
    // Yüksek kontrast modunun etkinleştirildiğini kontrol et
    cy.get('body').should('have.class', 'high-contrast');
  });
  
  it('allows enabling reduced motion mode', () => {
    // Erişilebilirlik menüsü düğmesine tıkla
    cy.get('[data-testid="accessibility-menu-button"]').click();
    
    // Hareketi azaltma düğmesinin görüntülendiğini kontrol et
    cy.get('[data-testid="reduce-motion-switch"]').should('be.visible');
    
    // Hareketi azaltma modunu etkinleştir
    cy.get('[data-testid="reduce-motion-switch"]').click();
    
    // Hareketi azaltma modunun etkinleştirildiğini kontrol et
    cy.get('body').should('have.class', 'reduce-motion');
  });
  
  it('allows enabling screen reader mode', () => {
    // Erişilebilirlik menüsü düğmesine tıkla
    cy.get('[data-testid="accessibility-menu-button"]').click();
    
    // Ekran okuyucu düğmesinin görüntülendiğini kontrol et
    cy.get('[data-testid="screen-reader-switch"]').should('be.visible');
    
    // Ekran okuyucu modunu etkinleştir
    cy.get('[data-testid="screen-reader-switch"]').click();
    
    // Ekran okuyucu modunun etkinleştirildiğini kontrol et
    cy.get('body').should('have.class', 'screen-reader-mode');
  });
});
