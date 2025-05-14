import React, { lazy, Suspense } from 'react';
import { Box, Flex, useColorMode, Button, HStack, Text, useToast, Spinner, Center, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';
import DemoLayout from '@/components/layouts/DemoLayout';
import { theme } from '@/styles/theme'; // Import the base theme
import { highContrastTheme } from '@/styles/highContrastTheme'; // Import the new high contrast theme
import AnimationTest from '@/components/test/AnimationTest'; // Import the animation test component
import { NotificationProvider, NotificationList, NotificationCenter as NotificationCenterComponent } from '@/components/notifications';

// Lazy load feature components to improve initial load time
const FeatureNotificationCenter = lazy(() => import('@/components/feature/NotificationCenter'));
const FileManager = lazy(() => import('@/components/feature/FileManager'));
const PerformanceMonitor = lazy(() => import('@/components/feature/PerformanceMonitor'));
const SettingsPanel = lazy(() => import('@/components/feature/SettingsPanel'));

// Loading fallback component
const LoadingFallback = () => (
  <Center p={4}>
    <Spinner size="md" color="blue.500" thickness="3px" speed="0.65s" />
  </Center>
);

const App: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isHighContrast, setIsHighContrast] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);
  const toast = useToast();

  // Check for high contrast preference in localStorage
  React.useEffect(() => {
    const savedPreference = localStorage.getItem('highContrastMode');
    if (savedPreference === 'true') {
      setIsHighContrast(true);
    }
    // Optional: Check system preference for high contrast
    // const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
    // if (prefersHighContrast && !savedPreference) { // Apply only if no user preference is saved
    //   setIsHighContrast(true);
    // }
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

  // Handle metric alerts from performance monitor
  const handleMetricAlert = (metric) => {
    toast({
      title: 'Performans Uyarısı',
      description: `${metric.name}: ${metric.value}${metric.unit} (${metric.changePercentage}% artış)`,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  };

  // Handle setting changes
  const handleSettingChange = (groupId, settingId, value) => {
    // Ayar değişikliklerini işle
    console.log(`Ayar değişti: ${groupId}.${settingId} = ${value}`);

    // Yüksek kontrast ayarı değiştiyse state'i güncelle
    if (groupId === 'accessibility' && settingId === 'highContrast') {
      setIsHighContrast(value);
      localStorage.setItem('highContrastMode', String(value));
    }

    toast({
      title: 'Ayar Güncellendi',
      description: `${settingId} ayarı güncellendi`,
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top',
    });
  };

  // Select the theme based on the high contrast state
  const currentTheme = isHighContrast ? highContrastTheme : theme;

  return (
    // Apply the selected theme to ChakraProvider
    <ChakraProvider theme={currentTheme}>
      <NotificationProvider>
        {/* Notification list for toast notifications */}
        <NotificationList />
        {/* Notification center for managing notifications */}
        <NotificationCenterComponent />

        {/* Use a Box that respects the theme's background and text color */}
        <Box
          width="100vw"
          height="100vh"
          bg={currentTheme.styles.global.body.bg}
          color={currentTheme.styles.global.body.color}
        >
        <HStack position="absolute" top="4" right="4" spacing="4" zIndex="10">
          <Button
            onClick={toggleColorMode}
            aria-label={colorMode === 'light' ? 'Koyu moda geç' : 'Açık moda geç'}
            isDisabled={isHighContrast} // Disable color mode toggle in high contrast
          >
            {colorMode === 'light' ? 'Koyu Mod' : 'Açık Mod'}
          </Button>
          <Button
            onClick={toggleHighContrast}
            aria-label={isHighContrast ? 'Standart moda geç' : 'Yüksek kontrast moda geç'}
            variant={isHighContrast ? 'solid' : 'outline'} // Use appropriate variant
          >
            {isHighContrast ? 'Standart Mod' : 'Yüksek Kontrast'}
          </Button>

          {/* Wrap lazy-loaded components with Suspense */}
          <Suspense fallback={<LoadingFallback />}>
            <FeatureNotificationCenter />
          </Suspense>

          <Suspense fallback={<LoadingFallback />}>
            <FileManager />
          </Suspense>

          <Suspense fallback={<LoadingFallback />}>
            <PerformanceMonitor onMetricAlert={handleMetricAlert} />
          </Suspense>

          <Suspense fallback={<LoadingFallback />}>
            <SettingsPanel onSettingChange={handleSettingChange} />
          </Suspense>
        </HStack>

        <Tabs
          index={activeTab}
          onChange={setActiveTab}
          variant="enclosed"
          position="absolute"
          top="16"
          left="4"
          right="4"
          zIndex="5"
        >
          <TabList>
            <Tab>Demo</Tab>
            <Tab>Animation Test</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <DemoLayout
                // Remove background image in high contrast mode for better visibility
                backgroundImage={!isHighContrast ? (colorMode === 'light'
                  ? "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
                  : "url('https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80')")
                  : undefined
                }
              />
            </TabPanel>

            <TabPanel>
              <Box
                p={4}
                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                borderRadius="md"
                boxShadow="md"
                mt={4}
              >
                <AnimationTest />
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* High contrast mode indicator */}
        {isHighContrast && (
          <Box
            position="fixed"
            bottom="4"
            left="4"
            bg={currentTheme.colors.primary[500]} // Use theme color
            color={currentTheme.colors.black} // Use theme color
            p="2"
            borderRadius="md"
            fontWeight="bold"
          >
            <Text>Yüksek Kontrast Modu Aktif</Text>
          </Box>
        )}
      </Box>
      </NotificationProvider>
    </ChakraProvider>
  );
};

export default App;
