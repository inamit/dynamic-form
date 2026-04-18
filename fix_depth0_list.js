const fs = require('fs');

let content = fs.readFileSync('./apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx', 'utf8');

const replacement = `      fieldsToRender = fieldsToRender.map((f: any) => {
        // If it's a list, unwrap the list so the UI sees it as an object
        if (isListType(f.type)) {
           return { ...f, type: getBaseType(f.type) };
        }
        return f;
      }).filter((f: any) => {
        const baseType = getBaseType(f.type);
        if (!baseType || !baseType.name) return false;
        if (seenTypes.has(baseType.name)) return false;
        seenTypes.add(baseType.name);
        return true;
      });`;

content = content.replace(
  /fieldsToRender = fieldsToRender\.filter\(\(f: any\) => \{[\s\S]*?return true;\s*\}\);/,
  replacement
);

fs.writeFileSync('./apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx', content);
