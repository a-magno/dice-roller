import React from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box } from '@mui/material';

interface Node {
    id: string;
    parentId?: string;
    [key: string]: any; // Allow other properties
}

interface Props {
  nodes: Node[];
  renderLabel: (node: Node) => React.ReactNode;
  onReparent: (draggedId: string, targetId: string | null) => void;
  rootDropId?: string | null;
}

export function DraggableTreeView({ nodes, renderLabel, onReparent, rootDropId = null }: Props) {

    const handleDrop = (event: React.DragEvent, targetId: string | null) => {
        event.preventDefault();
        event.stopPropagation();
        const draggedId = event.dataTransfer.getData("application/nodeId");
        if(draggedId && draggedId !== targetId) {
            onReparent(draggedId, targetId);
        }
    };
    
    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
    };
    
    const handleDragStart = (event: React.DragEvent, nodeId: string) => {
        event.dataTransfer.setData("application/nodeId", nodeId);
        event.stopPropagation();
    };

    const buildTree = (parentId?: string) => {
        return nodes
            .filter(node => node.parentId === parentId)
            .map(node => (
                <TreeItem
                    key={node.id}
                    itemId={node.id}
                    label={
                        <div draggable onDragStart={(e) => handleDragStart(e, node.id)}>
                            {renderLabel(node)}
                        </div>
                    }
                    onDrop={(e) => handleDrop(e, node.id)}
                    onDragOver={handleDragOver}
                >
                    {buildTree(node.id)}
                </TreeItem>
            ));
    };

    return (
        <Box 
            onDrop={(e) => handleDrop(e, rootDropId)}
            onDragOver={handleDragOver}
            sx={{minHeight: '100px'}} // Ensure there's a drop zone even when empty
        >
            <SimpleTreeView>
                {buildTree(undefined)}
            </SimpleTreeView>
        </Box>
    );
}
