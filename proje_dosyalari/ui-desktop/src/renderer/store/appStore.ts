import { create } from 'zustand';

// Define the types for our store
interface SystemStatus {
  cpu: number;
  memory: number;
  disk: number;
  isActive: boolean;
}

interface Task {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'analyzing' | 'completed' | 'error';
  progress: number;
  type: 'screen_capture' | 'image_analysis' | 'automation' | 'data_processing';
}

interface AppState {
  systemStatus: SystemStatus;
  tasks: Task[];
  activePanels: string[];
  
  // Actions
  setSystemStatus: (status: Partial<SystemStatus>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
  addPanel: (id: string) => void;
  removePanel: (id: string) => void;
  reorderPanels: (panelIds: string[]) => void;
}

// Create the store
export const useAppStore = create<AppState>((set) => ({
  // Initial state
  systemStatus: {
    cpu: 35,
    memory: 48,
    disk: 62,
    isActive: true,
  },
  tasks: [
    {
      id: 'task1',
      name: 'Ekran Yakalama',
      status: 'running',
      progress: 70,
      type: 'screen_capture',
    },
    {
      id: 'task2',
      name: 'Görüntü Analizi',
      status: 'analyzing',
      progress: 40,
      type: 'image_analysis',
    },
    {
      id: 'task3',
      name: 'Otomasyon',
      status: 'idle',
      progress: 0,
      type: 'automation',
    },
    {
      id: 'task4',
      name: 'Veri İşleme',
      status: 'running',
      progress: 62,
      type: 'data_processing',
    },
  ],
  activePanels: ['taskManager', 'systemStatus', 'analytics'],
  
  // Actions
  setSystemStatus: (status) => 
    set((state) => ({ 
      systemStatus: { ...state.systemStatus, ...status } 
    })),
  
  updateTask: (id, updates) => 
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  
  addTask: (task) => 
    set((state) => ({
      tasks: [...state.tasks, task],
    })),
  
  removeTask: (id) => 
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  
  addPanel: (id) => 
    set((state) => ({
      activePanels: [...state.activePanels, id],
    })),
  
  removePanel: (id) => 
    set((state) => ({
      activePanels: state.activePanels.filter((panelId) => panelId !== id),
    })),
  
  reorderPanels: (panelIds) => 
    set(() => ({
      activePanels: panelIds,
    })),
}));

export default useAppStore;
