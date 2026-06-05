import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeModeContext = createContext(null);

export function ThemeModeProvider({ children }) {
  // 1. Explicitly default to 'light' to prevent native browser overrides
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const savedMode = localStorage.getItem('trackcash_theme_mode');
    if (savedMode === 'light' || savedMode === 'dark') {
      setMode(savedMode);
    }
  }, []);

  const toggleThemeMode = () => {
    setMode((prevMode) => {
      const nextMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('trackcash_theme_mode', nextMode);
      return nextMode;
    });
  };

  // 2. Generate the theme layout configuration metrics inline for atomic speed
  const customTheme = createTheme({
    palette: {
      mode: mode,
      primary: {
        main: '#D74205', // Your exact wallet brand orange
      },
      secondary: {
        main: mode === 'dark' ? '#90caf9' : '#1565c0',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#fbf7f4',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderColor: mode === 'dark' ? '#332a24' : '#f0e6df',
          },
        },
      },
    },
  });

  return (
    <ThemeModeContext.Provider value={{ mode, toggleThemeMode }}>
      <MuiThemeProvider theme={customTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
