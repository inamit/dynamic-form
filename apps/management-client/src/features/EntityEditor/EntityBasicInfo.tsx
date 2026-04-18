import { TextField, MenuItem, Box, Button } from '@mui/material';
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
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      gap: 3
    }}>
      <TextField
        label="Entity Name"
        name="name"
        value={formData.name}
        onChange={onChange}
        required
        fullWidth
        helperText="A unique name for this entity."
      />
      <TextField
        select
        label="Schema Name"
        name="schemaName"
        value={formData.schemaName || ''}
        onChange={onChange}
        fullWidth
        helperText="Optional underlying schema to connect with."
      >
        <MenuItem value=""><em>None</em></MenuItem>
        {availableSchemas.map((s) => (
          <MenuItem key={s} value={s}>{s}</MenuItem>
        ))}
      </TextField>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', gridColumn: { xs: '1', md: '1 / span 2' } }}>
        <TextField
          select
          label="Data Source"
          name="dataSourceId"
          value={formData.dataSourceId}
          onChange={onChange}
          required
          sx={{ flexGrow: 1 }}
          helperText="The origin data source configuration for operations."
        >
          {dataSources.map((ds) => (
            <MenuItem key={ds.id} value={ds.id}>{ds.name} ({ds.apiType})</MenuItem>
          ))}
        </TextField>
        <Button
          variant="outlined"
          onClick={() => navigate('/data-sources/new')}
          sx={{ whiteSpace: 'nowrap', height: 56 }}
        >
          New Data Source
        </Button>
      </Box>
    </Box>
  );
}
