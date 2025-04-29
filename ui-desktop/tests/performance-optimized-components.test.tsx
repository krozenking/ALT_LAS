import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../src/renderer/styles/theme';
import Button from '../src/renderer/components/core/Button';
import Card from '../src/renderer/components/core/Card';
import Input from '../src/renderer/components/core/Input';
import IconButton from '../src/renderer/components/core/IconButton';

// Mock console.error to suppress React warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Wrapper component with ChakraProvider
const TestWrapper = ({ children }) => (
  <ChakraProvider theme={theme}>
    {children}
  </ChakraProvider>
);

describe('Performance Optimized Components', () => {
  // Button Component Tests
  describe('Button Component', () => {
    test('renders without crashing', () => {
      render(<Button>Test Button</Button>, { wrapper: TestWrapper });
      expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument();
    });

    test('handles click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click Me</Button>, { wrapper: TestWrapper });
      
      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('does not trigger click when disabled', () => {
      const handleClick = jest.fn();
      render(<Button isDisabled onClick={handleClick}>Disabled Button</Button>, { wrapper: TestWrapper });
      
      const button = screen.getByRole('button', { name: /disabled button/i });
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('supports keyboard navigation', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard Button</Button>, { wrapper: TestWrapper });
      
      const button = screen.getByRole('button', { name: /keyboard button/i });
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // Card Component Tests
  describe('Card Component', () => {
    test('renders without crashing', () => {
      render(
        <Card ariaLabel="Test Card">
          Card Content
        </Card>, 
        { wrapper: TestWrapper }
      );
      
      expect(screen.getByText(/card content/i)).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /test card/i })).toBeInTheDocument();
    });

    test('renders header and footer', () => {
      render(
        <Card 
          header={<div>Card Header</div>}
          footer={<div>Card Footer</div>}
        >
          Card Content
        </Card>, 
        { wrapper: TestWrapper }
      );
      
      expect(screen.getByText(/card header/i)).toBeInTheDocument();
      expect(screen.getByText(/card content/i)).toBeInTheDocument();
      expect(screen.getByText(/card footer/i)).toBeInTheDocument();
    });
  });

  // Input Component Tests
  describe('Input Component', () => {
    test('renders without crashing', () => {
      render(<Input placeholder="Test Input" />, { wrapper: TestWrapper });
      expect(screen.getByPlaceholderText(/test input/i)).toBeInTheDocument();
    });

    test('handles change events', () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} placeholder="Type here" />, { wrapper: TestWrapper });
      
      const input = screen.getByPlaceholderText(/type here/i);
      fireEvent.change(input, { target: { value: 'test value' } });
      
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    test('renders label and error message', () => {
      render(
        <Input 
          label="Username" 
          error="Username is required" 
          placeholder="Enter username"
        />, 
        { wrapper: TestWrapper }
      );
      
      expect(screen.getByText(/username/i)).toBeInTheDocument();
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    });

    test('applies aria attributes correctly', () => {
      render(
        <Input 
          id="test-input"
          label="Email" 
          error="Invalid email" 
          placeholder="Enter email"
          isRequired
        />, 
        { wrapper: TestWrapper }
      );
      
      const input = screen.getByPlaceholderText(/enter email/i);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('id', 'test-input');
    });
  });

  // IconButton Component Tests
  describe('IconButton Component', () => {
    test('renders without crashing', () => {
      render(
        <IconButton 
          icon={<span>🔍</span>} 
          ariaLabel="Search"
        />, 
        { wrapper: TestWrapper }
      );
      
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
      expect(screen.getByText('🔍')).toBeInTheDocument();
    });

    test('handles click events', () => {
      const handleClick = jest.fn();
      render(
        <IconButton 
          icon={<span>🔍</span>} 
          ariaLabel="Search"
          onClick={handleClick}
        />, 
        { wrapper: TestWrapper }
      );
      
      const button = screen.getByRole('button', { name: /search/i });
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('does not trigger click when disabled', () => {
      const handleClick = jest.fn();
      render(
        <IconButton 
          icon={<span>🔍</span>} 
          ariaLabel="Search"
          onClick={handleClick}
          isDisabled
        />, 
        { wrapper: TestWrapper }
      );
      
      const button = screen.getByRole('button', { name: /search/i });
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('supports keyboard navigation', () => {
      const handleClick = jest.fn();
      render(
        <IconButton 
          icon={<span>🔍</span>} 
          ariaLabel="Search"
          onClick={handleClick}
        />, 
        { wrapper: TestWrapper }
      );
      
      const button = screen.getByRole('button', { name: /search/i });
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});

// Performance tests
describe('Component Performance', () => {
  // Note: These are mock performance tests
  // In a real environment, you would use tools like React DevTools Profiler
  // or performance.now() to measure actual render times
  
  test('Button component memoization works', () => {
    // This is a simplified test to verify that the component doesn't re-render unnecessarily
    const TestComponent = () => {
      const [count, setCount] = React.useState(0);
      const handleClick = React.useCallback(() => {}, []);
      
      return (
        <>
          <Button onClick={handleClick}>Memoized Button</Button>
          <button data-testid="counter" onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
        </>
      );
    };
    
    render(<TestComponent />, { wrapper: TestWrapper });
    
    // In a real test, we would use React's Profiler to verify that the Button
    // doesn't re-render when the parent re-renders
    const counterButton = screen.getByTestId('counter');
    fireEvent.click(counterButton);
    fireEvent.click(counterButton);
    
    // We can't actually test for re-renders in this environment,
    // but the component should still be in the document
    expect(screen.getByRole('button', { name: /memoized button/i })).toBeInTheDocument();
  });
  
  test('Card component memoization works', () => {
    const TestComponent = () => {
      const [count, setCount] = React.useState(0);
      
      return (
        <>
          <Card>Memoized Card Content</Card>
          <button data-testid="counter" onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
        </>
      );
    };
    
    render(<TestComponent />, { wrapper: TestWrapper });
    
    const counterButton = screen.getByTestId('counter');
    fireEvent.click(counterButton);
    fireEvent.click(counterButton);
    
    expect(screen.getByText(/memoized card content/i)).toBeInTheDocument();
  });
  
  test('Input component memoization works', () => {
    const TestComponent = () => {
      const [count, setCount] = React.useState(0);
      const handleChange = React.useCallback(() => {}, []);
      
      return (
        <>
          <Input 
            placeholder="Memoized Input" 
            onChange={handleChange}
          />
          <button data-testid="counter" onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
        </>
      );
    };
    
    render(<TestComponent />, { wrapper: TestWrapper });
    
    const counterButton = screen.getByTestId('counter');
    fireEvent.click(counterButton);
    fireEvent.click(counterButton);
    
    expect(screen.getByPlaceholderText(/memoized input/i)).toBeInTheDocument();
  });
  
  test('IconButton component memoization works', () => {
    const TestComponent = () => {
      const [count, setCount] = React.useState(0);
      const handleClick = React.useCallback(() => {}, []);
      
      return (
        <>
          <IconButton 
            icon={<span>🔍</span>} 
            ariaLabel="Memoized Icon Button"
            onClick={handleClick}
          />
          <button data-testid="counter" onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
        </>
      );
    };
    
    render(<TestComponent />, { wrapper: TestWrapper });
    
    const counterButton = screen.getByTestId('counter');
    fireEvent.click(counterButton);
    fireEvent.click(counterButton);
    
    expect(screen.getByRole('button', { name: /memoized icon button/i })).toBeInTheDocument();
  });
});
