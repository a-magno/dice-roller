import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <Box textAlign="center" mt={8}>
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to the Sheet Manager
      </Typography>
      <Typography variant="h5" color="text.secondary" paragraph>
        Your all-in-one solution for managing complex character sheets for any TTRPG system.
      </Typography>
      <Button variant="contained" size="large" component={Link} to="/sheets">
        Go to Sheets
      </Button>
    </Box>
  );
}
