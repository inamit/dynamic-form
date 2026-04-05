import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPGlite } from 'pglite-prisma-adapter';
import { PGlite } from '@electric-sql/pglite';

const app = express();

const client = new PGlite('./pglite-db');
const adapter = new PrismaPGlite(client);
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

// --- Management API for UI ---

app.get('/api/site-permissions', async (req, res) => {
    const perms = await prisma.sitePermission.findMany();
    res.json(perms);
});

app.post('/api/site-permissions', async (req, res) => {
    const { origin, entityName, ability } = req.body;
    const perm = await prisma.sitePermission.create({
        data: { origin, entityName, ability }
    });
    res.json(perm);
});

app.delete('/api/site-permissions/:id', async (req, res) => {
    await prisma.sitePermission.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
});

app.get('/api/user-permissions', async (req, res) => {
    const perms = await prisma.userPermission.findMany();
    res.json(perms);
});

app.post('/api/user-permissions', async (req, res) => {
    const { userId, entityName, ability, geography, fieldValue } = req.body;
    const perm = await prisma.userPermission.create({
        data: { userId, entityName, ability, geography, fieldValue }
    });
    res.json(perm);
});

app.delete('/api/user-permissions/:id', async (req, res) => {
    await prisma.userPermission.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
});

// --- Authorizer API ---

app.post('/api/check', async (req, res) => {
    const { origin, userId, entityName, ability, data } = req.body;

    // Check Site Permissions
    if (origin) {
        const sitePerm = await prisma.sitePermission.findFirst({
            where: { origin, entityName, ability }
        });
        if (!sitePerm) {
            console.log(`Site permission denied for origin: ${origin}, entity: ${entityName}, ability: ${ability}`);
            return res.json({ allowed: false, reason: 'Site not allowed' });
        }
    }

    // Check User Permissions
    // If we have custom user permissions defined for this entity, we must enforce them.
    // In a real app, you might have role-based checks here as well.
    const userPerms = await prisma.userPermission.findMany({
        where: { userId, entityName, ability }
    });

    if (userPerms.length > 0) {
        let hasAccess = false;
        for (const perm of userPerms) {
            // If the permission has no row-level constraints, they have access to all rows
            if (!perm.geography && !perm.fieldValue) {
                hasAccess = true;
                break;
            }

            // If the permission specifies constraints, we need data to evaluate them
            if (data) {
                let matches = true;
                if (perm.geography && data.country && data.country !== perm.geography) {
                    matches = false;
                }
                if (perm.fieldValue && data.someField && data.someField !== perm.fieldValue) {
                    matches = false;
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

        if (!hasAccess) {
             console.log(`User permission denied for user: ${userId}, entity: ${entityName}, ability: ${ability}`);
             return res.json({ allowed: false, reason: 'User not allowed' });
        }
    }

    return res.json({ allowed: true });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Custom Permissions service running on port ${PORT}`);
});
