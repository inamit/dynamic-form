const fs = require('fs');

let intro = fs.readFileSync('./apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx', 'utf8');

// The `inferredType` was renamed inside renderTypeNode, we need to pass it properly or rename it back to what's expected.
// Wait, the variables were inferredType and typeString but they are now inside a map iteration.
intro = intro.replace(
  /type: inferredType,/g,
  "type: inferFieldType(getBaseType(field.type), isListType(field.type)),"
);
intro = intro.replace(
  /type: inferFieldType\(/g,
  "type: inferFieldType(" // already covered
);

intro = intro.replace(
  /value=\{selectedFields\[fieldPath\]\?\.type \|\| inferredType\}/g,
  "value={selectedFields[fieldPath]?.type || inferFieldType(getBaseType(field.type), isListType(field.type))}"
);

// We need to fix the `fTypeStr` and `currentPath` unused variables in the toggleFields
intro = intro.replace(
  /const fTypeStr = getTypeString\(f\.type\);\s*/g,
  ""
);

intro = intro.replace(
  /const toggleFields = \(tName: string, currentPath: string, check: boolean, depth: number = 0\) => {/g,
  "const toggleFields = (tName: string, cPath: string, check: boolean, depth: number = 0) => {"
);
intro = intro.replace(
  /const fPath = `\$\{currentPath\}\.\$\{f\.name\}`;/g,
  "const fPath = `${cPath}.${f.name}`;"
);

fs.writeFileSync('./apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx', intro);

let form = fs.readFileSync('./apps/management-client/src/features/EntityEditor/EntityForm.tsx', 'utf8');
form = form.replace(
  /if \(graphqlOperations && selectedDataSource\?\.apiType === 'GRAPHQL'\) {/g,
  "if (selectedDataSource?.apiType === 'GRAPHQL') { // Using graphqlOperations via endpointsQueries"
);
form = form.replace(/graphqlOperations/g, '_graphqlOperations_unused');

fs.writeFileSync('./apps/management-client/src/features/EntityEditor/EntityForm.tsx', form);
