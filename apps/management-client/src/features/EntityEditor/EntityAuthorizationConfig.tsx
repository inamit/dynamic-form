import { TextField, MenuItem, Typography, Box } from '@mui/material';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
       <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
         Select the authorization services to use for each CRUD action. The orchestrator will evaluate the request against all selected services.
       </Typography>

       <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
         <TextField
           select
           label="View Authorization"
           value={authObject.view || []}
           onChange={(e) => handleAuthChange('view', e)}
           SelectProps={{ multiple: true }}
           fullWidth
         >
            {authOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
         </TextField>
         <TextField
           select
           label="Create Authorization"
           value={authObject.create || []}
           onChange={(e) => handleAuthChange('create', e)}
           SelectProps={{ multiple: true }}
           fullWidth
         >
            {authOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
         </TextField>
         <TextField
           select
           label="Edit Authorization"
           value={authObject.edit || []}
           onChange={(e) => handleAuthChange('edit', e)}
           SelectProps={{ multiple: true }}
           fullWidth
         >
            {authOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
         </TextField>
         <TextField
           select
           label="Delete Authorization"
           value={authObject.delete || []}
           onChange={(e) => handleAuthChange('delete', e)}
           SelectProps={{ multiple: true }}
           fullWidth
         >
            {authOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
         </TextField>
       </Box>
    </Box>
  );
}
