import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EntityApiService } from './entity-config.service';
import { FieldType } from '../models/field-type.enum';
import { HttpMethod } from '../models/data-source.model';
import { Entity } from '../models/entity.model';

const BASE = '/api/entities';

const mockEntity: Entity = {
  id: 'e1',
  apiName: 'customer',
  displayName: 'Customer',
  dataSource: { url: 'https://api.example.com', method: 'GET' as HttpMethod, endpoints: [] },
  fields: [],
};

describe('EntityApiService', () => {
  let service: EntityApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(EntityApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get entities', () => {
    service.getEntities().subscribe((entities) => {
      expect(entities.length).toBe(1);
      expect(entities[0].apiName).toBe('customer');
    });
    const req = httpMock.expectOne(BASE);
    expect(req.request.method).toBe('GET');
    req.flush([mockEntity]);
  });

  it('should get entity by id', () => {
    service.getEntity('e1').subscribe((entity) => {
      expect(entity.id).toBe('e1');
    });
    const req = httpMock.expectOne(`${BASE}/e1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEntity);
  });

  it('should create entity', () => {
    const input = {
      apiName: 'customer',
      displayName: 'Customer',
      dataSource: { url: 'https://api.example.com', method: 'GET' as HttpMethod, endpoints: [] },
      fields: [],
    };
    service.createEntity(input).subscribe((entity) => {
      expect(entity.id).toBe('e1');
    });
    const req = httpMock.expectOne(BASE);
    expect(req.request.method).toBe('POST');
    req.flush(mockEntity);
  });

  it('should update entity', () => {
    service.updateEntity('e1', { displayName: 'Updated' }).subscribe((entity) => {
      expect(entity.displayName).toBe('Updated');
    });
    const req = httpMock.expectOne(`${BASE}/e1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockEntity, displayName: 'Updated' });
  });

  it('should delete entity', () => {
    service.deleteEntity('e1').subscribe(() => {
      expect(true).toBeTrue();
    });
    const req = httpMock.expectOne(`${BASE}/e1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should add a field', () => {
    const field = { apiName: 'firstName', displayName: 'First Name', fieldType: FieldType.STRING };
    const returnedField = { ...field, id: 'f1' };
    service.addField('e1', field).subscribe((f) => {
      expect(f.id).toBe('f1');
    });
    const req = httpMock.expectOne(`${BASE}/e1/fields`);
    expect(req.request.method).toBe('POST');
    req.flush(returnedField);
  });

  it('should delete a field', () => {
    service.deleteField('e1', 'f1').subscribe(() => {
      expect(true).toBeTrue();
    });
    const req = httpMock.expectOne(`${BASE}/e1/fields/f1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should execute form', () => {
    const formData = { name: 'John' };
    service.executeForm('e1', formData).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });
    const req = httpMock.expectOne(`${BASE}/e1/execute`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ data: formData });
    req.flush({ success: true });
  });
});
