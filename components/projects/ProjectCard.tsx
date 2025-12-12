'use client';

import { Project } from '@/types/project.types';

interface ProjectCardProps {
  project: Project;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

export function ProjectCard({ project, onEdit, onView }: ProjectCardProps) {
  const statusColors = {
    active: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    completed: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    on_hold: 'bg-gradient-to-r from-amber-600 to-orange-600'
  };

  return (
    <div className="bg-zinc-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-zinc-800 p-6 hover:border-amber-700 hover:shadow-2xl hover:shadow-amber-600/20 transition-all">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-xl text-amber-100">{project.name}</h3>
        <span className={`px-3 py-1 rounded-lg text-white text-xs font-bold ${statusColors[project.status]}`}>
          {project.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="space-y-3 text-sm mb-6">
        <div className="flex justify-between">
          <span className="text-amber-600 font-semibold">Client:</span>
          <span className="text-amber-100">{project.clientName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-600 font-semibold">Standards:</span>
          <span className="text-amber-100">{project.standards.join(', ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-600 font-semibold">Team:</span>
          <span className="text-amber-100">{project.teamMembers.length} members</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onView?.(project.id)}
          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-amber-600/50 hover:scale-105 transition-all font-bold"
        >
          View
        </button>
        <button
          onClick={() => onEdit?.(project.id)}
          className="flex-1 px-4 py-2.5 bg-zinc-950 border border-amber-700/30 text-amber-100 rounded-xl hover:bg-zinc-800 hover:scale-105 transition-all font-semibold"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
