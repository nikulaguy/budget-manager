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
  MenuItem,
  useTheme,
  useMediaQuery,
  Menu
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  ExpandMore,
  Euro,
  MoreVert
} from '@mui/icons-material'
import { toastWithClose } from '../utils/toast'

import { defaultReferenceBudgets, defaultCategories, calculateTotalsByCategory } from '../data/referenceBudgets'

const ReferenceBudgetsPage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null)
  const [referenceBudgets, setReferenceBudgets] = useState(defaultReferenceBudgets)
  const [newBudget, setNewBudget] = useState<{ name: string; amount: string; category: string }>({ 
    name: '', 
    amount: '', 
    category: 'Courant' 
  })
  const [editBudget, setEditBudget] = useState<{ name: string; amount: string; category: string }>({ 
    name: '', 
    amount: '', 
    category: 'Courant' 
  })
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // Grouper les budgets par catégorie
  const budgetsByCategory = referenceBudgets.reduce((acc, budget) => {
    if (!acc[budget.category]) {
      acc[budget.category] = []
    }
    acc[budget.category].push(budget)
    return acc
  }, {} as Record<string, typeof referenceBudgets>)

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

  const handleEditBudget = (budgetName: string, fromMenu: boolean = false) => {
    const budget = referenceBudgets.find(b => b.name === budgetName)
    if (budget) {
      setEditBudget({
        name: budget.name,
        amount: budget.value.toString(),
        category: budget.category
      })
      setSelectedBudget(budgetName)
      setShowEditDialog(true)
      if (fromMenu) handleCloseMenu()
    }
  }

  const handleDeleteBudget = (budgetName: string, fromMenu: boolean = false) => {
    setSelectedBudget(budgetName)
    setShowDeleteDialog(true)
    if (fromMenu) handleCloseMenu()
  }

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, budgetName: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedBudget(budgetName)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedBudget(null)
  }

  const confirmDeleteBudget = () => {
    if (selectedBudget) {
      setReferenceBudgets(referenceBudgets.filter(b => b.name !== selectedBudget))
      toastWithClose.success(`Budget "${selectedBudget}" supprimé`)
      setShowDeleteDialog(false)
      setSelectedBudget(null)
    }
  }

  const handleSubmitNewBudget = () => {
    if (!newBudget.name || !newBudget.amount || !newBudget.category) {
      toastWithClose.error('Veuillez remplir tous les champs')
      return
    }

    if (referenceBudgets.some(b => b.name === newBudget.name)) {
      toastWithClose.error('Un budget avec ce nom existe déjà')
      return
    }

    const budget = {
      name: newBudget.name,
      value: parseFloat(newBudget.amount),
      category: newBudget.category as "Courant" | "Mensuel" | "Annuel" | "Épargne",
      isDefault: false
    }

    setReferenceBudgets([...referenceBudgets, budget])
    setNewBudget({ name: '', amount: '', category: 'Courant' })
    setShowAddDialog(false)
    toastWithClose.success('Budget de référence ajouté')
  }

  const handleSubmitEditBudget = () => {
    if (!editBudget.name || !editBudget.amount || !editBudget.category) {
      toastWithClose.error('Veuillez remplir tous les champs')
      return
    }

    // Vérifier si le nom est déjà utilisé par un autre budget
    if (editBudget.name !== selectedBudget && referenceBudgets.some(b => b.name === editBudget.name)) {
      toastWithClose.error('Un budget avec ce nom existe déjà')
      return
    }

    setReferenceBudgets(prev => 
      prev.map(budget => 
        budget.name === selectedBudget
          ? {
              ...budget,
              name: editBudget.name,
              value: parseFloat(editBudget.amount),
              category: editBudget.category as "Courant" | "Mensuel" | "Annuel" | "Épargne"
            }
          : budget
      )
    )

    toastWithClose.success(`Budget "${selectedBudget}" modifié`)
    setShowEditDialog(false)
    setSelectedBudget(null)
    setEditBudget({ name: '', amount: '', category: 'Courant' })
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
          <Typography 
            variant="body1" 
            color="textSecondary"
            sx={{ fontSize: isMobile ? '0.9rem' : undefined }}
          >
            Gérez vos modèles de budgets pour chaque catégorie de dépenses
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddBudget}
          aria-label="Ajouter un nouveau budget de référence"
          size={isMobile ? "small" : "medium"}
        >
          {isMobile ? "Nouveau" : "Nouveau budget"}
        </Button>
      </Box>

      {/* Résumé par catégorie */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: isMobile ? '1rem' : undefined }}
          >
            Résumé par catégorie
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {Object.entries(totals).map(([category, total]) => (
              <Chip
                key={category}
                label={`${category}: ${formatCurrency(total)}`}
                color={getCategoryColor(category) as any}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                icon={<Euro />}
                sx={{ 
                  fontSize: isMobile ? '0.8rem' : undefined,
                  '& .MuiChip-label': {
                    fontSize: isMobile ? '0.8rem' : undefined
                  }
                }}
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
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      flexGrow: 1,
                      fontSize: isMobile ? '1rem' : undefined
                    }}
                  >
                    {category.name}
                  </Typography>
                  <Chip
                    label={`${categoryBudgets.length} budget${categoryBudgets.length > 1 ? 's' : ''}`}
                    size="small"
                    color={getCategoryColor(category.name) as any}
                  />
                  <Typography 
                    variant="body2" 
                    color="textSecondary"
                    sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
                  >
                    Total: {formatCurrency(categoryTotal)}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {categoryBudgets.length > 0 ? (
                  !isMobile ? (
                    /* Affichage desktop en tableau */
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ width: '40%' }}>Nom du budget</TableCell>
                            <TableCell align="right" sx={{ width: '20%' }}>Montant</TableCell>
                            <TableCell align="center" sx={{ width: '20%' }}>Type</TableCell>
                            <TableCell align="center" sx={{ width: '20%' }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {categoryBudgets.map((budget, index) => (
                            <TableRow key={`${budget.name}-${index}`} hover>
                              <TableCell sx={{ width: '40%' }}>
                                <Typography variant="body2" fontWeight="medium">
                                  {budget.name}
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ width: '20%' }}>
                                <Typography variant="body2" fontWeight="medium">
                                  {formatCurrency(budget.value)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ width: '20%' }}>
                                <Chip
                                  label={budget.isDefault ? 'Par défaut' : 'Personnalisé'}
                                  size="small"
                                  color={budget.isDefault ? 'default' : 'primary'}
                                  variant={budget.isDefault ? 'outlined' : 'filled'}
                                />
                              </TableCell>
                              <TableCell align="center" sx={{ width: '20%' }}>
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
                    /* Affichage mobile en cartes */
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {categoryBudgets.map((budget, index) => (
                        <Paper key={`${budget.name}-${index}`} sx={{ p: 2 }} elevation={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                variant="body1" 
                                fontWeight="medium"
                                sx={{ 
                                  fontSize: '1rem',
                                  lineHeight: 1.3,
                                  mb: 0.5,
                                  wordBreak: 'break-word'
                                }}
                              >
                                {budget.name}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="textSecondary"
                                sx={{ fontSize: '0.875rem' }}
                              >
                                Montant: {formatCurrency(budget.value)}
                              </Typography>
                            </Box>
                            <IconButton
                              size="medium"
                              onClick={(event) => handleOpenMenu(event, budget.name)}
                              aria-label={`Actions pour ${budget.name}`}
                              sx={{ ml: 1 }}
                            >
                              <MoreVert />
                            </IconButton>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip
                              label={budget.isDefault ? 'Par défaut' : 'Personnalisé'}
                              size="medium"
                              color={budget.isDefault ? 'default' : 'primary'}
                              variant={budget.isDefault ? 'outlined' : 'filled'}
                              sx={{ fontSize: '0.875rem' }}
                            />
                            <Typography
                              variant="h6"
                              color="primary"
                              sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}
                            >
                              {formatCurrency(budget.value)}
                            </Typography>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography 
                      variant="body2" 
                      color="textSecondary"
                      sx={{ fontSize: isMobile ? '0.9rem' : undefined }}
                    >
                      Aucun budget dans cette catégorie
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={handleAddBudget}
                      sx={{ mt: 2 }}
                      size={isMobile ? "small" : "medium"}
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
              value={newBudget.name}
              onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
              fullWidth
              placeholder="Ex: Courses alimentaires"
              aria-label="Nom du budget de référence"
            />
            <TextField
              label="Montant (€)"
              type="number"
              value={newBudget.amount}
              onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
              fullWidth
              placeholder="100"
              inputProps={{ min: 0, step: 0.01 }}
              aria-label="Montant du budget en euros"
            />
            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select
                label="Catégorie"
                value={newBudget.category}
                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
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
            onClick={handleSubmitNewBudget}
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

      {/* Dialog d'édition de budget */}
      <Dialog 
        open={showEditDialog} 
        onClose={() => setShowEditDialog(false)}
        aria-labelledby="edit-budget-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="edit-budget-dialog-title">
          Modifier le budget de référence
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nom du budget"
              value={editBudget.name}
              onChange={(e) => setEditBudget({ ...editBudget, name: e.target.value })}
              fullWidth
              placeholder="Ex: Courses alimentaires"
              aria-label="Nom du budget de référence"
            />
            <TextField
              label="Montant (€)"
              type="number"
              value={editBudget.amount}
              onChange={(e) => setEditBudget({ ...editBudget, amount: e.target.value })}
              fullWidth
              placeholder="100"
              inputProps={{ min: 0, step: 0.01 }}
              aria-label="Montant du budget en euros"
            />
            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select
                label="Catégorie"
                value={editBudget.category}
                onChange={(e) => setEditBudget({ ...editBudget, category: e.target.value })}
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
          <Button onClick={() => setShowEditDialog(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmitEditBudget}
          >
            Modifier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => selectedBudget && handleEditBudget(selectedBudget, true)}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Éditer
        </MenuItem>
        {/* Afficher supprimer seulement si ce n'est pas un budget par défaut */}
        {selectedBudget && !referenceBudgets.find(b => b.name === selectedBudget)?.isDefault && (
          <MenuItem onClick={() => selectedBudget && handleDeleteBudget(selectedBudget, true)}>
            <Delete sx={{ mr: 1 }} fontSize="small" />
            Supprimer
          </MenuItem>
        )}
      </Menu>
    </Box>
  )
}

export default ReferenceBudgetsPage 