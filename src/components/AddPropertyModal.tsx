import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Stack, Select, MenuItem, InputLabel, FormControl, Tabs, Tab } from '@mui/material';
import { PropertyUsage, PropertyTemplate, Property } from '../types';
import { LibraryView } from './LibraryView';
import { TagInput } from './TagInput';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (propertyData: Omit<Property, 'id' | 'currentValue' | 'maxValue'>, target: 'global' | string) => void;
  activeSubSheetId: string;
  library: PropertyTemplate[];
}

const style = { position: 'absolute' as 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 450, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, borderRadius: 2 };

const USAGES: PropertyUsage[] = ['Attribute', 'Skill', 'HealthResource', 'PointResource', 'Constant', 'Quality'];

export function AddPropertyModal({ open, onClose, onAdd, activeSubSheetId, library }: Props) {
  const [name, setName] = useState('');
  const [expression, setExpression] = useState('');
  const [description, setDescription] = useState('');
  const [usage, setUsage] = useState<PropertyUsage>('Attribute');
  const [tags, setTags] = useState<string[]>([]);
  const [priority, setPriority] = useState(10);
  const [fgColor, setFgColor] = useState('#4caf50');
  const [bgColor, setBgColor] = useState('#303030');
  const [activeTab, setActiveTab] = useState(0);

  const handleSelectTemplate = (template: PropertyTemplate) => {
      setName(template.name);
      setExpression(template.expression ?? '');
      setDescription(template.description ?? '');
      setUsage(template.usage);
      setTags(template.tags ?? []);
      setActiveTab(0);
  };

  const handleSubmit = () => {
    if (name) {
      const propData: Omit<Property, 'id' | 'currentValue' | 'maxValue'> = { 
          name, 
          expression, 
          usage, 
          tags,
          description: usage === 'Quality' ? description : undefined,
          priority: usage === 'HealthResource' ? priority : undefined,
          foregroundColor: usage === 'HealthResource' ? fgColor : undefined,
          backgroundColor: usage === 'HealthResource' ? bgColor : undefined,
      };
      onAdd(propData, activeSubSheetId);
      setName(''); setExpression(''); setDescription(''); setUsage('Attribute'); setTags([]);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" mb={2}>Add New Property</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="Custom" />
                <Tab label="From Library" />
            </Tabs>
        </Box>
        
        {activeTab === 0 && (
            <Stack spacing={2}>
              <TextField label="Property Name" value={name} onChange={(e) => setName(e.target.value)} />
              {usage === 'Quality' && (
                  <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} />
              )}
              <TextField label="Value / Expression" value={expression} onChange={(e) => setExpression(e.target.value)} helperText="Max value for resources. Can be empty for Qualities."/>
              <FormControl fullWidth>
                <InputLabel>Usage</InputLabel>
                <Select value={usage} label="Usage" onChange={(e) => setUsage(e.target.value as PropertyUsage)}>
                  {USAGES.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                </Select>
              </FormControl>
              {usage === 'HealthResource' && (
                <Stack direction="row" spacing={2} alignItems="center">
                    <TextField label="Priority" type="number" value={priority} onChange={e => setPriority(parseInt(e.target.value))} size="small" helperText="Lower is higher" />
                    <TextField label="Bar" type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} size="small" sx={{minWidth: 70}}/>
                    <TextField label="BG" type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} size="small" sx={{minWidth: 70}}/>
                </Stack>
              )}
              <TagInput tags={tags} setTags={setTags} />
              <Button variant="contained" onClick={handleSubmit}>Add Property</Button>
            </Stack>
        )}

        {activeTab === 1 && <LibraryView library={library} onSelect={handleSelectTemplate} />}
      </Box>
    </Modal>
  );
}
