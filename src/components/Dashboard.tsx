import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Box } from '@mui/material';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { getCurrentUser } from '../utils/auth';

interface Expense {
  amount: number;
  category: string;
  date: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          throw new Error('No user logged in');
        }

        const expensesRef = collection(db, `users/${currentUser}/expenses`);
        const q = query(expensesRef);
        const querySnapshot = await getDocs(q);
        
        const fetchedExpenses: Expense[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Expense;
          fetchedExpenses.push(data);
        });

        setExpenses(fetchedExpenses);
        console.log('Fetched expenses:', fetchedExpenses);
      } catch (err) {
        console.error('Error fetching expenses:', err);
        setError(err instanceof Error ? err.message : 'Error fetching expenses');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>
        Mes Dépenses
      </Typography>
      {expenses.length === 0 ? (
        <Typography>Aucune dépense trouvée</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Montant</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense, index) => (
                <TableRow key={index}>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{new Date(expense.date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell align="right">{expense.amount.toFixed(2)} €</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right"><strong>Total</strong></TableCell>
                <TableCell align="right">
                  <strong>
                    {expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)} €
                  </strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Dashboard; 