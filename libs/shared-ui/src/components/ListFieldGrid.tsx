import React, { useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Box, Button } from '@mui/material';
import type { FieldConfig } from './DynamicField';
import { ColDef, ModuleRegistry, AllCommunityModule, themeMaterial } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

export interface ListFieldGridProps {
  value: any[];
  onChange: (value: any[]) => void;
  subFields: FieldConfig[];
  enumValues?: { code: string; value: string }[];
}

export const ListFieldGrid: React.FC<ListFieldGridProps> = ({ value, onChange, subFields, enumValues }) => {
  const gridRef = useRef<any>(null);

  const rowData = Array.isArray(value) ? value : [];
  const [enumDictionaries, setEnumDictionaries] = React.useState<Record<string, { code: string; value: string }[]>>({});

  React.useEffect(() => {
    subFields.forEach((field) => {
      if (field.type === 'enum' && field.enumName && !enumDictionaries[field.name]) {
        if (enumValues && enumValues.length > 0) {
            setEnumDictionaries((prev) => ({ ...prev, [field.name]: enumValues }));
        }
      }
    });
  }, [subFields, enumDictionaries, enumValues]);

  const columnDefs: ColDef[] = subFields.map(field => {
    let colDef: ColDef = {
      field: field.name,
      headerName: field.label || field.name,
      editable: true,
      filter: true,
    };

    if (field.type === 'number') {
      colDef.valueParser = (params: any) => Number(params.newValue);
    } else if (field.type === 'checkbox') {
      colDef.cellEditor = 'agCheckboxCellEditor';
    } else if (field.type === 'enum' && field.enumName) {
      colDef.cellEditor = 'agSelectCellEditor';
      colDef.cellEditorParams = {
        values: enumDictionaries[field.name] ? enumDictionaries[field.name].map(e => e.code) : []
      };
      colDef.valueFormatter = (params: any) => {
          if (!params.value) return '';
          const dict = enumDictionaries[field.name];
          if (dict) {
              const matched = dict.find(e => e.code === params.value);
              if (matched) return matched.value;
          }
          return params.value;
      };
      colDef.filter = 'agSetColumnFilter';
    }

    return colDef;
  });

  const onCellValueChanged = useCallback((event: any) => {
    const updatedData: any[] = [];
    gridRef.current!.api.forEachNode((node: any) => updatedData.push(node.data));
    onChange(updatedData);
  }, [onChange]);

  const addRow = useCallback(() => {
    const newRow: Record<string, any> = { _id: Date.now(), _deleted: false };
    subFields.forEach(f => {
      newRow[f.name] = f.type === 'checkbox' ? false : (f.type === 'number' ? 0 : '');
    });

    onChange([...rowData, newRow]);
  }, [onChange, rowData, subFields]);

  const handleRowDeleteToggle = useCallback((node: any) => {
    const updatedData = rowData.map(row => {
      if (row === node.data) {
        return { ...row, _deleted: !row._deleted };
      }
      return row;
    });
    onChange(updatedData);
  }, [onChange, rowData]);

  const finalColumnDefs = [
    {
      headerName: '',
      field: '_action',
      width: 100,
      editable: false,
      filter: false,
      sortable: false,
      cellRenderer: (params: any) => {
        const isDeleted = params.data?._deleted;
        const btnText = isDeleted ? 'Restore' : 'Delete';
        const color = isDeleted ? 'primary' : 'error';

        return (
          <Button
            size="small"
            color={color as any}
            onClick={() => handleRowDeleteToggle(params.node)}
          >
            {btnText}
          </Button>
        );
      },
      headerComponent: () => {
        return (
           <Button size="small" variant="contained" onClick={addRow}>Add</Button>
        );
      }
    },
    ...columnDefs
  ];

  const getRowStyle = (params: any) => {
    if (params.data?._deleted) {
      return { textDecoration: 'line-through', opacity: 0.5 };
    }
    return undefined;
  };

  // Use a workaround typecast for AgGridReact to bypass TypeScript react 18/19 incompatibility
  const Grid = AgGridReact as any;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <div style={{ height: 300, width: '100%' }} data-ag-theme-mode="system">
        <Grid
          ref={gridRef}
          rowData={rowData}
          columnDefs={finalColumnDefs}
          theme={themeMaterial}
          onCellValueChanged={onCellValueChanged}
          rowSelection={{ mode: "multiRow" }}
          stopEditingWhenCellsLoseFocus={true}
          getRowStyle={getRowStyle}
        />
      </div>
    </Box>
  );
};
