import React, { useMemo } from 'react';
import { ListItem, ListItemText, IconButton, Chip, Tooltip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import { Property } from '../types';
import { VariableContext, DiceRoller } from '../lib';

interface Props {
  property: Property;
  context: VariableContext;
  onModify: (amount: number) => void;
  onSet: () => void;
  onEdit: () => void;
}

const roller = new DiceRoller();

export function PointResourceItem({ property, context, onModify, onSet, onEdit }: Props) {
  const maxValue = useMemo(() => {
    const result = roller.roll(property.expression, { context });
    return result && 'value' in result ? result.value : 0;
  }, [property.expression, context]);

  const currentValue = property.currentValue ?? maxValue;

  return (
    <ListItem
      secondaryAction={
        <>
            <Tooltip title="Edit">
                <IconButton edge="end" aria-label="edit" onClick={onEdit}><EditIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Decrease">
                <IconButton edge="end" onClick={() => onModify(-1)}><RemoveCircleOutlineIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Increase">
                <IconButton edge="end" onClick={() => onModify(1)}><AddCircleOutlineIcon /></IconButton>
            </Tooltip>
        </>
      }
    >
      <ListItemText primary={property.name} />
      <Tooltip title="Click to set value">
        <Chip label={`${currentValue} / ${maxValue}`} color="secondary" onClick={onSet} sx={{cursor: 'pointer'}} />
      </Tooltip>
    </ListItem>
  );
}
