import React from 'react';
import { Box, Flex, useColorMode, Button, HStack, Text, useToast } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';
import DemoLayout from '@/components/layouts/DemoLayout';
import { theme, highContrastTheme } from '@/styles/';
import NotificationCenter from '@/components/feature/NotificationCenter';
import FileManager from '@/components/feature/FileManager';

const App: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isHighContrast, setIsHighContrast] = React.useState(false);
  const toast = useToast();
  
  // Check for high contrast preference in localStorage
  React.useEffect(() => {
    const savedPreference = localStorage.getItem('highContrastMode');
    if (savedPreference === 'true') {
      setIsHighContrast(true);
    }
  }, []);
  
  // Toggle high contrast mode
  const toggleHighContrast = () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    localStorage.setItem('highContrastMode', String(newValue));
    
    toast({
      title: newValue ? 'Yüksek kontrast modu etkinleştirildi' : 'Standart mod etkinleştirildi',
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });
  };
  
  return (
    <ChakraProvider theme={isHighContrast ? highContrastTheme : theme}>
      <Box width="100vw" height="100vh">
        <HStack position="absolute" top="4" right="4" spacing="4" zIndex="10">
          <Button 
            onClick={toggleColorMode} 
            aria-label={colorMode === 'light' ? 'Koyu moda geç' : 'Açık moda geç'}
          >
            {colorMode === 'light' ? 'Koyu Mod' : 'Açık Mod'}
          </Button>
          <Button 
            onClick={toggleHighContrast}
            aria-label={isHighContrast ? 'Standart moda geç' : 'Yüksek kontrast moda geç'}
            variant={isHighContrast ? 'solid' : 'outline'}
          >
            {isHighContrast ? 'Standart Mod' : 'Yüksek Kontrast'}
          </Button>
          <NotificationCenter />
          <FileManager />
        </HStack>
        
        <DemoLayout 
          backgroundImage={!isHighContrast ? (colorMode === 'light' 
            ? "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')" 
            : "url('https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80')")
            : undefined
          }
        />
        
        {isHighContrast && (
          <Box 
            position="fixed" 
            bottom="4" 
            left="4" 
            bg={colorMode === 'light' ? 'black' : 'white'} 
            color={colorMode === 'light' ? 'white' : 'black'} 
            p="2" 
            borderRadius="md"
            fontWeight="bold"
          >
            <Text>Yüksek Kontrast Modu Aktif</Text>
          </Box>
        )}
      </Box>
    </ChakraProvider>
  );
};

export default App;
