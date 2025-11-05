'use client';

import { useState, useEffect } from 'react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Project } from '@/types/project.types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(setProjects)
      .catch(console.error);
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <input name="name" placeholder="Project Name" required className="px-3 py-2 border rounded" />
            <input name="clientName" placeholder="Client Name" required className="px-3 py-2 border rounded" />
            <input name="startDate" type="date" required className="px-3 py-2 border rounded" />
            <input name="endDate" type="date" required className="px-3 py-2 border rounded" />
            <input name="standards" placeholder="Standards (comma-separated)" className="px-3 py-2 border rounded" />
            <textarea name="description" placeholder="Description" className="px-3 py-2 border rounded col-span-2" />
          </div>
          <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Create Project
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
