import { useState, useEffect } from 'react';
import { Typography, Paper } from '@mui/material';
import RestEndpointsConfig from './RestEndpointsConfig';
import GraphqlQueriesConfig from './GraphqlQueriesConfig';

interface Props {
  apiType: 'REST' | 'GRAPHQL';
  entityName: string;
  value: string;
  onChange: (val: string) => void;
}

const defaultRestOperations = (name: string) => ({
  list: { endpoint: `/${name}`, method: 'GET' },
  get: { endpoint: `/${name}/:id`, method: 'GET' },
  create: { endpoint: `/${name}`, method: 'POST' },
  update: { endpoint: `/${name}/:id`, method: 'PUT' },
  delete: { endpoint: `/${name}/:id`, method: 'DELETE' }
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

  const handleChange = (updatedOps: any) => {
    setOps(updatedOps);
    onChange(JSON.stringify(updatedOps));
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Endpoints & Queries Configuration</Typography>
      <Typography variant="body2" color="text.secondary">
        Define operations required for CRUD actions.
      </Typography>

      {apiType === 'REST' ? (
        <RestEndpointsConfig ops={ops} onChange={handleChange} />
      ) : (
        <GraphqlQueriesConfig ops={ops} onChange={handleChange} />
      )}
    </Paper>
  );
}
