const fs = require('fs');
const path = './apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `                        const toggleFields = (tName: string, currentPath: string, check: boolean, depth: number = 0) => {
                            if (depth > 5) return;
                            const tObj = getTypeByName(tName);
                            if (!tObj || !tObj.fields) return;

                            tObj.fields.forEach((f: any) => {
                                const fBase = getBaseType(f.type);
                                const fIsList = isListType(f.type);
                                const fTypeStr = getTypeString(f.type);
                                const fPath = \\\`\\\${currentPath}.\\\${f.name}\\\`;

                                if (check) {
                                    newSelected[fPath] = {
                                        name: f.name,
                                        label: f.description || f.name,
                                        type: inferFieldType(fBase, fIsList),
                                        targetType: fBase.kind === 'OBJECT' || fBase.kind === 'ENUM' ? fBase.name : null
                                    };
                                    if (fBase.kind === 'OBJECT' && fBase.name !== 'Location') {
                                        toggleFields(fBase.name, fPath, check, depth + 1);
                                    }
                                } else {
                                    delete newSelected[fPath];
                                    if (fBase.kind === 'OBJECT' && fBase.name !== 'Location') {
                                        toggleFields(fBase.name, fPath, check, depth + 1);
                                    }
                                }
                            });
                        };`;

content = content.replace(
  /const toggleFields = \(tName: string, currentPath: string, check: boolean\) => {[\s\S]*?delete newSelected\[fPath\];\s*if \(fBase\.kind === 'OBJECT' && fBase\.name !== 'Location'\) {\s*toggleFields\(fBase\.name, fPath, check\);\s*}\s*}\s*}\);\s*};/,
  replacement.replace(/\\`/g, '`')
);

fs.writeFileSync(path, content);
console.log('Fixed toggleFields recursion bug');
