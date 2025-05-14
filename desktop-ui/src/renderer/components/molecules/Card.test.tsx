import React from 'react';
import { render, screen } from '../../test-utils';
import Card from './Card';

describe('Card Component', () => {
  test('renders card with title and content', () => {
    render(
      <Card title="Card Title">
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  test('renders card without title', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(
      <Card className="custom-class">
        <p>Card content</p>
      </Card>
    );
    
    const card = screen.getByText('Card content').closest('.card');
    expect(card).toHaveClass('custom-class');
  });

  test('renders card with footer', () => {
    render(
      <Card
        title="Card Title"
        footer={<button>Action</button>}
      >
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  test('renders card with custom header', () => {
    render(
      <Card
        header={<h3>Custom Header</h3>}
      >
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Custom Header')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  test('renders card with different variants', () => {
    const { rerender } = render(
      <Card variant="default">
        <p>Default card</p>
      </Card>
    );
    
    let card = screen.getByText('Default card').closest('.card');
    expect(card).toHaveClass('card-default');
    
    rerender(
      <Card variant="outlined">
        <p>Outlined card</p>
      </Card>
    );
    
    card = screen.getByText('Outlined card').closest('.card');
    expect(card).toHaveClass('card-outlined');
    
    rerender(
      <Card variant="elevated">
        <p>Elevated card</p>
      </Card>
    );
    
    card = screen.getByText('Elevated card').closest('.card');
    expect(card).toHaveClass('card-elevated');
  });

  test('renders card with different sizes', () => {
    const { rerender } = render(
      <Card size="sm">
        <p>Small card</p>
      </Card>
    );
    
    let card = screen.getByText('Small card').closest('.card');
    expect(card).toHaveClass('card-sm');
    
    rerender(
      <Card size="md">
        <p>Medium card</p>
      </Card>
    );
    
    card = screen.getByText('Medium card').closest('.card');
    expect(card).toHaveClass('card-md');
    
    rerender(
      <Card size="lg">
        <p>Large card</p>
      </Card>
    );
    
    card = screen.getByText('Large card').closest('.card');
    expect(card).toHaveClass('card-lg');
  });

  test('renders card with icon', () => {
    render(
      <Card title="Card with Icon" icon="card-icon">
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card with Icon')).toBeInTheDocument();
    const header = screen.getByText('Card with Icon').closest('.card-header');
    expect(header?.querySelector('.card-icon')).toBeTruthy();
  });

  test('renders card with actions', () => {
    render(
      <Card
        title="Card with Actions"
        actions={<button>More</button>}
      >
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card with Actions')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  test('renders card with loading state', () => {
    render(
      <Card title="Loading Card" isLoading>
        <p>Card content</p>
      </Card>
    );
    
    const card = screen.getByText('Loading Card').closest('.card');
    expect(card).toHaveClass('card-loading');
  });
});
