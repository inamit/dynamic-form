import { renderHook, act } from '@testing-library/react';
import { jest } from '@jest/globals';

const mockApiService = {
  getConfig: jest.fn<any>(),
  getAbilities: jest.fn<any>(),
  getData: jest.fn<any>(),
  deleteData: jest.fn<any>()
};

jest.unstable_mockModule('../services/api.service', () => ({
  ApiService: mockApiService
}));

describe('useEntityList', () => {
  let useEntityList: any;
  let ApiService: any;
  beforeAll(async () => {
      const mod = await import('../hooks/useEntityList');
      useEntityList = mod.useEntityList;
      ApiService = (await import('../services/api.service')).ApiService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    ApiService.getConfig = jest.fn();
    ApiService.getAbilities = jest.fn();
    ApiService.getData = jest.fn();
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

    ApiService.getConfig.mockResolvedValue(mockConfig);
    ApiService.getAbilities.mockResolvedValue(mockAbilities);
    ApiService.getData.mockResolvedValue(mockData);

    let result: any;
    let unmount: any;

    await act(async () => {
      const render = renderHook(() => useEntityList('users'));
      result = render.result;
      unmount = render.unmount;
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.abilities).toEqual(mockAbilities);
    expect(result.current.data).toEqual(mockData);

    unmount();
  });
});
