/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EntityField {
  name: string;
  type: 'text' | 'number' | 'checkbox' | 'enum' | 'coordinate' | 'list';
  label: string;
  enumName?: string;
  parentField?: string;
}

export interface Preset {
  id: number | string;
  name: string;
  gridTemplate: string;
  defaultValues?: Record<string, any>;
  listSubFields?: Record<string, string[]>;
}

export interface EntityConfig {
  id: number;
  name: string;
  apiUrl: string;
  apiType: 'REST' | 'GRAPHQL';
  fields: EntityField[];
  gridTemplate?: string;
  presets?: Preset[];
  defaultPresetId?: number | string;
}
