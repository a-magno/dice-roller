import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Stack, FormControlLabel, Switch } from '@mui/material';
import { Property } from '../types';
import { TagInput } from './TagInput';

interface Props {
  open: boolean;
  onClose: () => void;
  onEdit: (id: string, newValues: Partial<Property>, isGlobal: boolean, originalSubSheetId?: string) => void;
  property: Property;
  subSheetId?: string; // The property's original location
  activeSubSheetId: string; // Where it would move to if toggled off global
  allProperties: Property[];
}

const style = { position: 'absolute' as 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, borderRadius: 2 };

export function EditPropertyModal({ open, onClose, onEdit, property, subSheetId, activeSubSheetId }: Props) {
  const [name, setName] = useState('');
  const [expression, setExpression] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isGlobal, setIsGlobal] = useState(false);

  useEffect(() => {
    if (property) {
      setName(property.name);
      setExpression(property.expression);
      setTags(property.tags || []);
      // A property is global if it was passed without a subSheetId
      setIsGlobal(subSheetId === undefined);
    }
  }, [property, subSheetId]);

  const handleSubmit = () => {
    if (name) {
        const newValues: Partial<Property> = { name, expression, tags };
        onEdit(property.id, newValues, isGlobal, subSheetId);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" mb={2}>Edit "{property.name}"</Typography>
        <Stack spacing={2}>
          <TextField label="Property ID" value={property.id} disabled />
          <TextField label="Property Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Value / Expression" value={expression} onChange={(e) => setExpression(e.target.value)} />
          <TagInput tags={tags} setTags={setTags} />
          <FormControlLabel
            control={<Switch checked={isGlobal} onChange={(e) => setIsGlobal(e.target.checked)} />}
            label="Global Property"
            title={isGlobal ? "This property is available on all sheets." : `Toggle on to move this property from its current sheet to Globals.`}
          />
          <Button variant="contained" color="primary" onClick={handleSubmit}>Save Changes</Button>
        </Stack>
      </Box>
    </Modal>
  );
}
