const { buildSchema, introspectionFromSchema } = require('graphql');

const schema = buildSchema(`
  type Store {
    id: ID!
    name: String!
    location: Location
    is_active: Boolean
    inventory: [InventoryItem]
  }

  type Location {
    lat: Float
    lng: Float
  }

  type InventoryItem {
    id: ID!
    productName: String!
  }

  type Query {
    store(id: ID!): Store
    stores: [Store]
  }

  type Mutation {
    createStore(name: String!): Store
  }
`);

const introspection = introspectionFromSchema(schema);
console.log(JSON.stringify(introspection, null, 2));
