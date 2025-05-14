import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '../../test-utils';
import { SettingsProvider, useSettings } from './SettingsContext';

// Mock the SettingsStorage class
jest.mock('./SettingsStorage', () => {
  return jest.fn().mockImplementation(() => ({
    loadSchema: jest.fn().mockResolvedValue({
      version: '1.0.0',
      groups: [
        {
          id: 'general',
          label: 'General',
          settings: [
            {
              id: 'theme',
              label: 'Theme',
              type: 'select',
              defaultValue: 'light',
              options: [
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
                { label: 'System', value: 'system' },
              ],
            },
            {
              id: 'language',
              label: 'Language',
              type: 'select',
              defaultValue: 'en',
              options: [
                { label: 'English', value: 'en' },
                { label: 'Spanish', value: 'es' },
                { label: 'French', value: 'fr' },
              ],
            },
          ],
        },
        {
          id: 'advanced',
          label: 'Advanced',
          settings: [
            {
              id: 'developerMode',
              label: 'Developer Mode',
              type: 'boolean',
              defaultValue: false,
            },
          ],
        },
      ],
    }),
    loadValues: jest.fn().mockResolvedValue({
      version: '1.0.0',
      values: {},
    }),
    saveValues: jest.fn().mockResolvedValue(undefined),
    getValue: jest.fn(),
    setValue: jest.fn(),
    resetValue: jest.fn(),
    resetAll: jest.fn(),
    resetGroup: jest.fn(),
    importSettings: jest.fn(),
    exportSettings: jest.fn(),
  }));
});

// Test component that uses the settings context
const TestComponent = () => {
  const { getSettingValue, setSettingValue, state } = useSettings();
  
  const theme = getSettingValue('general', 'theme');
  const language = getSettingValue('general', 'language');
  const developerMode = getSettingValue('advanced', 'developerMode');
  
  return (
    <div>
      <div data-testid="theme-value">{theme}</div>
      <div data-testid="language-value">{language}</div>
      <div data-testid="developer-mode-value">{developerMode ? 'true' : 'false'}</div>
      <button onClick={() => setSettingValue('general', 'theme', 'dark')}>Set Dark Theme</button>
      <button onClick={() => setSettingValue('general', 'language', 'fr')}>Set French Language</button>
      <button onClick={() => setSettingValue('advanced', 'developerMode', true)}>Enable Developer Mode</button>
      <div data-testid="loading-state">{state.loading ? 'Loading' : 'Loaded'}</div>
      <div data-testid="modified-state">{state.modified ? 'Modified' : 'Not Modified'}</div>
    </div>
  );
};

describe('SettingsContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  test('provides settings context to children', async () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });
    
    // Check default values
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    expect(screen.getByTestId('language-value')).toHaveTextContent('en');
    expect(screen.getByTestId('developer-mode-value')).toHaveTextContent('false');
    expect(screen.getByTestId('modified-state')).toHaveTextContent('Not Modified');
  });
  
  test('updates setting value when setSettingValue is called', async () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });
    
    // Change theme to dark
    fireEvent.click(screen.getByText('Set Dark Theme'));
    
    // Check if theme value is updated
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    expect(screen.getByTestId('modified-state')).toHaveTextContent('Modified');
  });
  
  test('updates multiple settings', async () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });
    
    // Change theme to dark
    fireEvent.click(screen.getByText('Set Dark Theme'));
    
    // Change language to French
    fireEvent.click(screen.getByText('Set French Language'));
    
    // Enable developer mode
    fireEvent.click(screen.getByText('Enable Developer Mode'));
    
    // Check if all values are updated
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    expect(screen.getByTestId('language-value')).toHaveTextContent('fr');
    expect(screen.getByTestId('developer-mode-value')).toHaveTextContent('true');
    expect(screen.getByTestId('modified-state')).toHaveTextContent('Modified');
  });
  
  test('saves settings when saveSettings is called', async () => {
    // Create a component that can save settings
    const SaveSettingsComponent = () => {
      const { saveSettings, setSettingValue } = useSettings();
      
      return (
        <div>
          <button onClick={() => setSettingValue('general', 'theme', 'dark')}>Set Dark Theme</button>
          <button onClick={() => saveSettings()}>Save Settings</button>
        </div>
      );
    };
    
    render(
      <SettingsProvider>
        <SaveSettingsComponent />
      </SettingsProvider>
    );
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByText('Save Settings')).toBeInTheDocument();
    });
    
    // Change theme to dark
    fireEvent.click(screen.getByText('Set Dark Theme'));
    
    // Save settings
    fireEvent.click(screen.getByText('Save Settings'));
    
    // Check if saveValues was called
    const SettingsStorage = require('./SettingsStorage');
    const mockInstance = SettingsStorage.mock.results[0].value;
    
    await waitFor(() => {
      expect(mockInstance.saveValues).toHaveBeenCalled();
    });
  });
  
  test('resets settings when resetAllSettings is called', async () => {
    // Create a component that can reset settings
    const ResetSettingsComponent = () => {
      const { resetAllSettings, setSettingValue, getSettingValue } = useSettings();
      
      const theme = getSettingValue('general', 'theme');
      
      return (
        <div>
          <div data-testid="theme-value">{theme}</div>
          <button onClick={() => setSettingValue('general', 'theme', 'dark')}>Set Dark Theme</button>
          <button onClick={() => resetAllSettings()}>Reset All Settings</button>
        </div>
      );
    };
    
    render(
      <SettingsProvider>
        <ResetSettingsComponent />
      </SettingsProvider>
    );
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    });
    
    // Change theme to dark
    fireEvent.click(screen.getByText('Set Dark Theme'));
    
    // Check if theme value is updated
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    
    // Reset all settings
    fireEvent.click(screen.getByText('Reset All Settings'));
    
    // Check if theme value is reset to default
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
  });
});
