import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, MenuItem, Box, Alert, Paper } from '@mui/material';
import axios from 'axios';
import GraphQLIntrospection from './GraphQLIntrospection';
import FieldManager from './FieldManager';
import GridPreview from './GridPreview/GridPreview';

export default function EntityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [error, setError] = useState('');
  const [dataSources, setDataSources] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    name: '',
    dataSourceId: '',
    gridTemplate: '',
    fields: []
  });

  // Track operations if they get updated from Introspection
  const [graphqlOperations, setGraphqlOperations] = useState<any>(null);

  useEffect(() => {
    fetchDataSources();
    if (isEdit) {
      fetchEntity();
    }
  }, [id, isEdit]);

  const fetchDataSources = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/data-sources');
      setDataSources(res.data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const fetchEntity = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/config/${id}`);
      setFormData(res.data);
    } catch (e: any) {
      setError(e.message);
    }
  };

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
        gridTemplate: formData.gridTemplate,
        fields: formData.fields.map((f: any) => ({
          name: f.name,
          type: f.type,
          label: f.label,
          enumName: f.enumName || null
        }))
      };

      if (isEdit) {
        await axios.put(`http://localhost:3001/api/config/${id}`, payload);
      } else {
        await axios.post('http://localhost:3001/api/config/new', payload);
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

         await axios.put(`http://localhost:3001/api/data-sources/${selectedDataSource.id}`, updatedDataSource);
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
        <TextField select label="Data Source" name="dataSourceId" value={formData.dataSourceId} onChange={handleChange} required>
          {dataSources.map((ds) => (
            <MenuItem key={ds.id} value={ds.id}>{ds.name} ({ds.apiType})</MenuItem>
          ))}
        </TextField>
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

      <Paper sx={{ p: 2, minHeight: 400 }}>
        <Typography variant="h6" gutterBottom>Grid Layout Preview</Typography>
        <GridPreview
          fields={formData.fields}
          gridTemplate={formData.gridTemplate}
          onLayoutChange={(gridTemplate) => setFormData({ ...formData, gridTemplate })}
        />
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="contained" onClick={handleSubmit}>Save Entity</Button>
        <Button variant="outlined" onClick={() => navigate('/entities')}>Cancel</Button>
      </Box>
    </Box>
  );
}
