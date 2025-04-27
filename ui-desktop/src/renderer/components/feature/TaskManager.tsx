import React, { useEffect, useId, useMemo, useCallback, memo, useRef } from 'react';
import { Box, Flex, useColorMode, Text, VisuallyHidden, useDimensions } from '@chakra-ui/react'; // Added useDimensions
import { FixedSizeList } from 'react-window'; // Added FixedSizeList
import Panel from '@/components/composition/Panel';
import SplitView from '@/components/composition/SplitView';
import PanelContainer from '@/components/composition/PanelContainer';
import Button from '@/components/core/Button';
import Card from '@/components/core/Card';
import Input from '@/components/core/Input';
import IconButton from '@/components/core/IconButton';
import { useTasks, useSystemStatus } from '@/hooks/useApi';
import useAppStore from '@/store/appStore';

export interface TaskManagerProps {
  variant?: 'panel' | 'standalone';
}

// Task item component extracted and memoized to prevent unnecessary re-renders
const TaskItem = memo(({ 
  task, 
  variant, 
  colorMode, 
  onStatusUpdate 
}: { 
  task: any, 
  variant: 'panel' | 'standalone', 
  colorMode: string, 
  onStatusUpdate: (id: string, status: string) => void 
}) => {
  const taskId = useId();
  const taskNameId = `${taskId}-name`;
  const taskStatusId = `${taskId}-status`;
  const taskProgressId = `${taskId}-progress`;
  
  // Memoize status color calculation
  const statusColor = useMemo(() => {
    return task.status === 'running' ? 'blue.400' :
      task.status === 'analyzing' ? 'green.400' :
      task.status === 'completed' ? 'purple.400' :
      task.status === 'error' ? 'red.400' :
      'gray.400';
  }, [task.status]);
  
  // Memoize progress bar color calculation
  const progressColor = useMemo(() => {
    return task.type === 'screen_capture' ? 'blue.400' :
      task.type === 'image_analysis' ? 'green.400' :
      task.type === 'automation' ? 'yellow.400' :
      'purple.400';
  }, [task.type]);
  
  // Memoize status text calculation
  const statusText = useMemo(() => {
    return task.status === 'running' ? 'Çalışıyor' :
      task.status === 'analyzing' ? 'Analiz Ediliyor' :
      task.status === 'completed' ? 'Tamamlandı' :
      task.status === 'error' ? 'Hata' :
      'Beklemede';
  }, [task.status]);
  
  // Memoize button text calculation
  const buttonText = useMemo(() => {
    return task.status === 'idle' ? 'Başlat' : 
      task.status === 'running' ? 'Tamamla' : 'Sıfırla';
  }, [task.status]);
  
  // Memoize next status calculation
  const nextStatus = useMemo(() => {
    return task.status === 'idle' ? 'running' : 
      task.status === 'running' ? 'completed' : 'idle';
  }, [task.status]);

  // Memoize aria-valuetext for progress bar
  const progressAriaValueText = useMemo(() => {
    return task.progress ? `${task.name}: ${task.progress}% tamamlandı` : `${task.name}: Beklemede`;
  }, [task.name, task.progress]);
  
  // Use useCallback for event handlers to prevent unnecessary re-renders
  const handleStatusChange = useCallback(() => {
    onStatusUpdate(task.id, nextStatus);
  }, [task.id, nextStatus, onStatusUpdate]);
  
  const handleStop = useCallback(() => {
    onStatusUpdate(task.id, 'idle');
  }, [task.id, onStatusUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Allow activating buttons within the card via Enter/Space if needed
    // Currently, focus goes directly to buttons in standalone mode
  }, []);
  
  return (
    <Card 
      key={task.id} 
      role="listitem"
      aria-labelledby={taskNameId}
      aria-describedby={`${taskStatusId} ${taskProgressId}`}
      variant="glass" 
      mb={3} 
      p={3}
      _hover={{ transform: 'translateY(-2px)', transition: 'transform 0.2s' }}
      // Removed focus styles from Card itself, focus should be on interactive elements within
      // tabIndex={-1} // Make non-focusable by default, focus managed by list or buttons
      onKeyDown={handleKeyDown}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={2}>
        <Box fontWeight="medium" id={taskNameId}>{task.name}</Box>
        <Box 
          id={taskStatusId}
          fontSize="xs" 
          px={2} 
          py={1} 
          borderRadius="full"
          bg={statusColor}
          color="white"
          // aria-live="polite" // Avoid aria-live here, might be too noisy on list updates
        >
          {statusText}
        </Box>
      </Flex>
      
      <Box 
        id={taskProgressId}
        fontSize="sm" 
        color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
      >
        İlerleme: {task.progress ? `%${task.progress}` : '0%'}
      </Box>
      
      <Box 
        mt={2} 
        bg={colorMode === 'light' ? 'gray.200' : 'gray.700'} 
        h="4px" 
        w="100%" 
        borderRadius="full"
        role="progressbar"
        aria-valuenow={task.progress || 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={progressAriaValueText} // Use more descriptive text
        aria-label={`${task.name} ilerleme durumu`}
      >
        <Box 
          bg={progressColor} 
          h="4px" 
          w={`${task.progress || 0}%`} // Ensure width is 0% if progress is null/undefined
          borderRadius="full" 
        />
      </Box>
      
      {variant === 'standalone' && (
        <Flex mt={3} justifyContent="flex-end">
          <Button 
            variant="glass" 
            size="sm" 
            mr={2}
            onClick={handleStatusChange}
            aria-label={`${buttonText}: ${task.name}`}
          >
            {buttonText}
          </Button>
          
          <Button 
            variant="glass-secondary" 
            size="sm"
            onClick={handleStop}
            aria-label={`Görevi durdur: ${task.name}`}
          >
            Durdur
          </Button>
        </Flex>
      )}
    </Card>
  );
});

// Ensure displayName is set for React DevTools
TaskItem.displayName = 'TaskItem';

export const TaskManager: React.FC<TaskManagerProps> = memo(({
  variant = 'panel',
}) => {
  const { colorMode } = useColorMode();
  const { tasks, isLoading, error, updateTask } = useTasks();
  const listId = useId();
  const listLabelId = `${listId}-label`;
  const listContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<FixedSizeList>(null);
  
  // Get dimensions of the task list container
  const listDimensions = useDimensions(listContainerRef, true);
  
  // Constants for virtual list
  const taskItemHeight = 100; // Approximate height of TaskItem including margin
  
  // Handle task status update with useCallback to prevent unnecessary re-renders
  const handleStatusUpdate = useCallback((id: string, status: string) => {
    updateTask({ id, updates: { status } });
  }, [updateTask]);
  
  // Prepare data for virtual list items
  const itemData = useMemo(() => ({
    tasks,
    variant,
    colorMode,
    onStatusUpdate: handleStatusUpdate
  }), [tasks, variant, colorMode, handleStatusUpdate]);
  
  // Generate demo tasks for testing virtualization performance
  useEffect(() => {
    if (tasks.length === 0 && variant === 'standalone') {
      // Only generate demo tasks in standalone mode for testing
      const demoTasks = Array.from({ length: 500 }, (_, i) => ({
        id: `task-${i + 1}`,
        name: `Demo Task ${i + 1}`,
        status: i % 5 === 0 ? 'running' : i % 5 === 1 ? 'analyzing' : i % 5 === 2 ? 'completed' : i % 5 === 3 ? 'error' : 'idle',
        progress: i % 5 === 0 ? Math.floor(Math.random() * 100) : i % 5 === 1 ? Math.floor(Math.random() * 100) : i % 5 === 2 ? 100 : 0,
        type: i % 4 === 0 ? 'screen_capture' : i % 4 === 1 ? 'image_analysis' : i % 4 === 2 ? 'automation' : 'other'
      }));
      
      // This would normally update the tasks in a real implementation
      console.log('Generated demo tasks for virtualization testing:', demoTasks.length);
    }
  }, [tasks.length, variant]);
  
  // Render function for FixedSizeList items
  const Row = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    const task = itemData.tasks[index];
    if (!task) return null;
    return (
      <div style={style}>
        <TaskItem
          key={task.id}
          task={task}
          variant={itemData.variant}
          colorMode={itemData.colorMode}
          onStatusUpdate={itemData.onStatusUpdate}
        />
      </div>
    );
  }, [itemData]);
  
  // Render loading state
  if (isLoading) {
    return (
      <Box p={3} role="alert" aria-live="polite">
        <Card variant="glass" p={4} textAlign="center">
          Görevler yükleniyor...
        </Card>
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box p={3} role="alert" aria-live="assertive"> {/* Use assertive for errors */} 
        <Card variant="glass" p={4} textAlign="center" bg="rgba(244, 67, 54, 0.1)">
          Görevler yüklenirken hata oluştu. Lütfen tekrar deneyin.
        </Card>
      </Box>
    );
  }
  
  return (
    <Box 
      p={variant === 'standalone' ? 4 : 2} 
      role="list" 
      id={listId} 
      aria-labelledby={listLabelId}
      ref={listContainerRef}
      height={variant === 'standalone' ? "600px" : "100%"}
    >
      <VisuallyHidden id={listLabelId}>Görev Listesi</VisuallyHidden>
      {tasks.length > 0 && listDimensions ? (
        <FixedSizeList
          ref={listRef}
          height={listDimensions.borderBox.height}
          itemCount={tasks.length}
          itemSize={taskItemHeight}
          width="100%"
          itemData={itemData}
          overscanCount={5} // Render 5 items above and below the visible area for smoother scrolling
        >
          {Row}
        </FixedSizeList>
      ) : (
        <Card variant="glass" p={4} textAlign="center">
          <Text>Aktif görev bulunmamaktadır.</Text>
        </Card>
      )}
    </Box>
  );
});

// Ensure displayName is set for React DevTools
TaskManager.displayName = 'TaskManager';

export default TaskManager;

