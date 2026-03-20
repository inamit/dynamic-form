import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import type { EntityConfig } from '../types';

const API_BASE = 'http://localhost:3001/api';

export default function EntityList() {
  const { entity } = useParams<{ entity: string }>();
  const [config, setConfig] = useState<EntityConfig | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [entity]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const configRes = await axios.get(`${API_BASE}/config/${entity}`);
      setConfig(configRes.data);

      const dataRes = await axios.get(`${API_BASE}/data/${entity}`);
      setData(dataRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_BASE}/data/${entity}/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete', err);
      alert('Delete failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!config) return <div>Configuration not found for entity: {entity}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>{entity}s</h3>
        <Link
          to={`/${entity}/form`}
          style={{ padding: '8px 16px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}
        >
          Create New
        </Link>
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
              {config.fields.map(field => (
                <td key={field.name} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                  {field.type === 'checkbox' ? (item[field.name] ? 'Yes' : 'No') : item[field.name]}
                </td>
              ))}
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                <Link to={`/${entity}/form/${item.id}`} style={{ marginRight: '10px' }}>Edit</Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  Delete
                </button>
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
