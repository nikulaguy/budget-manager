import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  Search,
  FilterList,
  Download,
  Visibility,
  NavigateBefore,
  NavigateNext
} from '@mui/icons-material'
import { format, subMonths, addMonths, isSameMonth, isSameYear } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useBudget } from '../contexts/BudgetContext'

const HistoryPage: React.FC = () => {
  const [currentHistoryDate, setCurrentHistoryDate] = useState(subMonths(new Date(), 1))
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Récupérer les vraies données de dépenses depuis le context
  const { budgetExpenses, monthlyBudgets } = useBudget()

  const categories = ['all', 'Courant', 'Mensuel', 'Annuel', 'Épargne']

  // Convertir toutes les dépenses en un seul tableau avec le mois/année
  const allExpenses = Object.entries(budgetExpenses).flatMap(([budgetName, expenses]) => 
    expenses.map(expense => ({
      ...expense,
      budget: budgetName
    }))
  )

  // Filtrer les dépenses par mois sélectionné et critères de recherche
  const filteredExpenses = allExpenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    const isSameMonthYear = isSameMonth(expenseDate, currentHistoryDate) && 
                           isSameYear(expenseDate, currentHistoryDate)
    
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.budget.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory
    
    return isSameMonthYear && matchesSearch && matchesCategory
  })

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const handlePreviousMonth = () => {
    setCurrentHistoryDate(subMonths(currentHistoryDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentHistoryDate(addMonths(currentHistoryDate, 1))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Courant': return 'primary'
      case 'Mensuel': return 'secondary'
      case 'Annuel': return 'warning'
      case 'Épargne': return 'success'
      default: return 'default'
    }
  }

  const currentMonthName = format(currentHistoryDate, 'MMMM yyyy', { locale: fr })

  return (
    <Box>
      {/* En-tête avec navigation de mois */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Historique
          </Typography>
          <Typography variant="h6" color="textSecondary">
            {currentMonthName}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={handlePreviousMonth}
            aria-label="Mois précédent"
            color="primary"
          >
            <NavigateBefore />
          </IconButton>
          <IconButton 
            onClick={handleNextMonth}
            aria-label="Mois suivant"
            color="primary"
            disabled={currentHistoryDate >= new Date()}
          >
            <NavigateNext />
          </IconButton>
        </Box>
      </Box>

      {/* Résumé du mois */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Total dépensé
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(totalExpenses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Nombre de dépenses
              </Typography>
              <Typography variant="h4">
                {filteredExpenses.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Dépense moyenne
              </Typography>
              <Typography variant="h4">
                {filteredExpenses.length > 0 ? formatCurrency(totalExpenses / filteredExpenses.length) : '0€'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Actions
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Download />}
                fullWidth
                aria-label="Exporter les données du mois"
              >
                Exporter
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtres et recherche */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Rechercher une dépense..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
              aria-label="Rechercher dans les dépenses"
            />
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={selectedCategory}
                label="Catégorie"
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filtrer par catégorie"
              >
                <MenuItem value="all">Toutes</MenuItem>
                {categories.slice(1).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<FilterList />}
              aria-label="Filtres avancés"
            >
              Filtres avancés
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Liste des dépenses */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Dépenses de {format(currentHistoryDate, 'MMMM yyyy', { locale: fr })}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {filteredExpenses.length} résultat{filteredExpenses.length > 1 ? 's' : ''}
            </Typography>
          </Box>

          {filteredExpenses.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Budget</TableCell>
                    <TableCell align="center">Catégorie</TableCell>
                    <TableCell align="right">Montant</TableCell>
                    <TableCell align="center">Auteur</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {format(expense.date, 'dd/MM/yyyy', { locale: fr })}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {format(expense.date, 'HH:mm', { locale: fr })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {expense.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {expense.budget}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={expense.category}
                          size="small"
                          color={getCategoryColor(expense.category) as any}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(expense.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {expense.userName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          aria-label={`Voir détails de ${expense.description}`}
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Aucune dépense trouvée
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Aucune dépense ne correspond à vos critères de recherche pour ce mois.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default HistoryPage 