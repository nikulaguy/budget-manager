import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, IconButton, GlobalStyles } from '@mui/material'
import { Toaster, toast } from 'react-hot-toast'
import { Close } from '@mui/icons-material'

import App from './App'
import { theme } from './theme/theme'
import { AuthProvider } from './contexts/AuthContext'
import { BudgetProvider } from './contexts/BudgetContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

// Base path conditionnel selon l'environnement
const basename = import.meta.env.PROD ? '/budget' : ''

// Styles globaux pour prévenir le scroll horizontal sur mobile
const globalStyles = (
  <GlobalStyles
    styles={{
      '.MuiTooltip-tooltip': {
        fontSize: '0.75rem',
      },
      '.MuiSnackbar-root': {
        zIndex: '1100 !important'
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#1976d2',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#1976d2',
      },
    }}
  />
)

// Fonction helper pour créer des toasts avec bouton de fermeture
const createToastWithCloseButton = (message: string, type: 'success' | 'error' | 'loading' = 'success') => {
  return toast(
    (t) => (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        width: '100%',
        gap: '8px'
      }}>
        <span style={{ flex: 1 }}>{message}</span>
        <IconButton
          size="small"
          onClick={() => toast.dismiss(t.id)}
          style={{ 
            color: 'inherit', 
            padding: '2px',
            minWidth: 'auto'
          }}
          aria-label="Fermer"
        >
          <Close />
        </IconButton>
      </div>
    ),
    {
      duration: 2500,
      style: type === 'success' 
        ? { background: '#4caf50', color: '#fff' }
        : type === 'error'
        ? { background: '#f44336', color: '#fff' }
        : { background: '#363636', color: '#fff' }
    }
  )
}

// Étendre l'objet toast global avec nos helpers
declare global {
  interface Window {
    toastWithClose: {
      success: (message: string) => void
      error: (message: string) => void
    }
  }
}

// Ajouter nos helpers au window global pour utilisation facile
window.toastWithClose = {
  success: (message: string) => createToastWithCloseButton(message, 'success'),
  error: (message: string) => createToastWithCloseButton(message, 'error'),
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {globalStyles}
          <AuthProvider>
            <BudgetProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 6000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    maxWidth: '400px',
                  },
                  success: {
                    style: {
                      background: '#4caf50',
                    },
                    iconTheme: {
                      primary: '#fff',
                      secondary: '#4caf50',
                    },
                  },
                  error: {
                    style: {
                      background: '#f44336',
                    },
                    iconTheme: {
                      primary: '#fff',
                      secondary: '#f44336',
                    },
                  },
                  // Ajouter bouton de fermeture personnalisé
                  ariaProps: {
                    role: 'status',
                    'aria-live': 'polite',
                  },
                }}
                containerStyle={{
                  top: 20,
                  right: 20,
                }}
              />
            </BudgetProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
) 