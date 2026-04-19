import axios from 'axios';

export class OrchestratorService {
    // ⚡ Bolt Optimization: Cache parsed auth config to avoid repeated JSON.parse overhead
    // during bulk data authorization (O(n) operations -> O(1) operations).
    // Using WeakMap ensures we don't leak memory if the config object is garbage collected.
    private static parsedAuthCache = new WeakMap<any, any>();

    static async checkAuth(userId: string, origin: string, entityName: string, ability: string, config: any, data?: any) {
        let services: string[] = [];
        try {
            if (config.auth) {
                let parsedAuth = OrchestratorService.parsedAuthCache.get(config);
                if (!parsedAuth) {
                    parsedAuth = JSON.parse(config.auth);
                    OrchestratorService.parsedAuthCache.set(config, parsedAuth);
                }
                services = parsedAuth[ability] || [];
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
