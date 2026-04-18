const fs = require('fs');
const path = './apps/management-client/src/features/EntityEditor/EntityForm.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `const handleOperationsSelected = (ops: Record<string, string>) => {
    setGraphqlOperations(ops);

    // Suggest to overwrite if endpointsQueries already has content
    if (!hasPromptedOverwrite && formData.endpointsQueries && formData.endpointsQueries !== '{}') {
       setHasPromptedOverwrite(true);
       if (window.confirm('Do you want to overwrite your existing Endpoints & Queries configuration with the newly selected GraphQL operations?')) {
          const builtQueries = {
             list: ops.list ? \\\`query { \\\${ops.list} { id } }\\\` : '',
             get: ops.get ? \\\`query($id: ID!) { \\\${ops.get}(id: $id) { id } }\\\` : '',
             create: ops.create ? \\\`mutation($input: any!) { \\\${ops.create}(input: $input) { id } }\\\` : '',
             update: ops.update ? \\\`mutation($id: ID!, $input: any!) { \\\${ops.update}(id: $id, input: $input) { id } }\\\` : '',
             delete: ops.delete ? \\\`mutation($id: ID!) { \\\${ops.delete}(id: $id) }\\\` : '',
          };
          setFormData(prev => ({ ...prev, endpointsQueries: JSON.stringify(builtQueries) }));
       }
    } else if (!formData.endpointsQueries || formData.endpointsQueries === '{}') {
        const builtQueries = {
             list: ops.list ? \\\`query { \\\${ops.list} { id } }\\\` : '',
             get: ops.get ? \\\`query($id: ID!) { \\\${ops.get}(id: $id) { id } }\\\` : '',
             create: ops.create ? \\\`mutation($input: any!) { \\\${ops.create}(input: $input) { id } }\\\` : '',
             update: ops.update ? \\\`mutation($id: ID!, $input: any!) { \\\${ops.update}(id: $id, input: $input) { id } }\\\` : '',
             delete: ops.delete ? \\\`mutation($id: ID!) { \\\${ops.delete}(id: $id) }\\\` : '',
        };
        setFormData(prev => ({ ...prev, endpointsQueries: JSON.stringify(builtQueries) }));
    }`;

content = content.replace(
  /const handleOperationsSelected = \(ops: Record<string, string>\) => {[\s\S]*?setFormData\(prev => \({ \.\.\.prev, endpointsQueries: JSON\.stringify\(builtQueries\) }\)\);\s*}/,
  replacement.replace(/\\`/g, '`')
);

fs.writeFileSync(path, content);
console.log('Fixed hasPromptedOverwrite in EntityForm.tsx');
