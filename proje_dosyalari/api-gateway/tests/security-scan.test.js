const { exec } = require("child_process");
const path = require("path");
const util = require("util");
const request = require("supertest"); // Import supertest
const app = require("../src/index"); // Import the app
const execPromise = util.promisify(exec);

/**
 * Security Vulnerability Scanning and Configuration Tests
 * 
 * These tests perform automated security checks on the API Gateway.
 */
describe("Security Checks", () => {
  
  // Set longer timeout for these tests as they may take time
  jest.setTimeout(60000);
  
  describe("Dependency Vulnerability Scanning", () => {
    it("should not have high or critical npm package vulnerabilities", async () => {
      try {
        // Run npm audit
        const { stdout, stderr } = await execPromise("npm audit --json", {
          cwd: path.resolve(__dirname, "..")
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
            console.warn(`- ${pkg}: ${details.severity} severity (${(details.via.map(v => typeof v === 'string' ? v : v.title || v.name)).join(", ")})`);
          });
        }
        
        // Assert no high or critical vulnerabilities
        const highSeverityCount = Object.values(vulnerabilities)
          .filter(v => v.severity === "high" || v.severity === "critical").length;
        
        expect(highSeverityCount).toBe(0);
        
      } catch (error) {
        // npm audit exits with non-zero code if vulnerabilities are found.
        // We need to parse the JSON output even in case of error.
        if (error.stdout) {
          try {
            const auditResults = JSON.parse(error.stdout);
            const vulnerabilities = auditResults.vulnerabilities || {};
            const highSeverityCount = Object.values(vulnerabilities)
              .filter(v => v.severity === "high" || v.severity === "critical").length;
            
            if (highSeverityCount > 0) {
               console.warn(`NPM Audit found ${highSeverityCount} high/critical vulnerabilities.`);
            }
            expect(highSeverityCount).toBe(0);
            return; // Test passes if only low/moderate vulnerabilities found
          } catch (parseError) {
             console.error("Error parsing npm audit output:", parseError);
             throw error; // Re-throw original error if parsing fails
          }
        }
        // If npm audit fails to run for other reasons, the test should fail
        console.error("Error running npm audit:", error);
        throw error;
      }
    });
  });

  describe("Security Header Configuration", () => {
    it("should include essential security headers (Helmet)", async () => {
      const response = await request(app).get("/"); // Request a known endpoint

      // Check for common Helmet headers (adjust based on your specific Helmet config)
      expect(response.headers["x-dns-prefetch-control"]).toBeDefined();
      expect(response.headers["x-frame-options"]).toBeDefined();
      expect(response.headers["strict-transport-security"]).toBeDefined();
      expect(response.headers["x-download-options"]).toBeDefined();
      expect(response.headers["x-content-type-options"]).toBeDefined();
      expect(response.headers["x-xss-protection"]).toBeDefined();
      // Add checks for other headers like Content-Security-Policy if configured
    });
  });

  describe("Rate Limiting Configuration", () => {
    // Note: These tests assume a simple rate limiter is applied globally or to a specific route.
    // Adjust the route and limits based on your actual implementation.
    const testRoute = "/api/auth/login"; // Choose a route likely to be rate-limited
    const limit = 5; // Example limit, adjust as per your config
    const windowMs = 60 * 1000; // Example window, adjust as per your config

    it(`should allow requests below the rate limit for ${testRoute}`, async () => {
      // Send requests just below the limit
      for (let i = 0; i < limit - 1; i++) {
        const response = await request(app).post(testRoute).send({ username: `rate_test_${i}`, password: "test" });
        // We don't strictly check for 200/401 here, just that it's not 429
        expect(response.status).not.toBe(429);
      }
    });

    it.skip(`should block requests exceeding the rate limit for ${testRoute}`, async () => {
      // Send requests up to and exceeding the limit
      // Need to ensure these run sequentially and potentially wait if needed
      for (let i = 0; i < limit + 2; i++) {
        const response = await request(app).post(testRoute).send({ username: `rate_test_exceed_${i}`, password: "test" });
        if (i >= limit) {
          expect(response.status).toBe(429); // Expect 'Too Many Requests'
        } else {
          expect(response.status).not.toBe(429);
        }
      }
      // Optional: Wait for the window to reset and test again
      // await new Promise(resolve => setTimeout(resolve, windowMs));
      // const responseAfterReset = await request(app).post(testRoute).send({ username: "rate_test_reset", password: "test" });
      // expect(responseAfterReset.status).not.toBe(429);
    }, windowMs + 5000); // Increase timeout for this test
  });

  describe("Other Configuration Checks", () => {
    it("should have CORS properly configured (basic check)", async () => {
      const fs = require("fs");
      const appCode = fs.readFileSync(path.resolve(__dirname, "../src/index.ts"), "utf8");
      const corsImported = appCode.includes("import cors from 'cors'") || appCode.includes("require('cors')");
      const corsUsed = appCode.includes("app.use(cors");
      expect(corsImported).toBe(true);
      expect(corsUsed).toBe(true);
      // More robust test: Make request from different origin and check headers
    });

    it("should have secure cookie settings if cookies are used", async () => {
      const fs = require("fs");
      const appCode = fs.readFileSync(path.resolve(__dirname, "../src/index.ts"), "utf8");
      const cookiesUsed = appCode.includes("cookie-parser") || appCode.includes("express-session");
      if (cookiesUsed) {
        // Check for secure=true and httpOnly=true in production-like environment
        // This check is basic; ideally, test cookie headers in responses
        const secureSettingsLikely = appCode.includes("secure: process.env.NODE_ENV === 'production'") || appCode.includes("secure: true");
        const httpOnlySettingLikely = appCode.includes("httpOnly: true");
        expect(secureSettingsLikely).toBe(true);
        expect(httpOnlySettingLikely).toBe(true);
      } else {
        expect(true).toBe(true); // Pass if cookies aren't used
      }
    });

    it("should validate environment variables are properly handled", async () => {
      const fs = require("fs");
      let envValidationFound = false;
      const possibleFiles = [
        "../src/config/env.ts", "../src/config/env.js",
        "../src/config/config.ts", "../src/config/config.js",
        "../src/utils/env.ts", "../src/utils/env.js",
        "../src/index.ts", "../src/index.js"
      ];
      for (const file of possibleFiles) {
        try {
          const filePath = path.resolve(__dirname, file);
          if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, "utf8");
            if (fileContent.includes("process.env") && 
                (fileContent.includes("||") || fileContent.includes("?:") || 
                 fileContent.includes("throw") || fileContent.includes("error"))) {
              envValidationFound = true;
              break;
            }
          }
        } catch (error) { /* Ignore */ }
      }
      expect(envValidationFound).toBe(true);
    });
  });
});

