import express from 'express';
import cors from 'cors';
import {PrismaClient} from '@prisma/client';
import {PrismaPGlite} from 'pglite-prisma-adapter';
import {PGlite} from '@electric-sql/pglite';
import {PrismaPg} from "@prisma/adapter-pg";

const app = express();

let prisma: any;

if (process.env.NODE_ENV === 'production' || process.env.USE_REAL_POSTGRES === 'true') {
    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
    });
    prisma = new PrismaClient({adapter});
} else {
    const client = new PGlite('./pglite-db');
    const adapter = new PrismaPGlite(client);
    prisma = new PrismaClient({adapter});
}

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim())
    : ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:5001', 'http://localhost:5002', 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
    origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express.json());

// --- Management API for UI ---

app.get('/api/site-permissions', async (req, res) => {
    const perms = await prisma.sitePermission.findMany();
    res.json(perms);
});

app.post('/api/site-permissions', async (req, res) => {
    const {origin, entityName, ability} = req.body;
    const perm = await prisma.sitePermission.create({
        data: {origin, entityName, ability}
    });
    res.json(perm);
});

app.delete('/api/site-permissions/:id', async (req, res) => {
    await prisma.sitePermission.delete({where: {id: parseInt(req.params.id)}});
    res.json({success: true});
});

app.get('/api/user-permissions', async (req, res) => {
    const perms = await prisma.userPermission.findMany();
    res.json(perms);
});

app.post('/api/user-permissions', async (req, res) => {
    const {userId, entityName, ability, geography, fieldValue} = req.body;
    const perm = await prisma.userPermission.create({
        data: {userId, entityName, ability, geography, fieldValue}
    });
    res.json(perm);
});

app.delete('/api/user-permissions/:id', async (req, res) => {
    await prisma.userPermission.delete({where: {id: parseInt(req.params.id)}});
    res.json({success: true});
});

// --- Authorizer API ---

app.post('/api/check', async (req, res) => {
    const {origin, userId, entityName, ability, data} = req.body;

    console.log(`Permission check: User=${userId}, Origin=${origin}, Entity=${entityName}, Ability=${ability}, Data=${JSON.stringify(data)}`);
    // Check Site Permissions
    if (origin) {
        const sitePerm = await prisma.sitePermission.findFirst({
            where: {origin, entityName, ability}
        });
        if (!sitePerm) {
            console.log(`Site permission denied for origin: ${origin}, entity: ${entityName}, ability: ${ability}`);
            return res.json({allowed: false, reason: 'Site not allowed'});
        }
    }

    // Check User Permissions
    // If we have custom user permissions defined for this entity, we must enforce them.
    // In a real app, you might have role-based checks here as well.
    const userPerms = await prisma.userPermission.findMany({
        where: {userId, entityName, ability}
    });

    let hasAccess = false;
    if (userPerms.length > 0) {
        for (const perm of userPerms) {
            // If the permission has no row-level constraints, they have access to all rows
            if (!perm.geography && !perm.fieldValue) {
                hasAccess = true;
                break;
            }

            // If the permission specifies constraints, we need data to evaluate them
            if (data) {
                let matches = true;

                // Geographic constraint logic
                if (perm.geography) {
                    if (!perm.geography.includes(data._geography_territory) && !perm.geography.includes(data.country)) {
                        matches = false;
                    }
                }

                // Field value constraint logic
                if (perm.fieldValue && matches) {
                    try {
                        const parsedConstraint = JSON.parse(perm.fieldValue);
                        let fieldMatch = false;
                        for (const key of Object.keys(parsedConstraint)) {
                            if (data[key] === parsedConstraint[key]) {
                                fieldMatch = true;
                            } else {
                                fieldMatch = false;
                                break;
                            }
                        }
                        if (!fieldMatch) matches = false;
                    } catch (e) {
                        // Not JSON, fallback to simple matching on 'someField'
                        if (data.someField !== perm.fieldValue) {
                            matches = false;
                        }
                    }
                }

                if (matches) {
                    hasAccess = true;
                    break;
                }
            } else {
                // If checking abilities generally (no data), but user only has row-level access,
                // we'll say they have access generally (so they can see the list or table)
                // The row-level check will filter out the data they can't see later.
                hasAccess = true;
                break;
            }
        }
    }
    if (!hasAccess) {
        console.log(`User permission denied for user: ${userId}, entity: ${entityName}, ability: ${ability}`);
        return res.json({allowed: false, reason: 'User not allowed'});
    }

    return res.json({allowed: true});
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Custom Permissions service running on port ${PORT}`);
});
