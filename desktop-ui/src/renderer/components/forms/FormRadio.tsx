import React, { useRef, useEffect } from 'react';
import {
  Radio,
  RadioGroup,
  Stack,
  RadioProps,
  RadioGroupProps,
  StackProps,
  useColorMode,
} from '@chakra-ui/react';
import { useFormContext } from '../../contexts/FormContext';
import FormField, { FormFieldProps } from './FormField';

export interface RadioOption {
  /**
   * Option value
   */
  value: string;
  /**
   * Option label
   */
  label: string;
  /**
   * Whether the option is disabled
   */
  disabled?: boolean;
  /**
   * Option description
   */
  description?: string;
  /**
   * Option icon
   */
  icon?: React.ReactNode;
  /**
   * Option color
   */
  color?: string;
  /**
   * Option background color
   */
  backgroundColor?: string;
  /**
   * Option data
   */
  data?: any;
}

export interface FormRadioProps extends Omit<FormFieldProps, 'children'> {
  /**
   * Radio props
   */
  radioProps?: RadioProps;
  /**
   * Radio group props
   */
  radioGroupProps?: RadioGroupProps;
  /**
   * Stack props
   */
  stackProps?: StackProps;
  /**
   * Options
   */
  options?: RadioOption[];
  /**
   * Default value
   */
  defaultValue?: string;
  /**
   * Value
   */
  value?: string;
  /**
   * On change callback
   */
  onChange?: (value: string) => void;
  /**
   * Whether to disable
   */
  disabled?: boolean;
  /**
   * Whether to make readonly
   */
  readOnly?: boolean;
  /**
   * Whether to make required
   */
  isRequired?: boolean;
  /**
   * Whether to make invalid
   */
  isInvalid?: boolean;
  /**
   * Size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Color scheme
   */
  colorScheme?: string;
  /**
   * ID
   */
  id?: string;
  /**
   * Stack direction
   */
  direction?: 'row' | 'column';
  /**
   * Stack spacing
   */
  spacing?: number;
  /**
   * Whether to wrap
   */
  wrap?: boolean;
  /**
   * Whether to use custom icon
   */
  useCustomIcon?: boolean;
  /**
   * Custom icon
   */
  customIcon?: React.ReactNode;
  /**
   * Custom checked icon
   */
  customCheckedIcon?: React.ReactNode;
  /**
   * Custom unchecked icon
   */
  customUncheckedIcon?: React.ReactNode;
  /**
   * Whether to use button style
   */
  useButton?: boolean;
  /**
   * Whether to use card style
   */
  useCard?: boolean;
  /**
   * Whether to use list style
   */
  useList?: boolean;
  /**
   * Whether to use grid style
   */
  useGrid?: boolean;
  /**
   * Whether to use inline style
   */
  useInline?: boolean;
  /**
   * Whether to use block style
   */
  useBlock?: boolean;
  /**
   * Whether to use flex style
   */
  useFlex?: boolean;
  /**
   * Whether to use stack style
   */
  useStack?: boolean;
  /**
   * Whether to use wrap style
   */
  useWrap?: boolean;
  /**
   * Whether to use reverse style
   */
  useReverse?: boolean;
  /**
   * Whether to use spacing
   */
  useSpacing?: boolean;
  /**
   * Whether to use padding
   */
  usePadding?: boolean;
  /**
   * Padding
   */
  padding?: number;
  /**
   * Whether to use margin
   */
  useMargin?: boolean;
  /**
   * Margin
   */
  margin?: number;
  /**
   * Whether to use border
   */
  useBorder?: boolean;
  /**
   * Border
   */
  border?: string;
  /**
   * Whether to use border radius
   */
  useBorderRadius?: boolean;
  /**
   * Border radius
   */
  borderRadius?: string;
  /**
   * Whether to use shadow
   */
  useShadow?: boolean;
  /**
   * Shadow
   */
  shadow?: string;
  /**
   * Whether to use background
   */
  useBackground?: boolean;
  /**
   * Background
   */
  background?: string;
  /**
   * Whether to use color
   */
  useColor?: boolean;
  /**
   * Color
   */
  color?: string;
  /**
   * Whether to use font
   */
  useFont?: boolean;
  /**
   * Font
   */
  font?: string;
  /**
   * Whether to use font size
   */
  useFontSize?: boolean;
  /**
   * Font size
   */
  fontSize?: string;
  /**
   * Whether to use font weight
   */
  useFontWeight?: boolean;
  /**
   * Font weight
   */
  fontWeight?: string;
  /**
   * Whether to use line height
   */
  useLineHeight?: boolean;
  /**
   * Line height
   */
  lineHeight?: string;
  /**
   * Whether to use text align
   */
  useTextAlign?: boolean;
  /**
   * Text align
   */
  textAlign?: string;
  /**
   * Whether to use text transform
   */
  useTextTransform?: boolean;
  /**
   * Text transform
   */
  textTransform?: string;
  /**
   * Whether to use text decoration
   */
  useTextDecoration?: boolean;
  /**
   * Text decoration
   */
  textDecoration?: string;
  /**
   * Whether to use text overflow
   */
  useTextOverflow?: boolean;
  /**
   * Text overflow
   */
  textOverflow?: string;
  /**
   * Whether to use white space
   */
  useWhiteSpace?: boolean;
  /**
   * White space
   */
  whiteSpace?: string;
  /**
   * Whether to use word break
   */
  useWordBreak?: boolean;
  /**
   * Word break
   */
  wordBreak?: string;
  /**
   * Whether to use word wrap
   */
  useWordWrap?: boolean;
  /**
   * Word wrap
   */
  wordWrap?: string;
  /**
   * Whether to use overflow
   */
  useOverflow?: boolean;
  /**
   * Overflow
   */
  overflow?: string;
  /**
   * Whether to use position
   */
  usePosition?: boolean;
  /**
   * Position
   */
  position?: string;
  /**
   * Whether to use top
   */
  useTop?: boolean;
  /**
   * Top
   */
  top?: string;
  /**
   * Whether to use right
   */
  useRight?: boolean;
  /**
   * Right
   */
  right?: string;
  /**
   * Whether to use bottom
   */
  useBottom?: boolean;
  /**
   * Bottom
   */
  bottom?: string;
  /**
   * Whether to use left
   */
  useLeft?: boolean;
  /**
   * Left
   */
  left?: string;
  /**
   * Whether to use z-index
   */
  useZIndex?: boolean;
  /**
   * Z-index
   */
  zIndex?: string;
  /**
   * Whether to use opacity
   */
  useOpacity?: boolean;
  /**
   * Opacity
   */
  opacity?: string;
  /**
   * Whether to use cursor
   */
  useCursor?: boolean;
  /**
   * Cursor
   */
  cursor?: string;
  /**
   * Whether to use pointer events
   */
  usePointerEvents?: boolean;
  /**
   * Pointer events
   */
  pointerEvents?: string;
  /**
   * Whether to use user select
   */
  useUserSelect?: boolean;
  /**
   * User select
   */
  userSelect?: string;
  /**
   * Whether to use visibility
   */
  useVisibility?: boolean;
  /**
   * Visibility
   */
  visibility?: string;
  /**
   * Whether to use display
   */
  useDisplay?: boolean;
  /**
   * Display
   */
  display?: string;
}

