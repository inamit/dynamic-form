import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Box, Alert, CircularProgress, Stepper, Step, StepLabel, Card, Divider } from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
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
import type {Enums} from "@dynamic-form/shared-ui";

export default function EntityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [submitError, setSubmitError] = useState('');

  const { dataSources, loading: loadingDataSources } = useDataSources();
  const { entity, loading: loadingEntity, error: fetchError } = useEntity(id);

  const [availableSchemas, setAvailableSchemas] = useState<string[]>([]);
  const [schemaDef, setSchemaDef] = useState<SchemaDefinition | null>(null);
  const [enums, setEnums] = useState<Enums>({});

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
  const [hasPromptedOverwrite, setHasPromptedOverwrite] = useState(false);

  useEffect(() => {
    entityService.getAvailableSchemas()
      .then(setAvailableSchemas)
      .catch(e => console.error("Failed to fetch schemas", e));
  }, []);

  useEffect(() => {
    entityService.getEnums()
        .then(setEnums)
        .catch(e => console.error("Failed to fetch enums", e));
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

    // Suggest to overwrite if endpointsQueries already has content
    if (!hasPromptedOverwrite && formData.endpointsQueries && formData.endpointsQueries !== '{}') {
       setHasPromptedOverwrite(true);
       if (window.confirm('Do you want to overwrite your existing Endpoints & Queries configuration with the newly selected GraphQL operations?')) {
          const builtQueries = {
             list: ops.list ? `query { \${ops.list} { id } }` : '',
             get: ops.get ? `query($id: ID!) { \${ops.get}(id: $id) { id } }` : '',
             create: ops.create ? `mutation($input: any!) { \${ops.create}(input: $input) { id } }` : '',
             update: ops.update ? `mutation($id: ID!, $input: any!) { \${ops.update}(id: $id, input: $input) { id } }` : '',
             delete: ops.delete ? `mutation($id: ID!) { \${ops.delete}(id: $id) }` : '',
          };
          setFormData(prev => ({ ...prev, endpointsQueries: JSON.stringify(builtQueries) }));
       }
    } else if (!formData.endpointsQueries || formData.endpointsQueries === '{}') {
        const builtQueries = {
             list: ops.list ? `query { \${ops.list} { id } }` : '',
             get: ops.get ? `query($id: ID!) { \${ops.get}(id: $id) { id } }` : '',
             create: ops.create ? `mutation($input: any!) { \${ops.create}(input: $input) { id } }` : '',
             update: ops.update ? `mutation($id: ID!, $input: any!) { \${ops.update}(id: $id, input: $input) { id } }` : '',
             delete: ops.delete ? `mutation($id: ID!) { \${ops.delete}(id: $id) }` : '',
        };
        setFormData(prev => ({ ...prev, endpointsQueries: JSON.stringify(builtQueries) }));
    }


    setGraphqlOperations(ops);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setSubmitError('');
    try {

      let finalEndpointsQueries = formData.endpointsQueries;

      // Operations are now built and applied immediately in handleOperationsSelected

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
                defaultValues: p.defaultValues,
                listSubFields: p.listSubFields
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
          enumName: f.enumName || null,
          parentField: f.parentField || null
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

  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Metadata',
    'Authorization',
    'Introspection',
    'Endpoints & Queries',
    'Fields',
    'Presets'
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  if (loadingEntity || loadingDataSources) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress color="primary" />
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom>Basic Information</Typography>
            <EntityBasicInfo
              formData={formData}
              dataSources={dataSources}
              availableSchemas={availableSchemas}
              onChange={handleChange}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom>Role-Based Access Control</Typography>
            <EntityAuthorizationConfig
              formData={formData}
              onChange={handleAuthChange}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom>Schema Introspection</Typography>
            {selectedDataSource && selectedDataSource.apiType === 'GRAPHQL' ? (
              <GraphQLIntrospection
                dataSourceUrl={selectedDataSource.apiUrl}
                dataSourceHeaders={selectedDataSource.headers || ''}
                existingFields={formData.fields}
                onFieldsSelected={handleFieldsAdded}
                onOperationsSelected={handleOperationsSelected}
              />
            ) : (
              <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                Introspection is only available for GraphQL data sources.
              </Alert>
            )}
          </Box>
        );
      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom>API Endpoints & Queries</Typography>
            {selectedDataSource ? (
              <EndpointsQueriesConfig
                  apiType={selectedDataSource.apiType}
                  entityName={formData.name}
                  value={formData.endpointsQueries || ''}
                  onChange={handleEndpointsQueriesChange}
              />
            ) : (
              <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>
                Please select a Data Source in the Metadata step first.
              </Alert>
            )}
          </Box>
        );
      case 4:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
             <Typography variant="h6" color="primary" gutterBottom>Field Management</Typography>
             <FieldManager fields={formData.fields} onFieldsChange={(fields) => setFormData({ ...formData, fields })} />
          </Box>
        );
      case 5:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
             <Typography variant="h6" color="primary" gutterBottom>UI Presets & Layouts</Typography>
             <PresetsManager
              fields={formData.fields}
              enums={enums}
              presets={formData.presets}
              defaultPresetId={formData.defaultPresetId as any}
              schemaRequired={schemaDef?.required || []}
              onChange={(presets, defaultPresetId) => setFormData({ ...formData, presets, defaultPresetId: defaultPresetId as number | null })}
            />
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pb: 10, maxWidth: 1200, margin: '0 auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight="bold">
          {isEdit ? `Edit Entity: ${entity?.name || ''}` : 'Create New Entity'}
        </Typography>
        <Button variant="text" onClick={() => navigate('/entities')} color="inherit">
          Cancel
        </Button>
      </Box>

      {fetchError && <Alert severity="error" sx={{ borderRadius: 2 }}>{fetchError}</Alert>}
      {submitError && <Alert severity="error" sx={{ borderRadius: 2 }}>{submitError}</Alert>}

      <Card elevation={0} sx={{ p: { xs: 2, md: 4 } }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                onClick={() => setActiveStep(index)}
                sx={{ cursor: 'pointer' }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Divider sx={{ mb: 4, opacity: 0.5 }} />

        <Box sx={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>

          <Box sx={{ flexGrow: 1 }}>
            {getStepContent(activeStep)}
          </Box>

          <Divider sx={{ my: 4, opacity: 0.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
            <Button
              type="button"
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  type="button"
                  onClick={handleSubmit}
                  endIcon={<SaveIcon />}
                  disabled={!formData.name || !formData.dataSourceId}
                >
                  Save Entity
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  disabled={activeStep === 0 && (!formData.name || !formData.dataSourceId)}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
