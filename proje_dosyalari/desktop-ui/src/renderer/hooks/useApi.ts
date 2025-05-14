import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import ApiService, { ApiError, ApiErrorType } from '@/utils/ApiService';
import useAppStore from '@/store/appStore';
import { useLocalStorage } from './useLocalStorage';

// Initialize API service with ALT_LAS API Gateway URL
const apiService = new ApiService({
  baseUrl: process.env.API_GATEWAY_URL || 'http://localhost:3000/api',
});

// Custom hook for tasks
export const useTasks = () => {
  const queryClient = useQueryClient();
  const { tasks: localTasks, addTask, updateTask, removeTask } = useAppStore();

  // Fetch tasks from API
  const { data, isLoading, error } = useQuery('tasks', async () => {
    try {
      return await apiService.getTasks();
    } catch (err) {
      console.warn('Failed to fetch tasks from API, using local state:', err);
      return localTasks;
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation(
    (newTask) => apiService.createTask(newTask),
    {
      onSuccess: (data) => {
        addTask(data);
        queryClient.invalidateQueries('tasks');
      },
      onError: (err, newTask) => {
        console.warn('Failed to create task on API, adding to local state only:', err);
        addTask(newTask);
      },
    }
  );

  // Update task mutation
  const updateTaskMutation = useMutation(
    ({ id, updates }) => apiService.updateTask(id, updates),
    {
      onSuccess: (data) => {
        updateTask(data.id, data);
        queryClient.invalidateQueries('tasks');
      },
      onError: (err, { id, updates }) => {
        console.warn('Failed to update task on API, updating local state only:', err);
        updateTask(id, updates);
      },
    }
  );

  // Delete task mutation
  const deleteTaskMutation = useMutation(
    (id) => apiService.deleteTask(id),
    {
      onSuccess: (_, id) => {
        removeTask(id);
        queryClient.invalidateQueries('tasks');
      },
      onError: (err, id) => {
        console.warn('Failed to delete task on API, removing from local state only:', err);
        removeTask(id);
      },
    }
  );

  return {
    tasks: data || localTasks,
    isLoading,
    error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
  };
};

// Custom hook for system status
export const useSystemStatus = () => {
  const queryClient = useQueryClient();
  const { systemStatus: localStatus, setSystemStatus } = useAppStore();

  // Fetch system status from API
  const { data, isLoading, error } = useQuery('systemStatus', async () => {
    try {
      return await apiService.getSystemStatus();
    } catch (err) {
      console.warn('Failed to fetch system status from API, using local state:', err);
      return localStatus;
    }
  }, {
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Update local state when API data changes
  useEffect(() => {
    if (data) {
      setSystemStatus(data);
    }
  }, [data, setSystemStatus]);

  return {
    systemStatus: data || localStatus,
    isLoading,
    error,
  };
};

// Custom hook for analytics
export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    taskCompletionRate: 0,
    averageProcessingTime: 0,
    resourceUtilization: 0,
  });

  // Fetch analytics from API
  const { data, isLoading, error } = useQuery('analytics', async () => {
    try {
      return await apiService.getAnalytics();
    } catch (err) {
      console.warn('Failed to fetch analytics from API, using default values:', err);
      return analytics;
    }
  });

  // Update local state when API data changes
  useEffect(() => {
    if (data) {
      setAnalytics(data);
    }
  }, [data]);

  return {
    analytics: data || analytics,
    isLoading,
    error,
  };
};

// Authentication hook
export const useAuth = () => {
  const [authToken, setAuthToken] = useLocalStorage<string | undefined>('alt_las_auth_token', undefined);
  const [user, setUser] = useLocalStorage<any | undefined>('alt_las_user', undefined);

  // Initialize API service with stored token
  useMemo(() => {
    if (authToken) {
      apiService.setAuthToken(authToken);
    }
  }, [authToken]);

  // Login handler
  const login = useCallback(async (username: string, password: string) => {
    try {
      const result = await apiService.login(username, password);
      setAuthToken(result.token);
      setUser(result.user);
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [setAuthToken, setUser]);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.warn('Logout API call failed, clearing local state anyway:', error);
    } finally {
      setAuthToken(undefined);
      setUser(undefined);
    }
  }, [setAuthToken, setUser]);

  // Refresh token handler
  const refreshToken = useCallback(async () => {
    try {
      const result = await apiService.refreshToken();
      setAuthToken(result.token);
      return result;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, clear token and user
      setAuthToken(undefined);
      setUser(undefined);
      throw error;
    }
  }, [setAuthToken, setUser]);

  return {
    isAuthenticated: !!authToken,
    user,
    login,
    logout,
    refreshToken
  };
};

// Segmentation hook
export const useSegmentation = () => {
  const queryClient = useQueryClient();

  // Fetch available models
  const {
    data: models,
    isLoading: isLoadingModels,
    error: modelsError
  } = useQuery('segmentationModels', async () => {
    try {
      return await apiService.getSegmentationModels();
    } catch (err) {
      console.warn('Failed to fetch segmentation models:', err);
      return [];
    }
  });

  // Run segmentation mutation
  const runSegmentationMutation = useMutation(
    ({ imageData, modelId, options }) =>
      apiService.runSegmentation(imageData, modelId, options),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('segmentationResults');
      }
    }
  );

  return {
    models: models || [],
    isLoadingModels,
    modelsError,
    runSegmentation: runSegmentationMutation.mutate,
    isRunning: runSegmentationMutation.isLoading,
    segmentationError: runSegmentationMutation.error,
    segmentationResult: runSegmentationMutation.data
  };
};

// Runner hook
export const useRunner = () => {
  const queryClient = useQueryClient();

  // Fetch runner status
  const {
    data: status,
    isLoading: isLoadingStatus,
    error: statusError
  } = useQuery('runnerStatus', async () => {
    try {
      return await apiService.getRunnerStatus();
    } catch (err) {
      console.warn('Failed to fetch runner status:', err);
      return { status: 'unknown' };
    }
  }, {
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  // Start job mutation
  const startJobMutation = useMutation(
    (jobData) => apiService.startRunnerJob(jobData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('runnerStatus');
      }
    }
  );

  // Stop job mutation
  const stopJobMutation = useMutation(
    (jobId) => apiService.stopRunnerJob(jobId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('runnerStatus');
      }
    }
  );

  return {
    status: status || { status: 'unknown' },
    isLoadingStatus,
    statusError,
    startJob: startJobMutation.mutate,
    stopJob: stopJobMutation.mutate,
    isStarting: startJobMutation.isLoading,
    isStopping: stopJobMutation.isLoading,
    startError: startJobMutation.error,
    stopError: stopJobMutation.error
  };
};

// Archive hook
export const useArchive = () => {
  const queryClient = useQueryClient();

  // Search mutation
  const searchMutation = useMutation(
    ({ query, filters }) => apiService.searchArchive(query, filters)
  );

  // Get item query factory
  const getArchiveItem = (id: string) => {
    return useQuery(['archiveItem', id], async () => {
      try {
        return await apiService.getArchiveItem(id);
      } catch (err) {
        console.warn(`Failed to fetch archive item ${id}:`, err);
        return null;
      }
    });
  };

  return {
    search: searchMutation.mutate,
    isSearching: searchMutation.isLoading,
    searchError: searchMutation.error,
    searchResults: searchMutation.data || [],
    getArchiveItem
  };
};

// Export all hooks
export default {
  useTasks,
  useSystemStatus,
  useAnalytics,
  useAuth,
  useSegmentation,
  useRunner,
  useArchive
};
