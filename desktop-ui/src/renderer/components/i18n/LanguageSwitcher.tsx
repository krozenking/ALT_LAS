import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
  Text,
  useColorMode,
  Box,
  Tooltip,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useLanguage from '../../hooks/useLanguage';

export interface LanguageSwitcherProps {
  /**
   * Whether to show language flags
   */
  showFlags?: boolean;
  /**
   * Whether to show language names
   */
  showNames?: boolean;
  /**
   * Whether to show as a button
   */
  asButton?: boolean;
  /**
   * Button size
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /**
   * Button variant
   */
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  /**
   * Button color scheme
   */
  colorScheme?: string;
  /**
   * Whether to show tooltip
   */
  showTooltip?: boolean;
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
 * Language switcher component
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  showFlags = true,
  showNames = true,
  asButton = true,
  size = 'md',
  variant = 'ghost',
  colorScheme = 'gray',
  showTooltip = true,
  className,
  style,
}) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const {
    currentLanguage,
    availableLanguages,
    changeLanguage,
    getLanguageName,
  } = useLanguage();

  // Handle language change
  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
  };

  // Render language item
  const renderLanguageItem = (language: { code: string; name: string; flag?: string }) => {
    return (
      <Flex align="center">
        {showFlags && language.flag && (
          <Text fontSize={size} mr={showNames ? 2 : 0}>
            {language.flag}
          </Text>
        )}
        {showNames && (
          <Text>
            {getLanguageName(language.code)}
          </Text>
        )}
      </Flex>
    );
  };

  // Render as button
  if (asButton) {
    return (
      <Menu>
        <Tooltip
          label={t('settings.language')}
          isDisabled={!showTooltip}
          placement="bottom"
        >
          <MenuButton
            as={Button}
            size={size}
            variant={variant}
            colorScheme={colorScheme}
            className={className}
            style={style}
          >
            {renderLanguageItem(currentLanguage)}
          </MenuButton>
        </Tooltip>
        <MenuList>
          {availableLanguages.map(language => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              bg={
                language.code === currentLanguage.code
                  ? colorMode === 'light'
                    ? 'gray.100'
                    : 'gray.700'
                  : undefined
              }
            >
              {renderLanguageItem(language)}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    );
  }

  // Render as simple component
  return (
    <Flex className={className} style={style}>
      {availableLanguages.map(language => (
        <Box
          key={language.code}
          as="button"
          mx={1}
          p={1}
          borderRadius="md"
          onClick={() => handleLanguageChange(language.code)}
          bg={
            language.code === currentLanguage.code
              ? colorMode === 'light'
                ? 'gray.100'
                : 'gray.700'
              : undefined
          }
          _hover={{
            bg: colorMode === 'light' ? 'gray.200' : 'gray.600',
          }}
        >
          {renderLanguageItem(language)}
        </Box>
      ))}
    </Flex>
  );
};

export default LanguageSwitcher;
