import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  CircularProgress,
  Alert
} from '@mui/material'
import { Email, Login } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { useAuth } from '../contexts/AuthContext'
import { LoginForm } from '../types'
import BudgetLogo from '../components/common/BudgetLogo'

// Schéma de validation
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Veuillez entrer un email valide')
    .required('L\'email est requis')
})

const LoginPage: React.FC = () => {
  const { signIn, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null)
      await signIn(data.email)
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion')
    }
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 3
      }}
    >
      <Card
        sx={{
          width: '100%',
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
          borderRadius: 3
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4
            }}
          >
            <BudgetLogo sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 500, textAlign: 'center' }}
            >
              BudgetManager
            </Typography>
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ textAlign: 'center', maxWidth: 400 }}
            >
              Connectez-vous pour accéder à votre tableau de bord de gestion de budget
            </Typography>
          </Box>

          {/* Formulaire */}
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ width: '100%' }}
            noValidate
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Adresse email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                  }}
                  sx={{ mb: 3 }}
                  aria-describedby="email-helper-text"
                />
              )}
            />

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                role="alert"
                aria-live="polite"
              >
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting || loading}
              startIcon={
                isSubmitting || loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Login />
                )
              }
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 500
              }}
              aria-describedby={isSubmitting ? 'loading-text' : undefined}
            >
              {isSubmitting || loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Texte d'aide pour l'accessibilité */}
      <Box
        id="loading-text"
        sx={{ position: 'absolute', left: '-9999px' }}
        aria-live="polite"
        aria-atomic="true"
      >
        {(isSubmitting || loading) && 'Connexion en cours, veuillez patienter'}
      </Box>
    </Container>
  )
}

export default LoginPage 