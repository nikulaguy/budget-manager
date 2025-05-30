import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { Budget, Expense } from '../types/types';
import { addExpense } from '../utils/storage';

export interface ExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  budget: Budget;
  onDataChange: () => Promise<void>;
}

const ExpenseDialog: React.FC<ExpenseDialogProps> = ({
  open,
  onClose,
  budget,
  onDataChange,
}) => {
  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id' | 'user'>>({
    amount: 0,
    description: '',
    budgetId: budget.id,
    date: new Date().toISOString().split('T')[0],
  });

  const handleAdd = async () => {
    if (!newExpense.amount || !newExpense.description) {
      return;
    }

    try {
      await addExpense(newExpense);
      await onDataChange();
      onClose();
      setNewExpense({
        amount: 0,
        description: '',
        budgetId: budget.id,
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Ajouter une dépense pour {budget.title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Description"
            value={newExpense.description}
            onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Montant"
            type="number"
            value={newExpense.amount}
            onChange={(e) => setNewExpense(prev => ({ ...prev, amount: Number(e.target.value) }))}
            fullWidth
            InputProps={{
              endAdornment: <Typography>€</Typography>,
            }}
          />
          <TextField
            label="Date"
            type="date"
            value={newExpense.date}
            onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!newExpense.amount || !newExpense.description}
        >
          Ajouter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseDialog; 