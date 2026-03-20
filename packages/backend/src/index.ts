import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPGlite } from 'pglite-prisma-adapter';
import { PGlite } from '@electric-sql/pglite';
import axios from 'axios';
import { request, gql } from 'graphql-request';

const app = express();

const client = new PGlite('./pglite-db');
const adapter = new PrismaPGlite(client);
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

// --- CONFIGURATION ENDPOINTS ---

app.get('/api/config', async (req, res) => {
  try {
    const configs = await prisma.entityConfig.findMany();
    const parsedConfigs = configs.map((c: any) => ({
      ...c,
      fields: JSON.parse(c.fields)
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
      where: { name: req.params.name }
    });
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    res.json({
      ...config,
      fields: JSON.parse(config.fields)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

app.post('/api/config', async (req, res) => {
  try {
    const { name, apiUrl, apiType, fields } = req.body;

    const config = await prisma.entityConfig.upsert({
      where: { name },
      update: {
        apiUrl,
        apiType: apiType || 'REST',
        fields: JSON.stringify(fields)
      },
      create: {
        name,
        apiUrl,
        apiType: apiType || 'REST',
        fields: JSON.stringify(fields)
      }
    });

    res.json({
      ...config,
      fields: JSON.parse(config.fields)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});


// --- DATA PROXY ENDPOINTS ---

app.get('/api/data/:entity', async (req, res) => {
  const { entity } = req.params;
  const config = await prisma.entityConfig.findUnique({ where: { name: entity }});

  if (!config) return res.status(404).json({ error: 'Entity not found' });

  try {
    if (config.apiType === 'REST') {
      const response = await axios.get(config.apiUrl);
      res.json(response.data);
    } else if (config.apiType === 'GRAPHQL') {
      const query = gql`
        query {
          ${entity}s {
            id
            ${JSON.parse(config.fields).map((f: any) => f.name).join('\n            ')}
          }
        }
      `;
      const data = await request(config.apiUrl, query) as any;
      res.json(data[`${entity}s`]);
    }
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/data/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  const config = await prisma.entityConfig.findUnique({ where: { name: entity }});

  if (!config) return res.status(404).json({ error: 'Entity not found' });

  try {
    if (config.apiType === 'REST') {
      const response = await axios.get(`${config.apiUrl}/${id}`);
      res.json(response.data);
    } else if (config.apiType === 'GRAPHQL') {
      const query = gql`
        query Get${entity.charAt(0).toUpperCase() + entity.slice(1)}($id: ID!) {
          ${entity}(id: $id) {
            id
            ${JSON.parse(config.fields).map((f: any) => f.name).join('\n            ')}
          }
        }
      `;
      const variables = { id };
      const data = await request(config.apiUrl, query, variables) as any;
      res.json(data[entity]);
    }
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.post('/api/data/:entity', async (req, res) => {
  const { entity } = req.params;
  const config = await prisma.entityConfig.findUnique({ where: { name: entity }});

  if (!config) return res.status(404).json({ error: 'Entity not found' });

  try {
    if (config.apiType === 'REST') {
      const response = await axios.post(config.apiUrl, req.body);
      res.json(response.data);
    } else if (config.apiType === 'GRAPHQL') {
      const fields = JSON.parse(config.fields);
      const varDefs = fields.map((f: any) => `$${f.name}: ${f.type === 'number' ? 'Float!' : (f.type === 'checkbox' ? 'Boolean!' : 'String!')}`).join(', ');
      const argsList = fields.map((f: any) => `${f.name}: $${f.name}`).join(', ');

      const mutation = gql`
        mutation Create${entity.charAt(0).toUpperCase() + entity.slice(1)}(${varDefs}) {
          create${entity.charAt(0).toUpperCase() + entity.slice(1)}(${argsList}) {
            id
            ${fields.map((f: any) => f.name).join('\n            ')}
          }
        }
      `;

      const variables: Record<string, any> = {};
      fields.forEach((f: any) => {
         variables[f.name] = req.body[f.name];
      });

      const data = await request(config.apiUrl, mutation, variables) as any;
      res.json(data[`create${entity.charAt(0).toUpperCase() + entity.slice(1)}`]);
    }
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to create data' });
  }
});

app.put('/api/data/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  const config = await prisma.entityConfig.findUnique({ where: { name: entity }});

  if (!config) return res.status(404).json({ error: 'Entity not found' });

  try {
    if (config.apiType === 'REST') {
      const response = await axios.put(`${config.apiUrl}/${id}`, req.body);
      res.json(response.data);
    } else if (config.apiType === 'GRAPHQL') {
      const fields = JSON.parse(config.fields);
      const varDefs = fields.map((f: any) => `$${f.name}: ${f.type === 'number' ? 'Float' : (f.type === 'checkbox' ? 'Boolean' : 'String')}`).join(', ');
      const argsList = fields.map((f: any) => `${f.name}: $${f.name}`).join(', ');

      const mutation = gql`
        mutation Update${entity.charAt(0).toUpperCase() + entity.slice(1)}($id: ID!, ${varDefs}) {
          update${entity.charAt(0).toUpperCase() + entity.slice(1)}(id: $id, ${argsList}) {
            id
            ${fields.map((f: any) => f.name).join('\n            ')}
          }
        }
      `;

      const variables: Record<string, any> = { id };
      fields.forEach((f: any) => {
         if (req.body[f.name] !== undefined) {
             variables[f.name] = req.body[f.name];
         }
      });

      const data = await request(config.apiUrl, mutation, variables) as any;
      res.json(data[`update${entity.charAt(0).toUpperCase() + entity.slice(1)}`]);
    }
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

app.delete('/api/data/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  const config = await prisma.entityConfig.findUnique({ where: { name: entity }});

  if (!config) return res.status(404).json({ error: 'Entity not found' });

  try {
    if (config.apiType === 'REST') {
      await axios.delete(`${config.apiUrl}/${id}`);
      res.json({ success: true });
    } else if (config.apiType === 'GRAPHQL') {
      const mutation = gql`
        mutation Delete${entity.charAt(0).toUpperCase() + entity.slice(1)}($id: ID!) {
          delete${entity.charAt(0).toUpperCase() + entity.slice(1)}(id: $id)
        }
      `;
      const variables = { id };
      await request(config.apiUrl, mutation, variables);
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
