/**
 * Utilities for improving color contrast and visual accessibility
 */

/**
 * Color contrast ratio requirements according to WCAG 2.1
 */
export enum ContrastRatioLevel {
  /**
   * Minimum contrast ratio for normal text (AA)
   */
  AA_NORMAL = 4.5,
  
  /**
   * Minimum contrast ratio for large text (AA)
   */
  AA_LARGE = 3,
  
  /**
   * Minimum contrast ratio for normal text (AAA)
   */
  AAA_NORMAL = 7,
  
  /**
   * Minimum contrast ratio for large text (AAA)
   */
  AAA_LARGE = 4.5,
}

/**
 * Color contrast check result
 */
export interface ContrastCheckResult {
  /**
   * The contrast ratio
   */
  ratio: number;
  
  /**
   * Whether the contrast ratio passes AA level for normal text
   */
  passesAA: boolean;
  
  /**
   * Whether the contrast ratio passes AA level for large text
   */
  passesAALarge: boolean;
  
  /**
   * Whether the contrast ratio passes AAA level for normal text
   */
  passesAAA: boolean;
  
  /**
   * Whether the contrast ratio passes AAA level for large text
   */
  passesAAALarge: boolean;
  
  /**
   * The foreground color
   */
  foreground: string;
  
  /**
   * The background color
   */
  background: string;
}

/**
 * RGB color
 */
export interface RGB {
  /**
   * Red component (0-255)
   */
  r: number;
  
  /**
   * Green component (0-255)
   */
  g: number;
  
  /**
   * Blue component (0-255)
   */
  b: number;
}

/**
 * HSL color
 */
export interface HSL {
  /**
   * Hue component (0-360)
   */
  h: number;
  
  /**
   * Saturation component (0-100)
   */
  s: number;
  
  /**
   * Lightness component (0-100)
   */
  l: number;
}

/**
 * A class for improving color contrast and visual accessibility
 */
export class ColorContrastUtils {
  /**
   * Checks if a color combination meets WCAG contrast requirements
   * @param foreground The foreground color (text color)
   * @param background The background color
   * @returns The contrast check result
   */
  checkContrast(foreground: string, background: string): ContrastCheckResult {
    const ratio = this.calculateContrastRatio(foreground, background);
    
    return {
      ratio,
      passesAA: ratio >= ContrastRatioLevel.AA_NORMAL,
      passesAALarge: ratio >= ContrastRatioLevel.AA_LARGE,
      passesAAA: ratio >= ContrastRatioLevel.AAA_NORMAL,
      passesAAALarge: ratio >= ContrastRatioLevel.AAA_LARGE,
      foreground,
      background,
    };
  }
  
