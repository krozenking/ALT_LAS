import React, { useEffect, useId } from 'react';
import { Box, Flex, useColorMode } from '@chakra-ui/react';
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

export const TaskManager: React.FC<TaskManagerProps> = ({
  variant = 'panel',
}) => {
  const { colorMode } = useColorMode();
  const { tasks, isLoading, error, updateTask } = useTasks();
  
  // Handle task status update
  const handleStatusUpdate = (id: string, status: string) => {
    updateTask({ id, updates: { status } });
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Box p={3}>
        <Card variant="glass" p={4} textAlign="center">
          Görevler yükleniyor...
        </Card>
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box p={3}>
        <Card variant="glass" p={4} textAlign="center" bg="rgba(244, 67, 54, 0.1)">
          Görevler yüklenirken hata oluştu. Lütfen tekrar deneyin.
        </Card>
      </Box>
    );
  }
  
  return (
    <Box p={variant === 'standalone' ? 4 : 2} role="list">
      {tasks.map((task) => {
        const taskId = useId();
        const taskNameId = `${taskId}-name`;
        const taskStatusId = `${taskId}-status`;
        const taskProgressId = `${taskId}-progress`;
        
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
          >
            <Flex justifyContent="space-between" alignItems="center" mb={2}>
              <Box fontWeight="medium" id={taskNameId}>{task.name}</Box>
              <Box 
                id={taskStatusId}
                fontSize="xs" 
                px={2} 
                py={1} 
                borderRadius="full"
                bg={
                  task.status === 'running' ? 'blue.400' :
                  task.status === 'analyzing' ? 'green.400' :
                  task.status === 'completed' ? 'purple.400' :
                  task.status === 'error' ? 'red.400' :
                  'gray.400'
                }
                color="white"
              >
                {task.status === 'running' ? 'Çalışıyor' :
                 task.status === 'analyzing' ? 'Analiz Ediliyor' :
                 task.status === 'completed' ? 'Tamamlandı' :
                 task.status === 'error' ? 'Hata' :
                 'Beklemede'}
              </Box>
            </Flex>
            
            <Box 
              id={taskProgressId}
              fontSize="sm" 
              color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
            >
              Durum: {task.progress ? `%${task.progress} Tamamlandı` : 'Beklemede'}
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
              aria-valuetext={task.progress ? `${task.progress}% completed` : 'Pending'}
            >
              <Box 
                bg={
                  task.type === 'screen_capture' ? 'blue.400' :
                  task.type === 'image_analysis' ? 'green.400' :
                  task.type === 'automation' ? 'yellow.400' :
                  'purple.400'
                } 
                h="4px" 
                w={`${task.progress}%`} 
                borderRadius="full" 
              />
            </Box>
            
            {variant === 'standalone' && (
              <Flex mt={3} justifyContent="flex-end">
                <Button 
                  variant="glass" 
                  size="sm" 
                  mr={2}
                  onClick={() => handleStatusUpdate(task.id, 
                    task.status === 'idle' ? 'running' : 
                    task.status === 'running' ? 'completed' : 'idle'
                  )}
                >
                  {task.status === 'idle' ? 'Başlat' : 
                   task.status === 'running' ? 'Tamamla' : 'Sıfırla'}
                </Button>
                
                <Button 
                  variant="glass-secondary" 
                  size="sm"
                  onClick={() => handleStatusUpdate(task.id, 'idle')}
                >
                  Durdur
                </Button>
              </Flex>
            )}
          </Card>
        );
      })}
    </Box>
  );
};

export default TaskManager;
