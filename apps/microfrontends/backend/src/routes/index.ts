import { Router } from 'express';
import { ConfigController } from '../controllers/config.controller.js';
import { SchemaController } from '../controllers/schema.controller.js';
import { DataController } from '../controllers/data.controller.js';
import { AuthorizationController } from '../controllers/authorization.controller.js';
import { extractUser } from '../middleware/auth.middleware.js';

const router = Router();
const configController = new ConfigController();
const schemaController = new SchemaController();
const dataController = new DataController();
const authorizationController = new AuthorizationController();

router.use(extractUser);

router.get('/config', configController.getAllConfigs);
router.get('/config/:name', configController.getConfigByName);
router.post('/config', (req, res) => res.status(501).json({ error: 'Creating endpoints via config dynamically disabled for now.' }));

router.get('/schemas', schemaController.getSchemas);
router.get('/schema/:entityName', schemaController.getSchema);
router.get('/enums/:enumName', schemaController.getEnum);

router.get('/data/:entity/abilities', authorizationController.getAbilities);
router.get('/data/:entity', dataController.getData);
router.get('/data/:entity/:id', dataController.getDataById);
router.post('/data/:entity', dataController.createData);
router.put('/data/:entity/:id', dataController.updateData);
router.delete('/data/:entity/:id', dataController.deleteData);

export default router;
