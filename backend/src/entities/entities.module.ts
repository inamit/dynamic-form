import { Module } from '@nestjs/common';
import { EntitiesController } from './entities.controller';
import { EntitiesService } from './entities.service';
import { EntityExecutorService } from './entity-executor.service';
import { StorageService } from '../storage/storage.service';

@Module({
  controllers: [EntitiesController],
  providers: [EntitiesService, EntityExecutorService, StorageService],
})
export class EntitiesModule {}
