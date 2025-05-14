import React, { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/i18n';

export interface I18nProviderProps {
  /**
   * Children components
   */
  children: React.ReactNode;
  /**
   * Loading component
   */
  fallback?: React.ReactNode;
}

/**
 * I18n provider component
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  fallback = <div>Loading translations...</div>,
}) => {
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </I18nextProvider>
  );
};

export default I18nProvider;
