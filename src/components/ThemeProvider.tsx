import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('healthcare-dark-mode');
    if (stored) {
      setDarkMode(JSON.parse(stored));
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('healthcare-dark-mode', JSON.stringify(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? 'hsl(210, 79%, 60%)' : 'hsl(210, 79%, 46%)',
        light: darkMode ? 'hsl(210, 79%, 70%)' : 'hsl(210, 79%, 56%)',
        dark: darkMode ? 'hsl(210, 79%, 50%)' : 'hsl(210, 79%, 36%)',
      },
      secondary: {
        main: darkMode ? 'hsl(174, 72%, 60%)' : 'hsl(174, 72%, 56%)',
        light: darkMode ? 'hsl(174, 72%, 70%)' : 'hsl(174, 72%, 66%)',
        dark: darkMode ? 'hsl(174, 72%, 50%)' : 'hsl(174, 72%, 46%)',
      },
      success: {
        main: darkMode ? 'hsl(142, 76%, 50%)' : 'hsl(142, 76%, 36%)',
      },
      warning: {
        main: darkMode ? 'hsl(45, 93%, 60%)' : 'hsl(45, 93%, 47%)',
      },
      error: {
        main: darkMode ? 'hsl(0, 84%, 70%)' : 'hsl(0, 84%, 60%)',
      },
      background: {
        default: darkMode ? 'hsl(210, 11%, 9%)' : 'hsl(210, 11%, 96%)',
        paper: darkMode ? 'hsl(210, 11%, 12%)' : 'hsl(0, 0%, 100%)',
      },
      text: {
        primary: darkMode ? 'hsl(210, 11%, 95%)' : 'hsl(210, 11%, 15%)',
        secondary: darkMode ? 'hsl(210, 11%, 75%)' : 'hsl(210, 11%, 35%)',
      },
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
        lineHeight: 1.3,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.4,
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: darkMode
              ? 'linear-gradient(135deg, hsl(210, 79%, 60%) 0%, hsl(174, 72%, 60%) 100%)'
              : 'linear-gradient(135deg, hsl(210, 79%, 46%) 0%, hsl(174, 72%, 56%) 100%)',
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${
              darkMode ? 'hsl(210, 11%, 20%)' : 'hsl(210, 11%, 85%)'
            }`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: darkMode
              ? 'linear-gradient(135deg, hsl(210, 11%, 12%) 0%, hsl(210, 11%, 15%) 100%)'
              : 'linear-gradient(135deg, hsl(0, 0%, 100%) 0%, hsl(210, 11%, 93%) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            boxShadow: darkMode
              ? '0 10px 15px -3px hsl(0 0% 0% / 0.35), 0 4px 6px -2px hsl(0 0% 0% / 0.25)'
              : '0 10px 15px -3px hsl(210 79% 46% / 0.1), 0 4px 6px -2px hsl(210 79% 46% / 0.05)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            transition: 'all 0.3s ease-out',
          },
          contained: {
            boxShadow: 'var(--shadow-md)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 'var(--shadow-lg)',
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            '&.Mui-selected': {
              fontWeight: 700,
            },
          },
        },
      },
    },
    shape: {
      borderRadius: 12,
    },
  });

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};