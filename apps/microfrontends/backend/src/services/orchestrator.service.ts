import axios from 'axios';

export class OrchestratorService {
    static async checkAuth(userId: string, origin: string, entityName: string, ability: string, config: any, data?: any) {
        let services = [];
        try {
            if (ability === 'view' && config.authView) services = JSON.parse(config.authView);
            if (ability === 'create' && config.authCreate) services = JSON.parse(config.authCreate);
            if (ability === 'edit' && config.authEdit) services = JSON.parse(config.authEdit);
            if (ability === 'delete' && config.authDelete) services = JSON.parse(config.authDelete);
        } catch (e) {
            console.error('Error parsing auth config', e);
        }

        try {
            const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:3005/api/authorize';
            const res = await axios.post(orchestratorUrl, {
                userId,
                origin,
                entityName,
                ability,
                data,
                services
            });
            return res.data;
        } catch (error: any) {
            console.error('Error checking auth via orchestrator:', error.message);
            return { allowed: false, reason: 'Orchestrator unavailable' };
        }
    }
}
