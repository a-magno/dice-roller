import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, List, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IPropertyData, IStatisticData } from '../types';
import { EntitySheet } from '../engine/sheetEngine';
import { PropertyListItem } from './PropertyListItem';

interface Props {
  quality: IPropertyData;
  allProperties: IPropertyData[];
  entity: EntitySheet;
}

export function QualityCard({ quality, allProperties, entity }: Props) {
  const childProperties = (quality.children || [])
    .map(childId => allProperties.find(p => p.id === childId))
    .filter(Boolean) as IPropertyData[];

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{quality.name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
            {quality.description}
        </Typography>
        <Divider />
        <List dense>
            {childProperties.map(prop => {
                if (prop.propertyType === 'statistic') {
                    return (
                        <PropertyListItem 
                            key={prop.id}
                            property={prop as IStatisticData}
                            entity={entity}
                        />
                    );
                }
                return null; // Render other child types here in the future
            })}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
