import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Entity } from '../entities/interfaces/entity.interface';

const DATA_FILE = path.join(process.cwd(), 'data', 'entities.json');

@Injectable()
export class StorageService implements OnModuleInit {
  private entities: Entity[] = [];

  onModuleInit(): void {
    this.load();
  }

  private load(): void {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.entities = JSON.parse(raw) as Entity[];
      }
    } catch {
      this.entities = [];
    }
  }

  private persist(): void {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(this.entities, null, 2), 'utf-8');
  }

  getAll(): Entity[] {
    return [...this.entities];
  }

  getById(id: string): Entity | undefined {
    return this.entities.find((e) => e.id === id);
  }

  save(entity: Entity): void {
    const index = this.entities.findIndex((e) => e.id === entity.id);
    if (index >= 0) {
      this.entities[index] = entity;
    } else {
      this.entities.push(entity);
    }
    this.persist();
  }

  delete(id: string): void {
    this.entities = this.entities.filter((e) => e.id !== id);
    this.persist();
  }
}
