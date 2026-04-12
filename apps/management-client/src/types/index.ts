export interface Field {
  name: string;
  type: string;
  label: string;
  enumName?: string | null;
  entityConfigId?: number;
}

export interface Preset {
  id?: number | string;
  name: string;
  gridTemplate: string;
  defaultValues?: Record<string, any>;
}

export interface EntityConfig {
  id?: number;
  name: string;
  dataSourceId: number | string;
  schemaName?: string | null;
  endpointsQueries?: string;
  fields: Field[];
  presets: Preset[];
  defaultPresetId?: number | string | null;
  authView: string;
  authCreate: string;
  authEdit: string;
  authDelete: string;
}

export interface DataSource {
  id: number;
  name: string;
  apiType: 'REST' | 'GRAPHQL';
  apiUrl: string;
  headers?: string;
}

export interface SchemaDefinition {
  required?: string[];
  [key: string]: any;
}

export interface SitePermission {
  id: number;
  origin: string;
  entityName: string;
  ability: string;
}

export interface UserPermission {
  id: number;
  userId: string;
  entityName: string;
  ability: string;
  geography?: string | null;
  fieldValue?: string | null;
}
