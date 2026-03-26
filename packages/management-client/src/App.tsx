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
  const [newDsEndpointsQueries, setNewDsEndpointsQueries] = useState('');

  const [gqlSchema, setGqlSchema] = useState<any>(null);
  const [gqlMappings, setGqlMappings] = useState<Record<string, string>>({});

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
        apiType: newDsApiType,
        endpointsQueries: newDsEndpointsQueries ? JSON.parse(newDsEndpointsQueries) : undefined
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
              {newDsApiType === 'GRAPHQL' && (
                <div style={{ padding: '10px', backgroundColor: 'var(--grid-bg)', border: '1px solid var(--grid-border)', marginBottom: '10px', borderRadius: '5px' }}>
                  <button type="button" onClick={async () => {
                    try {
                      if (!newDsApiUrl) {
                        alert("API URL is required for introspection.");
                        return;
                      }
                      const query = `
                        query IntrospectionQuery {
                          __schema {
                            queryType { name }
                            mutationType { name }
                            types {
                              ...FullType
                            }
                          }
                        }
                        fragment FullType on __Type {
                          kind
                          name
                          fields(includeDeprecated: true) {
                            name
                            description
                            args {
                              name
                              type { ...TypeRef }
                            }
                            type {
                              ...TypeRef
                            }
                          }
                        }
                        fragment TypeRef on __Type {
                          kind
                          name
                          ofType {
                            kind
                            name
                            ofType {
                              kind
                              name
                              ofType {
                                kind
                                name
                              }
                            }
                          }
                        }
                      `;
                      const res = await axios.post(newDsApiUrl, { query });
                      const types = res.data.data.__schema.types;
                      const queryTypeName = res.data.data.__schema.queryType?.name || 'Query';
                      const mutationTypeName = res.data.data.__schema.mutationType?.name || 'Mutation';

                      const queries = types.find((t: any) => t.name === queryTypeName)?.fields || [];
                      const mutations = types.find((t: any) => t.name === mutationTypeName)?.fields || [];
                      const objectTypes = types.filter((t: any) => t.kind === 'OBJECT' && !t.name.startsWith('__') && t.name !== queryTypeName && t.name !== mutationTypeName);

                      setGqlSchema({ queries, mutations, objectTypes, types });
                      alert('Introspection successful. You can now map operations and select types for fields.');
                    } catch(err) {
                      console.error("Introspection failed:", err);
                      alert("Introspection failed. See console.");
                    }
                  }}>
                    Introspect GraphQL
                  </button>

                  {gqlSchema && (
                    <div style={{ marginTop: '15px' }}>
                      <h4>Map Operations to Queries/Mutations</h4>
                      {['list', 'get', 'create', 'update', 'delete'].map(op => (
                        <div key={op} style={{ marginBottom: '5px' }}>
                          <label style={{ display: 'inline-block', width: '80px', textTransform: 'capitalize' }}>{op}:</label>
                          <select
                            value={gqlMappings[op] || ''}
                            onChange={e => {
                              const operationName = e.target.value;
                              setGqlMappings(prev => ({ ...prev, [op]: operationName }));
                              if (!operationName) return;

                              const isQuery = ['list', 'get'].includes(op);
                              const opData = (isQuery ? gqlSchema.queries : gqlSchema.mutations).find((m: any) => m.name === operationName);
                              if (opData) {
                                const argsStr = opData.args && opData.args.length > 0
                                  ? `(${opData.args.map((a: any) => `$${a.name}: ${a.type.name || a.type.ofType?.name || a.type.ofType?.ofType?.name || 'String'}${a.type.kind==='NON_NULL' || a.type.ofType?.kind === 'NON_NULL' ? '!' : ''}`).join(', ')})`
                                  : '';
                                const callArgsStr = opData.args && opData.args.length > 0
                                  ? `(${opData.args.map((a: any) => `${a.name}: $${a.name}`).join(', ')})`
                                  : '';

                                const queryStr = `${isQuery ? 'query' : 'mutation'} ${argsStr} {\n  ${operationName}${callArgsStr} {\n    id\n  }\n}`;
                                try {
                                  const currentJson = newDsEndpointsQueries ? JSON.parse(newDsEndpointsQueries) : {};
                                  currentJson[op] = queryStr;
                                  setNewDsEndpointsQueries(JSON.stringify(currentJson, null, 2));
                                } catch (err) {
                                  setNewDsEndpointsQueries(JSON.stringify({ [op]: queryStr }, null, 2));
                                }
                              }
                            }}
                          >
                            <option value="">-- Select {['list', 'get'].includes(op) ? 'Query' : 'Mutation'} --</option>
                            {(['list', 'get'].includes(op) ? gqlSchema.queries : gqlSchema.mutations).map((m: any) => (
                              <option key={m.name} value={m.name}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                      ))}

                      <h4 style={{ marginTop: '15px' }}>Generate Fields from Type Tree</h4>
                      <div>
                        <select onChange={e => {
                          const typeName = e.target.value;
                          if (typeName) {
                            const extractFields = (tName: string, prefix = ''): Field[] => {
                              const t = gqlSchema.objectTypes.find((x: any) => x.name === tName);
                              if (!t || !t.fields) return [];
                              let extracted: Field[] = [];
                              t.fields.forEach((f: any) => {
                                const fTypeName = f.type.name || f.type.ofType?.name || f.type.ofType?.ofType?.name;
                                const isObject = gqlSchema.objectTypes.some((x: any) => x.name === fTypeName);

                                if (['String', 'Int', 'Float', 'Boolean', 'ID'].includes(fTypeName)) {
                                  let typeStr = 'text';
                                  if (fTypeName === 'Int' || fTypeName === 'Float') typeStr = 'number';
                                  if (fTypeName === 'Boolean') typeStr = 'checkbox';
                                  extracted.push({
                                    name: prefix + f.name,
                                    type: typeStr,
                                    label: f.description || (f.name.charAt(0).toUpperCase() + f.name.slice(1)),
                                    id: `field-${prefix}${f.name}-${Date.now()}`
                                  });
                                } else if (isObject) {
                                  extracted = extracted.concat(extractFields(fTypeName, `${prefix}${f.name}.`));
                                }
                              });
                              return extracted;
                            };

                            const newExtractedFields = extractFields(typeName);
                            setFields(prev => [...prev, ...newExtractedFields]);
                            e.target.value = '';
                          }
                        }}>
                          <option value="">-- Select Root Type to Add Fields Tree --</option>
                          {gqlSchema.objectTypes.map((t: any) => (
                             <option key={t.name} value={t.name}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label>Endpoints/Queries (JSON format):</label>
                <textarea
                  value={newDsEndpointsQueries}
                  onChange={e => setNewDsEndpointsQueries(e.target.value)}
                  placeholder='{"list": "query...", "get": "query...", "create": "mutation...", "update": "mutation...", "delete": "mutation..."}'
                  rows={4}
                  style={{ width: '100%', boxSizing: 'border-box', marginTop: '5px' }}
                />
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
              fields={fields as any}
              columns={columns}
              onFieldsChange={(newFields) => setFields(newFields as Field[])}
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
