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
  
  // Enhanced natural motion easings based on Apple's spring animations
  springGentle: 'cubic-bezier(0.44, 0.00, 0.16, 1.00)', // Gentle spring effect
  springBouncy: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Bouncy spring effect
  materialStandard: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Material Design standard
  materialAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)', // Material Design acceleration
  materialDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)', // Material Design deceleration
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
  
  // Device-adaptive durations
  // These will be adjusted based on device performance
  adaptive: {
    ultraFast: { default: 50, lowPerformance: 0 },
    veryFast: { default: 100, lowPerformance: 50 },
    fast: { default: 150, lowPerformance: 100 },
    normal: { default: 200, lowPerformance: 150 },
    slow: { default: 300, lowPerformance: 200 },
    verySlow: { default: 500, lowPerformance: 300 },
    ultraSlow: { default: 800, lowPerformance: 500 },
  }
};

// GPU-accelerated transform animations
export const transforms = {
  // Scale transforms
  scaleUp: {
    initial: { transform: 'scale3d(0.95, 0.95, 1)', opacity: 0 },
    animate: { transform: 'scale3d(1, 1, 1)', opacity: 1 },
    exit: { transform: 'scale3d(0.95, 0.95, 1)', opacity: 0 },
  },
  scaleDown: {
    initial: { transform: 'scale3d(1.05, 1.05, 1)', opacity: 0 },
    animate: { transform: 'scale3d(1, 1, 1)', opacity: 1 },
    exit: { transform: 'scale3d(1.05, 1.05, 1)', opacity: 0 },
  },
  
  // Slide transforms - optimized with translate3d for GPU acceleration
  slideUp: {
    initial: { transform: 'translate3d(0, 20px, 0)', opacity: 0 },
    animate: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
    exit: { transform: 'translate3d(0, -20px, 0)', opacity: 0 },
  },
  slideDown: {
    initial: { transform: 'translate3d(0, -20px, 0)', opacity: 0 },
    animate: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
    exit: { transform: 'translate3d(0, 20px, 0)', opacity: 0 },
  },
  slideLeft: {
    initial: { transform: 'translate3d(20px, 0, 0)', opacity: 0 },
    animate: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
    exit: { transform: 'translate3d(-20px, 0, 0)', opacity: 0 },
  },
  slideRight: {
    initial: { transform: 'translate3d(-20px, 0, 0)', opacity: 0 },
    animate: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
    exit: { transform: 'translate3d(20px, 0, 0)', opacity: 0 },
  },
  
  // Fade transforms
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  // Combined transforms - optimized with translate3d for GPU acceleration
  slideUpAndFade: {
    initial: { transform: 'translate3d(0, 10px, 0)', opacity: 0 },
    animate: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
    exit: { transform: 'translate3d(0, -10px, 0)', opacity: 0 },
  },
  slideRightAndFade: {
    initial: { transform: 'translate3d(-10px, 0, 0)', opacity: 0 },
    animate: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
    exit: { transform: 'translate3d(10px, 0, 0)', opacity: 0 },
  },
  slideDownAndFade: {
    initial: { transform: 'translate3d(0, -10px, 0)', opacity: 0 },
    animate: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
    exit: { transform: 'translate3d(0, 10px, 0)', opacity: 0 },
  },
  slideLeftAndFade: {
    initial: { transform: 'translate3d(10px, 0, 0)', opacity: 0 },
    animate: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
    exit: { transform: 'translate3d(-10px, 0, 0)', opacity: 0 },
  },
  
  // 3D transforms for enhanced depth perception
  flip: {
    initial: { transform: 'perspective(400px) rotateY(90deg)', opacity: 0 },
    animate: { transform: 'perspective(400px) rotateY(0deg)', opacity: 1 },
    exit: { transform: 'perspective(400px) rotateY(-90deg)', opacity: 0 },
  },
  flipVertical: {
    initial: { transform: 'perspective(400px) rotateX(90deg)', opacity: 0 },
    animate: { transform: 'perspective(400px) rotateX(0deg)', opacity: 1 },
    exit: { transform: 'perspective(400px) rotateX(-90deg)', opacity: 0 },
  },
  rotateIn: {
    initial: { transform: 'perspective(400px) rotate3d(0, 1, 0, 90deg)', opacity: 0 },
    animate: { transform: 'perspective(400px) rotate3d(0, 1, 0, 0deg)', opacity: 1 },
    exit: { transform: 'perspective(400px) rotate3d(0, 1, 0, -90deg)', opacity: 0 },
  }
};

