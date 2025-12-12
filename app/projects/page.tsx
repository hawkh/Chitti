'use client';

import { useState, useEffect } from 'react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Project } from '@/types/project.types';

const mockProjects: Project[] = [
  {
    id: 'proj_1',
    name: 'Bridge Inspection 2024',
    clientName: 'City Infrastructure Dept',
    description: 'Annual structural integrity assessment',
    standards: ['ISO 9001', 'ASTM E165'],
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-06-30'),
    status: 'active',
    managerId: 'mgr_1',
    teamMembers: ['inspector_1', 'inspector_2'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'proj_2',
    name: 'Pipeline NDT Survey',
    clientName: 'Energy Corp',
    description: 'Non-destructive testing of pipeline welds',
    standards: ['ASME B31.3', 'API 1104'],
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-08-31'),
    status: 'active',
    managerId: 'mgr_1',
    teamMembers: ['inspector_3', 'inspector_4', 'inspector_5'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-01')
  }
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch projects');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch(err => {
        console.error('Error fetching projects:', err);
        // Keep using mock data on error
      });
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get('name'),
      clientName: formData.get('clientName'),
      description: formData.get('description'),
      standards: (formData.get('standards') as string).split(',').map(s => s.trim()),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate')
    };

    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setShowForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-orange-100 to-amber-300 bg-clip-text text-transparent">Projects</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white rounded-xl hover:shadow-2xl hover:shadow-amber-600/50 hover:scale-105 transition-all font-bold"
          >
            {showForm ? 'Cancel' : 'New Project'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-zinc-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-zinc-800 p-6 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <input name="name" placeholder="Project Name" required className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-100 placeholder-amber-600/50 focus:border-amber-600 focus:outline-none" />
              <input name="clientName" placeholder="Client Name" required className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-100 placeholder-amber-600/50 focus:border-amber-600 focus:outline-none" />
              <input name="startDate" type="date" required className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-100 focus:border-amber-600 focus:outline-none" />
              <input name="endDate" type="date" required className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-100 focus:border-amber-600 focus:outline-none" />
              <input name="standards" placeholder="Standards (comma-separated)" className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-100 placeholder-amber-600/50 focus:border-amber-600 focus:outline-none" />
              <textarea name="description" placeholder="Description" className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-100 placeholder-amber-600/50 focus:border-amber-600 focus:outline-none col-span-2" />
            </div>
            <button type="submit" className="mt-4 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-2xl hover:shadow-emerald-600/50 hover:scale-105 transition-all font-bold">
              Create Project
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
