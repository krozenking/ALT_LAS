import React from 'react';
import { Box, useColorMode } from '@chakra-ui/react';
import DemoLayout from '@/components/layouts/DemoLayout';

const App: React.FC = () => {
  const { colorMode } = useColorMode();
  
  return (
    <Box width="100vw" height="100vh">
      <DemoLayout 
        backgroundImage={colorMode === 'light' 
          ? "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')" 
          : "url('https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80')"
        }
      />
    </Box>
  );
};

export default App;
