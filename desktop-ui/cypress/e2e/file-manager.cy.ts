describe('File Manager Page', () => {
  beforeEach(() => {
    // Mock Electron
    cy.mockElectron();
    
    // Visit file manager page
    cy.visit('/files');
    
    // Disable smooth scrolling
    cy.disableSmoothScrolling();
    
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
          {
            id: '2',
            name: 'Document 2.docx',
            path: '/path/to/document2.docx',
            type: 'docx',
            size: 2048,
            lastModified: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Image 1.jpg',
            path: '/path/to/image1.jpg',
            type: 'jpg',
            size: 3072,
            lastModified: new Date().toISOString(),
          },
        ]);
    });
  });
  
  it('renders file manager page with correct title', () => {
    // Check if page title is correct
    cy.title().should('include', 'File Manager');
    
    // Check if page heading is correct
    cy.get('[data-testid=page-heading]').should('contain', 'File Manager');
  });
  
  it('displays files in list view', () => {
    // Check if files are displayed in list view
    cy.get('[data-testid=view-mode-list]').click();
    cy.get('[data-testid=files-list]').should('exist');
    cy.get('[data-testid=file-item]').should('have.length', 3);
    cy.get('[data-testid=file-item]').eq(0).should('contain', 'Document 1.pdf');
    cy.get('[data-testid=file-item]').eq(1).should('contain', 'Document 2.docx');
    cy.get('[data-testid=file-item]').eq(2).should('contain', 'Image 1.jpg');
  });
  
  it('displays files in grid view', () => {
    // Check if files are displayed in grid view
    cy.get('[data-testid=view-mode-grid]').click();
    cy.get('[data-testid=files-grid]').should('exist');
    cy.get('[data-testid=file-item]').should('have.length', 3);
  });
  
  it('filters files by type', () => {
    // Filter by PDF
    cy.get('[data-testid=filter-type]').select('pdf');
    cy.get('[data-testid=file-item]').should('have.length', 1);
    cy.get('[data-testid=file-item]').eq(0).should('contain', 'Document 1.pdf');
    
    // Filter by DOCX
    cy.get('[data-testid=filter-type]').select('docx');
    cy.get('[data-testid=file-item]').should('have.length', 1);
    cy.get('[data-testid=file-item]').eq(0).should('contain', 'Document 2.docx');
    
    // Filter by JPG
    cy.get('[data-testid=filter-type]').select('jpg');
    cy.get('[data-testid=file-item]').should('have.length', 1);
    cy.get('[data-testid=file-item]').eq(0).should('contain', 'Image 1.jpg');
    
    // Clear filter
    cy.get('[data-testid=filter-type]').select('all');
    cy.get('[data-testid=file-item]').should('have.length', 3);
  });
  
  it('searches files by name', () => {
    // Search for "Document"
    cy.get('[data-testid=search-input]').type('Document');
    cy.get('[data-testid=file-item]').should('have.length', 2);
    cy.get('[data-testid=file-item]').eq(0).should('contain', 'Document 1.pdf');
    cy.get('[data-testid=file-item]').eq(1).should('contain', 'Document 2.docx');
    
    // Search for "Image"
    cy.get('[data-testid=search-input]').clear().type('Image');
    cy.get('[data-testid=file-item]').should('have.length', 1);
    cy.get('[data-testid=file-item]').eq(0).should('contain', 'Image 1.jpg');
    
    // Clear search
    cy.get('[data-testid=search-input]').clear();
    cy.get('[data-testid=file-item]').should('have.length', 3);
  });
  
  it('sorts files by name', () => {
    // Sort by name ascending
    cy.get('[data-testid=sort-by]').select('name');
    cy.get('[data-testid=sort-order]').select('asc');
    cy.get('[data-testid=file-item]').eq(0).should('contain', 'Document 1.pdf');
    cy.get('[data-testid=file-item]').eq(1).should('contain', 'Document 2.docx');
    cy.get('[data-testid=file-item]').eq(2).should('contain', 'Image 1.jpg');
    
    // Sort by name descending
    cy.get('[data-testid=sort-order]').select('desc');
    cy.get('[data-testid=file-item]').eq(0).should('contain', 'Image 1.jpg');
    cy.get('[data-testid=file-item]').eq(1).should('contain', 'Document 2.docx');
    cy.get('[data-testid=file-item]').eq(2).should('contain', 'Document 1.pdf');
  });
  
  it('sorts files by size', () => {
    // Sort by size ascending
    cy.get('[data-testid=sort-by]').select('size');
    cy.get('[data-testid=sort-order]').select('asc');
    cy.get('[data-testid=file-item]').eq(0).should('contain', 'Document 1.pdf');
    cy.get('[data-testid=file-item]').eq(1).should('contain', 'Document 2.docx');
    cy.get('[data-testid=file-item]').eq(2).should('contain', 'Image 1.jpg');
    
    // Sort by size descending
    cy.get('[data-testid=sort-order]').select('desc');
    cy.get('[data-testid=file-item]').eq(0).should('contain', 'Image 1.jpg');
    cy.get('[data-testid=file-item]').eq(1).should('contain', 'Document 2.docx');
    cy.get('[data-testid=file-item]').eq(2).should('contain', 'Document 1.pdf');
  });
  
  it('navigates to file details when clicking on a file', () => {
    // Click on a file
    cy.get('[data-testid=file-item]').eq(0).click();
    
    // Check if navigated to file details page
    cy.url().should('include', '/files/1');
  });
  
  it('selects multiple files', () => {
    // Select first file
    cy.get('[data-testid=file-checkbox]').eq(0).click();
    
    // Select third file
    cy.get('[data-testid=file-checkbox]').eq(2).click();
    
    // Check if files are selected
    cy.get('[data-testid=file-item]').eq(0).should('have.class', 'selected');
    cy.get('[data-testid=file-item]').eq(1).should('not.have.class', 'selected');
    cy.get('[data-testid=file-item]').eq(2).should('have.class', 'selected');
    
    // Check if selection count is correct
    cy.get('[data-testid=selection-count]').should('contain', '2');
  });
  
  it('performs bulk actions on selected files', () => {
    // Mock delete files
    cy.window().then((win) => {
      win.electron.ipcRenderer.invoke
        .withArgs('delete-files')
        .resolves({ success: true });
    });
    
    // Select first and third files
    cy.get('[data-testid=file-checkbox]').eq(0).click();
    cy.get('[data-testid=file-checkbox]').eq(2).click();
    
    // Open bulk actions menu
    cy.get('[data-testid=bulk-actions-button]').click();
    
    // Click delete action
    cy.get('[data-testid=bulk-action-delete]').click();
    
    // Confirm deletion
    cy.get('[data-testid=confirm-button]').click();
    
    // Check if files are deleted
    cy.get('[data-testid=file-item]').should('have.length', 1);
    cy.get('[data-testid=file-item]').eq(0).should('contain', 'Document 2.docx');
  });
});
