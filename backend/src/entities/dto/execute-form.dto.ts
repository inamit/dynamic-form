import { IsObject, IsNotEmpty } from 'class-validator';

export class ExecuteFormDto {
  @IsNotEmpty()
  @IsObject()
  data!: Record<string, unknown>;
}
