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
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
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
  AccountBalanceWallet
} from '@mui/icons-material'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import { useAuth } from '../../contexts/AuthContext'
import BudgetLogo from '../common/BudgetLogo'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [speedDialOpen, setSpeedDialOpen] = useState(false)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
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

  const speedDialActions = [
    {
      icon: <Payment />,
      name: 'Ajouter dépense',
      onClick: () => {
        // TODO: Ouvrir modal d'ajout de dépense
        toast('Ouverture du formulaire d\'ajout de dépense', { icon: '💰' })
      }
    },
    {
      icon: <AccountBalanceWallet />,
      name: 'Ajouter budget de référence',
      onClick: () => {
        // TODO: Ouvrir modal d'ajout de budget de référence
        toast('Ouverture du formulaire d\'ajout de budget de référence', { icon: '📊' })
      }
    },
    {
      icon: <Category />,
      name: 'Ajouter catégorie',
      onClick: () => {
        // TODO: Ouvrir modal d'ajout de catégorie
        toast('Ouverture du formulaire d\'ajout de catégorie', { icon: '🏷️' })
      }
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          {/* Logo */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Retour à l'accueil"
            component={Link}
            to="/"
            sx={{ mr: 2 }}
          >
            <BudgetLogo />
          </IconButton>

          <Typography
            variant="h6"
            component="h1"
            sx={{ flexGrow: 1, fontWeight: 500 }}
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
          px: { xs: 2, sm: 3 }
        }}
      >
        {children}
      </Container>

      {/* Bouton d'Action Flottant */}
      <SpeedDial
        ariaLabel="Actions rapides"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          '& .MuiFab-primary': {
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark'
            }
          }
        }}
        icon={<SpeedDialIcon />}
        open={speedDialOpen}
        onOpen={() => setSpeedDialOpen(true)}
        onClose={() => setSpeedDialOpen(false)}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              action.onClick()
              setSpeedDialOpen(false)
            }}
            aria-label={action.name}
          />
        ))}
      </SpeedDial>
    </Box>
  )
}

export default Layout 