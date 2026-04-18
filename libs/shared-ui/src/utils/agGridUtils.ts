import type {ColDef, ValueFormatterParams} from "ag-grid-community";
import type {Enums, FieldConfig} from "../components/DynamicField";

const enumValueFormatter = (enums: Enums, field: FieldConfig) => (params: ValueFormatterParams) => {
    if (!params.value) return;
    const dict = enums[field.enumName ?? ''];
    if (dict) {
        const matched = dict.find(e => e.code === params.value);
        if (matched) return matched.value;
    }
    return params.value;
};

export const subFieldsToColDefs = (enums: Enums, subFields: FieldConfig[]) =>
    subFields.map(field => {
        let colDef: ColDef = {
            field: field.name,
            headerName: field.label || field.name,
            editable: (params) => !params.data._deleted,
            filter: true
        };

        if (field.type === 'number') {
            colDef.cellDataType = 'number';
            colDef.valueParser = (params: any) => Number(params.newValue);
        } else if (field.type === 'checkbox') {
            colDef.cellDataType = 'boolean';
            colDef.cellEditor = 'agCheckboxCellEditor';
        } else if (field.type === 'enum' && field.enumName && enums) {
            colDef.cellDataType = 'number';
            colDef.cellEditor = 'agSelectCellEditor';
            colDef.cellEditorParams = {
                values: enums[field.enumName] ? [null, ...enums[field.enumName].map(e => e.code)] : []
            };
            colDef.valueFormatter = enumValueFormatter(enums, field);
            colDef.filter = 'agSetColumnFilter';
            colDef.filterParams = {
                valueFormatter: enumValueFormatter(enums, field)
            };
        }

        return colDef;
    });
