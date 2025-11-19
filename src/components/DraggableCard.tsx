import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReactNode } from 'react';

interface Props {
  id: string;
  children: ReactNode;
}

export default function DraggableCard({ id, children }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...listeners}
        className="hidden lg:block absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-200 cursor-grab active:cursor-grabbing z-10 bg-slate-600 rounded opacity-70 hover:opacity-100 transition-opacity"
        title="Drag to reorder"
      >
        ⋮⋮
      </div>
      {children}
    </div>
  );
}