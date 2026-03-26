import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Paper, IconButton, Box, ThemeProvider, createTheme, CssBaseline, Switch, FormControlLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getDatasources, createEntityConfig } from './api';
import { GridDesigner } from './GridDesigner';

export default function App() {
  const [datasources, setDatasources] = useState<any[]>([]);
  const [entityName, setEntityName] = useState('');
  const [selectedDs, setSelectedDs] = useState<string | number>('');
  const [fields, setFields] = useState<any[]>([]);
  const [gridOrder, setGridOrder] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  useEffect(() => {
    getDatasources().then(setDatasources).catch(console.error);
  }, []);

  const addField = () => {
    setFields([...fields, { name: '', label: '', type: 'string', enumName: '' }]);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
    setGridOrder(newFields.map(f => f.name).filter(Boolean));
  };

  const updateField = (index: number, key: string, value: string) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
    setGridOrder(newFields.map(f => f.name).filter(Boolean));
  };

  const handleSubmit = async () => {
    const gridTemplateStr = JSON.stringify(gridOrder);

    // Simple mock logic for assigning an existing datasource ID
    let finalDsId = undefined;
    if (typeof selectedDs === 'number') {
       finalDsId = selectedDs;
    } else if (datasources.find(ds => ds.id === selectedDs)) {
       finalDsId = datasources.find(ds => ds.id === selectedDs)?.id;
    }

    const payload = {
      name: entityName,
      dataSourceId: finalDsId,
      gridTemplate: gridTemplateStr,
      fields
    };

    try {
      await createEntityConfig(payload);
      alert('Entity saved successfully!');
    } catch (e: any) {
      alert('Error saving: ' + e.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" style={{ marginTop: '32px', marginBottom: '32px' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" gutterBottom>Management Client</Typography>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
            label="Dark Mode"
          />
        </Box>

        <Paper style={{ padding: '16px', marginBottom: '16px' }}>
          <Typography variant="h6">Entity Definition</Typography>
          <TextField
            label="Entity Name"
            value={entityName}
            onChange={e => setEntityName(e.target.value)}
            fullWidth
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Datasource</InputLabel>
            <Select value={selectedDs} label="Datasource" onChange={e => setSelectedDs(e.target.value as number | string)}>
              {datasources.map(ds => (
                <MenuItem key={ds.id} value={ds.id}>{ds.name} ({ds.apiUrl})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        <Paper style={{ padding: '16px', marginBottom: '16px' }}>
          <Typography variant="h6" gutterBottom>Fields</Typography>
          {fields.map((field, index) => (
            <Box key={index} display="flex" gap={2} mb={2} alignItems="center">
              <TextField
                label="Name (DB key)"
                value={field.name}
                onChange={e => updateField(index, 'name', e.target.value)}
                size="small"
              />
              <TextField
                label="Label (UI)"
                value={field.label}
                onChange={e => updateField(index, 'label', e.target.value)}
                size="small"
              />
              <FormControl size="small" style={{ minWidth: '120px' }}>
                <InputLabel>Type</InputLabel>
                <Select value={field.type} label="Type" onChange={e => updateField(index, 'type', e.target.value)}>
                  <MenuItem value="string">String</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="checkbox">Checkbox</MenuItem>
                  <MenuItem value="enum">Enum</MenuItem>
                  <MenuItem value="coordinate">Coordinate</MenuItem>
                </Select>
              </FormControl>
              {field.type === 'enum' && (
                <TextField
                  label="Enum Name"
                  value={field.enumName}
                  onChange={e => updateField(index, 'enumName', e.target.value)}
                  size="small"
                />
              )}
              <IconButton onClick={() => removeField(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button variant="outlined" onClick={addField}>Add Field</Button>
        </Paper>

        {fields.length > 0 && fields.every(f => f.name) && (
          <GridDesigner fields={fields} gridOrder={gridOrder} setGridOrder={setGridOrder} />
        )}

        <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: '16px' }}>
          Save Entity
        </Button>
      </Container>
    </ThemeProvider>
  );
}
