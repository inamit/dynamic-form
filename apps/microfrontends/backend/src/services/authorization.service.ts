import { EntityRepository } from '../repositories/entity.repository.js';
import { OrchestratorService } from './orchestrator.service.js';

export class AuthorizationService {
    private entityRepository: EntityRepository;

    constructor() {
        this.entityRepository = new EntityRepository();
    }

    async getEntityAbilities(entityName: string, userId: string, origin: string) {
        const config = await this.entityRepository.findEntityConfig(entityName);
        if (!config) throw new Error('Entity not found');

        const [viewAuth, createAuth, editAuth, deleteAuth] = await Promise.all([
            OrchestratorService.checkAuth(userId, origin, entityName, 'view', config),
            OrchestratorService.checkAuth(userId, origin, entityName, 'create', config),
            OrchestratorService.checkAuth(userId, origin, entityName, 'edit', config),
            OrchestratorService.checkAuth(userId, origin, entityName, 'delete', config)
        ]);

        return {
            canView: viewAuth.allowed,
            canCreate: createAuth.allowed,
            canEdit: editAuth.allowed,
            canDelete: deleteAuth.allowed
        };
    }
}
