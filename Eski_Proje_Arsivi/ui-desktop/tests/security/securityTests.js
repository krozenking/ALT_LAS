// securityTests.js - Automated security tests for UI desktop application

const { expect } = require('chai');
const { Builder, By, until } = require('selenium-webdriver');
const electronPath = require('electron');
const path = require('path');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create a DOMPurify instance
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// XSS payloads for testing
const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src="x" onerror="alert(1)">',
  'javascript:alert(1)',
  '<svg onload="alert(1)">',
  '<a href="javascript:alert(1)">click me</a>',
  '"><script>alert(1)</script>',
  '\'><script>alert(1)</script>',
  '<body onload="alert(1)">',
  '<iframe src="javascript:alert(1)"></iframe>',
  '<details open ontoggle="alert(1)">',
  '<div style="background-image: url(javascript:alert(1))">',
  '<div style="background-image: expression(alert(1))">',
  '<input autofocus onfocus="alert(1)">'
];

// SQL Injection payloads for testing
const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE users; --",
  "1' OR '1' = '1' --",
  "' UNION SELECT username, password FROM users --",
  "admin'--",
  "1'; SELECT * FROM users WHERE name LIKE '%"
];

// Command Injection payloads for testing
const COMMAND_INJECTION_PAYLOADS = [
  "; cat /etc/passwd",
  "& dir",
  "| ls -la",
  "`ls -la`",
  "$(ls -la)",
  "& ping -c 4 8.8.8.8",
  "; rm -rf /",
  "| whoami"
];

