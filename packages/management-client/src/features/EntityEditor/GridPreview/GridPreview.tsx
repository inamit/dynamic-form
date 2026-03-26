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

function SortableItem(props: { item: GridItem; field: Field; onChangeSpan: (id: string, col: number, row: number) => void }) {
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
      sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, backgroundColor: 'grey.100', cursor: 'grab' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} {...attributes} {...listeners}>
        <Typography variant="subtitle2" noWrap>{props.field.label}</Typography>
        <Typography variant="caption" color="text.secondary">[{props.field.type}]</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography variant="caption">Cols:</Typography>
        <IconButton size="small" onClick={() => props.onChangeSpan(props.item.id, Math.max(1, props.item.colSpan - 1), props.item.rowSpan)}>
          <RemoveIcon fontSize="small" />
        </IconButton>
        <Typography variant="caption">{props.item.colSpan}</Typography>
        <IconButton size="small" onClick={() => props.onChangeSpan(props.item.id, Math.min(12, props.item.colSpan + 1), props.item.rowSpan)}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography variant="caption">Rows:</Typography>
        <IconButton size="small" onClick={() => props.onChangeSpan(props.item.id, Math.max(1, props.item.rowSpan - 1), props.item.colSpan)}>
          <RemoveIcon fontSize="small" />
        </IconButton>
        <Typography variant="caption">{props.item.rowSpan}</Typography>
        <IconButton size="small" onClick={() => props.onChangeSpan(props.item.id, props.item.rowSpan + 1, props.item.colSpan)}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default function GridPreview({ fields, gridTemplate, onLayoutChange }: Props) {
  const [items, setItems] = useState<GridItem[]>([]);

  useEffect(() => {
    let parsed: GridItem[] = [];
    try {
      if (gridTemplate) {
        parsed = JSON.parse(gridTemplate);
      }
    } catch (e) { }

    // Sync fields with layout items
    const fieldNames = new Set(fields.map(f => f.name));
    const layoutNames = new Set(parsed.map(i => i.id));

    const updatedItems = parsed.filter(i => fieldNames.has(i.id));
    fields.forEach(f => {
      if (!layoutNames.has(f.name)) {
        updatedItems.push({ id: f.name, colSpan: 12, rowSpan: 1 });
      }
    });

    if (JSON.stringify(updatedItems) !== JSON.stringify(parsed) && updatedItems.length > 0) {
      setItems(updatedItems);
      onLayoutChange(JSON.stringify(updatedItems));
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
        onLayoutChange(JSON.stringify(newItems));
        return newItems;
      });
    }
  };

  const handleChangeSpan = (id: string, colSpan: number, rowSpan: number) => {
    setItems((items) => {
      const newItems = items.map(i => i.id === id ? { ...i, colSpan, rowSpan } : i);
      onLayoutChange(JSON.stringify(newItems));
      return newItems;
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2, minHeight: 200, p: 2, border: '1px dashed grey' }}>
            {items.map(item => {
              const field = fields.find(f => f.name === item.id);
              if (!field) return null;
              return <SortableItem key={item.id} item={item} field={field} onChangeSpan={handleChangeSpan} />;
            })}
          </Box>
        </SortableContext>
      </DndContext>
    </Box>
  );
}
