import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Button,
  Avatar,
  Divider,
  Fab,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home,
  History,
  AccountBalance,
  Settings,
  Logout,
  Payment,
  Category,
  AccountBalanceWallet,
  Add,
  Euro
} from '@mui/icons-material'
import { Link, useNavigate, useLocation } from 'react-router-dom'

import { useAuth } from '../../contexts/AuthContext'
import { useBudget } from '../../contexts/BudgetContext'
import BudgetLogo from '../common/BudgetLogo'
import { defaultReferenceBudgets } from '../../data/referenceBudgets'
import { toastWithClose } from '../../utils/toast'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { 
    openAddExpenseDialog, 
    openAddBudgetDialog, 
    openAddCategoryDialog,
    globalAddExpenseOpen,
    globalAddBudgetOpen,
    globalAddCategoryOpen,
    selectedBudgetForExpense,
    closeGlobalDialogs,
    addExpense
  } = useBudget()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [fabMenuAnchor, setFabMenuAnchor] = useState<null | HTMLElement>(null)
  
  // États pour les formulaires des modales globales
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    budgetName: selectedBudgetForExpense || ''
  })

  // Réinitialiser le formulaire quand la modale s'ouvre
  React.useEffect(() => {
    if (globalAddExpenseOpen) {
      setExpenseForm({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        budgetName: selectedBudgetForExpense || ''
      })
    }
  }, [globalAddExpenseOpen, selectedBudgetForExpense])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleFabMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFabMenuAnchor(event.currentTarget)
  }

  const handleFabMenuClose = () => {
    setFabMenuAnchor(null)
  }

  const handleSignOut = async () => {
    handleMenuClose()
    await signOut()
  }

  const navigationItems = [
    { label: 'Accueil', path: '/', icon: <Home /> },
    { label: 'Historique', path: '/historique', icon: <History /> },
    { label: 'Budgets de référence', path: '/budgets-reference', icon: <AccountBalance /> },
    { label: 'Paramètres', path: '/parametres', icon: <Settings /> }
  ]

  const fabActions = [
    {
      icon: <Payment />,
      label: 'Ajouter dépense',
      onClick: () => {
        openAddExpenseDialog()
        handleFabMenuClose()
      }
    },
    {
      icon: <AccountBalanceWallet />,
      label: 'Ajouter budget de référence',
      onClick: () => {
        openAddBudgetDialog()
        handleFabMenuClose()
      }
    },
    {
      icon: <Category />,
      label: 'Ajouter catégorie',
      onClick: () => {
        openAddCategoryDialog()
        handleFabMenuClose()
      }
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        elevation={1}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar
        }}
      >
        <Toolbar sx={{ 
          px: { xs: 1, sm: 2 },
          minHeight: { xs: '56px', sm: '64px' }
        }}>
          {/* Logo */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Retour à l'accueil"
            component={Link}
            to="/"
            sx={{ 
              mr: { xs: 1, sm: 2 },
              p: { xs: 1, sm: 1 }
            }}
          >
            <BudgetLogo />
          </IconButton>

          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ 
              flexGrow: 1, 
              fontWeight: 500,
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            BudgetManager
          </Typography>

          {/* Navigation Desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: location.pathname === item.path ? 'secondary.main' : 'inherit',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                  aria-label={item.label}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Menu Mobile */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="Menu de navigation"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Menu Utilisateur */}
          <IconButton
            color="inherit"
            aria-label={`Compte de ${user?.firstName} ${user?.lastName}`}
            onClick={handleMenuOpen}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.firstName?.charAt(0)}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="textSecondary">
                {user?.firstName} {user?.lastName}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="textSecondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSignOut}>
              <Logout sx={{ mr: 1 }} fontSize="small" />
              Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Navigation Mobile Drawer */}
      {isMobile && (
        <Menu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          anchorEl={null}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          {navigationItems.map((item) => (
            <MenuItem
              key={item.path}
              onClick={() => {
                navigate(item.path)
                setMobileMenuOpen(false)
              }}
              selected={location.pathname === item.path}
            >
              {item.icon}
              <Typography sx={{ ml: 1 }}>{item.label}</Typography>
            </MenuItem>
          ))}
        </Menu>
      )}

      {/* Contenu Principal */}
      <Container
        component="main"
        maxWidth="xl"
        sx={{
          flexGrow: 1,
          py: 3,
          px: { xs: 1, sm: 3 },
          width: '100%',
          maxWidth: { xs: '100vw', sm: '100%' },
          margin: { xs: 0, sm: 'auto' },
          overflowX: 'hidden',
          marginTop: { xs: '56px', sm: '64px' }
        }}
      >
        {children}
      </Container>

      {/* Floating Action Button avec menu contextuel */}
      <Fab
        color="primary"
        aria-label="Actions rapides"
        onClick={handleFabMenuOpen}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: (theme) => theme.zIndex.speedDial,
          width: { xs: 48, sm: 56 },
          height: { xs: 48, sm: 56 }
        }}
      >
        <Add />
      </Fab>

      {/* Menu contextuel du FAB */}
      <Menu
        anchorEl={fabMenuAnchor}
        open={Boolean(fabMenuAnchor)}
        onClose={handleFabMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        {fabActions.map((action, index) => (
          <MenuItem key={index} onClick={action.onClick}>
            <ListItemIcon>
              {action.icon}
            </ListItemIcon>
            <ListItemText primary={action.label} />
          </MenuItem>
        ))}
      </Menu>

      {/* Modales globales */}
      
      {/* Dialog d'ajout de dépense global */}
      <Dialog
        open={globalAddExpenseOpen}
        onClose={closeGlobalDialogs}
        maxWidth="sm"
        fullWidth
        aria-labelledby="global-add-expense-dialog-title"
      >
        <DialogTitle id="global-add-expense-dialog-title">
          Ajouter une dépense
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Sélection de budget */}
            <FormControl fullWidth>
              <InputLabel id="budget-select-label">Budget</InputLabel>
              <Select
                labelId="budget-select-label"
                value={expenseForm.budgetName}
                label="Budget"
                onChange={(e) => setExpenseForm(prev => ({ ...prev, budgetName: e.target.value }))}
              >
                {defaultReferenceBudgets.map((budget) => (
                  <MenuItem key={budget.name} value={budget.name}>
                    <Box>
                      <Typography variant="body2">{budget.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {budget.category} - {budget.value}€
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Description"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              placeholder="Ex: Courses au supermarché"
              autoFocus
            />
            <TextField
              label="Montant (€)"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
              type="number"
              fullWidth
              placeholder="0.00"
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{
                startAdornment: <Euro sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
            <TextField
              label="Date"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeGlobalDialogs}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              if (!expenseForm.description || !expenseForm.amount || !expenseForm.date || !expenseForm.budgetName) {
                toastWithClose.error('Veuillez remplir tous les champs')
                return
              }
              
              // Ajouter la vraie dépense via le contexte
              addExpense(expenseForm.budgetName, {
                description: expenseForm.description,
                amount: parseFloat(expenseForm.amount),
                date: new Date(expenseForm.date),
                category: defaultReferenceBudgets.find(b => b.name === expenseForm.budgetName)?.category || 'Courant',
                userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                userEmail: user?.email || ''
              })
              
              toastWithClose.success(`Dépense de ${expenseForm.amount}€ ajoutée pour ${expenseForm.budgetName}`)
              
              // Réinitialiser le formulaire
              setExpenseForm({
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                budgetName: ''
              })
              
              closeGlobalDialogs()
            }}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'ajout de budget global */}
      <Dialog
        open={globalAddBudgetOpen}
        onClose={closeGlobalDialogs}
        maxWidth="sm"
        fullWidth
        aria-labelledby="global-add-budget-dialog-title"
      >
        <DialogTitle id="global-add-budget-dialog-title">
          Ajouter un budget de référence
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="textSecondary" sx={{ py: 3 }}>
            Cette fonctionnalité sera disponible dans la page "Budgets de référence".
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Vous pouvez accéder à cette page via le menu de navigation pour gérer vos budgets de référence.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeGlobalDialogs}>
            Fermer
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              closeGlobalDialogs()
              navigate('/budgets-reference')
            }}
          >
            Aller aux budgets de référence
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'ajout de catégorie global */}
      <Dialog
        open={globalAddCategoryOpen}
        onClose={closeGlobalDialogs}
        maxWidth="sm"
        fullWidth
        aria-labelledby="global-add-category-dialog-title"
      >
        <DialogTitle id="global-add-category-dialog-title">
          Ajouter une catégorie
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="textSecondary" sx={{ py: 3 }}>
            Cette fonctionnalité sera disponible dans la page "Budgets de référence".
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Les catégories peuvent être gérées dans la section des budgets de référence.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeGlobalDialogs}>
            Fermer
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              closeGlobalDialogs()
              navigate('/budgets-reference')
            }}
          >
            Aller aux budgets de référence
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Layout 