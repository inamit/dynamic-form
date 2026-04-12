import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Box, Alert, Paper, CircularProgress } from '@mui/material';
import GraphQLIntrospection from './GraphQLIntrospection';
import FieldManager from './FieldManager';
import PresetsManager from './PresetsManager';
import EntityBasicInfo from './EntityBasicInfo';
import EntityAuthorizationConfig from './EntityAuthorizationConfig';
import EndpointsQueriesConfig from './EndpointsQueriesConfig';
import { useEntity } from '../../hooks/useEntities';
import { useDataSources } from '../../hooks/useDataSources';
import { entityService } from '../../services/entityService';
import type { EntityConfig, SchemaDefinition, Field } from '../../types';

export default function EntityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [submitError, setSubmitError] = useState('');

  const { dataSources, loading: loadingDataSources } = useDataSources();
  const { entity, loading: loadingEntity, error: fetchError } = useEntity(id);

  const [availableSchemas, setAvailableSchemas] = useState<string[]>([]);
  const [schemaDef, setSchemaDef] = useState<SchemaDefinition | null>(null);

  const [formData, setFormData] = useState<EntityConfig>({
    name: '',
    dataSourceId: '',
    schemaName: '',
    endpointsQueries: '',
    fields: [],
    presets: [{ name: 'Default', gridTemplate: '' }],
    defaultPresetId: null,
    auth: JSON.stringify({ view: [], create: [], edit: [], delete: [] })
  });

  // Track operations if they get updated from Introspection
  const [graphqlOperations, setGraphqlOperations] = useState<any>(null);

  useEffect(() => {
    entityService.getAvailableSchemas()
      .then(setAvailableSchemas)
      .catch(e => console.error("Failed to fetch schemas", e));
  }, []);

  useEffect(() => {
    if (entity) {
      setFormData({
        ...entity,
        endpointsQueries: entity.endpointsQueries || '',
        presets: entity.presets && entity.presets.length > 0 ? entity.presets : [{ name: 'Default', gridTemplate: '' }],
        auth: entity.auth || JSON.stringify({ view: [], create: [], edit: [], delete: [] })
      });
    }
  }, [entity]);

  useEffect(() => {
    if (formData.schemaName) {
        entityService.getSchemaDefinition(formData.schemaName)
            .then(setSchemaDef)
            .catch(e => console.error("Failed to load schema definition", e));
    } else {
        setSchemaDef(null);
    }
  }, [formData.schemaName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthChange = (action: keyof EntityConfig, value: string) => {
    setFormData({ ...formData, [action]: value });
  };

  const handleEndpointsQueriesChange = (val: string) => {
    setFormData({ ...formData, endpointsQueries: val });
  };

  const selectedDataSource = dataSources.find(ds => ds.id === Number(formData.dataSourceId));

  const handleFieldsAdded = (newFields: Field[]) => {
    const existingFieldNames = new Set(formData.fields.map((f: Field) => f.name));
    const addedFields = newFields.filter(f => !existingFieldNames.has(f.name)).map(f => ({
      ...f,
      type: f.type || 'text',
      label: f.label || f.name,
      entityConfigId: Number(id) || 0
    }));

    setFormData({ ...formData, fields: [...formData.fields, ...addedFields] });
  };

  const handleOperationsSelected = (ops: Record<string, string>) => {
    setGraphqlOperations(ops);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    try {

      let finalEndpointsQueries = formData.endpointsQueries;

      // If we configured new operations via GraphQL introspection, update the EntityConfig endpointsQueries
      if (graphqlOperations && selectedDataSource?.apiType === 'GRAPHQL') {
         const builtQueries = {
             list: graphqlOperations.list ? `query { ${graphqlOperations.list} { id } }` : '',
             get: graphqlOperations.get ? `query($id: ID!) { ${graphqlOperations.get}(id: $id) { id } }` : '',
             create: graphqlOperations.create ? `mutation($input: any!) { ${graphqlOperations.create}(input: $input) { id } }` : '',
             update: graphqlOperations.update ? `mutation($id: ID!, $input: any!) { ${graphqlOperations.update}(id: $id, input: $input) { id } }` : '',
             delete: graphqlOperations.delete ? `mutation($id: ID!) { ${graphqlOperations.delete}(id: $id) }` : '',
         };
         finalEndpointsQueries = JSON.stringify(builtQueries);
      }

      const payload: Partial<EntityConfig> = {
        name: formData.name,
        dataSourceId: Number(formData.dataSourceId),
        schemaName: formData.schemaName || null,
        endpointsQueries: finalEndpointsQueries,
        auth: formData.auth,
        presets: formData.presets.map((p: any) => {
            const presetPayload: any = {
                name: p.name,
                gridTemplate: p.gridTemplate,
                defaultValues: p.defaultValues
            };
            if (typeof p.id === 'number') {
                presetPayload.id = p.id;
            }
            return presetPayload;
        }),
        defaultPresetId: formData.defaultPresetId,
        fields: formData.fields.map((f: Field) => ({
          name: f.name,
          type: f.type,
          label: f.label,
          enumName: f.enumName || null
        }))
      };

      if (isEdit && id) {
        await entityService.update(id, payload);
      } else {
        await entityService.create(payload);
      }

      navigate('/entities');
    } catch (e: any) {
      setSubmitError(e.message || 'Failed to save entity');
    }
  };

  if (loadingEntity || loadingDataSources) return <CircularProgress />;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 10 }}>
      <Typography variant="h4">{isEdit ? 'Edit Entity' : 'New Entity'}</Typography>
      {fetchError && <Alert severity="error">{fetchError}</Alert>}
      {submitError && <Alert severity="error">{submitError}</Alert>}

      <EntityBasicInfo
        formData={formData}
        dataSources={dataSources}
        availableSchemas={availableSchemas}
        onChange={handleChange}
      />

      <EntityAuthorizationConfig
        formData={formData}
        onChange={handleAuthChange}
      />

      {selectedDataSource && (
        <EndpointsQueriesConfig
            apiType={selectedDataSource.apiType}
            entityName={formData.name}
            value={formData.endpointsQueries || ''}
            onChange={handleEndpointsQueriesChange}
        />
      )}

      {selectedDataSource && selectedDataSource.apiType === 'GRAPHQL' && (
        <Paper sx={{ p: 2 }}>
          <GraphQLIntrospection
            dataSourceUrl={selectedDataSource.apiUrl}
            dataSourceHeaders={selectedDataSource.headers || ''}
            onFieldsSelected={handleFieldsAdded}
            onOperationsSelected={handleOperationsSelected}
          />
        </Paper>
      )}

      <Paper sx={{ p: 2 }}>
        <FieldManager fields={formData.fields} onFieldsChange={(fields) => setFormData({ ...formData, fields })} />
      </Paper>

      <PresetsManager
        fields={formData.fields}
        presets={formData.presets}
        defaultPresetId={formData.defaultPresetId as any}
        schemaRequired={schemaDef?.required || []}
        onChange={(presets, defaultPresetId) => setFormData({ ...formData, presets, defaultPresetId: defaultPresetId as number | null })}
      />

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="contained" type="submit">Save Entity</Button>
        <Button variant="outlined" onClick={() => navigate('/entities')}>Cancel</Button>
      </Box>
    </Box>
  );
}
