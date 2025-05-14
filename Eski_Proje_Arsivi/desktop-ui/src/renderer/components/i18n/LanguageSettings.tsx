import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Radio,
  RadioGroup,
  Flex,
  Divider,
  useColorMode,
  Card,
  CardHeader,
  CardBody,
  Badge,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useLanguage, { AVAILABLE_LANGUAGES } from '../../hooks/useLanguage';
import { glassmorphism } from '@/styles/theme';

export interface LanguageSettingsProps {
  /**
   * Whether to show as a card
   */
  asCard?: boolean;
  /**
   * Whether to show header
   */
  showHeader?: boolean;
  /**
   * Whether to show description
   */
  showDescription?: boolean;
  /**
   * Custom class name
   */
  className?: string;
  /**
   * Custom style
   */
  style?: React.CSSProperties;
}

/**
 * Language settings component
 */
export const LanguageSettings: React.FC<LanguageSettingsProps> = ({
  asCard = true,
  showHeader = true,
  showDescription = true,
  className,
  style,
}) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const {
    currentLanguage,
    changeLanguage,
  } = useLanguage();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Handle language change
  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
  };
  
  // Render content
  const renderContent = () => (
    <VStack align="stretch" spacing={4}>
      {showHeader && (
        <Heading size="md">{t('settings.language')}</Heading>
      )}
      
      {showDescription && (
        <Text>{t('settings.language')}</Text>
      )}
      
      <RadioGroup
        value={currentLanguage.code}
        onChange={handleLanguageChange}
      >
        <VStack align="stretch" spacing={2}>
          {AVAILABLE_LANGUAGES.map(language => (
            <Flex
              key={language.code}
              p={2}
              borderRadius="md"
              align="center"
              justify="space-between"
              bg={
                language.code === currentLanguage.code
                  ? colorMode === 'light'
                    ? 'gray.100'
                    : 'gray.700'
                  : undefined
              }
              _hover={{
                bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
              }}
            >
              <HStack>
                {language.flag && (
                  <Text fontSize="xl" mr={2}>
                    {language.flag}
                  </Text>
                )}
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">
                    {t(`languages.${language.code}`)}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {language.name}
                  </Text>
                </VStack>
              </HStack>
              <HStack>
                {language.code === currentLanguage.code && (
                  <Badge colorScheme="green" mr={2}>
                    {t('common.active')}
                  </Badge>
                )}
                <Radio value={language.code} />
              </HStack>
            </Flex>
          ))}
        </VStack>
      </RadioGroup>
      
      <Divider />
      
      <Box>
        <Heading size="sm" mb={2}>
          {t('settings.language')}
        </Heading>
        <Text fontSize="sm">
          {t('settings.language')}
        </Text>
      </Box>
    </VStack>
  );
  
  // Render as card
  if (asCard) {
    return (
      <Card className={className} style={style} {...glassStyle}>
        <CardHeader>
          <Heading size="md">{t('settings.language')}</Heading>
        </CardHeader>
        <CardBody>
          {renderContent()}
        </CardBody>
      </Card>
    );
  }
  
  // Render as simple component
  return (
    <Box className={className} style={style}>
      {renderContent()}
    </Box>
  );
};

export default LanguageSettings;
