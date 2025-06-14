import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Stack } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

export function AddSubSheetModal({ open, onClose, onAdd }: Props) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" mb={2}>
          Create New Sub-Sheet
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Sub-Sheet Name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            helperText='e.g., "Werewolf Form" or "Familiar"'
            autoFocus
          />
          <Button variant="contained" onClick={handleSubmit}>
            Create Sheet
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
