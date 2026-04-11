export interface IDataClient {
    getData(apiUrl: string, queryStr?: string, entity?: string): Promise<any>;
    getDataById(apiUrl: string, id: string, queryStr?: string, entity?: string): Promise<any>;
    createData(apiUrl: string, data: any, queryStr?: string, entity?: string, config?: any): Promise<any>;
    updateData(apiUrl: string, id: string, data: any, queryStr?: string, entity?: string, config?: any): Promise<any>;
    deleteData(apiUrl: string, id: string, queryStr?: string, entity?: string): Promise<any>;
}
