const fs = require('fs');

const path = './apps/management-client/src/features/EntityEditor/EntityForm.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'const [graphqlOperations, setGraphqlOperations] = useState<any>(null);',
  'const [graphqlOperations, setGraphqlOperations] = useState<any>(null);\n  const [hasPromptedOverwrite, setHasPromptedOverwrite] = useState(false);'
);

content = content.replace(
  'const handleOperationsSelected = (ops: Record<string, string>) => {',
  `const handleOperationsSelected = (ops: Record<string, string>) => {
    setGraphqlOperations(ops);

    // Suggest to overwrite if endpointsQueries already has content
    if (formData.endpointsQueries && formData.endpointsQueries !== '{}') {
       if (window.confirm('Do you want to overwrite your existing Endpoints & Queries configuration with the newly selected GraphQL operations?')) {
          const builtQueries = {
             list: ops.list ? \`query { \${ops.list} { id } }\` : '',
             get: ops.get ? \`query($id: ID!) { \${ops.get}(id: $id) { id } }\` : '',
             create: ops.create ? \`mutation($input: any!) { \${ops.create}(input: $input) { id } }\` : '',
             update: ops.update ? \`mutation($id: ID!, $input: any!) { \${ops.update}(id: $id, input: $input) { id } }\` : '',
             delete: ops.delete ? \`mutation($id: ID!) { \${ops.delete}(id: $id) }\` : '',
          };
          setFormData(prev => ({ ...prev, endpointsQueries: JSON.stringify(builtQueries) }));
       }
    } else {
        const builtQueries = {
             list: ops.list ? \`query { \${ops.list} { id } }\` : '',
             get: ops.get ? \`query($id: ID!) { \${ops.get}(id: $id) { id } }\` : '',
             create: ops.create ? \`mutation($input: any!) { \${ops.create}(input: $input) { id } }\` : '',
             update: ops.update ? \`mutation($id: ID!, $input: any!) { \${ops.update}(id: $id, input: $input) { id } }\` : '',
             delete: ops.delete ? \`mutation($id: ID!) { \${ops.delete}(id: $id) }\` : '',
        };
        setFormData(prev => ({ ...prev, endpointsQueries: JSON.stringify(builtQueries) }));
    }
  `
);

content = content.replace(
  `      // If we configured new operations via GraphQL introspection, update the EntityConfig endpointsQueries
      if (graphqlOperations && selectedDataSource?.apiType === 'GRAPHQL') {
         const builtQueries = {
             list: graphqlOperations.list ? \`query { \${graphqlOperations.list} { id } }\` : '',
             get: graphqlOperations.get ? \`query($id: ID!) { \${graphqlOperations.get}(id: $id) { id } }\` : '',
             create: graphqlOperations.create ? \`mutation($input: any!) { \${graphqlOperations.create}(input: $input) { id } }\` : '',
             update: graphqlOperations.update ? \`mutation($id: ID!, $input: any!) { \${graphqlOperations.update}(id: $id, input: $input) { id } }\` : '',
             delete: graphqlOperations.delete ? \`mutation($id: ID!) { \${graphqlOperations.delete}(id: $id) }\` : '',
         };
         finalEndpointsQueries = JSON.stringify(builtQueries);
      }`,
  `      // Operations are now built and applied immediately in handleOperationsSelected`
);

content = content.replace(
  '                dataSourceHeaders={selectedDataSource.headers || \'\'}\n                onFieldsSelected={handleFieldsAdded}',
  '                dataSourceHeaders={selectedDataSource.headers || \'\'}\n                existingFields={formData.fields}\n                onFieldsSelected={handleFieldsAdded}'
);

fs.writeFileSync(path, content);
console.log('Patched EntityForm.tsx');
