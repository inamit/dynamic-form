const fs = require('fs');
let content = fs.readFileSync('./apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx', 'utf8');

// 1. Change default to tree view
content = content.replace(
  /const \[viewMode, setViewMode\] = useState<'tree' \| 'object'>\('object'\);/,
  "const [viewMode, setViewMode] = useState<'tree' | 'object'>('tree');"
);

// 2. Change the switch button to an mui toggle button
content = content.replace(
  /import \{ Box, Button, Typography, Checkbox, FormControlLabel, Select, MenuItem, Paper, FormControl, InputLabel, TextField \} from '@mui\/material';/,
  "import { Box, Button, Typography, Checkbox, FormControlLabel, Select, MenuItem, Paper, FormControl, InputLabel, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';"
);

const viewToggleUI = `<Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <ToggleButtonGroup
                  color="primary"
                  value={viewMode}
                  exclusive
                  onChange={(e: any, newValue: any) => {
                    if (newValue !== null) {
                      setViewMode(newValue);
                    }
                  }}
                  aria-label="View Mode"
                  size="small"
                >
                  <ToggleButton value="tree">Tree View</ToggleButton>
                  <ToggleButton value="object">Object View</ToggleButton>
                </ToggleButtonGroup>
                <Button variant="outlined" size="small" onClick={handleExpandAll}>Expand All</Button>
                <Button variant="outlined" size="small" onClick={handleCollapseAll}>Collapse All</Button>
            </Box>`;

