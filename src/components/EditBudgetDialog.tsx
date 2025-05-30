import React, { useState, useEffect } from 'react';
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
import { updateBudget } from '../utils/storage';

export interface EditBudgetDialogProps {
  open: boolean;
  onClose: () => void;
  budget: Budget;
  bankAccounts: BankAccount[];
  categories: BudgetCategory[];
  onDataChange: () => Promise<void>;
}

const EditBudgetDialog: React.FC<EditBudgetDialogProps> = ({
  open,
  onClose,
  budget,
  bankAccounts,
  categories,
  onDataChange,
}) => {
  const [editedBudget, setEditedBudget] = useState<Budget>(budget);

  useEffect(() => {
    setEditedBudget(budget);
  }, [budget]);

  const handleSave = async () => {
    try {
      await updateBudget(editedBudget);
      await onDataChange();
      onClose();
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Modifier le budget</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Titre"
            value={editedBudget.title}
            onChange={(e) => setEditedBudget(prev => ({ ...prev, title: e.target.value }))}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={editedBudget.categoryId}
              label="Catégorie"
              onChange={(e: SelectChangeEvent) => 
                setEditedBudget(prev => ({ ...prev, categoryId: e.target.value }))
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
              value={editedBudget.bankAccountId}
              label="Compte bancaire"
              onChange={(e: SelectChangeEvent) => 
                setEditedBudget(prev => ({ ...prev, bankAccountId: e.target.value }))
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
            value={editedBudget.amount}
            onChange={(e) => {
              const newAmount = Number(e.target.value);
              setEditedBudget(prev => ({
                ...prev,
                amount: newAmount,
                remaining: newAmount - prev.spent,
              }));
            }}
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
          onClick={handleSave}
          variant="contained"
          disabled={!editedBudget.title || !editedBudget.amount || !editedBudget.categoryId || !editedBudget.bankAccountId}
        >
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditBudgetDialog; 