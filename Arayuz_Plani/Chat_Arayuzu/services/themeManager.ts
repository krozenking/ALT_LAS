/**
 * Theme Manager Service
 * 
 * This service manages theme settings for the chat application.
 * It handles:
 * - Theme switching (light/dark/system)
 * - Custom theme settings
 * - Theme persistence
 */

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Theme interface
export interface Theme {
  colors: {
    primary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    background: {
      default: string;
      paper: string;
      light: string;
      dark: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
      hint: string;
    };
    status: {
      online: string;
      away: string;
      offline: string;
      error: string;
      success: string;
      warning: string;
      info: string;
    };
    border: {
      light: string;
      main: string;
      dark: string;
    };
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    fontWeight: {
      light: number;
      regular: number;
      medium: number;
      semiBold: number;
      bold: number;
    };
    lineHeight: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    round: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    duration: {
      short: string;
      medium: string;
      long: string;
    };
    easing: {
      easeInOut: string;
      easeOut: string;
      easeIn: string;
      sharp: string;
    };
  };
  zIndex: {
    appBar: number;
    drawer: number;
    modal: number;
    snackbar: number;
    tooltip: number;
  };
}

class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeMode = 'system';
  private isDarkMode: boolean = false;
  private listeners: { [key: string]: Function[] } = {
    'themeChange': [],
  };
  
  private constructor() {
    this.loadThemeFromStorage();
    this.setupSystemThemeListener();
    this.applyTheme();
  }
  
  // Get singleton instance
  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }
  
  // Load theme from local storage
  private loadThemeFromStorage(): void {
    try {
      const storedTheme = localStorage.getItem('theme_mode');
      if (storedTheme && this.isValidThemeMode(storedTheme)) {
        this.currentTheme = storedTheme as ThemeMode;
      }
    } catch (error) {
      console.error('Error loading theme from storage:', error);
    }
  }
  
  // Check if theme mode is valid
  private isValidThemeMode(mode: string): mode is ThemeMode {
    return ['light', 'dark', 'system'].includes(mode);
  }
  
  // Set up system theme listener
  private setupSystemThemeListener(): void {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial dark mode based on system preference if theme is set to 'system'
    if (this.currentTheme === 'system') {
      this.isDarkMode = mediaQuery.matches;
    } else {
      this.isDarkMode = this.currentTheme === 'dark';
    }
    
    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      if (this.currentTheme === 'system') {
        this.isDarkMode = e.matches;
        this.applyTheme();
        this.notifyListeners('themeChange', this.getTheme());
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
  }
  
  // Apply current theme to document
  private applyTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }
  }
  
  // Get current theme mode
  public getThemeMode(): ThemeMode {
    return this.currentTheme;
  }
  
  // Check if dark mode is active
  public isDarkModeActive(): boolean {
    return this.isDarkMode;
  }
  
  // Set theme mode
  public setThemeMode(mode: ThemeMode): void {
    if (this.currentTheme === mode) {
      return;
    }
    
    this.currentTheme = mode;
    
    // Update dark mode based on new theme
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.isDarkMode = mediaQuery.matches;
    } else {
      this.isDarkMode = mode === 'dark';
    }
    
    // Save theme to local storage
    try {
      localStorage.setItem('theme_mode', mode);
    } catch (error) {
      console.error('Error saving theme to storage:', error);
    }
    
    // Apply theme
    this.applyTheme();
    
    // Notify listeners
    this.notifyListeners('themeChange', this.getTheme());
  }
  
  // Get theme object
  public getTheme(): Theme {
    return this.isDarkMode ? this.getDarkTheme() : this.getLightTheme();
  }
  
  // Get light theme
  private getLightTheme(): Theme {
    return {
      colors: {
        primary: {
          main: '#0084ff',
          light: '#4da3ff',
          dark: '#0066cc',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#f7b928',
          light: '#ffd166',
          dark: '#c48800',
          contrastText: '#000000',
        },
        background: {
          default: '#f0f2f5',
          paper: '#ffffff',
          light: '#f5f7fb',
          dark: '#e0e0e0',
        },
        text: {
          primary: '#050505',
          secondary: '#65676b',
          disabled: '#8e8e8e',
          hint: '#8e8e8e',
        },
        status: {
          online: '#31a24c',
          away: '#f7b928',
          offline: '#8e8e8e',
          error: '#ff3b30',
          success: '#31a24c',
          warning: '#f7b928',
          info: '#0084ff',
        },
        border: {
          light: '#e0e0e0',
          main: '#d0d0d0',
          dark: '#b0b0b0',
        },
      },
      typography: {
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        fontSize: {
          xs: '0.75rem',    // 12px
          sm: '0.875rem',   // 14px
          md: '1rem',       // 16px
          lg: '1.125rem',   // 18px
          xl: '1.25rem',    // 20px
          xxl: '1.5rem',    // 24px
        },
        fontWeight: {
          light: 300,
          regular: 400,
          medium: 500,
          semiBold: 600,
          bold: 700,
        },
        lineHeight: {
          xs: 1.2,
          sm: 1.4,
          md: 1.5,
          lg: 1.6,
          xl: 1.8,
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        round: '50%',
      },
      shadows: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
      },
      transitions: {
        duration: {
          short: '0.2s',
          medium: '0.3s',
          long: '0.5s',
        },
        easing: {
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
          easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        },
      },
      zIndex: {
        appBar: 1100,
        drawer: 1200,
        modal: 1300,
        snackbar: 1400,
        tooltip: 1500,
      },
    };
  }
  
  // Get dark theme
  private getDarkTheme(): Theme {
    return {
      colors: {
        primary: {
          main: '#0084ff',
          light: '#4da3ff',
          dark: '#0066cc',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#f7b928',
          light: '#ffd166',
          dark: '#c48800',
          contrastText: '#000000',
        },
        background: {
          default: '#18191a',
          paper: '#242526',
          light: '#3a3b3c',
          dark: '#121212',
        },
        text: {
          primary: '#e4e6eb',
          secondary: '#b0b3b8',
          disabled: '#777777',
          hint: '#777777',
        },
        status: {
          online: '#31a24c',
          away: '#f7b928',
          offline: '#8e8e8e',
          error: '#ff3b30',
          success: '#31a24c',
          warning: '#f7b928',
          info: '#0084ff',
        },
        border: {
          light: '#3a3b3c',
          main: '#3a3b3c',
          dark: '#4a4b4c',
        },
      },
      typography: {
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        fontSize: {
          xs: '0.75rem',    // 12px
          sm: '0.875rem',   // 14px
          md: '1rem',       // 16px
          lg: '1.125rem',   // 18px
          xl: '1.25rem',    // 20px
          xxl: '1.5rem',    // 24px
        },
        fontWeight: {
          light: 300,
          regular: 400,
          medium: 500,
          semiBold: 600,
          bold: 700,
        },
        lineHeight: {
          xs: 1.2,
          sm: 1.4,
          md: 1.5,
          lg: 1.6,
          xl: 1.8,
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        round: '50%',
      },
      shadows: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.3)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.3)',
      },
      transitions: {
        duration: {
          short: '0.2s',
          medium: '0.3s',
          long: '0.5s',
        },
        easing: {
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
          easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        },
      },
      zIndex: {
        appBar: 1100,
        drawer: 1200,
        modal: 1300,
        snackbar: 1400,
        tooltip: 1500,
      },
    };
  }
  
  // Add event listener
  public addEventListener(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    } else {
      this.listeners[event] = [callback];
    }
  }
  
  // Remove event listener
  public removeEventListener(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
  
  // Notify listeners of an event
  private notifyListeners(event: string, data?: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export const themeManager = ThemeManager.getInstance();
