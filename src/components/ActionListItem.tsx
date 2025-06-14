import { Paper, Typography, IconButton, Tooltip, Box, Chip, Stack } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import DeleteIcon from '@mui/icons-material/Delete';
import { Action } from '../types';

interface Props {
  action: Action;
  onRoll: (action: Action) => void;
  onEdit: (action: Action) => void;
  onDelete: (id: string) => void;
}

export function ActionListItem({ action, onRoll, onEdit, onDelete }: Props) {
  return (
    <Paper 
        variant="outlined" 
        sx={{ 
            p: 1.5, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
        }}
        onClick={() => onEdit(action)}
    >
        <Box flexGrow={1}>
            <Typography fontWeight="bold">{action.name}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>{action.description}</Typography>
            <Box mt={1} display="flex" gap={1}>
                <Chip label={action.type} size="small" color="primary" variant="outlined" />
                <Chip label={action.range} size="small" color="secondary" variant="outlined" />
            </Box>
        </Box>
        <Stack direction="row">
            <Tooltip title={`Roll ${action.rollExpression}`}>
                <IconButton color="primary" onClick={(e) => {e.stopPropagation(); onRoll(action)}}>
                    <CasinoIcon />
                </IconButton>
            </Tooltip>
             <Tooltip title="Delete Action">
                <IconButton color="error" onClick={(e) => {e.stopPropagation(); onDelete(action.id)}}>
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        </Stack>
    </Paper>
  );
}