  /**
   * Calculates the contrast ratio between two colors
   * @param foreground The foreground color (text color)
   * @param background The background color
   * @returns The contrast ratio
   */
  calculateContrastRatio(foreground: string, background: string): number {
    const fgRgb = this.parseColor(foreground);
    const bgRgb = this.parseColor(background);
    
    if (!fgRgb || !bgRgb) {
      return 1; // Default to lowest contrast
    }
    
    // Calculate luminance
    const fgLuminance = this.calculateRelativeLuminance(fgRgb);
    const bgLuminance = this.calculateRelativeLuminance(bgRgb);
    
    // Calculate contrast ratio
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  /**
   * Finds a color with sufficient contrast against a background color
   * @param background The background color
   * @param targetRatio The target contrast ratio
   * @param baseColor The base color to adjust (defaults to black or white)
   * @returns A color with sufficient contrast
   */
  findContrastingColor(
    background: string,
    targetRatio: number = ContrastRatioLevel.AA_NORMAL,
    baseColor?: string
  ): string {
    const bgRgb = this.parseColor(background);
    
    if (!bgRgb) {
      return '#000000';
    }
    
    // Calculate background luminance
    const bgLuminance = this.calculateRelativeLuminance(bgRgb);
    
    // Determine if we should start with black or white
    if (!baseColor) {
      baseColor = bgLuminance > 0.5 ? '#000000' : '#FFFFFF';
    }
    
    const baseRgb = this.parseColor(baseColor);
    
    if (!baseRgb) {
      return baseColor;
    }
    
    // Convert to HSL for easier adjustment
    const baseHsl = this.rgbToHsl(baseRgb);
    
    // Adjust lightness until we reach the target contrast ratio
    let adjustedHsl = { ...baseHsl };
    let adjustedColor = this.hslToHex(adjustedHsl);
    let ratio = this.calculateContrastRatio(adjustedColor, background);
    
    // If we're starting with black, increase lightness
    // If we're starting with white, decrease lightness
    const isStartingWithBlack = baseHsl.l < 50;
    
    // Binary search to find the optimal lightness
    let min = isStartingWithBlack ? 0 : targetRatio <= ratio ? baseHsl.l : 0;
    let max = isStartingWithBlack ? targetRatio <= ratio ? baseHsl.l : 100 : 100;
    
    for (let i = 0; i < 10; i++) {
      if (Math.abs(ratio - targetRatio) < 0.1) {
        break;
      }
      
      const mid = (min + max) / 2;
      adjustedHsl.l = mid;
      adjustedColor = this.hslToHex(adjustedHsl);
      ratio = this.calculateContrastRatio(adjustedColor, background);
      
      if (ratio < targetRatio) {
        if (isStartingWithBlack) {
          min = mid;
        } else {
          max = mid;
        }
      } else {
        if (isStartingWithBlack) {
          max = mid;
        } else {
          min = mid;
        }
      }
    }
    
    return adjustedColor;
  }
  
  /**
   * Adjusts a color to make it more accessible
   * @param color The color to adjust
   * @param options Options for adjustment
   * @returns An adjusted color
   */
  makeColorAccessible(
    color: string,
    options: {
      background?: string;
      targetRatio?: number;
      preserveHue?: boolean;
    } = {}
  ): string {
    const {
      background = '#FFFFFF',
      targetRatio = ContrastRatioLevel.AA_NORMAL,
      preserveHue = true,
    } = options;
    
    const colorRgb = this.parseColor(color);
    
    if (!colorRgb) {
      return color;
    }
    
    // Check current contrast
    const currentRatio = this.calculateContrastRatio(color, background);
    
    if (currentRatio >= targetRatio) {
      return color; // Already meets the target ratio
    }
    
    if (preserveHue) {
      // Convert to HSL
      const colorHsl = this.rgbToHsl(colorRgb);
      
      // Adjust lightness only
      const bgRgb = this.parseColor(background);
      
      if (!bgRgb) {
        return color;
      }
      
      const bgLuminance = this.calculateRelativeLuminance(bgRgb);
      
      // Determine if we need to lighten or darken the color
      const needsLightening = bgLuminance < 0.5;
      
      // Binary search to find the optimal lightness
      let min = needsLightening ? colorHsl.l : 0;
      let max = needsLightening ? 100 : colorHsl.l;
      let adjustedHsl = { ...colorHsl };
      let adjustedColor = this.hslToHex(adjustedHsl);
      let ratio = currentRatio;
      
      for (let i = 0; i < 10; i++) {
        if (ratio >= targetRatio) {
          break;
        }
        
        const mid = (min + max) / 2;
        adjustedHsl.l = mid;
        adjustedColor = this.hslToHex(adjustedHsl);
        ratio = this.calculateContrastRatio(adjustedColor, background);
        
        if (ratio < targetRatio) {
          if (needsLightening) {
            min = mid;
          } else {
            max = mid;
          }
        } else {
          if (needsLightening) {
            max = mid;
          } else {
            min = mid;
          }
        }
      }
      
      return adjustedColor;
    } else {
      // Use findContrastingColor with the original color as the base
      return this.findContrastingColor(background, targetRatio, color);
    }
  }
  
  /**
   * Generates a color palette with accessible colors
   * @param baseColor The base color for the palette
   * @param options Options for the palette
   * @returns An accessible color palette
   */
  generateAccessiblePalette(
    baseColor: string,
    options: {
      background?: string;
      targetRatio?: number;
      shades?: number;
    } = {}
  ): string[] {
    const {
      background = '#FFFFFF',
      targetRatio = ContrastRatioLevel.AA_NORMAL,
      shades = 10,
    } = options;
    
    const baseRgb = this.parseColor(baseColor);
    
    if (!baseRgb) {
      return [baseColor];
    }
    
    // Convert to HSL
    const baseHsl = this.rgbToHsl(baseRgb);
    
    // Generate shades
    const palette: string[] = [];
    
    for (let i = 0; i < shades; i++) {
      const lightness = (i / (shades - 1)) * 100;
      const shade = this.hslToHex({ ...baseHsl, l: lightness });
      
      // Check contrast
      const ratio = this.calculateContrastRatio(shade, background);
      
      if (ratio >= targetRatio) {
        palette.push(shade);
      } else {
        // Adjust the shade to meet the target ratio
        palette.push(this.makeColorAccessible(shade, { background, targetRatio }));
      }
    }
    
    return palette;
  }
  
  /**
   * Parses a CSS color string into RGB values
   * @param color The CSS color string
   * @returns The RGB values, or null if the color could not be parsed
   * @private
   */
  private parseColor(color: string): RGB | null {
    // Handle RGB and RGBA
    if (color.startsWith('rgb')) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
      if (match) {
        return {
          r: parseInt(match[1], 10),
          g: parseInt(match[2], 10),
          b: parseInt(match[3], 10),
        };
      }
    }
    
    // Handle hex colors
    if (color.startsWith('#')) {
      let hex = color.substring(1);
      
      // Convert shorthand hex to full hex
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      
      if (hex.length === 6) {
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
        };
      }
    }
    
