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
} from '@chakra-ui/react';
import { useTranslation, Trans } from 'react-i18next';
import { I18nProvider } from '../../providers/I18nProvider';
import LanguageSwitcher from './LanguageSwitcher';
import LanguageSettings from './LanguageSettings';
import TranslatedText from './TranslatedText';
import useLanguage from '../../hooks/useLanguage';
import { glassmorphism } from '@/styles/theme';

// I18n demo content
const I18nDemoContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colorMode } = useColorMode();
  const { currentLanguage } = useLanguage();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  return (
    <Box p={4} height="100%">
      <VStack spacing={4} align="stretch" height="100%">
        <Heading size="lg">{t('app.name')}</Heading>
        
        <Text>
          {t('app.version', { version: '1.0.0' })}
        </Text>
        
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>{t('common.info')}</AlertTitle>
          <AlertDescription>
            {t('settings.language')}
          </AlertDescription>
        </Alert>
        
        <Flex justify="flex-end">
          <LanguageSwitcher
            showFlags
            showNames
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
            <Tab>{t('settings.language')}</Tab>
            <Tab>{t('common.code')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.demo')}</Heading>
                  
                  <Card>
                    <CardHeader>
                      <Heading size="md">{t('app.name')}</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={2}>
                        <Text>{t('common.language')}: {t(`languages.${currentLanguage.code}`)}</Text>
                        <Text>{t('common.direction')}: {currentLanguage.dir || 'ltr'}</Text>
                        <Text>{t('common.flag')}: {currentLanguage.flag}</Text>
                      </VStack>
                    </CardBody>
                    <CardFooter>
                      <Button colorScheme="blue">{t('common.ok')}</Button>
                    </CardFooter>
                  </Card>
                  
                  <Divider />
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.example')}</Heading>
                    
                    <VStack align="stretch" spacing={2}>
                      <TranslatedText i18nKey="common.hello" defaultValue="Hello" />
                      <TranslatedText
                        i18nKey="common.welcome"
                        values={{ name: 'John' }}
                        defaultValue="Welcome, {{name}}!"
                      />
                      <Box>
                        <Trans i18nKey="common.htmlExample" defaults="This is <bold>bold</bold> and <italic>italic</italic>">
                          This is <strong>bold</strong> and <em>italic</em>
                        </Trans>
                      </Box>
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <LanguageSettings />
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.code')}</Heading>
                  
                  <Box>
                    <Heading size="sm" mb={2}>useTranslation</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('app.name')}</h1>
      <p>{t('app.version', { version: '1.0.0' })}</p>
    </div>
  );
};`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>Trans Component</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { Trans } from 'react-i18next';

const MyComponent = () => {
  return (
    <div>
      <Trans i18nKey="common.htmlExample">
        This is <strong>bold</strong> and <em>italic</em>
      </Trans>
    </div>
  );
};`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>TranslatedText Component</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import TranslatedText from './TranslatedText';

const MyComponent = () => {
  return (
    <div>
      <TranslatedText i18nKey="common.hello" defaultValue="Hello" />
      <TranslatedText
        i18nKey="common.welcome"
        values={{ name: 'John' }}
        defaultValue="Welcome, {{name}}!"
      />
    </div>
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
              {t('settings.language')}
            </Text>
            
            <Box pl={4}>
              <Text>• <strong>i18next</strong>: {t('common.core')}</Text>
              <Text>• <strong>react-i18next</strong>: {t('common.integration')}</Text>
              <Text>• <strong>i18next-browser-languagedetector</strong>: {t('common.detection')}</Text>
              <Text>• <strong>i18next-http-backend</strong>: {t('common.loading')}</Text>
            </Box>
            
            <Text>
              {t('settings.language')}
            </Text>
            
            <Box pl={4}>
              <Text>• {t('common.translation')}</Text>
              <Text>• {t('common.interpolation')}</Text>
              <Text>• {t('common.formatting')}</Text>
              <Text>• {t('common.pluralization')}</Text>
              <Text>• {t('common.nesting')}</Text>
              <Text>• {t('common.context')}</Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

// Wrap with I18n provider
const I18nDemo: React.FC = () => {
  return (
    <I18nProvider>
      <I18nDemoContent />
    </I18nProvider>
  );
};

export default I18nDemo;
