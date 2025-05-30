import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'

import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import ReferenceBudgetsPage from './pages/ReferenceBudgetsPage'
import SettingsPage from './pages/SettingsPage'

const App: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        role="status"
        aria-label="Chargement de l'application"
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/historique" element={<HistoryPage />} />
        <Route path="/budgets-reference" element={<ReferenceBudgetsPage />} />
        <Route path="/parametres" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App 