import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Stack, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { Action, ActionType, ActionRange } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onEdit: (id: string, newValues: Partial<Action>, subSheetId: string) => void;
  action: Action;
  subSheetId: string;
}

const style = { position: 'absolute' as 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 450, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, borderRadius: 2 };

const ACTION_TYPES: ActionType[] = ['Damage', 'Support'];
const ACTION_RANGES: ActionRange[] = ['Melee', 'Ranged'];

export function EditActionModal({ open, onClose, onEdit, action, subSheetId }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rollExpression, setRollExpression] = useState('');
  const [type, setType] = useState<ActionType>('Damage');
  const [range, setRange] = useState<ActionRange>('Melee');
  const [qualityTags, setQualityTags] = useState('');
  const [effectTags, setEffectTags] = useState('');

  useEffect(() => {
      if (action) {
          setName(action.name);
          setDescription(action.description);
          setRollExpression(action.rollExpression);
          setType(action.type);
          setRange(action.range);
          setQualityTags(action.qualityTags.join(', '));
          setEffectTags(action.effectTags.join(', '));
      }
  }, [action]);

  const handleSubmit = () => {
    if (name && rollExpression) {
      onEdit(action.id, {
          name, description, rollExpression, type, range, 
          qualityTags: qualityTags.split(',').map(t => t.trim()).filter(Boolean),
          effectTags: effectTags.split(',').map(t => t.trim()).filter(Boolean)
      }, subSheetId);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" mb={2}>Edit Action: {action.name}</Typography>
        <Stack spacing={2}>
          <TextField label="Action Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={2}/>
          <TextField label="Roll Expression" value={rollExpression} onChange={(e) => setRollExpression(e.target.value)} />
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={type} label="Type" onChange={(e) => setType(e.target.value as ActionType)}>
                    {ACTION_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl fullWidth>
                <InputLabel>Range</InputLabel>
                <Select value={range} label="Range" onChange={(e) => setRange(e.target.value as ActionRange)}>
                    {ACTION_RANGES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </Select>
            </FormControl>
          </Stack>
          <TextField label="Quality Tags" value={qualityTags} onChange={(e) => setQualityTags(e.target.value)} helperText="Comma-separated" />
          <TextField label="Effect Tags" value={effectTags} onChange={(e) => setEffectTags(e.target.value)} helperText="Comma-separated" />
          <Button variant="contained" onClick={handleSubmit}>Save Changes</Button>
        </Stack>
      </Box>
    </Modal>
  );
}
