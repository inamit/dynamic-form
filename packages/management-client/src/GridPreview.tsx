import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Field {
  name: string;
  type: string;
  label: string;
  id?: string;
}

interface SortableItemProps {
  id: string;
  field: Field;
}

function SortableItem({ id, field }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: 'white',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'grab',
    textAlign: 'center' as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{field.label}</strong> <br />
      <small>({field.name})</small>
    </div>
  );
}

interface GridPreviewProps {
  fields: Field[];
  onFieldsReorder: (fields: Field[]) => void;
  onGridTemplateChange: (template: string) => void;
  columns?: number;
}

export function GridPreview({ fields, onFieldsReorder, onGridTemplateChange, columns = 2 }: GridPreviewProps) {
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
      onFieldsReorder(newFields);
      generateGridTemplate(newFields, columns);
    }
  };

  const generateGridTemplate = (currentFields: Field[], cols: number) => {
    let template = '';
    for (let i = 0; i < currentFields.length; i += cols) {
      const row = currentFields.slice(i, i + cols);
      const rowString = row.map(f => `"${f.name}"`).join(' ');

      // Pad row if it has fewer items than cols
      const padding = cols - row.length;
      const paddingString = Array(padding).fill(' "."').join('');

      template += `'${rowString.replace(/"/g, '')}${padding > 0 ? paddingString : ''}'\n`;
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
            gap: '10px',
            padding: '20px',
            background: '#f0f0f0',
            border: '2px dashed #ccc',
            borderRadius: '8px'
          }}>
            {fields.map((field) => (
              <SortableItem key={field.id} id={field.id as string} field={field} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
