const fs = require('fs');

const path = './apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add existingFields to Props
content = content.replace(
  'interface Props {\n  dataSourceUrl: string;',
  'interface Props {\n  dataSourceUrl: string;\n  existingFields?: any[];'
);

content = content.replace(
  'export default function GraphQLIntrospection({ dataSourceUrl, dataSourceHeaders, onFieldsSelected, onOperationsSelected }: Props) {',
  'export default function GraphQLIntrospection({ dataSourceUrl, dataSourceHeaders, onFieldsSelected, onOperationsSelected, existingFields }: Props) {\n  const [hasInitializedFields, setHasInitializedFields] = useState(false);'
);

// 2. Add an effect to initialize fields from existingFields
const effectInitFields = `
  useEffect(() => {
    if (!schema || !existingFields || hasInitializedFields) return;
    const newSelected: { [key: string]: any } = {};

    // We will loosely map existing fields if they exist
    existingFields.forEach(f => {
       // Only standard mapping possible here without knowing deep paths,
       // but typically top level fields will match exactly.
       newSelected[f.name] = {
          name: f.name,
          label: f.label || f.name,
          type: f.type || 'text',
          targetType: f.type === 'list' || f.type === 'object' ? null : null // Target type logic is complex here
       };
    });

    if (Object.keys(newSelected).length > 0) {
       setSelectedFields(newSelected);
    }
    setHasInitializedFields(true);
  }, [schema, existingFields, hasInitializedFields]);
`;

content = content.replace(
  '  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});',
  '  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});\n' + effectInitFields
);

// Add missing react import for useEffect if not there
if (content.includes('import { useState }')) {
    content = content.replace('import { useState }', 'import { useState, useEffect }');
}

fs.writeFileSync(path, content);
console.log('Patched GraphQLIntrospection with init fields');
