import React, { useRef, useEffect } from 'react';
import {
  Checkbox,
  CheckboxProps,
  useColorMode,
} from '@chakra-ui/react';
import { useFormContext } from '../../contexts/FormContext';
import FormField, { FormFieldProps } from './FormField';

export interface FormCheckboxProps extends Omit<FormFieldProps, 'children'> {
  /**
   * Checkbox props
   */
  checkboxProps?: CheckboxProps;
  /**
   * Checkbox label
   */
  checkboxLabel?: React.ReactNode;
  /**
   * Default checked
   */
  defaultChecked?: boolean;
  /**
   * Checked
   */
  checked?: boolean;
  /**
   * On change callback
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * On blur callback
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /**
   * On focus callback
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /**
   * Whether to auto focus
   */
  autoFocus?: boolean;
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
   * Whether to use indeterminate state
   */
  isIndeterminate?: boolean;
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
   * Custom indeterminate icon
   */
  customIndeterminateIcon?: React.ReactNode;
  /**
   * Whether to use switch style
   */
  useSwitch?: boolean;
  /**
   * Whether to use toggle style
   */
  useToggle?: boolean;
  /**
   * Whether to use radio style
   */
  useRadio?: boolean;
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
   * Spacing
   */
  spacing?: number;
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
  /**
   * Whether to use flex direction
   */
  useFlexDirection?: boolean;
  /**
   * Flex direction
   */
  flexDirection?: string;
  /**
   * Whether to use flex wrap
   */
  useFlexWrap?: boolean;
  /**
   * Flex wrap
   */
  flexWrap?: string;
  /**
   * Whether to use flex grow
   */
  useFlexGrow?: boolean;
  /**
   * Flex grow
   */
  flexGrow?: string;
  /**
   * Whether to use flex shrink
   */
  useFlexShrink?: boolean;
  /**
   * Flex shrink
   */
  flexShrink?: string;
  /**
   * Whether to use flex basis
   */
  useFlexBasis?: boolean;
  /**
   * Flex basis
   */
  flexBasis?: string;
  /**
   * Whether to use justify content
   */
  useJustifyContent?: boolean;
  /**
   * Justify content
   */
  justifyContent?: string;
  /**
   * Whether to use align items
   */
  useAlignItems?: boolean;
  /**
   * Align items
   */
  alignItems?: string;
  /**
   * Whether to use align content
   */
  useAlignContent?: boolean;
  /**
   * Align content
   */
  alignContent?: string;
  /**
   * Whether to use align self
   */
  useAlignSelf?: boolean;
  /**
   * Align self
   */
  alignSelf?: string;
  /**
   * Whether to use order
   */
  useOrder?: boolean;
  /**
   * Order
   */
  order?: string;
  /**
   * Whether to use grid template columns
   */
  useGridTemplateColumns?: boolean;
  /**
   * Grid template columns
   */
  gridTemplateColumns?: string;
  /**
   * Whether to use grid template rows
   */
  useGridTemplateRows?: boolean;
  /**
   * Grid template rows
   */
  gridTemplateRows?: string;
  /**
   * Whether to use grid template areas
   */
  useGridTemplateAreas?: boolean;
  /**
   * Grid template areas
   */
  gridTemplateAreas?: string;
  /**
   * Whether to use grid auto columns
   */
  useGridAutoColumns?: boolean;
  /**
   * Grid auto columns
   */
  gridAutoColumns?: string;
  /**
   * Whether to use grid auto rows
   */
  useGridAutoRows?: boolean;
  /**
   * Grid auto rows
   */
  gridAutoRows?: string;
  /**
   * Whether to use grid auto flow
   */
  useGridAutoFlow?: boolean;
  /**
   * Grid auto flow
   */
  gridAutoFlow?: string;
  /**
   * Whether to use grid column
   */
  useGridColumn?: boolean;
  /**
   * Grid column
   */
  gridColumn?: string;
  /**
   * Whether to use grid row
   */
  useGridRow?: boolean;
  /**
   * Grid row
   */
  gridRow?: string;
  /**
   * Whether to use grid area
   */
  useGridArea?: boolean;
  /**
   * Grid area
   */
  gridArea?: string;
  /**
   * Whether to use grid column gap
   */
  useGridColumnGap?: boolean;
  /**
   * Grid column gap
   */
  gridColumnGap?: string;
  /**
   * Whether to use grid row gap
   */
  useGridRowGap?: boolean;
  /**
   * Grid row gap
   */
  gridRowGap?: string;
  /**
   * Whether to use grid gap
   */
  useGridGap?: boolean;
  /**
   * Grid gap
   */
  gridGap?: string;
}

/**
 * Form checkbox component
 */
export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  name,
  checkboxProps = {},
  checkboxLabel,
  defaultChecked,
  checked,
  onChange,
  onBlur,
  onFocus,
  autoFocus = false,
  disabled,
  readOnly,
  isRequired,
  isInvalid,
  size,
  colorScheme,
  id,
  isIndeterminate,
  ...rest
}) => {
  const form = useFormContext();
  const { colorMode } = useColorMode();
  const checkboxRef = useRef<HTMLInputElement>(null);
  
  // Get field props
  const fieldProps = form.getFieldProps(name);
  
  // Handle checkbox change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Call onChange callback if provided
    if (onChange) {
      onChange(event);
    }
    
    // Update form field value
    form.setFieldValue(name, event.target.checked);
  };
  
  // Handle checkbox blur
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    // Call onBlur callback if provided
    if (onBlur) {
      onBlur(event);
    }
    
    // Update form field touched state
    form.setFieldTouched(name, true);
  };
  
  // Handle checkbox focus
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    // Call onFocus callback if provided
    if (onFocus) {
      onFocus(event);
    }
  };
  
  // Auto focus checkbox on mount
  useEffect(() => {
    if (autoFocus && checkboxRef.current) {
      checkboxRef.current.focus();
    }
  }, [autoFocus]);
  
  return (
    <FormField name={name} hideLabel {...rest}>
      <Checkbox
        ref={checkboxRef}
        id={id || name}
        name={name}
        isChecked={checked !== undefined ? checked : fieldProps.value || false}
        defaultChecked={defaultChecked}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        isDisabled={disabled || fieldProps.disabled}
        isReadOnly={readOnly || fieldProps.readonly}
        isRequired={isRequired || fieldProps.required}
        isInvalid={isInvalid || !!fieldProps.error}
        isIndeterminate={isIndeterminate}
        colorScheme={colorScheme}
        size={size}
        {...checkboxProps}
      >
        {checkboxLabel || rest.label}
      </Checkbox>
    </FormField>
  );
};

export default FormCheckbox;
