import { createTheme } from '@mui/material/styles';

const appleTheme = createTheme({
  palette: {
    primary: {
      main: '#001978',
      light: '#1a3390',
      dark: '#001160',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#86868B',
      light: '#9999A0',
      dark: '#6E6E73',
    },
    error: {
      main: '#FF3B30',
    },
    warning: {
      main: '#FF9500',
    },
    success: {
      main: '#34C759',
    },
    background: {
      default: '#f5f5f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#1D1D1F',
      secondary: '#86868B',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#001978',
          color: '#ffffff',
          borderRadius: 0,
          position: 'sticky',
          top: 0,
          zIndex: 1100,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e0e0e0',
          '@media (max-width:500px)': {
            padding: '8px',
          },
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f5f5f7',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
        bar: {
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '24px',
          fontWeight: 600,
          letterSpacing: '-0.003em',
          padding: '24px 32px 16px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '0 32px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 32px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: 8,
        },
      },
    },
    MuiSpeedDial: {
      styleOverrides: {
        fab: {
          width: 56,
          height: 56,
          backgroundColor: '#0066CC',
          '&:hover': {
            backgroundColor: '#147CE5',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:500px)': {
            padding: '0 12px',
          },
        },
      },
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '17px',
      lineHeight: 1.47059,
      letterSpacing: '-0.022em',
    },
    body2: {
      fontSize: '14px',
      lineHeight: 1.42859,
      letterSpacing: '-0.016em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
});

export default appleTheme; 