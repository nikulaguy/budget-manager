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
const basename = import.meta.env.PROD ? '/budget-manager' : ''

// Styles globaux pour prévenir le scroll horizontal sur mobile
const globalStyles = (
  <GlobalStyles
    styles={(theme) => ({
      'html, body': {
        overflowX: 'hidden',
        margin: 0,
        padding: 0,
        width: '100%',
        maxWidth: '100vw',
      },
      '#root': {
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
      },
      // Prévenir le débordement horizontal sur tous les éléments
      '*': {
        boxSizing: 'border-box',
      },
      // Styles spéciaux pour mobile
      [`@media (max-width: 500px)`]: {
        'body': {
          overflowX: 'hidden !important',
        },
        // Container principal
        '.MuiContainer-root': {
          padding: '0 8px !important',
          maxWidth: '100% !important',
          margin: '0 !important',
        },
        // Tables responsives
        '.MuiTableContainer-root': {
          overflowX: 'auto',
          margin: '0 -8px',
          padding: '0 8px',
        },
        // Cards et Paper
        '.MuiCard-root, .MuiPaper-root': {
          margin: '0',
          maxWidth: '100%',
        },
        // Boutons et inputs
        '.MuiButton-root': {
          fontSize: '0.75rem !important',
          padding: '6px 12px !important',
        },
        '.MuiTextField-root': {
          width: '100% !important',
        },
        // AppBar mobile
        '.MuiToolbar-root': {
          minHeight: '56px !important',
          padding: '0 8px !important',
        },
        // Dialogs sur mobile
        '.MuiDialog-paper': {
          margin: '8px !important',
          maxWidth: 'calc(100vw - 16px) !important',
        },
        // Texte responsive
        'h1, h2, h3, h4, h5, h6': {
          fontSize: 'clamp(1rem, 4vw, 2rem) !important',
          lineHeight: '1.2 !important',
        },
      },
      // AppBar sticky
      '.MuiAppBar-positionSticky': {
        position: 'sticky !important',
        top: '0 !important',
        zIndex: '1100 !important'
      },
    })}
  />
)

// Fonction helper pour créer des toasts avec bouton de fermeture
const createToastWithCloseButton = (message: string, type: 'success' | 'error' | 'loading' = 'success') => {
  return toast(
    (t) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span style={{ marginRight: '8px' }}>{message}</span>
        <IconButton
          size="small"
          onClick={() => toast.dismiss(t.id)}
          style={{ color: 'inherit', padding: '2px' }}
        >
          <Close fontSize="small" />
        </IconButton>
      </div>
    ),
    {
      style: {
        maxWidth: '400px',
        padding: '12px 16px',
      },
      duration: 6000,
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