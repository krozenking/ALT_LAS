import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FiGlobe } from 'react-icons/fi';
import { Language } from '../../hooks/useTranslation';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange
}) => {
  const menuBg = useColorModeValue('white', 'gray.700');
  const menuBorderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.100', 'gray.600');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  
  // Dil seçenekleri
  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];
  
  // Mevcut dil
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];
  
  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        leftIcon={<FiGlobe />}
        size="sm"
        variant="ghost"
        px={2}
      >
        <Flex align="center">
          <Text fontSize="sm" mr={1}>{currentLang.flag}</Text>
          <Text display={{ base: 'none', md: 'block' }} fontSize="sm">{currentLang.name}</Text>
        </Flex>
      </MenuButton>
      
      <MenuList
        bg={menuBg}
        borderColor={menuBorderColor}
        minW="150px"
        zIndex={10}
      >
        {languages.map(lang => (
          <MenuItem
            key={lang.code}
            onClick={() => onLanguageChange(lang.code as Language)}
            bg={lang.code === currentLanguage ? activeBg : 'transparent'}
            _hover={{ bg: hoverBg }}
          >
            <Flex align="center">
              <Text mr={2}>{lang.flag}</Text>
              <Text>{lang.name}</Text>
            </Flex>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default LanguageSelector;
