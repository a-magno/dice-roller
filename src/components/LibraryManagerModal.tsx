import { Modal, Box, Typography, TextField, Button, Stack, Tabs, Tab, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { PropertyTemplate } from '../types';
import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  library: PropertyTemplate[];
  onImport: (newLibrary: PropertyTemplate[]) => void;
}

const style = { position: 'absolute' as 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: {xs: '90%', md: 600}, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, borderRadius: 2, display: 'flex', flexDirection: 'column' };

export function LibraryManagerModal({ open, onClose, library, onImport }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [importJson, setImportJson] = useState('');
  
  const exportJson = JSON.stringify(library, null, 2);

  const handleImport = () => {
      try {
          const newLibrary = JSON.parse(importJson);
          // Basic validation could be added here
          onImport(newLibrary);
          setImportJson('');
      } catch (e) {
          alert('Invalid JSON format. Please check the text and try again.');
      }
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(exportJson);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" mb={2}>Library Manager</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
                <Tab label="Export" />
                <Tab label="Import" />
            </Tabs>
        </Box>
        <Box mt={2} flexGrow={1}>
            {activeTab === 0 && (
                <Stack spacing={2} height="100%">
                    <Typography variant="body2" color="text.secondary">Copy this text to share your library with others.</Typography>
                    <TextField multiline aria-readonly value={exportJson} rows={10} sx={{ flexGrow: 1, '& .MuiInputBase-input': { fontFamily: 'monospace' } }} />
                    <Button onClick={handleCopy} startIcon={<ContentCopyIcon />}>Copy to Clipboard</Button>
                </Stack>
            )}
            {activeTab === 1 && (
                <Stack spacing={2} height="100%">
                    <Typography variant="body2" color="text.secondary">Paste a shared library text here to import it. This will overwrite your current library.</Typography>
                    <TextField multiline value={importJson} onChange={(e) => setImportJson(e.target.value)} rows={10} placeholder="Paste JSON here..." sx={{ flexGrow: 1, '& .MuiInputBase-input': { fontFamily: 'monospace' } }} />
                    <Button onClick={handleImport} variant="contained" color="primary">Import Library</Button>
                </Stack>
            )}
        </Box>
      </Box>
    </Modal>
  );
}
