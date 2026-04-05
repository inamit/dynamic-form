import { useEffect, useState } from 'react';
import axios from 'axios';
import 'postal';
const postal = (window as any).postal;
import type { EntityConfig } from '../types';
import {CHANNEL_NAME, TOPICS} from "../utils/topic.ts";

const API_BASE = 'http://localhost:3001/api';

export default function EntityList() {
  const [entity, setEntity] = useState<string | null>(null);
  const [config, setConfig] = useState<EntityConfig | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [abilities, setAbilities] = useState({ canCreate: false, canEdit: false, canDelete: false, canView: false });

  useEffect(() => {
    const sub = postal.subscribe({
      channel: CHANNEL_NAME,
      topic: TOPICS.LOAD_LIST,
      callback: (data: { entity: string }) => {
        setEntity(data.entity);
      }
    });

    // Request initial data loading in case host rendered it recently
    postal.publish({
      channel: CHANNEL_NAME,
      topic: TOPICS.COMPONENT_READY,
      data: { type: 'list' }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (entity) {
      fetchData(entity);
    } else {
      setLoading(false);
    }
  }, [entity]);

  const fetchData = async (currentEntity: string) => {
    setLoading(true);
    try {
      const [configRes, abilitiesRes, dataRes] = await Promise.all([
        axios.get(`${API_BASE}/config/${currentEntity}`),
        axios.get(`${API_BASE}/data/${currentEntity}/abilities`),
        axios.get(`${API_BASE}/data/${currentEntity}`)
      ]);
      setConfig(configRes.data);
      setAbilities(abilitiesRes.data);
      setData(dataRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!entity) return;
    if (!confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_BASE}/data/${entity}/${id}`);
      fetchData(entity);
    } catch (err) {
      console.error('Failed to delete', err);
      alert('Delete failed');
    }
  };

  const handleCreate = () => {
    (postal as any).publish({
      channel: CHANNEL_NAME,
      topic: TOPICS.LIST_CREATE_CLICKED,
      data: { entity }
    });
  };

  const handleEdit = (id: string) => {
    (postal as any).publish({
      channel: CHANNEL_NAME,
      topic: TOPICS.LIST_EDIT_CLICKED,
      data: { entity, id }
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!config) return <div>Configuration not found for entity: {entity}</div>;

  if (!abilities.canView) {
      return <div>You do not have permission to view {entity} records.</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>{entity}s</h3>
        {abilities.canCreate && (
          <button
            onClick={handleCreate}
            style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
          >
            Create New
          </button>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>ID</th>
            {config.fields.map(field => (
              <th key={field.name} style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
                {field.label}
              </th>
            ))}
            <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{item.id}</td>
              {config.fields.map(field => {
                let displayValue = item[field.name];
                if (field.type === 'checkbox') {
                  displayValue = displayValue ? 'Yes' : 'No';
                } else if (field.type === 'coordinate' && displayValue && typeof displayValue === 'object') {
                  displayValue = `${displayValue.latitude.toFixed(6)}, ${displayValue.longitude.toFixed(6)}`;
                }
                return (
                  <td key={field.name} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                    {displayValue}
                  </td>
                );
              })}
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                {abilities.canEdit && (
                  <button
                    onClick={() => handleEdit(item.id)}
                    style={{ background: 'transparent', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', padding: 0, marginRight: '10px' }}
                  >
                    Edit
                  </button>
                )}
                {abilities.canDelete && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={config.fields.length + 2} style={{ textAlign: 'center', padding: '20px' }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
