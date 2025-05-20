// cypress/component/Button.cy.tsx
import React from 'react';
import { Button } from '../../src/components/Button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    cy.mount(<Button>Default Button</Button>);
    cy.get('button').should('have.text', 'Default Button');
    cy.percySnapshot('Button - Default');
  });
  
  it('renders primary variant correctly', () => {
    cy.mount(<Button variant="primary">Primary Button</Button>);
    cy.get('button').should('have.text', 'Primary Button');
    cy.get('button').should('have.class', 'bg-blue-600');
    cy.percySnapshot('Button - Primary');
  });
  
  it('renders secondary variant correctly', () => {
    cy.mount(<Button variant="secondary">Secondary Button</Button>);
    cy.get('button').should('have.text', 'Secondary Button');
    cy.get('button').should('have.class', 'bg-gray-200');
    cy.percySnapshot('Button - Secondary');
  });
  
  it('renders tertiary variant correctly', () => {
    cy.mount(<Button variant="tertiary">Tertiary Button</Button>);
    cy.get('button').should('have.text', 'Tertiary Button');
    cy.get('button').should('have.class', 'bg-transparent');
    cy.percySnapshot('Button - Tertiary');
  });
  
  it('renders different sizes correctly', () => {
    cy.mount(
      <div className="space-y-4">
        <Button size="sm">Small Button</Button>
        <Button size="md">Medium Button</Button>
        <Button size="lg">Large Button</Button>
      </div>
    );
    cy.get('button').eq(0).should('have.text', 'Small Button');
    cy.get('button').eq(1).should('have.text', 'Medium Button');
    cy.get('button').eq(2).should('have.text', 'Large Button');
    cy.percySnapshot('Button - Sizes');
  });
  
  it('renders disabled state correctly', () => {
    cy.mount(<Button disabled>Disabled Button</Button>);
    cy.get('button').should('be.disabled');
    cy.get('button').should('have.class', 'opacity-50');
    cy.percySnapshot('Button - Disabled');
  });
  
  it('renders with icon correctly', () => {
    cy.mount(
      <Button icon={<span className="text-xl">🔍</span>}>
        Button with Icon
      </Button>
    );
    cy.get('button').should('contain', 'Button with Icon');
    cy.get('button span').should('have.text', '🔍');
    cy.percySnapshot('Button - With Icon');
  });
  
  it('renders full width correctly', () => {
    cy.mount(<Button fullWidth>Full Width Button</Button>);
    cy.get('button').should('have.class', 'w-full');
    cy.percySnapshot('Button - Full Width');
  });
  
  it('handles click events correctly', () => {
    const onClick = cy.stub().as('onClick');
    cy.mount(<Button onClick={onClick}>Clickable Button</Button>);
    cy.get('button').click();
    cy.get('@onClick').should('have.been.calledOnce');
  });
  
  it('does not trigger click when disabled', () => {
    const onClick = cy.stub().as('onClick');
    cy.mount(<Button onClick={onClick} disabled>Disabled Button</Button>);
    cy.get('button').click({ force: true });
    cy.get('@onClick').should('not.have.been.called');
  });
  
  it('renders all variants together for comparison', () => {
    cy.mount(
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
        </div>
        <div className="flex space-x-4">
          <Button variant="primary" disabled>Primary Disabled</Button>
          <Button variant="secondary" disabled>Secondary Disabled</Button>
          <Button variant="tertiary" disabled>Tertiary Disabled</Button>
        </div>
      </div>
    );
    cy.percySnapshot('Button - All Variants');
  });
});
