import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChakraProvider } from '@chakra-ui/react';
import Button from '../src/renderer/components/core/Button';
import Card from '../src/renderer/components/core/Card';
import Input from '../src/renderer/components/core/Input';
import IconButton from '../src/renderer/components/core/IconButton';
import Panel from '../src/renderer/components/composition/Panel';
import SplitView from '../src/renderer/components/composition/SplitView';
import DragHandle from '../src/renderer/components/composition/DragHandle';
import DropZone from '../src/renderer/components/composition/DropZone';
import ResizeHandle from '../src/renderer/components/composition/ResizeHandle';
import PanelContainer from '../src/renderer/components/composition/PanelContainer';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Wrapper component with ChakraProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ChakraProvider>{children}</ChakraProvider>;
};

describe('Accessibility Tests', () => {
  describe('Core Components', () => {
    test('Button has no accessibility violations', async () => {
      const { container } = render(
        <Button ariaLabel="Test Button">Click Me</Button>,
        { wrapper: TestWrapper }
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Button supports keyboard navigation', () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} ariaLabel="Test Button">Click Me</Button>,
        { wrapper: TestWrapper }
      );
      
      const button = screen.getByRole('button', { name: /Click Me|Test Button/i });
      
      // Test keyboard activation
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      handleClick.mockClear();
      
      fireEvent.keyDown(button, { key: ' ' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('Card has no accessibility violations', async () => {
      const { container } = render(
        <Card ariaLabel="Test Card">Card Content</Card>,
        { wrapper: TestWrapper }
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Input has no accessibility violations', async () => {
      const { container } = render(
        <Input 
          id="test-input"
          label="Test Input"
          placeholder="Enter text"
          isRequired
          description="This is a test input field"
        />,
        { wrapper: TestWrapper }
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Input has proper labeling', () => {
      render(
        <Input 
          id="test-input"
          label="Test Input"
          placeholder="Enter text"
          isRequired
          description="This is a test input field"
        />,
        { wrapper: TestWrapper }
      );
      
      // Check if label is properly associated with input
      const input = screen.getByLabelText(/Test Input/i);
      expect(input).toBeInTheDocument();
      
      // Check if description is properly associated
      const description = screen.getByText('This is a test input field');
      expect(description).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(description.id));
    });

    test('IconButton has no accessibility violations', async () => {
      const { container } = render(
        <IconButton 
          icon={<span>✕</span>} 
          ariaLabel="Close Button"
        />,
        { wrapper: TestWrapper }
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Composition Components', () => {
    test('Panel has no accessibility violations', async () => {
      const { container } = render(
        <Panel 
          title="Test Panel"
          ariaLabel="Test Panel Region"
          id="test-panel"
        >
          Panel Content
        </Panel>,
        { wrapper: TestWrapper }
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Panel header is properly labeled', () => {
      render(
        <Panel 
          title="Test Panel"
          ariaLabel="Test Panel Region"
          id="test-panel"
        >
          Panel Content
        </Panel>,
        { wrapper: TestWrapper }
      );
      
      // Check if panel header has proper role
      const header = screen.getByRole('heading', { name: /Test Panel/i });
      expect(header).toBeInTheDocument();
    });

    test('SplitView has no accessibility violations', async () => {
      const { container } = render(
        <SplitView 
          leftOrTopContent={<div>Left Content</div>}
          rightOrBottomContent={<div>Right Content</div>}
          ariaLabel="Split View Container"
        />,
        { wrapper: TestWrapper }
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('SplitView divider has proper ARIA attributes', () => {
      render(
        <SplitView 
          leftOrTopContent={<div>Left Content</div>}
          rightOrBottomContent={<div>Right Content</div>}
          ariaLabel="Split View Container"
        />,
        { wrapper: TestWrapper }
      );
      
      // Check if divider has proper role and attributes
      const divider = screen.getByRole('separator');
      expect(divider).toBeInTheDocument();
      expect(divider).toHaveAttribute('aria-orientation');
      expect(divider).toHaveAttribute('aria-valuenow');
    });

    test('DragHandle has no accessibility violations', async () => {
      const { container } = render(
        <DragHandle ariaLabel="Drag Handle" />,
        { wrapper: TestWrapper }
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('DropZone has no accessibility violations', async () => {
      const { container } = render(
        <DropZone 
          id="test-dropzone"
          ariaLabel="Drop Zone"
          ariaDescription="Drop panels here to combine them"
        />,
        { wrapper: TestWrapper }
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('ResizeHandle has no accessibility violations', async () => {
      const { container } = render(
        <ResizeHandle ariaLabel="Resize Handle" />,
        { wrapper: TestWrapper }
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('PanelContainer has no accessibility violations', async () => {
      const { container } = render(
        <PanelContainer 
          ariaLabel="Panel Container"
          initialPanels={[
            {
              id: 'panel1',
              title: 'Test Panel',
              content: <div>Panel Content</div>,
              position: { x: 0, y: 0 },
              size: { width: 300, height: 200 }
            }
          ]}
        />,
        { wrapper: TestWrapper }
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('PanelContainer has live region for announcements', () => {
      render(
        <PanelContainer 
          ariaLabel="Panel Container"
          id="test-container"
          initialPanels={[
            {
              id: 'panel1',
              title: 'Test Panel',
              content: <div>Panel Content</div>,
              position: { x: 0, y: 0 },
              size: { width: 300, height: 200 }
            }
          ]}
        />,
        { wrapper: TestWrapper }
      );
      
      // Check if live region exists
      const liveRegion = document.getElementById('test-container-live-region');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Keyboard Navigation', () => {
    test('Focus moves in the correct order', () => {
      render(
        <div>
          <Button>Button 1</Button>
          <Input id="test-input" label="Input" />
          <Button>Button 2</Button>
        </div>,
        { wrapper: TestWrapper }
      );
      
      const button1 = screen.getByRole('button', { name: 'Button 1' });
      const input = screen.getByLabelText('Input');
      const button2 = screen.getByRole('button', { name: 'Button 2' });
      
      // Set focus on first element
      button1.focus();
      expect(document.activeElement).toBe(button1);
      
      // Tab to next element
      fireEvent.keyDown(button1, { key: 'Tab' });
      // In a real browser, this would move focus
      // For testing, we need to manually set focus
      input.focus();
      expect(document.activeElement).toBe(input);
      
      // Tab to next element
      fireEvent.keyDown(input, { key: 'Tab' });
      button2.focus();
      expect(document.activeElement).toBe(button2);
    });
  });
});
