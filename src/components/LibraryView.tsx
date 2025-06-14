import React, { useState, useMemo } from 'react';
import { Box, TextField, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { PropertyTemplate } from '../types';

interface Props {
  library: PropertyTemplate[];
  onSelect: (template: PropertyTemplate) => void;
}

export function LibraryView({ library, onSelect }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLibrary = useMemo(() => {
        if (!searchTerm) return library;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return library.filter(template => 
            template.name.toLowerCase().includes(lowerCaseSearch) ||
            template.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearch))
        );
    }, [library, searchTerm]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 400 }}>
            <TextField
                label="Search by Name or Tag"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 1 }}
            />
            <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
                {filteredLibrary.length > 0 ? filteredLibrary.map(template => (
                    <ListItem key={template.id} disablePadding>
                        <ListItemButton onClick={() => onSelect(template)}>
                            <ListItemText 
                                primary={template.name}
                                secondary={`Tags: ${template.tags.join(', ')}`}
                            />
                        </ListItemButton>
                    </ListItem>
                )) : (
                    <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>No templates found.</Typography>
                )}
            </List>
        </Box>
    );
}