import { useMemo } from 'react';
import { Box, Typography, IconButton, Chip, Tooltip, Stack } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Property } from '../types';
import { VariableContext } from '../lib';

interface Props {
  property: Property;
  context: VariableContext;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onRoll: (property: Property) => void;
  onReorder: (propertyId: string, direction: 'up' | 'down') => void;
}

export function GlobalPropertyTreeItem({ property, context, onEdit, onDelete, onRoll, onReorder }: Props) {
    
  const value = useMemo(() => {
    const val = context[property.id];
    return isNaN(val) ? 'Err' : val;
  }, [property, context]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }} onClick={(e) => e.stopPropagation()}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton size="small" onClick={() => onReorder(property.id, 'up')}><ArrowUpwardIcon fontSize="inherit"/></IconButton>
            <IconButton size="small" onClick={() => onReorder(property.id, 'down')}><ArrowDownwardIcon fontSize="inherit"/></IconButton>
        </Stack>
        <Box sx={{ flexGrow: 1, ml: 1, cursor: 'pointer' }} onClick={() => onEdit(property)}>
            <Typography variant="body1">{property.name}</Typography>
            <Typography variant="caption" color="text.secondary">{property.expression}</Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.5}>
            <Chip label={value} color={typeof value === 'number' ? 'primary' : 'error'} size="small"/>
            <Tooltip title="Roll Expression">
                <IconButton size="small" onClick={() => onRoll(property)}>
                    <CasinoIcon fontSize="inherit"/>
                </IconButton>
            </Tooltip>
             <Tooltip title="Delete Property">
                <IconButton size="small" onClick={() => onDelete(property.id)}>
                    <DeleteIcon fontSize="inherit"/>
                </IconButton>
            </Tooltip>
        </Stack>
    </Box>
  );
}
