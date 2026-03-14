import { DataSource } from './data-source.model';
import { Field } from './field.model';

export interface Entity {
  id: string;
  apiName: string;
  displayName: string;
  description?: string;
  icon?: string;
  dataSource: DataSource;
  fields: Field[];
}
