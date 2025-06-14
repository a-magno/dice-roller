import React from 'react';
import { Box } from '@mui/material';
import { Sheet, Property } from '../types';
import { VariableContext } from '../lib/types'
import { UnifiedEditorView } from './UnifiedEditorView';

interface Props {
  sheet: Sheet;
  context: VariableContext;
  onEditProperty: (property: Property, subSheetId?: string) => void;
  onDeleteProperty: (id: string, subSheetId?: string) => void;
  onRollProperty: (property: Property) => void;
  onReparentProperty: (draggedId: string, targetId: string | null, draggedSubSheetId?: string) => void;
}

export function EditorViewContainer({ 
    sheet, 
    context, 
    onEditProperty, 
    onDeleteProperty, 
    onRollProperty,
    onReparentProperty
}: Props) {
  return (
    <Box p={2}>
        <UnifiedEditorView 
        sheet={sheet}
        context={context}
        onEdit={onEditProperty}
        onDelete={onDeleteProperty}
        onRoll={onRollProperty}
        onReparent={onReparentProperty} onReorder={function (propertyId: string, direction: 'up' | 'down', subSheetId?: string): void {
          throw new Error('Function not implemented.');
        } }        />
    </Box>
  );
}
