import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import ArticleIcon from '@mui/icons-material/Article';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export type TreeItemType = 'node' | 'leaf';
export type DropPosition = 'before' | 'after' | 'inside';

export interface BaseTreeItemData {
    id: string;
    name: string;
    type: TreeItemType;
    parentId?: string;
    order: number;
}

interface TreeNode extends BaseTreeItemData {
    children: TreeNode[];
}

interface DataAgnosticTreeViewProps<T extends BaseTreeItemData> {
  initialItems: T[];
  rootItemId: string;
  onItemClick?: (item: T) => void;
  onItemsChange?: (items: T[]) => void;
}

export function DataAgnosticTreeView<T extends BaseTreeItemData>({
  initialItems,
  rootItemId,
  onItemClick,
  onItemsChange,
}: DataAgnosticTreeViewProps<T>) {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const treeStructure = useMemo(() => {
    const nodeMap = new Map<string, TreeNode>();
    items.forEach(item => nodeMap.set(item.id, { ...item, children: [] }));

    const roots: TreeNode[] = [];
    items.forEach(item => {
      if (item.parentId && nodeMap.has(item.parentId)) {
        nodeMap.get(item.parentId)?.children.push(nodeMap.get(item.id)!);
      } else {
        roots.push(nodeMap.get(item.id)!);
      }
    });
    
    const rootNode = roots.find(r => r.id === rootItemId);

    const sortChildren = (nodes: TreeNode[]) => {
        nodes.sort((a, b) => a.order - b.order);
        nodes.forEach(node => sortChildren(node.children));
    };
    if (rootNode) sortChildren(rootNode.children);

    return rootNode ? rootNode.children : [];
  }, [items, rootItemId]);
  
  const handleReorder = (draggedItem: T, targetItem: T, position: DropPosition) => {
    let newItems = JSON.parse(JSON.stringify(items)) as T[];
    const draggedIndex = newItems.findIndex(i => i.id === draggedItem.id);
    const [dragged] = newItems.splice(draggedIndex, 1);
    
    let newParentId = position === 'inside' && targetItem.type === 'node' ? targetItem.id : targetItem.parentId;
    dragged.parentId = newParentId;
    
    const siblings = newItems.filter(i => i.parentId === newParentId);
    
    let targetOrder: number;
    if (position === 'inside' && targetItem.type === 'node') {
        targetOrder = siblings.length;
    } else {
        targetOrder = targetItem.order;
        if(position === 'after') {
            targetOrder += 0.5; // Use a float to place it between items temporarily
        } else {
            targetOrder -= 0.5;
        }
    }
    dragged.order = targetOrder;
    
    newItems.push(dragged);

    // Renormalize ordering within each parent group to ensure it's contiguous integers
    const parentIds = new Set(newItems.map(i => i.parentId));
    parentIds.forEach(pId => {
      newItems
        .filter(i => i.parentId === pId)
        .sort((a, b) => a.order - b.order)
        .forEach((item, index) => { item.order = index; });
    });
    
    setItems(newItems);
    onItemsChange?.(newItems);
  };

  const renderTreeNodes = (nodes: TreeNode[], level: number) => {
    return nodes.map(node => (
      <CustomTreeItem
        key={node.id}
        node={node as unknown as T}
        level={level}
        onItemClick={onItemClick}
        onReorder={handleReorder}
      >
        {Array.isArray(node.children) && node.children.length > 0 && renderTreeNodes(node.children, level + 1)}
      </CustomTreeItem>
    ));
  };

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
      {renderTreeNodes(treeStructure, 0)}
    </Box>
  );
}

// Custom Draggable TreeItem Component
function CustomTreeItem<T extends BaseTreeItemData>({ node, level, children, onItemClick, onReorder }: any) {
    const [expanded, setExpanded] = useState(true);
    const [dragOverState, setDragOverState] = useState<DropPosition | null>(null);
    
    const isNode = node.type === 'node';
    const Icon = isNode ? FolderIcon : ArticleIcon;

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify(node));
        e.dataTransfer.effectAllowed = 'move';
        e.stopPropagation();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const positionY = e.clientY - rect.top;
        const height = rect.height;
        
        let newDragState: DropPosition | null = null;
        if (isNode) {
            if (positionY < height * 0.25) newDragState = 'before';
            else if (positionY > height * 0.75) newDragState = 'after';
            else newDragState = 'inside';
        } else {
            if (positionY < height / 2) newDragState = 'before';
            else newDragState = 'after';
        }
        
        if (newDragState !== dragOverState) {
            setDragOverState(newDragState);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverState(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const draggedItem = JSON.parse(e.dataTransfer.getData('application/json')) as T;
        if (draggedItem.id !== node.id && dragOverState && onReorder) {
            onReorder(draggedItem, node, dragOverState);
        }
        setDragOverState(null);
    };

    return (
        <Box sx={{ pl: level * 2 }}>
            <Box
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 0.5,
                    borderRadius: 1,
                    borderTop: dragOverState === 'before' ? '2px solid #1976d2' : 'none',
                    borderBottom: dragOverState === 'after' ? '2px solid #1976d2' : 'none',
                    backgroundColor: dragOverState === 'inside' ? 'action.hover' : 'transparent',
                    transition: 'background-color 150ms, border 150ms'
                }}
            >
                <DragIndicatorIcon sx={{ cursor: 'grab', opacity: 0.5, mr: 0.5 }} />
                <IconButton size="small" onClick={() => setExpanded(!expanded)} sx={{ visibility: isNode ? 'visible' : 'hidden' }}>
                    {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                </IconButton>
                <Icon sx={{ mr: 1 }} />
                <Typography onClick={() => onItemClick?.(node)} sx={{ fontWeight: 'inherit', flexGrow: 1, cursor: 'pointer' }}>
                    {node.name}
                </Typography>
            </Box>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                {children}
            </Collapse>
        </Box>
    );
}
