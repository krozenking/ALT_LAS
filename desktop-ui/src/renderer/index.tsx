import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from 'react-query';

// Import i18n
import './i18n/i18n';
import I18nProvider from './providers/I18nProvider';

import App from './App';
import { theme } from './styles/theme';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ChakraProvider theme={theme}>
          <App />
        </ChakraProvider>
      </I18nProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
