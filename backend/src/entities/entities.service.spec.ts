import { Test, TestingModule } from '@nestjs/testing';
import { EntitiesService } from './entities.service';
import { StorageService } from '../storage/storage.service';
import { FieldType } from './field-type.enum';
import { NotFoundException } from '@nestjs/common';

const mockStorage = {
  getAll: jest.fn(() => []),
  getById: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('EntitiesService', () => {
  let service: EntitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntitiesService,
        { provide: StorageService, useValue: mockStorage },
      ],
    }).compile();
    service = module.get<EntitiesService>(EntitiesService);
    jest.clearAllMocks();
    mockStorage.getAll.mockReturnValue([]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an entity', () => {
    mockStorage.getById.mockReturnValue(undefined);
    const entity = service.create({
      apiName: 'customer',
      displayName: 'Customer',
      dataSource: { url: 'https://api.example.com', method: 'GET', endpoints: [] },
      fields: [],
    });
    expect(entity.id).toBeTruthy();
    expect(entity.apiName).toBe('customer');
    expect(mockStorage.save).toHaveBeenCalledWith(entity);
  });

  it('should throw NotFoundException when entity not found', () => {
    mockStorage.getById.mockReturnValue(undefined);
    expect(() => service.findOne('missing-id')).toThrow(NotFoundException);
  });

  it('should add a field to an entity', () => {
    const existingEntity = {
      id: 'e1', apiName: 'customer', displayName: 'Customer',
      dataSource: { url: 'https://api.example.com', method: 'GET' as const, endpoints: [] },
      fields: [],
    };
    mockStorage.getById.mockReturnValue(existingEntity);
    const field = service.addField('e1', {
      apiName: 'name', displayName: 'Name', fieldType: FieldType.STRING,
    });
    expect(field.id).toBeTruthy();
    expect(mockStorage.save).toHaveBeenCalled();
  });

  it('should delete an entity', () => {
    const existingEntity = {
      id: 'e1', apiName: 'customer', displayName: 'Customer',
      dataSource: { url: 'https://api.example.com', method: 'GET' as const, endpoints: [] },
      fields: [],
    };
    mockStorage.getById.mockReturnValue(existingEntity);
    service.remove('e1');
    expect(mockStorage.delete).toHaveBeenCalledWith('e1');
  });
});
