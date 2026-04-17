/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { renderHook, act } from '@testing-library/react';
import { useEntityForm } from '../hooks/useEntityForm';
import { ApiService } from '../services/api.service';
import { jest } from '@jest/globals';
import * as postal from 'postal';

jest.mock('postal', () => {
  const mockPostal = {
    channel: jest.fn().mockReturnValue({ publish: jest.fn(), subscribe: jest.fn() }),
    publish: jest.fn(),
    subscribe: jest.fn(),
  };
  return {
    __esModule: true,
    ...mockPostal,
    default: mockPostal
  };
});

jest.mock('../services/api.service', () => ({
  ApiService: {
    getConfig: jest.fn(),
    getAbilities: jest.fn(),
    getSchema: jest.fn(),
    getDataById: jest.fn(),
    createData: jest.fn(),
    updateData: jest.fn()
  }
}));

describe('useEntityForm', () => {
  let mockGetConfig: any, mockGetAbilities: any, mockGetSchema: any, mockGetDataById: any, mockCreateData: any, mockUpdateData: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConfig = jest.spyOn(ApiService, 'getConfig').mockImplementation(jest.fn() as any);
    mockGetAbilities = jest.spyOn(ApiService, 'getAbilities').mockImplementation(jest.fn() as any);
    mockGetSchema = jest.spyOn(ApiService, 'getSchema').mockImplementation(jest.fn() as any);
    mockGetDataById = jest.spyOn(ApiService, 'getDataById').mockImplementation(jest.fn() as any);
    mockCreateData = jest.spyOn(ApiService, 'createData').mockImplementation(jest.fn() as any);
    mockUpdateData = jest.spyOn(ApiService, 'updateData').mockImplementation(jest.fn() as any);
  });

  it('should initialize with default state', async () => {
    mockGetConfig.mockResolvedValue({ fields: [], permissions: {}, schemaName: 'TestEntity' });
    mockGetAbilities.mockResolvedValue({});
    mockGetSchema.mockResolvedValue({ type: 'object', properties: {} });

    const { result } = renderHook(() => useEntityForm('TestEntity'));

    // Prevent act warnings by letting effects settle
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(result.current.loading).toBe(false);
  });

  it('should fetch new form data correctly', async () => {
    const mockConfig = { fields: [], permissions: { canCreate: true, canEdit: true }, schemaName: 'TestEntity' };
    const mockAbilities = { canCreate: true, canEdit: true };
    const mockSchema = { type: 'object', properties: {} };

    mockGetConfig.mockResolvedValue(mockConfig);
    mockGetAbilities.mockResolvedValue(mockAbilities);
    mockGetSchema.mockResolvedValue(mockSchema);

    const { result } = renderHook(() => useEntityForm('TestEntity'));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.schema).toEqual(mockSchema);
    expect(result.current.formData).toEqual({});
  });
});