/**
 * Form radio component
 */
export const FormRadio: React.FC<FormRadioProps> = ({
  name,
  radioProps = {},
  radioGroupProps = {},
  stackProps = {},
  options = [],
  defaultValue,
  value,
  onChange,
  disabled,
  readOnly,
  isRequired,
  isInvalid,
  size,
  colorScheme,
  id,
  direction = 'column',
  spacing = 2,
  wrap = false,
  ...rest
}) => {
  const form = useFormContext();
  const { colorMode } = useColorMode();
  
  // Get field props
  const fieldProps = form.getFieldProps(name);
  
  // Handle radio change
  const handleChange = (value: string) => {
    // Call onChange callback if provided
    if (onChange) {
      onChange(value);
    }
    
    // Update form field value
    form.setFieldValue(name, value);
    
    // Update form field touched state
    form.setFieldTouched(name, true);
  };
  
  return (
    <FormField name={name} {...rest}>
      <RadioGroup
        name={name}
        value={value !== undefined ? value : fieldProps.value || ''}
        defaultValue={defaultValue}
        onChange={handleChange}
        isDisabled={disabled || fieldProps.disabled}
        isReadOnly={readOnly || fieldProps.readonly}
        isRequired={isRequired || fieldProps.required}
        colorScheme={colorScheme}
        size={size}
        {...radioGroupProps}
      >
        <Stack
          direction={direction}
          spacing={spacing}
          wrap={wrap ? 'wrap' : 'nowrap'}
          {...stackProps}
        >
          {options.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              isDisabled={option.disabled}
              {...radioProps}
            >
              {option.label}
            </Radio>
          ))}
        </Stack>
      </RadioGroup>
    </FormField>
  );
};

export default FormRadio;
