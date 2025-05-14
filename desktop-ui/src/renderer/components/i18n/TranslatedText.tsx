import React from 'react';
import { Text, TextProps } from '@chakra-ui/react';
import { useTranslation, Trans } from 'react-i18next';

export interface TranslatedTextProps extends Omit<TextProps, 'children'> {
  /**
   * Translation key
   */
  i18nKey: string;
  /**
   * Translation values
   */
  values?: Record<string, any>;
  /**
   * Default value
   */
  defaultValue?: string;
  /**
   * Components to interpolate
   */
  components?: Record<string, React.ReactNode>;
  /**
   * Whether to use Trans component
   */
  useTrans?: boolean;
}

/**
 * Translated text component
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({
  i18nKey,
  values,
  defaultValue,
  components,
  useTrans = false,
  ...props
}) => {
  const { t } = useTranslation();

  // Use Trans component for complex translations with components
  if (useTrans && components) {
    return (
      <Text {...props}>
        <Trans
          i18nKey={i18nKey}
          values={values}
          defaults={defaultValue}
          components={components}
        />
      </Text>
    );
  }

  // Use t function for simple translations
  return (
    <Text {...props}>
      {t(i18nKey, { ...values, defaultValue })}
    </Text>
  );
};

export default TranslatedText;