// CSS keyframes for complex animations - optimized for GPU acceleration
export const keyframes = {
  spin: `
    @keyframes spin {
      from { transform: rotate3d(0, 0, 1, 0deg); }
      to { transform: rotate3d(0, 0, 1, 360deg); }
    }
  `,
  pulse: `
    @keyframes pulse {
      0% { transform: scale3d(1, 1, 1); }
      50% { transform: scale3d(1.05, 1.05, 1); }
      100% { transform: scale3d(1, 1, 1); }
    }
  `,
  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translate3d(0, 0, 0); }
      50% { transform: translate3d(0, -10px, 0); }
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
  // New optimized keyframes
  floatAnimation: `
    @keyframes float {
      0% { transform: translate3d(0, 0, 0); }
      50% { transform: translate3d(0, -10px, 0); }
      100% { transform: translate3d(0, 0, 0); }
    }
  `,
  breathe: `
    @keyframes breathe {
      0%, 100% { transform: scale3d(1, 1, 1); opacity: 0.7; }
      50% { transform: scale3d(1.1, 1.1, 1); opacity: 1; }
    }
  `,
  slideInFromRight: `
    @keyframes slideInFromRight {
      0% { transform: translate3d(100%, 0, 0); }
      100% { transform: translate3d(0, 0, 0); }
    }
  `,
  slideInFromLeft: `
    @keyframes slideInFromLeft {
      0% { transform: translate3d(-100%, 0, 0); }
      100% { transform: translate3d(0, 0, 0); }
    }
  `,
  slideInFromTop: `
    @keyframes slideInFromTop {
      0% { transform: translate3d(0, -100%, 0); }
      100% { transform: translate3d(0, 0, 0); }
    }
  `,
  slideInFromBottom: `
    @keyframes slideInFromBottom {
      0% { transform: translate3d(0, 100%, 0); }
      100% { transform: translate3d(0, 0, 0); }
    }
  `,
};

