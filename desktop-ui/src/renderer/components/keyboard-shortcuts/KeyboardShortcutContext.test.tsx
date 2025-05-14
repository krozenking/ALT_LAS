import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '../../test-utils';
import { KeyboardShortcutProvider, useKeyboardShortcuts } from './KeyboardShortcutContext';

// Mock the KeyboardShortcutService class
jest.mock('./KeyboardShortcutService', () => {
  return jest.fn().mockImplementation(() => ({
    loadSchema: jest.fn().mockResolvedValue({
      version: '1.0.0',
      groups: [
        {
          id: 'general',
          label: 'General',
          order: 1,
        },
        {
          id: 'editing',
          label: 'Editing',
          order: 2,
        },
      ],
      scopes: [
        {
          id: 'global',
          label: 'Global',
          order: 1,
        },
        {
          id: 'editor',
          label: 'Editor',
          order: 2,
        },
      ],
      shortcuts: [
        {
          id: 'save',
          key: 's',
          modifiers: ['ctrl'],
          description: 'Save',
          group: 'general',
          action: jest.fn(),
          scope: 'global',
          isDefault: true,
        },
        {
          id: 'undo',
          key: 'z',
          modifiers: ['ctrl'],
          description: 'Undo',
          group: 'editing',
          action: jest.fn(),
          scope: 'editor',
          isDefault: true,
        },
      ],
    }),
    loadValues: jest.fn().mockResolvedValue({
      version: '1.0.0',
      shortcuts: {},
    }),
    saveValues: jest.fn().mockResolvedValue(undefined),
    getShortcut: jest.fn().mockImplementation((shortcutId, schema, values) => {
      const shortcut = schema.shortcuts.find(s => s.id === shortcutId);
      if (!shortcut) return undefined;
      
      const customShortcut = values.shortcuts[shortcutId];
      return {
        ...shortcut,
        key: customShortcut?.key || shortcut.key,
        modifiers: customShortcut?.modifiers || shortcut.modifiers,
        disabled: customShortcut?.disabled || shortcut.disabled,
        isCustom: !!customShortcut,
      };
    }),
    getActiveShortcuts: jest.fn().mockImplementation((schema, values, scope) => {
      return schema.shortcuts.filter(shortcut => {
        if (scope && shortcut.scope !== scope && shortcut.scope !== 'global') {
          return false;
        }
        
        const customShortcut = values.shortcuts[shortcut.id];
        if (customShortcut?.disabled || shortcut.disabled) {
          return false;
        }
        
        return true;
      }).map(shortcut => {
        const customShortcut = values.shortcuts[shortcut.id];
        return {
          ...shortcut,
          key: customShortcut?.key || shortcut.key,
          modifiers: customShortcut?.modifiers || shortcut.modifiers,
          isCustom: !!customShortcut,
        };
      });
    }),
    matchKeyboardEvent: jest.fn().mockImplementation((event, shortcut) => {
      const key = event.key.toLowerCase();
      if (key !== shortcut.key) return false;
      
      const eventModifiers = [];
      if (event.ctrlKey) eventModifiers.push('ctrl');
      if (event.altKey) eventModifiers.push('alt');
      if (event.shiftKey) eventModifiers.push('shift');
      if (event.metaKey) eventModifiers.push('meta');
      
      if (eventModifiers.length !== shortcut.modifiers.length) return false;
      
      return shortcut.modifiers.every(modifier => eventModifiers.includes(modifier));
    }),
    normalizeKey: jest.fn().mockImplementation(key => key.toLowerCase()),
    formatShortcut: jest.fn().mockImplementation(shortcut => {
      const { modifiers, key } = shortcut;
      return [...modifiers, key].join('+');
    }),
  }));
});

// Test component that uses the keyboard shortcuts context
const TestComponent = () => {
  const { state, getShortcut, setShortcut, startRecording, stopRecording } = useKeyboardShortcuts();
  
  const saveShortcut = getShortcut('save');
  const undoShortcut = getShortcut('undo');
  
  return (
    <div>
      <div data-testid="save-shortcut">
        {saveShortcut ? `${saveShortcut.key} (${saveShortcut.modifiers.join('+')})` : 'Not found'}
      </div>
      <div data-testid="undo-shortcut">
        {undoShortcut ? `${undoShortcut.key} (${undoShortcut.modifiers.join('+')})` : 'Not found'}
      </div>
      <button onClick={() => setShortcut('save', 'x', ['ctrl', 'shift'])}>Change Save Shortcut</button>
      <button onClick={() => startRecording('save')}>Start Recording</button>
      <button onClick={() => stopRecording()}>Stop Recording</button>
      <div data-testid="recording-state">
        {state.recordingShortcut ? `Recording: ${state.recordingShortcut}` : 'Not recording'}
      </div>
      <div data-testid="active-shortcuts-count">{state.activeShortcuts.length}</div>
      <div data-testid="loading-state">{state.loading ? 'Loading' : 'Loaded'}</div>
      <div data-testid="modified-state">{state.modified ? 'Modified' : 'Not Modified'}</div>
    </div>
  );
};

