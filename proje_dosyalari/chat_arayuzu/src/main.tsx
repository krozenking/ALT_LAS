import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import './index.css';
import './styles/chat.css';
import App from './App.tsx';
import theme from './theme';
import { initErrorHandling } from './utils/errorHandler';

// Initialize global error handling
initErrorHandling();

// Log application startup
console.log('ALT_LAS Chat Arayüzü başlatılıyor...');

// Hata yakalama işlemleri artık errorHandler.ts içinde merkezi olarak yönetiliyor
// window.onerror ve console.error override'ları kaldırıldı

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </StrictMode>,
  );

  console.log('Uygulama başarıyla render edildi');
} catch (error) {
  console.error('Uygulama render edilirken hata oluştu:', error);
}
