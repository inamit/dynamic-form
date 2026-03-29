import { useEffect, useState } from 'react';
import axios from 'axios';
import 'postal';
const postal = (window as any).postal;
import type { EntityConfig } from '../types';
import {CHANNEL_NAME, TOPICS} from "../utils/topic.ts";
import { parseCoordinate, formatCoordinate } from '../utils/coordinate.ts';
import { DynamicField } from '@dynamic-form/shared-ui';

const API_BASE = (window as any).env.API_BASE_URL;

export default function EntityForm() {
  const [entity, setEntity] = useState<string | null>(null);
  const [id, setId] = useState<string | undefined>(undefined);
  const [injectedGridTemplate, setInjectedGridTemplate] = useState<string | undefined>(undefined);
  const [injectedPresetId, setInjectedPresetId] = useState<number | undefined>(undefined);
  const [activePresetId, setActivePresetId] = useState<number | undefined>(undefined);
  const [hidePresetSelector, setHidePresetSelector] = useState<boolean>(false);
  const [config, setConfig] = useState<EntityConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [coordinateFormats, setCoordinateFormats] = useState<Record<string, 'WGS84' | 'UTM'>>({});
  const [selectModeField, setSelectModeField] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [defaultValues, setDefaultValues] = useState<Record<string, any>>({});

  useEffect(() => {
    const sub = postal.subscribe({
      channel: CHANNEL_NAME,
      topic: TOPICS.LOAD_FORM,
      callback: (data: { entity: string, id?: string, gridTemplate?: string, presetId?: number, hidePresetSelector?: boolean, defaultCoordinateFormat?: 'WGS84' | 'UTM', defaultValues?: Record<string, any> }) => {
        setEntity(data.entity);
        setId(data.id);
        setInjectedGridTemplate(data.gridTemplate);
        setInjectedPresetId(data.presetId);
        setActivePresetId(data.presetId);
        setHidePresetSelector(data.hidePresetSelector || false);
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
    setValidationErrors({});
    try {
      const configRes = await axios.get(`${API_BASE}/config/${currentEntity}`);
      setConfig(configRes.data);

      try {
        // Fallback to currentEntity if schemaName is null/missing (for older configurations or the current mock hardcode endpoints structure)
        const schemaName = configRes.data.schemaName || currentEntity;
        const schemaRes = await axios.get(`${API_BASE}/schema/${schemaName}`);
        setSchema(schemaRes.data);
      } catch (err) {
        console.error(`Failed to fetch schema for ${currentEntity}`, err);
        setSchema(null);
      }


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
        // Determine the initial active preset to get default values
        let presetDefaultValues: Record<string, any> = {};
        if (!currentId) {
            let initialPresetId = injectedPresetId || configRes.data.defaultPresetId;
            if (initialPresetId && configRes.data.presets) {
                const p = configRes.data.presets.find((p: any) => p.id === initialPresetId);
                if (p && p.defaultValues) {
                    presetDefaultValues = p.defaultValues;
                }
            } else if (!initialPresetId && configRes.data.presets && configRes.data.presets.length > 0) {
                 const p = configRes.data.presets[0];
                 if (p && p.defaultValues) {
                     presetDefaultValues = p.defaultValues;
                 }
            }
        }

        // Form loaded default values take precedence over preset default values
        const mergedDefaults = { ...presetDefaultValues, ...defaultValues };

        // Initialize empty form data
        const initialData: Record<string, any> = {};
        configRes.data.fields.forEach((f: any) => {
          if (mergedDefaults[f.name] !== undefined) {
            if (f.type === 'coordinate' && typeof mergedDefaults[f.name] === 'object') {
              const loc = mergedDefaults[f.name];
              initialData[f.name] = formatCoordinate(loc.longitude, loc.latitude, formats[f.name] || 'UTM');
            } else {
              initialData[f.name] = mergedDefaults[f.name];
            }
          } else if (f.type === 'enum') {
            initialData[f.name] = ''; // Selection is deferred or initialized by the dropdown itself
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

  const validateField = (name: string, value: any, currentSchema: any) => {
    if (!currentSchema || !currentSchema.properties || !currentSchema.properties[name]) return '';

    const rules = currentSchema.properties[name];
    const isRequired = currentSchema.required?.includes(name);

    if (isRequired && (value === undefined || value === null || value === '')) {
      return 'This field is required';
    }

    if (value === undefined || value === null || value === '') return '';

    if (rules.type === 'string' && typeof value === 'string') {
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        return `Minimum length is ${rules.minLength}`;
      }
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        return `Maximum length is ${rules.maxLength}`;
      }
      if (rules.pattern !== undefined) {
        const regex = new window.RegExp(rules.pattern);
        if (!regex.test(value)) {
          return `Does not match the required pattern`;
        }
      }
    } else if (rules.type === 'number' && typeof value === 'number') {
      if (rules.minimum !== undefined && value < rules.minimum) {
        return `Minimum value is ${rules.minimum}`;
      }
      if (rules.maximum !== undefined && value > rules.maximum) {
        return `Maximum value is ${rules.maximum}`;
      }
    }

    return '';
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

    // Validate all fields before submit
    if (schema) {
      const newErrors: Record<string, string> = {};
      let hasErrors = false;
      config?.fields.forEach(f => {
        const error = validateField(f.name, formData[f.name], schema);
        if (error) {
          newErrors[f.name] = error;
          hasErrors = true;
        }
      });
      setValidationErrors(newErrors);
      if (hasErrors) return;
    }

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

  let effectiveGridTemplate = injectedGridTemplate;
  let currentActivePresetId = activePresetId;

  if (!effectiveGridTemplate) {
      if (currentActivePresetId && config.presets) {
          const preset = config.presets.find(p => p.id === currentActivePresetId);
          if (preset) effectiveGridTemplate = preset.gridTemplate;
      } else if (config.defaultPresetId && config.presets) {
          currentActivePresetId = config.defaultPresetId as number;
          const preset = config.presets.find(p => p.id === currentActivePresetId);
          if (preset) effectiveGridTemplate = preset.gridTemplate;
      } else {
          effectiveGridTemplate = config.gridTemplate; // Fallback to old field
      }
  }

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

      {!hidePresetSelector && config.presets && config.presets.length > 0 && !injectedGridTemplate && (
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <label style={{ fontWeight: 'bold' }}>Layout Preset:</label>
             <select
                value={currentActivePresetId || ''}
                onChange={(e) => {
                  const newPresetId = Number(e.target.value);
                  setActivePresetId(newPresetId);
                  const newPreset = config.presets?.find(p => p.id === newPresetId);
                  if (newPreset && !id) {
                    // When in create mode and changing the preset, override fields with default values
                    const presetDefaults = newPreset.defaultValues || {};
                    const mergedDefaults = { ...presetDefaults, ...defaultValues };
                    setFormData(prev => {
                      const updated = { ...prev };
                      config.fields.forEach(f => {
                         if (mergedDefaults[f.name] !== undefined) {
                            if (f.type === 'coordinate' && typeof mergedDefaults[f.name] === 'object') {
                               const loc = mergedDefaults[f.name];
                               updated[f.name] = formatCoordinate(loc.longitude, loc.latitude, coordinateFormats[f.name] || 'UTM');
                            } else {
                               updated[f.name] = mergedDefaults[f.name];
                            }
                         } else if (f.type === 'enum') {
                            updated[f.name] = ''; // Reset empty value
                         } else {
                            updated[f.name] = f.type === 'checkbox' ? false : (f.type === 'number' ? 0 : '');
                         }
                      });
                      return updated;
                    });
                  }
                }}
                style={{ padding: '5px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
             >
                {config.presets.map((preset) => (
                    <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
             </select>
          </div>
      )}

      <form onSubmit={handleSubmit} style={
        isGrid
          ? { display: 'grid', gridTemplateAreas: effectiveGridTemplate, gap: '20px' }
          : { display: 'flex', flexDirection: 'column', gap: '20px' }
      }>
        {config.fields.filter(field => !isGrid || validGridAreas.has(field.name)).map(field => {
          const isRequired = schema?.required?.includes(field.name);
          const errorMsg = validationErrors[field.name];

          return (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gridArea: field.name }}>
            <DynamicField
              field={field}
              value={formData[field.name]}
              onChange={(name: string, value: any) => {
                 setFormData(prev => ({ ...prev, [name]: value }));
              }}
              errorMsg={errorMsg}
              isRequired={isRequired}
              apiBaseUrl={API_BASE}
              coordinateFormat={coordinateFormats[field.name]}
              onCoordinateFormatChange={handleCoordinateFormatChange}
              isSelectMode={selectModeField === field.name}
              onSelectLocation={handleSelectLocation}
            />
          </div>
        )})}

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
