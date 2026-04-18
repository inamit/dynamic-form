const fs = require('fs');

const path = './apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx';
let content = fs.readFileSync(path, 'utf8');

// 3. Add expandAll and collapseAll logic
const expandLogic = `
  const expandAllFields = (typeName: string, currentPath: string = '', depth: number = 0, currentExpanded: Record<string, boolean> = {}): Record<string, boolean> => {
    if (depth > 5) return currentExpanded;
    const typeObj = getTypeByName(typeName);
    if (!typeObj || !typeObj.fields) return currentExpanded;

    const newExpanded = { ...currentExpanded };
    typeObj.fields.forEach((field: any) => {
        const baseType = getBaseType(field.type);
        const fieldPath = currentPath ? \`\${currentPath}.\${field.name}\` : field.name;

        if (baseType.kind === 'OBJECT') {
            newExpanded[fieldPath] = true;
            Object.assign(newExpanded, expandAllFields(baseType.name, fieldPath, depth + 1, newExpanded));
        }
    });
    return newExpanded;
  };

  const handleExpandAll = () => {
    const rootTypes = schema.types.filter((t: any) => t.kind === 'OBJECT' && !t.name.startsWith('__') && !['Query', 'Mutation', 'Subscription'].includes(t.name));
    let allExpanded = {};
    rootTypes.forEach((t: any) => {
        allExpanded = { ...allExpanded, ...expandAllFields(t.name) };
    });
    setExpandedNodes(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedNodes({});
  };
`;

content = content.replace(
  '  const toggleNode = (path: string) => {',
  expandLogic + '\n  const toggleNode = (path: string) => {'
);


// 4. Add UI for buttons
const buttonsUI = `
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button variant="outlined" size="small" onClick={handleExpandAll}>Expand All</Button>
                <Button variant="outlined" size="small" onClick={handleCollapseAll}>Collapse All</Button>
            </Box>
`;

content = content.replace(
  '<Box sx={{ mt: 2 }}>\n              {renderTypeNode(schema.queryType?.name || \'Query\')}\n            </Box>',
  buttonsUI + '\n            <Box sx={{ mt: 2 }}>\n              {renderTypeNode(schema.queryType?.name || \'Query\')}\n            </Box>'
);

fs.writeFileSync(path, content);
console.log('Patched GraphQLIntrospection with expand/collapse all');
