const fs = require('fs');

let intro = fs.readFileSync('./apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx', 'utf8');

// Fix 1: Remove unused typeString and inferredType
intro = intro.replace(/const inferredType = inferFieldType\(baseType, isList\);\s*const typeString = getTypeString\(field\.type\);\s*/, '');

// Fix 2: Remove unused cPath
intro = intro.replace(/const toggleFields = \(tName: string, cPath: string, check: boolean, depth: number = 0\) => \{/g, 'const toggleFields = (tName: string, check: boolean, depth: number = 0) => {');

// Fix 3: Also update where it is called to avoid TS errors
intro = intro.replace(/toggleFields\(fBase\.name, fPath, check, depth \+ 1\);/g, 'toggleFields(fBase.name, check, depth + 1);');
intro = intro.replace(/toggleFields\(baseType\.name, fieldPath, true\);/g, 'toggleFields(baseType.name, true);');
intro = intro.replace(/toggleFields\(baseType\.name, fieldPath, false\);/g, 'toggleFields(baseType.name, false);');

// The typeString wasn't properly used, let's fix it where it was used
// It looks like line 231 uses typeString. Wait, it used getTypeString directly or via variable.
intro = intro.replace(/typeString/g, 'getTypeString(field.type)');

fs.writeFileSync('./apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx', intro);
