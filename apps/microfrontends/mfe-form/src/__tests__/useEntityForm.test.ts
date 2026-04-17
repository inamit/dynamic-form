/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { renderHook, act } from '@testing-library/react';
import { jest } from '@jest/globals';
const mockGetConfig = jest.fn() as jest.Mock<any>;
const mockGetAbilities = jest.fn() as jest.Mock<any>;
const mockGetSchema = jest.fn() as jest.Mock<any>;
const mockGetDataById = jest.fn() as jest.Mock<any>;
import { useEntityForm } from '../hooks/useEntityForm';
import { ApiService } from '../services/api.service';
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

jest.unstable_mockModule('../services/api.service', () => ({
  ApiService: {
    getConfig: mockGetConfig,
    getAbilities: mockGetAbilities,
    getSchema: mockGetSchema,
    getDataById: mockGetDataById,
    createData: jest.fn(),
    updateData: jest.fn()
  }
}));

describe('useEntityForm', () => {
  let mockGetConfig: any, mockGetAbilities: any, mockGetSchema: any, mockGetDataById: any, mockCreateData: any, mockUpdateData: any;

  beforeEach(() => {
    jest.clearAllMocks();
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

  it('should initialize list field with empty array', async () => {
    const mockConfig: any = { id: 1, name: 'users', fields: [{ name: 'testList', type: 'list' }] };
    const mockAbilities: any = { canCreate: true };
    const mockSchema: any = { properties: { testList: { type: 'array' } } };

    mockGetConfig.mockResolvedValue(mockConfig);
    mockGetAbilities.mockResolvedValue(mockAbilities);
    mockGetSchema.mockResolvedValue(mockSchema);

    let result: any;
    await act(async () => {
      const render = renderHook(() => useEntityForm('users'));
      result = render.result;
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.formData).toEqual({ testList: [] }); // default empty array for list
  });
});