describe('UI Desktop Security Tests', function() {
  this.timeout(10000); // Set timeout to 10 seconds
  let driver;

  before(async function() {
    // Start Electron app
    driver = new Builder()
      .forBrowser('electron')
      .withCapabilities({
        'browserName': 'chrome',
        'chromeOptions': {
          'binary': electronPath,
          'args': [`app=${path.join(__dirname, '../out/ALT_LAS-darwin-x64/ALT_LAS.app/Contents/MacOS/ALT_LAS')}`]
        }
      })
      .build();

    // Wait for app to load
    await driver.wait(until.elementLocated(By.css('body')), 5000);
  });

  after(async function() {
    // Close app
    if (driver) {
      await driver.quit();
    }
  });

  describe('Input Sanitization Tests', function() {
    it('should sanitize XSS payloads in input fields', async function() {
      // Find all input fields
      const inputs = await driver.findElements(By.css('input[type="text"], textarea'));
      
      for (const input of inputs) {
        for (const payload of XSS_PAYLOADS) {
          // Enter XSS payload
          await input.clear();
          await input.sendKeys(payload);
          
          // Get value after sanitization
          const value = await input.getAttribute('value');
          
          // Sanitize payload with DOMPurify for comparison
          const sanitized = purify.sanitize(payload);
          
          // Check if sanitization was applied correctly
          expect(value).to.not.include('<script>');
          expect(value).to.not.include('onerror=');
          expect(value).to.not.include('javascript:');
          expect(value).to.not.include('onload=');
        }
      }
    });

    it('should sanitize SQL injection payloads in input fields', async function() {
      // Find all input fields
      const inputs = await driver.findElements(By.css('input[type="text"], textarea'));
      
      for (const input of inputs) {
        for (const payload of SQL_INJECTION_PAYLOADS) {
          // Enter SQL injection payload
          await input.clear();
          await input.sendKeys(payload);
          
          // Submit form if possible
          try {
            const form = await driver.findElement(By.css('form'));
            await form.submit();
          } catch (e) {
            // No form found, continue
          }
          
          // Check for SQL error messages
          const pageSource = await driver.getPageSource();
          expect(pageSource).to.not.include('SQL syntax');
          expect(pageSource).to.not.include('ORA-');
          expect(pageSource).to.not.include('MySQL');
          expect(pageSource).to.not.include('syntax error');
        }
      }
    });

    it('should sanitize command injection payloads in input fields', async function() {
      // Find all input fields
      const inputs = await driver.findElements(By.css('input[type="text"], textarea'));
      
      for (const input of inputs) {
        for (const payload of COMMAND_INJECTION_PAYLOADS) {
          // Enter command injection payload
          await input.clear();
          await input.sendKeys(payload);
          
          // Submit form if possible
          try {
            const form = await driver.findElement(By.css('form'));
            await form.submit();
          } catch (e) {
            // No form found, continue
          }
          
          // Check for command output
          const pageSource = await driver.getPageSource();
          expect(pageSource).to.not.include('/etc/passwd');
          expect(pageSource).to.not.include('Directory of');
          expect(pageSource).to.not.include('total ');
          expect(pageSource).to.not.include('root:');
        }
      }
    });
  });

  describe('Content Security Policy Tests', function() {
    it('should have proper Content-Security-Policy headers', async function() {
      // Execute JavaScript to check CSP headers
      const csp = await driver.executeScript(`
        return window.getComputedStyle(document.querySelector('meta[http-equiv="Content-Security-Policy"]')).content;
      `);
      
      // Check if CSP is properly set
      expect(csp).to.include("default-src 'self'");
      expect(csp).to.include("script-src 'self'");
      expect(csp).to.include("connect-src 'self'");
      expect(csp).to.include("img-src 'self' data:");
      expect(csp).to.include("object-src 'none'");
    });

    it('should block inline scripts', async function() {
      // Try to execute inline script
      const result = await driver.executeScript(`
        try {
          const script = document.createElement('script');
          script.innerHTML = 'window.inlineScriptExecuted = true;';
          document.body.appendChild(script);
          return window.inlineScriptExecuted === true;
        } catch (e) {
          return false;
        }
      `);
      
      // Inline script should be blocked
      expect(result).to.be.false;
    });
  });

  describe('Secure Storage Tests', function() {
    it('should securely store sensitive data', async function() {
      // Try to access localStorage directly
      const localStorage = await driver.executeScript(`
        return Object.keys(localStorage).filter(key => 
          key.includes('token') || 
          key.includes('password') || 
          key.includes('secret') || 
          key.includes('key')
        );
      `);
      
      // No sensitive data should be stored in localStorage
      expect(localStorage).to.be.empty;
    });

    it('should encrypt stored data', async function() {
      // Store test data
      await driver.executeScript(`
        window.api.send('secureStorage:set', { key: 'test-key', value: 'test-value' });
      `);
      
      // Try to access stored data directly
      const storedData = await driver.executeScript(`
        return localStorage.getItem('test-key');
      `);
      
      // Data should be encrypted or not stored in localStorage
      if (storedData) {
        expect(storedData).to.not.equal('test-value');
        expect(storedData).to.include(':'); // Encrypted data format includes colons
      }
    });
  });

  describe('API Security Tests', function() {
    it('should include CSRF token in POST requests', async function() {
      // Mock API request
      const result = await driver.executeScript(`
        return new Promise(resolve => {
          const originalFetch = window.fetch;
          window.fetch = function(url, options) {
            if (options && options.method === 'POST') {
              resolve(options.headers && options.headers['X-CSRF-Token'] !== undefined);
            }
            return originalFetch.apply(this, arguments);
          };
          
          // Trigger a POST request
          try {
            window.api.send('api:post', { url: '/test', data: { test: 'data' } });
          } catch (e) {
            // Ignore errors
          }
          
          // Restore original fetch after 1 second
          setTimeout(() => {
            window.fetch = originalFetch;
            resolve(false);
          }, 1000);
        });
      `);
      
      // POST requests should include CSRF token
      expect(result).to.be.true;
    });

    it('should use HTTPS for all API requests', async function() {
      // Mock API request
      const result = await driver.executeScript(`
        return new Promise(resolve => {
          const originalFetch = window.fetch;
          window.fetch = function(url, options) {
            resolve(url.startsWith('https://'));
            return originalFetch.apply(this, arguments);
          };
          
          // Trigger an API request
          try {
            window.api.send('api:get', { url: '/test' });
          } catch (e) {
            // Ignore errors
          }
          
          // Restore original fetch after 1 second
          setTimeout(() => {
            window.fetch = originalFetch;
            resolve(false);
          }, 1000);
        });
      `);
      
      // API requests should use HTTPS
      expect(result).to.be.true;
    });
  });

  describe('Electron Security Tests', function() {
    it('should have contextIsolation enabled', async function() {
      const contextIsolation = await driver.executeScript(`
        return window.isContextIsolated === true;
      `);
      
      // Context isolation should be enabled
      expect(contextIsolation).to.be.true;
    });

    it('should have nodeIntegration disabled', async function() {
      const nodeIntegration = await driver.executeScript(`
        return window.process !== undefined;
      `);
      
      // Node integration should be disabled
      expect(nodeIntegration).to.be.false;
    });

    it('should use a secure preload script', async function() {
      // Check if preload script exposes a limited API
      const api = await driver.executeScript(`
        return typeof window.api === 'object' && 
               Object.keys(window.api).every(key => 
                 ['send', 'receive', 'invoke'].includes(key)
               );
      `);
      
      // Preload script should expose a limited API
      expect(api).to.be.true;
    });
  });

  describe('Drag and Drop Security Tests', function() {
    it('should sanitize HTML content in dragged items', async function() {
      // Find draggable elements
      const draggables = await driver.findElements(By.css('[draggable="true"]'));
      
      if (draggables.length > 0) {
        // Get first draggable element
        const draggable = draggables[0];
        
        // Try to inject malicious content
        await driver.executeScript(`
          arguments[0].innerHTML = '<img src="x" onerror="alert(1)">';
        `, draggable);
        
        // Get HTML after potential sanitization
        const html = await draggable.getAttribute('innerHTML');
        
        // HTML should be sanitized
        expect(html).to.not.include('onerror=');
      }
    });
  });
});
