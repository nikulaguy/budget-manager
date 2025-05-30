import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AppData } from './types/types';
import { loadData, advanceToNextPeriod, deleteHistory, deleteAllHistory } from './utils/storage';
import AppHeader from './components/AppHeader';
import BudgetList from './components/BudgetList';
import BudgetHistory from './components/BudgetHistory';
import BankAccountSettings from './components/BankAccountSettings';
import ReferenceBudgets from './components/ReferenceBudgets';
import Notification from './components/Notification';
import Login from './components/Login';
import { setCurrentUser, getCurrentUser, logout } from './utils/auth';
import appleTheme from './theme/appleTheme';
import Dashboard from './components/Dashboard';
import { db } from './utils/firebase';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

function App() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [currentView, setCurrentView] = useState<'budgets' | 'history' | 'settings' | 'references'>('budgets');
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isMobile = useMediaQuery(appleTheme.breakpoints.down('sm'));

  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUser();
      setIsAuthenticated(!!user);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (email: string) => {
    setCurrentUser(email);
    try {
      const data = await loadData();
      setAppData(data);
      setIsAuthenticated(true);
      handleNotification(`Bienvenue ${email}`, 'success');
    } catch (error) {
      console.error('Error loading data after login:', error);
      handleNotification('Erreur lors du chargement des données', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    setAppData(null);
    setIsAuthenticated(false);
    setCurrentView('budgets');
  };

  const refreshData = async () => {
    try {
      const data = await loadData();
      setAppData(data);
    } catch (error) {
      console.error('Error refreshing data:', error);
      handleNotification('Erreur lors du rafraîchissement des données', 'error');
    }
  };

  const handleNotification = (message: string, severity: NotificationState['severity'] = 'success') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Router>
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </ThemeProvider>
  );
}

export default App;