    // For other formats, create a temporary element to get computed style
    if (typeof document !== 'undefined') {
      const tempElement = document.createElement('div');
      tempElement.style.color = color;
      document.body.appendChild(tempElement);
      const computedColor = window.getComputedStyle(tempElement).color;
      document.body.removeChild(tempElement);
      
      // Parse the computed color
      const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        return {
          r: parseInt(match[1], 10),
          g: parseInt(match[2], 10),
          b: parseInt(match[3], 10),
        };
      }
    }
    
    return null;
  }
  
  /**
   * Calculates the relative luminance of a color
   * @param rgb The RGB values of the color
   * @returns The relative luminance
   * @private
   */
  private calculateRelativeLuminance(rgb: RGB): number {
    // Convert RGB to sRGB
    const sRgb = {
      r: rgb.r / 255,
      g: rgb.g / 255,
      b: rgb.b / 255,
    };
    
    // Apply gamma correction
    const gammaCorrected = {
      r: sRgb.r <= 0.03928 ? sRgb.r / 12.92 : Math.pow((sRgb.r + 0.055) / 1.055, 2.4),
      g: sRgb.g <= 0.03928 ? sRgb.g / 12.92 : Math.pow((sRgb.g + 0.055) / 1.055, 2.4),
      b: sRgb.b <= 0.03928 ? sRgb.b / 12.92 : Math.pow((sRgb.b + 0.055) / 1.055, 2.4),
    };
    
    // Calculate luminance
    return 0.2126 * gammaCorrected.r + 0.7152 * gammaCorrected.g + 0.0722 * gammaCorrected.b;
  }
  
  /**
   * Converts RGB to HSL
   * @param rgb The RGB values
   * @returns The HSL values
   * @private
   */
  private rgbToHsl(rgb: RGB): HSL {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (delta !== 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      
      switch (max) {
        case r:
          h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
          break;
        case g:
          h = ((b - r) / delta + 2) * 60;
          break;
        case b:
          h = ((r - g) / delta + 4) * 60;
          break;
      }
    }
    
    return {
      h,
      s: s * 100,
      l: l * 100,
    };
  }
  
  /**
   * Converts HSL to RGB
   * @param hsl The HSL values
   * @returns The RGB values
   * @private
   */
  private hslToRgb(hsl: HSL): RGB {
    const h = hsl.h;
    const s = hsl.s / 100;
    const l = hsl.l / 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    
    let r = 0;
    let g = 0;
    let b = 0;
    
    if (h >= 0 && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h >= 60 && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h >= 180 && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h >= 240 && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (h >= 300 && h < 360) {
      r = c;
      g = 0;
      b = x;
    }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }
  
  /**
   * Converts HSL to hex
   * @param hsl The HSL values
   * @returns The hex color
   * @private
   */
  private hslToHex(hsl: HSL): string {
    const rgb = this.hslToRgb(hsl);
    return this.rgbToHex(rgb);
  }
  
  /**
   * Converts RGB to hex
   * @param rgb The RGB values
   * @returns The hex color
   * @private
   */
  private rgbToHex(rgb: RGB): string {
    const toHex = (value: number) => {
      const hex = Math.round(value).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }
}

// Create a singleton instance
export const colorContrastUtils = new ColorContrastUtils();

export default colorContrastUtils;
