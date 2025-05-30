import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import { Budget, BankAccount, BudgetCategory } from '../types/types';
import { addBudget } from '../utils/storage';

export interface AddBudgetDialogProps {
  open: boolean;
  onClose: () => void;
  bankAccounts: BankAccount[];
  categories: BudgetCategory[];
  onDataChange: () => Promise<void>;
}

const AddBudgetDialog: React.FC<AddBudgetDialogProps> = ({
  open,
  onClose,
  bankAccounts,
  categories,
  onDataChange,
}) => {
  const [newBudget, setNewBudget] = useState<Omit<Budget, 'id' | 'spent' | 'remaining'>>({
    title: '',
    amount: 0,
    categoryId: '',
    bankAccountId: '',
  });

  const handleAdd = async () => {
    if (!newBudget.title || !newBudget.amount || !newBudget.categoryId || !newBudget.bankAccountId) {
      return;
    }

    try {
      await addBudget(newBudget);
      await onDataChange();
      onClose();
      setNewBudget({
        title: '',
        amount: 0,
        categoryId: '',
        bankAccountId: '',
      });
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Ajouter un budget</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Titre"
            value={newBudget.title}
            onChange={(e) => setNewBudget(prev => ({ ...prev, title: e.target.value }))}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={newBudget.categoryId}
              label="Catégorie"
              onChange={(e: SelectChangeEvent) => 
                setNewBudget(prev => ({ ...prev, categoryId: e.target.value }))
              }
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Compte bancaire</InputLabel>
            <Select
              value={newBudget.bankAccountId}
              label="Compte bancaire"
              onChange={(e: SelectChangeEvent) => 
                setNewBudget(prev => ({ ...prev, bankAccountId: e.target.value }))
              }
            >
              {bankAccounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Montant"
            type="number"
            value={newBudget.amount}
            onChange={(e) => setNewBudget(prev => ({ ...prev, amount: Number(e.target.value) }))}
            fullWidth
            InputProps={{
              endAdornment: <Typography>€</Typography>,
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!newBudget.title || !newBudget.amount || !newBudget.categoryId || !newBudget.bankAccountId}
        >
          Ajouter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBudgetDialog; 