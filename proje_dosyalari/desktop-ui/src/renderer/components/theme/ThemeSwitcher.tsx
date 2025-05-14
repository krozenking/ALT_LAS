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
  Icon,
  HStack,
} from '@chakra-ui/react';
import { useThemeContext } from '../../providers/ThemeProvider';
import { ThemeType, ThemeVariant } from '../../styles/themes/types';
import { useTranslation } from 'react-i18next';

export interface ThemeSwitcherProps {
  /**
   * Whether to show theme types
   */
  showTypes?: boolean;
  /**
   * Whether to show theme variants
   */
  showVariants?: boolean;
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
 * Theme switcher component
 */
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  showTypes = true,
  showVariants = true,
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
    themeSettings,
    setThemeType,
    setThemeVariant,
    toggleColorMode,
    availableThemeTypes,
    availableThemeVariants,
  } = useThemeContext();

  // Get theme type icon
  const getThemeTypeIcon = (type: ThemeType) => {
    switch (type) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '🖥️';
      case 'custom':
        return '🎨';
      default:
        return '☀️';
    }
  };

  // Get theme variant icon
  const getThemeVariantIcon = (variant: ThemeVariant) => {
    switch (variant) {
      case 'default':
        return '🔵';
      case 'blue':
        return '🔷';
      case 'green':
        return '🟢';
      case 'purple':
        return '🟣';
      case 'orange':
        return '🟠';
      case 'red':
        return '🔴';
      case 'teal':
        return '🧊';
      case 'gray':
        return '⚪';
      case 'custom':
        return '🎨';
      default:
        return '🔵';
    }
  };

  // Get theme type name
  const getThemeTypeName = (type: ThemeType) => {
    switch (type) {
      case 'light':
        return t('settings.lightMode');
      case 'dark':
        return t('settings.darkMode');
      case 'system':
        return t('settings.systemMode');
      case 'custom':
        return t('common.custom');
      default:
        return type;
    }
  };

  // Get theme variant name
  const getThemeVariantName = (variant: ThemeVariant) => {
    switch (variant) {
      case 'default':
        return t('common.default');
      case 'custom':
        return t('common.custom');
      default:
        return t(`common.${variant}`);
    }
  };

  // Handle theme type change
  const handleThemeTypeChange = (type: ThemeType) => {
    setThemeType(type);
  };

  // Handle theme variant change
  const handleThemeVariantChange = (variant: ThemeVariant) => {
    setThemeVariant(variant);
  };

  // Render theme item
  const renderThemeItem = (
    icon: string,
    name: string,
    isActive: boolean
  ) => {
    return (
      <Flex align="center">
        <Text fontSize={size} mr={2}>
          {icon}
        </Text>
        <Text>
          {name}
        </Text>
      </Flex>
    );
  };

  // Render as button
  if (asButton) {
    return (
      <Menu>
        <Tooltip
          label={t('settings.theme')}
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
            <HStack>
              <Text fontSize={size}>
                {getThemeTypeIcon(themeSettings.type)}
              </Text>
              {showVariants && (
                <Text fontSize={size}>
                  {getThemeVariantIcon(themeSettings.variant)}
                </Text>
              )}
            </HStack>
          </MenuButton>
        </Tooltip>
        <MenuList>
          {showTypes && (
            <>
              <Text px={3} py={1} fontSize="sm" fontWeight="bold">
                {t('settings.theme')}
              </Text>
              {availableThemeTypes.map(type => (
                <MenuItem
                  key={type}
                  onClick={() => handleThemeTypeChange(type)}
                  bg={
                    type === themeSettings.type
                      ? colorMode === 'light'
                        ? 'gray.100'
                        : 'gray.700'
                      : undefined
                  }
                >
                  {renderThemeItem(
                    getThemeTypeIcon(type),
                    getThemeTypeName(type),
                    type === themeSettings.type
                  )}
                </MenuItem>
              ))}
            </>
          )}
          
          {showTypes && showVariants && (
            <Box px={3} py={1}>
              <hr />
            </Box>
          )}
          
          {showVariants && (
            <>
              <Text px={3} py={1} fontSize="sm" fontWeight="bold">
                {t('common.variant')}
              </Text>
              {availableThemeVariants.map(variant => (
                <MenuItem
                  key={variant}
                  onClick={() => handleThemeVariantChange(variant)}
                  bg={
                    variant === themeSettings.variant
                      ? colorMode === 'light'
                        ? 'gray.100'
                        : 'gray.700'
                      : undefined
                  }
                >
                  {renderThemeItem(
                    getThemeVariantIcon(variant),
                    getThemeVariantName(variant),
                    variant === themeSettings.variant
                  )}
                </MenuItem>
              ))}
            </>
          )}
        </MenuList>
      </Menu>
    );
  }

  // Render as simple component
  return (
    <Flex className={className} style={style}>
      {showTypes && (
        <Box mr={4}>
          <Text fontSize="sm" fontWeight="bold" mb={2}>
            {t('settings.theme')}
          </Text>
          <Flex>
            {availableThemeTypes.map(type => (
              <Box
                key={type}
                as="button"
                mx={1}
                p={1}
                borderRadius="md"
                onClick={() => handleThemeTypeChange(type)}
                bg={
                  type === themeSettings.type
                    ? colorMode === 'light'
                      ? 'gray.100'
                      : 'gray.700'
                    : undefined
                }
                _hover={{
                  bg: colorMode === 'light' ? 'gray.200' : 'gray.600',
                }}
              >
                <Tooltip
                  label={getThemeTypeName(type)}
                  isDisabled={!showTooltip}
                >
                  <Text fontSize={size}>
                    {getThemeTypeIcon(type)}
                  </Text>
                </Tooltip>
              </Box>
            ))}
          </Flex>
        </Box>
      )}
      
      {showVariants && (
        <Box>
          <Text fontSize="sm" fontWeight="bold" mb={2}>
            {t('common.variant')}
          </Text>
          <Flex>
            {availableThemeVariants.map(variant => (
              <Box
                key={variant}
                as="button"
                mx={1}
                p={1}
                borderRadius="md"
                onClick={() => handleThemeVariantChange(variant)}
                bg={
                  variant === themeSettings.variant
                    ? colorMode === 'light'
                      ? 'gray.100'
                      : 'gray.700'
                    : undefined
                }
                _hover={{
                  bg: colorMode === 'light' ? 'gray.200' : 'gray.600',
                }}
              >
                <Tooltip
                  label={getThemeVariantName(variant)}
                  isDisabled={!showTooltip}
                >
                  <Text fontSize={size}>
                    {getThemeVariantIcon(variant)}
                  </Text>
                </Tooltip>
              </Box>
            ))}
          </Flex>
        </Box>
      )}
    </Flex>
  );
};

export default ThemeSwitcher;
