import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  useColorMode,
  Flex,
  Text,
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  FormControl,
  FormLabel,
  useColorModeValue
} from '@chakra-ui/react';
import { FiType, FiEye, FiZap } from 'react-icons/fi';
import useTranslation from '../../hooks/useTranslation';

interface AccessibilityMenuProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  highContrast: boolean;
  onHighContrastChange: (enabled: boolean) => void;
  reduceMotion: boolean;
  onReduceMotionChange: (enabled: boolean) => void;
  screenReaderMode: boolean;
  onScreenReaderModeChange: (enabled: boolean) => void;
}

const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({
  fontSize,
  onFontSizeChange,
  highContrast,
  onHighContrastChange,
  reduceMotion,
  onReduceMotionChange,
  screenReaderMode,
  onScreenReaderModeChange
}) => {
  const { t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  
  const menuBg = useColorModeValue('white', 'gray.700');
  const menuBorderColor = useColorModeValue('gray.200', 'gray.600');
  const sliderBg = useColorModeValue('blue.500', 'blue.200');
  
  return (
    <Menu closeOnSelect={false}>
      <MenuButton
        as={Button}
        aria-label={t('accessibility.title')}
        leftIcon={<FiEye />}
        size="sm"
        variant="ghost"
      >
        <Text display={{ base: 'none', md: 'block' }}>
          {t('accessibility.title')}
        </Text>
      </MenuButton>
      
      <MenuList
        bg={menuBg}
        borderColor={menuBorderColor}
        minW="260px"
        zIndex={10}
        p={3}
      >
        <Text fontWeight="bold" mb={2}>
          {t('accessibility.title')}
        </Text>
        
        {/* Yazı Boyutu */}
        <Box mb={4}>
          <Flex align="center" mb={1}>
            <FiType />
            <Text ml={2} fontSize="sm">
              {t('accessibility.fontSize')}
            </Text>
          </Flex>
          <Flex align="center">
            <Text fontSize="xs">A</Text>
            <Slider
              aria-label={t('accessibility.fontSize')}
              defaultValue={fontSize}
              min={12}
              max={24}
              step={1}
              onChange={onFontSizeChange}
              mx={2}
              colorScheme="blue"
            >
              <SliderTrack>
                <SliderFilledTrack bg={sliderBg} />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            <Text fontSize="md">A</Text>
          </Flex>
        </Box>
        
        <MenuDivider />
        
        {/* Yüksek Kontrast */}
        <FormControl display="flex" alignItems="center" mb={3}>
          <FormLabel htmlFor="high-contrast" mb="0" fontSize="sm" flex="1">
            {t('accessibility.highContrast')}
          </FormLabel>
          <Switch
            id="high-contrast"
            isChecked={highContrast}
            onChange={(e) => onHighContrastChange(e.target.checked)}
            colorScheme="blue"
          />
        </FormControl>
        
        {/* Hareketi Azalt */}
        <FormControl display="flex" alignItems="center" mb={3}>
          <FormLabel htmlFor="reduce-motion" mb="0" fontSize="sm" flex="1">
            {t('accessibility.reduceMotion')}
          </FormLabel>
          <Switch
            id="reduce-motion"
            isChecked={reduceMotion}
            onChange={(e) => onReduceMotionChange(e.target.checked)}
            colorScheme="blue"
          />
        </FormControl>
        
        {/* Ekran Okuyucu Modu */}
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="screen-reader" mb="0" fontSize="sm" flex="1">
            {t('accessibility.screenReader')}
          </FormLabel>
          <Switch
            id="screen-reader"
            isChecked={screenReaderMode}
            onChange={(e) => onScreenReaderModeChange(e.target.checked)}
            colorScheme="blue"
          />
        </FormControl>
        
        <MenuDivider my={3} />
        
        {/* Tema Değiştirme */}
        <MenuItem
          onClick={toggleColorMode}
          icon={<FiZap />}
          closeOnSelect={false}
        >
          {colorMode === 'light' 
            ? t('accessibility.darkMode') 
            : t('accessibility.lightMode')}
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default AccessibilityMenu;
