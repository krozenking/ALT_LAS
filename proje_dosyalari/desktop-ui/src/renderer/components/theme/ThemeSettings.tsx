import React, { useState } from 'react';
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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormControl,
  FormLabel,
  Switch,
  Input,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Tooltip,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '../../providers/ThemeProvider';
import { 
  ThemeType, 
  ThemeVariant, 
  ThemeDensity, 
  ThemeRadius, 
  ThemeFont, 
  ThemeAnimation,
  ThemeSettings as ThemeSettingsType,
} from '../../styles/themes/types';
import { glassmorphism } from '@/styles/theme';

export interface ThemeSettingsProps {
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
 * Theme settings component
 */
export const ThemeSettings: React.FC<ThemeSettingsProps> = ({
  asCard = true,
  showHeader = true,
  showDescription = true,
  className,
  style,
}) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const {
    themeSettings,
    updateThemeSettings,
    resetThemeSettings,
    availableThemeTypes,
    availableThemeVariants,
    exportThemeSettings,
    importThemeSettings,
  } = useThemeContext();
  
  // State for import/export
  const [exportedSettings, setExportedSettings] = useState<string>('');
  const [importSettings, setImportSettings] = useState<string>('');
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Handle theme type change
  const handleThemeTypeChange = (value: string) => {
    updateThemeSettings({ type: value as ThemeType });
  };
  
  // Handle theme variant change
  const handleThemeVariantChange = (value: string) => {
    updateThemeSettings({ variant: value as ThemeVariant });
  };
  
  // Handle theme density change
  const handleThemeDensityChange = (value: string) => {
    updateThemeSettings({ density: value as ThemeDensity });
  };
  
  // Handle theme radius change
  const handleThemeRadiusChange = (value: string) => {
    updateThemeSettings({ radius: value as ThemeRadius });
  };
  
  // Handle theme font change
  const handleThemeFontChange = (value: string) => {
    updateThemeSettings({ font: value as ThemeFont });
  };
  
  // Handle theme animation change
  const handleThemeAnimationChange = (value: string) => {
    updateThemeSettings({ animation: value as ThemeAnimation });
  };
  
  // Handle theme direction change
  const handleThemeDirectionChange = (value: string) => {
    updateThemeSettings({ direction: value as 'ltr' | 'rtl' });
  };
  
  // Handle glassmorphism opacity change
  const handleGlassmorphismOpacityChange = (value: number) => {
    updateThemeSettings({ glassmorphismOpacity: value });
  };
  
  // Handle glassmorphism blur change
  const handleGlassmorphismBlurChange = (value: number) => {
    updateThemeSettings({ glassmorphismBlur: value });
  };
  
  // Handle glassmorphism border change
  const handleGlassmorphismBorderChange = (value: number) => {
    updateThemeSettings({ glassmorphismBorder: value });
  };
  
