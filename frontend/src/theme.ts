import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3a7bd5',
      light: '#83b1f9',
      dark: '#0d47a1',
    },
    secondary: {
      main: '#00b0ff',
      light: '#69e2ff',
      dark: '#0081cb',
    },
    error: {
      main: '#f44336',
      light: '#ff7961',
      dark: '#ba000d',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#03a9f4',
      light: '#67daff',
      dark: '#007ac1',
    },
    success: {
      main: '#4caf50',
      light: '#80e27e',
      dark: '#087f23',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3748',
      secondary: '#718096',
    },
    divider: 'rgba(0, 0, 0, 0.06)',
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.05),0px 1px 1px 0px rgba(0,0,0,0.03),0px 1px 3px 0px rgba(0,0,0,0.05)',
    '0px 3px 3px -2px rgba(0,0,0,0.06),0px 2px 6px 0px rgba(0,0,0,0.04),0px 1px 8px 0px rgba(0,0,0,0.06)',
    '0px 3px 4px -2px rgba(0,0,0,0.07),0px 3px 8px 0px rgba(0,0,0,0.05),0px 1px 12px 0px rgba(0,0,0,0.07)',
    '0px 2px 5px -1px rgba(0,0,0,0.08),0px 4px 10px 0px rgba(0,0,0,0.06),0px 1px 14px 0px rgba(0,0,0,0.08)',
    '0px 3px 6px -1px rgba(0,0,0,0.09),0px 5px 12px 0px rgba(0,0,0,0.07),0px 1px 18px 0px rgba(0,0,0,0.09)',
    '0px 4px 6px -2px rgba(0,0,0,0.1),0px 6px 16px 0px rgba(0,0,0,0.08),0px 1px 20px 0px rgba(0,0,0,0.1)',
    '0px 5px 7px -2px rgba(0,0,0,0.11),0px 7px 18px 0px rgba(0,0,0,0.09),0px 2px 22px 0px rgba(0,0,0,0.11)',
    '0px 5px 8px -2px rgba(0,0,0,0.12),0px 8px 20px 0px rgba(0,0,0,0.1),0px 2px 24px 0px rgba(0,0,0,0.12)',
    '0px 6px 9px -3px rgba(0,0,0,0.13),0px 9px 22px 0px rgba(0,0,0,0.11),0px 2px 26px 0px rgba(0,0,0,0.13)',
    '0px 6px 10px -3px rgba(0,0,0,0.14),0px 10px 24px 0px rgba(0,0,0,0.12),0px 3px 28px 0px rgba(0,0,0,0.14)',
    '0px 7px 11px -3px rgba(0,0,0,0.15),0px 11px 26px 0px rgba(0,0,0,0.13),0px 3px 30px 0px rgba(0,0,0,0.15)',
    '0px 7px 12px -4px rgba(0,0,0,0.16),0px 12px 28px 0px rgba(0,0,0,0.14),0px 3px 32px 0px rgba(0,0,0,0.16)',
    '0px 7px 13px -4px rgba(0,0,0,0.17),0px 13px 30px 0px rgba(0,0,0,0.15),0px 4px 34px 0px rgba(0,0,0,0.17)',
    '0px 8px 14px -4px rgba(0,0,0,0.18),0px 14px 32px 0px rgba(0,0,0,0.16),0px 4px 36px 0px rgba(0,0,0,0.18)',
    '0px 8px 15px -5px rgba(0,0,0,0.19),0px 15px 34px 0px rgba(0,0,0,0.17),0px 4px 38px 0px rgba(0,0,0,0.19)',
    '0px 9px 16px -5px rgba(0,0,0,0.2),0px 16px 36px 0px rgba(0,0,0,0.18),0px 5px 40px 0px rgba(0,0,0,0.2)',
    '0px 9px 17px -5px rgba(0,0,0,0.21),0px 17px 38px 0px rgba(0,0,0,0.19),0px 5px 42px 0px rgba(0,0,0,0.21)',
    '0px 10px 18px -6px rgba(0,0,0,0.22),0px 18px 40px 0px rgba(0,0,0,0.2),0px 6px 44px 0px rgba(0,0,0,0.22)',
    '0px 10px 19px -6px rgba(0,0,0,0.23),0px 19px 42px 0px rgba(0,0,0,0.21),0px 6px 46px 0px rgba(0,0,0,0.23)',
    '0px 11px 20px -6px rgba(0,0,0,0.24),0px 20px 44px 0px rgba(0,0,0,0.22),0px 6px 48px 0px rgba(0,0,0,0.24)',
    '0px 11px 21px -7px rgba(0,0,0,0.25),0px 21px 46px 0px rgba(0,0,0,0.23),0px 7px 50px 0px rgba(0,0,0,0.25)',
    '0px 11px 22px -7px rgba(0,0,0,0.26),0px 22px 48px 0px rgba(0,0,0,0.24),0px 7px 52px 0px rgba(0,0,0,0.26)',
    '0px 12px 23px -7px rgba(0,0,0,0.27),0px 23px 50px 0px rgba(0,0,0,0.25),0px 8px 54px 0px rgba(0,0,0,0.27)',
    '0px 12px 24px -8px rgba(0,0,0,0.28),0px 24px 52px 0px rgba(0,0,0,0.26),0px 8px 56px 0px rgba(0,0,0,0.28)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #3a7bd5 0%, #00d2ff 100%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #3a7bd5 30%, #00d2ff 90%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          backgroundImage: 'linear-gradient(90deg, #3a7bd5 0%, #00d2ff 100%)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(58, 123, 213, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(58, 123, 213, 0.12)',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(58, 123, 213, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3a7bd5',
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: 'rgba(45, 55, 72, 0.9)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

export default theme; 