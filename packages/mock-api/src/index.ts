import express from 'express';
import cors from 'cors';
import { ApolloServer, gql } from 'apollo-server-express';

const app = express();
app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATA ---

let persons = [
  { id: '1', firstName: 'John', age: 30, isActive: true },
  { id: '2', firstName: 'Jane', age: 25, isActive: false },
];

let candies = [
  { id: '1', name: 'Snickers', price: 1.5, isVegan: false },
  { id: '2', name: 'Skittles', price: 1.2, isVegan: true },
];

let stores = [
  { id: '1', name: 'Candy Shop', rating: 4.5, isOpen: true, location: { longitude: 34.7818, latitude: 32.0853 } },
  { id: '2', name: 'Corner Store', rating: 3.8, isOpen: false, location: { longitude: 35.2137, latitude: 31.7683 } },
];


// --- REST ENDPOINTS (Person & Candy & Enums) ---

// Enums
app.get('/api/enums/:enumName', (req, res) => {
  const { enumName } = req.params;
  if (enumName === 'person-status') {
    res.json([
      { code: 'ACTIVE', value: 'Active' },
      { code: 'INACTIVE', value: 'Inactive' },
      { code: 'PENDING', value: 'Pending' }
    ]);
  } else {
    res.status(404).json({ error: 'Enum not found' });
  }
});

// Person
app.get('/api/persons', (req, res) => res.json(persons));
app.get('/api/persons/:id', (req, res) => {
  const person = persons.find(p => p.id === req.params.id);
  person ? res.json(person) : res.status(404).json({ error: 'Not found' });
});
app.post('/api/persons', (req, res) => {
  const newPerson = { id: String(Date.now()), ...req.body };
  persons.push(newPerson);
  res.json(newPerson);
});
app.put('/api/persons/:id', (req, res) => {
  const index = persons.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    persons[index] = { ...persons[index], ...req.body, id: req.params.id };
    res.json(persons[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});
app.delete('/api/persons/:id', (req, res) => {
  persons = persons.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});

// Candy
app.get('/api/candies', (req, res) => res.json(candies));
app.get('/api/candies/:id', (req, res) => {
  const candy = candies.find(c => c.id === req.params.id);
  candy ? res.json(candy) : res.status(404).json({ error: 'Not found' });
});
app.post('/api/candies', (req, res) => {
  const newCandy = { id: String(Date.now()), ...req.body };
  candies.push(newCandy);
  res.json(newCandy);
});
app.put('/api/candies/:id', (req, res) => {
  const index = candies.findIndex(c => c.id === req.params.id);
  if (index !== -1) {
    candies[index] = { ...candies[index], ...req.body, id: req.params.id };
    res.json(candies[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});
app.delete('/api/candies/:id', (req, res) => {
  candies = candies.filter(c => c.id !== req.params.id);
  res.json({ success: true });
});


// --- GRAPHQL SERVER (Store) ---

const typeDefs = gql`
  type Location {
    longitude: Float!
    latitude: Float!
  }

  type Store {
    id: ID!
    name: String!
    rating: Float!
    isOpen: Boolean!
    location: Location
  }

  type Query {
    stores: [Store]
    store(id: ID!): Store
  }

  input LocationInput {
    longitude: Float!
    latitude: Float!
  }

  type Mutation {
    createStore(name: String!, rating: Float!, isOpen: Boolean!, location: LocationInput): Store
    updateStore(id: ID!, name: String, rating: Float, isOpen: Boolean, location: LocationInput): Store
    deleteStore(id: ID!): Boolean
  }
`;

const resolvers = {
  Query: {
    stores: () => stores,
    store: (_: any, { id }: any) => stores.find(s => s.id === id),
  },
  Mutation: {
    createStore: (_: any, args: any) => {
      const newStore = { id: String(Date.now()), ...args };
      stores.push(newStore);
      return newStore;
    },
    updateStore: (_: any, { id, ...args }: any) => {
      const index = stores.findIndex(s => s.id === id);
      if (index !== -1) {
        stores[index] = { ...stores[index], ...args, id };
        return stores[index];
      }
      return null;
    },
    deleteStore: (_: any, { id }: any) => {
      const initialLength = stores.length;
      stores = stores.filter(s => s.id !== id);
      return stores.length < initialLength;
    }
  }
};

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' } as any);

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Mock API running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
