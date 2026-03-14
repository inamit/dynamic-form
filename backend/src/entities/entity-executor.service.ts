import { Injectable, BadRequestException } from '@nestjs/common';
import { EntitiesService } from './entities.service';

@Injectable()
export class EntityExecutorService {
  constructor(private readonly entitiesService: EntitiesService) {}

  async execute(entityId: string, formData: Record<string, unknown>): Promise<unknown> {
    const entity = this.entitiesService.findOne(entityId);
    const { dataSource } = entity;

    if (!dataSource.url) {
      throw new BadRequestException('Entity data source URL is not configured');
    }

    const url = dataSource.url;
    const method = dataSource.method;
    const body = method !== 'GET' ? JSON.stringify({ ...dataSource.body, ...formData }) : undefined;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
      });

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        return response.json();
      }
      return { status: response.status, statusText: response.statusText };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to execute request: ${message}`);
    }
  }
}
