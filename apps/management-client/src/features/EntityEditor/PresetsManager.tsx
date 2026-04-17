import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Tabs, Tab, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import GridPreview from './GridPreview/GridPreview';

interface Preset {
  id?: number | string;
  name: string;
  gridTemplate: string;
  defaultValues?: Record<string, any>;
  listSubFields?: Record<string, string[]>;
}

interface Props {
  fields: any[];
  presets: Preset[];
  defaultPresetId: number | string;
  schemaRequired?: string[];
  onChange: (presets: Preset[], defaultPresetId: number | string) => void;
}

export default function PresetsManager({ fields, presets, defaultPresetId, schemaRequired = [], onChange }: Props) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPresetIndex, setEditingPresetIndex] = useState<number | null>(null);
  const [presetName, setPresetName] = useState('');

  const currentPreset = presets[selectedTab];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleOpenDialog = (index: number | null = null) => {
    setEditingPresetIndex(index);
    if (index !== null) {
      setPresetName(presets[index].name);
    } else {
      setPresetName('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPresetIndex(null);
    setPresetName('');
  };

  const handleSavePresetName = () => {
    if (!presetName.trim()) return;

    const newPresets = [...presets];
    let newDefaultId = defaultPresetId;

    if (editingPresetIndex !== null) {
      newPresets[editingPresetIndex].name = presetName;
    } else {
      // Add new preset
      const newPresetId = `temp-${Date.now()}`; // Frontend-only ID
      newPresets.push({
        id: newPresetId,
        name: presetName,
        gridTemplate: '', // default empty template, handled by grid preview
        defaultValues: {},
        listSubFields: {}
      });
      setSelectedTab(newPresets.length - 1);

      // Make default if it's the only one
      if (newPresets.length === 1) {
          newDefaultId = newPresetId;
      }
    }

    onChange(newPresets, newDefaultId);
    handleCloseDialog();
  };

  const handleDeletePreset = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (presets.length <= 1) {
        alert("At least one preset must exist.");
        return;
    }

    const presetToDelete = presets[index];
    const newPresets = presets.filter((_, i) => i !== index);

    let newDefaultId = defaultPresetId;
    if (presetToDelete.id === defaultPresetId) {
        newDefaultId = newPresets[0].id!;
    }

    if (selectedTab >= newPresets.length) {
        setSelectedTab(newPresets.length - 1);
    }

    onChange(newPresets, newDefaultId);
  };

  const handleSetDefault = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(presets, id);
  };

  const handleLayoutChange = (newTemplate: string) => {
    const newPresets = [...presets];
    newPresets[selectedTab].gridTemplate = newTemplate;
    onChange(newPresets, defaultPresetId);
  };

  const handleDefaultValueChange = (fieldName: string, value: any) => {
    const newPresets = [...presets];
    const currentDefValues = newPresets[selectedTab].defaultValues || {};
    newPresets[selectedTab].defaultValues = { ...currentDefValues, [fieldName]: value };
    onChange(newPresets, defaultPresetId);
  };

  // Helper to visually pick fields to hide/remove from layout
  // (In grid layout, fields not in template are ignored. We just need to give user
  // a way to remove fields from the current gridTemplate if they don't want them in this preset).
  // The GridPreview handles the actual parsing and building. To "remove" a field from the preset,
  // we could just rewrite the grid template string without it, or rely on the user to just leave it out
  // of the layout by deleting its box in a visual editor (if supported) or by filtering fields sent to GridPreview.

  // To support "removing not required fields", we allow users to select which fields are active for THIS preset.
  // We'll manage an "active fields" list by checking what's currently in the gridTemplate.
  // But GridPreview generates layout based on the fields array passed to it.
  // Let's filter the fields passed to GridPreview based on what the user wants in this preset.

  // Wait, GridPreview regenerates default templates for all passed fields if the template is empty.
  // We can let the user toggle fields on/off for the current preset.

  const parseFieldsInTemplate = (template: string) => {
      const tokens = template.replace(/"/g, ' ').split(/\s+/).filter(Boolean).filter(t => t !== '.');
      return new Set(tokens);
  };

  const activeFieldsSet = currentPreset ? parseFieldsInTemplate(currentPreset.gridTemplate) : new Set();

  // If template is empty, ALL top-level fields are assumed to be "about to be added" by GridPreview's auto-generation
  const isTemplateEmpty = !currentPreset?.gridTemplate;

  const toggleField = (field: any) => {
     if (!currentPreset) return;
     if (schemaRequired.includes(field.name)) return; // Don't allow toggling required fields

     if (field.parentField) {
         // Subfields toggling
         const newPresets = [...presets];
         const presetToUpdate = { ...newPresets[selectedTab] };
         const currentListSubFields = { ...(presetToUpdate.listSubFields || {}) };

         let currentActive = currentListSubFields[field.parentField];
         if (!currentActive) {
             // By default all subfields of this parent are active
             currentActive = fields.filter(f => f.parentField === field.parentField).map(f => f.name);
         }

         if (currentActive.includes(field.name)) {
             currentActive = currentActive.filter(name => name !== field.name);
         } else {
             currentActive = [...currentActive, field.name];
         }

         currentListSubFields[field.parentField] = currentActive;
         presetToUpdate.listSubFields = currentListSubFields;
         newPresets[selectedTab] = presetToUpdate;
         onChange(newPresets, defaultPresetId);
         return;
     }

     let newTemplate = currentPreset.gridTemplate;

     if (isTemplateEmpty) {
        // If it's empty, we must first let GridPreview generate the default, or just build one manually.
        // It's easier to just build a simple one. But to stay consistent, we'll build a basic string.
        const activeNames = fields.filter(f => !f.parentField).map(f => f.name).filter(n => n !== field.name);
        newTemplate = `"${activeNames.join(' ')}"`;
     } else {
        if (activeFieldsSet.has(field.name)) {
            // Remove field: replace its occurrences with '.' (empty cell)
            const regex = new RegExp(`\\b${field.name}\\b`, 'g');
            newTemplate = newTemplate.replace(regex, '.');
        } else {
            // Add field: append it to a new row at the bottom
            newTemplate = `${newTemplate.trim()} "${field.name}"`;
        }
     }

     handleLayoutChange(newTemplate);
  };


  return (
    <Paper sx={{ p: 2, minHeight: 400 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Grid Presets</Typography>
        <Button variant="outlined" size="small" onClick={() => handleOpenDialog()}>
          Add Preset
        </Button>
      </Box>

      {presets.length > 0 && (
        <>
          <Tabs value={selectedTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
            {presets.map((preset, index) => (
              <Tab
                key={preset.id || index}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {preset.name}
                    <Tooltip title={preset.id === defaultPresetId ? "Default Preset" : "Set as Default"}>
                        <IconButton
                            size="small"
                            onClick={(e) => handleSetDefault(preset.id!, e)}
                            color={preset.id === defaultPresetId ? "warning" : "default"}
                            sx={{ p: 0.5 }}
                        >
                            {preset.id === defaultPresetId ? <StarIcon fontSize="small"/> : <StarBorderIcon fontSize="small"/>}
                        </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDialog(index); }} sx={{ p: 0.5 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => handleDeletePreset(index, e)} color="error" sx={{ p: 0.5 }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              />
            ))}
          </Tabs>

          {currentPreset && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Active Fields for Preset "{currentPreset.name}"</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Click a field to toggle it on or off for this preset. Required fields cannot be hidden.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {fields.map(f => {
                        const isRequired = schemaRequired.includes(f.name);
                        let isActive = false;

                        if (f.parentField) {
                            const currentListSubFields = currentPreset.listSubFields || {};
                            const activeSubFields = currentListSubFields[f.parentField];
                            if (activeSubFields) {
                                isActive = activeSubFields.includes(f.name);
                            } else {
                                isActive = true; // default is all subfields are active
                            }
                        } else {
                            isActive = isTemplateEmpty || activeFieldsSet.has(f.name);
                        }

                        const label = f.parentField ? `${f.parentField} > ${f.label || f.name}` : (f.label || f.name);

                        return (
                          <Tooltip key={f.name} title={isRequired ? "Required field cannot be hidden" : ""}>
                              <Chip
                                  label={label}
                                  color={isActive ? "primary" : "default"}
                                  variant={isActive ? "filled" : "outlined"}
                                  onClick={() => toggleField(f)}
                                  sx={{ cursor: isRequired ? 'not-allowed' : 'pointer' }}
                                  onDelete={isRequired ? undefined : undefined} // just visual cue
                                  icon={isRequired ? <StarIcon fontSize="small"/> : undefined}
                              />
                          </Tooltip>
                        );
                    })}
                </Box>
              </Box>

              <Typography variant="subtitle2" gutterBottom>Grid Layout</Typography>
              {/* Pass only the active fields to GridPreview to ensure hidden fields don't render. Also exclude subfields from the main grid layout */}
              <GridPreview
                fields={fields.filter(f => {
                   if (f.parentField) {
                       const allowed = currentPreset.listSubFields?.[f.parentField];
                       return allowed ? allowed.includes(f.name) : true;
                   }
                   return isTemplateEmpty || activeFieldsSet.has(f.name);
                })}
                gridTemplate={currentPreset.gridTemplate}
                defaultValues={currentPreset.defaultValues}
                onLayoutChange={handleLayoutChange}
                onDefaultValueChange={handleDefaultValueChange}
              />
            </Box>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editingPresetIndex !== null ? 'Edit Preset Name' : 'New Preset'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Preset Name"
            type="text"
            fullWidth
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSavePresetName} variant="contained" disabled={!presetName.trim()}>Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
