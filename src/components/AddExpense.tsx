import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Budget, BankAccount, Expense } from '../types/types';
import { addExpense } from '../utils/storage';

interface AddExpenseProps {
  budgets: Budget[];
  bankAccounts: BankAccount[];
  onExpenseAdded: () => void;
}

const AddExpense: React.FC<AddExpenseProps> = ({
  budgets,
  bankAccounts,
  onExpenseAdded,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>(
    bankAccounts.find(account => account.isDefault)?.id || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !selectedBudget || !selectedAccount) {
      return;
    }

    const newExpense: Omit<Expense, 'id'> = {
      amount: Number(amount),
      description,
      date: new Date().toISOString(),
      budgetId: selectedBudget,
      bankAccountId: selectedAccount,
    };

    addExpense(newExpense);
    onExpenseAdded();

    // Reset form
    setAmount('');
    setDescription('');
    setSelectedBudget('');
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Ajouter une dépense
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Montant"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          InputProps={{
            endAdornment: <Typography>€</Typography>,
          }}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          multiline
          rows={2}
        />
        <FormControl required>
          <InputLabel>Catégorie de budget</InputLabel>
          <Select
            value={selectedBudget}
            label="Catégorie de budget"
            onChange={(e: SelectChangeEvent) => setSelectedBudget(e.target.value)}
          >
            {budgets.map((budget) => (
              <MenuItem key={budget.id} value={budget.id}>
                {budget.title} (Reste: {budget.remaining.toFixed(2)} €)
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl required>
          <InputLabel>Compte bancaire</InputLabel>
          <Select
            value={selectedAccount}
            label="Compte bancaire"
            onChange={(e: SelectChangeEvent) => setSelectedAccount(e.target.value)}
          >
            {bankAccounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.name} {account.isDefault ? '(Par défaut)' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={!amount || !description || !selectedBudget || !selectedAccount}
        >
          Ajouter la dépense
        </Button>
      </Box>
    </Paper>
  );
};

export default AddExpense; 