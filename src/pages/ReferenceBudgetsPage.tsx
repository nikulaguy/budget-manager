import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  ExpandMore,
  Euro
} from '@mui/icons-material'
import { toast } from 'react-hot-toast'

import { defaultReferenceBudgets, defaultCategories, calculateTotalsByCategory } from '../data/referenceBudgets'

const ReferenceBudgetsPage: React.FC = () => {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null)

  // Grouper les budgets par catégorie
  const budgetsByCategory = defaultReferenceBudgets.reduce((acc, budget) => {
    if (!acc[budget.category]) {
      acc[budget.category] = []
    }
    acc[budget.category].push(budget)
    return acc
  }, {} as Record<string, typeof defaultReferenceBudgets>)

  const totals = calculateTotalsByCategory()

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Courant': return 'primary'
      case 'Mensuel': return 'secondary'
      case 'Annuel': return 'warning'
      case 'Épargne': return 'success'
      default: return 'default'
    }
  }

  const handleAddBudget = () => {
    setShowAddDialog(true)
  }

  const handleEditBudget = (budgetName: string) => {
    toast(`Édition du budget: ${budgetName}`, { icon: '✏️' })
  }

  const handleDeleteBudget = (budgetName: string) => {
    setSelectedBudget(budgetName)
    setShowDeleteDialog(true)
  }

  const confirmDeleteBudget = () => {
    if (selectedBudget) {
      toast.success(`Budget "${selectedBudget}" supprimé`)
      setShowDeleteDialog(false)
      setSelectedBudget(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Budgets de référence
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gérez vos modèles de budgets pour chaque catégorie de dépenses
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddBudget}
          aria-label="Ajouter un nouveau budget de référence"
        >
          Nouveau budget
        </Button>
      </Box>

      {/* Résumé par catégorie */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Résumé par catégorie
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {Object.entries(totals).map(([category, total]) => (
              <Chip
                key={category}
                label={`${category}: ${formatCurrency(total)}`}
                color={getCategoryColor(category) as any}
                variant="outlined"
                size="medium"
                icon={<Euro />}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Budgets par catégorie */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {defaultCategories.map((category) => {
          const categoryBudgets = budgetsByCategory[category.name] || []
          const categoryTotal = totals[category.name as keyof typeof totals] || 0

          return (
            <Accordion key={category.name} defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls={`${category.name}-content`}
                id={`${category.name}-header`}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {category.name}
                  </Typography>
                  <Chip
                    label={`${categoryBudgets.length} budget${categoryBudgets.length > 1 ? 's' : ''}`}
                    size="small"
                    color={getCategoryColor(category.name) as any}
                  />
                  <Typography variant="body2" color="textSecondary">
                    Total: {formatCurrency(categoryTotal)}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {categoryBudgets.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nom du budget</TableCell>
                          <TableCell align="right">Montant</TableCell>
                          <TableCell align="center">Type</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categoryBudgets.map((budget, index) => (
                          <TableRow key={`${budget.name}-${index}`} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {budget.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium">
                                {formatCurrency(budget.value)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={budget.isDefault ? 'Par défaut' : 'Personnalisé'}
                                size="small"
                                color={budget.isDefault ? 'default' : 'primary'}
                                variant={budget.isDefault ? 'outlined' : 'filled'}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditBudget(budget.name)}
                                  aria-label={`Éditer ${budget.name}`}
                                  color="primary"
                                >
                                  <Edit />
                                </IconButton>
                                {!budget.isDefault && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteBudget(budget.name)}
                                    aria-label={`Supprimer ${budget.name}`}
                                    color="error"
                                  >
                                    <Delete />
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Aucun budget dans cette catégorie
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={handleAddBudget}
                      sx={{ mt: 2 }}
                    >
                      Ajouter un budget
                    </Button>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          )
        })}
      </Box>

      {/* Dialog d'ajout de budget */}
      <Dialog 
        open={showAddDialog} 
        onClose={() => setShowAddDialog(false)}
        aria-labelledby="add-budget-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="add-budget-dialog-title">
          Ajouter un budget de référence
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nom du budget"
              fullWidth
              placeholder="Ex: Courses alimentaires"
              aria-label="Nom du budget de référence"
            />
            <TextField
              label="Montant (€)"
              type="number"
              fullWidth
              placeholder="100"
              inputProps={{ min: 0, step: 0.01 }}
              aria-label="Montant du budget en euros"
            />
            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select
                label="Catégorie"
                defaultValue=""
                aria-label="Sélectionner une catégorie"
              >
                {defaultCategories.map((category) => (
                  <MenuItem key={category.name} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              toast.success('Budget de référence ajouté')
              setShowAddDialog(false)
            }}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        aria-labelledby="delete-budget-dialog-title"
      >
        <DialogTitle id="delete-budget-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le budget "{selectedBudget}" ?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Annuler
          </Button>
          <Button
            onClick={confirmDeleteBudget}
            color="error"
            variant="contained"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ReferenceBudgetsPage 