content = content.replace(
  /<Box sx=\{\{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' \}\}>\s*<Button variant="outlined" size="small" onClick=\{.*?\}\>\s*Switch to .*?\s*<\/Button>\s*<Button variant="outlined" size="small" onClick=\{handleExpandAll\}>Expand All<\/Button>\s*<Button variant="outlined" size="small" onClick=\{handleCollapseAll\}>Collapse All<\/Button>\s*<\/Box>/,
  viewToggleUI
);

// 3. Allow to expand list after it has been selected
content = content.replace(
  /\{isObject && !isSelected && \(\s*<Button type="button" size="small" onClick=\{\(\) => toggleNode\(fieldPath\)\}>\s*\{isExpanded \? 'Collapse' : 'Expand'\}\s*<\/Button>\s*\)\}/,
  `{isObject && (
                   <Button type="button" size="small" onClick={() => toggleNode(fieldPath)}>
                     {isExpanded ? 'Collapse' : 'Expand'}
                   </Button>
                )}`
);

content = content.replace(
  /\{isObject && isExpanded && !isSelected && \(\s*renderTypeNode\(baseType\.name, fieldPath, depth \+ 1\)\s*\)\}/,
  `{isObject && isExpanded && (
                renderTypeNode(baseType.name, fieldPath, depth + 1)
              )}`
);


// 4. In tree view, I see store and stores even though these are not different types.
// 5. Depth 0 type should not be a list
const renderTypeNodeUpdate = `const renderTypeNode = (typeName: string, parentPath: string = '', depth: number = 0) => {
    if (depth > 5) return null; // prevent infinite recursion
    if (viewMode === 'object' && depth > 0) return null;

    const typeObj = getTypeByName(typeName);
    if (!typeObj || !typeObj.fields) return null;

    let fieldsToRender = typeObj.fields;
    if (depth === 0 && viewMode === 'tree') {
      const seenTypes = new Set<string>();
      fieldsToRender = fieldsToRender.map((f: any) => {
        // If it's a list, unwrap the list so the UI sees it as an object at depth 0
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
      });
    }

    return (
      <Box sx={{ ml: depth > 0 ? 3 : 0, mt: 1, borderLeft: depth > 0 ? '1px dashed #ccc' : 'none', pl: depth > 0 ? 2 : 0 }}>
        {fieldsToRender.map((field: any) => {`;

content = content.replace(
  /const renderTypeNode = \(typeName: string, parentPath: string = '', depth: number = 0\) => \{\s*if \(depth > 5\) return null; \/\/ prevent infinite recursion\s*const typeObj = getTypeByName\(typeName\);\s*if \(!typeObj \|\| !typeObj\.fields\) return null;\s*let fieldsToRender = typeObj\.fields;\s*if \(depth === 0 && viewMode === 'tree'\) \{\s*const seenTypes = new Set<string>\(\);\s*fieldsToRender = fieldsToRender\.filter\(\(f: any\) => \{\s*const baseType = getBaseType\(f\.type\);\s*if \(!baseType \|\| !baseType\.name\) return false;\s*if \(seenTypes\.has\(baseType\.name\)\) return false;\s*seenTypes\.add\(baseType\.name\);\s*return true;\s*\}\);\s*\}\s*return \(\s*<Box sx=\{\{ ml: depth > 0 \? 3 : 0, mt: 1, borderLeft: depth > 0 \? '1px dashed #ccc' : 'none', pl: depth > 0 \? 2 : 0 \}\}>\s*\{fieldsToRender\.map\(\(field: any\) => \{/,
  renderTypeNodeUpdate
);


// 6. Selection of all fields inside an object/list doesn't work.
// 7. Make sure you don't select subfields of Enum as well.
// 8. When selecting an Object field, it shouldn't actually be added as a field. Just selecting its subfields.
// 9. For selected subfields of a list, make sure you're adding the parentField to the field configuration.

const toggleFieldsLogic = `                        const toggleFields = (tName: string, cPath: string, check: boolean, isParentList: boolean, toggleDepth: number = 0) => {
                            if (toggleDepth > 5) return;
                            const tObj = getTypeByName(tName);
                            if (!tObj || !tObj.fields) return;

                            tObj.fields.forEach((f: any) => {
                                const fBase = getBaseType(f.type);
                                const fIsList = isListType(f.type);
                                const fPath = \`\${cPath}.\${f.name}\`;

                                if (check) {
                                    newSelected[fPath] = {
                                        name: f.name,
                                        label: f.description || f.name,
                                        type: inferFieldType(fBase, fIsList),
                                        targetType: fBase.kind === 'OBJECT' || fBase.kind === 'ENUM' || fBase.name === 'Enum' ? fBase.name : null,
                                        parentField: isParentList ? cPath : null
                                    };
                                    if (fBase.kind === 'OBJECT' && fBase.name !== 'Location' && fBase.name !== 'Enum') {
                                        toggleFields(fBase.name, fPath, check, isParentList || fIsList, toggleDepth + 1);
                                    }
                                } else {
                                    delete newSelected[fPath];
                                    if (fBase.kind === 'OBJECT' && fBase.name !== 'Location' && fBase.name !== 'Enum') {
                                        toggleFields(fBase.name, fPath, check, isParentList || fIsList, toggleDepth + 1);
                                    }
                                }
                            });
                        };

                        if (e.target.checked) {
                          if (isListType(field.type)) {
                            newSelected[fieldPath] = {
                              name: field.name,
                              label: field.description || field.name,
                              type: inferFieldType(getBaseType(field.type), true),
                              targetType: baseType.kind === 'OBJECT' || baseType.kind === 'ENUM' || baseType.name === 'Enum' ? baseType.name : null
                            };
                          } else if (baseType.kind !== 'OBJECT' || baseType.name === 'Location' || baseType.name === 'Enum') {
                            newSelected[fieldPath] = {
                              name: field.name,
                              label: field.description || field.name,
                              type: inferFieldType(getBaseType(field.type), false),
                              targetType: baseType.kind === 'ENUM' || baseType.name === 'Enum' ? baseType.name : null
                            };
                          }

                          if (baseType.kind === 'OBJECT' && baseType.name !== 'Location' && baseType.name !== 'Enum') {
                              toggleFields(baseType.name, fieldPath, true, isListType(field.type));
                          }
                        } else {
                          delete newSelected[fieldPath];
                          if (baseType.kind === 'OBJECT' && baseType.name !== 'Location' && baseType.name !== 'Enum') {
                              toggleFields(baseType.name, fieldPath, false, isListType(field.type));
                          }
                        }
                        setSelectedFields(newSelected);
                      }`;

content = content.replace(
  /const toggleFields = \(tName: string, check: boolean, depth: number = 0\) => \{[\s\S]*?setSelectedFields\(newSelected\);\s*\}/,
  toggleFieldsLogic
);

fs.writeFileSync('./apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx', content);
