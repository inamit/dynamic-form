import { FieldType } from '../field-type.enum';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface DropdownOption { label: string; value: string | number }

export interface Field {
  id: string;
  apiName: string;
  displayName: string;
  fieldType: FieldType;
  required?: boolean;
  options?: DropdownOption[];
}

export interface Endpoint {
  name: string;
  path: string;
  method: HttpMethod;
  body?: Record<string, unknown>;
}

export interface DataSource {
  url: string;
  method: HttpMethod;
  endpoints: Endpoint[];
  body?: Record<string, unknown>;
}

export interface Entity {
  id: string;
  apiName: string;
  displayName: string;
  description?: string;
  icon?: string;
  dataSource: DataSource;
  fields: Field[];
}
