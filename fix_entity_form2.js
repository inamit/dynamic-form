const fs = require('fs');
const path = './apps/management-client/src/features/EntityEditor/EntityForm.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /\} else \{\s*const builtQueries = \{\s*list: ops\.list \? `query \{ \$\{ops\.list\} \{ id \} \}` : '',\s*get: ops\.get \? `query\(\$id: ID!\) \{ \$\{ops\.get\}\(id: \$id\) \{ id \} \}` : '',\s*create: ops\.create \? `mutation\(\$input: any!\) \{ \$\{ops\.create\}\(input: \$input\) \{ id \} \}` : '',\s*update: ops\.update \? `mutation\(\$id: ID!, \$input: any!\) \{ \$\{ops\.update\}\(id: \$id, input: \$input\) \{ id \} \}` : '',\s*delete: ops\.delete \? `mutation\(\$id: ID!\) \{ \$\{ops\.delete\}\(id: \$id\) \}` : '',\s*\};\s*setFormData\(prev => \(\{ \.\.\.prev, endpointsQueries: JSON\.stringify\(builtQueries\) \}\)\);\s*\}/g;

content = content.replace(regex, '');

fs.writeFileSync(path, content);
console.log('Fixed extra else block in EntityForm.tsx');
