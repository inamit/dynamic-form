import { renderHook, act } from '@testing-library/react';
import { jest } from '@jest/globals';
const mockGetConfig = jest.fn() as jest.Mock<any>;
const mockGetAbilities = jest.fn() as jest.Mock<any>;
const mockGetSchema = jest.fn() as jest.Mock<any>;
const mockGetDataById = jest.fn() as jest.Mock<any>;

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
  let useEntityForm: any;
  beforeAll(async () => {
      const mod = await import('../hooks/useEntityForm');
      useEntityForm = mod.useEntityForm;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useEntityForm(null));
    expect(result.current.loading).toBe(false);
    expect(result.current.config).toBeNull();
    expect(result.current.formData).toEqual({});
    expect(result.current.error).toBeNull();
  });

  it('should fetch new form data correctly', async () => {
    const mockConfig: any = { id: 1, name: 'users', fields: [{ name: 'testField', type: 'text' }] };
    const mockAbilities: any = { canCreate: true };
    const mockSchema: any = { properties: { testField: { type: 'string' } } };

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
    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.abilities).toEqual(mockAbilities);
    expect(result.current.schema).toEqual(mockSchema);
    expect(result.current.formData).toEqual({ testField: '' }); // default empty init
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
