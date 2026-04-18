const fs = require('fs');

const path = './apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add helper functions
const helpers = `
  const isListType = (type: any): boolean => {
    if (!type) return false;
    if (type.kind === 'LIST') return true;
    if (type.ofType) return isListType(type.ofType);
    return false;
  };

  const inferFieldType = (baseType: any, isList: boolean) => {
    if (isList) return 'list';
    if (!baseType) return 'text';

    if (baseType.kind === 'ENUM') return 'enum';
    if (baseType.kind === 'OBJECT') {
        if (baseType.name === 'Location') return 'coordinate';
        return 'object';
    }

    if (baseType.name === 'String') return 'text';
    if (baseType.name === 'Boolean') return 'checkbox';
    if (baseType.name === 'Int' || baseType.name === 'Float') return 'number';

    return 'text';
  };

  const getTypeString = (type: any): string => {
    if (!type) return '';
    if (type.kind === 'NON_NULL') return getTypeString(type.ofType) + '!';
    if (type.kind === 'LIST') return '[' + getTypeString(type.ofType) + ']';
    return type.name || '';
  };
`;

content = content.replace(
  '  const getTypeByName = (typeName: string) => {',
  helpers + '\n  const getTypeByName = (typeName: string) => {'
);


// Replace the map implementation
content = content.replace(
  'const baseType = getBaseType(field.type);',
  `const baseType = getBaseType(field.type);
          const isList = isListType(field.type);
          const inferredType = inferFieldType(baseType, isList);
          const typeString = getTypeString(field.type);`
);

content = content.replace(
  'type: isObject ? \'object\' : \'text\',',
  'type: inferredType,'
);

content = content.replace(
  'label={`${field.name} (${baseType.name}) - ${field.description || \'\'}`}',
  'label={`${field.name} (${typeString}) - ${field.description || \'\'}`}'
);

content = content.replace(
  'value={selectedFields[fieldPath]?.targetType || (isObject ? \'text\' : \'text\')}',
  'value={selectedFields[fieldPath]?.type || inferredType}'
);

content = content.replace(
  '<MenuItem value="enum">Enum</MenuItem>\n                      <MenuItem value="coordinate">Coordinate</MenuItem>',
  '<MenuItem value="enum">Enum</MenuItem>\n                      <MenuItem value="coordinate">Coordinate</MenuItem>\n                      <MenuItem value="list">List</MenuItem>\n                      <MenuItem value="object">Object</MenuItem>'
);

fs.writeFileSync(path, content);
console.log('Patched GraphQLIntrospection for list and type inference');
