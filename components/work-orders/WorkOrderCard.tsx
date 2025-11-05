'use client';

import { WorkOrder } from '@/types/project.types';

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

export function WorkOrderCard({ workOrder, onEdit, onView }: WorkOrderCardProps) {
  const statusColors = {
    assigned: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    review: 'bg-orange-500',
    completed: 'bg-green-500'
  };

  const priorityColors = {
    low: 'bg-gray-500',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{workOrder.title}</h3>
        <span className={`px-2 py-1 rounded text-white text-xs ${statusColors[workOrder.status]}`}>
          {workOrder.status.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Priority:</span>
          <span className={`px-2 py-1 rounded text-white text-xs ${priorityColors[workOrder.priority]}`}>
            {workOrder.priority}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Components:</span>
          <span>{workOrder.components.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Methods:</span>
          <span>{workOrder.ndtMethods.join(', ').toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Deadline:</span>
          <span>{new Date(workOrder.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView?.(workOrder.id)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View
        </button>
        <button
          onClick={() => onEdit?.(workOrder.id)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
