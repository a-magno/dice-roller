import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Stack, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { Action, ActionType, ActionRange } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (actionData: Omit<Action, 'id'>, targetSheetId: string) => void;
  activeSubSheetId: string;
}

const style = { position: 'absolute' as 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 450, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, borderRadius: 2 };

const ACTION_TYPES: ActionType[] = ['Damage', 'Support'];
const ACTION_RANGES: ActionRange[] = ['Melee', 'Ranged'];

export function AddActionModal({ open, onClose, onAdd, activeSubSheetId }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rollExpression, setRollExpression] = useState('d20');
  const [type, setType] = useState<ActionType>('Damage');
  const [range, setRange] = useState<ActionRange>('Melee');
  const [qualityTags, setQualityTags] = useState('');
  const [effectTags, setEffectTags] = useState('');


  const handleSubmit = () => {
    if (name && rollExpression) {
      onAdd({
          name, description, rollExpression, type, range, 
          qualityTags: qualityTags.split(',').map(t => t.trim()).filter(Boolean),
          effectTags: effectTags.split(',').map(t => t.trim()).filter(Boolean)
      }, activeSubSheetId);
      // Reset form
      setName(''); setDescription(''); setRollExpression('d20');
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" mb={2}>Add New Action</Typography>
        <Stack spacing={2}>
          <TextField label="Action Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={2}/>
          <TextField label="Roll Expression" value={rollExpression} onChange={(e) => setRollExpression(e.target.value)} helperText="e.g., d20 + strMod" />
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
          <TextField label="Quality Tags" value={qualityTags} onChange={(e) => setQualityTags(e.target.value)} helperText="Comma-separated, e.g., weapon, fire" />
          <TextField label="Effect Tags" value={effectTags} onChange={(e) => setEffectTags(e.target.value)} helperText="Comma-separated, e.g., fire_damage, healing" />
          <Button variant="contained" onClick={handleSubmit}>Add Action</Button>
        </Stack>
      </Box>
    </Modal>
  );
}
