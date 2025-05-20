/**
 * Test Report Generator
 * 
 * This script generates a comprehensive test report by combining results from
 * different test types (unit, integration, e2e, a11y, visual).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Function to read JSON file
function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
  return null;
}

// Function to parse JUnit XML file
function parseJunitXml(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const xml = fs.readFileSync(filePath, 'utf8');
      // Simple parsing for demonstration purposes
      // In a real implementation, use a proper XML parser
      const testsuites = xml.match(/<testsuite[^>]*>/g) || [];
      const tests = parseInt(testsuites.reduce((sum, suite) => {
        const match = suite.match(/tests="(\d+)"/);
        return sum + (match ? parseInt(match[1]) : 0);
      }, 0));
      const failures = parseInt(testsuites.reduce((sum, suite) => {
        const match = suite.match(/failures="(\d+)"/);
        return sum + (match ? parseInt(match[1]) : 0);
      }, 0));
      const skipped = parseInt(testsuites.reduce((sum, suite) => {
        const match = suite.match(/skipped="(\d+)"/);
        return sum + (match ? parseInt(match[1]) : 0);
      }, 0));
      const time = parseFloat(testsuites.reduce((sum, suite) => {
        const match = suite.match(/time="([\d\.]+)"/);
        return sum + (match ? parseFloat(match[1]) : 0);
      }, 0));
      
      return {
        tests,
        failures,
        skipped,
        time
      };
    }
  } catch (error) {
    console.error(`Error parsing XML file ${filePath}:`, error);
  }
  return null;
}

// Function to find files recursively
function findFiles(dir, pattern) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(findFiles(filePath, pattern));
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  }
  return results;
}

// Collect test results
const testResults = {
  unit: null,
  integration: null,
  e2e: null,
  a11y: null,
  visual: null
};

// Unit test results
const unitTestResultPath = path.join(__dirname, '..', 'reports', 'unit', 'results.json');
testResults.unit = readJsonFile(unitTestResultPath);

// Integration test results
const integrationTestResultPath = path.join(__dirname, '..', 'reports', 'integration', 'results.json');
testResults.integration = readJsonFile(integrationTestResultPath);

// E2E test results
const e2eTestResultFiles = findFiles(path.join(__dirname, '..', 'reports', 'e2e'), /results.*\.xml$/);
testResults.e2e = e2eTestResultFiles.length > 0 ? parseJunitXml(e2eTestResultFiles[0]) : null;

// A11y test results
const a11yTestResultFiles = findFiles(path.join(__dirname, '..', 'reports', 'a11y'), /results.*\.xml$/);
testResults.a11y = a11yTestResultFiles.length > 0 ? parseJunitXml(a11yTestResultFiles[0]) : null;

// Visual test results
const visualTestResultFiles = findFiles(path.join(__dirname, '..', 'reports', 'visual'), /results.*\.xml$/);
testResults.visual = visualTestResultFiles.length > 0 ? parseJunitXml(visualTestResultFiles[0]) : null;

// Generate summary
const summary = {
  totalTests: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  duration: 0,
  suites: []
};

// Process unit test results
if (testResults.unit) {
  const unitSuite = {
    name: 'Unit Tests',
    tests: []
  };
  
  let unitTotalTests = 0;
  let unitPassedTests = 0;
  let unitFailedTests = 0;
  let unitSkippedTests = 0;
  let unitDuration = 0;
  
  // Process test results
  if (testResults.unit.testResults) {
    testResults.unit.testResults.forEach(testResult => {
      testResult.assertionResults.forEach(assertion => {
        unitTotalTests++;
        
        if (assertion.status === 'passed') {
          unitPassedTests++;
        } else if (assertion.status === 'failed') {
          unitFailedTests++;
        } else if (assertion.status === 'skipped') {
          unitSkippedTests++;
        }
        
        unitSuite.tests.push({
          name: assertion.fullName || assertion.title,
          status: assertion.status,
          duration: assertion.duration || 0,
          error: assertion.failureMessages ? assertion.failureMessages.join('\n') : null
        });
      });
      
      unitDuration += testResult.endTime - testResult.startTime;
    });
  }
  
  summary.totalTests += unitTotalTests;
  summary.passed += unitPassedTests;
  summary.failed += unitFailedTests;
  summary.skipped += unitSkippedTests;
  summary.duration += unitDuration;
  summary.suites.push(unitSuite);
}

// Process integration test results
if (testResults.integration) {
  const integrationSuite = {
    name: 'Integration Tests',
    tests: []
  };
  
  let integrationTotalTests = 0;
  let integrationPassedTests = 0;
  let integrationFailedTests = 0;
  let integrationSkippedTests = 0;
  let integrationDuration = 0;
  
  // Process test results
  if (testResults.integration.testResults) {
    testResults.integration.testResults.forEach(testResult => {
      testResult.assertionResults.forEach(assertion => {
        integrationTotalTests++;
        
        if (assertion.status === 'passed') {
          integrationPassedTests++;
        } else if (assertion.status === 'failed') {
          integrationFailedTests++;
        } else if (assertion.status === 'skipped') {
          integrationSkippedTests++;
        }
        
        integrationSuite.tests.push({
          name: assertion.fullName || assertion.title,
          status: assertion.status,
          duration: assertion.duration || 0,
          error: assertion.failureMessages ? assertion.failureMessages.join('\n') : null
        });
      });
      
      integrationDuration += testResult.endTime - testResult.startTime;
    });
  }
  
  summary.totalTests += integrationTotalTests;
  summary.passed += integrationPassedTests;
  summary.failed += integrationFailedTests;
  summary.skipped += integrationSkippedTests;
  summary.duration += integrationDuration;
  summary.suites.push(integrationSuite);
}

// Process E2E test results
if (testResults.e2e) {
  const e2eSuite = {
    name: 'E2E Tests',
    tests: []
  };
  
  summary.totalTests += testResults.e2e.tests || 0;
  summary.passed += (testResults.e2e.tests || 0) - (testResults.e2e.failures || 0) - (testResults.e2e.skipped || 0);
  summary.failed += testResults.e2e.failures || 0;
  summary.skipped += testResults.e2e.skipped || 0;
  summary.duration += testResults.e2e.time * 1000 || 0;
  
  // Add placeholder tests since we don't have detailed information
  e2eSuite.tests.push({
    name: 'E2E Tests Summary',
    status: testResults.e2e.failures > 0 ? 'failed' : 'passed',
    duration: testResults.e2e.time * 1000 || 0,
    error: testResults.e2e.failures > 0 ? `${testResults.e2e.failures} tests failed` : null
  });
  
  summary.suites.push(e2eSuite);
}

// Process A11y test results
if (testResults.a11y) {
  const a11ySuite = {
    name: 'Accessibility Tests',
    tests: []
  };
  
  summary.totalTests += testResults.a11y.tests || 0;
  summary.passed += (testResults.a11y.tests || 0) - (testResults.a11y.failures || 0) - (testResults.a11y.skipped || 0);
  summary.failed += testResults.a11y.failures || 0;
  summary.skipped += testResults.a11y.skipped || 0;
  summary.duration += testResults.a11y.time * 1000 || 0;
  
  // Add placeholder tests since we don't have detailed information
  a11ySuite.tests.push({
    name: 'Accessibility Tests Summary',
    status: testResults.a11y.failures > 0 ? 'failed' : 'passed',
    duration: testResults.a11y.time * 1000 || 0,
    error: testResults.a11y.failures > 0 ? `${testResults.a11y.failures} tests failed` : null
  });
  
  summary.suites.push(a11ySuite);
}

// Process Visual test results
if (testResults.visual) {
  const visualSuite = {
    name: 'Visual Regression Tests',
    tests: []
  };
  
  summary.totalTests += testResults.visual.tests || 0;
  summary.passed += (testResults.visual.tests || 0) - (testResults.visual.failures || 0) - (testResults.visual.skipped || 0);
  summary.failed += testResults.visual.failures || 0;
  summary.skipped += testResults.visual.skipped || 0;
  summary.duration += testResults.visual.time * 1000 || 0;
  
  // Add placeholder tests since we don't have detailed information
  visualSuite.tests.push({
    name: 'Visual Regression Tests Summary',
    status: testResults.visual.failures > 0 ? 'failed' : 'passed',
    duration: testResults.visual.time * 1000 || 0,
    error: testResults.visual.failures > 0 ? `${testResults.visual.failures} tests failed` : null
  });
  
  summary.suites.push(visualSuite);
}

// Write summary to file
fs.writeFileSync(path.join(reportsDir, 'summary.json'), JSON.stringify(summary, null, 2));

// Generate HTML report
const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #0066cc;
    }
    .summary {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .summary-item {
      display: inline-block;
      margin-right: 20px;
      font-size: 18px;
    }
    .passed {
      color: #4caf50;
    }
    .failed {
      color: #f44336;
    }
    .skipped {
      color: #ff9800;
    }
    .suite {
      margin-bottom: 30px;
      border: 1px solid #ddd;
      border-radius: 5px;
      overflow: hidden;
    }
    .suite-header {
      background-color: #0066cc;
      color: white;
      padding: 10px 20px;
    }
    .suite-content {
      padding: 0 20px;
    }
    .test {
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .test:last-child {
      border-bottom: none;
    }
    .test-name {
      font-weight: bold;
    }
    .test-status {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 12px;
      margin-left: 10px;
    }
    .test-status.passed {
      background-color: #e8f5e9;
    }
    .test-status.failed {
      background-color: #ffebee;
    }
    .test-status.skipped {
      background-color: #fff3e0;
    }
    .test-duration {
      color: #666;
      font-size: 12px;
      margin-left: 10px;
    }
    .test-error {
      background-color: #ffebee;
      padding: 10px;
      margin-top: 10px;
      border-radius: 3px;
      font-family: monospace;
      white-space: pre-wrap;
    }
    .progress-bar {
      height: 20px;
      background-color: #e0e0e0;
      border-radius: 10px;
      margin: 10px 0;
      overflow: hidden;
    }
    .progress-bar-inner {
      height: 100%;
      float: left;
    }
    .progress-bar-passed {
      background-color: #4caf50;
    }
    .progress-bar-failed {
      background-color: #f44336;
    }
    .progress-bar-skipped {
      background-color: #ff9800;
    }
  </style>
</head>
<body>
  <h1>Test Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <div class="summary-item">Total Tests: <strong>${summary.totalTests}</strong></div>
    <div class="summary-item passed">Passed: <strong>${summary.passed}</strong></div>
    <div class="summary-item failed">Failed: <strong>${summary.failed}</strong></div>
    <div class="summary-item skipped">Skipped: <strong>${summary.skipped}</strong></div>
    <div class="summary-item">Duration: <strong>${(summary.duration / 1000).toFixed(2)}s</strong></div>
    
    <div class="progress-bar">
      <div class="progress-bar-inner progress-bar-passed" style="width: ${summary.totalTests > 0 ? (summary.passed / summary.totalTests * 100) : 0}%"></div>
      <div class="progress-bar-inner progress-bar-failed" style="width: ${summary.totalTests > 0 ? (summary.failed / summary.totalTests * 100) : 0}%"></div>
      <div class="progress-bar-inner progress-bar-skipped" style="width: ${summary.totalTests > 0 ? (summary.skipped / summary.totalTests * 100) : 0}%"></div>
    </div>
  </div>
  
  ${summary.suites.map(suite => `
    <div class="suite">
      <div class="suite-header">
        <h3>${suite.name}</h3>
      </div>
      <div class="suite-content">
        ${suite.tests.map(test => `
          <div class="test">
            <div class="test-name">
              ${test.name}
              <span class="test-status ${test.status}">${test.status}</span>
              <span class="test-duration">${(test.duration / 1000).toFixed(2)}s</span>
            </div>
            ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('')}
</body>
</html>
`;

fs.writeFileSync(path.join(reportsDir, 'index.html'), htmlReport);

console.log('Test report generated successfully!');
console.log(`Summary: ${summary.passed}/${summary.totalTests} tests passed (${summary.failed} failed, ${summary.skipped} skipped)`);
console.log(`Duration: ${(summary.duration / 1000).toFixed(2)}s`);
console.log(`Report saved to: ${path.join(reportsDir, 'index.html')}`);

// Exit with appropriate code
process.exit(summary.failed > 0 ? 1 : 0);
