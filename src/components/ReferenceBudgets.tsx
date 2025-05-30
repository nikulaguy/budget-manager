import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getReferenceBudgets, saveReferenceBudgets } from '../utils/storage';
import { Budget, BudgetCategory } from '../types/types';

interface ReferenceBudgetsProps {
  categories: BudgetCategory[];
  onDataChange: () => Promise<void>;
}

const ReferenceBudgets: React.FC<ReferenceBudgetsProps> = ({
  categories,
  onDataChange,
}) => {
  const [referenceBudgets, setReferenceBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newBudget, setNewBudget] = useState<Omit<Budget, 'id' | 'spent' | 'remaining'>>({
    title: '',
    amount: 0,
    categoryId: '',
  });

  useEffect(() => {
    loadReferenceBudgets();
  }, []);

  const loadReferenceBudgets = async () => {
    try {
      const budgets = await getReferenceBudgets();
      setReferenceBudgets(budgets);
    } catch (error) {
      console.error('Error loading reference budgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBudget = async () => {
    if (!newBudget.title || !newBudget.amount || !newBudget.categoryId) return;

    const budget: Budget = {
      ...newBudget,
      id: crypto.randomUUID(),
      spent: 0,
      remaining: newBudget.amount,
    };

    const updatedBudgets = [...referenceBudgets, budget];
    try {
      await saveReferenceBudgets(updatedBudgets);
      setReferenceBudgets(updatedBudgets);
      setIsDialogOpen(false);
      setNewBudget({
        title: '',
        amount: 0,
        categoryId: '',
      });
      await onDataChange();
    } catch (error) {
      console.error('Error saving reference budget:', error);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    const updatedBudgets = referenceBudgets.filter(b => b.id !== budgetId);
    try {
      await saveReferenceBudgets(updatedBudgets);
      setReferenceBudgets(updatedBudgets);
      await onDataChange();
    } catch (error) {
      console.error('Error deleting reference budget:', error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Budgets de référence
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Ces budgets servent de base lors de la réinitialisation mensuelle.
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Ajouter un budget de référence
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell align="right">Montant</TableCell>
              <TableCell align="right" sx={{ width: 120 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {referenceBudgets.map((budget) => (
              <TableRow key={budget.id}>
                <TableCell>{budget.title}</TableCell>
                <TableCell>
                  {categories.find(c => c.id === budget.categoryId)?.name || 'Catégorie inconnue'}
                </TableCell>
                <TableCell align="right">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(budget.amount)}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteBudget(budget.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Ajouter un budget de référence</DialogTitle>
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
          <Button onClick={() => setIsDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={handleAddBudget}
            variant="contained"
            disabled={!newBudget.title || !newBudget.amount || !newBudget.categoryId}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReferenceBudgets; 