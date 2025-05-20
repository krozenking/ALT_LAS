# ALT_LAS UI Test Documentation

This document provides comprehensive documentation for the ALT_LAS UI test suite.

## Test Structure

The test suite is organized into the following categories:

1. **Unit Tests**: Tests for individual components and functions
2. **Integration Tests**: Tests for interactions between components
3. **Accessibility Tests**: Tests for WCAG compliance
4. **Performance Tests**: Tests for performance metrics
5. **End-to-End Tests**: Tests for complete user flows
6. **Visual Regression Tests**: Tests for visual changes

## Test Files Organization

```
src/
├── components/
│   ├── __tests__/           # Component unit tests
│   │   ├── Button.test.tsx
│   │   ├── TextField.test.tsx
│   │   ├── Dropdown.test.tsx
│   │   ├── Checkbox.test.tsx
│   │   ├── LoginForm.test.tsx
│   │   └── Form.test.tsx
├── pages/
│   ├── __tests__/           # Page component tests
│   │   └── index.test.tsx
├── store/
│   ├── __tests__/           # Store tests
│   │   └── useThemeStore.test.ts
├── services/
│   ├── __tests__/           # Service tests
│   │   └── auth.test.ts
├── utils/
│   ├── __tests__/           # Utility function tests
├── __tests__/
│   ├── integration/         # Integration tests
│   │   ├── theme-switching.test.tsx
│   │   ├── login-flow.test.tsx
│   │   └── form-submission.test.tsx
│   ├── a11y/                # Accessibility tests
│   │   ├── components.test.tsx
│   │   ├── login-form.test.tsx
│   │   └── form-components.test.tsx
├── mocks/                   # Mock service worker
│   ├── handlers.ts
│   ├── server.ts
│   └── browser.ts
cypress/
├── e2e/                     # End-to-end tests
│   ├── form.cy.ts
│   └── visual-regression.cy.ts
├── component/               # Component tests
│   └── Form.cy.tsx
└── support/                 # Cypress support files
    ├── commands.ts
    ├── e2e.ts
    └── component.ts
```

## Running Tests

### All Tests

```bash
npm test
```

### Unit Tests

```bash
npm test -- --testPathIgnorePatterns=integration a11y
```

### Integration Tests

```bash
npm run test:integration
```

### Accessibility Tests

```bash
npm run test:a11y
```

### Store Tests

```bash
npm run test:store
```

### Performance Tests

```bash
npm run test:performance
```

### End-to-End Tests

```bash
npm run test:e2e
```

### Visual Regression Tests

```bash
npm run test:visual
```

### Coverage Report

```bash
npm run test:coverage
```

### Cypress Tests

```bash
# Open Cypress Test Runner
npm run cypress

# Run Cypress Tests in Headless Mode
npm run cypress:run

# Open Cypress Component Test Runner
npm run cypress:component

# Run Cypress Component Tests in Headless Mode
npm run cypress:run:component
```

## Writing Tests

### Unit Tests

Unit tests should test a single component or function in isolation. Dependencies should be mocked.

Example:

```tsx
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

test('renders correctly with default props', () => {
  render(<Button>Click me</Button>);
  const button = screen.getByRole('button', { name: /click me/i });
  expect(button).toBeInTheDocument();
});
```

### Integration Tests

Integration tests should test the interaction between multiple components.

Example:

```tsx
// theme-switching.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../../pages/index';

test('changes the page background when theme is switched', () => {
  render(<Home />);

  // Click dark theme button
  fireEvent.click(screen.getByText('Koyu Tema'));

  // Check if the background class has changed to dark
  expect(screen.getByRole('main').parentElement).toHaveClass('bg-gray-900');
});
```

### Accessibility Tests

Accessibility tests should test WCAG compliance using jest-axe.

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

### End-to-End Tests

End-to-end tests should test complete user flows using Cypress.

Example:

```tsx
// form.cy.ts
describe('Form Component', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should submit the form successfully with valid data', () => {
    // Fill out the form
    cy.get('input[id^="textfield-isim"]').type('Test User');
    cy.get('input[id^="textfield-e-posta"]').type('test@example.com');

    // Open dropdown and select a country
    cy.get('button[id^="dropdown-ülke"]').click();
    cy.contains('Türkiye').click();

    // Check terms
    cy.get('input[id^="checkbox-kullanım"]').click();

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Check if success message is displayed
    cy.contains('Kayıt Başarılı!').should('be.visible');
  });
});
```

### Visual Regression Tests

Visual regression tests should test for visual changes using Percy.

Example:

```tsx
// visual-regression.cy.ts
describe('Visual Regression Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should match homepage snapshot', () => {
    cy.percySnapshot('Homepage');
  });
});
```

## Test Coverage

We aim for at least 70% test coverage for all code. Coverage reports are generated automatically when running tests and can be viewed in the `coverage` directory.

## CI/CD Integration

Tests are automatically run as part of the CI/CD pipeline. The pipeline includes:

1. Linting
2. Unit and integration tests
3. Accessibility tests
4. Building the application
5. Performance tests
6. End-to-end tests
7. Visual regression tests
8. Deployment to preview/production environments

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on testing what the component does, not how it does it.
2. **Keep Tests Simple**: Each test should test one thing.
3. **Use Descriptive Test Names**: Test names should describe what is being tested.
4. **Mock External Dependencies**: Use jest.mock() to mock external dependencies.
5. **Test Edge Cases**: Test boundary conditions and error cases.
6. **Maintain Test Independence**: Tests should not depend on each other.
7. **Use Testing Library Best Practices**: Prefer user-centric queries (getByRole, getByLabelText) over implementation-specific queries (getByTestId).
8. **Test Accessibility**: Use jest-axe to test for accessibility violations.

## Troubleshooting

### Common Issues

1. **Tests Failing in CI but Passing Locally**: This is often due to environment differences. Check for environment-specific code.
2. **Snapshot Tests Failing**: Snapshots need to be updated when components change. Run `npm test -- -u` to update snapshots.
3. **Timeouts in Tests**: Increase the timeout for the test or optimize the code being tested.
4. **Memory Leaks**: Check for unsubscribed event listeners or unclosed connections.

### Debugging Tests

1. Use `console.log()` to debug tests.
2. Use the `--verbose` flag to see more detailed output: `npm test -- --verbose`.
3. Use the `--watch` flag to run tests in watch mode: `npm test -- --watch`.
4. Use the `debug()` function from Testing Library to see the rendered HTML: `screen.debug()`.

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Cypress Documentation](https://docs.cypress.io/)
- [Percy Documentation](https://docs.percy.io/)
- [MSW Documentation](https://mswjs.io/docs/)
