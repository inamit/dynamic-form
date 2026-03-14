import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { CreateEntityDto, CreateFieldDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';
import { ExecuteFormDto } from './dto/execute-form.dto';
import { EntityExecutorService } from './entity-executor.service';

@Controller('entities')
export class EntitiesController {
  constructor(
    private readonly entitiesService: EntitiesService,
    private readonly executorService: EntityExecutorService,
  ) {}

  @Get()
  findAll() {
    return this.entitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entitiesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateEntityDto) {
    return this.entitiesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEntityDto) {
    return this.entitiesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    this.entitiesService.remove(id);
  }

  @Post(':id/fields')
  addField(@Param('id') entityId: string, @Body() dto: CreateFieldDto) {
    return this.entitiesService.addField(entityId, dto);
  }

  @Put(':id/fields/:fieldId')
  updateField(
    @Param('id') entityId: string,
    @Param('fieldId') fieldId: string,
    @Body() dto: Partial<CreateFieldDto>,
  ) {
    return this.entitiesService.updateField(entityId, fieldId, dto);
  }

  @Delete(':id/fields/:fieldId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeField(
    @Param('id') entityId: string,
    @Param('fieldId') fieldId: string,
  ) {
    this.entitiesService.removeField(entityId, fieldId);
  }

  @Post(':id/execute')
  execute(@Param('id') entityId: string, @Body() dto: ExecuteFormDto) {
    return this.executorService.execute(entityId, dto.data);
  }
}
