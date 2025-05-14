describe('Dashboard Page', () => {
  beforeEach(() => {
    // Mock Electron
    cy.mockElectron();
    
    // Visit dashboard page
    cy.visit('/dashboard');
    
    // Disable smooth scrolling
    cy.disableSmoothScrolling();
  });
  
  it('renders dashboard page with correct title', () => {
    // Check if page title is correct
    cy.title().should('include', 'Dashboard');
    
    // Check if page heading is correct
    cy.get('[data-testid=page-heading]').should('contain', 'Dashboard');
  });
  
  it('displays user information', () => {
    // Mock user data
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('get-user-info')
        .resolves({
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'Admin',
        });
    });
    
    // Check if user information is displayed
    cy.get('[data-testid=user-name]').should('contain', 'John Doe');
    cy.get('[data-testid=user-email]').should('contain', 'john.doe@example.com');
    cy.get('[data-testid=user-role]').should('contain', 'Admin');
  });
  
  it('displays recent files', () => {
    // Mock recent files data
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('get-recent-files')
        .resolves([
          {
            id: '1',
            name: 'Document 1.pdf',
            path: '/path/to/document1.pdf',
            size: 1024,
            lastModified: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Document 2.pdf',
            path: '/path/to/document2.pdf',
            size: 2048,
            lastModified: new Date().toISOString(),
          },
        ]);
    });
    
    // Check if recent files are displayed
    cy.get('[data-testid=recent-files-list]').should('exist');
    cy.get('[data-testid=recent-file-item]').should('have.length', 2);
    cy.get('[data-testid=recent-file-item]').eq(0).should('contain', 'Document 1.pdf');
    cy.get('[data-testid=recent-file-item]').eq(1).should('contain', 'Document 2.pdf');
  });
  
  it('displays system status', () => {
    // Mock system status data
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('get-system-status')
        .resolves({
          cpu: 25,
          memory: 50,
          disk: 75,
          uptime: 3600,
        });
    });
    
    // Check if system status is displayed
    cy.get('[data-testid=system-status]').should('exist');
    cy.get('[data-testid=cpu-usage]').should('contain', '25%');
    cy.get('[data-testid=memory-usage]').should('contain', '50%');
    cy.get('[data-testid=disk-usage]').should('contain', '75%');
    cy.get('[data-testid=uptime]').should('contain', '1 hour');
  });
  
  it('displays notifications', () => {
    // Mock notifications data
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('get-notifications')
        .resolves([
          {
            id: '1',
            title: 'System Update',
            message: 'A new system update is available.',
            type: 'info',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Disk Space Warning',
            message: 'Disk space is running low.',
            type: 'warning',
            timestamp: new Date().toISOString(),
          },
        ]);
    });
    
    // Check if notifications are displayed
    cy.get('[data-testid=notifications-list]').should('exist');
    cy.get('[data-testid=notification-item]').should('have.length', 2);
    cy.get('[data-testid=notification-item]').eq(0).should('contain', 'System Update');
    cy.get('[data-testid=notification-item]').eq(1).should('contain', 'Disk Space Warning');
  });
  
  it('navigates to file details when clicking on a file', () => {
    // Mock recent files data
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('get-recent-files')
        .resolves([
          {
            id: '1',
            name: 'Document 1.pdf',
            path: '/path/to/document1.pdf',
            size: 1024,
            lastModified: new Date().toISOString(),
          },
        ]);
    });
    
    // Click on a file
    cy.get('[data-testid=recent-file-item]').eq(0).click();
    
    // Check if navigated to file details page
    cy.url().should('include', '/files/1');
  });
  
  it('refreshes dashboard data', () => {
    // Mock initial data
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('get-recent-files')
        .resolves([
          {
            id: '1',
            name: 'Document 1.pdf',
            path: '/path/to/document1.pdf',
            size: 1024,
            lastModified: new Date().toISOString(),
          },
        ]);
    });
    
    // Check initial data
    cy.get('[data-testid=recent-file-item]').should('have.length', 1);
    
    // Mock updated data
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('get-recent-files')
        .resolves([
          {
            id: '1',
            name: 'Document 1.pdf',
            path: '/path/to/document1.pdf',
            size: 1024,
            lastModified: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Document 2.pdf',
            path: '/path/to/document2.pdf',
            size: 2048,
            lastModified: new Date().toISOString(),
          },
        ]);
    });
    
    // Click refresh button
    cy.get('[data-testid=refresh-button]').click();
    
    // Check updated data
    cy.get('[data-testid=recent-file-item]').should('have.length', 2);
  });
});
