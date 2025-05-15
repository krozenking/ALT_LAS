const React = require('react');
const { createRoot } = require('react-dom/client');
const { ChakraProvider } = require('@chakra-ui/react');
const { QueryClient, QueryClientProvider } = require('react-query');

// Create a client for React Query
const queryClient = new QueryClient();

// Create a simple App component
const App = () => {
  const [appVersion, setAppVersion] = React.useState('');

  React.useEffect(() => {
    // Get the app version from the main process
    const getAppVersion = async () => {
      try {
        if (window.electron) {
          const version = await window.electron.appVersion();
          setAppVersion(version);
        }
      } catch (error) {
        console.error('Failed to get app version:', error);
      }
    };

    getAppVersion();
  }, []);

  return React.createElement(
    'div',
    { style: { padding: '20px', textAlign: 'center' } },
    React.createElement('h1', null, 'ALT_LAS Desktop UI'),
    React.createElement('p', null, 'Welcome to the ALT_LAS Desktop Application'),
    appVersion && React.createElement('p', null, `Version: ${appVersion}`)
  );
};

// Create the root element
const root = createRoot(document.getElementById('root'));

// Render the application
root.render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        ChakraProvider,
        null,
        React.createElement(App)
      )
    )
  )
);
