import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// MUI Icons
import ArticleIcon from '@mui/icons-material/Article';
import AddIcon from '@mui/icons-material/Add';

// --- Type Definitions ---
// Simplified Sheet interface, as collections are no longer managed in this view
export interface Sheet {
    id: string;
    name: string;
    // Keeping other properties for data consistency, even if not used in this list view
    collectionId: string;
    order: number;
    globalProperties: any[];
    subSheets: any[];
    activeSubSheetId: string;
}

// --- Data Persistence ---
// This function now only cares about fetching the sheets
function getInitialSheets(): Sheet[] {
    const sheetsData = localStorage.getItem('sheets-list');

    // Default data if nothing is in localStorage
    const defaultSheets: Sheet[] = [
        {
            id: 'default-sheet',
            name: 'My First Character',
            collectionId: 'root', // Still belongs to a logical root
            order: 0,
            globalProperties: [],
            subSheets: [],
            activeSubSheetId: ''
        }
    ];

    return sheetsData ? JSON.parse(sheetsData) : defaultSheets;
}

/**
 * A simplified page component that displays a list of sheets.
 */
export function SheetListPage() {
    const [sheets, setSheets] = useState<Sheet[]>([]);
    const navigate = useNavigate();

    // Load initial data from localStorage when the component mounts
    useEffect(() => {
        setSheets(getInitialSheets());
    }, []);

    // --- Event Handlers ---

    /**
     * Handles creating a new sheet.
     */
    const handleCreateSheet = () => {
        const name = prompt("Enter new sheet name:");
        if (!name) return; // Abort if the user cancels the prompt

        const newSheet: Sheet = {
            id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
            name,
            collectionId: 'root', // Assign to a default collection
            order: sheets.length, // Simply add to the end of the list
            globalProperties: [],
            subSheets: [],
            activeSubSheetId: '',
        };

        const newSheets = [...sheets, newSheet];
        setSheets(newSheets);
        localStorage.setItem('sheets-list', JSON.stringify(newSheets));
    };

    /**
     * Navigates to the selected sheet's detail page.
     * @param sheetId The ID of the sheet to navigate to.
     */
    const handleSheetClick = (sheetId: string) => {
        navigate(`/sheet/${sheetId}`);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" component="h1">
                    My Sheets
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateSheet}
                >
                    New Sheet
                </Button>
            </Box>
            <Paper variant="outlined">
                <List>
                    {sheets.length > 0 ? (
                        sheets
                            // Sort sheets by their order property
                            .sort((a, b) => a.order - b.order)
                            .map((sheet) => (
                                <ListItem key={sheet.id} disablePadding>
                                    <ListItemButton onClick={() => handleSheetClick(sheet.id)}>
                                        <ListItemIcon>
                                            <ArticleIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={sheet.name} />
                                    </ListItemButton>
                                </ListItem>
                            ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="No sheets found. Click 'New Sheet' to create one." sx={{textAlign: 'center', color: 'text.secondary'}}/>
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Container>
    );
}

// Note: To make this component runnable, you'll need to render it
// within a React application that has react-router-dom configured.
// For example:
//
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//
// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<SimpleSheetListPage />} />
//         <Route path="/sheet/:id" element={<div>Sheet Detail Page</div>} />
//       </Routes>
//     </Router>
//   );
// }
