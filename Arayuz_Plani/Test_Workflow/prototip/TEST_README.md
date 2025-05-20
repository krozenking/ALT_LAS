# ALT_LAS UI Test Automation Infrastructure

This document provides an overview of the test automation infrastructure for the ALT_LAS UI.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test types
npm run test:a11y        # Run accessibility tests
npm run test:store       # Run store tests
npm run test:integration # Run integration tests
npm run test:performance # Run performance tests

# Run tests in watch mode
npm run test:watch
```

## Test Infrastructure

The test infrastructure consists of the following components:

1. **Jest**: JavaScript testing framework
2. **React Testing Library**: Testing utilities for React components
3. **jest-axe**: Accessibility testing for Jest
4. **Lighthouse CI**: Performance and accessibility testing
5. **GitHub Actions**: CI/CD platform for automated testing

## Directory Structure

```
/
├── .github/
│   └── workflows/
│       └── ci.yml         # CI/CD workflow
├── src/
│   ├── components/
│   │   ├── __tests__/     # Component tests
│   ├── pages/
│   │   ├── __tests__/     # Page tests
│   ├── store/
│   │   ├── __tests__/     # Store tests
│   ├── utils/
│   │   ├── __tests__/     # Utility tests
│   └── __tests__/
│       ├── integration/   # Integration tests
│       └── a11y/          # Accessibility tests
├── jest.config.js         # Jest configuration
├── jest.setup.js          # Jest setup
├── lighthouserc.js        # Lighthouse CI configuration
├── TEST_DOCUMENTATION.md  # Detailed test documentation
├── TEST_STRATEGY.md       # Test strategy
└── TEST_PLAN.md           # Test plan
```

## Test Types

### Unit Tests

Unit tests test individual components and functions in isolation. They are located in `__tests__` directories next to the code they test.

Example:

```tsx
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

test('renders correctly with default props', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### Integration Tests

Integration tests test the interaction between multiple components. They are located in `src/__tests__/integration`.

Example:

```tsx
// theme-switching.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../../pages/index';

test('changes the page background when theme is switched', () => {
  render(<Home />);
  fireEvent.click(screen.getByText('Koyu Tema'));
  expect(screen.getByRole('main').parentElement).toHaveClass('bg-gray-900');
});
```

### Accessibility Tests

Accessibility tests test WCAG compliance using jest-axe. They are located in `src/__tests__/a11y`.

Example:

```tsx
// components.test.tsx
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '../../components/Button';

test('Button component has no accessibility violations', async () => {
  const { container } = render(<Button>Accessible Button</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Performance Tests

Performance tests test performance metrics using Lighthouse CI. They are configured in `lighthouserc.js`.

## CI/CD Integration

Tests are automatically run as part of the CI/CD pipeline defined in `.github/workflows/ci.yml`. The pipeline includes:

1. Linting
2. Unit and integration tests
3. Accessibility tests
4. Building the application
5. Performance tests
6. Deployment to preview/production environments

## Test Utilities

### Test Renderer

A custom test renderer is provided in `src/utils/test-utils.tsx`. It wraps the standard React Testing Library renderer with any providers that components need during testing.

Example:

```tsx
import { render, screen } from '../utils/test-utils';
import { MyComponent } from '../MyComponent';

test('renders correctly', () => {
  render(<MyComponent />);
  // ...
});
```

## Test Configuration

### Jest Configuration

Jest is configured in `jest.config.js`. The configuration includes:

- Test environment: jsdom
- Coverage collection and thresholds
- Module name mapping for aliases
- Setup files

### Lighthouse CI Configuration

Lighthouse CI is configured in `lighthouserc.js`. The configuration includes:

- Performance thresholds
- Accessibility thresholds
- Best practices thresholds
- SEO thresholds

## Adding New Tests

### Adding a Component Test

1. Create a `__tests__` directory next to the component if it doesn't exist
2. Create a test file with the same name as the component, but with `.test.tsx` extension
3. Import the component and test utilities
4. Write tests for the component

### Adding an Integration Test

1. Create a test file in `src/__tests__/integration`
2. Import the components and test utilities
3. Write tests for the component interactions

### Adding an Accessibility Test

1. Create a test file in `src/__tests__/a11y`
2. Import the components and jest-axe
3. Write tests for accessibility compliance

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on testing what the component does, not how it does it.
2. **Keep Tests Simple**: Each test should test one thing.
3. **Use Descriptive Test Names**: Test names should describe what is being tested.
4. **Mock External Dependencies**: Use jest.mock() to mock external dependencies.
5. **Test Edge Cases**: Test boundary conditions and error cases.
6. **Maintain Test Independence**: Tests should not depend on each other.
7. **Use Testing Library Best Practices**: Prefer user-centric queries (getByRole, getByLabelText) over implementation-specific queries (getByTestId).
8. **Test Accessibility**: Use jest-axe to test for accessibility violations.

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet/)
