/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
export interface EntityField {
  name: string;
  type: 'text' | 'number' | 'checkbox' | 'enum' | 'coordinate';
  label: string;
  enumName?: string;
}

export interface Preset {
  id: number | string;
  name: string;
  gridTemplate: string;
  defaultValues?: Record<string, any>;
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
