import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GridPreview } from './GridPreview';
import './App.css';

interface DataSource {
  id: number;
  name: string;
  apiUrl: string;
  apiType: string;
}

interface Field {
  name: string;
  type: string;
  label: string;
  enumName?: string;
  id?: string; // used for dnd
}

function App() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [entityName, setEntityName] = useState('');

  const [selectedDsId, setSelectedDsId] = useState<number | 'new'>('new');
  const [newDsName, setNewDsName] = useState('');
  const [newDsApiUrl, setNewDsApiUrl] = useState('');
  const [newDsApiType, setNewDsApiType] = useState('REST');

  const [fields, setFields] = useState<Field[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldEnumName, setNewFieldEnumName] = useState('');

  const [gridTemplate, setGridTemplate] = useState('');
  const [columns, setColumns] = useState(2);

  useEffect(() => {
    fetchDataSources();
  }, []);

  const fetchDataSources = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/datasource');
      setDataSources(res.data);
      if (res.data.length > 0) {
        setSelectedDsId(res.data[0].id);
      }
    } catch (e) {
      console.error('Failed to fetch data sources', e);
    }
  };

  const handleAddField = () => {
    if (!newFieldName || !newFieldLabel) return;
    setFields([...fields, {
      name: newFieldName,
      type: newFieldType,
      label: newFieldLabel,
      enumName: newFieldType === 'enum' ? newFieldEnumName : undefined,
      id: `field-${Date.now()}`
    }]);
    setNewFieldName('');
    setNewFieldLabel('');
    setNewFieldEnumName('');
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: entityName,
      dataSource: selectedDsId === 'new' ? {
        name: newDsName,
        apiUrl: newDsApiUrl,
        apiType: newDsApiType
      } : { id: selectedDsId },
      fields: fields.map(({id, ...rest}) => rest),
      gridTemplate
    };

    try {
      await axios.post('http://localhost:3001/api/config', payload);
      alert('Entity saved successfully!');
      // Reset form
      setEntityName('');
      setFields([]);
      setGridTemplate('');
    } catch (e) {
      console.error('Failed to save entity', e);
      alert('Failed to save entity');
    }
  };

  return (
    <div className="app-container">
      <h1>Management Client</h1>

      <form onSubmit={handleSubmit} className="entity-form">
        <section>
          <h2>Entity Details</h2>
          <div>
            <label>Entity Name:</label>
            <input value={entityName} onChange={e => setEntityName(e.target.value)} required />
          </div>
        </section>

        <section>
          <h2>Data Source</h2>
          <div>
            <label>Select Data Source:</label>
            <select value={selectedDsId} onChange={e => setSelectedDsId(e.target.value === 'new' ? 'new' : Number(e.target.value))}>
              {dataSources.map(ds => (
                <option key={ds.id} value={ds.id}>{ds.name} ({ds.apiUrl})</option>
              ))}
              <option value="new">-- Create New --</option>
            </select>
          </div>

          {selectedDsId === 'new' && (
            <div className="new-datasource">
              <div>
                <label>Name:</label>
                <input value={newDsName} onChange={e => setNewDsName(e.target.value)} required />
              </div>
              <div>
                <label>API URL:</label>
                <input value={newDsApiUrl} onChange={e => setNewDsApiUrl(e.target.value)} required />
              </div>
              <div>
                <label>API Type:</label>
                <select value={newDsApiType} onChange={e => setNewDsApiType(e.target.value)}>
                  <option value="REST">REST</option>
                  <option value="GRAPHQL">GraphQL</option>
                </select>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2>Fields</h2>
          <div className="add-field-form">
            <input placeholder="Name (e.g., firstName)" value={newFieldName} onChange={e => setNewFieldName(e.target.value)} />
            <input placeholder="Label (e.g., First Name)" value={newFieldLabel} onChange={e => setNewFieldLabel(e.target.value)} />
            <select value={newFieldType} onChange={e => setNewFieldType(e.target.value)}>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="checkbox">Checkbox</option>
              <option value="enum">Enum</option>
            </select>
            {newFieldType === 'enum' && (
              <input placeholder="Enum Name" value={newFieldEnumName} onChange={e => setNewFieldEnumName(e.target.value)} />
            )}
            <button type="button" onClick={handleAddField}>Add Field</button>
          </div>

          <ul className="field-list">
            {fields.map((field, i) => (
              <li key={field.id}>
                <div><strong>{field.label}</strong> ({field.name}: {field.type})</div>
                <button type="button" onClick={() => handleRemoveField(i)}>Remove</button>
              </li>
            ))}
          </ul>
        </section>

        {fields.length > 0 && (
          <section>
            <h2>Form Preview Layout</h2>
            <div>
              <label>Number of Columns:</label>
              <input type="number" min="1" max="4" value={columns} onChange={e => setColumns(Number(e.target.value))} />
            </div>
            <GridPreview
              fields={fields}
              columns={columns}
              onFieldsReorder={setFields}
              onGridTemplateChange={setGridTemplate}
            />
            <div style={{marginTop: '15px'}}>
              <strong>Generated gridTemplate:</strong>
              <pre style={{background: '#eee', padding: '10px', whiteSpace: 'pre-wrap'}}>{gridTemplate}</pre>
            </div>
          </section>
        )}

        <button type="submit" className="submit-btn">Save Entity</button>
      </form>
    </div>
  );
}

export default App;
