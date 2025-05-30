import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Budget, Expense } from '../types/types';
import { deleteExpense } from '../utils/storage';

interface BudgetHistoryProps {
  history: {
    period: string;
    budgets: Budget[];
    expenses: Expense[];
  }[];
  onPeriodSelect: (period: string) => void;
  onDeleteHistory: (period: string) => void;
  onDeleteAllHistory: () => void;
}

interface ExpenseDetailsDialogProps {
  budget: Budget;
  open: boolean;
  onClose: () => void;
  expenses: Expense[];
  period: string;
  onExpenseDelete: () => void;
}

const ExpenseDetailsDialog: React.FC<ExpenseDetailsDialogProps> = ({
  budget,
  open,
  onClose,
  expenses,
  period,
  onExpenseDelete,
}) => {
  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      deleteExpense(expenseId, period);
      onExpenseDelete();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Dépenses pour {budget.title}
      </DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Montant</TableCell>
                <TableCell>Par</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map(expense => (
                <TableRow key={expense.id}>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(expense.amount)}
                  </TableCell>
                  <TableCell>{expense.user || ''}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteExpense(expense.id)}
                      title="Supprimer la dépense"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

const BudgetHistory: React.FC<BudgetHistoryProps> = ({
  history,
  onPeriodSelect,
  onDeleteHistory,
  onDeleteAllHistory,
}) => {
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<Expense[]>([]);

  const handleViewExpenses = (budget: Budget, period: string, expenses: Expense[]) => {
    setSelectedBudget(budget);
    setSelectedPeriod(period);
    setSelectedExpenses(expenses.filter(e => e.budgetId === budget.id));
  };

  const formatMonthYear = (period: string) => {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    return `${monthNames[date.getMonth()]} ${year}`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Historique des budgets
      </Typography>

      {history.length === 0 ? (
        <Typography>Aucun historique disponible</Typography>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={onDeleteAllHistory}
            >
              Supprimer tout l'historique
            </Button>
          </Box>

          {history.map(({ period, budgets, expenses }) => (
            <Box key={period} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6">
                  {formatMonthYear(period)}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onPeriodSelect(period)}
                >
                  Restaurer
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => onDeleteHistory(period)}
                >
                  Supprimer
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Budget</TableCell>
                      <TableCell align="right">Montant</TableCell>
                      <TableCell align="right">Dépensé</TableCell>
                      <TableCell align="right">Restant</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {budgets.map(budget => {
                      const budgetExpenses = expenses.filter(e => e.budgetId === budget.id);
                      const totalSpent = budgetExpenses.reduce((sum, e) => sum + e.amount, 0);
                      return (
                        <TableRow key={budget.id}>
                          <TableCell>{budget.title}</TableCell>
                          <TableCell align="right">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(budget.amount)}
                          </TableCell>
                          <TableCell align="right">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(totalSpent)}
                          </TableCell>
                          <TableCell align="right">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(budget.amount - totalSpent)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              onClick={() => handleViewExpenses(budget, period, expenses)}
                              disabled={budgetExpenses.length === 0}
                            >
                              Voir les dépenses
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </>
      )}

      {selectedBudget && selectedPeriod && (
        <ExpenseDetailsDialog
          budget={selectedBudget}
          open={!!selectedBudget}
          onClose={() => {
            setSelectedBudget(null);
            setSelectedPeriod(null);
            setSelectedExpenses([]);
          }}
          expenses={selectedExpenses}
          period={selectedPeriod}
          onExpenseDelete={() => {
            // Mettre à jour la liste des dépenses
            const periodExpenses = history
              .find(h => h.period === selectedPeriod)
              ?.expenses || [];
            setSelectedExpenses(periodExpenses.filter(e => e.budgetId === selectedBudget.id));
          }}
        />
      )}
    </Box>
  );
};

export default BudgetHistory; 