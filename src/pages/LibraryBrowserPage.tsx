import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Container, Grid, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Library } from '../types';
import { LibraryCard } from '../components/LibraryCard';

// Helper to get initial data, could be expanded to fetch public libraries
function getInitialLibraries(): Library[] {
    const savedData = localStorage.getItem('user-libraries');
    if (savedData) {
        return JSON.parse(savedData);
    }
    // Default starter library
    return [
        {
            id: 'dnd5e-starter',
            name: 'D&D 5e Starter Pack',
            description: 'A basic set of properties, qualities, and resources for Dungeons & Dragons 5th Edition.',
            author: 'System',
            properties: [
                { id: 'template.str', name: 'Strength', usage: 'Attribute', tags: ['Core Stat'], expression: '10' },
                { id: 'template.dex', name: 'Dexterity', usage: 'Attribute', tags: ['Core Stat'], expression: '10' },
                { id: 'template.hp', name: 'Hit Points', usage: 'Attribute', tags: ['Health'], expression: '', providesSlots: [{id: 'max'}, {id: 'current'}] },
            ]
        }
    ];
}

export function LibraryBrowserPage() {
    const [myLibraries, setMyLibraries] = useState<Library[]>([]);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        setMyLibraries(getInitialLibraries());
    }, []);

    const handleCreateLibrary = () => {
        const name = prompt("Enter new library name:");
        if (name) {
            const newLibrary: Library = {
                id: name.toLowerCase().replace(/\s+/g, '-') + Date.now(),
                name,
                description: 'A new collection of property templates.',
                properties: []
            };
            const updatedLibraries = [...myLibraries, newLibrary];
            setMyLibraries(updatedLibraries);
            localStorage.setItem('user-libraries', JSON.stringify(updatedLibraries));
        }
    };

    return (
        <Container maxWidth="lg">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                 <Typography variant="h4" gutterBottom>Library Browser</Typography>
                 <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateLibrary}>
                     New Library
                 </Button>
            </Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
                    <Tab label="My Libraries" />
                    <Tab label="Public Libraries" />
                </Tabs>
            </Box>
            <Box mt={4}>
                {activeTab === 0 && (
                    <Grid container spacing={3}>
                        {myLibraries.map(lib => (
                            <Grid key={lib.id} size={{xs: 1, sm: 6, md: 4}}>
                                <LibraryCard library={lib} />
                            </Grid>
                        ))}
                    </Grid>
                )}
                {activeTab === 1 && (
                    <Typography color="text.secondary">
                        Browsing public libraries is a feature coming soon!
                    </Typography>
                )}
            </Box>
        </Container>
    );
}
