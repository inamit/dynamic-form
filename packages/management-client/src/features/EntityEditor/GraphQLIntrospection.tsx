import { useState } from "react";
import { Box, Button, Typography, Checkbox, FormControlLabel, Select, MenuItem, Paper, FormControl, InputLabel, TextField } from '@mui/material';
import axios from 'axios';

interface Props {
  dataSourceUrl: string;
  dataSourceHeaders: string;
  onFieldsSelected: (fields: any[]) => void;
  onOperationsSelected: (ops: Record<string, string>) => void;
}

export default function GraphQLIntrospection({ dataSourceUrl, dataSourceHeaders, onFieldsSelected, onOperationsSelected }: Props) {
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Track selected queries/mutations
  const [selectedOperations, setSelectedOperations] = useState({
    list: '',
    get: '',
    create: '',
    update: '',
    delete: ''
  });

  // Track selected fields locally before sending to parent
  const [selectedFields, setSelectedFields] = useState<{ [key: string]: any }>({});

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const handleIntrospect = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:3001/api/introspect', {
        url: dataSourceUrl,
        headers: dataSourceHeaders
      });
      setSchema(res.data.__schema);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const getBaseType = (type: any): any => {
    if (!type) return {};
    if (type.ofType) return getBaseType(type.ofType);
    return type;
  };

  const getTypeByName = (typeName: string) => {
    return schema?.types.find((t: any) => t.name === typeName);
  };

  const toggleNode = (path: string) => {
    setExpandedNodes(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTypeNode = (typeName: string, parentPath: string = '', depth: number = 0) => {
    if (depth > 5) return null; // prevent infinite recursion

    const typeObj = getTypeByName(typeName);
    if (!typeObj || !typeObj.fields) return null;

    return (
      <Box sx={{ ml: depth > 0 ? 3 : 0, mt: 1, borderLeft: depth > 0 ? '1px dashed #ccc' : 'none', pl: depth > 0 ? 2 : 0 }}>
        {typeObj.fields.map((field: any) => {
          const baseType = getBaseType(field.type);
          const isObject = baseType.kind === 'OBJECT';
          const fieldPath = parentPath ? `${parentPath}.${field.name}` : field.name;
          const isSelected = !!selectedFields[fieldPath];
          const isExpanded = !!expandedNodes[fieldPath];

          return (
            <Box key={fieldPath} sx={{ my: 1 }}>
              <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 2, bgcolor: isSelected ? 'action.selected' : 'background.paper' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => {
                        const newSelected = { ...selectedFields };
                        if (e.target.checked) {
                          newSelected[fieldPath] = {
                            name: field.name,
                            label: field.description || field.name,
                            type: isObject ? 'object' : 'text',
                            targetType: isObject ? baseType.name : null
                          };
                        } else {
                          delete newSelected[fieldPath];
                        }
                        setSelectedFields(newSelected);
                      }}
                    />
                  }
                  label={`${field.name} (${baseType.name}) - ${field.description || ''}`}
                />

                  {isSelected && (
                    <TextField
                      size="small"
                      label="Label"
                      value={selectedFields[fieldPath]?.label || field.description || field.name}
                      onChange={(e) => {
                        const newSelected = { ...selectedFields };
                        if (newSelected[fieldPath]) {
                          newSelected[fieldPath].label = e.target.value;
                          setSelectedFields(newSelected);
                        }
                      }}
                    />
                  )}

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={selectedFields[fieldPath]?.targetType || (isObject ? baseType.name : 'primitive')}
                    label="Type"
                    disabled={!isObject || !isSelected}
                    onChange={(e) => {
                      const newSelected = { ...selectedFields };
                      if (newSelected[fieldPath]) {
                        newSelected[fieldPath].targetType = e.target.value;
                        setSelectedFields(newSelected);
                      }
                    }}
                  >
                    <MenuItem value="primitive">Primitive</MenuItem>
                    {isObject && schema.types.filter((t: any) => t.kind === 'OBJECT').map((t: any) => (
                      <MenuItem key={t.name} value={t.name}>{t.name}</MenuItem>
                    ))}
                      {baseType.name === 'Float' || baseType.name === 'Int' ? <MenuItem value="enum">Enum</MenuItem> : null}
                  </Select>
                </FormControl>

                {isObject && !isSelected && (
                   <Button size="small" onClick={() => toggleNode(fieldPath)}>
                     {isExpanded ? 'Collapse' : 'Expand'}
                   </Button>
                )}
              </Paper>

              {isObject && isExpanded && !isSelected && (
                renderTypeNode(baseType.name, fieldPath, depth + 1)
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  const queryFields = schema ? getTypeByName(schema.queryType?.name)?.fields || [] : [];
  const mutationFields = schema ? getTypeByName(schema.mutationType?.name)?.fields || [] : [];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">GraphQL Introspection</Typography>
      <Button variant="contained" onClick={handleIntrospect} disabled={loading} sx={{ mt: 1, mb: 2 }}>
        {loading ? 'Loading...' : 'Introspect Schema'}
      </Button>
      {error && <Typography color="error">{error}</Typography>}

      {schema && (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Operation Mapping</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Map the GraphQL queries and mutations to the standard CRUD actions.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
              <FormControl size="small">
                <InputLabel>Query for List</InputLabel>
                <Select value={selectedOperations.list} label="Query for List" onChange={(e) => setSelectedOperations({ ...selectedOperations, list: e.target.value })}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {queryFields.map((f: any) => <MenuItem key={f.name} value={f.name}>{f.name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel>Query for Get</InputLabel>
                <Select value={selectedOperations.get} label="Query for Get" onChange={(e) => setSelectedOperations({ ...selectedOperations, get: e.target.value })}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {queryFields.map((f: any) => <MenuItem key={f.name} value={f.name}>{f.name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel>Mutation for Create</InputLabel>
                <Select value={selectedOperations.create} label="Mutation for Create" onChange={(e) => setSelectedOperations({ ...selectedOperations, create: e.target.value })}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {mutationFields.map((f: any) => <MenuItem key={f.name} value={f.name}>{f.name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel>Mutation for Update</InputLabel>
                <Select value={selectedOperations.update} label="Mutation for Update" onChange={(e) => setSelectedOperations({ ...selectedOperations, update: e.target.value })}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {mutationFields.map((f: any) => <MenuItem key={f.name} value={f.name}>{f.name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel>Mutation for Delete</InputLabel>
                <Select value={selectedOperations.delete} label="Mutation for Delete" onChange={(e) => setSelectedOperations({ ...selectedOperations, delete: e.target.value })}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {mutationFields.map((f: any) => <MenuItem key={f.name} value={f.name}>{f.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Types to Fields (Tree Mapping)</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select fields to add to the Entity. If you select an object, you cannot map its subfields individually.
            </Typography>

            <Box sx={{ mt: 2 }}>
              {renderTypeNode(schema.queryType?.name || 'Query')}
            </Box>

            <Button
              variant="contained"
              color="secondary"
              sx={{ mt: 3 }}
              onClick={() => {
                onFieldsSelected(Object.values(selectedFields));
                onOperationsSelected(selectedOperations);
              }}
            >
              Save Introspection Settings
            </Button>
          </Paper>

        </Box>
      )}
    </Box>
  );
}
