import { jest } from '@jest/globals';

jest.unstable_mockModule('../repositories/entity.repository.js', () => {
    return {
        EntityRepository: jest.fn().mockImplementation(() => {
            return {
                findEntityConfig: jest.fn().mockResolvedValue({
                    name: 'person',
                    dataSource: {
                        apiType: 'REST',
                        apiUrl: 'http://test.api/persons'
                    },
                    endpointsQueries: JSON.stringify({
                        list: { endpoint: '/persons', method: 'GET' },
                        get: { endpoint: '/persons/:id', method: 'GET' }
                    })
                } as never)
            };
        })
    };
});

jest.unstable_mockModule('../clients/rest-data.client.js', () => {
    return {
        RestDataClient: jest.fn().mockImplementation(() => {
            return {
                getData: jest.fn().mockResolvedValue([{ id: 1, name: 'John' }] as never),
                getDataById: jest.fn().mockResolvedValue({ id: 1, name: 'John' } as never)
            };
        })
    };
});

jest.unstable_mockModule('../services/orchestrator.service.js', () => {
    return {
        OrchestratorService: {
            checkAuth: jest.fn().mockResolvedValue({ allowed: true } as never)
        }
    };
});

describe('DataService', () => {
    let DataService: any;
    let service: any;
    let RestDataClientMock: any;
    let OrchestratorServiceMock: any;

    beforeAll(async () => {
        const mod = await import('../services/data.service.js');
        DataService = mod.DataService;
        const restClientMod = await import('../clients/rest-data.client.js');
        RestDataClientMock = restClientMod.RestDataClient;
        const orchServiceMod = await import('../services/orchestrator.service.js');
        OrchestratorServiceMock = orchServiceMod.OrchestratorService;
    });

    beforeEach(() => {
        service = new DataService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('getData calls client correctly with endpointsQueries', async () => {
        const result = await service.getData('person', 'user1', 'origin');
        expect(result.length).toBe(1);
        expect(result[0].name).toBe('John');
    });

    test('getDataById calls client correctly with endpointsQueries', async () => {
        const result = await service.getDataById('person', '1', 'user1', 'origin');
        expect(result).not.toBeNull();
        expect(result.name).toBe('John');
    });

    test('missing operation throws an error', async () => {
        const repoMod = await import('../repositories/entity.repository.js');
        const repoMock = repoMod.EntityRepository as jest.Mock;
        repoMock.mockImplementationOnce(() => {
            return {
                findEntityConfig: jest.fn().mockResolvedValue({
                    name: 'person',
                    dataSource: { apiType: 'REST', apiUrl: 'http://test.api/persons' },
                    endpointsQueries: JSON.stringify({ list: { endpoint: '/persons', method: 'GET' } })
                } as never)
            };
        });
        const customService = new DataService();

        let error;
        try {
            await customService.getDataById('person', '1', 'user1', 'origin');
        } catch (e) {
            error = e;
        }

        expect(error).toBeDefined();
        expect((error as Error).message).toBe("Missing 'get' query configuration");
    });

    test('getData processes chunks correctly and handles mixed allowed/denied results', async () => {
        const mockData = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' },
            { id: 4, name: 'Item 4' },
            { id: 5, name: 'Item 5' },
            { id: 6, name: 'Item 6' },
            { id: 7, name: 'Item 7' }
        ];

        RestDataClientMock.mockImplementationOnce(() => ({
            getData: jest.fn().mockResolvedValue(mockData as never)
        }));

        OrchestratorServiceMock.checkAuth.mockImplementation((userId: any, origin: any, entityName: any, action: any, config: any, item: any) => {
            return Promise.resolve({ allowed: item.id % 2 !== 0 }); // Allow odd IDs, deny even IDs
        });

        process.env.CONCURRENCY_LIMIT = '3';
        const result = await service.getData('person', 'user1', 'origin');

        expect(result.length).toBe(4);
        expect(result.map((r: any) => r.id)).toEqual([1, 3, 5, 7]);
    });
});
