describe('End-to-End Tests', () => {
  beforeEach(() => {
    // Mock Electron
    cy.mockElectron();
    
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Admin',
      }));
    });
    
    // Disable smooth scrolling
    cy.disableSmoothScrolling();
  });
  
  it('completes a full workflow: login, navigate, create, edit, delete', () => {
    // Visit login page
    cy.visit('/login');
    
    // Check if already logged in and redirected
    cy.url().should('include', '/dashboard');
    
    // Navigate to file manager
    cy.get('[data-testid=nav-item-files]').click();
    cy.url().should('include', '/files');
    
    // Mock files data
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('get-files')
        .resolves([
          {
            id: '1',
            name: 'Document 1.pdf',
            path: '/path/to/document1.pdf',
            type: 'pdf',
            size: 1024,
            lastModified: new Date().toISOString(),
          },
        ]);
    });
    
    // Check if files are displayed
    cy.get('[data-testid=file-item]').should('have.length', 1);
    
    // Click create new file button
    cy.get('[data-testid=create-file-button]').click();
    
    // Fill new file form
    cy.get('[data-testid=file-name-input]').type('New Document.pdf');
    cy.get('[data-testid=file-type-select]').select('pdf');
    
    // Mock file creation
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('create-file')
        .resolves({
          id: '2',
          name: 'New Document.pdf',
          path: '/path/to/new-document.pdf',
          type: 'pdf',
          size: 0,
          lastModified: new Date().toISOString(),
        });
    });
    
    // Submit form
    cy.get('[data-testid=create-file-submit]').click();
    
    // Mock updated files data
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('get-files')
        .resolves([
          {
            id: '1',
            name: 'Document 1.pdf',
            path: '/path/to/document1.pdf',
            type: 'pdf',
            size: 1024,
            lastModified: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'New Document.pdf',
            path: '/path/to/new-document.pdf',
            type: 'pdf',
            size: 0,
            lastModified: new Date().toISOString(),
          },
        ]);
    });
    
    // Check if new file is displayed
    cy.get('[data-testid=file-item]').should('have.length', 2);
    cy.get('[data-testid=file-item]').eq(1).should('contain', 'New Document.pdf');
    
    // Click on new file to view details
    cy.get('[data-testid=file-item]').eq(1).click();
    cy.url().should('include', '/files/2');
    
    // Click edit button
    cy.get('[data-testid=edit-file-button]').click();
    
    // Edit file name
    cy.get('[data-testid=file-name-input]').clear().type('Updated Document.pdf');
    
    // Mock file update
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('update-file')
        .resolves({
          id: '2',
          name: 'Updated Document.pdf',
          path: '/path/to/updated-document.pdf',
          type: 'pdf',
          size: 0,
          lastModified: new Date().toISOString(),
        });
    });
    
    // Submit form
    cy.get('[data-testid=update-file-submit]').click();
    
    // Check if file name is updated
    cy.get('[data-testid=file-name]').should('contain', 'Updated Document.pdf');
    
    // Navigate back to file list
    cy.get('[data-testid=back-button]').click();
    cy.url().should('include', '/files');
    
    // Mock updated files data
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('get-files')
        .resolves([
          {
            id: '1',
            name: 'Document 1.pdf',
            path: '/path/to/document1.pdf',
            type: 'pdf',
            size: 1024,
            lastModified: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Updated Document.pdf',
            path: '/path/to/updated-document.pdf',
            type: 'pdf',
            size: 0,
            lastModified: new Date().toISOString(),
          },
        ]);
    });
    
    // Check if file name is updated in list
    cy.get('[data-testid=file-item]').eq(1).should('contain', 'Updated Document.pdf');
    
    // Select the file
    cy.get('[data-testid=file-checkbox]').eq(1).click();
    
    // Open bulk actions menu
    cy.get('[data-testid=bulk-actions-button]').click();
    
    // Mock file deletion
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('delete-files')
        .resolves({ success: true });
    });
    
    // Click delete action
    cy.get('[data-testid=bulk-action-delete]').click();
    
    // Confirm deletion
    cy.get('[data-testid=confirm-button]').click();
    
    // Mock updated files data
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('get-files')
        .resolves([
          {
            id: '1',
            name: 'Document 1.pdf',
            path: '/path/to/document1.pdf',
            type: 'pdf',
            size: 1024,
            lastModified: new Date().toISOString(),
          },
        ]);
    });
    
    // Check if file is deleted
    cy.get('[data-testid=file-item]').should('have.length', 1);
    cy.get('[data-testid=file-item]').eq(0).should('contain', 'Document 1.pdf');
    
    // Navigate to settings
    cy.get('[data-testid=nav-item-settings]').click();
    cy.url().should('include', '/settings');
    
    // Change theme setting
    cy.get('[data-testid=theme-select]').select('dark');
    
    // Save settings
    cy.get('[data-testid=save-settings-button]').click();
    
    // Check if theme is applied
    cy.get('body').should('have.class', 'dark-theme');
    
    // Logout
    cy.get('[data-testid=user-menu]').click();
    cy.get('[data-testid=logout-button]').click();
    
    // Check if redirected to login page
    cy.url().should('include', '/login');
  });
  
  it('handles file upload and processing workflow', () => {
    // Visit file manager
    cy.visit('/files');
    
    // Click upload button
    cy.get('[data-testid=upload-button]').click();
    
    // Mock file selection
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('select-files')
        .resolves([
          {
            path: '/path/to/upload.pdf',
            name: 'upload.pdf',
            size: 5000,
          },
        ]);
    });
    
    // Click select files button
    cy.get('[data-testid=select-files-button]').click();
    
    // Check if selected file is displayed
    cy.get('[data-testid=selected-file]').should('contain', 'upload.pdf');
    
    // Mock upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 20;
      cy.window().then((win) => {
        win.electron.ipcRenderer.on.getCalls().forEach(call => {
          if (call.args[0] === 'upload-progress') {
            call.args[1]({
              file: 'upload.pdf',
              progress: Math.min(progress, 100),
            });
          }
        });
      });
      
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, 500);
    
    // Mock upload success
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('upload-files')
        .resolves({
          success: true,
          files: [
            {
              id: '3',
              name: 'upload.pdf',
              path: '/path/to/upload.pdf',
              type: 'pdf',
              size: 5000,
              lastModified: new Date().toISOString(),
            },
          ],
        });
    });
    
    // Click upload button
    cy.get('[data-testid=upload-submit-button]').click();
    
    // Check upload progress
    cy.get('[data-testid=upload-progress]').should('exist');
    
    // Wait for upload to complete
    cy.get('[data-testid=upload-progress]', { timeout: 10000 }).should('have.attr', 'aria-valuenow', '100');
    
    // Check success message
    cy.get('[data-testid=upload-success-message]').should('be.visible');
    
    // Mock processing status
    cy.window().then((win) => {
      win.electron.ipcRenderer.on.getCalls().forEach(call => {
        if (call.args[0] === 'file-processing-status') {
          call.args[1]({
            fileId: '3',
            status: 'processing',
            progress: 0,
          });
        }
      });
    });
    
    // Close upload dialog
    cy.get('[data-testid=close-upload-dialog-button]').click();
    
    // Mock updated files data
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('get-files')
        .resolves([
          {
            id: '1',
            name: 'Document 1.pdf',
            path: '/path/to/document1.pdf',
            type: 'pdf',
            size: 1024,
            lastModified: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'upload.pdf',
            path: '/path/to/upload.pdf',
            type: 'pdf',
            size: 5000,
            lastModified: new Date().toISOString(),
            status: 'processing',
            progress: 0,
          },
        ]);
    });
    
    // Check if uploaded file is in the list with processing status
    cy.get('[data-testid=file-item]').should('have.length', 2);
    cy.get('[data-testid=file-item]').eq(1).should('contain', 'upload.pdf');
    cy.get('[data-testid=file-status]').eq(1).should('contain', 'Processing');
    
    // Mock processing progress
    let processingProgress = 0;
    const processingInterval = setInterval(() => {
      processingProgress += 20;
      cy.window().then((win) => {
        win.electron.ipcRenderer.on.getCalls().forEach(call => {
          if (call.args[0] === 'file-processing-status') {
            call.args[1]({
              fileId: '3',
              status: processingProgress < 100 ? 'processing' : 'completed',
              progress: Math.min(processingProgress, 100),
            });
          }
        });
      });
      
      if (processingProgress >= 100) {
        clearInterval(processingInterval);
      }
    }, 500);
    
    // Wait for processing to complete
    cy.get('[data-testid=file-status]', { timeout: 10000 }).eq(1).should('contain', 'Completed');
  });
});
