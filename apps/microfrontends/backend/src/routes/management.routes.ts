import { Router } from 'express';
import { DataSourceController } from '../controllers/data-source.controller.js';
import { EntityConfigController } from '../controllers/entity-config.controller.js';

const router = Router();
const dataSourceController = new DataSourceController();
const entityConfigController = new EntityConfigController();

// Data Sources
router.get('/data-sources', dataSourceController.getDataSources);
router.post('/data-sources', dataSourceController.createDataSource);
router.put('/data-sources/:id', dataSourceController.updateDataSource);
router.delete('/data-sources/:id', dataSourceController.deleteDataSource);

// Configs
router.get('/config/id/:id', entityConfigController.getConfigById);
router.post('/config/new', entityConfigController.createConfig);
router.put('/config/:id', entityConfigController.updateConfig);
router.delete('/config/:id', entityConfigController.deleteConfig);

// Introspect
router.post('/introspect', entityConfigController.introspect);

export default router;
