import { Router } from 'express';
import { ManagementController } from '../controllers/management.controller.js';

const router = Router();
const managementController = new ManagementController();

// Data Sources
router.get('/data-sources', managementController.getDataSources);
router.post('/data-sources', managementController.createDataSource);
router.put('/data-sources/:id', managementController.updateDataSource);
router.delete('/data-sources/:id', managementController.deleteDataSource);

// Configs
router.get('/config/id/:id', managementController.getConfigById);
router.post('/config/new', managementController.createConfig);
router.put('/config/:id', managementController.updateConfig);
router.delete('/config/:id', managementController.deleteConfig);

// Introspect
router.post('/introspect', managementController.introspect);

export default router;
