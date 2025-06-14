import React from 'react';
import { ListItem, ListItemText, Chip } from '@mui/material';
import { IStatisticData } from '../types';
import { EntitySheet } from '../engine/sheetEngine';

interface Props {
  property: IStatisticData;
  entity: EntitySheet;
}

export function PropertyListItem({ property, entity }: Props) {
  const value = entity.getStatisticValue(property.id);

  return (
    <ListItem>
      <ListItemText
        primary={property.name}
        secondary={property.formula || `Base: ${property.baseValue}`}
      />
      <Chip label={value} color="primary"/>
    </ListItem>
  );
}
