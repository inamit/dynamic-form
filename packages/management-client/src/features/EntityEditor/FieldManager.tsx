import { useState } from "react";
import { Box, Button, Typography, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface Field {
  name: string;
  type: string;
  label: string;
  enumName?: string;
}

interface Props {
  fields: Field[];
  onFieldsChange: (fields: Field[]) => void;
}

export default function FieldManager({ fields, onFieldsChange }: Props) {
  const [newField, setNewField] = useState<Field>({ name: '', type: 'text', label: '', enumName: '' });

  const handleAddField = () => {
    if (newField.name && newField.label) {
      onFieldsChange([...fields, newField]);
      setNewField({ name: '', type: 'text', label: '', enumName: '' });
    }
  };

  const handleRemoveField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    onFieldsChange(newFields);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Fields</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Name"
          value={newField.name}
          onChange={(e) => setNewField({ ...newField, name: e.target.value })}
          size="small"
        />
        <TextField
          label="Label"
          value={newField.label}
          onChange={(e) => setNewField({ ...newField, label: e.target.value })}
          size="small"
        />
        <TextField
          select
          label="Type"
          value={newField.type}
          onChange={(e) => setNewField({ ...newField, type: e.target.value })}
          size="small"
        >
          <MenuItem value="text">Text</MenuItem>
          <MenuItem value="number">Number</MenuItem>
          <MenuItem value="checkbox">Checkbox</MenuItem>
          <MenuItem value="enum">Enum</MenuItem>
        </TextField>
        {newField.type === 'enum' && (
          <TextField
            label="Enum Name"
            value={newField.enumName}
            onChange={(e) => setNewField({ ...newField, enumName: e.target.value })}
            size="small"
          />
        )}
        <Button variant="contained" onClick={handleAddField}>Add Manually</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((f, i) => (
              <TableRow key={i}>
                <TableCell>{f.name}</TableCell>
                <TableCell>{f.label}</TableCell>
                <TableCell>{f.type}</TableCell>
                <TableCell>
                  <Button size="small" color="error" onClick={() => handleRemoveField(i)}>Remove</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
