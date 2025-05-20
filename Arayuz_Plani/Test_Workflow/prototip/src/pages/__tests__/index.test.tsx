// src/pages/__tests__/index.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import Home from '../index';
import { useThemeStore } from '../../store/useThemeStore';

// Mock the theme store
jest.mock('../../store/useThemeStore', () => ({
  useThemeStore: {
    getState: jest.fn(),
    setState: jest.fn(),
    subscribe: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('Home Page', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementation
    (useThemeStore as jest.Mocked<typeof useThemeStore>).getState.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
    });
  });

  test('renders the page title', () => {
    render(<Home />);
    expect(screen.getByText('ALT_LAS Arayüz Prototip')).toBeInTheDocument();
  });

  test('renders theme selection buttons', () => {
    render(<Home />);
    expect(screen.getByText('Açık Tema')).toBeInTheDocument();
    expect(screen.getByText('Koyu Tema')).toBeInTheDocument();
    expect(screen.getByText('Sistem Teması')).toBeInTheDocument();
  });

  test('changes theme when theme buttons are clicked', () => {
    const setThemeMock = jest.fn();
    (useThemeStore as jest.Mocked<typeof useThemeStore>).getState.mockReturnValue({
      theme: 'light',
      setTheme: setThemeMock,
    });

    render(<Home />);
    
    // Click dark theme button
    fireEvent.click(screen.getByText('Koyu Tema'));
    expect(setThemeMock).toHaveBeenCalledWith('dark');
    
    // Click system theme button
    fireEvent.click(screen.getByText('Sistem Teması'));
    expect(setThemeMock).toHaveBeenCalledWith('system');
    
    // Click light theme button
    fireEvent.click(screen.getByText('Açık Tema'));
    expect(setThemeMock).toHaveBeenCalledWith('light');
  });

  test('renders button variations', () => {
    render(<Home />);
    
    // Check if all button sections are rendered
    expect(screen.getByText('Buton Varyasyonları')).toBeInTheDocument();
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Secondary')).toBeInTheDocument();
    expect(screen.getByText('Tertiary')).toBeInTheDocument();
    
    // Check if buttons with different sizes are rendered
    const smallButtons = screen.getAllByText('Small');
    const mediumButtons = screen.getAllByText('Medium');
    const largeButtons = screen.getAllByText('Large');
    
    expect(smallButtons.length).toBe(3); // One for each variant
    expect(mediumButtons.length).toBe(3);
    expect(largeButtons.length).toBe(3);
  });

  test('renders accessibility section', () => {
    render(<Home />);
    expect(screen.getByText('Erişilebilirlik Özellikleri')).toBeInTheDocument();
    expect(screen.getByText('Erişilebilirlik Testi')).toBeInTheDocument();
  });

  test('shows alert when accessibility test button is clicked', () => {
    // Mock window.alert
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<Home />);
    fireEvent.click(screen.getByText('Erişilebilirlik Testi'));
    
    expect(alertMock).toHaveBeenCalledWith('Erişilebilirlik testi başarılı!');
    
    // Restore the original implementation
    alertMock.mockRestore();
  });

  test('has no accessibility violations', async () => {
    const { container } = render(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
