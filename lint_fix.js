const fs = require('fs');
let content = fs.readFileSync('./apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx', 'utf8');

if (content.includes('let newSelected = { ...selectedFields };')) {
  console.log("Replacing in Introspection");
  content = content.replace('let newSelected = { ...selectedFields };', 'const newSelected = { ...selectedFields };');
  fs.writeFileSync('./apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx', content);
}

let contentForm = fs.readFileSync('./apps/management-client/src/features/EntityEditor/EntityForm.tsx', 'utf8');
if (contentForm.includes('let finalEndpointsQueries = formData.endpointsQueries;')) {
  console.log("Replacing in Form");
  contentForm = contentForm.replace('let finalEndpointsQueries = formData.endpointsQueries;', 'const finalEndpointsQueries = formData.endpointsQueries;');
  fs.writeFileSync('./apps/management-client/src/features/EntityEditor/EntityForm.tsx', contentForm);
}
