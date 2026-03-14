export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface Endpoint {
  name: string;
  path: string;
  method: HttpMethod;
  body?: Record<string, unknown>;
}

export interface DataSource {
  url: string;
  method: HttpMethod;
  endpoints: Endpoint[];
  body?: Record<string, unknown>;
}
