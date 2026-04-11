import { TextField, MenuItem, Box, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { EntityConfig, DataSource } from '../../types';

interface Props {
  formData: EntityConfig;
  dataSources: DataSource[];
  availableSchemas: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EntityBasicInfo({ formData, dataSources, availableSchemas, onChange }: Props) {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
      <TextField label="Name" name="name" value={formData.name} onChange={onChange} required />
      <TextField
        select
        label="Schema Name"
        name="schemaName"
        value={formData.schemaName || ''}
        onChange={onChange}
      >
        <MenuItem value=""><em>None</em></MenuItem>
        {availableSchemas.map((s) => (
          <MenuItem key={s} value={s}>{s}</MenuItem>
        ))}
      </TextField>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField select label="Data Source" name="dataSourceId" value={formData.dataSourceId} onChange={onChange} required sx={{ flexGrow: 1 }}>
          {dataSources.map((ds) => (
            <MenuItem key={ds.id} value={ds.id}>{ds.name} ({ds.apiType})</MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" onClick={() => navigate('/data-sources/new')} sx={{ whiteSpace: 'nowrap' }}>
          New Data Source
        </Button>
      </Box>
    </Paper>
  );
}
