import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  useColorModeValue,
  VStack
} from '@chakra-ui/react';
import { useThemeCustomization, ThemeColors } from '../../hooks/useThemeCustomization';
import useTranslation from '../../hooks/useTranslation';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

// Renk seçici bileşeni
const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => {
  return (
    <FormControl>
      <Flex align="center" mb={2}>
        <FormLabel mb={0} fontSize="sm" flex="1">
          {label}
        </FormLabel>
        <Tooltip label={color}>
          <Box
            w="24px"
            h="24px"
            borderRadius="md"
            bg={color}
            mr={2}
            borderWidth="1px"
            borderColor="gray.300"
          />
        </Tooltip>
        <Input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          width="80px"
          height="30px"
          p={1}
          borderRadius="md"
        />
      </Flex>
    </FormControl>
  );
};

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tema özelleştirici bileşeni
const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ isOpen, onClose }) => {
  const { 
    themeSettings, 
    updateColors, 
    updateSettings, 
    resetTheme,
    predefinedThemes,
    applyPredefinedTheme
  } = useThemeCustomization();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState(0);
  
  // Renk değişkenleri
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Renk güncelleme işlevi
  const handleColorChange = (colorKey: keyof ThemeColors | string, value: string) => {
    // Nested renk değerleri için (background.light gibi)
    if (colorKey.includes('.')) {
      const [parent, child] = colorKey.split('.');
      updateColors({
        [parent]: {
          ...themeSettings.colors[parent as keyof ThemeColors],
          [child]: value
        }
      } as any);
    } else {
      updateColors({ [colorKey]: value } as any);
    }
  };
  
  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="md"
    >
      <DrawerOverlay />
      <DrawerContent bg={bgColor}>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
          {t('theme.customizer')}
        </DrawerHeader>

        <DrawerBody>
          <Tabs 
            isFitted 
            variant="enclosed" 
            colorScheme="blue" 
            index={activeTab} 
            onChange={setActiveTab}
          >
            <TabList mb="1em">
              <Tab>{t('theme.presets')}</Tab>
              <Tab>{t('theme.colors')}</Tab>
              <Tab>{t('theme.typography')}</Tab>
              <Tab>{t('theme.layout')}</Tab>
            </TabList>
            
            <TabPanels>
              {/* Hazır Temalar Sekmesi */}
              <TabPanel>
                <Text mb={4}>{t('theme.presetsDescription')}</Text>
                
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  {Object.entries(predefinedThemes).map(([name, theme]) => (
                    <Box
                      key={name}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={borderColor}
                      overflow="hidden"
                      cursor="pointer"
                      onClick={() => applyPredefinedTheme(name as any)}
                      _hover={{ boxShadow: 'md' }}
                    >
                      <Box 
                        h="80px" 
                        bg={theme.colors.primary} 
                        position="relative"
                        p={3}
                      >
                        <Flex 
                          position="absolute" 
                          bottom={3} 
                          left={3}
                          direction="column"
                        >
                          <Text 
                            color="white" 
                            fontWeight="bold" 
                            textShadow="0 1px 2px rgba(0,0,0,0.4)"
                          >
                            {name.charAt(0).toUpperCase() + name.slice(1)}
                          </Text>
                        </Flex>
                        
                        <Flex position="absolute" top={3} right={3}>
                          <Box w="15px" h="15px" borderRadius="full" bg={theme.colors.primary} mr={1} />
                          <Box w="15px" h="15px" borderRadius="full" bg={theme.colors.secondary} mr={1} />
                          <Box w="15px" h="15px" borderRadius="full" bg={theme.colors.accent} />
                        </Flex>
                      </Box>
                      
                      <Box p={3} bg={theme.colors.background.light}>
                        <Text fontSize="xs" color={theme.colors.text.light}>
                          {t('theme.presetSample')}
                        </Text>
                      </Box>
                    </Box>
                  ))}
                </Grid>
              </TabPanel>
              
              {/* Renkler Sekmesi */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontWeight="bold" mb={2}>{t('theme.primaryColors')}</Text>
                  
                  <ColorPicker
                    color={themeSettings.colors.primary}
                    onChange={(value) => handleColorChange('primary', value)}
                    label={t('theme.primary')}
                  />
                  
                  <ColorPicker
                    color={themeSettings.colors.secondary}
                    onChange={(value) => handleColorChange('secondary', value)}
                    label={t('theme.secondary')}
                  />
                  
                  <ColorPicker
                    color={themeSettings.colors.accent}
                    onChange={(value) => handleColorChange('accent', value)}
                    label={t('theme.accent')}
                  />
                  
                  <Text fontWeight="bold" mt={4} mb={2}>{t('theme.statusColors')}</Text>
                  
                  <ColorPicker
                    color={themeSettings.colors.success}
                    onChange={(value) => handleColorChange('success', value)}
                    label={t('theme.success')}
                  />
                  
                  <ColorPicker
                    color={themeSettings.colors.error}
                    onChange={(value) => handleColorChange('error', value)}
                    label={t('theme.error')}
                  />
                  
                  <ColorPicker
                    color={themeSettings.colors.warning}
                    onChange={(value) => handleColorChange('warning', value)}
                    label={t('theme.warning')}
                  />
                  
                  <ColorPicker
                    color={themeSettings.colors.info}
                    onChange={(value) => handleColorChange('info', value)}
                    label={t('theme.info')}
                  />
                  
                  <Text fontWeight="bold" mt={4} mb={2}>{t('theme.lightMode')}</Text>
                  
                  <ColorPicker
                    color={themeSettings.colors.background.light}
                    onChange={(value) => handleColorChange('background.light', value)}
                    label={t('theme.background')}
                  />
                  
                  <ColorPicker
                    color={themeSettings.colors.text.light}
                    onChange={(value) => handleColorChange('text.light', value)}
                    label={t('theme.text')}
                  />
                  
                  <Text fontWeight="bold" mt={4} mb={2}>{t('theme.darkMode')}</Text>
                  
                  <ColorPicker
                    color={themeSettings.colors.background.dark}
                    onChange={(value) => handleColorChange('background.dark', value)}
                    label={t('theme.background')}
                  />
                  
                  <ColorPicker
                    color={themeSettings.colors.text.dark}
                    onChange={(value) => handleColorChange('text.dark', value)}
                    label={t('theme.text')}
                  />
                </VStack>
              </TabPanel>
              
              {/* Tipografi Sekmesi */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>{t('theme.fontSize')}</FormLabel>
                    <RadioGroup
                      value={themeSettings.fontSize}
                      onChange={(value) => updateSettings({ fontSize: value as any })}
                    >
                      <HStack spacing={4}>
                        <Radio value="sm">{t('theme.small')}</Radio>
                        <Radio value="md">{t('theme.medium')}</Radio>
                        <Radio value="lg">{t('theme.large')}</Radio>
                      </HStack>
                    </RadioGroup>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>{t('theme.fontFamily')}</FormLabel>
                    <Select
                      value={themeSettings.fontFamily}
                      onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                    >
                      <option value="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
                        {t('theme.systemDefault')}
                      </option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                      <option value="'Open Sans', sans-serif">Open Sans</option>
                      <option value="'Lato', sans-serif">Lato</option>
                      <option value="'Montserrat', sans-serif">Montserrat</option>
                      <option value="'Courier New', monospace">Courier New</option>
                    </Select>
                  </FormControl>
                </VStack>
              </TabPanel>
              
              {/* Düzen Sekmesi */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>{t('theme.borderRadius')}</FormLabel>
                    <RadioGroup
                      value={themeSettings.borderRadius}
                      onChange={(value) => updateSettings({ borderRadius: value as any })}
                    >
                      <HStack spacing={4}>
                        <Radio value="none">{t('theme.none')}</Radio>
                        <Radio value="sm">{t('theme.small')}</Radio>
                        <Radio value="md">{t('theme.medium')}</Radio>
                        <Radio value="lg">{t('theme.large')}</Radio>
                        <Radio value="xl">{t('theme.extraLarge')}</Radio>
                      </HStack>
                    </RadioGroup>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>{t('theme.density')}</FormLabel>
                    <RadioGroup
                      value={themeSettings.density}
                      onChange={(value) => updateSettings({ density: value as any })}
                    >
                      <HStack spacing={4}>
                        <Radio value="compact">{t('theme.compact')}</Radio>
                        <Radio value="comfortable">{t('theme.comfortable')}</Radio>
                        <Radio value="spacious">{t('theme.spacious')}</Radio>
                      </HStack>
                    </RadioGroup>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="animations" mb="0">
                      {t('theme.animations')}
                    </FormLabel>
                    <Switch
                      id="animations"
                      isChecked={themeSettings.animations}
                      onChange={(e) => updateSettings({ animations: e.target.checked })}
                    />
                  </FormControl>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button variant="outline" mr={3} onClick={resetTheme}>
            {t('theme.resetToDefault')}
          </Button>
          <Button colorScheme="blue" onClick={onClose}>
            {t('common.close')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ThemeCustomizer;
