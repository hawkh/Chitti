'use client';

import { Project } from '@/types/project.types';

interface ProjectCardProps {
  project: Project;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

export function ProjectCard({ project, onEdit, onView }: ProjectCardProps) {
  const statusColors = {
    active: 'bg-green-500',
    completed: 'bg-blue-500',
    on_hold: 'bg-yellow-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{project.name}</h3>
        <span className={`px-2 py-1 rounded text-white text-xs ${statusColors[project.status]}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Client:</span>
          <span>{project.clientName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Standards:</span>
          <span>{project.standards.join(', ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Team:</span>
          <span>{project.teamMembers.length} members</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView?.(project.id)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View
        </button>
        <button
          onClick={() => onEdit?.(project.id)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
