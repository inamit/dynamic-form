const fs = require('fs');

const path = './apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx';
let content = fs.readFileSync(path, 'utf8');

// Instead of rendering just queryType, render all non-system objects at the top level

const replacement = `{schema.types.filter((t: any) => t.kind === 'OBJECT' && !t.name.startsWith('__') && !['Query', 'Mutation', 'Subscription'].includes(t.name)).map((t: any) => (
                <Box key={t.name} sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>{t.name}</Typography>
                  {renderTypeNode(t.name)}
                </Box>
              ))}`;

content = content.replace(
  '{renderTypeNode(schema.queryType?.name || \'Query\')}',
  replacement
);

fs.writeFileSync(path, content);
console.log('Patched GraphQLIntrospection root rendering');
