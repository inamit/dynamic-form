import { Box, Typography, TextField, MenuItem } from '@mui/material';

interface RestEndpointsConfigProps {
  ops: any;
  onChange: (updatedOps: any) => void;
}

const OPERATIONS = ['list', 'get', 'create', 'update', 'delete'];
const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export default function RestEndpointsConfig({ ops, onChange }: RestEndpointsConfigProps) {
  const handleChange = (op: string, field: string, val: string) => {
    const updated = { ...ops, [op]: { ...ops[op], [field]: val } };
    onChange(updated);
  };

  return (
    <>
      {OPERATIONS.map((op) => (
        <Box key={op} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
          <Typography sx={{ width: 80, fontWeight: 'bold' }}>{op.toUpperCase()}</Typography>
          <TextField
            select
            size="small"
            label="Method"
            value={ops[op]?.method || 'GET'}
            onChange={(e) => handleChange(op, 'method', e.target.value)}
            sx={{ flexGrow: 1 }}
          >
            {METHODS.map(m => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>
        </Box>
      ))}
    </>
  );
}
