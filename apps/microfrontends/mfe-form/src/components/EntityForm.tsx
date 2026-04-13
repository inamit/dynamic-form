import { useEffect, useState } from 'react';
import 'postal';
const postal = (window as any).postal;
import { CHANNEL_NAME, TOPICS } from "../utils/topic.js";
import { formatCoordinate } from '@dynamic-form/geo-utils';
import { DynamicField } from '@dynamic-form/shared-ui';
import { useEntityForm } from '../hooks/useEntityForm';

const API_BASE = 'http://localhost:3001/api';

export default function EntityForm() {
  const [entity, setEntity] = useState<string | null>(null);
  const [id, setId] = useState<string | undefined>(undefined);
  const [injectedGridTemplate, setInjectedGridTemplate] = useState<string | undefined>(undefined);
  const [injectedPresetId, setInjectedPresetId] = useState<number | undefined>(undefined);
  const [activePresetId, setActivePresetId] = useState<number | undefined>(undefined);
  const [hidePresetSelector, setHidePresetSelector] = useState<boolean>(false);
  const [selectModeField, setSelectModeField] = useState<string | null>(null);

  const [initialCoordinateFormats, setInitialCoordinateFormats] = useState<Record<string, 'WGS84' | 'UTM'>>({});
  const [initialDefaultValues, setInitialDefaultValues] = useState<Record<string, any>>({});

  const {
    config,
    formData,
    setFormData,
    loading,
    error,
    abilities,
    coordinateFormats,
    updateCoordinateFormat,
    schema,
    validationErrors,
    handleSubmit
  } = useEntityForm(entity, id, initialCoordinateFormats, initialDefaultValues, injectedPresetId);

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
          setInitialCoordinateFormats({ _default: data.defaultCoordinateFormat });
        }
        if (data.defaultValues) {
          setInitialDefaultValues(data.defaultValues);
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
    const locationSub = postal.subscribe({
      channel: CHANNEL_NAME,
      topic: TOPICS.LOCATION_SELECTED,
      callback: (data: { field: string, location: [number, number] }) => {
        const fmt = coordinateFormats[data.field] || coordinateFormats._default || 'UTM';
        const formatted = formatCoordinate(data.location[0], data.location[1], fmt);
        setFormData(data.field, formatted);
      }
    });

    return () => locationSub.unsubscribe();
  }, [coordinateFormats, setFormData]);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  const handleCancel = () => {
    (postal as any).publish({
      channel: CHANNEL_NAME,
      topic: TOPICS.ENTITY_SAVE_CANCEL,
      data: { entity }
    });
  };

  const handleCoordinateFormatChange = (field: string, format: 'WGS84' | 'UTM') => {
      updateCoordinateFormat(field, format);
  };

  const handleSelectLocation = (field: string) => {
      if (selectModeField === field) {
        setSelectModeField(null);
      } else {
        setSelectModeField(field);
      }
      postal.publish({
        channel: CHANNEL_NAME,
        topic: TOPICS.SELECT_LOCATION,
        data: { field }
      });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!config) return <div>Configuration not found for entity: {entity}</div>;

  if (id && !abilities.canEdit) {
      return <div>You do not have permission to edit this {entity}.</div>;
  }
  if (!id && !abilities.canCreate) {
      return <div>You do not have permission to create a {entity}.</div>;
  }

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
                    const presetDefaults = newPreset.defaultValues || {};
                    const mergedDefaults = { ...presetDefaults, ...initialDefaultValues };
                    config.fields.forEach(f => {
                         if (mergedDefaults[f.name] !== undefined) {
                            if (f.type === 'coordinate' && typeof mergedDefaults[f.name] === 'object') {
                               const loc = mergedDefaults[f.name];
                               setFormData(f.name, formatCoordinate(loc.longitude, loc.latitude, coordinateFormats[f.name] || 'UTM'));
                            } else {
                               setFormData(f.name, mergedDefaults[f.name]);
                            }
                         } else if (f.type === 'enum') {
                            setFormData(f.name, '');
                         } else {
                            setFormData(f.name, f.type === 'checkbox' ? false : (f.type === 'number' ? 0 : ''));
                         }
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

      <form onSubmit={onFormSubmit} style={
        isGrid
          ? { display: 'grid', gridTemplateAreas: effectiveGridTemplate, gap: '20px' }
          : { display: 'flex', flexDirection: 'column', gap: '20px' }
      }>
        {config.fields
          .filter(field => !field.parentField)
          .filter(field => !isGrid || validGridAreas.has(field.name))
          .map(field => {
          const isRequired = schema?.required?.includes(field.name);
          const errorMsg = validationErrors[field.name];
          const subFields = config.fields.filter(f => f.parentField === field.name);

          return (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gridArea: field.name }}>
            <DynamicField
              field={field}
              value={formData[field.name]}
              onChange={(name: any, value: any) => {
                 setFormData(name, value);
              }}
              errorMsg={errorMsg}
              isRequired={isRequired}
              apiBaseUrl={API_BASE}
              coordinateFormat={coordinateFormats[field.name]}
              onCoordinateFormatChange={handleCoordinateFormatChange}
              isSelectMode={selectModeField === field.name}
              onSelectLocation={handleSelectLocation}
              subFields={subFields}
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
