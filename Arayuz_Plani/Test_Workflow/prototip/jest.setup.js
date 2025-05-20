// jest.setup.js
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { server } from './src/mocks/server';

// Add custom jest matchers for accessibility testing
expect.extend(toHaveNoViolations);

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
