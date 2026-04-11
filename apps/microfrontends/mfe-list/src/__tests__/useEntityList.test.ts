import { renderHook, act } from '@testing-library/react';
import { useEntityList } from '../hooks/useEntityList';
import { ApiService } from '../services/api.service';

jest.mock('../services/api.service');

describe('useEntityList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useEntityList(null));
    expect(result.current.loading).toBe(false);
    expect(result.current.config).toBeNull();
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should fetch data when entity is provided', async () => {
    const mockConfig: any = { id: 1, name: 'users' };
    const mockAbilities: any = { canView: true };
    const mockData = [{ id: 1, name: 'test' }];

    (ApiService.getConfig as jest.Mock<any>).mockResolvedValue(mockConfig);
    (ApiService.getAbilities as jest.Mock<any>).mockResolvedValue(mockAbilities);
    (ApiService.getData as jest.Mock<any>).mockResolvedValue(mockData);

    const { result } = renderHook(() => useEntityList('users'));

    expect(result.current.loading).toBe(true);

    // Wait for state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.abilities).toEqual(mockAbilities);
    expect(result.current.data).toEqual(mockData);
  });
});
