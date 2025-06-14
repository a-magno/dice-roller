import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';
import { Library } from '../types';

interface Props {
  library: Library;
}

export function LibraryCard({ library }: Props) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="div">
            {library.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {library.description}
          </Typography>
        </CardContent>
        <Box sx={{ p: 2, pt: 0, width: '100%' }}>
            <Typography variant="caption" color="text.secondary">
                {library.properties.length} templates
                {library.author && ` • by ${library.author}`}
            </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}
