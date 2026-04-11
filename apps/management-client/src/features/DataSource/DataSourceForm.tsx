import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, MenuItem, Box, Alert, CircularProgress } from '@mui/material';
import { useDataSource } from '../../hooks/useDataSources';
import { dataSourceService } from '../../services/dataSourceService';
import type { DataSource } from '../../types';

export default function DataSourceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { dataSource, loading, error: fetchError } = useDataSource(id);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState<Partial<DataSource>>({
    name: '',
    apiUrl: '',
    apiType: 'REST',
    headers: '',
    endpointsQueries: ''
  });

  useEffect(() => {
    if (dataSource) {
      setFormData(dataSource);
    }
  }, [dataSource]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    try {
      if (isEdit && id) {
        await dataSourceService.update(id, formData);
      } else {
        await dataSourceService.create(formData);
      }
      navigate('/data-sources');
    } catch (e: any) {
      setSubmitError(e.message || 'Failed to save data source');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
      <Typography variant="h4">{isEdit ? 'Edit Data Source' : 'New Data Source'}</Typography>
      {fetchError && <Alert severity="error">{fetchError}</Alert>}
      {submitError && <Alert severity="error">{submitError}</Alert>}

      <TextField label="Name" name="name" value={formData.name} onChange={handleChange} required />
      <TextField label="API URL" name="apiUrl" value={formData.apiUrl} onChange={handleChange} required />
      <TextField select label="API Type" name="apiType" value={formData.apiType} onChange={handleChange} required>
        <MenuItem value="REST">REST</MenuItem>
        <MenuItem value="GRAPHQL">GraphQL</MenuItem>
      </TextField>
      <TextField
        label="Headers (JSON)"
        name="headers"
        value={formData.headers || ''}
        onChange={handleChange}
        multiline
        rows={3}
        placeholder='{"Authorization": "Bearer token"}'
      />
      <TextField
        label={formData.apiType === 'REST' ? 'Endpoints (JSON)' : 'Queries (JSON)'}
        name="endpointsQueries"
        value={formData.endpointsQueries || ''}
        onChange={handleChange}
        multiline
        rows={6}
        placeholder={formData.apiType === 'REST' ? '{"list": "/users", "get": "/users/:id"}' : '{"list": "query { users { id name } }", "get": "query($id: ID!) { user(id: $id) { id name } }"}'}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" type="submit">Save</Button>
        <Button variant="outlined" onClick={() => navigate('/data-sources')}>Cancel</Button>
      </Box>
    </Box>
  );
}
