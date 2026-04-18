const fs = require('fs');

let content = fs.readFileSync('./apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx', 'utf8');

// Fix 1: Enum inference logic
// "When there is a custom object called Enum, map it to enum."
// Currently it's: `if (baseType.kind === 'ENUM') return 'enum';`
// Change it to check name 'Enum' for OBJECT instead of relying on the GraphQL ENUM kind.
// It seems the user meant: map an OBJECT named "Enum" to 'enum'.
// Also need to preserve standard Enum logic if that's what was intended, but let's strictly do what they said: "When there is a custom object called Enum, map it to enum."
content = content.replace(
  /if \(baseType\.kind === 'ENUM'\) return 'enum';\s*if \(baseType\.kind === 'OBJECT'\) \{/g,
  "if (baseType.kind === 'ENUM') return 'enum';\n    if (baseType.kind === 'OBJECT') {\n        if (baseType.name === 'Enum') return 'enum';"
);


// Fix 2 & 3: Tree view vs Object view toggle
// Let's add a state for viewMode: 'tree' | 'object'
if (!content.includes('const [viewMode, setViewMode] = useState<\'tree\' | \'object\'>(\'object\');')) {
    content = content.replace(
        'const [error, setError] = useState(\'\');',
        'const [error, setError] = useState(\'\');\n  const [viewMode, setViewMode] = useState<\'tree\' | \'object\'>(\'object\');'
    );
}

// Update the render logic at the bottom
const renderObjectView = `              {viewMode === 'object' ? (
                schema.types.filter((t: any) => t.kind === 'OBJECT' && !t.name.startsWith('__') && !['Query', 'Mutation', 'Subscription'].includes(t.name)).map((t: any) => (
                  <Box key={t.name} sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                      {t.name}
                      <Button size="small" onClick={() => toggleNode(t.name)} sx={{ ml: 2 }}>{expandedNodes[t.name] ? 'Collapse' : 'Expand'}</Button>
                    </Typography>
                    {expandedNodes[t.name] && renderTypeNode(t.name)}
                  </Box>
                ))
              ) : (
                renderTypeNode(schema.queryType?.name || 'Query')
              )}`;

content = content.replace(
  /\{schema\.types\.filter\(\(t: any\) => t\.kind === 'OBJECT' && !t\.name\.startsWith\('__'\) && !\['Query', 'Mutation', 'Subscription'\]\.includes\(t\.name\)\)\.map\(\(t: any\) => \(\s*<Box key=\{t\.name\} sx=\{\{ mb: 4 \}\}>\s*<Typography variant="subtitle1" fontWeight="bold" sx=\{\{ bgcolor: 'action\.hover', p: 1, borderRadius: 1 \}\}>\{t\.name\}<\/Typography>\s*\{renderTypeNode\(t\.name\)\}\s*<\/Box>\s*\)\)\}/g,
  renderObjectView
);


// Add a toggle button next to Expand/Collapse all
const viewToggleUI = `
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <Button variant="outlined" size="small" onClick={() => setViewMode(viewMode === 'object' ? 'tree' : 'object')}>
                   Switch to {viewMode === 'object' ? 'Tree View' : 'Object View'}
                </Button>
                <Button variant="outlined" size="small" onClick={handleExpandAll}>Expand All</Button>
                <Button variant="outlined" size="small" onClick={handleCollapseAll}>Collapse All</Button>
            </Box>
`;

content = content.replace(
  /<Box sx=\{\{ display: 'flex', gap: 2, mb: 2 \}\}>\s*<Button variant="outlined" size="small" onClick=\{handleExpandAll\}>Expand All<\/Button>\s*<Button variant="outlined" size="small" onClick=\{handleCollapseAll\}>Collapse All<\/Button>\s*<\/Box>/g,
  viewToggleUI
);


// Initialize object view expansion state to true to replicate old behavior, but controlled by state
// Let's modify handleExpandAll / handleCollapseAll to make sure it includes the root objects when in object mode
const expandLogicNew = `  const handleExpandAll = () => {
    let allExpanded: Record<string, boolean> = {};
    if (viewMode === 'object') {
       const rootTypes = schema.types.filter((t: any) => t.kind === 'OBJECT' && !t.name.startsWith('__') && !['Query', 'Mutation', 'Subscription'].includes(t.name));
       rootTypes.forEach((t: any) => {
           allExpanded[t.name] = true;
           allExpanded = { ...allExpanded, ...expandAllFields(t.name) };
       });
    } else {
       allExpanded = expandAllFields(schema.queryType?.name || 'Query');
    }
    setExpandedNodes(allExpanded);
  };`;

content = content.replace(
  /const handleExpandAll = \(\) => \{[\s\S]*?setExpandedNodes\(allExpanded\);\s*\};/g,
  expandLogicNew
);


fs.writeFileSync('./apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx', content);
