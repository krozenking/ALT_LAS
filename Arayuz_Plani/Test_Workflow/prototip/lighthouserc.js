// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      // Collect Lighthouse performance data from the local development server
      startServerCommand: 'npm run start',
      url: [
        'http://localhost:3000',
        'http://localhost:3000/login',
        'http://localhost:3000/form'
      ],
      numberOfRuns: 3,
      // Test both desktop and mobile
      settings: [
        {
          preset: 'desktop',
          onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
          skipAudits: [
            'uses-http2',
            'uses-long-cache-ttl',
            'canonical',
            'maskable-icon'
          ],
        },
        {
          preset: 'mobile',
          screenEmulation: {
            mobile: true,
            width: 375,
            height: 667,
            deviceScaleFactor: 2,
            disabled: false,
          },
          throttling: {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
          },
          onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
          skipAudits: [
            'uses-http2',
            'uses-long-cache-ttl',
            'canonical',
            'maskable-icon'
          ],
        },
      ],
    },
    upload: {
      // Upload the results to temporary public storage
      target: 'temporary-public-storage',
    },
    assert: {
      // Assert that the lighthouse scores meet the following thresholds
      assertions: {
        // Performance metrics
        'categories:performance': ['error', { minScore: 0.8 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],

        // Category scores
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // Accessibility specific assertions
        'aria-allowed-attr': ['error', { maxNumericValue: 0 }],
        'aria-required-attr': ['error', { maxNumericValue: 0 }],
        'aria-required-children': ['error', { maxNumericValue: 0 }],
        'aria-required-parent': ['error', { maxNumericValue: 0 }],
        'aria-roles': ['error', { maxNumericValue: 0 }],
        'aria-valid-attr-value': ['error', { maxNumericValue: 0 }],
        'aria-valid-attr': ['error', { maxNumericValue: 0 }],
        'button-name': ['error', { maxNumericValue: 0 }],
        'color-contrast': ['error', { maxNumericValue: 0 }],
        'document-title': ['error', { maxNumericValue: 0 }],
        'html-has-lang': ['error', { maxNumericValue: 0 }],
        'image-alt': ['error', { maxNumericValue: 0 }],
        'link-name': ['error', { maxNumericValue: 0 }],
        'list': ['error', { maxNumericValue: 0 }],
        'meta-viewport': ['error', { maxNumericValue: 0 }],
      },
    },
  },
};
