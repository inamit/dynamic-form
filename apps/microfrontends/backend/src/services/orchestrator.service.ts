import axios from 'axios';

const authCache = new WeakMap<object, Record<string, string[]>>();

export class OrchestratorService {
    static async checkAuth(userId: string, origin: string, entityName: string, ability: string, config: any, data?: any) {
        let services: string[] = [];
        try {
            if (config && config.auth) {
                let parsedAuth = authCache.get(config);
                if (!parsedAuth) {
                    parsedAuth = JSON.parse(config.auth);
                    authCache.set(config, parsedAuth || {});
                }
                services = parsedAuth![ability] || [];
            }
        } catch (e) {
            console.error('Error parsing auth config', e);
            return { allowed: false, reason: 'Invalid auth configuration' };
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
