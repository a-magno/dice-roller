import { useState, useMemo } from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import DeleteIcon from '@mui/icons-material/Delete';
import { Property } from '../App';
import { DiceRoller, VariableContext, RollOutcome } from '../lib';

interface Props {
  property: Property;
  context: VariableContext;
  roller: DiceRoller;
  onDelete: (id: string) => void;
}

export function PropertyCard({ property, context, roller, onDelete }: Props) {
  const [lastRoll, setLastRoll] = useState<RollOutcome | null>(null);

  // Memoize the calculation of the property's base value
  const baseResult = useMemo(() => {
    return roller.roll(property.expression, { context });
  }, [property.expression, context, roller]);

  const handleReroll = () => {
    setLastRoll(roller.roll(property.expression, { context }));
  };
  
  const displayResult = lastRoll || baseResult;

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="div">{property.name}</Typography>
            <IconButton size="small" onClick={() => onDelete(property.id)}><DeleteIcon fontSize="small"/></IconButton>
        </Box>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {property.expression}
        </Typography>
        
        <Box display="flex" alignItems="center" justifyContent="center" my={2}>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {displayResult && 'value' in displayResult ? displayResult.value : 'N/A'}
            </Typography>
            <IconButton onClick={handleReroll} sx={{ ml: 1 }}>
                <ReplayIcon />
            </IconButton>
        </Box>

        {displayResult && 'formattedString' in displayResult && (
            <Typography variant="body2" align="center" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                Breakdown: {displayResult.formattedString}
            </Typography>
        )}
         {displayResult && 'errors' in displayResult && (
            <Typography variant="body2" color="error" align="center">
                Error: {displayResult.errors[0]}
            </Typography>
        )}
      </CardContent>
    </Card>
  );
}
