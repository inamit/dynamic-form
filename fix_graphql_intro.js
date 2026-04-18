const fs = require('fs');
const path = './apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { useState, useEffect }')) {
    content = content.replace('import { useState }', 'import { useState, useEffect }');
}

fs.writeFileSync(path, content);
