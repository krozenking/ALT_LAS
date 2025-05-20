import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box, Flex, useColorMode, Button, extendTheme, HStack } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import ChatContainer from './components/Chat/ChatContainer';
import LanguageSelector from './components/Chat/LanguageSelector';
import AccessibilityMenu from './components/Chat/AccessibilityMenu';
import NotificationButton from './components/Notifications/NotificationButton';
import ThemeButton from './components/Theme/ThemeButton';
import KeyboardShortcutsButton from './components/Keyboard/KeyboardShortcutsButton';
import HelpButton from './components/Help/HelpButton';
import NotificationProvider from './components/Notifications/NotificationSystem';
import apiService from './services/api.service';
import { User } from './types';
import useTranslation, { Language } from './hooks/useTranslation';
import useAccessibility from './hooks/useAccessibility';
import useThemeCustomization from './hooks/useThemeCustomization';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { initAccessibility } from './utils/accessibility';
import './styles/accessibility.css';
import './styles/theme.css';

// Chakra UI tema yapılandırması
const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
  },
  styles: {
    global: (props: unknown) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      },
    }),
  },
});

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { colorMode, toggleColorMode } = useColorMode();
  const { t, language, changeLanguage } = useTranslation();
  const {
    fontSize,
    highContrast,
    reduceMotion,
    screenReaderMode,
    setFontSize,
    setHighContrast,
    setReduceMotion,
    setScreenReaderMode
  } = useAccessibility();

  // Erişilebilirlik özelliklerini başlat
  useEffect(() => {
    const cleanup = initAccessibility();
    return cleanup;
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Gerçek uygulamada kullanıcı kimlik doğrulaması yapılacak
        // Şimdilik basit bir kullanıcı oluşturuyoruz
        const storedUserId = localStorage.getItem('userId');

        if (storedUserId) {
          try {
            const fetchedUser = await apiService.getUser(storedUserId);
            setUser(fetchedUser);
          } catch (error) {
            console.error('Kullanıcı yüklenirken hata:', error);
            // Kullanıcı bulunamadıysa yeni oluştur
            createNewUser();
          }
        } else {
          createNewUser();
        }
      } catch (error) {
        console.error('Kullanıcı başlatma hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    const createNewUser = async () => {
      try {
        const newUser = await apiService.createUser('Misafir Kullanıcı');
        setUser(newUser);
        localStorage.setItem('userId', newUser.id);
      } catch (error) {
        console.error('Kullanıcı oluşturma hatası:', error);
        // API hatası durumunda geçici kullanıcı oluştur
        const tempUser: User = {
          id: 'temp-user-' + Date.now(),
          name: 'Misafir Kullanıcı',
          email: 'misafir@altlas.com',
          createdAt: new Date().toISOString()
        };
        setUser(tempUser);
      }
    };

    initializeUser();
  }, []);

  // Kullanıcı bilgilerini güncelle
  const handleUpdateUser = (updatedUser: User) => {
    // Gerçek uygulamada burada API çağrısı yapılır
    console.log('Kullanıcı güncellendi:', updatedUser);
    setUser(updatedUser);

    // Yerel depolamaya kaydet
    try {
      apiService.updateUser(updatedUser);
    } catch (error) {
      console.error('Kullanıcı güncellenirken hata:', error);
    }
  };

  // Sistem temasını izle
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && colorMode !== 'dark') {
        toggleColorMode();
      } else if (!e.matches && colorMode !== 'light') {
        toggleColorMode();
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [colorMode, toggleColorMode]);

  if (loading) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Box textAlign="center">
          <Box
            className="animate-spin"
            border="4px solid"
            borderColor="gray.200"
            borderTopColor="blue.500"
            borderRadius="50%"
            width="50px"
            height="50px"
            mx="auto"
          />
          <Box mt={4} color="gray.500">Yükleniyor...</Box>
        </Box>
      </Flex>
    );
  }

  return (
    <Box minH="100vh">
      <Flex direction="column" h="100vh" maxW="1200px" mx="auto" p={4}>
        <Flex justifyContent="flex-end" mb={4}>
          <HStack spacing={2}>
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={changeLanguage}
            />
            <NotificationButton size="sm" />
            <HelpButton size="sm" />
            <KeyboardShortcutsButton size="sm" />
            <ThemeButton size="sm" />
            <AccessibilityMenu
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              highContrast={highContrast}
              onHighContrastChange={setHighContrast}
              reduceMotion={reduceMotion}
              onReduceMotionChange={setReduceMotion}
              screenReaderMode={screenReaderMode}
              onScreenReaderModeChange={setScreenReaderMode}
            />
            <Button onClick={toggleColorMode} size="sm" variant="ghost">
              {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            </Button>
          </HStack>
        </Flex>

        <Box flex="1" borderRadius="lg" overflow="hidden" boxShadow="lg">
          {user ? (
            <ChatContainer
              user={user}
              onUpdateUser={handleUpdateUser}
            />
          ) : (
            <Box textAlign="center" p={8} bg="white" borderRadius="lg" boxShadow="lg">
              <Box color="red.500">Kullanıcı başlatılamadı. Lütfen sayfayı yenileyin.</Box>
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ChakraProvider>
  );
}

export default App;
