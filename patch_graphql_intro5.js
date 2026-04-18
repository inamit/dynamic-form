const fs = require('fs');

const path = './apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacementLogic = `                      onChange={(e) => {
                        let newSelected = { ...selectedFields };

                        // Helper to recursively toggle fields
                        const toggleFields = (tName: string, currentPath: string, check: boolean) => {
                            const tObj = getTypeByName(tName);
                            if (!tObj || !tObj.fields) return;

                            tObj.fields.forEach((f: any) => {
                                const fBase = getBaseType(f.type);
                                const fIsList = isListType(f.type);
                                const fTypeStr = getTypeString(f.type);
                                const fPath = \`\${currentPath}.\${f.name}\`;

                                if (check) {
                                    newSelected[fPath] = {
                                        name: f.name,
                                        label: f.description || f.name,
                                        type: inferFieldType(fBase, fIsList),
                                        targetType: fBase.kind === 'OBJECT' || fBase.kind === 'ENUM' ? fBase.name : null
                                    };
                                    if (fBase.kind === 'OBJECT' && fBase.name !== 'Location') {
                                        toggleFields(fBase.name, fPath, check);
                                    }
                                } else {
                                    delete newSelected[fPath];
                                    if (fBase.kind === 'OBJECT' && fBase.name !== 'Location') {
                                        toggleFields(fBase.name, fPath, check);
                                    }
                                }
                            });
                        };

                        if (e.target.checked) {
                          newSelected[fieldPath] = {
                            name: field.name,
                            label: field.description || field.name,
                            type: inferredType,
                            targetType: baseType.kind === 'OBJECT' || baseType.kind === 'ENUM' ? baseType.name : null
                          };
                          // If it's an object, auto-select subfields
                          if (baseType.kind === 'OBJECT' && baseType.name !== 'Location') {
                              toggleFields(baseType.name, fieldPath, true);
                          }
                        } else {
                          delete newSelected[fieldPath];
                          // If it's an object, auto-deselect subfields
                          if (baseType.kind === 'OBJECT' && baseType.name !== 'Location') {
                              toggleFields(baseType.name, fieldPath, false);
                          }
                        }
                        setSelectedFields(newSelected);
                      }}`;

content = content.replace(
  `                      onChange={(e) => {
                        const newSelected = { ...selectedFields };
                        if (e.target.checked) {
                          newSelected[fieldPath] = {
                            name: field.name,
                            label: field.description || field.name,
                            type: inferredType,
                            targetType: isObject ? baseType.name : null
                          };
                        } else {
                          delete newSelected[fieldPath];
                        }
                        setSelectedFields(newSelected);
                      }}`,
  replacementLogic
);

fs.writeFileSync(path, content);
console.log('Patched GraphQLIntrospection for recursive selection');
