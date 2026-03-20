import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPGlite } from 'pglite-prisma-adapter';
import { PGlite } from '@electric-sql/pglite';
import axios from 'axios';
import { request, gql } from 'graphql-request';

const app = express();

let prisma: any;

if (process.env.NODE_ENV === 'production' || process.env.USE_REAL_POSTGRES === 'true') {
  prisma = new PrismaClient();
} else {
  const client = new PGlite('./pglite-db');
  const adapter = new PrismaPGlite(client);
  prisma = new PrismaClient({ adapter });
}

app.use(cors());
app.use(express.json());

// --- CONFIGURATION ENDPOINTS ---

app.get('/api/config', async (req, res) => {
  try {
    const configs = await prisma.entityConfig.findMany({
      include: { dataSource: true, fields: true }
    });

    const parsedConfigs = configs.map((c: any) => ({
      ...c,
      apiUrl: c.dataSource.apiUrl,
      apiType: c.dataSource.apiType
    }));

    res.json(parsedConfigs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch configurations' });
  }
});

app.get('/api/config/:name', async (req, res) => {
  try {
    const config = await prisma.entityConfig.findUnique({
      where: { name: req.params.name },
      include: { dataSource: true, fields: true }
    });

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json({
      ...config,
      apiUrl: config.dataSource.apiUrl,
      apiType: config.dataSource.apiType
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

app.post('/api/config', async (req, res) => {
  res.status(501).json({ error: 'Creating endpoints via config dynamically disabled for now.' });
});


// --- DATA PROXY ENDPOINTS ---

app.get('/api/data/:entity', async (req, res) => {
  const { entity } = req.params;
  const config = await prisma.entityConfig.findUnique({
    where: { name: entity },
    include: { dataSource: true, fields: true }
  });

  if (!config) return res.status(404).json({ error: 'Entity not found' });

  try {
    const ds = config.dataSource;
    if (ds.apiType === 'REST') {
      const response = await axios.get(ds.apiUrl);
      res.json(response.data);
    } else if (ds.apiType === 'GRAPHQL') {
      const ops = JSON.parse(ds.endpointsQueries || '{}');
      const queryStr = ops.list;
      if (!queryStr) throw new Error("Missing 'list' query configuration");

      const query = gql`${queryStr}`;
      const data = await request(ds.apiUrl, query) as any;
      res.json(data[`${entity}s`]);
    }
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/data/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  const config = await prisma.entityConfig.findUnique({
    where: { name: entity },
    include: { dataSource: true, fields: true }
  });

  if (!config) return res.status(404).json({ error: 'Entity not found' });

  try {
    const ds = config.dataSource;
    if (ds.apiType === 'REST') {
      const response = await axios.get(`${ds.apiUrl}/${id}`);
      res.json(response.data);
    } else if (ds.apiType === 'GRAPHQL') {
      const ops = JSON.parse(ds.endpointsQueries || '{}');
      const queryStr = ops.get;
      if (!queryStr) throw new Error("Missing 'get' query configuration");

      const query = gql`${queryStr}`;
      const variables = { id };
      const data = await request(ds.apiUrl, query, variables) as any;
      res.json(data[entity]);
    }
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.post('/api/data/:entity', async (req, res) => {
  const { entity } = req.params;
  const config = await prisma.entityConfig.findUnique({
    where: { name: entity },
    include: { dataSource: true, fields: true }
  });

  if (!config) return res.status(404).json({ error: 'Entity not found' });

  try {
    const ds = config.dataSource;
    if (ds.apiType === 'REST') {
      const response = await axios.post(ds.apiUrl, req.body);
      res.json(response.data);
    } else if (ds.apiType === 'GRAPHQL') {
      const ops = JSON.parse(ds.endpointsQueries || '{}');
      const queryStr = ops.create;
      if (!queryStr) throw new Error("Missing 'create' query configuration");

      const mutation = gql`${queryStr}`;

      const variables: Record<string, any> = {};
      config.fields.forEach((f: any) => {
         variables[f.name] = req.body[f.name];
      });

      const data = await request(ds.apiUrl, mutation, variables) as any;
      res.json(data[`create${entity.charAt(0).toUpperCase() + entity.slice(1)}`]);
    }
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to create data' });
  }
});

app.put('/api/data/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  const config = await prisma.entityConfig.findUnique({
    where: { name: entity },
    include: { dataSource: true, fields: true }
  });

  if (!config) return res.status(404).json({ error: 'Entity not found' });

  try {
    const ds = config.dataSource;
    if (ds.apiType === 'REST') {
      const response = await axios.put(`${ds.apiUrl}/${id}`, req.body);
      res.json(response.data);
    } else if (ds.apiType === 'GRAPHQL') {
      const ops = JSON.parse(ds.endpointsQueries || '{}');
      const queryStr = ops.update;
      if (!queryStr) throw new Error("Missing 'update' query configuration");

      const mutation = gql`${queryStr}`;

      const variables: Record<string, any> = { id };
      config.fields.forEach((f: any) => {
         if (req.body[f.name] !== undefined) {
             variables[f.name] = req.body[f.name];
         }
      });

      const data = await request(ds.apiUrl, mutation, variables) as any;
      res.json(data[`update${entity.charAt(0).toUpperCase() + entity.slice(1)}`]);
    }
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

app.delete('/api/data/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  const config = await prisma.entityConfig.findUnique({
    where: { name: entity },
    include: { dataSource: true, fields: true }
  });

  if (!config) return res.status(404).json({ error: 'Entity not found' });

  try {
    const ds = config.dataSource;
    if (ds.apiType === 'REST') {
      await axios.delete(`${ds.apiUrl}/${id}`);
      res.json({ success: true });
    } else if (ds.apiType === 'GRAPHQL') {
      const ops = JSON.parse(ds.endpointsQueries || '{}');
      const queryStr = ops.delete;
      if (!queryStr) throw new Error("Missing 'delete' query configuration");

      const mutation = gql`${queryStr}`;
      const variables = { id };
      await request(ds.apiUrl, mutation, variables);
      res.json({ success: true });
    }
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend service running on port ${PORT}`);
});
