import React, { useState, useCallback, createContext, useContext, useMemo, memo } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useColorMode
} from '@chakra-ui/react';
import { animations } from '@/styles/animations';

// Define layout types
export type LayoutType = 'default' | 'fileFocus' | 'taskFocus' | 'developer';

// Define the structure of a layout configuration
// This is a basic example; it could include panel sizes, positions, visibility, etc.
export interface LayoutConfig {
  id: LayoutType;
  name: string;
  description: string;
  icon: string; // Emoji or icon component name
  // Add specific panel configurations here, e.g.:
  // panelVisibility: { fileManager: boolean; taskManager: boolean; settings: boolean; ... }
  // panelSizes: { sidebar: string; main: string; details: string; ... }
}

// Define available layouts
const availableLayouts: LayoutConfig[] = [
  {
    id: 'default',
    name: 'Varsayılan Düzen',
    description: 'Tüm panellerin dengeli bir görünümü.',
    icon: '🖼️'
  },
  {
    id: 'fileFocus',
    name: 'Dosya Odaklı',
    description: 'Dosya yöneticisi için daha fazla alan sağlar.',
    icon: '📂'
  },
  {
    id: 'taskFocus',
    name: 'Görev Odaklı',
    description: 'Görev yöneticisi ve ilgili panellere odaklanır.',
    icon: '📋'
  },
  {
    id: 'developer',
    name: 'Geliştirici Modu',
    description: 'Geliştirici araçları ve konsol için alan açar.',
    icon: '💻'
  }
];

// Create context for layout management
interface LayoutContextProps {
  currentLayout: LayoutType;
  setLayout: (layout: LayoutType) => void;
  getLayoutConfig: (layoutId: LayoutType) => LayoutConfig | undefined;
}

const LayoutContext = createContext<LayoutContextProps | undefined>(undefined);

// Context Provider component
export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('default');

  const setLayout = useCallback((layout: LayoutType) => {
    console.log(`Switching layout to: ${layout}`);
    setCurrentLayout(layout);
    // Persist layout preference (e.g., in localStorage or settings)
  }, []);

  const getLayoutConfig = useCallback((layoutId: LayoutType) => {
    return availableLayouts.find(l => l.id === layoutId);
  }, []);

  const value = useMemo(() => ({ currentLayout, setLayout, getLayoutConfig }), [currentLayout, setLayout, getLayoutConfig]);

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

// Hook to use layout context
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

// Layout Switcher UI component
export const LayoutSwitcher: React.FC = memo(() => {
  const { currentLayout, setLayout, getLayoutConfig } = useLayout();
  const currentConfig = getLayoutConfig(currentLayout);

  const handleLayoutChange = useCallback((newLayout: LayoutType) => {
    setLayout(newLayout);
  }, [setLayout]);

  return (
    <Menu>
      <Tooltip label={`Mevcut Düzen: ${currentConfig?.name}`} aria-label="Düzen Seçici">
        <MenuButton
          as={IconButton}
          aria-label="Düzenler"
          icon={<Box fontSize="xl" aria-hidden="true">{currentConfig?.icon || '🖼️'}</Box>}
          variant="glass"
          {...animations.performanceUtils.forceGPU}
        />
      </Tooltip>
      <MenuList>
        {availableLayouts.map((layout) => (
          <MenuItem
            key={layout.id}
            icon={<Box fontSize="lg" mr={2} aria-hidden="true">{layout.icon}</Box>}
            onClick={() => handleLayoutChange(layout.id)}
            fontWeight={currentLayout === layout.id ? 'bold' : 'normal'}
            aria-current={currentLayout === layout.id ? 'page' : undefined}
          >
            {layout.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
});

LayoutSwitcher.displayName = 'LayoutSwitcher';

