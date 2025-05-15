// Animation utilities for optimized performance
// This file contains GPU-accelerated animations, optimized timing functions, and accessibility considerations.

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
  // These will be adjusted based on device performance and reduced motion preference
  adaptive: {
    ultraFast: { default: 50, lowPerformance: 0, reducedMotion: 0 },
    veryFast: { default: 100, lowPerformance: 50, reducedMotion: 0 },
    fast: { default: 150, lowPerformance: 100, reducedMotion: 50 },
    normal: { default: 200, lowPerformance: 150, reducedMotion: 100 },
    slow: { default: 300, lowPerformance: 200, reducedMotion: 150 },
    verySlow: { default: 500, lowPerformance: 300, reducedMotion: 200 },
    ultraSlow: { default: 800, lowPerformance: 500, reducedMotion: 300 },
  }
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
  
  // Check if reduced motion is preferred
  prefersReducedMotion: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
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
    // Simple slide (less distance)
    simpleSlideUp: {
      initial: { transform: 'translate3d(0, 5px, 0)', opacity: 0 },
      animate: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
      exit: { transform: 'translate3d(0, -5px, 0)', opacity: 0 },
    },
    simpleSlideDown: {
      initial: { transform: 'translate3d(0, -5px, 0)', opacity: 0 },
      animate: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
      exit: { transform: 'translate3d(0, 5px, 0)', opacity: 0 },
    },
    simpleSlideLeft: {
      initial: { transform: 'translate3d(5px, 0, 0)', opacity: 0 },
      animate: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
      exit: { transform: 'translate3d(-5px, 0, 0)', opacity: 0 },
    },
    simpleSlideRight: {
      initial: { transform: 'translate3d(-5px, 0, 0)', opacity: 0 },
      animate: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
      exit: { transform: 'translate3d(5px, 0, 0)', opacity: 0 },
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
  
  // Get appropriate duration based on device performance and reduced motion preference
  getAdaptiveDuration: (durationKey) => {
    const prefersReduced = performanceUtils.prefersReducedMotion();
    const isLowPerformance = performanceUtils.detectLowPerformanceDevice();
    const durationObj = durations.adaptive[durationKey] || durations.adaptive.normal;
    
    if (prefersReduced) {
      return durationObj.reducedMotion;
    }
    if (isLowPerformance) {
      return durationObj.lowPerformance;
    }
    return durationObj.default;
  },
  
  // Get appropriate animation variant based on reduced motion preference
  getReducedMotionVariant: (standardVariant, reducedVariant = performanceUtils.reducedMotionAlternatives.fade) => {
    return performanceUtils.prefersReducedMotion() ? reducedVariant : standardVariant;
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

// GPU-accelerated transform animations
// These are the base definitions, reduced motion alternatives are applied via getReducedMotionVariant
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
  
  // 3D transforms for enhanced depth perception (use with caution for performance)
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
// Note: Keyframes are harder to adapt dynamically for reduced motion. Use sparingly or provide alternative static states.
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

// Helper function to create transition strings with adaptive duration
export const createAdaptiveTransition = (
  properties = ['all'],
  durationKey = 'normal',
  easing = easings.easeOut,
  delay = 0
) => {
  const duration = performanceUtils.getAdaptiveDuration(durationKey);
  const props = Array.isArray(properties) ? properties : [properties];
  
  // If duration is 0 (reduced motion ultraFast/veryFast), return empty string or minimal transition
  if (duration <= 0) {
    return 'none'; // Or a very short opacity transition if needed: 'opacity 50ms linear'
  }
  
  return props
    .map(prop => `${prop} ${duration}ms ${easing} ${delay}ms`)
    .join(', ');
};

// Animation presets for common UI elements - incorporating reduced motion and adaptive duration
export const presets = {
  // Button animations
  button: {
    hover: performanceUtils.prefersReducedMotion() ? {} : {
      transform: 'translate3d(0, -2px, 0)',
      boxShadow: 'lg',
      transition: createAdaptiveTransition(['transform', 'box-shadow'], 'fast', easings.easeOut),
    },
    active: performanceUtils.prefersReducedMotion() ? {} : {
      transform: 'translate3d(0, 0, 0)',
      boxShadow: 'md',
      transition: createAdaptiveTransition(['transform', 'box-shadow'], 'fast', easings.easeOut),
    },
    tap: performanceUtils.prefersReducedMotion() ? {} : {
      transform: 'scale3d(0.98, 0.98, 1)',
      transition: createAdaptiveTransition('transform', 'ultraFast', easings.easeOut),
    },
  },
  
  // Card animations
  card: {
    hover: performanceUtils.prefersReducedMotion() ? {} : {
      transform: 'translate3d(0, -4px, 0)',
      boxShadow: 'xl',
      transition: createAdaptiveTransition(['transform', 'box-shadow'], 'normal', easings.easeOut),
    },
    tap: performanceUtils.prefersReducedMotion() ? {} : {
      transform: 'scale3d(0.98, 0.98, 1) translate3d(0, -2px, 0)',
      transition: createAdaptiveTransition('transform', 'fast', easings.easeOut),
    },
  },
  
  // Modal animations
  modal: {
    overlay: {
      initial: { opacity: 0 },
      animate: { 
        opacity: 1,
        transition: `opacity ${performanceUtils.getAdaptiveDuration('normal')}ms ${easings.easeOut}`,
      },
      exit: { 
        opacity: 0,
        transition: `opacity ${performanceUtils.getAdaptiveDuration('fast')}ms ${easings.easeIn}`,
      },
    },
    content: performanceUtils.getReducedMotionVariant(
      { // Standard
        initial: { opacity: 0, transform: 'scale3d(0.95, 0.95, 1)' },
        animate: { 
          opacity: 1, 
          transform: 'scale3d(1, 1, 1)',
          transition: `all ${performanceUtils.getAdaptiveDuration('normal')}ms ${easings.easeOutBack}`,
        },
        exit: { 
          opacity: 0, 
          transform: 'scale3d(0.95, 0.95, 1)',
          transition: `all ${performanceUtils.getAdaptiveDuration('fast')}ms ${easings.easeIn}`,
        },
      },
      performanceUtils.reducedMotionAlternatives.fade // Reduced motion: simple fade
    ),
  },
  
  // Toast/notification animations
  toast: performanceUtils.getReducedMotionVariant(
    { // Standard
      initial: { opacity: 0, transform: 'translate3d(0, 20px, 0)' },
      animate: { 
        opacity: 1, 
        transform: 'translate3d(0, 0, 0)',
        transition: `all ${performanceUtils.getAdaptiveDuration('normal')}ms ${easings.easeOut}`,
      },
      exit: { 
        opacity: 0, 
        transform: 'translate3d(0, -20px, 0)',
        transition: `all ${performanceUtils.getAdaptiveDuration('normal')}ms ${easings.easeIn}`,
      },
    },
    performanceUtils.reducedMotionAlternatives.fade // Reduced motion: simple fade
  ),
  
  // List item animations (staggered children)
  listItem: {
    initial: performanceUtils.prefersReducedMotion() ? { opacity: 0 } : { opacity: 0, transform: 'translate3d(10px, 0, 0)' },
    animate: (index) => ({
      opacity: 1,
      transform: performanceUtils.prefersReducedMotion() ? 'none' : 'translate3d(0, 0, 0)',
      transition: {
        duration: performanceUtils.getAdaptiveDuration('normal'),
        ease: easings.easeOut,
        delay: performanceUtils.prefersReducedMotion() ? 0 : index * 0.05, // No stagger if reduced motion
      },
    }),
    exit: performanceUtils.prefersReducedMotion() ? { opacity: 0 } : { 
      opacity: 0, 
      transform: 'translate3d(-10px, 0, 0)',
      transition: `all ${performanceUtils.getAdaptiveDuration('fast')}ms ${easings.easeIn}`,
    },
  },
  
  // Drawer animations
  drawer: {
    left: performanceUtils.getReducedMotionVariant(
      { // Standard
        initial: { transform: 'translate3d(-100%, 0, 0)' },
        animate: { 
          transform: 'translate3d(0, 0, 0)',
          transition: `transform ${performanceUtils.getAdaptiveDuration('slow')}ms ${easings.easeOutQuint}`,
        },
        exit: { 
          transform: 'translate3d(-100%, 0, 0)',
          transition: `transform ${performanceUtils.getAdaptiveDuration('normal')}ms ${easings.easeIn}`,
        },
      },
      performanceUtils.reducedMotionAlternatives.fade // Reduced motion: simple fade
    ),
    right: performanceUtils.getReducedMotionVariant(
      { // Standard
        initial: { transform: 'translate3d(100%, 0, 0)' },
        animate: { 
          transform: 'translate3d(0, 0, 0)',
          transition: `transform ${performanceUtils.getAdaptiveDuration('slow')}ms ${easings.easeOutQuint}`,
        },
        exit: { 
          transform: 'translate3d(100%, 0, 0)',
          transition: `transform ${performanceUtils.getAdaptiveDuration('normal')}ms ${easings.easeIn}`,
        },
      },
      performanceUtils.reducedMotionAlternatives.fade // Reduced motion: simple fade
    ),
    top: performanceUtils.getReducedMotionVariant(
      { // Standard
        initial: { transform: 'translate3d(0, -100%, 0)' },
        animate: { 
          transform: 'translate3d(0, 0, 0)',
          transition: `transform ${performanceUtils.getAdaptiveDuration('slow')}ms ${easings.easeOutQuint}`,
        },
        exit: { 
          transform: 'translate3d(0, -100%, 0)',
          transition: `transform ${performanceUtils.getAdaptiveDuration('normal')}ms ${easings.easeIn}`,
        },
      },
      performanceUtils.reducedMotionAlternatives.fade // Reduced motion: simple fade
    ),
    bottom: performanceUtils.getReducedMotionVariant(
      { // Standard
        initial: { transform: 'translate3d(0, 100%, 0)' },
        animate: { 
          transform: 'translate3d(0, 0, 0)',
          transition: `transform ${performanceUtils.getAdaptiveDuration('slow')}ms ${easings.easeOutQuint}`,
        },
        exit: { 
          transform: 'translate3d(0, 100%, 0)',
          transition: `transform ${performanceUtils.getAdaptiveDuration('normal')}ms ${easings.easeIn}`,
        },
      },
      performanceUtils.reducedMotionAlternatives.fade // Reduced motion: simple fade
    ),
  },
  
  // Dropdown menu
  dropdown: performanceUtils.getReducedMotionVariant(
    { // Standard
      initial: { opacity: 0, transform: 'scale3d(0.95, 0.95, 1) translate3d(0, -10px, 0)' },
      animate: { 
        opacity: 1, 
        transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
        transition: `all ${performanceUtils.getAdaptiveDuration('fast')}ms ${easings.easeOutBack}`,
      },
      exit: { 
        opacity: 0, 
        transform: 'scale3d(0.95, 0.95, 1) translate3d(0, -10px, 0)',
        transition: `all ${performanceUtils.getAdaptiveDuration('veryFast')}ms ${easings.easeIn}`,
      },
    },
    performanceUtils.reducedMotionAlternatives.fade // Reduced motion: simple fade
  ),
  
  // Tooltip
  tooltip: performanceUtils.getReducedMotionVariant(
    { // Standard
      initial: { opacity: 0, transform: 'scale3d(0.9, 0.9, 1)' },
      animate: { 
        opacity: 1, 
        transform: 'scale3d(1, 1, 1)',
        transition: `all ${performanceUtils.getAdaptiveDuration('veryFast')}ms ${easings.easeOut}`,
      },
      exit: { 
        opacity: 0, 
        transform: 'scale3d(0.9, 0.9, 1)',
        transition: `all ${performanceUtils.getAdaptiveDuration('veryFast')}ms ${easings.easeIn}`,
      },
    },
    performanceUtils.reducedMotionAlternatives.fade // Reduced motion: simple fade
  ),
  
  // Page transitions
  page: performanceUtils.getReducedMotionVariant(
    { // Standard
      initial: { opacity: 0 },
      animate: { 
        opacity: 1,
        transition: `opacity ${performanceUtils.getAdaptiveDuration('slow')}ms ${easings.easeOut}`,
      },
      exit: { 
        opacity: 0,
        transition: `opacity ${performanceUtils.getAdaptiveDuration('normal')}ms ${easings.easeIn}`,
      },
    },
    performanceUtils.reducedMotionAlternatives.fade // Reduced motion: simple fade
  ),
};

// Export all utilities and presets
export const animations = {
  easings,
  durations,
  transforms,
  keyframes,
  presets,
  performanceUtils,
  createAdaptiveTransition,
};

