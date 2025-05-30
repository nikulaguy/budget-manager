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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
import { toast } from 'react-hot-toast'
import { toastWithClose } from '../utils/toast'
import { useNavigate } from 'react-router-dom'

import { useBudget } from '../contexts/BudgetContext'
import { defaultReferenceBudgets, getTotalBudgetAmount, getTotalSavingsAmount } from '../data/referenceBudgets'
import { useAuth } from '../contexts/AuthContext'

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
    globalAddBudgetOpen,
    globalAddCategoryOpen,
    monthlyBudgets,
    budgetExpenses,
    addExpense,
    deleteExpense,
    resetBudget,
    resetAllBudgets
  } = useBudget()
  const [showNextMonthDialog, setShowNextMonthDialog] = useState(false)
  const [showResetAllBudgetsDialog, setShowResetAllBudgetsDialog] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null)
  
  // États locaux pour les modales (quand ouvertes depuis le tableau)
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false)
  const [showViewExpensesDialog, setShowViewExpensesDialog] = useState(false)
  const [showResetBudgetDialog, setShowResetBudgetDialog] = useState(false)
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0], // Date du jour au format YYYY-MM-DD
    budgetName: '' // Nouveau champ pour la sélection de budget
  })

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

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return 'error'
    if (percentage > 80) return 'warning'
    return 'success'
  }

  const handleNextMonth = () => {
    setShowNextMonthDialog(true)
  }

  const confirmNextMonth = () => {
    const nextDate = addMonths(currentDate, 1)
    setCurrentMonth(nextDate.getMonth() + 1)
    setCurrentYear(nextDate.getFullYear())
    setShowNextMonthDialog(false)
    toastWithClose.success(`Passage au mois de ${format(nextDate, 'MMMM yyyy', { locale: fr })}`)
  }

  const handlePreviousMonth = () => {
    const prevDate = subMonths(currentDate, 1)
    setCurrentMonth(prevDate.getMonth() + 1)
    setCurrentYear(prevDate.getFullYear())
    toastWithClose.success(`Retour au mois de ${format(prevDate, 'MMMM yyyy', { locale: fr })}`)
  }

  const handleAddExpense = (budgetName: string, fromMenu: boolean = false) => {
    setSelectedBudget(budgetName)
    // Réinitialiser le formulaire avec la date du jour et le budget sélectionné
    setExpenseForm({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
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
      setExpenseForm({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        budgetName: selectedBudgetForExpense || ''
      })
    }
  }, [globalAddExpenseOpen, selectedBudgetForExpense])

  const handleSaveExpense = () => {
    const budgetName = globalAddExpenseOpen ? expenseForm.budgetName : selectedBudget
    
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.date || !budgetName) {
      toastWithClose.error('Veuillez remplir tous les champs')
      return
    }

    const amount = parseFloat(expenseForm.amount)
    
    // Ajouter la dépense à la liste
    const newExpense = {
      description: expenseForm.description,
      amount: amount,
      date: new Date(expenseForm.date), // Utiliser la date du formulaire
      category: monthlyBudgets.find(b => b.name === budgetName)?.category || 'Courant',
      userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      userEmail: user?.email || ''
    }

    addExpense(budgetName, newExpense)
    
    toastWithClose.success(`Dépense de ${amount}€ ajoutée pour ${budgetName}`)
    setExpenseForm({ 
      description: '', 
      amount: '', 
      date: new Date().toISOString().split('T')[0], // Réinitialiser avec la date du jour
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

  const navigate = useNavigate()

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

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Budget</TableCell>
                  <TableCell align="right">Référence</TableCell>
                  {!isMobile && (
                    <TableCell align="right">Dépensé</TableCell>
                  )}
                  <TableCell align="center">Restant / Progression</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyBudgets.map((budget) => (
                  <TableRow key={budget.id} hover>
                    <TableCell sx={{ 
                      minWidth: isMobile ? '120px' : 'auto',
                      maxWidth: isMobile ? '120px' : 'auto'
                    }}>
                      <Box>
                        <Typography 
                          variant="body2" 
                          fontWeight="medium"
                          sx={{ 
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: isMobile ? 'nowrap' : 'normal'
                          }}
                        >
                          {budget.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="textSecondary"
                          sx={{ fontSize: isMobile ? '0.6rem' : '0.75rem' }}
                        >
                          {budget.category}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: '60px' }}>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                      >
                        {budget.referenceValue}€
                      </Typography>
                    </TableCell>
                    {!isMobile && (
                      <TableCell align="right">
                        <Typography variant="body2">
                          {budget.spent}€
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell align="center" sx={{ minWidth: isMobile ? '80px' : '120px' }}>
                      <Box sx={{ width: '100%' }}>
                        <Typography
                          variant="body2"
                          color={budget.remaining < 0 ? 'error.main' : 'text.primary'}
                          sx={{ 
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            fontWeight: 'medium',
                            mb: 0.5 
                          }}
                        >
                          {budget.remaining}€
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(budget.percentage, 100)}
                          color={getProgressColor(budget.percentage)}
                          sx={{ 
                            height: isMobile ? 4 : 6, 
                            borderRadius: 3,
                            mb: 0.5
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: isMobile ? '0.6rem' : '0.75rem',
                            display: 'block' 
                          }}
                        >
                          {Math.round(budget.percentage)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ width: isMobile ? '40px' : 'auto' }}>
                      {isMobile ? (
                        <IconButton
                          size="small"
                          onClick={(event) => handleOpenMenu(event, budget.name)}
                          aria-label={`Actions pour ${budget.name}`}
                        >
                          <MoreVert />
                        </IconButton>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={(event) => handleAddExpense(budget.name, false)}
                            aria-label={`Ajouter dépense pour ${budget.name}`}
                            color="primary"
                          >
                            <Add />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(event) => handleResetBudget(budget.name, false)}
                            aria-label={`Réinitialiser ${budget.name}`}
                            color="secondary"
                          >
                            <Refresh />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(event) => handleViewExpenses(budget.name, false)}
                            aria-label={`Voir dépenses de ${budget.name}`}
                            color="info"
                          >
                            <Visibility />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

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
        <MenuItem onClick={(event) => selectedBudget && handleAddExpense(selectedBudget, true)}>
          <Add sx={{ mr: 1 }} fontSize="small" />
          Ajouter dépense
        </MenuItem>
        <MenuItem onClick={(event) => selectedBudget && handleResetBudget(selectedBudget, true)}>
          <Refresh sx={{ mr: 1 }} fontSize="small" />
          Réinitialiser
        </MenuItem>
        <MenuItem onClick={(event) => selectedBudget && handleViewExpenses(selectedBudget, true)}>
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
                    <TableCell>Description</TableCell>
                    <TableCell>Utilisateur</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Montant</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {budgetExpenses[selectedBudget].map((expense) => (
                    <TableRow key={expense.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {expense.description}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {expense.category}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {expense.userName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {expense.userEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(expense.date, 'dd/MM/yyyy')}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {format(expense.date, 'HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {expense.amount.toFixed(2)}€
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
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