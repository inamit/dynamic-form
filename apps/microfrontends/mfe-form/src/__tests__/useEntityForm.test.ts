import { renderHook, act } from '@testing-library/react';
import { useEntityForm } from '../hooks/useEntityForm';
import { ApiService } from '../services/api.service';

jest.mock('../services/api.service');

describe('useEntityForm', () => {
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

    (ApiService.getConfig as jest.Mock<any>).mockResolvedValue(mockConfig);
    (ApiService.getAbilities as jest.Mock<any>).mockResolvedValue(mockAbilities);
    (ApiService.getSchema as jest.Mock<any>).mockResolvedValue(mockSchema);

    const { result } = renderHook(() => useEntityForm('users'));

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.abilities).toEqual(mockAbilities);
    expect(result.current.schema).toEqual(mockSchema);
    expect(result.current.formData).toEqual({ testField: '' }); // default empty init
  });
});
