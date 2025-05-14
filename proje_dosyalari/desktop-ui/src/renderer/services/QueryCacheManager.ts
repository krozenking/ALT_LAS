import { QueryClient, QueryCache, MutationCache, DefaultOptions } from 'react-query';
import cacheService from './CacheService';

/**
 * Cache persistence options
 */
export interface CachePersistenceOptions {
  /**
   * Whether to persist cache
   */
  enabled: boolean;
  /**
   * Storage key
   */
  key: string;
  /**
   * Maximum age of cache in milliseconds
   */
  maxAge?: number;
  /**
   * Whether to persist mutations
   */
  persistMutations?: boolean;
}

/**
 * Default cache persistence options
 */
const DEFAULT_PERSISTENCE_OPTIONS: CachePersistenceOptions = {
  enabled: true,
  key: 'alt_las_query_cache',
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  persistMutations: false,
};

/**
 * Query cache manager
 */
class QueryCacheManager {
  private queryClient: QueryClient;
  private persistenceOptions: CachePersistenceOptions;
  private isHydrated: boolean = false;

  /**
   * Constructor
   * @param persistenceOptions Cache persistence options
   */
  constructor(persistenceOptions: Partial<CachePersistenceOptions> = {}) {
    this.persistenceOptions = { ...DEFAULT_PERSISTENCE_OPTIONS, ...persistenceOptions };

    // Create query client
    this.queryClient = this.createQueryClient();

    // Hydrate cache from storage
    if (this.persistenceOptions.enabled) {
      this.hydrateCache();
    }

    // Set up storage event listener for cross-tab synchronization
    this.setupStorageListener();
  }

  /**
   * Get query client
   * @returns Query client
   */
  public getQueryClient(): QueryClient {
    return this.queryClient;
  }

  /**
   * Persist cache to storage
   */
  public persistCache(): void {
    if (!this.persistenceOptions.enabled || !this.isHydrated) {
      return;
    }

    try {
      const queryCache = this.queryClient.getQueryCache();
      const mutationCache = this.queryClient.getMutationCache();

      // Get query cache data
      const queries = queryCache.getAll().map(query => {
        const { queryKey, state } = query;
        return {
          queryKey,
          state: {
            data: state.data,
            dataUpdateCount: state.dataUpdateCount,
            dataUpdatedAt: state.dataUpdatedAt,
            error: state.error,
            errorUpdateCount: state.errorUpdateCount,
            errorUpdatedAt: state.errorUpdatedAt,
            fetchFailureCount: state.fetchFailureCount,
            fetchMeta: state.fetchMeta,
            isFetching: false,
            isInvalidated: state.isInvalidated,
            isPaused: state.isPaused,
            status: state.status,
          },
        };
      });

      // Get mutation cache data if enabled
      const mutations = this.persistenceOptions.persistMutations
        ? mutationCache.getAll().map(mutation => {
            const { mutationKey, state } = mutation;
            return {
              mutationKey,
              state: {
                context: state.context,
                data: state.data,
                error: state.error,
                failureCount: state.failureCount,
                isPaused: state.isPaused,
                status: state.status,
                variables: state.variables,
              },
            };
          })
        : [];

      // Create cache object
      const cache = {
        timestamp: Date.now(),
        queries,
        mutations,
      };

      // Save to localStorage
      localStorage.setItem(this.persistenceOptions.key, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to persist query cache:', error);
    }
  }

  /**
   * Hydrate cache from storage
   */
  public hydrateCache(): void {
    if (!this.persistenceOptions.enabled) {
      return;
    }

    try {
      const cachedData = localStorage.getItem(this.persistenceOptions.key);
      if (!cachedData) {
        this.isHydrated = true;
        return;
      }

      const cache = JSON.parse(cachedData);
      const { timestamp, queries, mutations } = cache;

      // Check if cache is expired
      if (
        this.persistenceOptions.maxAge &&
        Date.now() - timestamp > this.persistenceOptions.maxAge
      ) {
        localStorage.removeItem(this.persistenceOptions.key);
        this.isHydrated = true;
        return;
      }

      // Hydrate query cache
      const queryCache = this.queryClient.getQueryCache();
      queries.forEach(({ queryKey, state }: any) => {
        queryCache.build(this.queryClient, {
          queryKey,
          ...state,
        });
      });

      // Hydrate mutation cache if enabled
      if (this.persistenceOptions.persistMutations) {
        const mutationCache = this.queryClient.getMutationCache();
        mutations.forEach(({ mutationKey, state }: any) => {
          mutationCache.build(this.queryClient, {
            mutationKey,
            ...state,
          });
        });
      }

      this.isHydrated = true;
    } catch (error) {
      console.error('Failed to hydrate query cache:', error);
      localStorage.removeItem(this.persistenceOptions.key);
      this.isHydrated = true;
    }
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.queryClient.clear();
    if (this.persistenceOptions.enabled) {
      localStorage.removeItem(this.persistenceOptions.key);
    }
  }

  /**
   * Invalidate queries by key
   * @param queryKey Query key
   */
  public invalidateQueries(queryKey: any): Promise<void> {
    return this.queryClient.invalidateQueries(queryKey);
  }

  /**
   * Invalidate queries by tags
   * @param tags Tags to invalidate
   */
  public invalidateQueriesByTags(tags: string[]): Promise<void> {
    // Get all queries
    const queries = this.queryClient.getQueryCache().getAll();

    // Find queries with matching tags
    const queriesToInvalidate = queries.filter(query => {
      const queryTags = query.options.meta?.tags as string[] | undefined;
      return queryTags && queryTags.some(tag => tags.includes(tag));
    });

    // Invalidate matching queries
    return Promise.all(
      queriesToInvalidate.map(query => this.queryClient.invalidateQueries(query.queryKey))
    ).then(() => {});
  }

  /**
   * Set up storage event listener for cross-tab synchronization
   */
  private setupStorageListener(): void {
    if (!this.persistenceOptions.enabled) {
      return;
    }

    window.addEventListener('storage', (event) => {
      if (event.key === this.persistenceOptions.key) {
        this.hydrateCache();
      }
    });
  }

  /**
   * Create query client
   * @returns Query client
   */
  private createQueryClient(): QueryClient {
    // Create query cache
    const queryCache = new QueryCache({
      onError: (error) => {
        console.error('Query error:', error);
      },
      onSuccess: () => {
        if (this.persistenceOptions.enabled && this.isHydrated) {
          this.persistCache();
        }
      },
    });

    // Create mutation cache
    const mutationCache = new MutationCache({
      onError: (error) => {
        console.error('Mutation error:', error);
      },
      onSuccess: () => {
        if (this.persistenceOptions.enabled && this.isHydrated) {
          this.persistCache();
        }
      },
    });

    // Default options
    const defaultOptions: DefaultOptions = {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    };

    // Create query client
    return new QueryClient({
      queryCache,
      mutationCache,
      defaultOptions,
    });
  }
}

// Create singleton instance
const queryCacheManager = new QueryCacheManager();

export default queryCacheManager;
