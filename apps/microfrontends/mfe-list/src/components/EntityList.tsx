/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import 'postal';
const postal = (window as any).postal;
import {CHANNEL_NAME, TOPICS} from "../utils/topic.ts";
import { useEntityList } from '../hooks/useEntityList';

export default function EntityList() {
  const [entity, setEntity] = useState<string | null>(null);

  const { config, data, loading, abilities, error, handleDelete } = useEntityList(entity);

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

  const handleCreate = () => {
    if (!entity) return;
    postal.publish({
        channel: CHANNEL_NAME,
        topic: TOPICS.LIST_CREATE_CLICKED,
        data: { entity }
    });
  };

  const handleEdit = (id: string) => {
      if (!entity) return;
      postal.publish({
          channel: CHANNEL_NAME,
          topic: TOPICS.LIST_EDIT_CLICKED,
          data: { entity, id }
      });
  };

  if (loading) return <div className="p-4 text-gray-500">Loading list...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!config) return <div className="p-4 text-red-500">Configuration not found.</div>;

  if (!abilities.canView) {
      return <div className="p-4 text-red-500">You do not have permission to view {entity} records.</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, textTransform: 'capitalize' }}>{entity} List</h2>
        {abilities.canCreate && (
            <button
              onClick={handleCreate}
              style={{ padding: '8px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Create {entity}
            </button>
        )}
      </div>

      {data.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          No records found.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <thead>
              <tr style={{ background: 'var(--border)', textAlign: 'left' }}>
                {config.fields.filter((f: any) => f.type !== 'coordinate').map((f: any) => (
                  <th key={f.name} style={{ padding: '12px' }}>{f.label}</th>
                ))}
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: any, i: number) => (
                <tr key={item.id || i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {config.fields.filter((f: any) => f.type !== 'coordinate').map((f: any) => (
                    <td key={f.name} style={{ padding: '12px' }}>
                      {typeof item[f.name] === 'boolean' ? (item[f.name] ? 'Yes' : 'No') : item[f.name]}
                    </td>
                  ))}
                  <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                    {abilities.canEdit && (
                        <button
                          onClick={() => handleEdit(item.id)}
                          style={{ padding: '4px 8px', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                    )}
                    {abilities.canDelete && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{ padding: '4px 8px', color: 'red', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
