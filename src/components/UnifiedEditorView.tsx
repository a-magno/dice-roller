import React from 'react';
import { Box, Typography } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Sheet, Property } from '../types';
import { VariableContext } from '../lib';
import { EditorTreeItem } from './EditorTreeItem';

interface Props {
  sheet: Sheet;
  context: VariableContext;
  onEdit: (property: Property, subSheetId?: string) => void;
  onDelete: (id: string, subSheetId?: string) => void;
  onRoll: (property: Property) => void;
  onReparent: (draggedId: string, targetId: string | null, draggedSubSheetId?: string) => void;
  onReorder: (propertyId: string, direction: 'up' | 'down', subSheetId?: string) => void;
}

export function UnifiedEditorView({ sheet, context, onEdit, onDelete, onRoll, onReparent, onReorder }: Props) {

    const handleDrop = (event: React.DragEvent, targetId: string | null, targetSubSheetId?: string) => {
        event.preventDefault();
        event.stopPropagation(); // Stop the event here after we've handled it.
        const draggedData = event.dataTransfer.getData("application/json");
        if(draggedData) {
            const { draggedId, draggedSubSheetId } = JSON.parse(draggedData);
            
            if (draggedId === targetId) return;

            // Only allow reparenting within the same sub-sheet or global scope
            if (draggedSubSheetId === targetSubSheetId) {
                 onReparent(draggedId, targetId, draggedSubSheetId);
            }
        }
    };
    
    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault(); // This is necessary to allow dropping
        event.stopPropagation();
    };

    const renderTreeItems = (properties: Property[], parentId?: string, subSheetId?: string) => {
        return properties
            .filter(p => p.parentId === parentId)
            .map(prop => (
                <TreeItem
                    key={prop.id}
                    itemId={`${subSheetId || 'global'}-${prop.id}`}
                    label={
                        <EditorTreeItem
                            property={prop}
                            context={context}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onRoll={onRoll}
                            onReorder={onReorder} // FIX: onReorder is now passed down
                            subSheetId={subSheetId}
                        />
                    }
                     onDrop={(e) => handleDrop(e, prop.id, subSheetId)}
                     onDragOver={handleDragOver}
                >
                    {renderTreeItems(properties, prop.id, subSheetId)}
                </TreeItem>
            ));
    };

    return (
        <Box p={2}>
            <SimpleTreeView
                aria-label="file system navigator"
                sx={{ flexGrow: 1, overflowY: 'auto' }}
            >
                <TreeItem itemId="globals-root" label={<Typography variant="h6">Global Properties</Typography>}
                    onDrop={(e) => handleDrop(e, null)}
                    onDragOver={handleDragOver}
                >
                    {renderTreeItems(sheet.globalProperties)}
                </TreeItem>
                
                {sheet.subSheets.map(ss => (
                    <TreeItem key={ss.id} itemId={ss.id} label={<Typography variant="h6">{ss.name}</Typography>}
                        onDrop={(e) => handleDrop(e, null, ss.id)}
                        onDragOver={handleDragOver}
                    >
                        {renderTreeItems(ss.properties, undefined, ss.id)}
                    </TreeItem>
                ))}
            </SimpleTreeView>
        </Box>
    );
}
