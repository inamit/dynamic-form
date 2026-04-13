import React, { useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Box, Button } from '@mui/material';
import type { FieldConfig } from './DynamicField';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef } from 'ag-grid-community';

export interface ListFieldGridProps {
  value: any[];
  onChange: (value: any[]) => void;
  subFields: FieldConfig[];
}

export const ListFieldGrid: React.FC<ListFieldGridProps> = ({ value, onChange, subFields }) => {
  const gridRef = useRef<any>(null);

  const rowData = Array.isArray(value) ? value : [];

  const columnDefs: ColDef[] = subFields.map(field => {
    let colDef: ColDef = {
      field: field.name,
      headerName: field.label || field.name,
      editable: true,
    };

    if (field.type === 'number') {
      colDef.valueParser = (params: any) => Number(params.newValue);
    } else if (field.type === 'checkbox') {
      colDef.cellEditor = 'agCheckboxCellEditor';
    }

    return colDef;
  });

  const onCellValueChanged = useCallback((event: any) => {
    const updatedData: any[] = [];
    gridRef.current!.api.forEachNode((node: any) => updatedData.push(node.data));
    onChange(updatedData);
  }, [onChange]);

  const addRow = useCallback(() => {
    const newRow: Record<string, any> = {};
    subFields.forEach(f => {
      newRow[f.name] = f.type === 'checkbox' ? false : (f.type === 'number' ? 0 : '');
    });

    onChange([...rowData, newRow]);
  }, [onChange, rowData, subFields]);

  const deleteSelectedRows = useCallback(() => {
    const selectedNodes = gridRef.current!.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node: any) => node.data);
    const updatedData = rowData.filter(row => !selectedData.includes(row));
    onChange(updatedData);
  }, [onChange, rowData]);

  // Use a workaround typecast for AgGridReact to bypass TypeScript react 18/19 incompatibility
  const Grid = AgGridReact as any;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
         <Button variant="outlined" size="small" onClick={addRow}>Add Row</Button>
         <Button variant="outlined" color="error" size="small" onClick={deleteSelectedRows}>Delete Selected</Button>
      </Box>
      <div className="ag-theme-alpine" style={{ height: 300, width: '100%' }}>
        <Grid
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          onCellValueChanged={onCellValueChanged}
          rowSelection="multiple"
          stopEditingWhenCellsLoseFocus={true}
        />
      </div>
    </Box>
  );
};
