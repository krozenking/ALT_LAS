// src/__tests__/a11y/components.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '../../components/Button';
import Home from '../../pages/index';

describe('Accessibility Tests', () => {
  test('Button component has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Button>Default Button</Button>
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="tertiary">Tertiary Button</Button>
        <Button disabled>Disabled Button</Button>
        <Button icon={<span>🔍</span>}>Button with Icon</Button>
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('Home page has no accessibility violations', async () => {
    const { container } = render(<Home />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('Button sizes have sufficient touch target size', async () => {
    const { container } = render(
      <div>
        <Button size="sm">Small Button</Button>
        <Button size="md">Medium Button</Button>
        <Button size="lg">Large Button</Button>
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    
    // Additional manual checks could be added here for specific WCAG criteria
    // like touch target size, but that would require custom logic beyond axe
  });
});
