import React from 'react';
import { Typography, Box, Paper, FormGroup, FormControlLabel, Switch } from '@mui/material';

export function ProfilePage() {
  // In a real app, this state would be managed globally via Context or another state manager
  // to actually change the theme. This is a visual placeholder for now.
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        User Profile & Settings
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 'md' }}>
        <Typography variant="h5" gutterBottom>
          Appearance
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={() => setIsDarkMode(!isDarkMode)}
              />
            }
            label="Enable Dark Mode"
          />
        </FormGroup>
        <Typography variant="caption" color="text.secondary" sx={{mt: 1, display: 'block'}}>
            Note: This is a placeholder. A full implementation would require a global state management solution to change the theme across the app.
        </Typography>
      </Paper>
    </Box>
  );
}
