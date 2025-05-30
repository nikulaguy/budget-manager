import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Add,
  Refresh,
  Visibility,
  AccountBalance,
  Savings,
  NavigateNext,
  NavigateBefore
} from '@mui/icons-material'
import { format, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

import { useBudget } from '../contexts/BudgetContext'
import { defaultReferenceBudgets, getTotalBudgetAmount, getTotalSavingsAmount } from '../data/referenceBudgets'

const HomePage: React.FC = () => {
  const { currentMonth, currentYear, setCurrentMonth, setCurrentYear } = useBudget()
  const [showNextMonthDialog, setShowNextMonthDialog] = useState(false)

  // Date actuelle pour affichage
  const currentDate = new Date(currentYear, currentMonth - 1)
  
  // Calcul des totaux basés sur les vrais budgets de référence
  const totalBudgetReference = getTotalBudgetAmount()
  const totalSavingsReference = getTotalSavingsAmount()
  
  // Données de démonstration - en production, ces valeurs viendraient de la base de données
  const budgetSummary = {
    totalBudget: Math.round(totalBudgetReference),
    totalSpent: Math.round(totalBudgetReference * 0.74), // 74% dépensé
    totalRemaining: Math.round(totalBudgetReference * 0.26),
    totalSavings: Math.round(totalSavingsReference),
    savingsSpent: Math.round(totalSavingsReference * 0.12), // 12% utilisé
    savingsRemaining: Math.round(totalSavingsReference * 0.88)
  }

  // Transformation des budgets de référence en budgets mensuels avec simulation de données
  const monthlyBudgets = defaultReferenceBudgets
    .filter(budget => budget.category !== 'Épargne')
    .map((budget, index) => {
      // Simulation de données variables pour chaque budget
      const spentPercentage = 0.5 + (Math.sin(index) * 0.3) // Entre 20% et 80%
      const spent = Math.round(budget.value * Math.abs(spentPercentage))
      const remaining = budget.value - spent
      const percentage = (spent / budget.value) * 100

      return {
        id: `budget-${index}`,
        name: budget.name,
        referenceValue: budget.value,
        spent: spent,
        remaining: remaining,
        category: budget.category,
        percentage: Math.round(percentage * 100) / 100
      }
    })

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return 'error'
    if (percentage > 80) return 'warning'
    return 'success'
  }

  const getStatusChip = (percentage: number) => {
    if (percentage > 100) {
      return <Chip label="Dépassé" color="error" size="small" />
    }
    if (percentage > 80) {
      return <Chip label="Attention" color="warning" size="small" />
    }
    return <Chip label="OK" color="success" size="small" />
  }

  const handleNextMonth = () => {
    setShowNextMonthDialog(true)
  }

  const confirmNextMonth = () => {
    const nextDate = addMonths(currentDate, 1)
    setCurrentMonth(nextDate.getMonth() + 1)
    setCurrentYear(nextDate.getFullYear())
    setShowNextMonthDialog(false)
    toast.success(`Passage au mois de ${format(nextDate, 'MMMM yyyy', { locale: fr })}`)
  }

  const handlePreviousMonth = () => {
    const prevDate = subMonths(currentDate, 1)
    setCurrentMonth(prevDate.getMonth() + 1)
    setCurrentYear(prevDate.getFullYear())
    toast.success(`Retour au mois de ${format(prevDate, 'MMMM yyyy', { locale: fr })}`)
  }

  const handleAddExpense = (budgetName: string) => {
    // TODO: Ouvrir modal d'ajout de dépense
    toast(`Ajout de dépense pour ${budgetName}`, { icon: 'ℹ️' })
  }

  const handleResetBudget = (budgetName: string) => {
    // TODO: Implémenter la réinitialisation du budget
    toast.success(`Budget ${budgetName} réinitialisé`)
  }

  const handleViewExpenses = (budgetName: string) => {
    // TODO: Ouvrir la liste des dépenses
    toast(`Affichage des dépenses pour ${budgetName}`, { icon: '👁️' })
  }

  const currentMonthName = format(currentDate, 'MMMM yy', { locale: fr })

  return (
    <Box>
      {/* En-tête avec navigation de mois */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Tableau de bord
          </Typography>
          <Typography variant="h6" color="textSecondary">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={handlePreviousMonth}
            aria-label="Mois précédent"
            color="primary"
          >
            <NavigateBefore />
          </IconButton>
          <IconButton 
            onClick={handleNextMonth}
            aria-label="Mois suivant"
            color="primary"
          >
            <NavigateNext />
          </IconButton>
        </Box>
      </Box>

      {/* Résumé des budgets */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Budget Principal</Typography>
              </Box>
              <Typography variant="h4" color="primary.main" gutterBottom>
                {budgetSummary.totalRemaining}€
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Restant sur {budgetSummary.totalBudget}€
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(budgetSummary.totalSpent / budgetSummary.totalBudget) * 100}
                color={getProgressColor((budgetSummary.totalSpent / budgetSummary.totalBudget) * 100)}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption">
                  Dépensé: {budgetSummary.totalSpent}€
                </Typography>
                <Typography variant="caption">
                  {Math.round((budgetSummary.totalSpent / budgetSummary.totalBudget) * 100)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Savings sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Épargne</Typography>
              </Box>
              <Typography variant="h4" color="success.main" gutterBottom>
                {budgetSummary.savingsRemaining}€
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Restant sur {budgetSummary.totalSavings}€
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(budgetSummary.savingsSpent / budgetSummary.totalSavings) * 100}
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption">
                  Utilisé: {budgetSummary.savingsSpent}€
                </Typography>
                <Typography variant="caption">
                  {Math.round((budgetSummary.savingsSpent / budgetSummary.totalSavings) * 100)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau des budgets */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Budgets en cours - {currentMonthName}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleNextMonth}
              aria-label="Passer au mois suivant"
            >
              Mois suivant
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Budget</TableCell>
                  <TableCell align="right">Référence</TableCell>
                  <TableCell align="right">Dépensé</TableCell>
                  <TableCell align="right">Restant</TableCell>
                  <TableCell align="center">Progression</TableCell>
                  <TableCell align="center">Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyBudgets.map((budget) => (
                  <TableRow key={budget.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {budget.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {budget.category}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {budget.referenceValue}€
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {budget.spent}€
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={budget.remaining < 0 ? 'error.main' : 'text.primary'}
                      >
                        {budget.remaining}€
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ width: 100, mx: 'auto' }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(budget.percentage, 100)}
                          color={getProgressColor(budget.percentage)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                          {Math.round(budget.percentage)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {getStatusChip(budget.percentage)}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleAddExpense(budget.name)}
                          aria-label={`Ajouter dépense pour ${budget.name}`}
                          color="primary"
                        >
                          <Add />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleResetBudget(budget.name)}
                          aria-label={`Réinitialiser ${budget.name}`}
                          color="secondary"
                        >
                          <Refresh />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleViewExpenses(budget.name)}
                          aria-label={`Voir dépenses de ${budget.name}`}
                          color="info"
                        >
                          <Visibility />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog de confirmation pour le mois suivant */}
      <Dialog 
        open={showNextMonthDialog} 
        onClose={() => setShowNextMonthDialog(false)}
        aria-labelledby="next-month-dialog-title"
      >
        <DialogTitle id="next-month-dialog-title">
          Passer au mois suivant
        </DialogTitle>
        <DialogContent>
          <Typography>
            Voulez-vous passer au mois de {format(addMonths(currentDate, 1), 'MMMM yyyy', { locale: fr })} ?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Les budgets seront réinitialisés avec les valeurs de référence + les restes du mois actuel.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNextMonthDialog(false)}>
            Annuler
          </Button>
          <Button onClick={confirmNextMonth} variant="contained">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default HomePage 