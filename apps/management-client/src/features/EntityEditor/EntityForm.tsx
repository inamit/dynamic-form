import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, MenuItem, Box, Alert, Paper } from '@mui/material';
import axios from 'axios';
import GraphQLIntrospection from './GraphQLIntrospection';
import FieldManager from './FieldManager';
import PresetsManager from './PresetsManager';

export default function EntityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [error, setError] = useState('');
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [availableSchemas, setAvailableSchemas] = useState<string[]>([]);
  const [schemaDef, setSchemaDef] = useState<any>(null);

  const [formData, setFormData] = useState<any>({
    name: '',
    dataSourceId: '',
    schemaName: '',
    fields: [],
    presets: [{ name: 'Default', gridTemplate: '' }],
    defaultPresetId: null
  });

  // Track operations if they get updated from Introspection
  const [graphqlOperations, setGraphqlOperations] = useState<any>(null);

const fetchSchemas = async () => {
    try {
      const res = await axios.get(`${(window as any).env.API_BASE_URL}/schemas`);
      setAvailableSchemas(res.data);
    } catch (e) {
      console.error("Failed to fetch schemas", e);
    }
  };
const fetchDataSources = async () => {
    try {
      const res = await axios.get(`${(window as any).env.API_BASE_URL}/data-sources`);
      setDataSources(res.data);
    } catch (e: any) {
      setError(e.message);
    }
  };
const fetchEntity = async () => {
    try {
      const res = await axios.get(`${(window as any).env.API_BASE_URL}/config/id/${id}`);

      const config = res.data;
      if (!config.presets || config.presets.length === 0) {
          // Backward compatibility if presets are missing
          config.presets = [{ name: 'Default', gridTemplate: config.gridTemplate || '' }];
          config.defaultPresetId = null;
      }

      setFormData(config);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    }
  };

  useEffect(() => {
    fetchDataSources();
    fetchSchemas();
    if (isEdit) {
      fetchEntity();
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (formData.schemaName) {
        axios.get(`${(window as any).env.API_BASE_URL}/schema/${formData.schemaName}`)
            .then(res => setSchemaDef(res.data))
            .catch(e => console.error("Failed to load schema definition", e));
    } else {
        setSchemaDef(null);
    }
  }, [formData.schemaName]);




  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectedDataSource = dataSources.find(ds => ds.id === formData.dataSourceId);

  const handleFieldsAdded = (newFields: any[]) => {
    const existingFieldNames = new Set(formData.fields.map((f: any) => f.name));
    const addedFields = newFields.filter(f => !existingFieldNames.has(f.name)).map(f => ({
      ...f,
      type: f.type || 'text',
      label: f.label || f.name,
      entityConfigId: Number(id) || 0
    }));

    setFormData({ ...formData, fields: [...formData.fields, ...addedFields] });
  };

  const handleOperationsSelected = (ops: Record<string, string>) => {
    setGraphqlOperations(ops);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        dataSourceId: Number(formData.dataSourceId),
        schemaName: formData.schemaName || null,
        presets: formData.presets.map((p: any) => {
            const presetPayload: any = {
                name: p.name,
                gridTemplate: p.gridTemplate,
                defaultValues: p.defaultValues
            };
            // Only send id if it's a number (from DB), not for new ones
            if (typeof p.id === 'number') {
                presetPayload.id = p.id;
            }
            return presetPayload;
        }),
        defaultPresetId: formData.defaultPresetId,
        fields: formData.fields.map((f: any) => ({
          name: f.name,
          type: f.type,
          label: f.label,
          enumName: f.enumName || null
        }))
      };

      if (isEdit) {
        await axios.put(`${(window as any).env.API_BASE_URL}/config/${id}`, payload);
      } else {
        await axios.post(`${(window as any).env.API_BASE_URL}/config/new`, payload);
      }

      // If we configured new operations via GraphQL introspection, update the DataSource
      if (graphqlOperations && selectedDataSource) {
         // Build the query strings based on operations (simple standard structure for demo)
         const builtQueries = {
             list: graphqlOperations.list ? `query { ${graphqlOperations.list} { id } }` : '',
             get: graphqlOperations.get ? `query($id: ID!) { ${graphqlOperations.get}(id: $id) { id } }` : '',
             create: graphqlOperations.create ? `mutation($input: any!) { ${graphqlOperations.create}(input: $input) { id } }` : '',
             update: graphqlOperations.update ? `mutation($id: ID!, $input: any!) { ${graphqlOperations.update}(id: $id, input: $input) { id } }` : '',
             delete: graphqlOperations.delete ? `mutation($id: ID!) { ${graphqlOperations.delete}(id: $id) }` : '',
         };

         const updatedDataSource = {
            ...selectedDataSource,
            endpointsQueries: JSON.stringify(builtQueries)
         };

         await axios.put(`${(window as any).env.API_BASE_URL}/data-sources/${selectedDataSource.id}`, updatedDataSource);
      }

      navigate('/entities');
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 10 }}>
      <Typography variant="h4">{isEdit ? 'Edit Entity' : 'New Entity'}</Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
        <TextField label="Name" name="name" value={formData.name} onChange={handleChange} required />
        <TextField
          select
          label="Schema Name"
          name="schemaName"
          value={formData.schemaName || ''}
          onChange={handleChange}
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {availableSchemas.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField select label="Data Source" name="dataSourceId" value={formData.dataSourceId} onChange={handleChange} required sx={{ flexGrow: 1 }}>
            {dataSources.map((ds) => (
              <MenuItem key={ds.id} value={ds.id}>{ds.name} ({ds.apiType})</MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={() => navigate('/data-sources/new')} sx={{ whiteSpace: 'nowrap' }}>
            New Data Source
          </Button>
        </Box>
      </Paper>

      {selectedDataSource && selectedDataSource.apiType === 'GRAPHQL' && (
        <Paper sx={{ p: 2 }}>
          <GraphQLIntrospection
            dataSourceUrl={selectedDataSource.apiUrl}
            dataSourceHeaders={selectedDataSource.headers}
            onFieldsSelected={handleFieldsAdded}
            onOperationsSelected={handleOperationsSelected}
          />
        </Paper>
      )}

      <Paper sx={{ p: 2 }}>
        <FieldManager fields={formData.fields} onFieldsChange={(fields) => setFormData({ ...formData, fields })} />
      </Paper>

      <PresetsManager
        fields={formData.fields}
        presets={formData.presets}
        defaultPresetId={formData.defaultPresetId}
        schemaRequired={schemaDef?.required || []}
        onChange={(presets, defaultPresetId) => setFormData({ ...formData, presets, defaultPresetId })}
      />

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="contained" onClick={handleSubmit}>Save Entity</Button>
        <Button variant="outlined" onClick={() => navigate('/entities')}>Cancel</Button>
      </Box>
    </Box>
  );
}
