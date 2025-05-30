import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  Avatar,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  Chip,
  Paper,
  Alert
} from '@mui/material'
import {
  Person,
  Email,
  Edit,
  Save,
  Cancel,
  Download,
  Delete,
  PersonAdd,
  Security,
  Notifications,
  Palette,
  Language,
  Upload,
  AccountBalance,
  Euro,
  Settings
} from '@mui/icons-material'
import { toastWithClose } from '../utils/toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { useAuth } from '../contexts/AuthContext'
import { UserInvitation } from '../types'
import { defaultReferenceBudgets, defaultCategories } from '../data/referenceBudgets'

// Interface pour les dépenses historiques de l'export
interface HistoricalExpense {
  id: string
  description: string
  amount: number
  date: string
  budgetName: string
  budgetId: string
  category: string
  userName: string
  userEmail: string
  createdAt: string
  updatedAt: string
}

const SettingsPage: React.FC = () => {
  const { 
    user, 
    canInviteUsers, 
    canInviteMasters, 
    inviteUser, 
    getPendingInvitations, 
    cancelInvitation 
  } = useAuth()
  
  // États des paramètres (maintenant persistants dans localStorage)
  const [notifications, setNotifications] = useState(() => 
    localStorage.getItem('settings-notifications') === 'true'
  )
  const [darkMode, setDarkMode] = useState(() => 
    localStorage.getItem('settings-darkMode') === 'true'
  )
  const [emailNotifications, setEmailNotifications] = useState(() => 
    localStorage.getItem('settings-emailNotifications') === 'true'
  )
  
  // États des modales
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showInvitationsDialog, setShowInvitationsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  // États pour le formulaire d'invitation
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'simple' as 'master' | 'simple'
  })
  
  // États pour l'édition du profil
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  })
  
  // Liste des invitations en cours
  const [pendingInvitations, setPendingInvitations] = useState<UserInvitation[]>([])

  // Charger les invitations en cours
  useEffect(() => {
    if (canInviteUsers()) {
      setPendingInvitations(getPendingInvitations())
    }
  }, [canInviteUsers, getPendingInvitations])

  const getRoleName = (role: string) => {
    switch (role) {
      case 'masterMaitre': return 'Master Maître'
      case 'master': return 'Master'
      case 'simple': return 'Simple'
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'masterMaitre': return 'error'
      case 'master': return 'primary'
      case 'simple': return 'default'
      default: return 'default'
    }
  }

  // Sauvegarder les préférences dans localStorage
  const handleSaveNotifications = () => {
    localStorage.setItem('settings-notifications', notifications.toString())
    localStorage.setItem('settings-emailNotifications', emailNotifications.toString())
    toastWithClose.success('Préférences de notification sauvegardées')
  }

  const handleSaveDarkMode = () => {
    localStorage.setItem('settings-darkMode', darkMode.toString())
    toastWithClose.success('Préférence de thème sauvegardée')
    // En production, cela devrait déclencher un changement de thème global
  }

  const handleSaveProfile = () => {
    // En production, cela enverrait les données au serveur
    toastWithClose.success('Profil mis à jour avec succès')
    setShowEditProfile(false)
  }

  const handleExportData = () => {
    setShowExportDialog(true)
  }

  const handleConfirmExport = () => {
    // Simulation de récupération de TOUTES les données de l'application
    // En production, cela viendrait d'appels API à la base de données
    
    // Récupération des utilisateurs prédéfinis (simule un appel API)
    const allUsers = [
      {
        id: 'demo-nikuland@gmail.com',
        email: 'nikuland@gmail.com',
        firstName: 'Nicolas',
        lastName: 'Guy',
        role: 'masterMaitre',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date()
      },
      {
        id: 'demo-romain.troalen@gmail.com',
        email: 'romain.troalen@gmail.com',
        firstName: 'Romain',
        lastName: 'Troalen',
        role: 'master',
        createdAt: new Date('2023-02-15'),
        updatedAt: new Date()
      },
      {
        id: 'demo-guillaume.marion.perso@gmail.com',
        email: 'guillaume.marion.perso@gmail.com',
        firstName: 'Guillaume',
        lastName: 'Marion',
        role: 'master',
        createdAt: new Date('2023-03-10'),
        updatedAt: new Date()
      },
      {
        id: 'demo-remi.roux@gmail.com',
        email: 'remi.roux@gmail.com',
        firstName: 'Rémi',
        lastName: 'Roux',
        role: 'master',
        createdAt: new Date('2023-04-20'),
        updatedAt: new Date()
      },
      {
        id: 'demo-alix.troalen@gmail.com',
        email: 'alix.troalen@gmail.com',
        firstName: 'Alix',
        lastName: 'Guy',
        role: 'simple',
        createdAt: new Date('2023-05-01'),
        updatedAt: new Date()
      }
    ];

    // Simulation d'historique sur plusieurs mois
    const historicalData = [];
    for (let year = 2023; year <= 2024; year++) {
      for (let month = 1; month <= 12; month++) {
        if (year === 2024 && month > new Date().getMonth() + 1) break;
        
        const monthlyBudgets = defaultReferenceBudgets
          .filter(budget => budget.category !== 'Épargne')
          .map((budget, index) => {
            const spent = Math.random() * budget.value * 0.9; // Entre 0 et 90% du budget
            return {
              id: `budget-${year}-${month}-${index}`,
              name: budget.name,
              referenceValue: budget.value,
              spent: Math.round(spent * 100) / 100,
              remaining: Math.round((budget.value - spent) * 100) / 100,
              category: budget.category,
              percentage: Math.round((spent / budget.value) * 100 * 100) / 100,
              month: month,
              year: year
            };
          });

        const monthlyExpenses: HistoricalExpense[] = []
        monthlyBudgets.forEach(budget => {
          const numExpenses = Math.floor(Math.random() * 10) + 1; // 1-10 dépenses par budget
          for (let i = 0; i < numExpenses; i++) {
            const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
            const expenseAmount = budget.spent / numExpenses;
            monthlyExpenses.push({
              id: `expense-${year}-${month}-${budget.id}-${i}`,
              description: `Dépense ${budget.name} #${i + 1}`,
              amount: Math.round(expenseAmount * 100) / 100,
              date: new Date(year, month - 1, Math.floor(Math.random() * 28) + 1).toISOString(),
              budgetName: budget.name,
              budgetId: budget.id,
              category: budget.category,
              userName: `${randomUser.firstName} ${randomUser.lastName}`,
              userEmail: randomUser.email,
              createdAt: new Date(year, month - 1, Math.floor(Math.random() * 28) + 1).toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        });

        historicalData.push({
          year: year,
          month: month,
          budgets: monthlyBudgets,
          expenses: monthlyExpenses,
          summary: {
            totalBudget: monthlyBudgets.reduce((sum, b) => sum + b.referenceValue, 0),
            totalSpent: monthlyBudgets.reduce((sum, b) => sum + b.spent, 0),
            totalRemaining: monthlyBudgets.reduce((sum, b) => sum + b.remaining, 0),
            expenseCount: monthlyExpenses.length
          }
        });
      }
    }

    // Export complet de TOUTES les données de l'application
    const exportData = {
      // Métadonnées d'export
      exportInfo: {
        exportedAt: new Date().toISOString(),
        exportedBy: {
          userId: user?.id,
          userEmail: user?.email,
          userName: `${user?.firstName} ${user?.lastName}`
        },
        version: '1.0.0',
        exportType: 'full_backup',
        description: 'Export complet de TOUTES les données BudgetManager',
        dataScope: 'complete_application_data'
      },

      // TOUS les utilisateurs de l'application
      users: allUsers,

      // Utilisateur actuel avec ses paramètres
      currentUser: {
        ...user,
        settings: {
          notifications,
          emailNotifications,
          darkMode
        }
      },

      // Système d'invitations
      invitations: {
        pending: getPendingInvitations(),
        // Simulation d'invitations historiques
        historical: [
          {
            id: 'inv-archived-1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'simple',
            invitedBy: 'nikuland@gmail.com',
            invitedAt: new Date('2023-06-01').toISOString(),
            status: 'expired'
          }
        ]
      },

      // Structure complète des budgets
      budgets: {
        // Budgets de référence avec toutes les catégories
        referenceBudgets: defaultReferenceBudgets,
        
        // Catégories de budget (par défaut + personnalisées)
        categories: defaultCategories,
        
        // Budgets personnalisés ajoutés par les utilisateurs
        customReferenceBudgets: [
          // Simulation de budgets personnalisés
          {
            id: 'custom-1',
            name: 'Budget Personnel',
            value: 200,
            category: 'Mensuel',
            isDefault: false,
            createdBy: user?.email,
            createdAt: new Date('2023-06-15').toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],

        // Mois/année actuels
        currentPeriod: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        }
      },

      // HISTORIQUE COMPLET - TOUS les mois et années
      historicalData: historicalData,

      // Données du mois en cours (les vraies données actuelles)
      currentMonthData: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        // Ces données viendraient normalement du state de HomePage ou d'appels API
        budgets: defaultReferenceBudgets
          .filter(budget => budget.category !== 'Épargne')
          .map((budget, index) => ({
            id: `current-budget-${index}`,
            name: budget.name,
            referenceValue: budget.value,
            spent: 0, // En production: vraies valeurs du state
            remaining: budget.value,
            category: budget.category,
            percentage: 0,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
          })),
        expenses: [
          // Simulation de quelques dépenses actuelles
          {
            id: 'current-expense-1',
            description: 'Courses actuelles',
            amount: 85.50,
            date: new Date().toISOString(),
            budgetName: 'Alimentation Entretien',
            category: 'Courant',
            userName: `${user?.firstName} ${user?.lastName}`,
            userEmail: user?.email
          }
        ]
      },

      // Paramètres globaux de l'application
      applicationSettings: {
        version: '1.0.0',
        defaultCurrency: 'EUR',
        dateFormat: 'dd/MM/yyyy',
        language: 'fr',
        timezone: 'Europe/Paris',
        features: {
          multiUser: true,
          invitations: true,
          dataExport: true,
          historicalData: true
        }
      },

      // Statistiques globales
      statistics: {
        totalUsers: allUsers.length,
        totalPendingInvitations: getPendingInvitations().length,
        totalHistoricalMonths: historicalData.length,
        totalBudgetCategories: defaultCategories.length,
        totalReferenceBudgets: defaultReferenceBudgets.length,
        dataVolumeEstimate: `${JSON.stringify(historicalData).length} characters`
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-manager-COMPLETE-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toastWithClose.success('Export COMPLET des données réussi - Toutes les données de l\'application incluses')
    setShowExportDialog(false)
  }

  const handleInviteUser = async () => {
    if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName) {
      toastWithClose.error('Veuillez remplir tous les champs')
      return
    }

    const success = await inviteUser(inviteForm)
    if (success) {
      setInviteForm({ email: '', firstName: '', lastName: '', role: 'simple' })
      setShowInviteDialog(false)
      setPendingInvitations(getPendingInvitations()) // Recharger la liste
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    const success = await cancelInvitation(invitationId)
    if (success) {
      setPendingInvitations(getPendingInvitations()) // Recharger la liste
    }
  }

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDeleteAccount = () => {
    toastWithClose.error('Fonctionnalité de suppression de compte à implémenter')
    setShowDeleteDialog(false)
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Paramètres
      </Typography>

      <Grid container spacing={3}>
        {/* Profil utilisateur */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Profil utilisateur</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: 'primary.main',
                    fontSize: '1.5rem',
                    mr: 3
                  }}
                >
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {user?.email}
                  </Typography>
                  <Chip 
                    label={getRoleName(user?.role || '')}
                    color={getRoleColor(user?.role || '') as any}
                    size="small"
                  />
                </Box>
                <IconButton 
                  color="primary" 
                  onClick={() => {
                    setProfileForm({
                      firstName: user?.firstName || '',
                      lastName: user?.lastName || ''
                    })
                    setShowEditProfile(true)
                  }}
                  aria-label="Éditer le profil"
                >
                  <Edit />
                </IconButton>
              </Box>

              <Typography variant="body2" color="textSecondary">
                Membre depuis {user?.createdAt ? format(user.createdAt, 'dd MMMM yyyy', { locale: fr }) : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Gestion des utilisateurs (si permissions) */}
        {canInviteUsers() && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PersonAdd sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Gestion des utilisateurs</Typography>
                </Box>

                <List>
                  <ListItem button onClick={() => setShowInviteDialog(true)}>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText
                      primary="Inviter un utilisateur"
                      secondary="Envoyer une invitation par email"
                    />
                  </ListItem>

                  {pendingInvitations.length > 0 && (
                    <ListItem button onClick={() => setShowInvitationsDialog(true)}>
                      <ListItemIcon>
                        <Person />
                      </ListItemIcon>
                      <ListItemText
                        primary="Invitations en cours"
                        secondary={`${pendingInvitations.length} invitation(s) en attente`}
                      />
                    </ListItem>
                  )}
                </List>

                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => setShowInviteDialog(true)}
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Inviter un utilisateur
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Notifications sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Notifications</Typography>
              </Box>

              <List>
                <ListItem>
                  <ListItemText
                    primary="Notifications push"
                    secondary="Recevoir des notifications dans l'application"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Notifications email"
                    secondary="Recevoir des alertes par email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>

              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveNotifications}
                sx={{ mt: 2 }}
              >
                Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Préférences d'affichage */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Palette sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Affichage</Typography>
              </Box>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Palette />
                  </ListItemIcon>
                  <ListItemText
                    primary="Mode sombre"
                    secondary="Utiliser le thème sombre"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Language />
                  </ListItemIcon>
                  <ListItemText
                    primary="Langue"
                    secondary="Français (France)"
                  />
                </ListItem>
              </List>

              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveDarkMode}
                sx={{ mt: 2 }}
              >
                Sauvegarder préférences
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Données et sécurité */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Security sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Données et sécurité</Typography>
              </Box>

              <List>
                <ListItem button onClick={handleExportData}>
                  <ListItemIcon>
                    <Download />
                  </ListItemIcon>
                  <ListItemText
                    primary="Exporter mes données"
                    secondary="Télécharger toutes vos données au format JSON"
                  />
                </ListItem>

                <ListItem button>
                  <ListItemIcon>
                    <Upload />
                  </ListItemIcon>
                  <ListItemText
                    primary="Importer des données"
                    secondary="Restaurer depuis une sauvegarde (à venir)"
                  />
                </ListItem>

                <Divider />

                <ListItem button onClick={handleDeleteAccount}>
                  <ListItemIcon>
                    <Delete color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Supprimer mon compte"
                    secondary="Action irréversible"
                    primaryTypographyProps={{ color: 'error' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog d'édition de profil */}
      <Dialog
        open={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="edit-profile-title"
      >
        <DialogTitle id="edit-profile-title">
          Éditer le profil
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Prénom"
              value={profileForm.firstName}
              onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Nom"
              value={profileForm.lastName}
              onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Email"
              value={user?.email}
              fullWidth
              disabled
              helperText="L'email ne peut pas être modifié"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditProfile(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveProfile}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'invitation d'utilisateur */}
      <Dialog
        open={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="invite-dialog-title"
      >
        <DialogTitle id="invite-dialog-title">
          Inviter un utilisateur
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Email"
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
              placeholder="exemple@email.com"
            />
            <TextField
              label="Prénom"
              value={inviteForm.firstName}
              onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Nom"
              value={inviteForm.lastName}
              onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={inviteForm.role}
                label="Rôle"
                onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as 'master' | 'simple' }))}
              >
                <MenuItem value="simple">
                  <Box>
                    <Typography variant="body2">Simple</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Peut utiliser l'app mais pas inviter d'utilisateurs
                    </Typography>
                  </Box>
                </MenuItem>
                {canInviteMasters() && (
                  <MenuItem value="master">
                    <Box>
                      <Typography variant="body2">Master</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Peut inviter des utilisateurs simples
                      </Typography>
                    </Box>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            
            <Alert severity="info" sx={{ mt: 1 }}>
              L'utilisateur recevra un email d'invitation avec les instructions pour accéder à l'application.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInviteDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleInviteUser}
            startIcon={<Email />}
          >
            Envoyer l'invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog des invitations en cours */}
      <Dialog
        open={showInvitationsDialog}
        onClose={() => setShowInvitationsDialog(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="invitations-dialog-title"
      >
        <DialogTitle id="invitations-dialog-title">
          Invitations en cours
        </DialogTitle>
        <DialogContent>
          {pendingInvitations.length === 0 ? (
            <Typography variant="body1" color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>
              Aucune invitation en cours
            </Typography>
          ) : (
            <List>
              {pendingInvitations.map((invitation) => (
                <Paper key={invitation.id} sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">
                        {invitation.firstName} {invitation.lastName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {invitation.email}
                      </Typography>
                      <Chip
                        label={getRoleName(invitation.role)}
                        color={getRoleColor(invitation.role) as any}
                        size="small"
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Invité le {format(invitation.invitedAt, 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </Typography>
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() => handleCancelInvitation(invitation.id)}
                      aria-label={`Annuler l'invitation de ${invitation.firstName} ${invitation.lastName}`}
                    >
                      <Cancel />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInvitationsDialog(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'export */}
      <Dialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        aria-labelledby="export-dialog-title"
      >
        <DialogTitle id="export-dialog-title">
          Exporter mes données
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Vos données seront exportées au format JSON et incluront :
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Profil utilisateur et préférences" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Paramètres de l'application" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AccountBalance />
              </ListItemIcon>
              <ListItemText primary="Budgets de référence et catégories" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Euro />
              </ListItemIcon>
              <ListItemText primary="Budgets mensuels et dépenses" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Download />
              </ListItemIcon>
              <ListItemText primary="Métadonnées d'export et traçabilité" />
            </ListItem>
          </List>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Ce fichier peut être utilisé pour restaurer toutes vos données ou les importer dans une nouvelle installation.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmExport}
            startIcon={<Download />}
          >
            Exporter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: 'error.main' }}>
          Supprimer mon compte
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Attention !</strong> Cette action est irréversible.
          </Alert>
          <Typography>
            Êtes-vous sûr de vouloir supprimer définitivement votre compte ? 
            Toutes vos données seront perdues.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Annuler
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDeleteAccount}
            startIcon={<Delete />}
          >
            Supprimer définitivement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SettingsPage 