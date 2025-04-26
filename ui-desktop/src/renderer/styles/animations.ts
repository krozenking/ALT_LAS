// Animation utilities for optimized performance
// This file contains GPU-accelerated animations and optimized timing functions

// Define standard easing functions
export const easings = {
  // Standard easings
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Custom easings for more natural motion
  easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Slight overshoot
  easeOutElastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Elastic bounce
  easeInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)', // Strong acceleration
  easeOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)', // Strong deceleration
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)', // Smooth acceleration-deceleration
};

// Define standard durations (in ms)
export const durations = {
  ultraFast: 50,
  veryFast: 100,
  fast: 150,
  normal: 200,
  slow: 300,
  verySlow: 500,
  ultraSlow: 800,
};

// GPU-accelerated transform animations
export const transforms = {
  // Scale transforms
  scaleUp: {
    initial: { transform: 'scale(0.95)', opacity: 0 },
    animate: { transform: 'scale(1)', opacity: 1 },
    exit: { transform: 'scale(0.95)', opacity: 0 },
  },
  scaleDown: {
    initial: { transform: 'scale(1.05)', opacity: 0 },
    animate: { transform: 'scale(1)', opacity: 1 },
    exit: { transform: 'scale(1.05)', opacity: 0 },
  },
  
  // Slide transforms
  slideUp: {
    initial: { transform: 'translateY(20px)', opacity: 0 },
    animate: { transform: 'translateY(0)', opacity: 1 },
    exit: { transform: 'translateY(-20px)', opacity: 0 },
  },
  slideDown: {
    initial: { transform: 'translateY(-20px)', opacity: 0 },
    animate: { transform: 'translateY(0)', opacity: 1 },
    exit: { transform: 'translateY(20px)', opacity: 0 },
  },
  slideLeft: {
    initial: { transform: 'translateX(20px)', opacity: 0 },
    animate: { transform: 'translateX(0)', opacity: 1 },
    exit: { transform: 'translateX(-20px)', opacity: 0 },
  },
  slideRight: {
    initial: { transform: 'translateX(-20px)', opacity: 0 },
    animate: { transform: 'translateX(0)', opacity: 1 },
    exit: { transform: 'translateX(20px)', opacity: 0 },
  },
  
  // Fade transforms
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  // Combined transforms
  slideUpAndFade: {
    initial: { transform: 'translateY(10px)', opacity: 0 },
    animate: { transform: 'translateY(0)', opacity: 1 },
    exit: { transform: 'translateY(-10px)', opacity: 0 },
  },
  slideRightAndFade: {
    initial: { transform: 'translateX(-10px)', opacity: 0 },
    animate: { transform: 'translateX(0)', opacity: 1 },
    exit: { transform: 'translateX(10px)', opacity: 0 },
  },
  slideDownAndFade: {
    initial: { transform: 'translateY(-10px)', opacity: 0 },
    animate: { transform: 'translateY(0)', opacity: 1 },
    exit: { transform: 'translateY(10px)', opacity: 0 },
  },
  slideLeftAndFade: {
    initial: { transform: 'translateX(10px)', opacity: 0 },
    animate: { transform: 'translateX(0)', opacity: 1 },
    exit: { transform: 'translateX(-10px)', opacity: 0 },
  },
};

// CSS keyframes for complex animations
export const keyframes = {
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  pulse: `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `,
  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `,
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  fadeOut: `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `,
  shimmer: `
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
  `,
};

// Animation presets for common UI elements
export const presets = {
  // Button animations
  button: {
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: 'lg',
      transition: `all ${durations.fast}ms ${easings.easeOut}`,
    },
    active: {
      transform: 'translateY(0)',
      boxShadow: 'md',
      transition: `all ${durations.fast}ms ${easings.easeOut}`,
    },
    tap: {
      transform: 'scale(0.98)',
      transition: `all ${durations.ultraFast}ms ${easings.easeOut}`,
    },
  },
  
  // Card animations
  card: {
    hover: {
      transform: 'translateY(-4px)',
      boxShadow: 'xl',
      transition: `all ${durations.normal}ms ${easings.easeOut}`,
    },
    tap: {
      transform: 'scale(0.98) translateY(-2px)',
      transition: `all ${durations.fast}ms ${easings.easeOut}`,
    },
  },
  
  // Modal animations
  modal: {
    overlay: {
      initial: { opacity: 0 },
      animate: { 
        opacity: 1,
        transition: `opacity ${durations.normal}ms ${easings.easeOut}`,
      },
      exit: { 
        opacity: 0,
        transition: `opacity ${durations.fast}ms ${easings.easeIn}`,
      },
    },
    content: {
      initial: { opacity: 0, transform: 'scale(0.95)' },
      animate: { 
        opacity: 1, 
        transform: 'scale(1)',
        transition: `all ${durations.normal}ms ${easings.easeOutBack}`,
      },
      exit: { 
        opacity: 0, 
        transform: 'scale(0.95)',
        transition: `all ${durations.fast}ms ${easings.easeIn}`,
      },
    },
  },
  
  // Toast/notification animations
  toast: {
    initial: { opacity: 0, transform: 'translateY(20px)' },
    animate: { 
      opacity: 1, 
      transform: 'translateY(0)',
      transition: `all ${durations.normal}ms ${easings.easeOut}`,
    },
    exit: { 
      opacity: 0, 
      transform: 'translateY(-20px)',
      transition: `all ${durations.normal}ms ${easings.easeIn}`,
    },
  },
  
  // List item animations (staggered children)
  listItem: {
    initial: { opacity: 0, transform: 'translateX(10px)' },
    animate: (index) => ({ 
      opacity: 1, 
      transform: 'translateX(0)',
      transition: {
        duration: durations.normal,
        ease: easings.easeOut,
        delay: index * 0.05, // Stagger effect
      },
    }),
    exit: { 
      opacity: 0, 
      transform: 'translateX(-10px)',
      transition: `all ${durations.fast}ms ${easings.easeIn}`,
    },
  },
};

// Performance optimization utilities
export const performanceUtils = {
  // Use will-change to hint the browser about properties that will animate
  willChange: (properties) => ({
    willChange: Array.isArray(properties) ? properties.join(', ') : properties,
  }),
  
  // Force GPU acceleration
  forceGPU: {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
  },
  
  // Reduce animation for users who prefer reduced motion
  respectReducedMotion: (styles) => ({
    '@media (prefers-reduced-motion: reduce)': {
      ...styles,
    },
  }),
  
  // Alternative animations for reduced motion preference
  reducedMotionAlternatives: {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    instant: {
      initial: {},
      animate: {},
      exit: {},
    },
  },
};

// Helper function to create transition strings
export const createTransition = (
  properties = ['all'],
  duration = durations.normal,
  easing = easings.easeOut,
  delay = 0
) => {
  const props = Array.isArray(properties) ? properties : [properties];
  return props
    .map(prop => `${prop} ${duration}ms ${easing} ${delay}ms`)
    .join(', ');
};

// Export all animation utilities
export const animations = {
  easings,
  durations,
  transforms,
  keyframes,
  presets,
  performanceUtils,
  createTransition,
};

export default animations;
