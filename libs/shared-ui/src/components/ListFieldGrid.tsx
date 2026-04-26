import React, {useCallback, useMemo, useRef} from 'react';
import { AgGridReact } from 'ag-grid-react';
import {Box, IconButton, Tooltip} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import type {Enums, FieldConfig} from './DynamicField';
import {ModuleRegistry, themeMaterial} from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import type { ColDef } from 'ag-grid-community';
import {subFieldsToColDefs} from "../utils/agGridUtils";

ModuleRegistry.registerModules([AllEnterpriseModule]);

export interface ListFieldGridProps {
  value: any[];
  onChange: (value: any[]) => void;
  subFields: FieldConfig[];
  enums: Enums;
}

export const ListFieldGrid: React.FC<ListFieldGridProps> = ({ value, onChange, subFields, enums }) => {
  const gridRef = useRef<any>(null);

  const rowData = Array.isArray(value) ? value : [];

  const columnDefs: ColDef[] = subFieldsToColDefs(enums, subFields);

  const onCellValueChanged = useCallback((_: any) => {
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
      width: 50,
      minWidth: 50,
      maxWidth: 50,
      suppressSizeToFit: true,
      resizable: false,
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: '5px'
      },
      headerStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: '5px'
      },
      editable: false,
      filter: false,
      sortable: false,
      lockPosition: 'left',
      cellRenderer: (params: any) => {
        const isDeleted = params.data?._deleted;
        const btnIcon = isDeleted ? <RestoreIcon /> : <DeleteIcon />;
        const color = isDeleted ? 'primary' : 'error';
        const label = isDeleted ? "Restore row" : "Delete row";

        return (
          <Tooltip title={label}>
            <IconButton
              size="small"
              color={color as any}
              onClick={() => handleRowDeleteToggle(params.node)}
              aria-label={label}
            >
              {btnIcon}
            </IconButton>
          </Tooltip>
        );
      },
      headerComponent: () => {
        return (
           <Tooltip title="Add row">
             <IconButton size="small" color="primary" onClick={addRow} aria-label="Add row">
               <AddIcon />
             </IconButton>
           </Tooltip>
        );
      }
    },
    ...columnDefs
  ];

  const rowClassRules = useMemo(() => {
    return {
      'strikethrough-row': (params: any) => {
        return params.data._deleted === true;
      }
    };
  }, []);

  const strikethroughStyles = `
  .strikethrough-row::after {
    content: "";
    position: absolute;
    left: 50px;
    right: 0;
    top: 50%;
    height: 2px;
    background-color: #888;
    z-index: 99;
    pointer-events: none;
  }
  .strikethrough-row {
    color: #888; 
  }
`;
  // Use a workaround typecast for AgGridReact to bypass TypeScript react 18/19 incompatibility
  const Grid = AgGridReact as any;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <div style={{ height: 300, width: '100%' }} data-ag-theme-mode="dark-blue">
        <style>{strikethroughStyles}</style>
        <Grid
          ref={gridRef}
          rowData={rowData}
          columnDefs={finalColumnDefs}
          theme={themeMaterial}
          onCellValueChanged={onCellValueChanged}
          stopEditingWhenCellsLoseFocus={true}
          rowClassRules={rowClassRules}
        />
      </div>
    </Box>
  );
};
