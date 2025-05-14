describe('API Integration', () => {
  beforeEach(() => {
    // Mock Electron
    cy.mockElectron();
    
    // Visit dashboard page
    cy.visit('/dashboard');
    
    // Disable smooth scrolling
    cy.disableSmoothScrolling();
  });
  
  it('fetches user data from API', () => {
    // Mock API response
    cy.intercept('GET', '/api/user', {
      statusCode: 200,
      body: {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Admin',
      },
    }).as('getUserData');
    
    // Trigger API call
    cy.window().then((win) => {
      win.dispatchEvent(new CustomEvent('fetch-user-data'));
    });
    
    // Wait for API call
    cy.wait('@getUserData');
    
    // Check if user data is displayed
    cy.get('[data-testid=user-name]').should('contain', 'John Doe');
    cy.get('[data-testid=user-email]').should('contain', 'john.doe@example.com');
    cy.get('[data-testid=user-role]').should('contain', 'Admin');
  });
  
  it('handles API error gracefully', () => {
    // Mock API error
    cy.intercept('GET', '/api/user', {
      statusCode: 500,
      body: {
        error: 'Internal Server Error',
      },
    }).as('getUserDataError');
    
    // Trigger API call
    cy.window().then((win) => {
      win.dispatchEvent(new CustomEvent('fetch-user-data'));
    });
    
    // Wait for API call
    cy.wait('@getUserDataError');
    
    // Check if error message is displayed
    cy.get('[data-testid=error-message]').should('contain', 'Failed to fetch user data');
  });
  
  it('sends data to API', () => {
    // Mock API response
    cy.intercept('POST', '/api/user', {
      statusCode: 200,
      body: {
        success: true,
      },
    }).as('updateUserData');
    
    // Fill form
    cy.get('[data-testid=user-name-input]').type('Jane Doe');
    cy.get('[data-testid=user-email-input]').type('jane.doe@example.com');
    
    // Submit form
    cy.get('[data-testid=update-user-button]').click();
    
    // Wait for API call
    cy.wait('@updateUserData').its('request.body').should('deep.equal', {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    });
    
    // Check if success message is displayed
    cy.get('[data-testid=success-message]').should('contain', 'User data updated successfully');
  });
  
  it('handles API rate limiting', () => {
    // Mock API rate limit response
    cy.intercept('GET', '/api/data', {
      statusCode: 429,
      body: {
        error: 'Too Many Requests',
        retryAfter: 5,
      },
      headers: {
        'Retry-After': '5',
      },
    }).as('rateLimitedRequest');
    
    // Trigger API call
    cy.window().then((win) => {
      win.dispatchEvent(new CustomEvent('fetch-data'));
    });
    
    // Wait for API call
    cy.wait('@rateLimitedRequest');
    
    // Check if rate limit message is displayed
    cy.get('[data-testid=rate-limit-message]').should('contain', 'Too many requests');
    cy.get('[data-testid=retry-countdown]').should('contain', '5');
    
    // Mock successful response after retry
    cy.intercept('GET', '/api/data', {
      statusCode: 200,
      body: {
        data: 'Success',
      },
    }).as('successfulRequest');
    
    // Wait for automatic retry
    cy.wait(5000);
    
    // Wait for successful API call
    cy.wait('@successfulRequest');
    
    // Check if data is displayed
    cy.get('[data-testid=data-display]').should('contain', 'Success');
  });
  
  it('handles authentication token refresh', () => {
    // Mock API token expired response
    cy.intercept('GET', '/api/protected-data', {
      statusCode: 401,
      body: {
        error: 'Token Expired',
      },
    }).as('tokenExpiredRequest');
    
    // Mock token refresh response
    cy.intercept('POST', '/api/refresh-token', {
      statusCode: 200,
      body: {
        token: 'new-token',
        expiresIn: 3600,
      },
    }).as('tokenRefreshRequest');
    
    // Mock successful response after token refresh
    cy.intercept('GET', '/api/protected-data', {
      statusCode: 200,
      body: {
        data: 'Protected Data',
      },
    }).as('successfulRequest');
    
    // Trigger API call
    cy.window().then((win) => {
      win.dispatchEvent(new CustomEvent('fetch-protected-data'));
    });
    
    // Wait for token expired request
    cy.wait('@tokenExpiredRequest');
    
    // Wait for token refresh request
    cy.wait('@tokenRefreshRequest');
    
    // Wait for successful request with new token
    cy.wait('@successfulRequest');
    
    // Check if data is displayed
    cy.get('[data-testid=protected-data]').should('contain', 'Protected Data');
  });
  
  it('handles offline mode', () => {
    // Simulate offline mode
    cy.window().then((win) => {
      Object.defineProperty(win.navigator, 'onLine', {
        value: false,
        configurable: true,
      });
      win.dispatchEvent(new Event('offline'));
    });
    
    // Trigger API call
    cy.window().then((win) => {
      win.dispatchEvent(new CustomEvent('fetch-data'));
    });
    
    // Check if offline message is displayed
    cy.get('[data-testid=offline-message]').should('be.visible');
    
    // Simulate online mode
    cy.window().then((win) => {
      Object.defineProperty(win.navigator, 'onLine', {
        value: true,
        configurable: true,
      });
      win.dispatchEvent(new Event('online'));
    });
    
    // Check if offline message is hidden
    cy.get('[data-testid=offline-message]').should('not.be.visible');
    
    // Mock API response
    cy.intercept('GET', '/api/data', {
      statusCode: 200,
      body: {
        data: 'Online Data',
      },
    }).as('onlineRequest');
    
    // Trigger API call
    cy.window().then((win) => {
      win.dispatchEvent(new CustomEvent('fetch-data'));
    });
    
    // Wait for API call
    cy.wait('@onlineRequest');
    
    // Check if data is displayed
    cy.get('[data-testid=data-display]').should('contain', 'Online Data');
  });
});