// Animation presets for common UI elements
export const presets = {
  // Button animations
  button: {
    hover: {
      transform: 'translate3d(0, -2px, 0)',
      boxShadow: 'lg',
      transition: `all ${durations.fast}ms ${easings.easeOut}`,
    },
    active: {
      transform: 'translate3d(0, 0, 0)',
      boxShadow: 'md',
      transition: `all ${durations.fast}ms ${easings.easeOut}`,
    },
    tap: {
      transform: 'scale3d(0.98, 0.98, 1)',
      transition: `all ${durations.ultraFast}ms ${easings.easeOut}`,
    },
  },
  
  // Card animations
  card: {
    hover: {
      transform: 'translate3d(0, -4px, 0)',
      boxShadow: 'xl',
      transition: `all ${durations.normal}ms ${easings.easeOut}`,
    },
    tap: {
      transform: 'scale3d(0.98, 0.98, 1) translate3d(0, -2px, 0)',
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
      initial: { opacity: 0, transform: 'scale3d(0.95, 0.95, 1)' },
      animate: { 
        opacity: 1, 
        transform: 'scale3d(1, 1, 1)',
        transition: `all ${durations.normal}ms ${easings.easeOutBack}`,
      },
      exit: { 
        opacity: 0, 
        transform: 'scale3d(0.95, 0.95, 1)',
        transition: `all ${durations.fast}ms ${easings.easeIn}`,
      },
    },
  },
  
  // Toast/notification animations
  toast: {
    initial: { opacity: 0, transform: 'translate3d(0, 20px, 0)' },
    animate: { 
      opacity: 1, 
      transform: 'translate3d(0, 0, 0)',
      transition: `all ${durations.normal}ms ${easings.easeOut}`,
    },
    exit: { 
      opacity: 0, 
      transform: 'translate3d(0, -20px, 0)',
      transition: `all ${durations.normal}ms ${easings.easeIn}`,
    },
  },
  
  // List item animations (staggered children)
  listItem: {
    initial: { opacity: 0, transform: 'translate3d(10px, 0, 0)' },
    animate: (index) => ({ 
      opacity: 1, 
      transform: 'translate3d(0, 0, 0)',
      transition: {
        duration: durations.normal,
        ease: easings.easeOut,
        delay: index * 0.05, // Stagger effect
      },
    }),
    exit: { 
      opacity: 0, 
      transform: 'translate3d(-10px, 0, 0)',
      transition: `all ${durations.fast}ms ${easings.easeIn}`,
    },
  },
  
  // New animation presets
  drawer: {
    left: {
      initial: { transform: 'translate3d(-100%, 0, 0)' },
      animate: { 
        transform: 'translate3d(0, 0, 0)',
        transition: `transform ${durations.slow}ms ${easings.easeOutQuint}`,
      },
      exit: { 
        transform: 'translate3d(-100%, 0, 0)',
        transition: `transform ${durations.normal}ms ${easings.easeIn}`,
      },
    },
    right: {
      initial: { transform: 'translate3d(100%, 0, 0)' },
      animate: { 
        transform: 'translate3d(0, 0, 0)',
        transition: `transform ${durations.slow}ms ${easings.easeOutQuint}`,
      },
      exit: { 
        transform: 'translate3d(100%, 0, 0)',
        transition: `transform ${durations.normal}ms ${easings.easeIn}`,
      },
    },
    top: {
      initial: { transform: 'translate3d(0, -100%, 0)' },
      animate: { 
        transform: 'translate3d(0, 0, 0)',
        transition: `transform ${durations.slow}ms ${easings.easeOutQuint}`,
      },
      exit: { 
        transform: 'translate3d(0, -100%, 0)',
        transition: `transform ${durations.normal}ms ${easings.easeIn}`,
      },
    },
    bottom: {
      initial: { transform: 'translate3d(0, 100%, 0)' },
      animate: { 
        transform: 'translate3d(0, 0, 0)',
        transition: `transform ${durations.slow}ms ${easings.easeOutQuint}`,
      },
      exit: { 
        transform: 'translate3d(0, 100%, 0)',
        transition: `transform ${durations.normal}ms ${easings.easeIn}`,
      },
    },
  },
  
  // Dropdown menu
  dropdown: {
    initial: { opacity: 0, transform: 'scale3d(0.95, 0.95, 1) translate3d(0, -10px, 0)' },
    animate: { 
      opacity: 1, 
      transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
      transition: `all ${durations.fast}ms ${easings.easeOutBack}`,
    },
    exit: { 
      opacity: 0, 
      transform: 'scale3d(0.95, 0.95, 1) translate3d(0, -10px, 0)',
      transition: `all ${durations.veryFast}ms ${easings.easeIn}`,
    },
  },
  
  // Tooltip
  tooltip: {
    initial: { opacity: 0, transform: 'scale3d(0.9, 0.9, 1)' },
    animate: { 
      opacity: 1, 
      transform: 'scale3d(1, 1, 1)',
      transition: `all ${durations.veryFast}ms ${easings.easeOut}`,
    },
    exit: { 
      opacity: 0, 
      transform: 'scale3d(0.9, 0.9, 1)',
      transition: `all ${durations.veryFast}ms ${easings.easeIn}`,
    },
  },
  
  // Page transitions
  page: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: `opacity ${durations.slow}ms ${easings.easeOut}`,
    },
    exit: { 
      opacity: 0,
      transition: `opacity ${durations.normal}ms ${easings.easeIn}`,
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
    perspective: 1000,
  },
  
  // Enhanced GPU acceleration for complex animations
  enhancedGPU: {
    transform: 'translate3d(0, 0, 0)',
    backfaceVisibility: 'hidden',
    perspective: 1000,
    willChange: 'transform, opacity',
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
  
  // Device performance detection
  detectLowPerformanceDevice: () => {
    // Check if running in browser environment
    if (typeof window === 'undefined') return false;
    
    // Check for low-end devices based on hardware concurrency
    const isLowEndDevice = 
      navigator.hardwareConcurrency <= 4 || // 4 or fewer CPU cores
      /Android [4-6]/.test(navigator.userAgent) || // Older Android
      /iPhone OS [7-9]|iPhone OS 1[0-1]/.test(navigator.userAgent); // Older iOS
    
    return isLowEndDevice;
  },
  
  // Get appropriate duration based on device performance
  getAdaptiveDuration: (durationKey) => {
    const isLowPerformance = performanceUtils.detectLowPerformanceDevice();
    const durationObj = durations.adaptive[durationKey] || durations.adaptive.normal;
    
    return isLowPerformance ? durationObj.lowPerformance : durationObj.default;
  },
  
  // Optimize animations for current device
  optimizeForDevice: (animationStyle) => {
    const isLowPerformance = performanceUtils.detectLowPerformanceDevice();
    
    if (isLowPerformance) {
      // For low-performance devices, simplify animations
      return {
        ...animationStyle,
        transition: animationStyle.transition?.replace(
          /(\d+)ms/g, 
          (match, duration) => `${Math.max(parseInt(duration) * 0.7, 0)}ms`
        ),
      };
    }
    
    return animationStyle;
  },
  
  // Batch animations to reduce layout thrashing
  batchAnimations: (callback) => {
    if (typeof window === 'undefined') return;
    
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => {
        callback();
      });
    } else {
      callback();
    }
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

