export interface EntityField {
  name: string;
  type: 'text' | 'number' | 'checkbox';
  label: string;
}

export interface EntityConfig {
  id: number;
  name: string;
  apiUrl: string;
  apiType: 'REST' | 'GRAPHQL';
  gridTemplate?: string;
  fields: EntityField[];
}
