import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

interface AuthErrorProps {
  error: Error | null;
}

const AuthError: React.FC<AuthErrorProps> = ({ error }) => {
  if (!error) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Alert severity="error">
        <AlertTitle>Erreur d'authentification</AlertTitle>
        {error.message}
        <br />
        <small>Si le problème persiste, essayez de vider le cache du navigateur.</small>
      </Alert>
    </Box>
  );
};

export default AuthError; 