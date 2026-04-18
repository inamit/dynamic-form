import { useState, useEffect } from "react";
import { Box, Button, Typography, Checkbox, FormControlLabel, Select, MenuItem, Paper, FormControl, InputLabel, TextField } from '@mui/material';
import axios from 'axios';

interface Props {
  dataSourceUrl: string;
  existingFields?: any[];
  dataSourceHeaders: string;
  onFieldsSelected: (fields: any[]) => void;
  onOperationsSelected: (ops: Record<string, string>) => void;
}

export default function GraphQLIntrospection({ dataSourceUrl, dataSourceHeaders, onFieldsSelected, onOperationsSelected, existingFields }: Props) {
  const [hasInitializedFields, setHasInitializedFields] = useState(false);
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'object'>('object');

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

  useEffect(() => {
    if (!schema || !existingFields || hasInitializedFields) return;
    const newSelected: { [key: string]: any } = {};

    // We will loosely map existing fields if they exist
    existingFields.forEach(f => {
       // Only standard mapping possible here without knowing deep paths,
       // but typically top level fields will match exactly.
       newSelected[f.name] = {
          name: f.name,
          label: f.label || f.name,
          type: f.type || 'text',
          targetType: f.type === 'list' || f.type === 'object' ? null : null // Target type logic is complex here
       };
    });

    if (Object.keys(newSelected).length > 0) {
       setSelectedFields(newSelected);
    }
    setHasInitializedFields(true);
  }, [schema, existingFields, hasInitializedFields]);


  const handleIntrospect = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:3001/api/introspect', {
        url: dataSourceUrl,
        headers: dataSourceHeaders,
        type: 'GRAPHQL'
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


  const isListType = (type: any): boolean => {
    if (!type) return false;
    if (type.kind === 'LIST') return true;
    if (type.ofType) return isListType(type.ofType);
    return false;
  };

  const inferFieldType = (baseType: any, isList: boolean) => {
    if (isList) return 'list';
    if (!baseType) return 'text';

    if (baseType.kind === 'ENUM') return 'enum';
    if (baseType.kind === 'OBJECT') {
        if (baseType.name === 'Enum') return 'enum';
        if (baseType.name === 'Location') return 'coordinate';
        return 'object';
    }

    if (baseType.name === 'String') return 'text';
    if (baseType.name === 'Boolean') return 'checkbox';
    if (baseType.name === 'Int' || baseType.name === 'Float') return 'number';

    return 'text';
  };

  const getTypeString = (type: any): string => {
    if (!type) return '';
    if (type.kind === 'NON_NULL') return getTypeString(type.ofType) + '!';
    if (type.kind === 'LIST') return '[' + getTypeString(type.ofType) + ']';
    return type.name || '';
  };

  const getTypeByName = (typeName: string) => {
    return schema?.types.find((t: any) => t.name === typeName);
  };


  const expandAllFields = (typeName: string, currentPath: string = '', depth: number = 0, currentExpanded: Record<string, boolean> = {}): Record<string, boolean> => {
    if (depth > 5) return currentExpanded;
    const typeObj = getTypeByName(typeName);
    if (!typeObj || !typeObj.fields) return currentExpanded;

    const newExpanded = { ...currentExpanded };
    typeObj.fields.forEach((field: any) => {
        const baseType = getBaseType(field.type);
          const isList = isListType(field.type);
          const fieldPath = currentPath ? `${currentPath}.${field.name}` : field.name;

        if (baseType.kind === 'OBJECT') {
            newExpanded[fieldPath] = true;
            Object.assign(newExpanded, expandAllFields(baseType.name, fieldPath, depth + 1, newExpanded));
        }
    });
    return newExpanded;
  };

    const handleExpandAll = () => {
    let allExpanded: Record<string, boolean> = {};
    if (viewMode === 'object') {
       const rootTypes = schema.types.filter((t: any) => t.kind === 'OBJECT' && !t.name.startsWith('__') && !['Query', 'Mutation', 'Subscription'].includes(t.name));
       rootTypes.forEach((t: any) => {
           allExpanded[t.name] = true;
           allExpanded = { ...allExpanded, ...expandAllFields(t.name) };
       });
    } else {
       allExpanded = expandAllFields(schema.queryType?.name || 'Query');
    }
    setExpandedNodes(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedNodes({});
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
          const isExpanded = expandedNodes[fieldPath];

          return (
            <Box key={fieldPath} sx={{ my: 1 }}>
              <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 2, bgcolor: isSelected ? 'action.selected' : 'background.paper' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => {
                        const newSelected = { ...selectedFields };

                        // Helper to recursively toggle fields
                                                const toggleFields = (tName: string, check: boolean, depth: number = 0) => {
                            if (depth > 5) return;
                            const tObj = getTypeByName(tName);
                            if (!tObj || !tObj.fields) return;

                            tObj.fields.forEach((f: any) => {
                                const fBase = getBaseType(f.type);
                                const fIsList = isListType(f.type);
                                const fPath = `\${currentPath}.\${f.name}`;

                                if (check) {
                                    newSelected[fPath] = {
                                        name: f.name,
                                        label: f.description || f.name,
                                        type: inferFieldType(fBase, fIsList),
                                        targetType: fBase.kind === 'OBJECT' || fBase.kind === 'ENUM' ? fBase.name : null
                                    };
                                    if (fBase.kind === 'OBJECT' && fBase.name !== 'Location') {
                                        toggleFields(fBase.name, check, depth + 1);
                                    }
                                } else {
                                    delete newSelected[fPath];
                                    if (fBase.kind === 'OBJECT' && fBase.name !== 'Location') {
                                        toggleFields(fBase.name, check, depth + 1);
                                    }
                                }
                            });
                        };

                        if (e.target.checked) {
                          newSelected[fieldPath] = {
                            name: field.name,
                            label: field.description || field.name,
                            type: inferFieldType(getBaseType(field.type), isListType(field.type)),
                            targetType: baseType.kind === 'OBJECT' || baseType.kind === 'ENUM' ? baseType.name : null
                          };
                          // If it's an object, auto-select subfields
                          if (baseType.kind === 'OBJECT' && baseType.name !== 'Location') {
                              toggleFields(baseType.name, true);
                          }
                        } else {
                          delete newSelected[fieldPath];
                          // If it's an object, auto-deselect subfields
                          if (baseType.kind === 'OBJECT' && baseType.name !== 'Location') {
                              toggleFields(baseType.name, false);
                          }
                        }
                        setSelectedFields(newSelected);
                      }}
                    />
                  }
                  label={`${field.name} (${getTypeString(field.type)}) - ${field.description || ''}`}
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
                      value={selectedFields[fieldPath]?.type || inferFieldType(getBaseType(field.type), isListType(field.type))}
                    label="Type"
                      disabled={!isSelected}
                    onChange={(e) => {
                      const newSelected = { ...selectedFields };
                      if (newSelected[fieldPath]) {
                        newSelected[fieldPath].targetType = e.target.value;
                          newSelected[fieldPath].type = e.target.value;
                        setSelectedFields(newSelected);
                      }
                    }}
                  >
                      <MenuItem value="text">Text</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="checkbox">Checkbox</MenuItem>
                      <MenuItem value="enum">Enum</MenuItem>
                      <MenuItem value="coordinate">Coordinate</MenuItem>
                      <MenuItem value="list">List</MenuItem>
                      <MenuItem value="object">Object</MenuItem>
                  </Select>
                </FormControl>

                {isObject && !isSelected && (
                   <Button type="button" size="small" onClick={() => toggleNode(fieldPath)}>
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

  const queryFields = schema ? getTypeByName('Query')?.fields || [] : [];
  const mutationFields = schema ? getTypeByName('Mutation')?.fields || [] : [];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">GraphQL Introspection</Typography>
      <Button type="button" variant="contained" onClick={handleIntrospect} disabled={loading} sx={{ mt: 1, mb: 2 }}>
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



            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <Button variant="outlined" size="small" onClick={() => setViewMode(viewMode === 'object' ? 'tree' : 'object')}>
                   Switch to {viewMode === 'object' ? 'Tree View' : 'Object View'}
                </Button>
                <Button variant="outlined" size="small" onClick={handleExpandAll}>Expand All</Button>
                <Button variant="outlined" size="small" onClick={handleCollapseAll}>Collapse All</Button>
            </Box>


            <Box sx={{ mt: 2 }}>
                            {viewMode === 'object' ? (
                schema.types.filter((t: any) => t.kind === 'OBJECT' && !t.name.startsWith('__') && !['Query', 'Mutation', 'Subscription'].includes(t.name)).map((t: any) => (
                  <Box key={t.name} sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                      {t.name}
                      <Button size="small" onClick={() => toggleNode(t.name)} sx={{ ml: 2 }}>{expandedNodes[t.name] ? 'Collapse' : 'Expand'}</Button>
                    </Typography>
                    {expandedNodes[t.name] && renderTypeNode(t.name)}
                  </Box>
                ))
              ) : (
                renderTypeNode(schema.queryType?.name || 'Query')
              )}
            </Box>

            <Button
              type="button"
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