describe('KeyboardShortcutContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  test('provides keyboard shortcuts context to children', async () => {
    render(
      <KeyboardShortcutProvider>
        <TestComponent />
      </KeyboardShortcutProvider>
    );
    
    // Wait for shortcuts to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });
    
    // Check default shortcuts
    expect(screen.getByTestId('save-shortcut')).toHaveTextContent('s (ctrl)');
    expect(screen.getByTestId('undo-shortcut')).toHaveTextContent('z (ctrl)');
    expect(screen.getByTestId('recording-state')).toHaveTextContent('Not recording');
    expect(screen.getByTestId('modified-state')).toHaveTextContent('Not Modified');
  });
  
  test('updates shortcut when setShortcut is called', async () => {
    render(
      <KeyboardShortcutProvider>
        <TestComponent />
      </KeyboardShortcutProvider>
    );
    
    // Wait for shortcuts to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });
    
    // Change save shortcut
    fireEvent.click(screen.getByText('Change Save Shortcut'));
    
    // Check if shortcut is updated
    expect(screen.getByTestId('save-shortcut')).toHaveTextContent('x (ctrl+shift)');
    expect(screen.getByTestId('modified-state')).toHaveTextContent('Modified');
  });
  
  test('starts recording when startRecording is called', async () => {
    render(
      <KeyboardShortcutProvider>
        <TestComponent />
      </KeyboardShortcutProvider>
    );
    
    // Wait for shortcuts to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });
    
    // Start recording
    fireEvent.click(screen.getByText('Start Recording'));
    
    // Check if recording state is updated
    expect(screen.getByTestId('recording-state')).toHaveTextContent('Recording: save');
  });
  
  test('stops recording when stopRecording is called', async () => {
    render(
      <KeyboardShortcutProvider>
        <TestComponent />
      </KeyboardShortcutProvider>
    );
    
    // Wait for shortcuts to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });
    
    // Start recording
    fireEvent.click(screen.getByText('Start Recording'));
    
    // Check if recording state is updated
    expect(screen.getByTestId('recording-state')).toHaveTextContent('Recording: save');
    
    // Stop recording
    fireEvent.click(screen.getByText('Stop Recording'));
    
    // Check if recording state is updated
    expect(screen.getByTestId('recording-state')).toHaveTextContent('Not recording');
  });
  
  test('handles key down event when recording', async () => {
    render(
      <KeyboardShortcutProvider>
        <TestComponent />
      </KeyboardShortcutProvider>
    );
    
    // Wait for shortcuts to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });
    
    // Start recording
    fireEvent.click(screen.getByText('Start Recording'));
    
    // Simulate key down event
    fireEvent.keyDown(window, {
      key: 'a',
      code: 'KeyA',
      ctrlKey: true,
      altKey: false,
      shiftKey: true,
      metaKey: false,
    });
    
    // Check if shortcut is updated and recording is stopped
    expect(screen.getByTestId('save-shortcut')).toHaveTextContent('a (ctrl+shift)');
    expect(screen.getByTestId('recording-state')).toHaveTextContent('Not recording');
    expect(screen.getByTestId('modified-state')).toHaveTextContent('Modified');
  });
  
  test('executes shortcut action when key is pressed', async () => {
    // Mock the action function
    const saveAction = jest.fn();
    const undoAction = jest.fn();
    
    // Update the mock implementation to use our mock actions
    const KeyboardShortcutService = require('./KeyboardShortcutService');
    KeyboardShortcutService.mockImplementation(() => ({
      ...KeyboardShortcutService.mock.results[0].value,
      loadSchema: jest.fn().mockResolvedValue({
        version: '1.0.0',
        groups: [
          {
            id: 'general',
            label: 'General',
            order: 1,
          },
          {
            id: 'editing',
            label: 'Editing',
            order: 2,
          },
        ],
        scopes: [
          {
            id: 'global',
            label: 'Global',
            order: 1,
          },
          {
            id: 'editor',
            label: 'Editor',
            order: 2,
          },
        ],
        shortcuts: [
          {
            id: 'save',
            key: 's',
            modifiers: ['ctrl'],
            description: 'Save',
            group: 'general',
            action: saveAction,
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'undo',
            key: 'z',
            modifiers: ['ctrl'],
            description: 'Undo',
            group: 'editing',
            action: undoAction,
            scope: 'editor',
            isDefault: true,
          },
        ],
      }),
    }));
    
    render(
      <KeyboardShortcutProvider>
        <TestComponent />
      </KeyboardShortcutProvider>
    );
    
    // Wait for shortcuts to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });
    
    // Simulate key down event for save shortcut
    fireEvent.keyDown(window, {
      key: 's',
      code: 'KeyS',
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
      metaKey: false,
    });
    
    // Check if save action was called
    expect(saveAction).toHaveBeenCalledTimes(1);
    expect(undoAction).not.toHaveBeenCalled();
  });
});
