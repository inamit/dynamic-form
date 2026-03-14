import { TestBed } from '@angular/core/testing';
import { EntityConfigService } from './entity-config.service';
import { FieldType } from '../models/field-type.enum';
import { HttpMethod } from '../models/data-source.model';

describe('EntityConfigService', () => {
  let service: EntityConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntityConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no entities', () => {
    expect(service.entities()).toEqual([]);
  });

  it('should add an entity', () => {
    const entity = service.addEntity({
      apiName: 'customer',
      displayName: 'Customer',
      dataSource: { url: 'https://api.example.com', method: 'GET' as HttpMethod, endpoints: [] },
      fields: [],
    });
    expect(service.entities().length).toBe(1);
    expect(entity.id).toBeTruthy();
    expect(entity.apiName).toBe('customer');
  });

  it('should update an entity', () => {
    const entity = service.addEntity({
      apiName: 'customer',
      displayName: 'Customer',
      dataSource: { url: 'https://api.example.com', method: 'GET' as HttpMethod, endpoints: [] },
      fields: [],
    });
    service.updateEntity(entity.id, { displayName: 'Updated Customer' });
    expect(service.getEntityById(entity.id)?.displayName).toBe('Updated Customer');
  });

  it('should delete an entity', () => {
    const entity = service.addEntity({
      apiName: 'customer',
      displayName: 'Customer',
      dataSource: { url: 'https://api.example.com', method: 'GET' as HttpMethod, endpoints: [] },
      fields: [],
    });
    service.deleteEntity(entity.id);
    expect(service.entities().length).toBe(0);
  });

  it('should add a field to an entity', () => {
    const entity = service.addEntity({
      apiName: 'customer',
      displayName: 'Customer',
      dataSource: { url: 'https://api.example.com', method: 'GET' as HttpMethod, endpoints: [] },
      fields: [],
    });
    const field = service.addField(entity.id, {
      apiName: 'firstName',
      displayName: 'First Name',
      fieldType: FieldType.STRING,
    });
    expect(field).toBeTruthy();
    expect(service.getEntityById(entity.id)?.fields.length).toBe(1);
  });

  it('should delete a field from an entity', () => {
    const entity = service.addEntity({
      apiName: 'customer',
      displayName: 'Customer',
      dataSource: { url: 'https://api.example.com', method: 'GET' as HttpMethod, endpoints: [] },
      fields: [],
    });
    const field = service.addField(entity.id, {
      apiName: 'firstName',
      displayName: 'First Name',
      fieldType: FieldType.STRING,
    })!;
    service.deleteField(entity.id, field.id);
    expect(service.getEntityById(entity.id)?.fields.length).toBe(0);
  });
});
