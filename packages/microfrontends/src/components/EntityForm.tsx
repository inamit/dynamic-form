import {useEffect, useState} from 'react';
import axios from 'axios';
import type {EntityConfig} from '../types';

const API_BASE = 'http://localhost:3001/api';

export default function EntityForm({entity, id}: { entity: string; id?: string }) {

    const [config, setConfig] = useState<EntityConfig | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfigAndData();
    }, [entity, id]);

    const fetchConfigAndData = async () => {
        setLoading(true);
        try {
            const configRes = await axios.get(`${API_BASE}/config/${entity}`);
            setConfig(configRes.data);

            if (id) {
                const dataRes = await axios.get(`${API_BASE}/data/${entity}/${id}`);
                setFormData(dataRes.data);
            } else {
                // Initialize empty form data
                const initialData: Record<string, any> = {};
                configRes.data.fields.forEach((f: any) => {
                    initialData[f.name] = f.type === 'checkbox' ? false : (f.type === 'number' ? 0 : '');
                });
                setFormData(initialData);
            }
        } catch (err) {
            console.error('Failed to fetch form data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (id) {
                await axios.put(`${API_BASE}/data/${entity}/${id}`, formData);
            } else {
                await axios.post(`${API_BASE}/data/${entity}`, formData);
            }
        } catch (err) {
            console.error('Failed to save', err);
            alert('Save failed');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!config) return <div>Configuration not found for entity: {entity}</div>;

    return (
        <div style={{maxWidth: '600px', margin: '0 auto', background: '#f9f9f9', padding: '20px', borderRadius: '8px'}}>
            <h2>{id ? `Edit ${entity}` : `Create ${entity}`}</h2>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                {config.fields.map(field => (
                    <div key={field.name} style={{display: 'flex', flexDirection: 'column'}}>
                        <label style={{fontWeight: 'bold', marginBottom: '5px'}}>
                            {field.label}
                        </label>
                        {field.type === 'checkbox' ? (
                            <input
                                type="checkbox"
                                name={field.name}
                                checked={formData[field.name] || false}
                                onChange={handleChange}
                                style={{width: 'fit-content'}}
                            />
                        ) : (
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleChange}
                                style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
                            />
                        )}
                    </div>
                ))}

                <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <button
                        type="submit"
                        style={{
                            padding: '10px 20px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        style={{
                            padding: '10px 20px',
                            background: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
