// src/__tests__/integration/theme-switching.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../../pages/index';

// This is an integration test that tests the actual integration between
// the Home component and the theme store, without mocking the store

describe('Theme Switching Integration', () => {
  test('changes the page background when theme is switched', () => {
    render(<Home />);
    
    // Initially, the theme should be 'system' (default in the store)
    // For simplicity in testing, we'll just check if we can switch themes
    
    // Get the main container
    const mainContainer = screen.getByRole('main').parentElement;
    
    // Click dark theme button
    fireEvent.click(screen.getByText('Koyu Tema'));
    
    // Check if the background class has changed to dark
    expect(mainContainer).toHaveClass('bg-gray-900');
    expect(mainContainer).toHaveClass('text-white');
    
    // Click light theme button
    fireEvent.click(screen.getByText('Açık Tema'));
    
    // Check if the background class has changed to light
    expect(mainContainer).toHaveClass('bg-white');
    expect(mainContainer).toHaveClass('text-gray-900');
  });
  
  test('highlights the active theme button', () => {
    render(<Home />);
    
    // Get all theme buttons
    const lightButton = screen.getByText('Açık Tema');
    const darkButton = screen.getByText('Koyu Tema');
    const systemButton = screen.getByText('Sistem Teması');
    
    // Initially, system button should be primary (default in the store)
    expect(systemButton).toHaveClass('bg-blue-600'); // primary style
    expect(lightButton).toHaveClass('bg-gray-200'); // secondary style
    expect(darkButton).toHaveClass('bg-gray-200'); // secondary style
    
    // Click light theme button
    fireEvent.click(lightButton);
    
    // Now light button should be primary
    expect(lightButton).toHaveClass('bg-blue-600'); // primary style
    expect(darkButton).toHaveClass('bg-gray-200'); // secondary style
    expect(systemButton).toHaveClass('bg-gray-200'); // secondary style
    
    // Click dark theme button
    fireEvent.click(darkButton);
    
    // Now dark button should be primary
    expect(darkButton).toHaveClass('bg-blue-600'); // primary style
    expect(lightButton).toHaveClass('bg-gray-200'); // secondary style
    expect(systemButton).toHaveClass('bg-gray-200'); // secondary style
  });
});
