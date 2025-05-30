import { toast } from 'react-hot-toast'
import { IconButton } from '@mui/material'
import { Close } from '@mui/icons-material'

// Fonction helper pour créer des toasts avec bouton de fermeture
export const toastWithClose = {
  success: (message: string) => {
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
            <Close fontSize="small" />
          </IconButton>
        </div>
      ),
      {
        style: {
          maxWidth: '400px',
          padding: '12px 16px',
          background: '#4caf50',
          color: '#fff',
        },
        duration: 2500, // Durée réduite à 2,5 secondes
      }
    )
  },

  error: (message: string) => {
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
            <Close fontSize="small" />
          </IconButton>
        </div>
      ),
      {
        style: {
          maxWidth: '400px',
          padding: '12px 16px',
          background: '#f44336',
          color: '#fff',
        },
        duration: 2500, // Durée réduite à 2,5 secondes
      }
    )
  },

  info: (message: string) => {
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
            <Close fontSize="small" />
          </IconButton>
        </div>
      ),
      {
        style: {
          maxWidth: '400px',
          padding: '12px 16px',
          background: '#363636',
          color: '#fff',
        },
        duration: 2500, // Durée réduite à 2,5 secondes
      }
    )
  }
} 