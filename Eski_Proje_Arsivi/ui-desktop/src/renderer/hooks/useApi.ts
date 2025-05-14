import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import ApiService from '@/utils/ApiService';
import useAppStore from '@/store/appStore';

// Initialize API service
const apiService = new ApiService({
  baseUrl: 'http://localhost:3000/api',
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

export default {
  useTasks,
  useSystemStatus,
  useAnalytics,
};
