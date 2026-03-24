export interface EntityField {
  name: string;
  type: 'text' | 'number' | 'checkbox' | 'enum';
  label: string;
  enumName?: string;
}

export interface EntityConfig {
  id: number;
  name: string;
  apiUrl: string;
  apiType: 'REST' | 'GRAPHQL';
  fields: EntityField[];
}
