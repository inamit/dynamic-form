import React from 'react';
import { TextField, Checkbox, FormControlLabel, Select, MenuItem, Typography, Box, IconButton } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';

export interface FieldConfig {
  name: string;
  type: 'text' | 'number' | 'checkbox' | 'enum' | 'coordinate' | string;
  label?: string;
  enumName?: string;
}

export interface DynamicFieldProps {
  field: FieldConfig;
  value: any;
  onChange: (fieldName: string, value: any) => void;
  errorMsg?: string;
  isRequired?: boolean;
  enumValues?: { code: string; value: string }[];
  apiBaseUrl?: string; // If provided, the field will attempt to fetch enum values dynamically
  coordinateFormat?: 'WGS84' | 'UTM';
  onCoordinateFormatChange?: (fieldName: string, format: 'WGS84' | 'UTM') => void;
  isSelectMode?: boolean;
  onSelectLocation?: (fieldName: string) => void;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  errorMsg,
  isRequired,
  enumValues: propEnumValues,
  apiBaseUrl,
  coordinateFormat = 'UTM',
  onCoordinateFormatChange,
  isSelectMode,
  onSelectLocation
}) => {
  const [fetchedEnumValues, setFetchedEnumValues] = React.useState<{ code: string; value: string }[]>([]);

  React.useEffect(() => {
    if (field.type === 'enum' && field.enumName && apiBaseUrl && !propEnumValues) {
      fetch(`${apiBaseUrl}/enums/${field.enumName}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFetchedEnumValues(data);
          }
        })
        .catch(err => console.error(`Failed to fetch enum ${field.enumName}`, err));
    }
  }, [field.type, field.enumName, apiBaseUrl, propEnumValues]);

  const enumValues = propEnumValues || fetchedEnumValues;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let val: any = e.target.value;
    if (field.type === 'number') {
      val = val === '' ? '' : Number(val);
    }
    onChange(field.name, val);
  };

  const commonStyle = {
    background: 'var(--bg, transparent)',
    color: 'var(--text, inherit)',
    borderRadius: '6px',
    border: errorMsg ? '1px solid red' : '1px solid var(--border, #ccc)',
    outline: 'none',
    width: '100%'
  };

  const labelProps = {
    style: { fontWeight: 500, marginBottom: '8px', textAlign: 'left' as const, color: 'var(--text-h, inherit)', fontSize: '14px' }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography {...labelProps}>
        {field.label || field.name} {isRequired && <span style={{ color: 'red' }}>*</span>}
      </Typography>

      {field.type === 'checkbox' ? (
        <FormControlLabel
          control={
            <Checkbox
              checked={value || false}
              onChange={(e) => onChange(field.name, e.target.checked)}
              sx={{ alignSelf: 'flex-start', color: 'var(--text, inherit)' }}
            />
          }
          label=""
          sx={{ margin: 0 }}
        />
      ) : field.type === 'coordinate' ? (
        <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Select
            value={coordinateFormat}
            onChange={(e) => onCoordinateFormatChange && onCoordinateFormatChange(field.name, e.target.value as 'WGS84' | 'UTM')}
            sx={{ ...commonStyle, width: 100, height: '40px' }}
          >
            <MenuItem value="UTM">UTM</MenuItem>
            <MenuItem value="WGS84">WGS84</MenuItem>
          </Select>
          <TextField
            value={value || ''}
            onChange={handleChange}
            placeholder={coordinateFormat === 'WGS84' ? 'lat, lng' : 'UTM string'}
            sx={{ flex: 1, ...commonStyle }}
            InputProps={{ sx: { height: '40px', color: 'inherit' } }}
          />
          {onSelectLocation && (
            <IconButton
              color={isSelectMode ? 'error' : 'primary'}
              title={isSelectMode ? 'Cancel map selection' : 'Select location from map'}
              onClick={() => onSelectLocation(field.name)}
              sx={{
                transition: 'all 0.3s ease',
                transform: isSelectMode ? 'scale(1.05)' : 'scale(1)',
                backgroundColor: isSelectMode ? 'rgba(211, 47, 47, 0.1)' : 'transparent',
                border: '1px solid',
                borderColor: isSelectMode ? 'rgba(211, 47, 47, 0.5)' : 'var(--border, #ccc)',
                borderRadius: '6px',
                padding: '8px',
                color: isSelectMode ? 'inherit' : 'var(--text, inherit)'
              }}
            >
              {isSelectMode ? (
                <CloseIcon sx={{
                  animation: 'spin 0.3s linear',
                  '@keyframes spin': { '0%': { transform: 'rotate(-90deg)' }, '100%': { transform: 'rotate(0)' } }
                }} />
              ) : (
                <LocationOnIcon sx={{
                  animation: 'drop 0.3s ease-out',
                  '@keyframes drop': { '0%': { transform: 'translateY(-10px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } }
                }} />
              )}
            </IconButton>
          )}
        </Box>
      ) : field.type === 'enum' ? (
        <Select
          value={value || ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          displayEmpty
          sx={{ ...commonStyle, height: '40px' }}
        >
          {enumValues.map((opt) => (
            <MenuItem key={opt.code} value={opt.code}>{opt.value}</MenuItem>
          ))}
        </Select>
      ) : (
        <TextField
          type={field.type === 'number' ? 'number' : 'text'}
          value={value !== undefined ? value : ''}
          onChange={handleChange}
          sx={{ ...commonStyle }}
          InputProps={{ sx: { height: '40px', color: 'inherit' } }}
        />
      )}
      {errorMsg && <Typography sx={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errorMsg}</Typography>}
    </Box>
  );
};
