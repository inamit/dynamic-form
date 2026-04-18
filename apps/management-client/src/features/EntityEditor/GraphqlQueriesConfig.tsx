import { Box, Typography, TextField } from '@mui/material';

interface GraphqlQueriesConfigProps {
  ops: any;
  onChange: (updatedOps: any) => void;
}

const OPERATIONS = ['list', 'get', 'create', 'update', 'delete'];

export default function GraphqlQueriesConfig({ ops, onChange }: GraphqlQueriesConfigProps) {
  const handleChange = (op: string, val: string) => {
    const updated = { ...ops, [op]: val };
    onChange(updated);
  };

  return (
    <>
      {OPERATIONS.map((op) => (
        <Box key={op} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
          <Typography sx={{ width: 80, fontWeight: 'bold' }}>{op.toUpperCase()}</Typography>
          <TextField
            size="small"
            label={`Operation Name`}
            value={ops[op] || ''}
            onChange={(e) => handleChange(op, e.target.value)}
            sx={{ flexGrow: 1 }}
          />
        </Box>
      ))}
    </>
  );
}
