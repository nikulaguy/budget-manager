import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Radio,
  FormControlLabel,
  RadioGroup,
  FormControl,
  FormLabel,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { BankAccount } from '../types/types';
import { addBankAccount, setDefaultBankAccount, resetData } from '../utils/storage';

interface BankAccountSettingsProps {
  bankAccounts: BankAccount[];
  onAccountsChange: () => void;
}

const BankAccountSettings: React.FC<BankAccountSettingsProps> = ({
  bankAccounts,
  onAccountsChange,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  const handleAddAccount = () => {
    if (newAccountName.trim()) {
      addBankAccount(newAccountName.trim());
      onAccountsChange();
      setNewAccountName('');
      setIsAddDialogOpen(false);
    }
  };

  const handleSetDefault = (accountId: string) => {
    setDefaultBankAccount(accountId);
    onAccountsChange();
  };

  const handleResetToDefaults = () => {
    resetData();
    onAccountsChange();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Paramètres des comptes
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comptes bancaires
        </Typography>

        <List>
          {bankAccounts.map((account) => (
            <ListItem
              key={account.id}
              secondaryAction={
                !account.isDefault && (
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                )
              }
            >
              <FormControlLabel
                control={
                  <Radio
                    checked={account.isDefault}
                    onChange={() => handleSetDefault(account.id)}
                  />
                }
                label={
                  <ListItemText
                    primary={account.name}
                    secondary={account.isDefault ? 'Compte par défaut' : ''}
                  />
                }
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setIsAddDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Ajouter un compte
          </Button>
          <Button onClick={handleResetToDefaults} variant="contained" color="warning">
            Réinitialiser les paramètres
          </Button>
        </Box>
      </Paper>

      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>Ajouter un compte bancaire</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom du compte"
            fullWidth
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleAddAccount} variant="contained">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankAccountSettings; 