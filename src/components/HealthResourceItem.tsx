import React, { useMemo } from 'react';
import { Box, Typography, LinearProgress, IconButton, Tooltip, Paper, Stack } from '@mui/material';
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

export function HealthResourceItem({ property, context, onModify, onSet, onEdit }: Props) {
  const maxValue = useMemo(() => {
    const result = roller.roll(property.expression, { context });
    return result && 'value' in result ? result.value : 0;
  }, [property.expression, context]);

  const currentValue = property.currentValue ?? maxValue;
  const progress = maxValue > 0 ? (currentValue / maxValue) * 100 : 0;
  
  const foregroundColor = property.foregroundColor || '#4caf50';
  const backgroundColor = property.backgroundColor || '#303030';

  return (
    <Paper variant="outlined" sx={{ p: 2, width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6">{property.name}</Typography>
        <Stack direction="row" spacing={0.5}>
            <Tooltip title="Decrease Value">
                <IconButton size="small" onClick={() => onModify(-1)}><RemoveCircleOutlineIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Increase Value">
                <IconButton size="small" onClick={() => onModify(1)}><AddCircleOutlineIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Edit Property">
                <IconButton size="small" onClick={onEdit}><EditIcon/></IconButton>
            </Tooltip>
        </Stack>
      </Box>
      <Tooltip title="Click to set value">
        <Box onClick={onSet} sx={{ cursor: 'pointer', position: 'relative' }}>
          <LinearProgress
            variant="determinate"
            value={100}
            sx={{ height: 24, borderRadius: 1, backgroundColor: backgroundColor, '& .MuiLinearProgress-bar': { backgroundColor: 'transparent' } }}
          />
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 24, borderRadius: 1, position: 'absolute', top: 0, left: 0, width: '100%',
              '& .MuiLinearProgress-bar': { backgroundColor: foregroundColor, transition: 'transform .4s linear' }
            }}
          />
          <Typography variant="body2" align="center" sx={{ 
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              fontWeight: 'bold', color: 'common.white', textShadow: '1px 1px 2px black', pointerEvents: 'none'
          }}>
            {currentValue} / {maxValue}
          </Typography>
        </Box>
      </Tooltip>
    </Paper>
  );
}
