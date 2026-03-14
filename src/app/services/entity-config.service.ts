import { Injectable, signal, computed } from '@angular/core';
import { Entity } from '../models/entity.model';
import { Field } from '../models/field.model';
import { v4 as uuidv4 } from 'uuid';

export type EntityInput = Omit<Entity, 'id' | 'fields'> & { fields: Omit<Field, 'id'>[] };

@Injectable({
  providedIn: 'root',
})
export class EntityConfigService {
  private readonly entitiesSignal = signal<Entity[]>([]);

  readonly entities = computed(() => this.entitiesSignal());

  addEntity(entity: EntityInput): Entity {
    const newEntity: Entity = {
      ...entity,
      id: uuidv4(),
      fields: entity.fields.map((f) => ({ ...f, id: uuidv4() })),
    };
    this.entitiesSignal.update((entities) => [...entities, newEntity]);
    return newEntity;
  }

  updateEntity(id: string, updates: Partial<EntityInput>): Entity | undefined {
    let updatedEntity: Entity | undefined;
    this.entitiesSignal.update((entities) =>
      entities.map((e) => {
        if (e.id === id) {
          const fields: Field[] = updates.fields
            ? updates.fields.map((f) => ({ ...f, id: uuidv4() }))
            : e.fields;
          updatedEntity = { ...e, ...updates, fields };
          return updatedEntity;
        }
        return e;
      })
    );
    return updatedEntity;
  }

  deleteEntity(id: string): void {
    this.entitiesSignal.update((entities) => entities.filter((e) => e.id !== id));
  }

  getEntityById(id: string): Entity | undefined {
    return this.entitiesSignal().find((e) => e.id === id);
  }

  addField(entityId: string, field: Omit<Field, 'id'>): Field | undefined {
    const newField: Field = { ...field, id: uuidv4() };
    let added = false;
    this.entitiesSignal.update((entities) =>
      entities.map((e) => {
        if (e.id === entityId) {
          added = true;
          return { ...e, fields: [...e.fields, newField] };
        }
        return e;
      })
    );
    return added ? newField : undefined;
  }

  updateField(entityId: string, fieldId: string, updates: Partial<Omit<Field, 'id'>>): Field | undefined {
    let updatedField: Field | undefined;
    this.entitiesSignal.update((entities) =>
      entities.map((e) => {
        if (e.id === entityId) {
          return {
            ...e,
            fields: e.fields.map((f) => {
              if (f.id === fieldId) {
                updatedField = { ...f, ...updates };
                return updatedField;
              }
              return f;
            }),
          };
        }
        return e;
      })
    );
    return updatedField;
  }

  deleteField(entityId: string, fieldId: string): void {
    this.entitiesSignal.update((entities) =>
      entities.map((e) => {
        if (e.id === entityId) {
          return { ...e, fields: e.fields.filter((f) => f.id !== fieldId) };
        }
        return e;
      })
    );
  }
}
