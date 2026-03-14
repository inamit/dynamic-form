import { FieldType } from './field-type.enum';

export interface DropdownOption {
  label: string;
  value: string | number;
}

export interface Field {
  id: string;
  apiName: string;
  displayName: string;
  fieldType: FieldType;
  required?: boolean;
  options?: DropdownOption[];
}
