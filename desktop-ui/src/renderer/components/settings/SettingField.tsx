import React from 'react';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Select,
  Switch,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  HStack,
  Box,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { useSettings } from './SettingsContext';
import { SettingDefinition, SettingValue } from './types';

// Setting field props
export interface SettingFieldProps {
  /**
   * Group ID
   */
  groupId: string;
  /**
   * Setting ID
   */
  settingId: string;
  /**
   * Setting definition
   */
  setting: SettingDefinition;
  /**
   * On change callback
   */
  onChange?: (groupId: string, settingId: string, value: SettingValue) => void;
}

/**
 * Setting field component
 */
const SettingField: React.FC<SettingFieldProps> = ({
  groupId,
  settingId,
  setting,
  onChange,
}) => {
  const { getSettingValue, setSettingValue } = useSettings();
  const { colorMode } = useColorMode();
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  // Get setting value
  const value = getSettingValue(groupId, settingId, setting.defaultValue);
  
  // Handle change
  const handleChange = (newValue: SettingValue) => {
    setSettingValue(groupId, settingId, newValue);
    
    if (onChange) {
      onChange(groupId, settingId, newValue);
    }
    
    if (setting.onChange) {
      setting.onChange(newValue, value);
    }
  };
  
  // Render field based on setting type
  const renderField = () => {
    switch (setting.type) {
      case 'string':
        return (
          <Input
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={setting.placeholder}
            isDisabled={setting.disabled}
          />
        );
      
      case 'number':
        return (
          <HStack spacing={4} width="100%">
            <NumberInput
              value={value as number}
              onChange={(_, valueAsNumber) => handleChange(valueAsNumber)}
              min={setting.min}
              max={setting.max}
              step={setting.step}
              isDisabled={setting.disabled}
              flex="1"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            
            {setting.unit && (
              <Text color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                {setting.unit}
              </Text>
            )}
            
            {setting.min !== undefined && setting.max !== undefined && (
              <Box width="50%" ml={4}>
                <Slider
                  value={value as number}
                  min={setting.min}
                  max={setting.max}
                  step={setting.step}
                  onChange={(val) => handleChange(val)}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  isDisabled={setting.disabled}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <Tooltip
                    hasArrow
                    bg="blue.500"
                    color="white"
                    placement="top"
                    isOpen={showTooltip}
                    label={`${value}${setting.unit ? ` ${setting.unit}` : ''}`}
                  >
                    <SliderThumb />
                  </Tooltip>
                </Slider>
              </Box>
            )}
          </HStack>
        );
      
      case 'boolean':
        return (
          <Switch
            isChecked={value as boolean}
            onChange={(e) => handleChange(e.target.checked)}
            isDisabled={setting.disabled}
            colorScheme="blue"
          />
        );
      
      case 'select':
        return (
          <Select
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            isDisabled={setting.disabled}
          >
            {setting.options?.map((option) => (
              <option key={option.value.toString()} value={option.value.toString()}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      
      case 'multiselect':
        return (
          <Box>
            {setting.options?.map((option) => (
              <Checkbox
                key={option.value.toString()}
                isChecked={(value as string[])?.includes(option.value.toString())}
                onChange={(e) => {
                  const currentValues = (value as string[]) || [];
                  const optionValue = option.value.toString();
                  
                  if (e.target.checked) {
                    handleChange([...currentValues, optionValue]);
                  } else {
                    handleChange(currentValues.filter((v) => v !== optionValue));
                  }
                }}
                isDisabled={setting.disabled || option.disabled}
                colorScheme="blue"
                mb={2}
              >
                {option.label}
              </Checkbox>
            ))}
          </Box>
        );
      
      case 'color':
        return (
          <HStack spacing={4}>
            <Input
              type="color"
              value={value as string}
              onChange={(e) => handleChange(e.target.value)}
              isDisabled={setting.disabled}
              width="100px"
            />
            <Input
              value={value as string}
              onChange={(e) => handleChange(e.target.value)}
              isDisabled={setting.disabled}
              placeholder="#RRGGBB"
            />
          </HStack>
        );
      
      default:
        return (
          <Text color="red.500">
            Unknown setting type: {setting.type}
          </Text>
        );
    }
  };
  
  return (
    <FormControl
      isDisabled={setting.disabled}
      mb={4}
      opacity={setting.disabled ? 0.6 : 1}
    >
      <HStack mb={2} justify="space-between">
        <FormLabel mb={0}>
          <HStack spacing={2}>
            {setting.icon && (
              <Box fontSize="lg">{setting.icon}</Box>
            )}
            <Text>{setting.label}</Text>
          </HStack>
        </FormLabel>
        
        {setting.type === 'boolean' && renderField()}
      </HStack>
      
      {setting.description && (
        <FormHelperText mt={0} mb={2}>
          {setting.description}
        </FormHelperText>
      )}
      
      {setting.type !== 'boolean' && renderField()}
      
      {setting.helpText && (
        <FormHelperText mt={2}>
          {setting.helpText}
        </FormHelperText>
      )}
      
      {(setting.requiresRestart || setting.requiresReload) && (
        <FormHelperText mt={2} color="orange.500">
          {setting.requiresRestart
            ? 'Requires restart to take effect'
            : 'Requires reload to take effect'}
        </FormHelperText>
      )}
      
      {setting.advanced && (
        <FormHelperText mt={2} color="purple.500">
          Advanced setting
        </FormHelperText>
      )}
      
      {setting.experimental && (
        <FormHelperText mt={2} color="orange.500">
          Experimental feature
        </FormHelperText>
      )}
      
      {setting.deprecated && (
        <FormHelperText mt={2} color="red.500">
          Deprecated setting
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default SettingField;
