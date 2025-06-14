import React from 'react';
import { Tabs, Tab, Box, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { SubSheet } from '../types';

interface Props {
  subSheets: SubSheet[];
  activeId: string;
  onTabChange: (id: string) => void;
  onAddClick: () => void;
}

export function SubSheetTabs({ subSheets, activeId, onTabChange, onAddClick }: Props) {
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
      <Tabs 
        value={activeId} 
        onChange={handleChange} 
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ flexGrow: 1 }}
      >
        {subSheets.map(ss => (
          <Tab key={ss.id} label={ss.name} value={ss.id} />
        ))}
      </Tabs>
      <Tooltip title="Add New Sub-Sheet">
        <IconButton onClick={onAddClick} sx={{ ml: 1, mr: 1 }}>
            <AddIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}