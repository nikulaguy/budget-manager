import React, { useState, useEffect } from 'react'
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
  DialogActions,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Paper
} from '@mui/material'
import {
  Add,
  Refresh,
  Visibility,
  AccountBalance,
  Savings,
  NavigateNext,
  NavigateBefore,
  MoreVert,
  Euro,
  Delete
} from '@mui/icons-material'
import { format, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toastWithClose } from '../utils/toast'

import { useBudget } from '../contexts/BudgetContext'
import { useAuth } from '../contexts/AuthContext'

// Fonction utilitaire pour arrondir les nombres et éviter les problèmes de précision
const roundToTwo = (num: number): number => {
  return Math.round(num * 100) / 100
}

const HomePage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { user } = useAuth()
  const { 
    currentMonth, 
    currentYear, 
    setCurrentMonth, 
    setCurrentYear,
    globalAddExpenseOpen,
    selectedBudgetForExpense,
    closeGlobalDialogs,
    monthlyBudgets,
    budgetExpenses,
    addExpense,
    deleteExpense,
    resetBudget,
    resetAllBudgets,
    moveToNextMonth
  } = useBudget()
  const [showNextMonthDialog, setShowNextMonthDialog] = useState(false)
  const [showResetAllBudgetsDialog, setShowResetAllBudgetsDialog] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null)
  
  // États locaux pour les modales (quand ouvertes depuis le tableau)
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false)
  const [showViewExpensesDialog, setShowViewExpensesDialog] = useState(false)
  const [showResetBudgetDialog, setShowResetBudgetDialog] = useState(false)
  const [expenseForm, setExpenseForm] = useState(() => {
    const today = new Date()
    const todayString = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0')
    return {
      description: '',
      amount: '',
      date: todayString, // Date du jour au format YYYY-MM-DD garanti
      budgetName: '' // Nouveau champ pour la sélection de budget
    }
  })

  // Date actuelle pour affichage
  const currentDate = new Date(currentYear, currentMonth - 1)
  
  // Calcul des totaux basés sur les vraies données des budgets
  const budgetsByCategory = monthlyBudgets.reduce((acc, budget) => {
    if (!acc[budget.category]) {
      acc[budget.category] = []
    }
    acc[budget.category].push(budget)
    return acc
  }, {} as Record<string, typeof monthlyBudgets>)

  // Ordre des catégories
  const categoryOrder = ['Courant', 'Mensuel', 'Annuel', 'Épargne']
  const orderedCategories = categoryOrder.filter(cat => budgetsByCategory[cat])

  // Calcul des totaux réels
  const totalBudgetBudgets = monthlyBudgets.filter(b => b.category !== 'Épargne')
  const totalSavingsBudgets = monthlyBudgets.filter(b => b.category === 'Épargne')
  
  // Calcul des totaux réels avec arrondi pour éviter les problèmes de précision
  const budgetSummary = {
    totalBudget: roundToTwo(totalBudgetBudgets.reduce((sum, b) => sum + b.referenceValue, 0)),
    totalSpent: roundToTwo(totalBudgetBudgets.reduce((sum, b) => sum + b.spent, 0)),
    totalRemaining: roundToTwo(totalBudgetBudgets.reduce((sum, b) => sum + b.remaining, 0)),
    totalSavings: roundToTwo(totalSavingsBudgets.reduce((sum, b) => sum + b.referenceValue, 0)),
    savingsSpent: roundToTwo(totalSavingsBudgets.reduce((sum, b) => sum + b.spent, 0)),
    savingsRemaining: roundToTwo(totalSavingsBudgets.reduce((sum, b) => sum + b.remaining, 0))
  }

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return 'error'
    if (percentage > 80) return 'warning'
    return 'success'
  }

  const handleNextMonth = () => {
    const today = new Date()
    const currentDateToCheck = new Date(currentYear, currentMonth - 1)
    const isCurrentMonth = currentDateToCheck.getMonth() === today.getMonth() && 
                           currentDateToCheck.getFullYear() === today.getFullYear()
    
    if (isCurrentMonth) {
      // Si on est sur le mois en cours, on montre le dialog pour passer au mois suivant avec réinitialisation
      setShowNextMonthDialog(true)
    } else {
      // Sinon, navigation normale
      const nextDate = addMonths(currentDate, 1)
      setCurrentMonth(nextDate.getMonth() + 1)
      setCurrentYear(nextDate.getFullYear())
    }
  }

  const confirmNextMonth = () => {
    // Utiliser la nouvelle fonction du contexte qui gère la logique cumulative
    moveToNextMonth()
    setShowNextMonthDialog(false)
  }

  const handlePreviousMonth = () => {
    const prevDate = subMonths(currentDate, 1)
    setCurrentMonth(prevDate.getMonth() + 1)
    setCurrentYear(prevDate.getFullYear())
  }

  const handleAddExpense = (budgetName: string, fromMenu: boolean = false) => {
    setSelectedBudget(budgetName)
    // Réinitialiser le formulaire avec la date du jour et le budget sélectionné
    const today = new Date()
    const todayString = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0')
    
    setExpenseForm({
      description: '',
      amount: '',
      date: todayString,
      budgetName: budgetName
    })
    setShowAddExpenseDialog(true)
    if (fromMenu) handleCloseMenu()
  }

  const handleResetBudget = (budgetName: string, fromMenu: boolean = false) => {
    setSelectedBudget(budgetName)
    setShowResetBudgetDialog(true)
    if (fromMenu) handleCloseMenu()
  }

  const handleViewExpenses = (budgetName: string, fromMenu: boolean = false) => {
    setSelectedBudget(budgetName)
    setShowViewExpensesDialog(true)
    if (fromMenu) handleCloseMenu()
  }

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, budgetName: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedBudget(budgetName)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedBudget(null)
  }

  // Gestion des dialogues globaux (depuis le SpeedDial)
  useEffect(() => {
    if (globalAddExpenseOpen) {
      const today = new Date()
      const todayString = today.getFullYear() + '-' + 
                         String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(today.getDate()).padStart(2, '0')
      
      setExpenseForm({
        description: '',
        amount: '',
        date: todayString,
        budgetName: selectedBudgetForExpense || ''
      })
    }
  }, [globalAddExpenseOpen, selectedBudgetForExpense])

  const handleSaveExpense = () => {
    const budgetName = globalAddExpenseOpen ? expenseForm.budgetName : selectedBudget
    
    // Validation améliorée avec logs pour déboguer
    console.log('Validation du formulaire:', {
      description: expenseForm.description,
      amount: expenseForm.amount,
      date: expenseForm.date,
      budgetName: budgetName
    })

    // Vérification plus stricte des champs
    const isDescriptionValid = expenseForm.description && expenseForm.description.trim().length > 0
    const isAmountValid = expenseForm.amount && !isNaN(parseFloat(expenseForm.amount)) && parseFloat(expenseForm.amount) > 0
    const isDateValid = expenseForm.date && expenseForm.date.length === 10 // Format YYYY-MM-DD
    const isBudgetValid = budgetName && budgetName.trim().length > 0

    if (!isDescriptionValid || !isAmountValid || !isDateValid || !isBudgetValid) {
      const errors = []
      if (!isDescriptionValid) errors.push('Description manquante')
      if (!isAmountValid) errors.push('Montant invalide')
      if (!isDateValid) errors.push('Date invalide')
      if (!isBudgetValid) errors.push('Budget non sélectionné')
      
      console.error('Erreurs de validation:', errors)
      toastWithClose.error(`Erreur: ${errors.join(', ')}`)
      return
    }

    const amount = parseFloat(expenseForm.amount)
    
    // Ajouter la dépense à la liste
    const newExpense = {
      description: expenseForm.description.trim(),
      amount: amount,
      date: new Date(expenseForm.date), // Utiliser la date du formulaire
      category: monthlyBudgets.find(b => b.name === budgetName)?.category || 'Courant',
      userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      userEmail: user?.email || ''
    }

    addExpense(budgetName, newExpense)
    
    toastWithClose.success(`Dépense de ${amount}€ ajoutée pour ${budgetName}`)
    
    // Réinitialiser le formulaire avec une date valide
    const today = new Date()
    const todayString = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0')
    
    setExpenseForm({ 
      description: '', 
      amount: '', 
      date: todayString, // Format YYYY-MM-DD garanti
      budgetName: ''
    })
    
    // Fermer la bonne modale
    if (globalAddExpenseOpen) {
      closeGlobalDialogs()
    } else {
      setShowAddExpenseDialog(false)
      setSelectedBudget(null)
    }
  }

  const handleConfirmResetBudget = () => {
    if (!selectedBudget) return

    // Supprimer toutes les dépenses du budget
    resetBudget(selectedBudget)

    toastWithClose.success(`Budget "${selectedBudget}" réinitialisé`)
    setShowResetBudgetDialog(false)
    setSelectedBudget(null)
  }

  const handleResetAllBudgets = () => {
    setShowResetAllBudgetsDialog(true)
  }

  const handleConfirmResetAllBudgets = () => {
    // Supprimer toutes les dépenses de tous les budgets
    resetAllBudgets()

    toastWithClose.success('Tous les budgets ont été réinitialisés à leurs valeurs de référence')
    setShowResetAllBudgetsDialog(false)
  }

  const handleDeleteExpense = (expenseId: string) => {
    if (!selectedBudget) return

    const expense = budgetExpenses[selectedBudget]?.find(e => e.id === expenseId)
    if (!expense) return

    // Supprimer la dépense
    deleteExpense(selectedBudget, expenseId)

    toastWithClose.success(`Dépense "${expense.description}" supprimée`)
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
              <Typography 
                variant="body2" 
                color="textSecondary" 
                gutterBottom
                sx={{ fontSize: isMobile ? '0.9rem' : undefined }}
              >
                Restant sur {budgetSummary.totalBudget}€
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(budgetSummary.totalSpent / budgetSummary.totalBudget) * 100}
                color={getProgressColor((budgetSummary.totalSpent / budgetSummary.totalBudget) * 100)}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography 
                  variant="caption"
                  sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
                >
                  Dépensé: {budgetSummary.totalSpent}€
                </Typography>
                <Typography 
                  variant="caption"
                  sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
                >
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
              <Typography 
                variant="body2" 
                color="textSecondary" 
                gutterBottom
                sx={{ fontSize: isMobile ? '0.9rem' : undefined }}
              >
                Restant sur {budgetSummary.totalSavings}€
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(budgetSummary.savingsSpent / budgetSummary.totalSavings) * 100}
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography 
                  variant="caption"
                  sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
                >
                  Utilisé: {budgetSummary.savingsSpent}€
                </Typography>
                <Typography 
                  variant="caption"
                  sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
                >
                  {Math.round((budgetSummary.savingsSpent / budgetSummary.totalSavings) * 100)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* En-tête des budgets avec boutons de contrôle */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Budgets en cours - {currentMonthName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Bouton de réinitialisation globale - uniquement pour Master Maître */}
              {user?.role === 'masterMaitre' && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Refresh />}
                  onClick={handleResetAllBudgets}
                  aria-label="Réinitialiser tous les budgets"
                  size={isMobile ? "small" : "medium"}
                >
                  {isMobile ? "Reset All" : "Réinitialiser tout"}
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleNextMonth}
                aria-label="Passer au mois suivant"
                size={isMobile ? "small" : "medium"}
              >
                {isMobile ? "Suivant" : "Mois suivant"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Budgets organisés par catégories */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {orderedCategories.map((categoryName) => {
          const categoryBudgets = budgetsByCategory[categoryName]
          const categoryTotal = roundToTwo(categoryBudgets.reduce((sum, budget) => sum + budget.referenceValue, 0))
          const categorySpent = roundToTwo(categoryBudgets.reduce((sum, budget) => sum + budget.spent, 0))
          const categoryRemaining = roundToTwo(categoryBudgets.reduce((sum, budget) => sum + budget.remaining, 0))

          const getCategoryColor = (category: string) => {
            switch (category) {
              case 'Courant': return 'primary'
              case 'Mensuel': return 'secondary'
              case 'Annuel': return 'warning'
              case 'Épargne': return 'success'
              default: return 'default'
            }
          }

          return (
            <Card key={categoryName}>
              <CardContent>
                {/* En-tête de catégorie */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6">
                      {categoryName}
                    </Typography>
                    <Chip
                      label={`${categoryBudgets.length} budget${categoryBudgets.length > 1 ? 's' : ''}`}
                      size="small"
                      color={getCategoryColor(categoryName) as any}
                    />
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="textSecondary">
                      {categorySpent}€ / {categoryTotal}€
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Restant: {categoryRemaining}€
                    </Typography>
                  </Box>
                </Box>

                {/* Tableau des budgets de cette catégorie - Desktop */}
                {!isMobile ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: '30%' }}>Budget</TableCell>
                          <TableCell align="right" sx={{ width: '12%' }}>Référence</TableCell>
                          <TableCell align="right" sx={{ width: '12%' }}>Dépensé</TableCell>
                          <TableCell align="center" sx={{ width: '25%' }}>Restant / Progression</TableCell>
                          <TableCell align="center" sx={{ width: '21%' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categoryBudgets.map((budget) => (
                          <TableRow key={budget.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {budget.name}
                              </Typography>
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
                            <TableCell align="center">
                              <Box sx={{ width: '100%' }}>
                                <Typography
                                  variant="body2"
                                  color={budget.remaining < 0 ? 'error.main' : 'text.primary'}
                                  sx={{ fontWeight: 'medium', mb: 0.5 }}
                                >
                                  {budget.remaining}€
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(budget.percentage, 100)}
                                  color={getProgressColor(budget.percentage)}
                                  sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                                />
                                <Typography variant="caption">
                                  {Math.round(budget.percentage)}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleAddExpense(budget.name, false)}
                                  aria-label={`Ajouter dépense pour ${budget.name}`}
                                  color="primary"
                                >
                                  <Add />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleResetBudget(budget.name, false)}
                                  aria-label={`Réinitialiser ${budget.name}`}
                                  color="secondary"
                                >
                                  <Refresh />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewExpenses(budget.name, false)}
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
                ) : (
                  /* Affichage mobile en cartes */
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {categoryBudgets.map((budget) => (
                      <Paper key={budget.id} sx={{ p: 2 }} elevation={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="body1" 
                              fontWeight="medium"
                              sx={{ 
                                fontSize: '1rem',
                                lineHeight: 1.3,
                                mb: 0.5,
                                wordBreak: 'break-word'
                              }}
                            >
                              {budget.name}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="textSecondary"
                              sx={{ fontSize: '0.875rem' }}
                            >
                              Référence: {budget.referenceValue}€ • Dépensé: {budget.spent}€
                            </Typography>
                          </Box>
                          <IconButton
                            size="medium"
                            onClick={(event) => handleOpenMenu(event, budget.name)}
                            aria-label={`Actions pour ${budget.name}`}
                            sx={{ ml: 1 }}
                          >
                            <MoreVert />
                          </IconButton>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography
                              variant="h6"
                              color={budget.remaining < 0 ? 'error.main' : 'text.primary'}
                              sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}
                            >
                              Restant: {budget.remaining}€
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="textSecondary"
                              sx={{ fontSize: '0.875rem' }}
                            >
                              {Math.round(budget.percentage)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(budget.percentage, 100)}
                            color={getProgressColor(budget.percentage)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          )
        })}
      </Box>

      {/* Menu contextuel pour mobile */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => selectedBudget && handleAddExpense(selectedBudget, true)}>
          <Add sx={{ mr: 1 }} fontSize="small" />
          Ajouter dépense
        </MenuItem>
        <MenuItem onClick={() => selectedBudget && handleResetBudget(selectedBudget, true)}>
          <Refresh sx={{ mr: 1 }} fontSize="small" />
          Réinitialiser
        </MenuItem>
        <MenuItem onClick={() => selectedBudget && handleViewExpenses(selectedBudget, true)}>
          <Visibility sx={{ mr: 1 }} fontSize="small" />
          Voir dépenses
        </MenuItem>
      </Menu>

      {/* Dialog d'ajout de dépense - Local ou Global */}
      <Dialog
        open={showAddExpenseDialog || globalAddExpenseOpen}
        onClose={() => {
          if (globalAddExpenseOpen) {
            closeGlobalDialogs()
          } else {
            setShowAddExpenseDialog(false)
          }
        }}
        maxWidth="sm"
        fullWidth
        aria-labelledby="add-expense-dialog-title"
      >
        <DialogTitle id="add-expense-dialog-title">
          Ajouter une dépense
          {!globalAddExpenseOpen && selectedBudget && ` - ${selectedBudget}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Sélection de budget - uniquement pour le mode global */}
            {globalAddExpenseOpen && (
              <FormControl fullWidth>
                <InputLabel id="budget-select-label">Budget</InputLabel>
                <Select
                  labelId="budget-select-label"
                  value={expenseForm.budgetName}
                  label="Budget"
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, budgetName: e.target.value }))}
                >
                  {monthlyBudgets.map((budget) => (
                    <MenuItem key={budget.name} value={budget.name}>
                      <Box>
                        <Typography variant="body2">{budget.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {budget.category} - {budget.referenceValue}€
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            <TextField
              label="Description"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              placeholder="Ex: Courses au supermarché"
              autoFocus={!globalAddExpenseOpen}
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
          <Button onClick={() => {
            if (globalAddExpenseOpen) {
              closeGlobalDialogs()
            } else {
              setShowAddExpenseDialog(false)
            }
          }}>
            Annuler
          </Button>
          <Button variant="contained" onClick={handleSaveExpense}>
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog des dépenses */}
      <Dialog
        open={showViewExpensesDialog}
        onClose={() => setShowViewExpensesDialog(false)}
        maxWidth="lg"
        fullWidth
        aria-labelledby="view-expenses-dialog-title"
      >
        <DialogTitle id="view-expenses-dialog-title">
          Dépenses - {selectedBudget}
        </DialogTitle>
        <DialogContent>
          {selectedBudget && budgetExpenses[selectedBudget] && budgetExpenses[selectedBudget].length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '30%' }}>Description</TableCell>
                    <TableCell sx={{ width: '25%' }}>Utilisateur</TableCell>
                    <TableCell sx={{ width: '20%' }}>Date</TableCell>
                    <TableCell align="right" sx={{ width: '15%' }}>Montant</TableCell>
                    <TableCell align="center" sx={{ width: '10%' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {budgetExpenses[selectedBudget].map((expense) => (
                    <TableRow key={expense.id} hover>
                      <TableCell sx={{ width: '30%' }}>
                        <Typography variant="body2" fontWeight="medium">
                          {expense.description}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {expense.category}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: '25%' }}>
                        <Typography variant="body2">
                          {expense.userName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {expense.userEmail}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: '20%' }}>
                        <Typography variant="body2">
                          {format(expense.date, 'dd/MM/yyyy')}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {format(expense.date, 'HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ width: '15%' }}>
                        <Typography variant="body2" fontWeight="medium">
                          {expense.amount.toFixed(2)}€
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ width: '10%' }}>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteExpense(expense.id)}
                          aria-label={`Supprimer la dépense ${expense.description}`}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>
              Aucune dépense enregistrée pour ce budget
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewExpensesDialog(false)}>
            Fermer
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setShowViewExpensesDialog(false)
              if (selectedBudget) handleAddExpense(selectedBudget)
            }}
            startIcon={<Add />}
          >
            Ajouter une dépense
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de réinitialisation */}
      <Dialog
        open={showResetBudgetDialog}
        onClose={() => setShowResetBudgetDialog(false)}
        aria-labelledby="reset-budget-dialog-title"
      >
        <DialogTitle id="reset-budget-dialog-title">
          Réinitialiser le budget
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir réinitialiser le budget "{selectedBudget}" ?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Toutes les dépenses de ce mois seront supprimées et le budget sera remis à sa valeur de référence.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetBudgetDialog(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirmResetBudget}
            color="error"
            variant="contained"
          >
            Réinitialiser
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Dialog de confirmation de réinitialisation de tous les budgets */}
      <Dialog
        open={showResetAllBudgetsDialog}
        onClose={() => setShowResetAllBudgetsDialog(false)}
        aria-labelledby="reset-all-budgets-dialog-title"
      >
        <DialogTitle id="reset-all-budgets-dialog-title">
          Réinitialiser tous les budgets
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir réinitialiser tous les budgets ?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Toutes les dépenses de tous les budgets seront supprimées et les budgets seront remis à leurs valeurs de référence.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetAllBudgetsDialog(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirmResetAllBudgets}
            color="error"
            variant="contained"
          >
            Réinitialiser
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default HomePage 