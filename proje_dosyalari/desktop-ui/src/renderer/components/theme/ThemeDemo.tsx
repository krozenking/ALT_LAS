import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Flex,
  Button,
  Code,
  useColorMode,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  FormControl,
  FormLabel,
  Switch,
  Checkbox,
  Radio,
  RadioGroup,
  Select,
  Textarea,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Badge,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Progress,
  Spinner,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, useThemeContext } from '../../providers/ThemeProvider';
import ThemeSwitcher from './ThemeSwitcher';
import ThemeSettings from './ThemeSettings';
import { glassmorphism } from '@/styles/theme';

// Theme demo content
const ThemeDemoContent: React.FC = () => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const {
    themeSettings,
    updateThemeSettings,
    resetThemeSettings,
    setThemeType,
    setThemeVariant,
    toggleColorMode,
  } = useThemeContext();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Show toast
  const showToast = (status: 'info' | 'success' | 'warning' | 'error') => {
    toast({
      title: t(`app.${status}`),
      description: t(`app.${status}Description`),
      status,
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box p={4} height="100%">
      <VStack spacing={4} align="stretch" height="100%">
        <Heading size="lg">{t('settings.theme')}</Heading>
        
        <Text>
          {t('settings.theme')}
        </Text>
        
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>{t('common.info')}</AlertTitle>
          <AlertDescription>
            {t('settings.theme')}
          </AlertDescription>
        </Alert>
        
        <Flex justify="flex-end">
          <ThemeSwitcher
            showTypes
            showVariants
            asButton
            size="md"
            variant="outline"
            colorScheme="blue"
            showTooltip
          />
        </Flex>
        
        <Tabs variant="enclosed">
          <TabList>
            <Tab>{t('common.demo')}</Tab>
            <Tab>{t('settings.theme')}</Tab>
            <Tab>{t('common.code')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.demo')}</Heading>
                  
                  {/* Cards */}
                  <Flex wrap="wrap" gap={4}>
                    <Card flex="1" minW="300px">
                      <CardHeader>
                        <Heading size="md">{t('common.card')}</Heading>
                      </CardHeader>
                      <CardBody>
                        <Text>{t('common.cardContent')}</Text>
                      </CardBody>
                      <CardFooter>
                        <Button colorScheme="blue">{t('common.action')}</Button>
                      </CardFooter>
                    </Card>
                    
                    <Card flex="1" minW="300px" {...glassStyle}>
                      <CardHeader>
                        <Heading size="md">{t('common.glassmorphism')}</Heading>
                      </CardHeader>
                      <CardBody>
                        <Text>{t('common.glassmorphismContent')}</Text>
                      </CardBody>
                      <CardFooter>
                        <Button colorScheme="blue">{t('common.action')}</Button>
                      </CardFooter>
                    </Card>
                  </Flex>
                  
                  {/* Alerts */}
                  <VStack align="stretch" spacing={2}>
                    <Alert status="info">
                      <AlertIcon />
                      <AlertTitle>{t('common.info')}</AlertTitle>
                      <AlertDescription>{t('common.infoContent')}</AlertDescription>
                    </Alert>
                    
                    <Alert status="success">
                      <AlertIcon />
                      <AlertTitle>{t('common.success')}</AlertTitle>
                      <AlertDescription>{t('common.successContent')}</AlertDescription>
                    </Alert>
                    
                    <Alert status="warning">
                      <AlertIcon />
                      <AlertTitle>{t('common.warning')}</AlertTitle>
                      <AlertDescription>{t('common.warningContent')}</AlertDescription>
                    </Alert>
                    
                    <Alert status="error">
                      <AlertIcon />
                      <AlertTitle>{t('common.error')}</AlertTitle>
                      <AlertDescription>{t('common.errorContent')}</AlertDescription>
                    </Alert>
                  </VStack>
                  
                  {/* Buttons */}
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.buttons')}</Heading>
                    
                    <HStack spacing={2} mb={2}>
                      <Button colorScheme="blue">{t('common.primary')}</Button>
                      <Button colorScheme="gray">{t('common.secondary')}</Button>
                      <Button colorScheme="red">{t('common.danger')}</Button>
                      <Button colorScheme="green">{t('common.success')}</Button>
                    </HStack>
                    
                    <HStack spacing={2} mb={2}>
                      <Button variant="outline" colorScheme="blue">{t('common.outline')}</Button>
                      <Button variant="ghost" colorScheme="blue">{t('common.ghost')}</Button>
                      <Button variant="link" colorScheme="blue">{t('common.link')}</Button>
                    </HStack>
                    
                    <HStack spacing={2}>
                      <Button size="xs">{t('common.xs')}</Button>
                      <Button size="sm">{t('common.sm')}</Button>
                      <Button size="md">{t('common.md')}</Button>
                      <Button size="lg">{t('common.lg')}</Button>
                    </HStack>
                  </Box>
                  
                  {/* Form Elements */}
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.form')}</Heading>
                    
                    <VStack align="stretch" spacing={2}>
                      <FormControl>
                        <FormLabel>{t('common.input')}</FormLabel>
                        <Input placeholder={t('common.placeholder')} />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>{t('common.select')}</FormLabel>
                        <Select>
                          <option value="option1">{t('common.option')} 1</option>
                          <option value="option2">{t('common.option')} 2</option>
                          <option value="option3">{t('common.option')} 3</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>{t('common.textarea')}</FormLabel>
                        <Textarea placeholder={t('common.placeholder')} />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>{t('common.checkbox')}</FormLabel>
                        <Checkbox>{t('common.checkbox')}</Checkbox>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>{t('common.radio')}</FormLabel>
                        <RadioGroup defaultValue="1">
                          <HStack spacing={4}>
                            <Radio value="1">{t('common.option')} 1</Radio>
                            <Radio value="2">{t('common.option')} 2</Radio>
                            <Radio value="3">{t('common.option')} 3</Radio>
                          </HStack>
                        </RadioGroup>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>{t('common.switch')}</FormLabel>
                        <Switch />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>{t('common.slider')}</FormLabel>
                        <Slider defaultValue={50}>
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <SliderThumb />
                        </Slider>
                      </FormControl>
                    </VStack>
                  </Box>
                  
                  {/* Feedback */}
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.feedback')}</Heading>
                    
                    <VStack align="stretch" spacing={2}>
                      <HStack spacing={2}>
                        <Button onClick={() => showToast('info')}>{t('common.info')}</Button>
                        <Button onClick={() => showToast('success')}>{t('common.success')}</Button>
                        <Button onClick={() => showToast('warning')}>{t('common.warning')}</Button>
                        <Button onClick={() => showToast('error')}>{t('common.error')}</Button>
                      </HStack>
                      
                      <Progress value={80} />
                      
                      <HStack spacing={2}>
                        <Spinner size="xs" />
                        <Spinner size="sm" />
                        <Spinner size="md" />
                        <Spinner size="lg" />
                      </HStack>
                      
                      <Box>
                        <SkeletonText mt="4" noOfLines={3} spacing="4" />
                        <Flex mt={4}>
                          <SkeletonCircle size="10" mr={4} />
                          <Skeleton height="20px" width="100%" />
                        </Flex>
                      </Box>
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <ThemeSettings />
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.code')}</Heading>
                  
                  <Box>
                    <Heading size="sm" mb={2}>useThemeContext</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { useThemeContext } from '../../providers/ThemeProvider';

const MyComponent = () => {
  const {
    themeSettings,
    updateThemeSettings,
    resetThemeSettings,
    setThemeType,
    setThemeVariant,
    toggleColorMode,
    colorMode,
  } = useThemeContext();
  
  return (
    <div>
      <h1>Current Theme: {themeSettings.type}</h1>
      <button onClick={() => setThemeType('dark')}>Dark Mode</button>
      <button onClick={() => setThemeType('light')}>Light Mode</button>
      <button onClick={toggleColorMode}>Toggle Mode</button>
    </div>
  );
};`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>ThemeSwitcher Component</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import ThemeSwitcher from './ThemeSwitcher';

const MyComponent = () => {
  return (
    <div>
      <ThemeSwitcher
        showTypes
        showVariants
        asButton
        size="md"
        variant="outline"
        colorScheme="blue"
        showTooltip
      />
    </div>
  );
};`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>ThemeSettings Component</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import ThemeSettings from './ThemeSettings';

const MyComponent = () => {
  return (
    <div>
      <ThemeSettings
        asCard
        showHeader
        showDescription
      />
    </div>
  );
};`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>Glassmorphism</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

const MyComponent = () => {
  const { colorMode } = useColorMode();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  return (
    <Box p={4} borderRadius="md" {...glassStyle}>
      <Text>Glassmorphism Effect</Text>
    </Box>
  );
};`}
                    </Code>
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>{t('common.details')}</Heading>
          
          <VStack align="stretch" spacing={3}>
            <Text>
              {t('settings.theme')}
            </Text>
            
            <Box pl={4}>
              <Text>• <strong>ThemeProvider</strong>: {t('common.provider')}</Text>
              <Text>• <strong>useThemeContext</strong>: {t('common.hook')}</Text>
              <Text>• <strong>ThemeSwitcher</strong>: {t('common.switcher')}</Text>
              <Text>• <strong>ThemeSettings</strong>: {t('common.settings')}</Text>
            </Box>
            
            <Text>
              {t('settings.theme')}
            </Text>
            
            <Box pl={4}>
              <Text>• {t('common.colors')}</Text>
              <Text>• {t('common.typography')}</Text>
              <Text>• {t('common.spacing')}</Text>
              <Text>• {t('common.effects')}</Text>
              <Text>• {t('common.glassmorphism')}</Text>
              <Text>• {t('common.accessibility')}</Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

// Wrap with theme provider
const ThemeDemo: React.FC = () => {
  return (
    <ThemeProvider>
      <ThemeDemoContent />
    </ThemeProvider>
  );
};

export default ThemeDemo;
