import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface Field {
  name: string;
  type: string;
  label: string;
  enumName?: string;
  id?: string;
  colSpan?: number;
  rowSpan?: number;
}

interface SortableItemProps {
  id: string;
  field: Field;
  onChangeScale: (id: string, dim: 'col' | 'row', delta: number) => void;
}

function SortableItem({ id, field, onChangeScale }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: 'var(--item-bg, white)',
    padding: '10px',
    border: '1px solid var(--item-border, #ccc)',
    borderRadius: '4px',
    cursor: 'grab',
    textAlign: 'center' as const,
    gridColumn: `span ${field.colSpan || 1}`,
    gridRow: `span ${field.rowSpan || 1}`,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{field.label}</strong>
      <small>({field.name})</small>
      <div
        onPointerDown={(e) => e.stopPropagation()}
        style={{ marginTop: '10px', display: 'flex', gap: '5px', fontSize: '12px' }}
      >
        <button type="button" onClick={() => onChangeScale(id, 'col', 1)} title="Increase Width">+W</button>
        <button type="button" onClick={() => onChangeScale(id, 'col', -1)} title="Decrease Width">-W</button>
        <button type="button" onClick={() => onChangeScale(id, 'row', 1)} title="Increase Height">+H</button>
        <button type="button" onClick={() => onChangeScale(id, 'row', -1)} title="Decrease Height">-H</button>
      </div>
    </div>
  );
}

interface GridPreviewProps {
  fields: Field[];
  onFieldsChange: (fields: Field[]) => void;
  onGridTemplateChange: (template: string) => void;
  columns?: number;
}

export function GridPreview({ fields, onFieldsChange, onGridTemplateChange, columns = 2 }: GridPreviewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      const newFields = arrayMove(fields, oldIndex, newIndex);
      onFieldsChange(newFields);
    }
  };

  const handleChangeScale = (id: string, dim: 'col' | 'row', delta: number) => {
    const newFields = fields.map(f => {
      if (f.id === id) {
        let newVal = (dim === 'col' ? (f.colSpan || 1) : (f.rowSpan || 1)) + delta;
        newVal = Math.max(1, newVal);
        if (dim === 'col') newVal = Math.min(newVal, columns);
        return { ...f, [dim === 'col' ? 'colSpan' : 'rowSpan']: newVal };
      }
      return f;
    });
    onFieldsChange(newFields);
  };

  const generateGridTemplate = (currentFields: Field[], cols: number) => {
    const grid: string[][] = [];
    const getCell = (c: number, r: number) => grid[r] && grid[r][c];
    const setCell = (c: number, r: number, val: string) => {
      if (!grid[r]) grid[r] = Array(cols).fill('.');
      grid[r][c] = val;
    };

    currentFields.forEach(f => {
      const w = Math.min(f.colSpan || 1, cols);
      const h = f.rowSpan || 1;
      let r = 0;
      let c = 0;
      let found = false;
      while (!found) {
        let canFit = true;
        if (c + w > cols) {
          canFit = false;
        } else {
          for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
              if (getCell(c + i, r + j) && getCell(c + i, r + j) !== '.') {
                canFit = false;
              }
            }
          }
        }
        if (canFit) {
          found = true;
          for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
              setCell(c + i, r + j, f.name);
            }
          }
        } else {
          c++;
          if (c >= cols) {
            c = 0;
            r++;
          }
        }
      }
    });

    let template = '';
    for (let i = 0; i < grid.length; i++) {
      let rowString = '';
      for (let j = 0; j < cols; j++) {
        const val = grid[i] && grid[i][j] ? grid[i][j] : '.';
        rowString += `"${val}" `;
      }
      template += `'${rowString.trim().replace(/"/g, '')}'\n`;
    }
    onGridTemplateChange(template.trim());
  };

  React.useEffect(() => {
    generateGridTemplate(fields, columns);
  }, [fields, columns]);

  return (
    <div>
      <h4>Drag and Drop to reorder fields</h4>
      <p>Columns: {columns}</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map(f => f.id as string)} strategy={rectSortingStrategy}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridAutoFlow: 'row dense',
            gap: '10px',
            padding: '20px',
            background: 'var(--grid-bg, #f0f0f0)',
            border: '2px dashed var(--grid-border, #ccc)',
            borderRadius: '8px'
          }}>
            {fields.map((field) => (
              <SortableItem key={field.id} id={field.id as string} field={field} onChangeScale={handleChangeScale} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
