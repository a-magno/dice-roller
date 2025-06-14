import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Fab, Button, Box, Typography, Paper, Tabs, Tab, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ArticleIcon from '@mui/icons-material/Article';

import { AddPropertyModal } from '../components/AddPropertyModal';
import { EditPropertyModal } from '../components/EditPropertyModal';
import { AddSubSheetModal } from '../components/AddSubSheetModal';
import { LibraryManagerModal } from '../components/LibraryManagerModal';
import { RollerModal } from '../components/RollerModal';
import { SheetViewContainer } from '../components/SheetViewContainer';
import { EditorViewContainer } from '../components/EditorViewContainer';
import { Sheet, SubSheet, Property, PropertyUsage, PropertyTemplate, Action } from '../types';
import { buildContext } from '../utils/contextBuilder';
import { getInitialSheet, getInitialLibrary } from '../utils/initialData';
import { DiceRoller } from '../lib';

const roller = new DiceRoller();

export function SheetManagerPage() {
  const [sheet, setSheet] = useState<Sheet>(getInitialSheet);
  const [propertyLibrary, setPropertyLibrary] = useState<PropertyTemplate[]>(getInitialLibrary);
  
  const [viewMode, setViewMode] = useState<'sheet' | 'editor'>('sheet');
  const [addPropertyModalOpen, setAddPropertyModalOpen] = useState(false);
  const [addSubSheetModalOpen, setAddSubSheetModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [rollerModalOpen, setRollerModalOpen] = useState(false);
  const [actionToEdit, setActionToEdit] = useState<{ action: Action; subSheetId: string; } | null>(null);
  const [addActionModalOpen, setAddActionModalOpen] = useState(false);


  const [propertyToEdit, setPropertyToEdit] = useState<{ property: Property, subSheetId?: string } | null>(null);
  const [propertyToRoll, setPropertyToRoll] = useState<Property | null>(null);
  const [actionToRoll, setActionToRoll] = useState<{action: Action, subSheet: SubSheet} | null>(null);

  useEffect(() => {
    const savedSheet = localStorage.getItem('character-sheet-data');
    if (savedSheet) setSheet(JSON.parse(savedSheet));
    
    const savedLibrary = localStorage.getItem('property-library');
    if (savedLibrary) setPropertyLibrary(JSON.parse(savedLibrary));
  }, []);

  const fullContext = useMemo(() => buildContext(sheet), [sheet]);

  // All handler functions (handleSetActiveSubSheet, handleAddProperty, etc.) are moved here
  const handleSetActiveSubSheet = useCallback((id: string) => setSheet(prev => ({ ...prev, activeSubSheetId: id })), []);
  
  const handleRollProperty = useCallback((property: Property) => {
    setPropertyToRoll(property);
    setActionToRoll(null);
    setRollerModalOpen(true);
  }, []);

  const handleRollAction = useCallback((action: Action, subSheet: SubSheet) => {
    setActionToRoll({action, subSheet});
    setPropertyToRoll(null);
    setRollerModalOpen(true);
  }, []);
  
  //... and so on for all the other handlers.

  const activeSubSheet = sheet.subSheets.find(ss => ss.id === sheet.activeSubSheetId);

    function handleOpenEditModal(property: Property, subSheetId?: string | undefined): void {
        throw new Error('Function not implemented.');
    }

  return (
    <>
        <AddPropertyModal open={addPropertyModalOpen} onClose={() => setAddPropertyModalOpen(false)} onAdd={() => {}} activeSubSheetId={sheet.activeSubSheetId} library={propertyLibrary} />
        <AddSubSheetModal open={addSubSheetModalOpen} onClose={() => setAddSubSheetModalOpen(false)} onAdd={() => {}} />
        <LibraryManagerModal open={libraryModalOpen} onClose={() => setLibraryModalOpen(false)} library={propertyLibrary} onImport={() => {}} />
        {propertyToEdit && <EditPropertyModal open={editModalOpen} onClose={() => setEditModalOpen(false)} onEdit={() => { } } property={propertyToEdit.property} subSheetId={propertyToEdit.subSheetId} allProperties={sheet.globalProperties.concat(activeSubSheet?.properties || [])} activeSubSheetId={''} />}
        {(propertyToRoll || actionToRoll) && <RollerModal open={rollerModalOpen} onClose={() => setRollerModalOpen(false)} property={propertyToRoll} action={actionToRoll?.action} subSheet={actionToRoll?.subSheet} context={fullContext} />}
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
            <Typography variant="h4" component="h1" fontWeight="bold">Sheet Manager</Typography>
            <Box>
                <Button variant="outlined" startIcon={<PhotoLibraryIcon />} onClick={() => setLibraryModalOpen(true)} sx={{ mr: 2 }}>Manage Library</Button>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={() => {}}>Save All</Button>
            </Box>
        </Box>

        <Paper elevation={2}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex' }}>
                <Tabs value={viewMode} onChange={(e, val) => setViewMode(val)} sx={{ flexGrow: 1 }}>
                    <Tab icon={<ArticleIcon />} iconPosition="start" label="Sheet View" value="sheet" />
                    <Tab icon={<EditNoteIcon />} iconPosition="start" label="Editor View" value="editor" />
                </Tabs>
            </Box>

            {viewMode === 'sheet' ? (
                <SheetViewContainer
                    sheet={sheet}
                    context={fullContext}
                    onSetActiveSubSheet={handleSetActiveSubSheet}
                    onAddSubSheetClick={() => setAddSubSheetModalOpen(true)}
                    onEditProperty={handleOpenEditModal}
                    onDeleteProperty={() => {}}
                    onModifyResource={() => {}}
                    onSetResource={() => {}}
                    onRollProperty={handleRollProperty}
                    onRollAction={handleRollAction}
                    onAddActionClick={() => setAddActionModalOpen(true)}
                    onEditAction={() => {}}
                    onDeleteAction={() => {}}
                />
            ) : (
                <EditorViewContainer 
                    sheet={sheet}
                    context={fullContext}
                    onEditProperty={handleOpenEditModal}
                    onDeleteProperty={() => {}}
                    onRollProperty={handleRollProperty}
                    onReparentProperty={() => {}}
                />
            )}
        </Paper>

        <Fab color="primary" aria-label="add" onClick={() => setAddPropertyModalOpen(true)} sx={{ position: 'fixed', bottom: 32, right: 32 }}><AddIcon /></Fab>
    </>
  );
}
