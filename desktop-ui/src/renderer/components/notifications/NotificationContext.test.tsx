import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '../../test-utils';
import { NotificationProvider, useNotification } from './NotificationContext';

// Test component that uses the notification context
const TestComponent = () => {
  const { info, success, warning, error, state } = useNotification();
  
  return (
    <div>
      <button onClick={() => info('Info Title', 'Info message')}>Show Info</button>
      <button onClick={() => success('Success Title', 'Success message')}>Show Success</button>
      <button onClick={() => warning('Warning Title', 'Warning message')}>Show Warning</button>
      <button onClick={() => error('Error Title', 'Error message')}>Show Error</button>
      <div data-testid="notification-count">{state.notifications.length}</div>
    </div>
  );
};

describe('NotificationContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Clear all timers
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('provides notification context to children', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    expect(screen.getByText('Show Info')).toBeInTheDocument();
    expect(screen.getByText('Show Success')).toBeInTheDocument();
    expect(screen.getByText('Show Warning')).toBeInTheDocument();
    expect(screen.getByText('Show Error')).toBeInTheDocument();
    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
  });
  
  test('adds info notification when info method is called', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    fireEvent.click(screen.getByText('Show Info'));
    
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    expect(screen.getByText('Info Title')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });
  
  test('adds success notification when success method is called', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    fireEvent.click(screen.getByText('Show Success'));
    
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    expect(screen.getByText('Success Title')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });
  
  test('adds warning notification when warning method is called', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    fireEvent.click(screen.getByText('Show Warning'));
    
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    expect(screen.getByText('Warning Title')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });
  
  test('adds error notification when error method is called', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    fireEvent.click(screen.getByText('Show Error'));
    
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    expect(screen.getByText('Error Title')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
  
  test('removes notification after duration', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    fireEvent.click(screen.getByText('Show Info'));
    
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Wait for the notification to be removed
    await waitFor(() => {
      expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
    });
  });
  
  test('keeps persistent notification after duration', async () => {
    // Create a component that shows a persistent notification
    const PersistentNotificationComponent = () => {
      const { notify, state } = useNotification();
      
      return (
        <div>
          <button onClick={() => notify('Persistent', 'This is persistent', { persistent: true })}>
            Show Persistent
          </button>
          <div data-testid="notification-count">{state.notifications.length}</div>
        </div>
      );
    };
    
    render(
      <NotificationProvider>
        <PersistentNotificationComponent />
      </NotificationProvider>
    );
    
    fireEvent.click(screen.getByText('Show Persistent'));
    
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    // The notification should still be there
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
  });
  
  test('executes action when notification action is clicked', async () => {
    // Create a component that shows a notification with an action
    const actionMock = jest.fn();
    
    const ActionNotificationComponent = () => {
      const { notify } = useNotification();
      
      return (
        <button
          onClick={() =>
            notify('Action Notification', 'Click the action', {
              action: {
                label: 'Click Me',
                onClick: actionMock,
              },
            })
          }
        >
          Show Action Notification
        </button>
      );
    };
    
    render(
      <NotificationProvider>
        <ActionNotificationComponent />
      </NotificationProvider>
    );
    
    fireEvent.click(screen.getByText('Show Action Notification'));
    
    // Click the action button
    fireEvent.click(screen.getByText('Click Me'));
    
    expect(actionMock).toHaveBeenCalledTimes(1);
  });
});
