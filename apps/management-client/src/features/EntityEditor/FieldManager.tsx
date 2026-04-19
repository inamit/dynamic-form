import { useState, useMemo } from "react";
import {
  Box, Button, Typography, TextField, MenuItem, Paper,
  IconButton, Chip, Collapse, Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SubdirectoryArrowRight as SubIcon,
  DataObject as DataObjectIcon,
  DataArray as DataArrayIcon
} from '@mui/icons-material';
import type { Field } from '../../types';

interface Props {
  fields: Field[];
  onFieldsChange: (fields: Field[]) => void;
}

interface TreeField extends Field {
  children: TreeField[];
}

export default function FieldManager({ fields, onFieldsChange }: Props) {
  const [newField, setNewField] = useState<Field>({ name: '', type: 'text', label: '', enumName: '', parentField: null });
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const handleAddField = () => {
    if (newField.name && newField.label) {
      onFieldsChange([...fields, newField]);
      setNewField({ name: '', type: 'text', label: '', enumName: '', parentField: null });
    }
  };

  const listFields = fields.filter(f => f.type === 'list');

  const handleRemoveField = (fieldName: string) => {
    // Remove the field and any of its children
    const newFields = fields.filter(f => f.name !== fieldName && f.parentField !== fieldName);
    onFieldsChange(newFields);
  };

  const toggleExpand = (fieldName: string) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(fieldName)) {
      newSet.delete(fieldName);
    } else {
      newSet.add(fieldName);
    }
    setExpandedNodes(newSet);
  };

  const handleEditField = (fieldName: string) => {
    const fieldToEdit = fields.find(f => f.name === fieldName);
    if (fieldToEdit) {
      setNewField(fieldToEdit);
      handleRemoveField(fieldName);
    }
  };

  const fieldTree = useMemo(() => {
    const tree: TreeField[] = [];
    const lookup: Record<string, TreeField> = {};

    fields.forEach(f => {
      lookup[f.name] = { ...f, children: [] };
    });

    fields.forEach(f => {
      if (f.parentField && lookup[f.parentField]) {
        lookup[f.parentField].children.push(lookup[f.name]);
      } else {
        tree.push(lookup[f.name]);
      }
    });
    return tree;
  }, [fields]);

  const renderTreeField = (node: TreeField, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.name);

    return (
      <Box key={node.name} sx={{ width: '100%', mb: 1 }}>
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1.5,
            ml: level * 4,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            bgcolor: level > 0 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            transition: 'background-color 0.2s'
          }}
        >
          {level > 0 && <SubIcon sx={{ mr: 1, color: 'text.secondary', opacity: 0.5 }} fontSize="small" />}

          {node.type === 'list' ? (
            <DataArrayIcon sx={{ mr: 2, color: 'primary.main', opacity: 0.8 }} fontSize="small" />
          ) : (
            <DataObjectIcon sx={{ mr: 2, color: 'primary.main', opacity: 0.8 }} fontSize="small" />
          )}

          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{node.name}</Typography>
            <Typography variant="body2" color="text.secondary">"{node.label}"</Typography>

            <Chip
              size="small"
              label={node.type}
              color={node.type === 'list' ? 'primary' : 'default'}
              variant={node.type === 'list' ? 'filled' : 'outlined'}
              sx={{ ml: 1, height: 20 }}
            />
            {node.enumName && (
              <Chip size="small" label={`Enum: ${node.enumName}`} variant="outlined" sx={{ height: 20 }} />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {node.type === 'list' && (
              <Tooltip title={isExpanded ? "Collapse list" : "Expand list"}>
                <IconButton
                  size="small"
                  aria-label={isExpanded ? "Collapse list" : "Expand list"}
                  onClick={() => toggleExpand(node.name)}
                  sx={{ ml: 1 }}
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Edit field">
              <IconButton
                size="small"
                aria-label="Edit field"
                onClick={() => handleEditField(node.name)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete field">
              <IconButton
                size="small"
                color="error"
                aria-label="Delete field"
                onClick={() => handleRemoveField(node.name)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        {node.type === 'list' && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 1 }}>
              {node.children.map(child => renderTreeField(child, level + 1))}
              {node.children.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: (level + 1) * 4 + 2, display: 'block', mb: 1 }}>
                  No sub-fields yet.
                </Typography>
              )}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr 1fr auto' },
        gap: 2,
        mb: 4,
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        alignItems: 'start'
      }}>
        <TextField
          label="Field Name"
          value={newField.name}
          onChange={(e) => setNewField({ ...newField, name: e.target.value })}
          size="small"
          fullWidth
        />
        <TextField
          label="Display Label"
          value={newField.label}
          onChange={(e) => setNewField({ ...newField, label: e.target.value })}
          size="small"
          fullWidth
        />
        <TextField
          select
          label="Type"
          value={newField.type}
          onChange={(e) => setNewField({ ...newField, type: e.target.value, parentField: null })}
          size="small"
          fullWidth
        >
          <MenuItem value="text">Text</MenuItem>
          <MenuItem value="number">Number</MenuItem>
          <MenuItem value="checkbox">Checkbox</MenuItem>
          <MenuItem value="enum">Enum</MenuItem>
          <MenuItem value="list">List</MenuItem>
        </TextField>
        {newField.type === 'enum' ? (
          <TextField
            label="Enum Name"
            value={newField.enumName || ''}
            onChange={(e) => setNewField({ ...newField, enumName: e.target.value })}
            size="small"
            fullWidth
          />
        ) : <Box />}

        {newField.type !== 'list' && listFields.length > 0 ? (
          <TextField
            select
            label="Parent Field"
            value={newField.parentField || ''}
            onChange={(e) => setNewField({ ...newField, parentField: e.target.value || null })}
            size="small"
            fullWidth
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {listFields.map(lf => (
              <MenuItem key={lf.name} value={lf.name}>{lf.label} ({lf.name})</MenuItem>
            ))}
          </TextField>
        ) : <Box />}

        <Button
          type="button"
          variant="contained"
          onClick={handleAddField}
          startIcon={<AddIcon />}
          sx={{ height: 40 }}
          disabled={!newField.name || !newField.label}
        >
          Add Field
        </Button>
      </Box>

      <Box sx={{ minHeight: 200 }}>
        {fieldTree.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, opacity: 0.5 }}>
            <Typography>No fields added yet. Introspect a schema or add fields manually.</Typography>
          </Box>
        ) : (
          fieldTree.map(node => renderTreeField(node, 0))
        )}
      </Box>
    </Box>
  );
}
