import React, { useMemo, useState } from 'react';
import { Box, Typography, IconButton, Chip, Tooltip, Stack } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Property } from '../types';
import { VariableContext } from '../lib';

interface Props {
  property: Property;
  context: VariableContext;
  onEdit: (property: Property, subSheetId?: string) => void;
  onDelete: (id: string, subSheetId?: string) => void;
  onRoll: (property: Property) => void;
  onReorder: (propertyId: string, direction: 'up' | 'down', subSheetId?: string) => void;
  subSheetId?: string;
}

export function EditorTreeItem({ property, context, onEdit, onDelete, onRoll, onReorder, subSheetId }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
    
  const value = useMemo(() => {
    const contextKey = subSheetId ? `${subSheetId}.${property.id}` : property.id;
    const val = context[contextKey];
    return isNaN(val) ? 'Err' : val;
  }, [property, context, subSheetId]);

  const handleDragStart = (event: React.DragEvent) => {
      const data = JSON.stringify({
          draggedId: property.id,
          draggedSubSheetId: subSheetId
      });
      event.dataTransfer.setData("application/json", data);
      event.stopPropagation();
  };
  
  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  // FIX: This handler ensures that when a drop occurs on this item, 
  // its drag-over visual state is reset.
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    // The actual reparenting logic is handled by the parent TreeItem in UnifiedEditorView.
  };

  return (
    <Box 
        sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 0.5, pr: 0,
            border: '2px dashed transparent',
            borderColor: isDragOver ? 'primary.main' : 'transparent',
            borderRadius: 1,
            transition: 'border-color 0.2s'
        }} 
        draggable
        onDragStart={handleDragStart}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
    >
        <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton size="small" onClick={(e) => {e.stopPropagation(); onReorder(property.id, 'up', subSheetId)}}><ArrowUpwardIcon fontSize="inherit"/></IconButton>
            <IconButton size="small" onClick={(e) => {e.stopPropagation(); onReorder(property.id, 'down', subSheetId)}}><ArrowDownwardIcon fontSize="inherit"/></IconButton>
        </Stack>
        <Box sx={{ flexGrow: 1, ml: 1, cursor: 'pointer' }} onClick={() => onEdit(property, subSheetId)}>
            <Typography variant="body1">{property.name}</Typography>
            <Typography variant="caption" color="text.secondary">{property.expression}</Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.5}>
             <Tooltip title="Edit Property">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(property, subSheetId); }}>
                    <EditIcon fontSize="inherit"/>
                </IconButton>
            </Tooltip>
             <Tooltip title="Delete Property">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(property.id, subSheetId); }}>
                    <DeleteIcon fontSize="inherit"/>
                </IconButton>
            </Tooltip>
        </Stack>
    </Box>
  );
}
