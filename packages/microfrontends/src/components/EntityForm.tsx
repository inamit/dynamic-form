import { useEffect, useState } from 'react';
import axios from 'axios';
import 'postal';
const postal = (window as any).postal;
import type { EntityConfig } from '../types';
import {CHANNEL_NAME, TOPICS} from "../utils/topic.ts";

const API_BASE = 'http://localhost:3001/api';

export default function EntityForm() {
  const [entity, setEntity] = useState<string | null>(null);
  const [id, setId] = useState<string | undefined>(undefined);
  const [injectedGridTemplate, setInjectedGridTemplate] = useState<string | undefined>(undefined);
  const [config, setConfig] = useState<EntityConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [enumValues, setEnumValues] = useState<Record<string, {code: string, value: string}[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sub = postal.subscribe({
      channel: CHANNEL_NAME,
      topic: TOPICS.LOAD_FORM,
      callback: (data: { entity: string, id?: string, gridTemplate?: string }) => {
        setEntity(data.entity);
        setId(data.id);
        setInjectedGridTemplate(data.gridTemplate);
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

      if (currentId) {
        const dataRes = await axios.get(`${API_BASE}/data/${currentEntity}/${currentId}`);
        setFormData(dataRes.data);
      } else {
        // Initialize empty form data
        const initialData: Record<string, any> = {};
        configRes.data.fields.forEach((f: any) => {
          if (f.type === 'enum') {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (id) {
        response = await axios.put(`${API_BASE}/data/${entity}/${id}`, formData);
      } else {
        response = await axios.post(`${API_BASE}/data/${entity}`, formData);
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
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>{id ? `Edit ${entity}` : `Create ${entity}`}</h2>
      <form onSubmit={handleSubmit} style={
        isGrid
          ? { display: 'grid', gridTemplateAreas: effectiveGridTemplate, gap: '15px' }
          : { display: 'flex', flexDirection: 'column', gap: '15px' }
      }>
        {config.fields.filter(field => !isGrid || validGridAreas.has(field.name)).map(field => (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gridArea: field.name }}>
            <label style={{ fontWeight: 'bold', marginBottom: '5px', textAlign: 'center' }}>
              {field.label}
            </label>
            {field.type === 'checkbox' ? (
              <input
                type="checkbox"
                name={field.name}
                checked={formData[field.name] || false}
                onChange={handleChange}
                style={{ alignSelf: 'center' }}
              />
            ) : field.type === 'enum' ? (
              <select
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
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
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', gridColumn: isGrid ? '1 / -1' : undefined }}>
          <button
            type="submit"
            style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
