import { useEffect, useState } from 'react';
import axios from 'axios';
import 'postal';
const postal = (window as any).postal;
import type { EntityConfig } from '../types';
import {CHANNEL_NAME, TOPICS} from "../utils/topic.ts";
import { parseCoordinate, formatCoordinate } from '../utils/coordinate.ts';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';

const API_BASE = 'http://localhost:3001/api';

export default function EntityForm() {
  const [entity, setEntity] = useState<string | null>(null);
  const [id, setId] = useState<string | undefined>(undefined);
  const [injectedGridTemplate, setInjectedGridTemplate] = useState<string | undefined>(undefined);
  const [config, setConfig] = useState<EntityConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [enumValues, setEnumValues] = useState<Record<string, {code: string, value: string}[]>>({});
  const [loading, setLoading] = useState(true);
  const [coordinateFormats, setCoordinateFormats] = useState<Record<string, 'WGS84' | 'UTM'>>({});
  const [selectModeField, setSelectModeField] = useState<string | null>(null);

  const [defaultValues, setDefaultValues] = useState<Record<string, any>>({});

  useEffect(() => {
    const sub = postal.subscribe({
      channel: CHANNEL_NAME,
      topic: TOPICS.LOAD_FORM,
      callback: (data: { entity: string, id?: string, gridTemplate?: string, defaultCoordinateFormat?: 'WGS84' | 'UTM', defaultValues?: Record<string, any> }) => {
        setEntity(data.entity);
        setId(data.id);
        setInjectedGridTemplate(data.gridTemplate);
        if (data.defaultCoordinateFormat) {
          // Will be applied to all coordinate fields when config loads
          setCoordinateFormats(prev => ({ ...prev, _default: data.defaultCoordinateFormat! }));
        }
        if (data.defaultValues) {
          setDefaultValues(data.defaultValues);
        }
      }
    });

    postal.publish({
      channel: CHANNEL_NAME,
      topic: TOPICS.COMPONENT_READY,
      data: { type: 'form' }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!selectModeField) return;

    const locationSub = postal.subscribe({
      channel: CHANNEL_NAME,
      topic: TOPICS.LOCATION_SELECTED,
      callback: (data: { field: string, location: [number, number] }) => {
        if (data.field !== selectModeField) return;
        setFormData(prevData => {
           setCoordinateFormats(prevFormats => {
             const fmt = prevFormats[data.field] || prevFormats._default || 'UTM';
             const formatted = formatCoordinate(data.location[0], data.location[1], fmt);
             setFormData(pd => ({ ...pd, [data.field]: formatted }));
             return prevFormats;
           });
           return prevData;
        });
        setSelectModeField(null);
      }
    });

    return () => locationSub.unsubscribe();
  }, [selectModeField]);

  useEffect(() => {
    if (entity) {
      fetchConfigAndData(entity, id);
    } else {
      setLoading(false);
    }
  }, [entity, id]);

  const fetchConfigAndData = async (currentEntity: string, currentId?: string) => {
    setLoading(true);
    try {
      const configRes = await axios.get(`${API_BASE}/config/${currentEntity}`);
      setConfig(configRes.data);

      const enums: Record<string, {code: string, value: string}[]> = {};
      const enumPromises = configRes.data.fields
          .filter((f: any) => f.type === 'enum' && f.enumName)
          .map(async (f: any) => {
            try {
              const res = await axios.get(`${API_BASE}/enums/${f.enumName}`);
              enums[f.name] = res.data;
            } catch (err) {
              console.error(`Failed to fetch enum ${f.enumName}`, err);
            }
          });

      await Promise.all(enumPromises);
      setEnumValues(enums);

      // Initialize formats
      const defaultFormat = coordinateFormats._default || 'UTM';
      const formats: Record<string, 'WGS84' | 'UTM'> = { _default: defaultFormat };
      configRes.data.fields.forEach((f: any) => {
        if (f.type === 'coordinate') {
          formats[f.name] = defaultFormat as 'WGS84' | 'UTM';
        }
      });
      setCoordinateFormats(formats);

      if (currentId) {
        const dataRes = await axios.get(`${API_BASE}/data/${currentEntity}/${currentId}`);

        // Deserialize incoming coordinate data objects into strings for the text boxes
        const loadedData = dataRes.data;
        configRes.data.fields.forEach((f: any) => {
          if (f.type === 'coordinate' && loadedData[f.name]) {
            const loc = loadedData[f.name];
            if (loc && typeof loc === 'object' && loc.latitude !== undefined && loc.longitude !== undefined) {
               loadedData[f.name] = formatCoordinate(loc.longitude, loc.latitude, formats[f.name] || 'UTM');
            }
          }
        });
        setFormData(loadedData);
      } else {
        // Initialize empty form data
        const initialData: Record<string, any> = {};
        configRes.data.fields.forEach((f: any) => {
          if (defaultValues[f.name] !== undefined) {
            if (f.type === 'coordinate' && typeof defaultValues[f.name] === 'object') {
              const loc = defaultValues[f.name];
              initialData[f.name] = formatCoordinate(loc.longitude, loc.latitude, formats[f.name] || 'UTM');
            } else {
              initialData[f.name] = defaultValues[f.name];
            }
          } else if (f.type === 'enum') {
            initialData[f.name] = enumValues[f.name]?.[0]?.code || '';
          } else {
            initialData[f.name] = f.type === 'checkbox' ? false : (f.type === 'number' ? 0 : '');
          }
        });
        setFormData(initialData);
      }
    } catch (err) {
      console.error('Failed to fetch form data', err);
      (postal as any).publish({
        channel: CHANNEL_NAME,
        topic: TOPICS.FORM_LOAD_ERROR,
        data: { entity: currentEntity, error: err }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleCoordinateFormatChange = (field: string, format: 'WGS84' | 'UTM') => {
    const currentVal = formData[field];
    let newVal = currentVal;
    if (currentVal) {
      const parsed = parseCoordinate(currentVal);
      if (parsed) {
        newVal = formatCoordinate(parsed[0], parsed[1], format);
      }
    }

    setCoordinateFormats(prev => ({
      ...prev,
      [field]: format
    }));

    if (newVal !== currentVal) {
      setFormData(prev => ({
        ...prev,
        [field]: newVal
      }));
    }
  };

  const handleSelectLocation = (field: string) => {
    const isCurrentlySelecting = selectModeField === field;
    setSelectModeField(isCurrentlySelecting ? null : field);
    postal.publish({
      channel: CHANNEL_NAME,
      topic: TOPICS.SELECT_LOCATION,
      data: { field: isCurrentlySelecting ? null : field }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;

      // Map coordinate string fields back to objects for the backend payload
      const payload = { ...formData };
      if (config) {
        config.fields.forEach(f => {
          if (f.type === 'coordinate' && payload[f.name]) {
             const parsed = parseCoordinate(payload[f.name]);
             if (parsed) {
                payload[f.name] = { longitude: parsed[0], latitude: parsed[1] };
             } else {
                delete payload[f.name]; // Or set to null if the backend expects it
             }
          }
        });
      }

      if (id) {
        response = await axios.put(`${API_BASE}/data/${entity}/${id}`, payload);
      } else {
        response = await axios.post(`${API_BASE}/data/${entity}`, payload);
      }
      (postal as any).publish({
        channel: CHANNEL_NAME,
        topic: TOPICS.ENTITY_SAVED,
        data: { entity, data: response.data }
      });
    } catch (err) {
      console.error('Failed to save', err);
      (postal as any).publish({
        channel: CHANNEL_NAME,
        topic: TOPICS.ENTITY_SAVE_ERROR,
        data: { entity, error: err }
      });
    }
  };

  const handleCancel = () => {
    (postal as any).publish({
      channel: CHANNEL_NAME,
      topic: TOPICS.ENTITY_SAVE_CANCEL,
      data: { entity }
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!config) return <div>Configuration not found for entity: {entity}</div>;

  const effectiveGridTemplate = injectedGridTemplate || config.gridTemplate;
  const isGrid = !!effectiveGridTemplate;

  // Extract all valid grid areas from the template so we can hide fields not in the template
  const validGridAreas = new Set<string>();
  if (isGrid && effectiveGridTemplate) {
    const words = effectiveGridTemplate.replace(/['"]/g, '').split(/\s+/);
    words.forEach(word => {
      if (word !== '.') validGridAreas.add(word);
    });
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--bg)', color: 'var(--text)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
      <h2 style={{ textAlign: 'center', color: 'var(--text-h)' }}>{id ? `Edit ${entity}` : `Create ${entity}`}</h2>
      <form onSubmit={handleSubmit} style={
        isGrid
          ? { display: 'grid', gridTemplateAreas: effectiveGridTemplate, gap: '20px' }
          : { display: 'flex', flexDirection: 'column', gap: '20px' }
      }>
        {config.fields.filter(field => !isGrid || validGridAreas.has(field.name)).map(field => (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gridArea: field.name }}>
            <label style={{ fontWeight: '500', marginBottom: '8px', textAlign: 'left', color: 'var(--text-h)', fontSize: '14px' }}>
              {field.label}
            </label>
            {field.type === 'checkbox' ? (
              <input
                type="checkbox"
                name={field.name}
                checked={formData[field.name] || false}
                onChange={handleChange}
                style={{ alignSelf: 'flex-start' }}
              />
            ) : field.type === 'coordinate' ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={coordinateFormats[field.name] || 'UTM'}
                  onChange={(e) => handleCoordinateFormatChange(field.name, e.target.value as 'WGS84' | 'UTM')}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', width: '100px', outline: 'none' }}
                >
                  <option value="UTM">UTM</option>
                  <option value="WGS84">WGS84</option>
                </select>
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={coordinateFormats[field.name] === 'WGS84' ? 'lat, lng' : 'UTM string'}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', outline: 'none' }}
                />
                <IconButton
                  color={selectModeField === field.name ? 'error' : 'primary'}
                  title={selectModeField === field.name ? 'Cancel map selection' : 'Select location from map'}
                  onClick={() => handleSelectLocation(field.name)}
                  sx={{
                    transition: 'all 0.3s ease',
                    transform: selectModeField === field.name ? 'scale(1.05)' : 'scale(1)',
                    backgroundColor: selectModeField === field.name ? 'rgba(211, 47, 47, 0.1)' : 'transparent',
                    border: '1px solid',
                    borderColor: selectModeField === field.name ? 'rgba(211, 47, 47, 0.5)' : 'var(--border)',
                    borderRadius: '6px',
                    padding: '8px',
                    color: selectModeField === field.name ? 'inherit' : 'var(--text)'
                  }}
                >
                  {selectModeField === field.name ? (
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
              </div>
            ) : field.type === 'enum' ? (
              <select
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', outline: 'none' }}
              >
                {enumValues[field.name]?.map((opt: any) => (
                  <option key={opt.code} value={opt.code}>{opt.value}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', outline: 'none' }}
              />
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', gridColumn: isGrid ? '1 / -1' : undefined, justifyContent: 'flex-start' }}>
          <button
            type="submit"
            style={{ padding: '10px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            style={{ padding: '10px 24px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
