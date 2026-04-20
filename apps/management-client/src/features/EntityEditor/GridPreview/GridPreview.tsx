import { useState, useEffect } from "react";
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import {DynamicField, type Enums} from '@dynamic-form/shared-ui';

interface Field {
  name: string;
  type: string;
  label: string;
  parentField?: string | null;
  enumName?: string;
}

interface GridItem {
  id: string;
  colSpan: number;
  rowSpan: number;
}
interface Props {
  fields: Field[];
  enums: Enums;
  gridTemplate: string;
  defaultValues?: Record<string, any>;
  onLayoutChange: (template: string) => void;
  onDefaultValueChange?: (fieldName: string, value: any) => void;
}

function SortableItem(props: {
  item: GridItem;
  field: Field;
  enums: Enums;
  defaultValue?: any;
  onChangeSpan: (id: string, col: number, row: number) => void;
  onDefaultValueChange?: (id: string, value: any) => void;
  maxColumns: number;
  subFields?: Field[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${props.item.colSpan}`,
    gridRow: `span ${props.item.rowSpan}`,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={0}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        cursor: 'grab',
        position: 'relative',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }
      }}
    >
      <Box sx={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.05, pointerEvents: 'none' }}>
         <Typography variant="h1" sx={{ fontSize: '4rem', lineHeight: 1 }}>{props.item.rowSpan}</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} {...attributes} {...listeners}>
        <Typography variant="subtitle2" noWrap>{props.field.label}</Typography>
        <Typography variant="caption" color="primary">[{props.field.type}]</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', zIndex: 1 }}>
        <Typography variant="caption">Cols:</Typography>
        <Tooltip title="Decrease columns">
        <IconButton size="small" aria-label="Decrease columns" onClick={() => props.onChangeSpan(props.item.id, Math.max(1, props.item.colSpan - 1), props.item.rowSpan)}>
          <RemoveIcon fontSize="small" />
        </IconButton>
        </Tooltip>
        <Typography variant="caption">{props.item.colSpan}</Typography>
        <Tooltip title="Increase columns">
        <IconButton size="small" aria-label="Increase columns" onClick={() => props.onChangeSpan(props.item.id, Math.min(props.maxColumns, props.item.colSpan + 1), props.item.rowSpan)}>
          <AddIcon fontSize="small" />
        </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', zIndex: 1 }}>
        <Typography variant="caption">Rows:</Typography>
        <Tooltip title="Decrease rows">
        <IconButton size="small" aria-label="Decrease rows" onClick={() => props.onChangeSpan(props.item.id, props.item.colSpan, Math.max(1, props.item.rowSpan - 1))}>
          <RemoveIcon fontSize="small" />
        </IconButton>
        </Tooltip>
        <Typography variant="caption">{props.item.rowSpan}</Typography>
        <Tooltip title="Increase rows">
        <IconButton size="small" aria-label="Increase rows" onClick={() => props.onChangeSpan(props.item.id, props.item.colSpan, props.item.rowSpan + 1)}>
          <AddIcon fontSize="small" />
        </IconButton>
        </Tooltip>
      </Box>
      {props.onDefaultValueChange && (
        <Box sx={{ zIndex: 1, mt: 1 }} onPointerDown={(e) => e.stopPropagation()}>
          <DynamicField
            field={props.field}
            enums={props.enums}
            value={props.defaultValue}
            onChange={(name: string, value: any) => props.onDefaultValueChange!(name, value)}
            subFields={props.subFields}
          />
        </Box>
      )}
    </Paper>
  );
}

export default function GridPreview({ fields, enums, gridTemplate, defaultValues, onLayoutChange, onDefaultValueChange }: Props) {
  const [items, setItems] = useState<GridItem[]>([]);
  const [maxColumns, setMaxColumns] = useState<number>(3);

  // Helper to convert CSS grid-template-areas string back to item configurations.
  // We assume items are ordered by their first appearance in the grid.
  const parseGridTemplateAreas = (templateString: string): { items: GridItem[], columns: number } => {
    const lines = templateString.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) return { items: [], columns: 3 };

    let cols = 0;
    const itemMap = new Map<string, { id: string, startCol: number, endCol: number, startRow: number, endRow: number }>();

    lines.forEach((line, rowIndex) => {
      // Remove leading and trailing quotes
      const cleanedLine = line.replace(/^['"]|['"]$/g, '').trim();
      const cells = cleanedLine.split(/\s+/);
      cols = Math.max(cols, cells.length);

      cells.forEach((cell, colIndex) => {
        if (cell === '.') return;
        if (!itemMap.has(cell)) {
          itemMap.set(cell, { id: cell, startCol: colIndex, endCol: colIndex, startRow: rowIndex, endRow: rowIndex });
        } else {
          const stats = itemMap.get(cell)!;
          stats.endCol = Math.max(stats.endCol, colIndex);
          stats.endRow = Math.max(stats.endRow, rowIndex);
        }
      });
    });

    const parsedItems: GridItem[] = Array.from(itemMap.values())
        .sort((a, b) => {
            if (a.startRow !== b.startRow) return a.startRow - b.startRow;
            return a.startCol - b.startCol;
        })
        .map(stats => ({
            id: stats.id,
            colSpan: stats.endCol - stats.startCol + 1,
            rowSpan: stats.endRow - stats.startRow + 1
        }));

    return { items: parsedItems, columns: cols || 3 };
  };

  // Helper to convert GridItem array into a CSS grid-template-areas string
  const generateGridTemplateAreas = (gridItems: GridItem[], columns: number): string => {
    if (gridItems.length === 0) return "";

    // We simulate placing items in a grid.
    const grid: string[][] = [];

    let currentRow = 0;
    let currentCol = 0;

    const expandGrid = (row: number) => {
      while (grid.length <= row) {
        grid.push(new Array(columns).fill('.'));
      }
    };

    gridItems.forEach(item => {
      let placed = false;
      while (!placed) {
        expandGrid(currentRow);

        let canPlace = true;
        // Check bounds
        if (currentCol + item.colSpan > columns) {
            canPlace = false;
        } else {
            // Check overlaps
            for (let r = currentRow; r < currentRow + item.rowSpan; r++) {
                expandGrid(r);
                for (let c = currentCol; c < currentCol + item.colSpan; c++) {
                    if (grid[r][c] !== '.') {
                        canPlace = false;
                        break;
                    }
                }
                if (!canPlace) break;
            }
        }

        if (canPlace) {
            for (let r = currentRow; r < currentRow + item.rowSpan; r++) {
                for (let c = currentCol; c < currentCol + item.colSpan; c++) {
                    grid[r][c] = item.id;
                }
            }
            placed = true;
            currentCol += item.colSpan;
            if (currentCol >= columns) {
                currentCol = 0;
                currentRow++;
            }
        } else {
            currentCol++;
            if (currentCol >= columns) {
                currentCol = 0;
                currentRow++;
            }
        }
      }
    });

    return grid.map(row => `"${row.join(' ')}"`).join('\n');
  };

  useEffect(() => {
    let parsed: GridItem[] = [];
    let cols = 3;
    try {
      if (gridTemplate) {
          if (gridTemplate.includes('"')) {
             const result = parseGridTemplateAreas(gridTemplate);
             parsed = result.items;
             cols = result.columns;
          } else {
             // Fallback for old json data during dev if needed
             const data = JSON.parse(gridTemplate);
             if (data.items) {
               parsed = data.items;
               cols = data.columns || 3;
             } else if (Array.isArray(data)) {
               parsed = data;
             }
          }
      }
    } catch {
        // Ignored fallback failure
    }

    setMaxColumns(cols);

    // Filter out subfields - they should not be in the grid layout
    const mainFields = fields.filter(f => !f.parentField);

    // Sync fields with layout items
    const fieldNames = new Set(mainFields.map(f => f.name));
    const layoutNames = new Set(parsed.map(i => i.id));

    const updatedItems = parsed.filter(i => fieldNames.has(i.id));
    mainFields.forEach(f => {
      if (!layoutNames.has(f.name)) {
        const defaultColSpan = f.type === 'list' ? cols : Math.min(cols, 1);
        updatedItems.push({ id: f.name, colSpan: defaultColSpan, rowSpan: 1 });
      }
    });

    const currentGeneratedTemplate = generateGridTemplateAreas(updatedItems, cols);

    // Always sync internal items state with updated layout fields when they change externally.
    // If the template string needs cleaning up, update it too.
    if (gridTemplate !== currentGeneratedTemplate && updatedItems.length > 0) {
        setItems(updatedItems);
        onLayoutChange(currentGeneratedTemplate);
    } else {
        // If template string is in sync, we STILL need to make sure `items` matches `updatedItems`.
        // Otherwise, resizing an item could use stale `items` state.
        setItems(updatedItems);
    }
  }, [fields, gridTemplate]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onLayoutChange(generateGridTemplateAreas(newItems, maxColumns));
        return newItems;
      });
    }
  };

  const handleChangeSpan = (id: string, colSpan: number, rowSpan: number) => {
    setItems((items) => {
      const newItems = items.map(i => i.id === id ? { ...i, colSpan, rowSpan } : i);
      onLayoutChange(generateGridTemplateAreas(newItems, maxColumns));
      return newItems;
    });
  };

  const handleMaxColumnsChange = (e: any) => {
      const val = Math.max(1, parseInt(e.target.value) || 3);
      setMaxColumns(val);

      setItems((currentItems) => {
          const clampedItems = currentItems.map(item => ({
              ...item,
              colSpan: Math.min(item.colSpan, val)
          }));
          onLayoutChange(generateGridTemplateAreas(clampedItems, val));
          return clampedItems;
      });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: 'background.paper',
        p: 2,
        borderRadius: 2
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Grid Layout Configuration</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="body2" color="text.secondary">Max Columns:</Typography>
        <input
          type="number"
          value={maxColumns}
          onChange={handleMaxColumnsChange}
          style={{
            width: 70,
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(0,0,0,0.2)',
            color: 'inherit',
            fontFamily: 'inherit'
          }}
        />
      </Box>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${maxColumns}, 1fr)`,
            gap: 2,
            minHeight: 200,
            p: 3,
            borderRadius: 3,
            bgcolor: 'rgba(0, 0, 0, 0.1)',
            border: '1px dashed rgba(255,255,255,0.1)'
          }}>
            {items.map(item => {
              const field = fields.find(f => f.name === item.id);
              if (!field) return null;
              return (
                <SortableItem
                  key={item.id}
                  item={item}
                  enums={enums}
                  field={field}
                  defaultValue={defaultValues?.[item.id]}
                  onChangeSpan={handleChangeSpan}
                  onDefaultValueChange={onDefaultValueChange}
                  maxColumns={maxColumns}
                  subFields={fields.filter(f => f.parentField === item.id)}
                />
              );
            })}
          </Box>
        </SortableContext>
      </DndContext>
    </Box>
  );
}
