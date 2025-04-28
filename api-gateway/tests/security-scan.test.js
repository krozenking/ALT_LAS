const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Security Vulnerability Scanning Tests
 * 
 * These tests perform automated security vulnerability scanning on the API Gateway
 * to identify potential security issues in dependencies and code.
 */
describe('Security Vulnerability Scanning', () => {
  
  // Set longer timeout for these tests as they may take time
  jest.setTimeout(60000);
  
  it('should not have npm package vulnerabilities', async () => {
    try {
      // Run npm audit
      const { stdout, stderr } = await execPromise('npm audit --json', {
        cwd: path.resolve(__dirname, '..')
      });
      
      // Parse the audit results
      const auditResults = JSON.parse(stdout);
      
      // Check if there are any vulnerabilities
      const vulnerabilities = auditResults.vulnerabilities || {};
      const vulnerabilityCount = Object.keys(vulnerabilities).length;
      
      // Log any vulnerabilities found for informational purposes
      if (vulnerabilityCount > 0) {
        console.warn(`Found ${vulnerabilityCount} vulnerabilities in npm packages:`);
        Object.entries(vulnerabilities).forEach(([pkg, details]) => {
          console.warn(`- ${pkg}: ${details.severity} severity (${details.via.map(v => v.title || v).join(', ')})`);
        });
      }
      
      // Assert no high or critical vulnerabilities
      const highSeverityCount = Object.values(vulnerabilities)
        .filter(v => v.severity === 'high' || v.severity === 'critical').length;
      
      expect(highSeverityCount).toBe(0);
      
    } catch (error) {
      // If npm audit fails to run, the test should fail
      console.error('Error running npm audit:', error);
      throw error;
    }
  });

  it('should pass security headers check', async () => {
    // This test would typically use a tool like helmet-tester or similar
    // For demonstration, we'll check if helmet is properly configured in the app
    
    const fs = require('fs');
    const appCode = fs.readFileSync(path.resolve(__dirname, '../src/index.ts'), 'utf8');
    
    // Check if helmet is imported and used
    const helmetImported = appCode.includes("import helmet from 'helmet'") || 
                          appCode.includes('require("helmet")') ||
                          appCode.includes("require('helmet')");
    
    const helmetUsed = appCode.includes('app.use(helmet') || 
                      appCode.includes('app.use(helmet(') ||
                      appCode.includes('app.use(helmet)');
    
    expect(helmetImported).toBe(true);
    expect(helmetUsed).toBe(true);
  });

  it('should have rate limiting configured', async () => {
    // Check if rate limiting is configured in the app
    const fs = require('fs');
    const appCode = fs.readFileSync(path.resolve(__dirname, '../src/index.ts'), 'utf8');
    const middlewareFiles = fs.readdirSync(path.resolve(__dirname, '../src/middleware'));
    
    // Check if rate limiting middleware exists
    const rateLimiterExists = middlewareFiles.some(file => file.includes('rateLimiter'));
    
    // Check if rate limiting is used in the app
    const rateLimiterUsed = appCode.includes('rateLimiter') || 
                           appCode.includes('rate-limiter') ||
                           appCode.includes('rateLimit');
    
    expect(rateLimiterExists).toBe(true);
    expect(rateLimiterUsed).toBe(true);
  });

  it('should have CORS properly configured', async () => {
    // Check if CORS is configured in the app
    const fs = require('fs');
    const appCode = fs.readFileSync(path.resolve(__dirname, '../src/index.ts'), 'utf8');
    
    // Check if CORS is imported and used
    const corsImported = appCode.includes("import cors from 'cors'") || 
                        appCode.includes('require("cors")') ||
                        appCode.includes("require('cors')");
    
    const corsUsed = appCode.includes('app.use(cors');
    
    expect(corsImported).toBe(true);
    expect(corsUsed).toBe(true);
  });

  it('should have secure cookie settings if cookies are used', async () => {
    // Check if cookies are used securely
    const fs = require('fs');
    const appCode = fs.readFileSync(path.resolve(__dirname, '../src/index.ts'), 'utf8');
    
    // If cookie-parser or express-session is used, check for secure settings
    const cookiesUsed = appCode.includes('cookie-parser') || 
                       appCode.includes('express-session');
    
    if (cookiesUsed) {
      const secureSettings = appCode.includes('secure: true') && 
                            appCode.includes('httpOnly: true');
      
      expect(secureSettings).toBe(true);
    } else {
      // If cookies aren't used, test passes automatically
      expect(true).toBe(true);
    }
  });

  it('should validate environment variables are properly handled', async () => {
    // Check if environment variables are validated
    const fs = require('fs');
    let envValidationFound = false;
    
    // Check common locations for environment validation
    const possibleFiles = [
      '../src/config/env.ts',
      '../src/config/env.js',
      '../src/config/config.ts',
      '../src/config/config.js',
      '../src/utils/env.ts',
      '../src/utils/env.js',
      '../src/index.ts',
      '../src/index.js'
    ];
    
    for (const file of possibleFiles) {
      try {
        const filePath = path.resolve(__dirname, file);
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          // Look for common environment validation patterns
          if (fileContent.includes('process.env') && 
              (fileContent.includes('||') || 
               fileContent.includes('?:') || 
               fileContent.includes('throw') || 
               fileContent.includes('error'))) {
            envValidationFound = true;
            break;
          }
        }
      } catch (error) {
        // Skip if file doesn't exist or can't be read
      }
    }
    
    expect(envValidationFound).toBe(true);
  });
});
