// src/theme.js
import { createTheme } from '@mui/material/styles';

export const getCustomTheme = (mode) => 
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#D74205', 
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
            // Adapts card borders elegantly between light and dark modes
            borderColor: mode === 'dark' ? '#332a24' : '#f0e6df', 
          },
        },
      },
    },
  });
