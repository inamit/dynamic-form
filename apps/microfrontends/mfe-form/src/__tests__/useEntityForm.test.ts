import { renderHook, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { ApiService } from '../services/api.service';
import { useEntityForm } from '../hooks/useEntityForm';

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
  let useEntityForm: any;
  beforeAll(async () => {
      const mod = await import('../hooks/useEntityForm');
      useEntityForm = mod.useEntityForm;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (ApiService.getConfig as jest.Mock).mockReset();
    (ApiService.getAbilities as jest.Mock).mockReset();
    (ApiService.getSchema as jest.Mock).mockReset();
    (ApiService.getDataById as jest.Mock).mockReset();
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

    (ApiService.getConfig as jest.Mock<any>).mockResolvedValue(mockConfig);
    (ApiService.getAbilities as jest.Mock<any>).mockResolvedValue(mockAbilities);
    (ApiService.getSchema as jest.Mock<any>).mockResolvedValue(mockSchema);

    let result: any;
    let unmount: any;

    await act(async () => {
      const render = renderHook(() => useEntityForm('users'));
      result = render.result;
      unmount = render.unmount;
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.abilities).toEqual(mockAbilities);
    expect(result.current.schema).toEqual(mockSchema);
    expect(result.current.formData).toEqual({ testField: '' }); // default empty init
  });
});
