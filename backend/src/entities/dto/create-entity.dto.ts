import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from '../field-type.enum';

export enum HttpMethodEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export class DropdownOptionDto {
  @IsString() label!: string;
  value!: string | number;
}

export class CreateFieldDto {
  @IsString() apiName!: string;
  @IsString() displayName!: string;
  @IsEnum(FieldType) fieldType!: FieldType;
  @IsOptional() @IsBoolean() required?: boolean;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DropdownOptionDto)
  options?: DropdownOptionDto[];
}

export class EndpointDto {
  @IsString() name!: string;
  @IsString() path!: string;
  @IsEnum(HttpMethodEnum) method!: HttpMethodEnum;
  @IsOptional() body?: Record<string, unknown>;
}

export class DataSourceDto {
  @IsString() url!: string;
  @IsEnum(HttpMethodEnum) method!: HttpMethodEnum;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EndpointDto)
  endpoints!: EndpointDto[];
  @IsOptional() body?: Record<string, unknown>;
}

export class CreateEntityDto {
  @IsString() apiName!: string;
  @IsString() displayName!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() icon?: string;
  @ValidateNested() @Type(() => DataSourceDto) dataSource!: DataSourceDto;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFieldDto)
  fields!: CreateFieldDto[];
}
