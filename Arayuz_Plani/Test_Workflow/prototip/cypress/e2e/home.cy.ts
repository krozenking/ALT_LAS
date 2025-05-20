// cypress/e2e/home.cy.ts

describe('Home Page', () => {
  beforeEach(() => {
    // Visit the home page
    cy.visit('/');
  });

  it('should display the page title', () => {
    cy.get('h1').should('contain', 'ALT_LAS Arayüz Prototip');
  });

  it('should display theme selection buttons', () => {
    cy.contains('Açık Tema').should('be.visible');
    cy.contains('Koyu Tema').should('be.visible');
    cy.contains('Sistem Teması').should('be.visible');
  });

  it('should change theme when theme buttons are clicked', () => {
    // Get the main container
    const mainContainer = cy.get('main').parent();
    
    // Click dark theme button
    cy.contains('Koyu Tema').click();
    
    // Check if the background class has changed to dark
    mainContainer.should('have.class', 'bg-gray-900');
    mainContainer.should('have.class', 'text-white');
    
    // Click light theme button
    cy.contains('Açık Tema').click();
    
    // Check if the background class has changed to light
    mainContainer.should('have.class', 'bg-white');
    mainContainer.should('have.class', 'text-gray-900');
  });

  it('should highlight the active theme button', () => {
    // Get all theme buttons
    const lightButton = cy.contains('Açık Tema');
    const darkButton = cy.contains('Koyu Tema');
    const systemButton = cy.contains('Sistem Teması');
    
    // Initially, system button should be primary (default in the store)
    systemButton.should('have.class', 'bg-blue-600'); // primary style
    lightButton.should('have.class', 'bg-gray-200'); // secondary style
    darkButton.should('have.class', 'bg-gray-200'); // secondary style
    
    // Click light theme button
    lightButton.click();
    
    // Now light button should be primary
    lightButton.should('have.class', 'bg-blue-600'); // primary style
    darkButton.should('have.class', 'bg-gray-200'); // secondary style
    systemButton.should('have.class', 'bg-gray-200'); // secondary style
    
    // Click dark theme button
    darkButton.click();
    
    // Now dark button should be primary
    darkButton.should('have.class', 'bg-blue-600'); // primary style
    lightButton.should('have.class', 'bg-gray-200'); // secondary style
    systemButton.should('have.class', 'bg-gray-200'); // secondary style
  });

  it('should display button variations', () => {
    // Check if all button sections are rendered
    cy.contains('Buton Varyasyonları').should('be.visible');
    cy.contains('Primary').should('be.visible');
    cy.contains('Secondary').should('be.visible');
    cy.contains('Tertiary').should('be.visible');
    
    // Check if buttons with different sizes are rendered
    cy.contains('Small').should('be.visible');
    cy.contains('Medium').should('be.visible');
    cy.contains('Large').should('be.visible');
  });

  it('should display accessibility section', () => {
    cy.contains('Erişilebilirlik Özellikleri').should('be.visible');
    cy.contains('Erişilebilirlik Testi').should('be.visible');
  });

  it('should show alert when accessibility test button is clicked', () => {
    // Spy on window.alert
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);
    
    // Click the accessibility test button
    cy.contains('Erişilebilirlik Testi').click();
    
    // Check if alert was called with the correct message
    cy.wrap(alertStub).should('have.been.calledWith', 'Erişilebilirlik testi başarılı!');
  });

  it('should navigate to different sections when navigation links are clicked', () => {
    // Check if navigation links are rendered
    cy.get('nav').should('be.visible');
    
    // Click on the "Buton Varyasyonları" link
    cy.get('nav').contains('Buton Varyasyonları').click();
    
    // Check if the page scrolls to the "Buton Varyasyonları" section
    cy.get('h2').contains('Buton Varyasyonları').should('be.visible');
    cy.get('h2').contains('Buton Varyasyonları').should('be.inViewport');
    
    // Click on the "Erişilebilirlik Özellikleri" link
    cy.get('nav').contains('Erişilebilirlik Özellikleri').click();
    
    // Check if the page scrolls to the "Erişilebilirlik Özellikleri" section
    cy.get('h2').contains('Erişilebilirlik Özellikleri').should('be.visible');
    cy.get('h2').contains('Erişilebilirlik Özellikleri').should('be.inViewport');
  });

  it('should be responsive and adapt to different screen sizes', () => {
    // Test on mobile viewport
    cy.viewport('iphone-6');
    cy.get('h1').should('be.visible');
    cy.contains('Açık Tema').should('be.visible');
    
    // Test on tablet viewport
    cy.viewport('ipad-2');
    cy.get('h1').should('be.visible');
    cy.contains('Açık Tema').should('be.visible');
    
    // Test on desktop viewport
    cy.viewport(1280, 800);
    cy.get('h1').should('be.visible');
    cy.contains('Açık Tema').should('be.visible');
  });

  it('should have no accessibility violations', () => {
    // Check for accessibility violations
    cy.checkA11y();
  });

  it('should take visual snapshots of the home page', () => {
    // Take a snapshot of the home page with default theme
    cy.percySnapshot('Home Page - Default Theme');
    
    // Click dark theme button
    cy.contains('Koyu Tema').click();
    
    // Take a snapshot of the home page with dark theme
    cy.percySnapshot('Home Page - Dark Theme');
    
    // Click light theme button
    cy.contains('Açık Tema').click();
    
    // Take a snapshot of the home page with light theme
    cy.percySnapshot('Home Page - Light Theme');
  });
});
