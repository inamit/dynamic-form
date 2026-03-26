import React, { useState } from 'react';
import { Paper, Typography, Box, TextField, Button, Grid } from '@mui/material';

export function GridDesigner({ fields, gridOrder, setGridOrder }: { fields: any[], gridOrder: string[], setGridOrder: (order: string[]) => void }) {
  const [cols, setCols] = useState(2);
  const [cells, setCells] = useState<string[]>([]);

  React.useEffect(() => {
    // initialize layout linearly
    setCells(gridOrder);
  }, [gridOrder]);

  const rows = Math.ceil(cells.length / cols);

  const getGridTemplateAreas = () => {
     let areaStr = "";
     for (let r = 0; r < rows; r++) {
         let rowStr = "";
         for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            const item = cells[idx];
            rowStr += item ? item : ".";
            if (c < cols - 1) rowStr += " ";
         }
         areaStr += `"${rowStr}"\n`;
     }
     return areaStr.trim();
  };

  const updateCell = (idx: number, val: string) => {
     const newCells = [...cells];
     newCells[idx] = val;
     setCells(newCells);

     // Note: for a more complex integration, this component would pass `getGridTemplateAreas()`
     // upstream, but we are keeping the basic prop signatures for now.
     // In a full implementation, `gridTemplateStr` would be updated here.
  };

  return (
    <Paper style={{ padding: '16px', marginTop: '16px', backgroundColor: '#f5f5f5' }}>
      <Typography variant="h6">Grid Designer (Textual / Simple)</Typography>
      <Box mb={2}>
        <TextField
           label="Columns"
           type="number"
           value={cols}
           onChange={e => setCols(Math.max(1, parseInt(e.target.value)))}
           size="small"
        />
      </Box>
      <div style={{
         display: 'grid',
         gridTemplateColumns: `repeat(${cols}, 1fr)`,
         gap: '8px'
      }}>
         {Array.from({ length: rows * cols }).map((_, idx) => (
             <TextField
                key={idx}
                size="small"
                value={cells[idx] || ''}
                onChange={e => updateCell(idx, e.target.value)}
                placeholder="field name or ."
             />
         ))}
      </div>
      <Box mt={2}>
         <Typography variant="subtitle2">Generated CSS grid-template-areas:</Typography>
         <pre style={{ background: '#eee', padding: '8px', borderRadius: '4px' }}>
            {getGridTemplateAreas()}
         </pre>
      </Box>
      <Typography variant="caption" color="textSecondary">
        (For an empty cell, use <code>.</code>)
      </Typography>
    </Paper>
  );
}
