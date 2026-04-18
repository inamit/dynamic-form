const fs = require('fs');

let intro = fs.readFileSync('./apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx', 'utf8');

// Fix implicit any
intro = intro.replace(
  /onChange=\{\(e, newValue\) => \{/g,
  "onChange={(e: any, newValue: any) => {"
);

fs.writeFileSync('./apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx', intro);
