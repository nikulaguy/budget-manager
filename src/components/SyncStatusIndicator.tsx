import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Chip, 
  Tooltip, 
  Typography, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material'
import { 
  CloudQueue as CloudQueueIcon,
  Cloud as CloudIcon,
  CloudOff as CloudOffIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import { hybridSync } from '../services/hybridSync'

interface SyncStatus {
  isOnline: boolean
  lastSynced: string | null
  pendingActions: number
}

const SyncStatusIndicator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSynced: null,
    pendingActions: 0
  })
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    // Mettre à jour le statut périodiquement
    const updateStatus = () => {
      setSyncStatus(hybridSync.getSyncStatus())
    }

    updateStatus()
    const interval = setInterval(updateStatus, 5000) // Toutes les 5 secondes

    // Écouter les changements de connectivité
    const handleOnline = () => updateStatus()
    const handleOffline = () => updateStatus()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const formatLastSynced = (lastSynced: string | null): string => {
    if (!lastSynced) return 'Jamais'
    
    const date = new Date(lastSynced)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes < 1) return 'À l\'instant'
    if (diffMinutes < 60) return `Il y a ${diffMinutes}min`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `Il y a ${diffHours}h`
    
    const diffDays = Math.floor(diffHours / 24)
    return `Il y a ${diffDays}j`
  }

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <CloudOffIcon />
    }
    
    if (syncStatus.pendingActions > 0) {
      return <CloudQueueIcon />
    }
    
    return <CloudIcon />
  }

  const getStatusColor = (): 'success' | 'warning' | 'error' | 'info' => {
    if (!syncStatus.isOnline) return 'error'
    if (syncStatus.pendingActions > 0) return 'warning'
    return 'success'
  }

  const getStatusText = (): string => {
    if (!syncStatus.isOnline) return 'Hors ligne'
    if (syncStatus.pendingActions > 0) return `${syncStatus.pendingActions}`
    return 'Sync'
  }

  return (
    <>
      <Tooltip 
        title={`${syncStatus.isOnline ? 'En ligne' : 'Hors ligne'}${syncStatus.pendingActions > 0 ? ` • ${syncStatus.pendingActions} action(s) en attente` : ''}\nDernière sync: ${formatLastSynced(syncStatus.lastSynced)}`}
        arrow
      >
        <Chip
          icon={getStatusIcon()}
          label={getStatusText()}
          color={getStatusColor()}
          size="small"
          onClick={() => setShowDialog(true)}
          sx={{ 
            cursor: 'pointer',
            minWidth: '80px',
            '& .MuiChip-icon': {
              fontSize: '16px'
            },
            '& .MuiChip-label': {
              fontSize: '12px',
              fontWeight: 500
            }
          }}
        />
      </Tooltip>

      <Dialog 
        open={showDialog} 
        onClose={() => setShowDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {getStatusIcon()}
            Statut de synchronisation
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="textSecondary">
                Connexion
              </Typography>
              <Chip
                icon={syncStatus.isOnline ? <CloudIcon /> : <CloudOffIcon />}
                label={syncStatus.isOnline ? 'En ligne' : 'Hors ligne'}
                color={syncStatus.isOnline ? 'success' : 'error'}
                size="small"
              />
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="textSecondary">
                Dernière synchronisation
              </Typography>
              <Typography variant="body2">
                {formatLastSynced(syncStatus.lastSynced)}
              </Typography>
            </Box>

            {syncStatus.pendingActions > 0 && (
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="textSecondary">
                  Actions en attente
                </Typography>
                <Chip
                  icon={<WarningIcon />}
                  label={`${syncStatus.pendingActions} action(s)`}
                  color="warning"
                  size="small"
                />
              </Box>
            )}

            {!syncStatus.isOnline && (
              <Box 
                sx={{ 
                  backgroundColor: 'warning.light', 
                  color: 'warning.contrastText',
                  p: 2, 
                  borderRadius: 1,
                  mt: 1
                }}
              >
                <Typography variant="body2">
                  📱 <strong>Mode hors ligne</strong><br />
                  Vos modifications sont sauvegardées localement et seront synchronisées automatiquement dès que la connexion sera rétablie.
                </Typography>
              </Box>
            )}

            {syncStatus.isOnline && syncStatus.pendingActions === 0 && (
              <Box 
                sx={{ 
                  backgroundColor: 'success.light', 
                  color: 'success.contrastText',
                  p: 2, 
                  borderRadius: 1,
                  mt: 1
                }}
              >
                <Typography variant="body2">
                  ✅ <strong>Tout est synchronisé</strong><br />
                  Vos données sont à jour sur tous vos appareils.
                </Typography>
              </Box>
            )}

            {syncStatus.isOnline && syncStatus.pendingActions > 0 && (
              <Box 
                sx={{ 
                  backgroundColor: 'info.light', 
                  color: 'info.contrastText',
                  p: 2, 
                  borderRadius: 1,
                  mt: 1
                }}
              >
                <Typography variant="body2">
                  🔄 <strong>Synchronisation en cours</strong><br />
                  Les modifications récentes sont en cours de synchronisation.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SyncStatusIndicator 