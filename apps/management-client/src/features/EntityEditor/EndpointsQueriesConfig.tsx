import { useState, useEffect } from 'react';
import { Box, Typography, TextField, MenuItem, Paper } from '@mui/material';

interface Props {
  apiType: 'REST' | 'GRAPHQL';
  entityName: string;
  value: string;
  onChange: (val: string) => void;
}

const defaultRestOperations = (name: string) => ({
  list: { endpoint: `/${name}s`, method: 'GET' },
  get: { endpoint: `/${name}s/:id`, method: 'GET' },
  create: { endpoint: `/${name}s`, method: 'POST' },
  update: { endpoint: `/${name}s/:id`, method: 'PUT' },
  delete: { endpoint: `/${name}s/:id`, method: 'DELETE' }
});

const defaultGraphqlOperations = {
  list: '',
  get: '',
  create: '',
  update: '',
  delete: ''
};

export default function EndpointsQueriesConfig({ apiType, entityName, value, onChange }: Props) {
  const [ops, setOps] = useState<any>({});

  useEffect(() => {
    try {
      const parsed = value ? JSON.parse(value) : {};

      if (Object.keys(parsed).length === 0) {
        if (apiType === 'REST' && entityName) {
            setOps(defaultRestOperations(entityName));
            onChange(JSON.stringify(defaultRestOperations(entityName)));
        } else if (apiType === 'GRAPHQL') {
            setOps(defaultGraphqlOperations);
            onChange(JSON.stringify(defaultGraphqlOperations));
        }
      } else {
         setOps(parsed);
      }
    } catch (e) {
      setOps(apiType === 'REST' ? defaultRestOperations(entityName || 'entity') : defaultGraphqlOperations);
    }
  }, [apiType, entityName, value, onChange]);

  const handleRestChange = (op: string, field: string, val: string) => {
    const updated = { ...ops, [op]: { ...ops[op], [field]: val } };
    setOps(updated);
    onChange(JSON.stringify(updated));
  };

  const handleGraphqlChange = (op: string, val: string) => {
    const updated = { ...ops, [op]: val };
    setOps(updated);
    onChange(JSON.stringify(updated));
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Endpoints & Queries Configuration</Typography>
      <Typography variant="body2" color="text.secondary">
        Define operations required for CRUD actions.
      </Typography>

      {['list', 'get', 'create', 'update', 'delete'].map((op) => (
        <Box key={op} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
          <Typography sx={{ width: 80, fontWeight: 'bold' }}>{op.toUpperCase()}</Typography>

          {apiType === 'REST' ? (
            <>
              <TextField
                select
                size="small"
                label="Method"
                value={ops[op]?.method || 'GET'}
                onChange={(e) => handleRestChange(op, 'method', e.target.value)}
                sx={{ width: 100 }}
              >
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                label="Endpoint"
                value={ops[op]?.endpoint || ''}
                onChange={(e) => handleRestChange(op, 'endpoint', e.target.value)}
                sx={{ flexGrow: 1 }}
                required
              />
            </>
          ) : (
            <TextField
              size="small"
              label={`Query/Mutation for ${op}`}
              value={ops[op] || ''}
              onChange={(e) => handleGraphqlChange(op, e.target.value)}
              multiline
              rows={2}
              sx={{ flexGrow: 1 }}
              required
            />
          )}
        </Box>
      ))}
    </Paper>
  );
}
