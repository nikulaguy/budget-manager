import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Budget, Expense } from '../types/types';
import { deleteExpense } from '../utils/storage';
import { formatUserName } from '../utils/format';
import ConfirmDialog from './ConfirmDialog';

export interface ExpenseDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  budget: Budget;
  currentPeriod: string;
  onDataChange: () => Promise<void>;
  expenses: Expense[];
  onExpenseDelete: () => void;
}

const ExpenseDetailsDialog: React.FC<ExpenseDetailsDialogProps> = ({
  open,
  onClose,
  budget,
  currentPeriod,
  onDataChange,
  expenses,
  onExpenseDelete,
}) => {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<boolean>(false);

  const handleConfirmDelete = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsConfirmDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (selectedExpense) {
      try {
        await deleteExpense(selectedExpense.id, currentPeriod);
        await onDataChange();
        onExpenseDelete();
        setIsConfirmDeleteOpen(false);
        setSelectedExpense(null);
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Dépenses pour {budget.title}</DialogTitle>
        <DialogContent>
          {expenses.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Aucune dépense pour ce budget</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Utilisateur</TableCell>
                    <TableCell align="right">Montant</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.user ? formatUserName(expense.user) : 'Inconnu'}</TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(expense.amount)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleConfirmDelete(expense)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer la dépense"
        content="Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible."
      />
    </>
  );
};

export default ExpenseDetailsDialog; 