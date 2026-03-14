import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { StorageService } from '../storage/storage.service';
import { Entity, Field } from './interfaces/entity.interface';
import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';

@Injectable()
export class EntitiesService {
  constructor(private readonly storage: StorageService) {}

  findAll(): Entity[] {
    return this.storage.getAll();
  }

  findOne(id: string): Entity {
    const entity = this.storage.getById(id);
    if (!entity) throw new NotFoundException(`Entity ${id} not found`);
    return entity;
  }

  create(dto: CreateEntityDto): Entity {
    const entity: Entity = {
      ...dto,
      id: randomUUID(),
      fields: dto.fields.map((f) => ({ ...f, id: randomUUID() })),
    };
    this.storage.save(entity);
    return entity;
  }

  update(id: string, dto: UpdateEntityDto): Entity {
    const existing = this.findOne(id);
    const fields: Field[] = dto.fields
      ? dto.fields.map((f) => {
          // Preserve ID for fields that already exist (matched by apiName)
          const existingField = existing.fields.find(
            (ef) => ef.apiName === f.apiName,
          );
          return { ...f, id: existingField ? existingField.id : randomUUID() };
        })
      : existing.fields;
    const updated: Entity = { ...existing, ...dto, id, fields };
    this.storage.save(updated);
    return updated;
  }

  remove(id: string): void {
    this.findOne(id);
    this.storage.delete(id);
  }

  addField(entityId: string, fieldData: Omit<Field, 'id'>): Field {
    const entity = this.findOne(entityId);
    const field: Field = { ...fieldData, id: randomUUID() };
    entity.fields.push(field);
    this.storage.save(entity);
    return field;
  }

  updateField(
    entityId: string,
    fieldId: string,
    updates: Partial<Omit<Field, 'id'>>,
  ): Field {
    const entity = this.findOne(entityId);
    const fieldIndex = entity.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex < 0)
      throw new NotFoundException(`Field ${fieldId} not found`);
    entity.fields[fieldIndex] = { ...entity.fields[fieldIndex], ...updates };
    this.storage.save(entity);
    return entity.fields[fieldIndex];
  }

  removeField(entityId: string, fieldId: string): void {
    const entity = this.findOne(entityId);
    const exists = entity.fields.some((f) => f.id === fieldId);
    if (!exists) throw new NotFoundException(`Field ${fieldId} not found`);
    entity.fields = entity.fields.filter((f) => f.id !== fieldId);
    this.storage.save(entity);
  }
}
