import axios from 'axios';

// ⚡ Bolt Optimization: Use a WeakMap to cache parsed JSON configurations.
// This prevents O(N) parsing overhead when checking authorization in a loop
// for lists of data, while avoiding memory leaks.
// We cache a stringified representation of `config.auth` to ensure we bust the cache
// if the auth string changes while the `config` object reference remains the same.
const parsedAuthCache = new WeakMap<object, { authString: string, parsed: any }>();

export class OrchestratorService {
    static async checkAuth(userId: string, origin: string, entityName: string, ability: string, config: any, data?: any) {
        let services: string[] = [];
        try {
            if (config.auth) {
                let cacheEntry = parsedAuthCache.get(config);
                if (!cacheEntry || cacheEntry.authString !== config.auth) {
                    cacheEntry = { authString: config.auth, parsed: JSON.parse(config.auth) };
                    parsedAuthCache.set(config, cacheEntry);
                }

                // Return a shallow copy to prevent shared reference mutations from
                // poisoning the cache for future authorization checks.
                services = [...(cacheEntry.parsed[ability] || [])];
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
