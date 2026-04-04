import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, MenuItem, Box, Alert } from '@mui/material';
import axios from 'axios';

export default function DataSourceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    apiUrl: '',
    apiType: 'REST',
    headers: '',
    endpointsQueries: ''
  });

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          const res = await axios.get('http://localhost:3001/api/data-sources');
          const ds = res.data.find((d: any) => d.id === Number(id));
          if (ds) setFormData(ds);
        } catch (e: any) {
          setError(e.message);
        }
      };
      fetchData();
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`http://localhost:3001/api/data-sources/${id}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/data-sources', formData);
      }
      navigate('/data-sources');
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
      <Typography variant="h4">{isEdit ? 'Edit Data Source' : 'New Data Source'}</Typography>
      {error && <Alert severity="error">{error}</Alert>}

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
