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
}

export const ListFieldGrid: React.FC<ListFieldGridProps> = ({ value, onChange, subFields }) => {
  const gridRef = useRef<any>(null);

  const rowData = Array.isArray(value) ? value : [];

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
      // NOTE: For enum filtering, we could use agSelectCellEditor, but without full async enum fetching in this isolated grid context,
      // text input is a safe fallback. We'll use text filter.
      colDef.filter = 'agTextColumnFilter';
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
    if (!selectedNodes.length) return;

    // For simplicity, we actually remove them rather than mark deleted.
    const selectedData = selectedNodes.map((node: any) => node.data);
    const updatedData = rowData.filter(row => !selectedData.includes(row));
    onChange(updatedData);
  }, [onChange, rowData]);

  // Use a workaround typecast for AgGridReact to bypass TypeScript react 18/19 incompatibility
  const Grid = AgGridReact as any;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <div style={{ height: 300, width: '100%' }} data-ag-theme-mode="system">
        <Grid
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          theme={themeMaterial}
          onCellValueChanged={onCellValueChanged}
          rowSelection={{ mode: "multiRow" }}
          stopEditingWhenCellsLoseFocus={true}
        />
      </div>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
         <Button variant="outlined" size="small" onClick={addRow}>Add Row</Button>
         <Button variant="outlined" color="error" size="small" onClick={deleteSelectedRows}>Delete Selected</Button>
      </Box>
    </Box>
  );
};
