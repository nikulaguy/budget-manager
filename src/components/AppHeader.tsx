import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LogoutIcon from '@mui/icons-material/Logout';

interface AppHeaderProps {
  currentView: 'budgets' | 'history' | 'settings' | 'references';
  onViewChange: (view: 'budgets' | 'history' | 'settings' | 'references') => void;
  isMobile: boolean;
  onLogout: () => void;
  userEmail: string | null;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  currentView,
  onViewChange,
  isMobile,
  onLogout,
  userEmail,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { text: 'Budgets', icon: <AccountBalanceWalletIcon />, view: 'budgets' as const },
    { text: 'Historique', icon: <HistoryIcon />, view: 'history' as const },
    { text: 'Comptes', icon: <SettingsIcon />, view: 'settings' as const },
    { text: 'Références', icon: <BookmarkIcon />, view: 'references' as const },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.view}
            onClick={() => {
              onViewChange(item.view);
              setDrawerOpen(false);
            }}
            selected={currentView === item.view}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button onClick={onLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Déconnexion" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer'
          }}
          onClick={() => onViewChange('budgets')}
        >
          Budget Manager
        </Typography>
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {menuItems.map((item) => (
              <Box
                key={item.view}
                onClick={() => onViewChange(item.view)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: 1,
                  backgroundColor: currentView === item.view ? 'action.selected' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                {item.icon}
                <Typography>{item.text}</Typography>
              </Box>
            ))}
            <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              {userEmail && (
                <Typography variant="body2" color="text.secondary">
                  {userEmail}
                </Typography>
              )}
              <IconButton onClick={onLogout} color="inherit" size="small">
                <LogoutIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Toolbar>
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </AppBar>
  );
};

export default AppHeader; 