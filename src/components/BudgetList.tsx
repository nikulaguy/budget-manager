import React, { useState, useMemo } from 'react';
import {
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
  TextField,
  Typography,
  Box,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  IconButton,
  TableSortLabel,
  useTheme,
  useMediaQuery,
  Alert,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { Budget, BankAccount, BudgetCategory, ActionType, Expense, MonthlyBudgetHistory } from '../types/types';
import { updateBudget, addBudget, addCategory, addExpense, deleteBudget, loadData, getReferenceBudgets, saveReferenceBudgets, resetBudgetExpenses, deleteExpense } from '../utils/storage';
import { formatUserName } from '../utils/format';
import ActionMenu from './ActionMenu';
import AddBudgetDialog from './AddBudgetDialog';
import EditBudgetDialog from './EditBudgetDialog';
import ExpenseDialog from './ExpenseDialog';
import ExpenseDetailsDialog from './ExpenseDetailsDialog';
import ConfirmDialog from './ConfirmDialog';
import { useTheme as useMuiTheme } from '@mui/material/styles';

interface BudgetListProps {
  budgets: Budget[];
  bankAccounts: BankAccount[];
  categories: BudgetCategory[];
  onDataChange: () => Promise<void>;
  currentPeriod: string;
}

type SortField = 'title' | 'amount' | 'spent' | 'remaining';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

interface NewExpenseForm {
  amount: string;
  description: string;
  budgetId: string;
  bankAccountId?: string;
  date: string;
}

interface NewBudgetForm {
  title: string;
  amount: string;
  categoryId: string;
  bankAccountId: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const formatMonthYear = (dateStr: string) => {
  const [year, month] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  return `${monthNames[date.getMonth()]} ${year.slice(2)}`;
};

const getBudgetColor = (spent: number, amount: number): string => {
  const percentUsed = (spent / amount) * 100;
  if (percentUsed >= 100) return 'error.main';
  if (percentUsed >= 80) return 'error.light';
  return 'inherit';
};

const BudgetList: React.FC<BudgetListProps> = ({
  budgets,
  bankAccounts,
  categories,
  onDataChange,
  currentPeriod,
}) => {
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newBudget, setNewBudget] = useState<NewBudgetForm>({
    title: '',
    amount: '',
    categoryId: '',
    bankAccountId: '',
  });
  const [newExpense, setNewExpense] = useState<NewExpenseForm>({
    amount: '',
    description: '',
    budgetId: '',
    bankAccountId: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'title',
    order: 'asc',
  });
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [currentExpenses, setCurrentExpenses] = useState<Expense[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBudgetForMenu, setSelectedBudgetForMenu] = useState<Budget | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isExpenseDetailsDialogOpen, setIsExpenseDetailsDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:700px)');

  const handleAction = (action: ActionType) => {
    switch (action) {
      case 'ADD_CATEGORY':
        setIsNewCategoryDialogOpen(true);
        break;
      case 'ADD_BUDGET':
        setIsAddDialogOpen(true);
        break;
      case 'ADD_EXPENSE':
        setIsAddExpenseDialogOpen(true);
        break;
    }
  };

  const handleEditClick = (budget: Budget) => {
    setEditingBudget(budget);
    setEditAmount(budget.amount.toString());
  };

  const handleSave = () => {
    if (editingBudget && !isNaN(Number(editAmount))) {
      const updatedBudget: Budget = {
        ...editingBudget,
        amount: Number(editAmount),
        remaining: Number(editAmount) - editingBudget.spent,
      };
      updateBudget(updatedBudget);
      onDataChange();
      setEditingBudget(null);
    }
  };

  const handleAdd = (categoryId: string) => {
    setNewBudget(prev => ({ ...prev, categoryId }));
    setIsAddDialogOpen(true);
  };

  const handleAddBudget = async () => {
    if (newBudget.amount && newBudget.categoryId) {
      const category = categories.find(c => c.id === newBudget.categoryId);
      const newBudgetData = {
        title: newBudget.title || category?.name || '',
        amount: Number(newBudget.amount),
        categoryId: newBudget.categoryId,
        bankAccountId: newBudget.bankAccountId || 'default',
      };

      try {
        // Ajouter aux budgets de référence
        const referenceBudgets = await getReferenceBudgets();
        const newReferenceBudget: Budget = {
          ...newBudgetData,
          id: crypto.randomUUID(),
          spent: 0,
          remaining: Number(newBudget.amount),
        };
        const updatedReferenceBudgets = [...referenceBudgets, newReferenceBudget];
        await saveReferenceBudgets(updatedReferenceBudgets);

        // Ajouter au budget courant
        await addBudget(newBudgetData);
        
        await onDataChange();
        setIsAddDialogOpen(false);
        setNewBudget({
          title: '',
          amount: '',
          categoryId: '',
          bankAccountId: '',
        });
      } catch (error) {
        console.error('Error adding budget:', error);
      }
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || newCategoryName.trim(),
      });
      onDataChange();
      setNewCategoryName('');
      setNewCategoryDescription('');
      setIsNewCategoryDialogOpen(false);
    }
  };

  const handleAddExpense = () => {
    if (newExpense.amount && newExpense.budgetId) {
      addExpense({
        amount: Number(newExpense.amount),
        description: newExpense.description,
        budgetId: newExpense.budgetId,
        bankAccountId: newExpense.bankAccountId || 'default',
        date: newExpense.date,
      });
      onDataChange();
      setIsAddExpenseDialogOpen(false);
      setNewExpense({
        amount: '',
        description: '',
        budgetId: '',
        bankAccountId: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleDeleteBudget = (budgetId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce budget ?')) {
      deleteBudget(budgetId);
      onDataChange();
    }
  };

  const handleResetToReference = async (budget: Budget) => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser ce budget ? Toutes les dépenses seront supprimées.')) {
      try {
        const referenceBudgets = await getReferenceBudgets();
        console.log('handleResetToReference - budget à réinitialiser:', budget);
        console.log('handleResetToReference - budgets de référence:', referenceBudgets);

        if (referenceBudgets.length === 0) {
          console.error('Aucun budget de référence trouvé');
          return;
        }

        // Recherche par titre uniquement, en ignorant la casse et les espaces
        const reference = referenceBudgets.find(ref => {
          const cleanTitle = (title: string) => title.trim().toLowerCase().replace(/\s+/g, ' ');
          const cleanedRef = cleanTitle(ref.title);
          const cleanedBudget = cleanTitle(budget.title);
          console.log('handleResetToReference - comparaison:', {
            reference: cleanedRef,
            budget: cleanedBudget,
            match: cleanedRef === cleanedBudget
          });
          return cleanedRef === cleanedBudget;
        });
        
        if (reference) {
          console.log('handleResetToReference - référence trouvée:', reference);
          const updatedBudget = {
            ...budget,
            amount: reference.amount,
            spent: 0,
            remaining: reference.amount,
          };
          console.log('handleResetToReference - budget mis à jour:', updatedBudget);
          await updateBudget(updatedBudget);
          await resetBudgetExpenses(budget.id);
          await onDataChange();
        } else {
          console.error(`Aucun budget de référence trouvé pour : ${budget.title}`);
        }
      } catch (error) {
        console.error('Error resetting budget:', error);
      }
    }
  };

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedBudgets = useMemo(() => {
    const sorted = [...budgets];
    sorted.sort((a, b) => {
      const multiplier = sortConfig.order === 'asc' ? 1 : -1;
      switch (sortConfig.field) {
        case 'title':
          return multiplier * a.title.localeCompare(b.title);
        case 'amount':
          return multiplier * (a.amount - b.amount);
        case 'spent':
          return multiplier * (a.spent - b.spent);
        case 'remaining':
          return multiplier * (a.remaining - b.remaining);
        default:
          return 0;
      }
    });
    return sorted;
  }, [budgets, sortConfig]);

  const budgetsByCategory = useMemo(() => {
    const grouped = new Map<string, Budget[]>();
    categories.forEach(category => {
      grouped.set(category.id, []);
    });
    
    sortedBudgets.forEach(budget => {
      const categoryBudgets = grouped.get(budget.categoryId) || [];
      categoryBudgets.push(budget);
      grouped.set(budget.categoryId, categoryBudgets);
    });
    
    return grouped;
  }, [sortedBudgets, categories]);

  // Calculer les totaux en excluant la catégorie Livret
  const totals = useMemo(() => {
    const nonLivretBudgets = budgets.filter(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      return category?.name !== 'Livret';
    });

    return {
      total: nonLivretBudgets.reduce((sum, budget) => sum + budget.amount, 0),
      spent: nonLivretBudgets.reduce((sum, budget) => sum + budget.spent, 0),
      remaining: nonLivretBudgets.reduce((sum, budget) => sum + budget.remaining, 0),
    };
  }, [budgets, categories]);

  const getBudgetProgress = (budget: Budget) => {
    return budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  };

  const totalProgress = totals.total > 0 ? (totals.spent / totals.total) * 100 : 0;

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'error';
    if (progress >= 80) return 'warning';
    return 'primary';
  };

  const getCategoryName = (categoryId: string) => {
    if (!categories) return '';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Général';
  };

  const renderSortLabel = (field: SortField, label: string) => (
    <TableCell align={field === 'title' ? 'left' : 'right'}>
      <TableSortLabel
        active={sortConfig.field === field}
        direction={sortConfig.field === field ? sortConfig.order : 'asc'}
        onClick={() => handleSort(field)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );

  const handleViewExpenses = async (budget: Budget) => {
    try {
      const data = await loadData();
      // Récupérer les dépenses du mois en cours
      const monthExpenses = data.history
        .find((h: MonthlyBudgetHistory) => h.period === currentPeriod)
        ?.expenses.filter((e: Expense) => e.budgetId === budget.id) || [];

      setCurrentExpenses(monthExpenses);
      setSelectedBudget(budget);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, budget: Budget) => {
    setAnchorEl(event.currentTarget);
    setSelectedBudgetForMenu(budget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBudgetForMenu(null);
  };

  const handleAddExpenseDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsExpenseDialogOpen(true);
    handleMenuClose();
  };

  const handleShowExpenseDetails = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsExpenseDetailsDialogOpen(true);
    handleMenuClose();
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsEditDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsConfirmDeleteOpen(true);
    handleMenuClose();
  };

  const handleConfirmReset = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsConfirmResetOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedBudget) {
      await deleteBudget(selectedBudget.id);
      await onDataChange();
      setIsConfirmDeleteOpen(false);
      setSelectedBudget(null);
    }
  };

  const handleReset = async () => {
    if (selectedBudget) {
      await resetBudgetExpenses(selectedBudget.id);
      await onDataChange();
      setIsConfirmResetOpen(false);
      setSelectedBudget(null);
    }
  };

  const renderBudgetRow = (budget: Budget) => {
    return (
      <TableRow
        key={budget.id}
        sx={{
          '&:last-child td, &:last-child th': { border: 0 },
          color: getBudgetColor(budget.spent, budget.amount),
        }}
      >
        <TableCell 
          component="th" 
          scope="row"
          sx={{ 
            color: getBudgetColor(budget.spent, budget.amount),
            fontWeight: budget.spent / budget.amount >= 0.8 ? 'bold' : 'normal',
            width: isMobile ? '35%' : '30%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: isMobile ? '130px' : 'none',
          }}
        >
          {budget.title}
        </TableCell>
        <TableCell 
          align="right"
          sx={{ 
            color: getBudgetColor(budget.spent, budget.amount),
            width: isMobile ? '25%' : '20%',
            whiteSpace: 'nowrap',
          }}
        >
          {formatCurrency(budget.amount)}
        </TableCell>
        {!isMobile && (
          <TableCell 
            align="right"
            sx={{ 
              color: getBudgetColor(budget.spent, budget.amount),
              width: '20%',
            }}
          >
            {formatCurrency(budget.spent)}
          </TableCell>
        )}
        <TableCell 
          align="right"
          sx={{ 
            color: getBudgetColor(budget.spent, budget.amount),
            width: isMobile ? '25%' : '20%',
            whiteSpace: 'nowrap',
          }}
        >
          {formatCurrency(budget.remaining)}
        </TableCell>
        {!isMobile && (
          <TableCell sx={{ width: '20%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flex: 1, mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(getBudgetProgress(budget), 100)}
                  color={getProgressColor(getBudgetProgress(budget))}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                  }}
                />
              </Box>
              <Box sx={{ minWidth: 45 }}>
                <Typography variant="body2" color="inherit">
                  {`${getBudgetProgress(budget).toFixed(1)}%`}
                </Typography>
              </Box>
            </Box>
          </TableCell>
        )}
        <TableCell 
          align="right" 
          sx={{ 
            width: isMobile ? '15%' : '10%',
            pr: isMobile ? 1 : 2,
          }}
        >
          {isMobile ? (
            <IconButton
              size="small"
              onClick={(event) => {
                handleMenuOpen(event, budget);
              }}
            >
              <MoreVertIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <IconButton
                size="small"
                onClick={() => handleAddExpenseDialog(budget)}
                title="Ajouter une dépense"
              >
                <AddIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleShowExpenseDetails(budget)}
                title="Voir les dépenses"
              >
                <HistoryIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleResetToReference(budget)}
                title="Réinitialiser à la valeur de référence"
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Box sx={{ mb: 8 }}>
      <Box sx={{ mb: isMobile ? 2 : 4 }}>
        <Typography variant="h4" gutterBottom>
          Vue d'ensemble
        </Typography>
        <Box sx={{ display: 'flex', gap: isMobile ? 1 : 4, flexWrap: 'wrap' }}>
          <Paper sx={{ p: isMobile ? 1.5 : 2, flex: 1, minWidth: isMobile ? 'auto' : 200 }}>
            <Typography variant="h6">Budget Total (hors épargne)</Typography>
            <Typography variant="h4">{formatCurrency(totals.total)}</Typography>
          </Paper>
          <Paper sx={{ p: isMobile ? 1.5 : 2, flex: 1, minWidth: isMobile ? 'auto' : 200 }}>
            <Typography variant="h6">Dépensé</Typography>
            <Typography variant="h4" color={getBudgetColor(totals.spent, totals.total)}>
              {formatCurrency(totals.spent)}
            </Typography>
          </Paper>
          <Paper sx={{ p: isMobile ? 1.5 : 2, flex: 1, minWidth: isMobile ? 'auto' : 200 }}>
            <Typography variant="h6">Reste</Typography>
            <Typography variant="h4" color={getBudgetColor(totals.spent, totals.total)}>
              {formatCurrency(totals.remaining)}
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(totalProgress, 100)}
            color={getProgressColor(totalProgress)}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
      </Box>

      <Typography variant="h6" sx={{ mb: isMobile ? 1 : 2 }}>
        Budget du mois : {formatMonthYear(currentPeriod)}
      </Typography>

      {categories.map(category => {
        const categoryBudgets = budgets.filter(b => b.categoryId === category.id);
        if (categoryBudgets.length === 0) return null;

        return (
          <Box key={category.id} sx={{ mb: isMobile ? 2 : 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {category.name}
              </Typography>
            </Box>

            <TableContainer 
              component={Paper} 
              elevation={0} 
              sx={{ 
                border: '1px solid', 
                borderColor: 'divider',
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  padding: isMobile ? '8px 4px' : '16px',
                },
                maxWidth: '100%',
                overflowX: 'hidden',
              }}
            >
              <Table size={isMobile ? "small" : "medium"} sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    {renderSortLabel('title', 'Budget')}
                    {renderSortLabel('amount', 'Montant')}
                    {!isMobile && renderSortLabel('spent', 'Dépensé')}
                    {renderSortLabel('remaining', 'Reste')}
                    {!isMobile && <TableCell>Progression</TableCell>}
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryBudgets.map(budget => (
                    <TableRow
                      key={budget.id}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        color: getBudgetColor(budget.spent, budget.amount),
                      }}
                    >
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ 
                          color: getBudgetColor(budget.spent, budget.amount),
                          fontWeight: budget.spent / budget.amount >= 0.8 ? 'bold' : 'normal',
                          width: isMobile ? '35%' : '30%',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: isMobile ? '130px' : 'none',
                        }}
                      >
                        {budget.title}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          color: getBudgetColor(budget.spent, budget.amount),
                          width: isMobile ? '25%' : '20%',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatCurrency(budget.amount)}
                      </TableCell>
                      {!isMobile && (
                        <TableCell 
                          align="right"
                          sx={{ 
                            color: getBudgetColor(budget.spent, budget.amount),
                            width: '20%',
                          }}
                        >
                          {formatCurrency(budget.spent)}
                        </TableCell>
                      )}
                      <TableCell 
                        align="right"
                        sx={{ 
                          color: getBudgetColor(budget.spent, budget.amount),
                          width: isMobile ? '25%' : '20%',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatCurrency(budget.remaining)}
                      </TableCell>
                      {!isMobile && (
                        <TableCell sx={{ width: '20%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ flex: 1, mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(getBudgetProgress(budget), 100)}
                                color={getProgressColor(getBudgetProgress(budget))}
                                sx={{
                                  height: 10,
                                  borderRadius: 5,
                                }}
                              />
                            </Box>
                            <Box sx={{ minWidth: 45 }}>
                              <Typography variant="body2" color="inherit">
                                {`${getBudgetProgress(budget).toFixed(1)}%`}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      )}
                      <TableCell 
                        align="right" 
                        sx={{ 
                          width: isMobile ? '15%' : '10%',
                          pr: isMobile ? 1 : 2,
                        }}
                      >
                        {isMobile ? (
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              handleMenuOpen(event, budget);
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleAddExpenseDialog(budget)}
                              title="Ajouter une dépense"
                            >
                              <AddIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleShowExpenseDetails(budget)}
                              title="Voir les dépenses"
                            >
                              <HistoryIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleResetToReference(budget)}
                              title="Réinitialiser à la valeur de référence"
                              color="primary"
                            >
                              <RefreshIcon />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}

      <ActionMenu onAction={handleAction} />

      {/* Dialog de modification */}
      <Dialog open={!!editingBudget} onClose={() => setEditingBudget(null)}>
        <DialogTitle>Modifier le budget</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={editingBudget?.categoryId || ''}
                label="Catégorie"
                onChange={(e: SelectChangeEvent) => {
                  if (editingBudget) {
                    setEditingBudget({
                      ...editingBudget,
                      categoryId: e.target.value,
                    });
                  }
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setIsNewCategoryDialogOpen(true)}
              >
                Nouvelle catégorie
              </Button>
            </Box>
            <TextField
              margin="dense"
              label="Montant"
              type="number"
              fullWidth
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              InputProps={{
                endAdornment: <Typography>€</Typography>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingBudget(null)}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'ajout de budget */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>Ajouter un nouveau budget</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={newBudget.categoryId}
                label="Catégorie"
                onChange={(e: SelectChangeEvent) => 
                  setNewBudget(prev => ({ ...prev, categoryId: e.target.value }))
                }
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setIsNewCategoryDialogOpen(true)}
              >
                Nouvelle catégorie
              </Button>
            </Box>
            <TextField
              margin="normal"
              label="Titre personnalisé (optionnel)"
              fullWidth
              value={newBudget.title}
              onChange={(e) => setNewBudget(prev => ({ ...prev, title: e.target.value }))}
            />
            <TextField
              margin="normal"
              label="Montant"
              type="number"
              fullWidth
              required
              value={newBudget.amount}
              onChange={(e) => setNewBudget(prev => ({ ...prev, amount: e.target.value }))}
              InputProps={{
                endAdornment: <Typography>€</Typography>,
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Compte bancaire (optionnel)</InputLabel>
              <Select
                value={newBudget.bankAccountId}
                label="Compte bancaire (optionnel)"
                onChange={(e: SelectChangeEvent) => 
                  setNewBudget(prev => ({ ...prev, bankAccountId: e.target.value }))
                }
              >
                <MenuItem value="">
                  <em>Aucun</em>
                </MenuItem>
                {bankAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} {account.isDefault ? '(Par défaut)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
          <Button 
            onClick={handleAddBudget}
            variant="contained"
            disabled={!newBudget.amount || !newBudget.categoryId}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'ajout de catégorie */}
      <Dialog open={isNewCategoryDialogOpen} onClose={() => setIsNewCategoryDialogOpen(false)}>
        <DialogTitle>Nouvelle catégorie</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Nom de la catégorie"
              fullWidth
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewCategoryDialogOpen(false)}>Annuler</Button>
          <Button 
            onClick={handleAddCategory}
            variant="contained"
            disabled={!newCategoryName.trim()}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'ajout de dépense */}
      <Dialog open={isAddExpenseDialogOpen} onClose={() => setIsAddExpenseDialogOpen(false)}>
        <DialogTitle>Nouvelle dépense</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Budget</InputLabel>
              <Select
                value={newExpense.budgetId}
                label="Budget"
                onChange={(e: SelectChangeEvent) => 
                  setNewExpense(prev => ({ ...prev, budgetId: e.target.value }))
                }
                required
              >
                {budgets
                  .filter(budget => {
                    // Si un budget est déjà sélectionné, ne montrer que les budgets de la même catégorie
                    const selectedBudget = budgets.find(b => b.id === newExpense.budgetId);
                    return !selectedBudget || budget.categoryId === selectedBudget.categoryId;
                  })
                  .map((budget) => (
                    <MenuItem key={budget.id} value={budget.id}>
                      {budget.title} ({getCategoryName(budget.categoryId)})
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              label="Montant"
              type="number"
              fullWidth
              required
              value={newExpense.amount}
              onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
              InputProps={{
                endAdornment: <Typography>€</Typography>,
              }}
            />
            <TextField
              margin="normal"
              label="Description"
              fullWidth
              value={newExpense.description}
              onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
            />
            <TextField
              margin="normal"
              label="Date"
              type="date"
              fullWidth
              value={newExpense.date}
              onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Compte bancaire (optionnel)</InputLabel>
              <Select
                value={newExpense.bankAccountId || ''}
                label="Compte bancaire (optionnel)"
                onChange={(e: SelectChangeEvent) => 
                  setNewExpense(prev => ({ ...prev, bankAccountId: e.target.value }))
                }
              >
                <MenuItem value="">
                  <em>Aucun</em>
                </MenuItem>
                {bankAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} {account.isDefault ? '(Par défaut)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddExpenseDialogOpen(false)}>Annuler</Button>
          <Button 
            onClick={handleAddExpense}
            variant="contained"
            disabled={!newExpense.amount || !newExpense.budgetId}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de détail des dépenses */}
      {selectedBudget && (
        <ExpenseDetailsDialog
          budget={selectedBudget}
          open={!!selectedBudget}
          onClose={() => setSelectedBudget(null)}
          expenses={currentExpenses}
          currentPeriod={currentPeriod}
          onDataChange={onDataChange}
          onExpenseDelete={() => {
            handleViewExpenses(selectedBudget);
          }}
        />
      )}

      {/* Menu contextuel pour mobile */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => {
          if (selectedBudgetForMenu) {
            setNewExpense({
              amount: '',
              description: '',
              budgetId: selectedBudgetForMenu.id,
              bankAccountId: '',
              date: new Date().toISOString().split('T')[0],
            });
            setIsAddExpenseDialogOpen(true);
            handleMenuClose();
            setSelectedBudgetForMenu(null);
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon fontSize="small" />
            <Typography>Ajouter une dépense</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedBudgetForMenu) {
            handleShowExpenseDetails(selectedBudgetForMenu);
            handleMenuClose();
            setSelectedBudgetForMenu(null);
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon fontSize="small" />
            <Typography>Voir les dépenses</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedBudgetForMenu) {
            handleResetToReference(selectedBudgetForMenu);
            handleMenuClose();
            setSelectedBudgetForMenu(null);
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RefreshIcon fontSize="small" />
            <Typography>Réinitialiser à la référence</Typography>
          </Box>
        </MenuItem>
      </Menu>

      <AddBudgetDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        bankAccounts={bankAccounts}
        categories={categories}
        onDataChange={onDataChange}
      />

      {selectedBudget && (
        <>
          <EditBudgetDialog
            open={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setSelectedBudget(null);
            }}
            budget={selectedBudget}
            bankAccounts={bankAccounts}
            categories={categories}
            onDataChange={onDataChange}
          />

          <ExpenseDialog
            open={isExpenseDialogOpen}
            onClose={() => {
              setIsExpenseDialogOpen(false);
              setSelectedBudget(null);
            }}
            budget={selectedBudget}
            onDataChange={onDataChange}
          />

          <ExpenseDetailsDialog
            budget={selectedBudget}
            open={isExpenseDetailsDialogOpen}
            onClose={() => {
              setIsExpenseDetailsDialogOpen(false);
              setSelectedBudget(null);
            }}
            expenses={currentExpenses}
            currentPeriod={currentPeriod}
            onDataChange={onDataChange}
            onExpenseDelete={() => {
              handleViewExpenses(selectedBudget);
            }}
          />

          <ConfirmDialog
            open={isConfirmDeleteOpen}
            onClose={() => setIsConfirmDeleteOpen(false)}
            onConfirm={handleDelete}
            title="Supprimer le budget"
            content="Êtes-vous sûr de vouloir supprimer ce budget ? Cette action est irréversible."
          />

          <ConfirmDialog
            open={isConfirmResetOpen}
            onClose={() => setIsConfirmResetOpen(false)}
            onConfirm={handleReset}
            title="Réinitialiser les dépenses"
            content="Êtes-vous sûr de vouloir réinitialiser toutes les dépenses de ce budget ? Cette action est irréversible."
          />
        </>
      )}
    </Box>
  );
};

export default BudgetList; 