// Helper function to create adaptive transitions based on device performance
export const createAdaptiveTransition = (
  properties = ['all'],
  durationKey = 'normal',
  easing = easings.easeOut,
  delay = 0
) => {
  const duration = performanceUtils.getAdaptiveDuration(durationKey);
  const props = Array.isArray(properties) ? properties : [properties];
  
  return props
    .map(prop => `${prop} ${duration}ms ${easing} ${delay}ms`)
    .join(', ');
};

// Animation testing utilities
export const testUtils = {
  // Measure animation performance
  measurePerformance: (animationName, callback) => {
    if (typeof window === 'undefined' || !window.performance) return;
    
    const startTime = window.performance.now();
    
    // Execute the animation
    callback();
    
    // Use requestAnimationFrame to measure when animation completes
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const endTime = window.performance.now();
        console.log(`Animation '${animationName}' performance: ${endTime - startTime}ms`);
      });
    });
  },
  
  // Check for dropped frames
  detectDroppedFrames: (durationMs, callback) => {
    if (typeof window === 'undefined') return;
    
    let frameCount = 0;
    let startTime = null;
    let rafId = null;
    
    const countFrame = (timestamp) => {
      if (!startTime) startTime = timestamp;
      
      frameCount++;
      
      if (timestamp - startTime < durationMs) {
        rafId = window.requestAnimationFrame(countFrame);
      } else {
        // Animation finished
        const expectedFrames = (durationMs / 1000) * 60; // 60fps
        const droppedFrames = Math.max(0, expectedFrames - frameCount);
        const droppedPercentage = (droppedFrames / expectedFrames) * 100;
        
        console.log(`Animation metrics:
          - Duration: ${durationMs}ms
          - Frames rendered: ${frameCount}
          - Expected frames: ${expectedFrames.toFixed(1)}
          - Dropped frames: ${droppedFrames.toFixed(1)} (${droppedPercentage.toFixed(1)}%)
        `);
        
        callback && callback({
          duration: durationMs,
          framesRendered: frameCount,
          expectedFrames,
          droppedFrames,
          droppedPercentage
        });
      }
    };
    
    rafId = window.requestAnimationFrame(countFrame);
    
    // Return a function to cancel the measurement
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }
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
  createAdaptiveTransition,
  testUtils,
};

export default animations;
