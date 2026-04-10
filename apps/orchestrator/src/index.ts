import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as countryCoder from '@rapideditor/country-coder';
import { parseCoordinate } from '@dynamic-form/geo-utils';

const app = express();
app.use(cors());
app.use(express.json());

const SERVICE_URLS: Record<string, string> = {
    custom: process.env.CUSTOM_PERMISSIONS_URL || 'http://localhost:3002/api/check',
    external1: process.env.EXTERNAL1_URL || 'http://localhost:3003/api/check',
    external2: process.env.EXTERNAL2_URL || 'http://localhost:3004/api/check'
};

const WIKIDATA_MAPPING: Record<string, string> = JSON.parse(process.env.WIKIDATA_MAPPING || '{}');

app.post('/api/authorize', async (req, res) => {
    let { userId, origin, entityName, ability, data, services } = req.body;

    console.log(`Authorize request: User=${userId}, Origin=${origin}, Entity=${entityName}, Ability=${ability}, Services=${services}`);

    if (!services || services.length === 0) {
        // If no authorization services configured, default to allowed or denied based on your policy.
        // We'll default to allowed if no specific auth layer is configured.
        return res.json({ allowed: true });
    }

    // Geographic calculation
    let territory: string | null = null;
    let dataCoord: [number, number] | null = null;

    if (data) {
        // Find a coordinate in the data
        for (const val of Object.values(data)) {
            if (val && typeof val === 'object' && 'latitude' in (val as any) && 'longitude' in (val as any)) {
                 dataCoord = [ (val as any).longitude, (val as any).latitude ];
                 break;
            } else if (typeof val === 'string') {
                 const parsed = parseCoordinate(val);
                 if (parsed) {
                     dataCoord = parsed;
                     break;
                 }
            }
        }
    }

    if (dataCoord) {
        // Handle commonJS import of countryCoder
        const cc = (countryCoder as any).default || countryCoder;
        const feature = cc.locationsAt(dataCoord, { level: 'territory' })[0];
        if (feature && feature.properties.wikidata) {
             const wikidata = feature.properties.wikidata;
             territory = WIKIDATA_MAPPING[wikidata] || wikidata;
        }
    }

    // Inject territory into data for downstream services if evaluated
    // They will now just check if `data._geography_territory` matches their string rule,
    // rather than doing coordinates matching.
    if (data && territory) {
         data = { ...data, _geography_territory: territory };
    }

    try {
        // Check all required services concurrently
        const checks = services.map(async (service: string) => {
            const url = SERVICE_URLS[service];
            if (!url) {
                console.warn(`Unknown service requested: ${service}`);
                return { service, allowed: false, reason: 'Unknown service' };
            }

            try {
                const response = await axios.post(url, {
                    userId, origin, entityName, ability, data
                });
                return { service, ...response.data };
            } catch (err: any) {
                console.error(`Error calling service ${service}:`, err.message);
                return { service, allowed: false, reason: 'Service unavailable' };
            }
        });

        const results = await Promise.all(checks);

        // Find any rejection
        const rejected = results.find(r => r.allowed === false);

        if (rejected) {
            console.log(`Authorization denied by ${rejected.service}: ${rejected.reason}`);
            return res.json({ allowed: false, rejectedBy: rejected.service, reason: rejected.reason });
        }

        console.log(`Authorization granted by all services (${services.join(', ')})`);
        return res.json({ allowed: true });

    } catch (error) {
        console.error('Error during orchestration:', error);
        res.status(500).json({ allowed: false, reason: 'Internal orchestrator error' });
    }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Orchestrator service running on port ${PORT}`);
});
