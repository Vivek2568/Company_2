import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Force light theme only. Keep API (toggleTheme) as a no-op so components
  // that call it won't break, but dark mode will never be applied.
  const theme = 'light';

  useEffect(() => {
    // Ensure `.dark` class is removed if present and do not add it.
    document.documentElement.classList.remove('dark');
    // keep a light marker if needed
    document.documentElement.classList.add('light');
    try {
      localStorage.setItem('theme', 'light');
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  const toggleTheme = () => {
    // no-op: theme toggling disabled to enforce consistent light UI
    return;
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
