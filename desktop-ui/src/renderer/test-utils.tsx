import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from './styles/theme';
import { NotificationProvider } from './components/notifications';
import { SettingsProvider } from './components/settings';
import { KeyboardShortcutProvider } from './components/keyboard-shortcuts';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// Custom render function that includes providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ChakraProvider theme={theme}>
      <KeyboardShortcutProvider>
        <SettingsProvider>
          <NotificationProvider>
            <I18nextProvider i18n={i18n}>
              {children}
            </I18nextProvider>
          </NotificationProvider>
        </SettingsProvider>
      </KeyboardShortcutProvider>
    </ChakraProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };
