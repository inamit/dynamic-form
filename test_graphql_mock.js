const type1 = {
    kind: 'OBJECT',
    name: 'Store'
}
const type2 = {
    kind: 'LIST',
    ofType: {
        kind: 'OBJECT',
        name: 'Store'
    }
}
const type3 = {
    kind: 'NON_NULL',
    ofType: {
        kind: 'LIST',
        ofType: {
            kind: 'NON_NULL',
            ofType: {
                kind: 'OBJECT',
                name: 'Store'
            }
        }
    }
}

const isListType = (type) => {
    if (!type) return false;
    if (type.kind === 'LIST') return true;
    if (type.ofType) return isListType(type.ofType);
    return false;
}
console.log(isListType(type1));
console.log(isListType(type2));
console.log(isListType(type3));
