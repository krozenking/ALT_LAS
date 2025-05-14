// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

import { mount } from 'cypress/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../../src/renderer/styles/theme';
import { NotificationProvider } from '../../src/renderer/components/notifications';
import { SettingsProvider } from '../../src/renderer/components/settings';
import { KeyboardShortcutProvider } from '../../src/renderer/components/keyboard-shortcuts';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../src/renderer/i18n';

// Add the mount command with providers
Cypress.Commands.add('mount', (component, options = {}) => {
  const { providers = true, ...mountOptions } = options;
  
  // If providers is true, wrap the component with all providers
  if (providers) {
    return mount(
      <ChakraProvider theme={theme}>
        <KeyboardShortcutProvider>
          <SettingsProvider>
            <NotificationProvider>
              <I18nextProvider i18n={i18n}>
                {component}
              </I18nextProvider>
            </NotificationProvider>
          </SettingsProvider>
        </KeyboardShortcutProvider>
      </ChakraProvider>,
      mountOptions
    );
  }
  
  // Otherwise, just mount the component
  return mount(component, mountOptions);
});
