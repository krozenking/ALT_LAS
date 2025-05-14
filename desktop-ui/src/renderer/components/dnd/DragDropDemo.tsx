import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  useColorMode,
  VStack,
  HStack,
  Divider,
  Badge,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import {
  DragDropProvider,
  Draggable,
  Droppable,
  DragOverlay,
  Sortable,
  SortableItem,
} from './index';

// Define task type
interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
}

// Define column type
interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const DragDropDemo: React.FC = () => {
  const { colorMode } = useColorMode();
  
  // Initial columns
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        { id: 'task-1', title: 'Implement drag and drop', status: 'todo', priority: 'high' },
        { id: 'task-2', title: 'Create UI components', status: 'todo', priority: 'medium' },
        { id: 'task-3', title: 'Write documentation', status: 'todo', priority: 'low' },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [
        { id: 'task-4', title: 'Refactor code', status: 'in-progress', priority: 'medium' },
        { id: 'task-5', title: 'Fix bugs', status: 'in-progress', priority: 'high' },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        { id: 'task-6', title: 'Setup project', status: 'done', priority: 'high' },
        { id: 'task-7', title: 'Create wireframes', status: 'done', priority: 'medium' },
      ],
    },
  ]);
  
  // Handle task drag end
  const handleTaskDragEnd = (result: any) => {
    const { active, over } = result;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    // Find the source and destination columns
    const sourceColumnId = active.data.current?.status;
    const destinationColumnId = over.data.current?.columnId || sourceColumnId;
    
    // If the task is dropped on the same column, do nothing
    if (sourceColumnId === destinationColumnId && !over.data.current?.taskId) return;
    
    // Find the task
    const sourceColumn = columns.find(column => column.id === sourceColumnId);
    if (!sourceColumn) return;
    
    const taskIndex = sourceColumn.tasks.findIndex(task => task.id === activeId);
    if (taskIndex === -1) return;
    
    const task = sourceColumn.tasks[taskIndex];
    
    // Create new columns array
    const newColumns = [...columns];
    
    // Remove task from source column
    newColumns.find(column => column.id === sourceColumnId)!.tasks.splice(taskIndex, 1);
    
    // If dropped on a task, insert before or after that task
    if (over.data.current?.taskId) {
      const destColumn = newColumns.find(column => column.id === destinationColumnId)!;
      const destTaskIndex = destColumn.tasks.findIndex(task => task.id === over.data.current.taskId);
      
      // Insert task at the destination index
      destColumn.tasks.splice(destTaskIndex, 0, { ...task, status: destinationColumnId as any });
    } else {
      // Add task to destination column
      newColumns.find(column => column.id === destinationColumnId)!.tasks.push({ ...task, status: destinationColumnId as any });
    }
    
    setColumns(newColumns);
  };
  
  // Handle column sort
  const handleColumnSort = (items: any[]) => {
    const newColumns = items.map(item => columns.find(column => column.id === item.id)!);
    setColumns(newColumns);
  };
  
  // Handle task sort within a column
  const handleTaskSort = (columnId: string, tasks: any[]) => {
    const newColumns = columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          tasks: tasks.map(item => column.tasks.find(task => task.id === item.id)!),
        };
      }
      return column;
    });
    
    setColumns(newColumns);
  };
  
  // Render task
  const renderTask = (task: Task) => {
    const priorityColor = {
      low: 'green',
      medium: 'blue',
      high: 'red',
    };
    
    return (
      <Box
        p={3}
        mb={2}
        borderRadius="md"
        bg={colorMode === 'light' ? 'white' : 'gray.700'}
        boxShadow="sm"
        width="100%"
      >
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontWeight="medium">{task.title}</Text>
          <Badge colorScheme={priorityColor[task.priority]}>{task.priority}</Badge>
        </Flex>
        <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
          ID: {task.id}
        </Text>
      </Box>
    );
  };
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  return (
    <Box p={4} height="100vh">
      <Heading size="lg" mb={6}>Kanban Board</Heading>
      
      <DragDropProvider>
        <Flex height="calc(100vh - 100px)" gap={4}>
          <Sortable
            items={columns}
            onSort={handleColumnSort}
            strategy="horizontal"
            containerStyle={{ height: '100%', width: '100%' }}
            renderItem={(column, index) => (
              <SortableItem
                key={column.id}
                id={column.id}
                flex="1"
                minWidth="300px"
                height="100%"
                borderRadius="md"
                p={4}
                {...glassStyle}
              >
                <Flex direction="column" height="100%">
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="md">{column.title}</Heading>
                    <Badge>{column.tasks.length}</Badge>
                  </Flex>
                  
                  <Droppable
                    id={column.id}
                    data={{ columnId: column.id }}
                    flex="1"
                    overflowY="auto"
                    p={2}
                  >
                    <Sortable
                      items={column.tasks}
                      onSort={(tasks) => handleTaskSort(column.id, tasks)}
                      strategy="vertical"
                      containerStyle={{ minHeight: '100%' }}
                      renderItem={(task, index) => (
                        <SortableItem
                          key={task.id}
                          id={task.id}
                          data={{ status: column.id, taskId: task.id }}
                          mb={2}
                          ariaLabel={`Task: ${task.title}`}
                        >
                          {renderTask(task as Task)}
                        </SortableItem>
                      )}
                      renderOverlay={(task) => renderTask(task as Task)}
                    />
                  </Droppable>
                </Flex>
              </SortableItem>
            )}
          />
        </Flex>
      </DragDropProvider>
    </Box>
  );
};

export default DragDropDemo;
