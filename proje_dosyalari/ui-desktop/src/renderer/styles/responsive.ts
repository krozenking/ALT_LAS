import { createBreakpoints } from '@chakra-ui/theme-tools';

// Define responsive breakpoints
export const breakpoints = createBreakpoints({
  sm: '30em',    // 480px - Small mobile devices
  md: '48em',    // 768px - Tablets and larger mobile devices
  lg: '62em',    // 992px - Small desktops and laptops
  xl: '80em',    // 1280px - Large desktops
  '2xl': '96em', // 1536px - Extra large screens
  '3xl': '120em' // 1920px - Ultra wide screens
});

// Define responsive spacing scales
export const responsiveSpacing = {
  // Base spacing for mobile
  mobile: {
    container: '1rem',
    element: '0.5rem',
    text: '0.25rem'
  },
  // Spacing for tablets
  tablet: {
    container: '1.5rem',
    element: '0.75rem',
    text: '0.375rem'
  },
  // Spacing for desktops
  desktop: {
    container: '2rem',
    element: '1rem',
    text: '0.5rem'
  },
  // Spacing for large screens
  large: {
    container: '2.5rem',
    element: '1.25rem',
    text: '0.625rem'
  }
};

// Define responsive font sizes
export const responsiveFontSizes = {
  // Base font sizes for mobile
  mobile: {
    heading1: '1.5rem',
    heading2: '1.25rem',
    heading3: '1.125rem',
    body: '0.875rem',
    small: '0.75rem'
  },
  // Font sizes for tablets
  tablet: {
    heading1: '1.75rem',
    heading2: '1.5rem',
    heading3: '1.25rem',
    body: '1rem',
    small: '0.875rem'
  },
  // Font sizes for desktops
  desktop: {
    heading1: '2rem',
    heading2: '1.75rem',
    heading3: '1.5rem',
    body: '1rem',
    small: '0.875rem'
  },
  // Font sizes for large screens
  large: {
    heading1: '2.5rem',
    heading2: '2rem',
    heading3: '1.75rem',
    body: '1.125rem',
    small: '1rem'
  }
};

// Define responsive layout configurations
export const responsiveLayouts = {
  // Mobile layout (stacked)
  mobile: {
    direction: 'column',
    sidebar: {
      width: '100%',
      height: 'auto',
      position: 'static'
    },
    main: {
      width: '100%',
      marginLeft: '0'
    },
    panel: {
      minWidth: '100%',
      maxWidth: '100%'
    }
  },
  // Tablet layout (sidebar + main)
  tablet: {
    direction: 'row',
    sidebar: {
      width: '250px',
      height: '100vh',
      position: 'fixed'
    },
    main: {
      width: 'calc(100% - 250px)',
      marginLeft: '250px'
    },
    panel: {
      minWidth: '300px',
      maxWidth: '50%'
    }
  },
  // Desktop layout (sidebar + main + optional panels)
  desktop: {
    direction: 'row',
    sidebar: {
      width: '280px',
      height: '100vh',
      position: 'fixed'
    },
    main: {
      width: 'calc(100% - 280px)',
      marginLeft: '280px'
    },
    panel: {
      minWidth: '350px',
      maxWidth: '40%'
    }
  },
  // Large screen layout (optimized for wide screens)
  large: {
    direction: 'row',
    sidebar: {
      width: '320px',
      height: '100vh',
      position: 'fixed'
    },
    main: {
      width: 'calc(100% - 320px)',
      marginLeft: '320px'
    },
    panel: {
      minWidth: '400px',
      maxWidth: '30%'
    }
  }
};

// Define touch-friendly adjustments
export const touchOptimizations = {
  // Increase touch target sizes
  touchTargets: {
    button: '44px', // Minimum recommended touch target size
    icon: '44px',
    input: '44px',
    checkbox: '24px',
    radio: '24px'
  },
  // Add spacing between interactive elements
  touchSpacing: {
    inline: '8px',
    block: '16px'
  },
  // Adjust hover states for touch devices
  touchHover: {
    feedback: true, // Visual feedback on touch
    delay: '300ms' // Delay before showing hover state
  }
};

// Define multi-monitor support configurations
export const multiMonitorSupport = {
  // Detached window configurations
  detachedWindows: {
    minWidth: '400px',
    minHeight: '300px',
    defaultPosition: { x: 100, y: 100 },
    rememberPosition: true
  },
  // Window management
  windowManagement: {
    snapToEdge: true,
    rememberLayout: true,
    maximizeSupport: true
  }
};

// Define media query helpers
export const mediaQueries = {
  mobile: `@media screen and (max-width: ${breakpoints.sm})`,
  tablet: `@media screen and (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`,
  desktop: `@media screen and (min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.xl})`,
  large: `@media screen and (min-width: ${breakpoints.xl})`,
  touch: `@media (hover: none) and (pointer: coarse)`,
  mouse: `@media (hover: hover) and (pointer: fine)`,
  reducedMotion: `@media (prefers-reduced-motion: reduce)`,
  highContrast: `@media (prefers-contrast: more)`
};

// Define responsive grid configurations
export const responsiveGrids = {
  mobile: {
    columns: 4,
    gutter: '8px'
  },
  tablet: {
    columns: 8,
    gutter: '16px'
  },
  desktop: {
    columns: 12,
    gutter: '24px'
  },
  large: {
    columns: 16,
    gutter: '32px'
  }
};

// Export all responsive configurations
export const responsiveConfig = {
  breakpoints,
  responsiveSpacing,
  responsiveFontSizes,
  responsiveLayouts,
  touchOptimizations,
  multiMonitorSupport,
  mediaQueries,
  responsiveGrids
};

export default responsiveConfig;
