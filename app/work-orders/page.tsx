'use client';

import { useState, useEffect } from 'react';
import { WorkOrderCard } from '@/components/work-orders/WorkOrderCard';
import { WorkOrder } from '@/types/project.types';

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/work-orders')
      .then(res => res.json())
      .then(setWorkOrders)
      .catch(console.error);
    
    fetch('/api/projects')
      .then(res => res.json())
      .then(setProjects)
      .catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      projectId: formData.get('projectId'),
      title: formData.get('title'),
      assignedTo: formData.get('assignedTo'),
      ndtMethods: (formData.get('ndtMethods') as string).split(',').map(s => s.trim()),
      deadline: formData.get('deadline'),
      priority: formData.get('priority')
    };

    console.log('Creating work order with data:', data);

    const response = await fetch('/api/work-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const newWorkOrder = await response.json();
      setWorkOrders([...workOrders, newWorkOrder]);
      setShowForm(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Work Order'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <select name="projectId" required className="px-3 py-2 border rounded" defaultValue="">
              <option value="" disabled>Select a project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input name="title" placeholder="Work Order Title" required className="px-3 py-2 border rounded" />
            <input name="assignedTo" placeholder="Assigned To" required className="px-3 py-2 border rounded" />
            <input name="deadline" type="date" required className="px-3 py-2 border rounded" />
            <select name="priority" required className="px-3 py-2 border rounded" defaultValue="">
              <option value="" disabled>Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <input name="ndtMethods" placeholder="NDT Methods (comma-separated)" className="px-3 py-2 border rounded" />
          </div>
          <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Create Work Order
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workOrders.map(wo => (
          <WorkOrderCard key={wo.id} workOrder={wo} />
        ))}
      </div>
    </div>
  );
}
