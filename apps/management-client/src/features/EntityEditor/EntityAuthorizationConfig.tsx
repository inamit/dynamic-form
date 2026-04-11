import { TextField, MenuItem, Typography, Paper } from '@mui/material';
import type { EntityConfig } from '../../types';

interface Props {
  formData: EntityConfig;
  onChange: (action: keyof EntityConfig, value: string) => void;
}

export default function EntityAuthorizationConfig({ formData, onChange }: Props) {
  const authOptions = ['custom', 'external1', 'external2'];

  const handleAuthChange = (action: keyof EntityConfig, e: any) => {
     const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
     onChange(action, JSON.stringify(value));
  };

  const getAuthArray = (action: keyof EntityConfig) => {
     try { return JSON.parse(formData[action] as string); } catch { return []; }
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
       <Typography variant="h6">Authorization Configuration</Typography>
       <Typography variant="body2" color="textSecondary">Select the authorization services to use for each action. The orchestrator will check all selected services.</Typography>

       <TextField select label="View Authorization" value={getAuthArray('authView')} onChange={(e) => handleAuthChange('authView', e)} SelectProps={{ multiple: true }}>
          {authOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
       </TextField>
       <TextField select label="Create Authorization" value={getAuthArray('authCreate')} onChange={(e) => handleAuthChange('authCreate', e)} SelectProps={{ multiple: true }}>
          {authOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
       </TextField>
       <TextField select label="Edit Authorization" value={getAuthArray('authEdit')} onChange={(e) => handleAuthChange('authEdit', e)} SelectProps={{ multiple: true }}>
          {authOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
       </TextField>
       <TextField select label="Delete Authorization" value={getAuthArray('authDelete')} onChange={(e) => handleAuthChange('authDelete', e)} SelectProps={{ multiple: true }}>
          {authOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
       </TextField>
    </Paper>
  );
}
