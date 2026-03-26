import { useState, useEffect } from "react";
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface Field {
  name: string;
  type: string;
  label: string;
}

interface GridItem {
  id: string;
  colSpan: number;
  rowSpan: number;
}
interface Props {
  fields: Field[];
  gridTemplate: string;
  onLayoutChange: (template: string) => void;
}

function SortableItem(props: { item: GridItem; field: Field; onChangeSpan: (id: string, col: number, row: number) => void; maxColumns: number }) {
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
      sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, backgroundColor: 'grey.100', cursor: 'grab', position: 'relative' }}
    >
      <Box sx={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.1, pointerEvents: 'none' }}>
         <Typography variant="h1" sx={{ fontSize: '4rem', lineHeight: 1 }}>{props.item.rowSpan}</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} {...attributes} {...listeners}>
        <Typography variant="subtitle2" noWrap>{props.field.label}</Typography>
        <Typography variant="caption" color="text.secondary">[{props.field.type}]</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', zIndex: 1 }}>
        <Typography variant="caption">Cols:</Typography>
        <IconButton size="small" onClick={() => props.onChangeSpan(props.item.id, Math.max(1, props.item.colSpan - 1), props.item.rowSpan)}>
          <RemoveIcon fontSize="small" />
        </IconButton>
        <Typography variant="caption">{props.item.colSpan}</Typography>
        <IconButton size="small" onClick={() => props.onChangeSpan(props.item.id, Math.min(props.maxColumns, props.item.colSpan + 1), props.item.rowSpan)}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', zIndex: 1 }}>
        <Typography variant="caption">Rows:</Typography>
        <IconButton size="small" onClick={() => props.onChangeSpan(props.item.id, props.item.colSpan, Math.max(1, props.item.rowSpan - 1))}>
          <RemoveIcon fontSize="small" />
        </IconButton>
        <Typography variant="caption">{props.item.rowSpan}</Typography>
        <IconButton size="small" onClick={() => props.onChangeSpan(props.item.id, props.item.colSpan, props.item.rowSpan + 1)}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default function GridPreview({ fields, gridTemplate, onLayoutChange }: Props) {
  const [items, setItems] = useState<GridItem[]>([]);
  const [maxColumns, setMaxColumns] = useState<number>(3);

  useEffect(() => {
    let parsed: GridItem[] = [];
    let cols = 3;
    try {
      if (gridTemplate) {
        const data = JSON.parse(gridTemplate);
        if (data.items) {
          parsed = data.items;
          cols = data.columns || 3;
        } else if (Array.isArray(data)) {
          parsed = data;
        }
      }
    } catch (e) { }

    setMaxColumns(cols);

    // Sync fields with layout items
    const fieldNames = new Set(fields.map(f => f.name));
    const layoutNames = new Set(parsed.map(i => i.id));

    const updatedItems = parsed.filter(i => fieldNames.has(i.id));
    fields.forEach(f => {
      if (!layoutNames.has(f.name)) {
        updatedItems.push({ id: f.name, colSpan: Math.min(cols, 1), rowSpan: 1 });
      }
    });

    if (JSON.stringify(updatedItems) !== JSON.stringify(parsed) && updatedItems.length > 0) {
      setItems(updatedItems);
      onLayoutChange(JSON.stringify({ columns: maxColumns, items: updatedItems }));
    } else if (items.length === 0 && updatedItems.length > 0) {
      setItems(updatedItems);
    } else if (parsed.length > 0 && items.length === 0) {
        setItems(parsed);
    }
  }, [fields, gridTemplate]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onLayoutChange(JSON.stringify({ columns: maxColumns, items: newItems }));
        return newItems;
      });
    }
  };

  const handleChangeSpan = (id: string, colSpan: number, rowSpan: number) => {
    setItems((items) => {
      const newItems = items.map(i => i.id === id ? { ...i, colSpan, rowSpan } : i);
      onLayoutChange(JSON.stringify({ columns: maxColumns, items: newItems }));
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
          onLayoutChange(JSON.stringify({ columns: val, items: clampedItems }));
          return clampedItems;
      });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2">Max Columns:</Typography>
        <input type="number" value={maxColumns} onChange={handleMaxColumnsChange} style={{ width: 60 }} />
      </Box>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
          <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${maxColumns}, 1fr)`, gap: 2, minHeight: 200, p: 2, border: '1px dashed grey' }}>
            {items.map(item => {
              const field = fields.find(f => f.name === item.id);
              if (!field) return null;
              return <SortableItem key={item.id} item={item} field={field} onChangeSpan={handleChangeSpan} maxColumns={maxColumns} />;
            })}
          </Box>
        </SortableContext>
      </DndContext>
    </Box>
  );
}
