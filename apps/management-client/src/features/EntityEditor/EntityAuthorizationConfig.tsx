import { TextField, MenuItem, Typography, Paper } from '@mui/material';
import type { EntityConfig } from '../../types';

interface Props {
  formData: EntityConfig;
  onChange: (action: keyof EntityConfig, value: string) => void;
}

export default function EntityAuthorizationConfig({ formData, onChange }: Props) {
  const authOptions = ['custom', 'external1', 'external2'];

  const getAuthObject = () => {
    try {
      return JSON.parse(formData.auth);
    } catch {
      return { view: [], create: [], edit: [], delete: [] };
    }
  };

  const handleAuthChange = (action: 'view' | 'create' | 'edit' | 'delete', e: any) => {
     const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
     const currentAuth = getAuthObject();
     currentAuth[action] = value;
     onChange('auth', JSON.stringify(currentAuth));
  };

  const authObject = getAuthObject();

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
       <Typography variant="h6">Authorization Configuration</Typography>
       <Typography variant="body2" color="textSecondary">Select the authorization services to use for each action. The orchestrator will check all selected services.</Typography>

       <TextField select label="View Authorization" value={authObject.view || []} onChange={(e) => handleAuthChange('view', e)} SelectProps={{ multiple: true }}>
          {authOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
       </TextField>
       <TextField select label="Create Authorization" value={authObject.create || []} onChange={(e) => handleAuthChange('create', e)} SelectProps={{ multiple: true }}>
          {authOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
       </TextField>
       <TextField select label="Edit Authorization" value={authObject.edit || []} onChange={(e) => handleAuthChange('edit', e)} SelectProps={{ multiple: true }}>
          {authOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
       </TextField>
       <TextField select label="Delete Authorization" value={authObject.delete || []} onChange={(e) => handleAuthChange('delete', e)} SelectProps={{ multiple: true }}>
          {authOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
       </TextField>
    </Paper>
  );
}
