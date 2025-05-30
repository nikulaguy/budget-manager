import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent
} from '@mui/material'

const SettingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Paramètres
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Page des paramètres en cours de développement...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SettingsPage 