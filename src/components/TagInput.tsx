import React, { useState } from 'react';
import { Box, TextField, Chip, Stack } from '@mui/material';

interface Props {
  tags: string[];
  setTags: (tags: string[]) => void;
}

export function TagInput({ tags, setTags }: Props) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && inputValue.trim() !== '') {
      event.preventDefault();
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleDelete = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  return (
    <Box>
      <TextField
        label="Tags"
        fullWidth
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        helperText="Press Enter to add a tag."
      />
      <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
        {tags.map(tag => (
          <Chip key={tag} label={tag} onDelete={() => handleDelete(tag)} sx={{mb: 1}}/>
        ))}
      </Stack>
    </Box>
  );
}
