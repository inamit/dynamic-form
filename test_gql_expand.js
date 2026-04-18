const schema = {
    types: [
        {
            name: 'Store',
            fields: [
                { name: 'id', type: { kind: 'SCALAR', name: 'ID' } },
                { name: 'name', type: { kind: 'SCALAR', name: 'String' } },
                { name: 'location', type: { kind: 'OBJECT', name: 'Location' } }
            ]
        },
        {
            name: 'Location',
            fields: [
                { name: 'lat', type: { kind: 'SCALAR', name: 'Float' } },
                { name: 'lng', type: { kind: 'SCALAR', name: 'Float' } }
            ]
        }
    ]
};

const getBaseType = (type) => {
    if (!type) return {};
    if (type.ofType) return getBaseType(type.ofType);
    return type;
};

const getTypeByName = (typeName) => {
    return schema.types.find(t => t.name === typeName);
};

const expandAllFields = (typeName, parentPath = '', currentExpanded = {}) => {
    const typeObj = getTypeByName(typeName);
    if (!typeObj || !typeObj.fields) return currentExpanded;

    const newExpanded = { ...currentExpanded };
    typeObj.fields.forEach(field => {
        const baseType = getBaseType(field.type);
        const fieldPath = parentPath ? `${parentPath}.${field.name}` : field.name;

        if (baseType.kind === 'OBJECT') {
            newExpanded[fieldPath] = true;
            Object.assign(newExpanded, expandAllFields(baseType.name, fieldPath, newExpanded));
        }
    });
    return newExpanded;
};

console.log(expandAllFields('Store'));
