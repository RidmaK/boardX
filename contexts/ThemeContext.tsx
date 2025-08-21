'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeSettings {
  theme: Theme;
  primaryColor: string;
  sidebarStyle: 'default' | 'compact' | 'mini';
  layoutStyle: 'default' | 'boxed' | 'wide';
}

interface ThemeContextType {
  settings: ThemeSettings;
  setTheme: (theme: Theme) => void;
  setPrimaryColor: (color: string) => void;
  setSidebarStyle: (style: 'default' | 'compact' | 'mini') => void;
  setLayoutStyle: (style: 'default' | 'boxed' | 'wide') => void;
  resetSettings: () => void;
}

const defaultSettings: ThemeSettings = {
  theme: 'light',
  primaryColor: '#3b82f6',
  sidebarStyle: 'default',
  layoutStyle: 'default',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }:any) => {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);

  useEffect(() => {
    const stored = localStorage.getItem('theme-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Error parsing stored theme settings:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme-settings', JSON.stringify(settings));
    
    // Apply theme to document
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply custom primary color to CSS variables
    const root = document.documentElement;
    const hsl = hexToHsl(settings.primaryColor);
    root.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    root.style.setProperty('--primary-foreground', hsl.l > 50 ? '0 0% 9%' : '0 0% 98%');
  }, [settings]);

  // Helper function to convert hex to HSL
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const setTheme = (theme: Theme) => {
    setSettings((prev: any) => ({ ...prev, theme }));
  };

  const setPrimaryColor = (primaryColor: string) => {
    setSettings((prev: any) => ({ ...prev, primaryColor }));
  };

  const setSidebarStyle = (sidebarStyle: 'default' | 'compact' | 'mini') => {
    setSettings((prev: any) => ({ ...prev, sidebarStyle }));
  };

  const setLayoutStyle = (layoutStyle: 'default' | 'boxed' | 'wide') => {
    setSettings((prev: any) => ({ ...prev, layoutStyle }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <ThemeContext.Provider value={{
      settings,
      setTheme,
      setPrimaryColor,
      setSidebarStyle,
      setLayoutStyle,
      resetSettings,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};