  // Handle use glassmorphism change
  const handleUseGlassmorphismChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateThemeSettings({ useGlassmorphism: e.target.checked });
  };
  
  // Handle use shadows change
  const handleUseShadowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateThemeSettings({ useShadows: e.target.checked });
  };
  
  // Handle use animations change
  const handleUseAnimationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateThemeSettings({ useAnimations: e.target.checked });
  };
  
  // Handle use transitions change
  const handleUseTransitionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateThemeSettings({ useTransitions: e.target.checked });
  };
  
  // Handle use borders change
  const handleUseBordersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateThemeSettings({ useBorders: e.target.checked });
  };
  
  // Handle use gradients change
  const handleUseGradientsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateThemeSettings({ useGradients: e.target.checked });
  };
  
  // Handle use custom scrollbar change
  const handleUseCustomScrollbarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateThemeSettings({ useCustomScrollbar: e.target.checked });
  };
  
  // Handle use reduced motion change
  const handleUseReducedMotionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateThemeSettings({ useReducedMotion: e.target.checked });
  };
  
  // Handle use high contrast change
  const handleUseHighContrastChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateThemeSettings({ useHighContrast: e.target.checked });
  };
  
  // Handle primary color change
  const handlePrimaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateThemeSettings({ primaryColor: e.target.value });
  };
  
  // Handle secondary color change
  const handleSecondaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateThemeSettings({ secondaryColor: e.target.value });
  };
  
  // Handle accent color change
  const handleAccentColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateThemeSettings({ accentColor: e.target.value });
  };
  
  // Handle background color change
  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateThemeSettings({ backgroundColor: e.target.value });
  };
  
  // Handle text color change
  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateThemeSettings({ textColor: e.target.value });
  };
  
  // Handle font size change
  const handleFontSizeChange = (value: number) => {
    updateThemeSettings({ fontSize: value });
  };
  
  // Handle font family change
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateThemeSettings({ fontFamily: e.target.value });
  };
  
  // Handle border radius change
  const handleBorderRadiusChange = (value: number) => {
    updateThemeSettings({ borderRadius: value });
  };
  
  // Handle spacing change
  const handleSpacingChange = (value: number) => {
    updateThemeSettings({ spacing: value });
  };
  
  // Handle reset
  const handleReset = () => {
    resetThemeSettings();
    toast({
      title: t('settings.resetSettings'),
      description: t('settings.resetSettingsSuccess'),
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle export
  const handleExport = () => {
    setExportedSettings(exportThemeSettings());
    toast({
      title: t('settings.exportSettings'),
      description: t('settings.exportSettingsSuccess'),
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle import
  const handleImport = () => {
    try {
      const success = importThemeSettings(importSettings);
      if (success) {
        toast({
          title: t('settings.importSettings'),
          description: t('settings.importSettingsSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setImportSettings('');
      } else {
        toast({
          title: t('settings.importSettings'),
          description: t('settings.importSettingsError'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: t('settings.importSettings'),
        description: t('settings.importSettingsError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Render content
  const renderContent = () => (
    <VStack align="stretch" spacing={4}>
      {showHeader && (
        <Heading size="md">{t('settings.theme')}</Heading>
      )}
      
      {showDescription && (
        <Text>{t('settings.theme')}</Text>
      )}
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab>{t('settings.general')}</Tab>
          <Tab>{t('settings.appearance')}</Tab>
          <Tab>{t('settings.advanced')}</Tab>
          <Tab>{t('settings.exportSettings')}</Tab>
        </TabList>
        
        <TabPanels>
          {/* General Tab */}
          <TabPanel>
            <VStack align="stretch" spacing={4}>
              {/* Theme Type */}
              <FormControl>
                <FormLabel>{t('settings.theme')}</FormLabel>
                <RadioGroup
                  value={themeSettings.type}
                  onChange={handleThemeTypeChange}
                >
                  <HStack spacing={4}>
                    {availableThemeTypes.map(type => (
                      <Radio key={type} value={type}>
                        {type === 'light' ? t('settings.lightMode') :
                         type === 'dark' ? t('settings.darkMode') :
                         type === 'system' ? t('settings.systemMode') :
                         t('common.custom')}
                      </Radio>
                    ))}
                  </HStack>
                </RadioGroup>
              </FormControl>
              
              {/* Theme Variant */}
              <FormControl>
                <FormLabel>{t('common.variant')}</FormLabel>
                <RadioGroup
                  value={themeSettings.variant}
                  onChange={handleThemeVariantChange}
                >
                  <Flex wrap="wrap" gap={4}>
                    {availableThemeVariants.map(variant => (
                      <Radio key={variant} value={variant}>
                        {variant === 'default' ? t('common.default') :
                         variant === 'custom' ? t('common.custom') :
                         t(`common.${variant}`)}
                      </Radio>
                    ))}
                  </Flex>
                </RadioGroup>
              </FormControl>
              
              {/* Density */}
              <FormControl>
                <FormLabel>{t('common.density')}</FormLabel>
                <RadioGroup
                  value={themeSettings.density}
                  onChange={handleThemeDensityChange}
                >
                  <HStack spacing={4}>
                    <Radio value="compact">{t('common.compact')}</Radio>
                    <Radio value="comfortable">{t('common.comfortable')}</Radio>
                    <Radio value="spacious">{t('common.spacious')}</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
              
              {/* Radius */}
              <FormControl>
                <FormLabel>{t('common.radius')}</FormLabel>
                <RadioGroup
                  value={themeSettings.radius}
                  onChange={handleThemeRadiusChange}
                >
                  <HStack spacing={4}>
                    <Radio value="none">{t('common.none')}</Radio>
                    <Radio value="sm">{t('common.sm')}</Radio>
                    <Radio value="md">{t('common.md')}</Radio>
                    <Radio value="lg">{t('common.lg')}</Radio>
                    <Radio value="xl">{t('common.xl')}</Radio>
                    <Radio value="full">{t('common.full')}</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
              
              {/* Font */}
              <FormControl>
                <FormLabel>{t('common.font')}</FormLabel>
                <RadioGroup
                  value={themeSettings.font}
                  onChange={handleThemeFontChange}
                >
                  <HStack spacing={4}>
                    <Radio value="system">{t('common.system')}</Radio>
                    <Radio value="sans">{t('common.sans')}</Radio>
                    <Radio value="serif">{t('common.serif')}</Radio>
                    <Radio value="mono">{t('common.mono')}</Radio>
                    <Radio value="custom">{t('common.custom')}</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
              
              {/* Animation */}
              <FormControl>
                <FormLabel>{t('common.animation')}</FormLabel>
                <RadioGroup
                  value={themeSettings.animation}
                  onChange={handleThemeAnimationChange}
                >
                  <HStack spacing={4}>
                    <Radio value="none">{t('common.none')}</Radio>
                    <Radio value="minimal">{t('common.minimal')}</Radio>
                    <Radio value="normal">{t('common.normal')}</Radio>
                    <Radio value="elaborate">{t('common.elaborate')}</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
              
              {/* Direction */}
              <FormControl>
                <FormLabel>{t('common.direction')}</FormLabel>
                <RadioGroup
                  value={themeSettings.direction}
                  onChange={handleThemeDirectionChange}
                >
                  <HStack spacing={4}>
                    <Radio value="ltr">LTR</Radio>
                    <Radio value="rtl">RTL</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
            </VStack>
          </TabPanel>
          
          {/* Appearance Tab */}
          <TabPanel>
            <VStack align="stretch" spacing={4}>
              {/* Colors */}
              <Heading size="sm">{t('common.colors')}</Heading>
              
              {/* Primary Color */}
              <FormControl>
                <FormLabel>{t('common.primaryColor')}</FormLabel>
                <Flex>
                  <Input
                    type="color"
                    value={themeSettings.primaryColor || '#3182ce'}
                    onChange={handlePrimaryColorChange}
                    width="80px"
                    mr={2}
                  />
                  <Input
                    value={themeSettings.primaryColor || '#3182ce'}
                    onChange={handlePrimaryColorChange}
                  />
                </Flex>
              </FormControl>
              
              {/* Secondary Color */}
              <FormControl>
                <FormLabel>{t('common.secondaryColor')}</FormLabel>
                <Flex>
                  <Input
                    type="color"
                    value={themeSettings.secondaryColor || '#63b3ed'}
                    onChange={handleSecondaryColorChange}
                    width="80px"
                    mr={2}
                  />
                  <Input
                    value={themeSettings.secondaryColor || '#63b3ed'}
                    onChange={handleSecondaryColorChange}
                  />
                </Flex>
              </FormControl>
              
              {/* Accent Color */}
              <FormControl>
                <FormLabel>{t('common.accentColor')}</FormLabel>
                <Flex>
                  <Input
                    type="color"
                    value={themeSettings.accentColor || '#4299e1'}
                    onChange={handleAccentColorChange}
                    width="80px"
                    mr={2}
                  />
                  <Input
                    value={themeSettings.accentColor || '#4299e1'}
                    onChange={handleAccentColorChange}
                  />
                </Flex>
              </FormControl>
              
              {/* Background Color */}
              <FormControl>
                <FormLabel>{t('common.backgroundColor')}</FormLabel>
                <Flex>
                  <Input
                    type="color"
                    value={themeSettings.backgroundColor || (colorMode === 'light' ? '#f7fafc' : '#1a202c')}
                    onChange={handleBackgroundColorChange}
                    width="80px"
                    mr={2}
                  />
                  <Input
                    value={themeSettings.backgroundColor || (colorMode === 'light' ? '#f7fafc' : '#1a202c')}
                    onChange={handleBackgroundColorChange}
                  />
                </Flex>
              </FormControl>
              
              {/* Text Color */}
              <FormControl>
                <FormLabel>{t('common.textColor')}</FormLabel>
                <Flex>
                  <Input
                    type="color"
                    value={themeSettings.textColor || (colorMode === 'light' ? '#1a202c' : '#f7fafc')}
                    onChange={handleTextColorChange}
                    width="80px"
                    mr={2}
                  />
                  <Input
                    value={themeSettings.textColor || (colorMode === 'light' ? '#1a202c' : '#f7fafc')}
                    onChange={handleTextColorChange}
                  />
                </Flex>
              </FormControl>
              
              <Divider />
              
              {/* Typography */}
              <Heading size="sm">{t('common.typography')}</Heading>
              
              {/* Font Size */}
              <FormControl>
                <FormLabel>{t('settings.fontSize')}: {themeSettings.fontSize || 16}px</FormLabel>
                <Slider
                  min={10}
                  max={24}
                  step={1}
                  value={themeSettings.fontSize || 16}
                  onChange={handleFontSizeChange}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </FormControl>
              
              {/* Font Family */}
              {themeSettings.font === 'custom' && (
                <FormControl>
                  <FormLabel>{t('settings.fontFamily')}</FormLabel>
                  <Input
                    value={themeSettings.fontFamily || ''}
                    onChange={handleFontFamilyChange}
                    placeholder="Inter, sans-serif"
                  />
                </FormControl>
              )}
              
              <Divider />
              
              {/* Spacing */}
              <Heading size="sm">{t('common.spacing')}</Heading>
              
              {/* Border Radius */}
              <FormControl>
                <FormLabel>{t('common.borderRadius')}: {themeSettings.borderRadius || 4}px</FormLabel>
                <Slider
                  min={0}
                  max={20}
                  step={1}
                  value={themeSettings.borderRadius || 4}
                  onChange={handleBorderRadiusChange}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </FormControl>
              
              {/* Spacing */}
              <FormControl>
                <FormLabel>{t('common.spacing')}: {themeSettings.spacing || 4}px</FormLabel>
                <Slider
                  min={2}
                  max={8}
                  step={0.5}
                  value={themeSettings.spacing || 4}
                  onChange={handleSpacingChange}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </FormControl>
            </VStack>
          </TabPanel>
          
          {/* Advanced Tab */}
          <TabPanel>
            <VStack align="stretch" spacing={4}>
              {/* Glassmorphism */}
              <Heading size="sm">{t('common.glassmorphism')}</Heading>
              
              {/* Use Glassmorphism */}
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="use-glassmorphism" mb="0">
                  {t('common.useGlassmorphism')}
                </FormLabel>
                <Switch
                  id="use-glassmorphism"
                  isChecked={themeSettings.useGlassmorphism}
                  onChange={handleUseGlassmorphismChange}
                />
              </FormControl>
              
              {themeSettings.useGlassmorphism && (
                <>
                  {/* Glassmorphism Opacity */}
                  <FormControl>
                    <FormLabel>{t('common.opacity')}: {themeSettings.glassmorphismOpacity?.toFixed(1) || 0.7}</FormLabel>
                    <Slider
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={themeSettings.glassmorphismOpacity || 0.7}
                      onChange={handleGlassmorphismOpacityChange}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </FormControl>
                  
                  {/* Glassmorphism Blur */}
                  <FormControl>
                    <FormLabel>{t('common.blur')}: {themeSettings.glassmorphismBlur || 10}px</FormLabel>
                    <Slider
                      min={0}
                      max={20}
                      step={1}
                      value={themeSettings.glassmorphismBlur || 10}
                      onChange={handleGlassmorphismBlurChange}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </FormControl>
                  
                  {/* Glassmorphism Border */}
                  <FormControl>
                    <FormLabel>{t('common.border')}: {themeSettings.glassmorphismBorder || 1}px</FormLabel>
                    <Slider
                      min={0}
                      max={5}
                      step={1}
                      value={themeSettings.glassmorphismBorder || 1}
                      onChange={handleGlassmorphismBorderChange}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </FormControl>
                </>
              )}
              
              <Divider />
              
              {/* Effects */}
              <Heading size="sm">{t('common.effects')}</Heading>
              
              {/* Use Shadows */}
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="use-shadows" mb="0">
                  {t('common.useShadows')}
                </FormLabel>
                <Switch
                  id="use-shadows"
                  isChecked={themeSettings.useShadows}
                  onChange={handleUseShadowsChange}
                />
              </FormControl>
              
              {/* Use Animations */}
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="use-animations" mb="0">
                  {t('common.useAnimations')}
                </FormLabel>
                <Switch
                  id="use-animations"
                  isChecked={themeSettings.useAnimations}
                  onChange={handleUseAnimationsChange}
                />
              </FormControl>
              
              {/* Use Transitions */}
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="use-transitions" mb="0">
                  {t('common.useTransitions')}
                </FormLabel>
                <Switch
                  id="use-transitions"
                  isChecked={themeSettings.useTransitions}
                  onChange={handleUseTransitionsChange}
                />
              </FormControl>
              
              {/* Use Borders */}
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="use-borders" mb="0">
                  {t('common.useBorders')}
                </FormLabel>
                <Switch
                  id="use-borders"
                  isChecked={themeSettings.useBorders}
                  onChange={handleUseBordersChange}
                />
              </FormControl>
              
              {/* Use Gradients */}
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="use-gradients" mb="0">
                  {t('common.useGradients')}
                </FormLabel>
                <Switch
                  id="use-gradients"
                  isChecked={themeSettings.useGradients}
                  onChange={handleUseGradientsChange}
                />
              </FormControl>
              
              <Divider />
              
              {/* Accessibility */}
              <Heading size="sm">{t('common.accessibility')}</Heading>
              
              {/* Use Custom Scrollbar */}
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="use-custom-scrollbar" mb="0">
                  {t('common.useCustomScrollbar')}
                </FormLabel>
                <Switch
                  id="use-custom-scrollbar"
                  isChecked={themeSettings.useCustomScrollbar}
                  onChange={handleUseCustomScrollbarChange}
                />
              </FormControl>
              
              {/* Use Reduced Motion */}
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="use-reduced-motion" mb="0">
                  {t('settings.reducedMotion')}
                </FormLabel>
                <Switch
                  id="use-reduced-motion"
                  isChecked={themeSettings.useReducedMotion}
                  onChange={handleUseReducedMotionChange}
                />
              </FormControl>
              
              {/* Use High Contrast */}
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="use-high-contrast" mb="0">
                  {t('settings.highContrast')}
                </FormLabel>
                <Switch
                  id="use-high-contrast"
                  isChecked={themeSettings.useHighContrast}
                  onChange={handleUseHighContrastChange}
                />
              </FormControl>
            </VStack>
          </TabPanel>
          
          {/* Export/Import Tab */}
          <TabPanel>
            <VStack align="stretch" spacing={4}>
              {/* Export */}
              <Heading size="sm">{t('settings.exportSettings')}</Heading>
              <Button onClick={handleExport} colorScheme="blue">
                {t('settings.exportSettings')}
              </Button>
              {exportedSettings && (
                <Textarea
                  value={exportedSettings}
                  readOnly
                  rows={10}
                  fontFamily="mono"
                />
              )}
              
              <Divider />
              
              {/* Import */}
              <Heading size="sm">{t('settings.importSettings')}</Heading>
              <Textarea
                value={importSettings}
                onChange={(e) => setImportSettings(e.target.value)}
                placeholder={t('settings.importSettingsPlaceholder')}
                rows={10}
                fontFamily="mono"
              />
              <Button onClick={handleImport} colorScheme="blue">
                {t('settings.importSettings')}
              </Button>
              
              <Divider />
              
              {/* Reset */}
              <Heading size="sm">{t('settings.resetSettings')}</Heading>
              <Button onClick={handleReset} colorScheme="red">
                {t('settings.resetSettings')}
              </Button>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
  
  // Render as card
  if (asCard) {
    return (
      <Card className={className} style={style} {...glassStyle}>
        <CardHeader>
          <Heading size="md">{t('settings.theme')}</Heading>
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

export default ThemeSettings;
