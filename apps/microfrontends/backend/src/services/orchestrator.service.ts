import axios from 'axios';

export class OrchestratorService {
    static async checkAuth(userId: string, origin: string, entityName: string, ability: string, config: any, data?: any) {
        let services: string[] = [];
        try {
            if (config.auth) {
                const parsedAuth = JSON.parse(config.auth);
                if (ability === 'view' && parsedAuth.view) services = parsedAuth.view;
                if (ability === 'create' && parsedAuth.create) services = parsedAuth.create;
                if (ability === 'edit' && parsedAuth.edit) services = parsedAuth.edit;
                if (ability === 'delete' && parsedAuth.delete) services = parsedAuth.delete;
            }
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
