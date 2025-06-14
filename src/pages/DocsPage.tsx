// src/pages/DocsPage.tsx
import React from 'react';
import { Typography, Box } from '@mui/material';

export function DocsPage() {
  return (
    <Box>
      <Typography variant="h3">Documentation</Typography>
      <Typography paragraph mt={2}>
        This page will contain documentation on how to use the sheet manager, the dice parser syntax, and the action system.
      </Typography>
    </Box>
  );
}