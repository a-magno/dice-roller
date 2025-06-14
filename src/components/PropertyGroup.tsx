import React from 'react';
import { Card, CardContent, Typography, Divider, List } from '@mui/material';

interface Props {
  title: string;
  children: React.ReactNode;
}

export function PropertyGroup({ title, children }: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {title}
        </Typography>
        <Divider />
        <List dense>
            {children}
        </List>
      </CardContent>
    </Card>
  );
}
