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
                  onChange={(e, newValue) => {
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
// 5. When checking the box next to the object (Store), it hides everything even though its supposed to check all fields below it recursively.
// Wait, the "tree view" was rendering `schema.queryType.name` which has fields `store` and `stores`.
// To avoid showing them as query names, if it's "tree view" we should probably just render the root objects, and object view is flat?
// The user said: "In tree view, I see store and stores even though these are not different types."
// The tree view is supposed to show unique root types (Option A) that we agreed upon before, not the query fields.
// In the current code:
// {viewMode === 'object' ? ( ... filter OBJECT ... ) : renderTypeNode(schema.queryType.name)}
// This is backwards! The user called the one with "store/stores" the "tree view" because it's a deep tree starting from Query.
// But they DO NOT want `store/stores`. They want the unique types.
// Let's swap the meanings or adjust what Tree View renders.
// If "Tree view" is the default, and it should show hierarchy but starting from Unique Types.
// Let's redefine Tree View to list unique root types, and their fields as a tree.
// And what is "Object view"? Maybe just a flat list of objects without expanding?
// Let's make both just render the unique root types, but maybe Object view doesn't nest? No, they said "This is no longer organized in a 'tree' view." about the root types.
// Ah! `schema.queryType` IS a tree because it starts from Query and you expand down.
// The root types list is just "Object view" (a list of objects).
// So they WANT a tree view (starting from Query?) BUT they complained "I see store and stores even though these are not different types".
// Wait, if they don't want store/stores, they don't want to start from Query fields.
// They want a tree of *Types*, maybe? Or they just want the Root Types but they want it to look like a tree?
// Let's look at `renderTypeNode`. `renderTypeNode` recursively calls itself. So both views are trees.
// The issue with "When checking the box next to the object (Store), it hides everything" is because of the `!isSelected` check!
// Let's look at the check we just removed: `{isObject && isExpanded && !isSelected && ...}`
// Because it had `!isSelected`, checking the box hid the children! Removing `!isSelected` fixes that.

// What about "In tree view, I see store and stores even though these are not different types."
// If `viewMode` 'tree' renders `schema.queryType?.name`, it will render `store` and `stores`.
// How to group them or hide duplicates?
// We can just filter out duplicates by base type in `renderTypeNode` if we are at depth 0.
const renderTypeNodeUpdate = `const renderTypeNode = (typeName: string, parentPath: string = '', depth: number = 0) => {
    if (depth > 5) return null; // prevent infinite recursion

    const typeObj = getTypeByName(typeName);
    if (!typeObj || !typeObj.fields) return null;

    let fieldsToRender = typeObj.fields;
    if (depth === 0 && viewMode === 'tree') {
      const seenTypes = new Set<string>();
      fieldsToRender = fieldsToRender.filter((f: any) => {
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
  /const renderTypeNode = \(typeName: string, parentPath: string = '', depth: number = 0\) => \{\s*if \(depth > 5\) return null; \/\/ prevent infinite recursion\s*const typeObj = getTypeByName\(typeName\);\s*if \(!typeObj \|\| !typeObj\.fields\) return null;\s*return \(\s*<Box sx=\{\{ ml: depth > 0 \? 3 : 0, mt: 1, borderLeft: depth > 0 \? '1px dashed #ccc' : 'none', pl: depth > 0 \? 2 : 0 \}\}>\s*\{typeObj\.fields\.map\(\(field: any\) => \{/,
  renderTypeNodeUpdate
);

fs.writeFileSync('./apps/management-client/src/features/EntityEditor/GraphQLIntrospection.tsx', content);
