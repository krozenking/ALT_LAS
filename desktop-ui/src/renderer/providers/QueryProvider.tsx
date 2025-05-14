import React, { ReactNode } from 'react';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import queryCacheManager from '../services/QueryCacheManager';

export interface QueryProviderProps {
  /**
   * Children components
   */
  children: ReactNode;
  /**
   * Whether to show devtools
   */
  showDevtools?: boolean;
}

/**
 * Query provider component
 * @param props Component props
 * @returns Query provider component
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({
  children,
  showDevtools = process.env.NODE_ENV === 'development',
}) => {
  return (
    <QueryClientProvider client={queryCacheManager.getQueryClient()}>
      {children}
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />}
    </QueryClientProvider>
  );
};

export default QueryProvider;
