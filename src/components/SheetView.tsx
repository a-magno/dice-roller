import React, { useMemo } from 'react';
import { Box, Grid, Stack, Card, CardContent, Typography, Divider, Button } from '@mui/material';
import { Masonry } from '@mui/lab';
import AddIcon from '@mui/icons-material/Add';
import { SubSheet, Property, PropertyUsage, Action } from '../types';
import { VariableContext } from '../lib';
import { PropertyGroup } from './PropertyGroup';
import { HealthResourceItem } from './HealthResourceItem';
import { QualityCard } from './QualityCard';
import { ActionListItem } from './ActionListItem';

interface Props {
    subSheet: SubSheet;
    context: VariableContext;
    onEdit: (property: Property, subSheetId?: string) => void;
    onDelete: (id: string, subSheetId?: string) => void;
    onModifyResource: (id: string, amount: number, subSheetId?: string) => void;
    onSetResource: (id: string, subSheetId?: string) => void;
    onRoll: (property: Property) => void;
    onRollAction: (action: Action) => void;
    onAddActionClick: () => void;
    onEditAction: (action: Action, subSheetId: string) => void;
    onDeleteAction: (id: string, subSheetId: string) => void;
}

export function SheetView({ subSheet, context, onEdit, onDelete, onModifyResource, onSetResource, onRoll, onRollAction, onAddActionClick, onEditAction, onDeleteAction }: Props) {
  const { healthResources, qualities, propertyGroups } = useMemo(() => {
    const health = subSheet.properties
        .filter(p => p.usage === 'HealthResource')
        .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
        
    const qualities = subSheet.properties.filter(p => p.usage === 'Quality');
        
    const groups: Record<PropertyUsage, Property[]> = {
      Attribute: [], Skill: [], HealthResource: [], PointResource: [], Constant: [], Quality: []
    };
    
    // Filter out health resources and qualities to avoid duplicating them
    subSheet.properties
        .filter(p => p.usage !== 'HealthResource' && p.usage !== 'Quality')
        .forEach(p => {
            if (groups[p.usage]) {
                groups[p.usage].push(p);
            }
        });

    return { healthResources: health, qualities, propertyGroups: groups };
  }, [subSheet]);

  return (
    <Box p={2}>
        <Stack spacing={2} mb={2}>
            {healthResources.map(prop => (
                <HealthResourceItem 
                    key={prop.id}
                    property={prop} 
                    context={context} 
                    onModify={(amount) => onModifyResource(prop.id, amount, subSheet.id)} 
                    onSet={() => onSetResource(prop.id, subSheet.id)}
                    onEdit={() => onEdit(prop, subSheet.id)}
                />
            ))}
        </Stack>
        
        <Grid container spacing={2}>
            <Grid size={{xs: 12, md: 8}}>
                 <Stack spacing={2} mb={2}>
                    {qualities.map(prop => (
                        <QualityCard 
                            key={prop.id}
                            quality={prop}
                            allProperties={subSheet.properties}
                            context={context}
                            onEdit={(p) => onEdit(p, subSheet.id)}
                            onRoll={onRoll}
                        />
                    ))}
                </Stack>
                <Masonry columns={{ xs: 1, sm: 2 }} spacing={2}>
                    <PropertyGroup title="Attributes" properties={propertyGroups.Attribute} context={context} onEdit={onEdit} onDelete={onDelete} onRoll={onRoll} subSheetId={subSheet.id}/>
                    <PropertyGroup title="Skills" properties={propertyGroups.Skill} context={context} onEdit={onEdit} onDelete={onDelete} onRoll={onRoll} subSheetId={subSheet.id}/>
                    <PropertyGroup title="Resources" properties={propertyGroups.PointResource} context={context} onEdit={onEdit} onDelete={onDelete} onRoll={onRoll} onModifyResource={onModifyResource} onSetResource={onSetResource} subSheetId={subSheet.id}/>
                </Masonry>
            </Grid>
            <Grid size={{xs: 12, md: 4}}>
                 <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="h5">Actions</Typography>
                            <Button startIcon={<AddIcon />} onClick={onAddActionClick}>Add</Button>
                        </Box>
                        <Divider />
                        <Stack spacing={1} mt={2}>
                            {(subSheet.actions || []).map(action => (
                                <ActionListItem 
                                    key={action.id} 
                                    action={action} 
                                    onRoll={onRollAction} 
                                    onEdit={() => onEditAction(action, subSheet.id)}
                                    onDelete={() => onDeleteAction(action.id, subSheet.id)}
                                />
                            ))}
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </Box>
  );
}
