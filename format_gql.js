const getTypeString = (type) => {
    if (!type) return '';
    if (type.kind === 'NON_NULL') return getTypeString(type.ofType) + '!';
    if (type.kind === 'LIST') return '[' + getTypeString(type.ofType) + ']';
    return type.name;
};

console.log(getTypeString({ kind: 'LIST', ofType: { kind: 'OBJECT', name: 'Store' } }));
console.log(getTypeString({ kind: 'NON_NULL', ofType: { kind: 'LIST', ofType: { kind: 'NON_NULL', ofType: { kind: 'OBJECT', name: 'Store' } } } }));
