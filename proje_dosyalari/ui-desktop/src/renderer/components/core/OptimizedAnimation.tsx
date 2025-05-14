import React, { useRef, useEffect } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { motion, useAnimation, AnimationControls } from 'framer-motion';

// Optimized animation component that uses GPU acceleration
export interface OptimizedAnimationProps extends BoxProps {
  children: React.ReactNode;
  animationType?: 'fade' | 'slide' | 'scale' | 'rotate' | 'custom';
  duration?: number;
  delay?: number;
  easing?: string;
  reduceMotion?: boolean;
  customAnimation?: any;
  onAnimationComplete?: () => void;
}

// Create a component that uses hardware acceleration
export const OptimizedAnimation: React.FC<OptimizedAnimationProps> = ({
  children,
  animationType = 'fade',
  duration = 0.5,
  delay = 0,
  easing = 'easeOut',
  reduceMotion = false,
  customAnimation,
  onAnimationComplete,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const controls = useAnimation();
  const animationRef = useRef<AnimationControls>(controls);
  
  // Check for reduced motion preference
  const prefersReducedMotion = useRef<boolean>(
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false
  );
  
  // Define animations with GPU-accelerated properties
  const animations = {
    fade: {
      initial: { opacity: 0, transform: 'translateZ(0)' },
      animate: { opacity: 1, transform: 'translateZ(0)' },
    },
    slide: {
      initial: { opacity: 0, transform: 'translateX(-20px) translateZ(0)' },
      animate: { opacity: 1, transform: 'translateX(0) translateZ(0)' },
    },
    scale: {
      initial: { opacity: 0, transform: 'scale(0.9) translateZ(0)' },
      animate: { opacity: 1, transform: 'scale(1) translateZ(0)' },
    },
    rotate: {
      initial: { opacity: 0, transform: 'rotate(-10deg) translateZ(0)' },
      animate: { opacity: 1, transform: 'rotate(0) translateZ(0)' },
    },
    custom: customAnimation || {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
  };
  
  // Get the selected animation
  const selectedAnimation = animations[animationType];
  
  // Apply reduced motion if needed
  const finalAnimation = (reduceMotion || prefersReducedMotion.current) 
    ? { 
        initial: { opacity: 0 }, 
        animate: { opacity: 1 } 
      } 
    : selectedAnimation;
  
  // Start animation on mount
  useEffect(() => {
    const startAnimation = async () => {
      await animationRef.current.start(finalAnimation.animate, {
        duration,
        delay,
        ease: easing,
      });
      
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    };
    
    startAnimation();
  }, [duration, delay, easing, onAnimationComplete, finalAnimation.animate]);
  
  return (
    <Box 
      as={motion.div}
      initial={finalAnimation.initial}
      animate={controls}
      style={{ 
        willChange: 'transform, opacity', // Hint to browser for optimization
        backfaceVisibility: 'hidden', // Prevent flickering in some browsers
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

// Animation utilities for optimized performance
export const animationUtils = {
  // Create GPU-accelerated keyframes
  createGPUKeyframes: (keyframes: any) => {
    // Ensure transform properties use translateZ(0) for GPU acceleration
    return Object.entries(keyframes).reduce((acc, [key, value]) => {
      const newValue = { ...value };
      
      if (newValue.transform && !newValue.transform.includes('translateZ')) {
        newValue.transform = `${newValue.transform} translateZ(0)`;
      }
      
      return { ...acc, [key]: newValue };
    }, {});
  },
  
  // Create optimized timing functions
  createOptimizedTiming: (duration: number, easing: string = 'cubic-bezier(0.33, 1, 0.68, 1)') => {
    return {
      duration,
      easing,
      fill: 'forwards',
    };
  },
  
  // Check if device is low-powered
  isLowPoweredDevice: () => {
    if (typeof navigator === 'undefined') return true;
    
    // Check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    // Check for hardware concurrency (CPU cores)
    const hasLowCPU = navigator.hardwareConcurrency 
      ? navigator.hardwareConcurrency < 4 
      : true;
    
    return isMobile || hasLowCPU;
  },
  
  // Get appropriate animation settings based on device capability
  getDeviceAppropriateSettings: () => {
    const isLowPower = animationUtils.isLowPoweredDevice();
    
    return {
      duration: isLowPower ? 0.3 : 0.5,
      complexity: isLowPower ? 'simple' : 'complex',
      frameRate: isLowPower ? 30 : 60,
      useGPU: true,
    };
  },
};

export default OptimizedAnimation;
