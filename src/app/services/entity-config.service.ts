import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entity } from '../models/entity.model';
import { Field } from '../models/field.model';
import { HttpMethod } from '../models/data-source.model';
import { FieldType } from '../models/field-type.enum';

export interface EntityInput {
  apiName: string;
  displayName: string;
  description?: string;
  icon?: string;
  dataSource: {
    url: string;
    method: HttpMethod;
    endpoints: { name: string; path: string; method: HttpMethod; body?: Record<string, unknown> }[];
    body?: Record<string, unknown>;
  };
  fields: Omit<Field, 'id'>[];
}

export interface FieldInput {
  apiName: string;
  displayName: string;
  fieldType: FieldType;
  required?: boolean;
  options?: Field['options'];
}

@Injectable({
  providedIn: 'root',
})
export class EntityApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = '/api/entities';

  getEntities(): Observable<Entity[]> {
    return this.http.get<Entity[]>(this.BASE);
  }

  getEntity(id: string): Observable<Entity> {
    return this.http.get<Entity>(`${this.BASE}/${id}`);
  }

  createEntity(data: EntityInput): Observable<Entity> {
    return this.http.post<Entity>(this.BASE, data);
  }

  updateEntity(id: string, data: Partial<EntityInput>): Observable<Entity> {
    return this.http.put<Entity>(`${this.BASE}/${id}`, data);
  }

  deleteEntity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }

  addField(entityId: string, field: FieldInput): Observable<Field> {
    return this.http.post<Field>(`${this.BASE}/${entityId}/fields`, field);
  }

  updateField(entityId: string, fieldId: string, updates: Partial<FieldInput>): Observable<Field> {
    return this.http.put<Field>(`${this.BASE}/${entityId}/fields/${fieldId}`, updates);
  }

  deleteField(entityId: string, fieldId: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${entityId}/fields/${fieldId}`);
  }

  executeForm(entityId: string, data: Record<string, unknown>): Observable<unknown> {
    return this.http.post<unknown>(`${this.BASE}/${entityId}/execute`, { data });
  }
}
