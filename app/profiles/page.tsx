'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { ComponentProfile, MaterialType, DefectType } from '@/types';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<ComponentProfile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    materialType: MaterialType.METAL,
    criticalDefects: [] as DefectType[],
    defaultSensitivity: 0.7,
    qualityStandards: '',
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    const res = await fetch('/api/profiles');
    const data = await res.json();
    if (data.success) setProfiles(data.data);
  };

  const handleCreate = async () => {
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        qualityStandards: formData.qualityStandards.split(',').map(s => s.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      fetchProfiles();
      setIsCreating(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this profile?')) return;
    await fetch(`/api/profiles?id=${id}`, { method: 'DELETE' });
    fetchProfiles();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      materialType: MaterialType.METAL,
      criticalDefects: [],
      defaultSensitivity: 0.7,
      qualityStandards: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-black gradient-text">Component Profiles</h1>
            <p className="text-gray-600 mt-2 text-lg">Manage detection parameters for different materials</p>
          </div>
          <button onClick={() => setIsCreating(true)} className="btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Profile
          </button>
        </div>

        {isCreating && (
          <div className="card p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Create New Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Profile Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
              <select
                value={formData.materialType}
                onChange={(e) => setFormData({ ...formData, materialType: e.target.value as MaterialType })}
                className="px-4 py-2 border rounded-lg"
              >
                {Object.values(MaterialType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Quality Standards (comma-separated)"
                value={formData.qualityStandards}
                onChange={(e) => setFormData({ ...formData, qualityStandards: e.target.value })}
                className="px-4 py-2 border rounded-lg col-span-2"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save
              </button>
              <button onClick={() => { setIsCreating(false); resetForm(); }} className="btn-secondary flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div key={profile.id} className="card-hover p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
                  <p className="text-sm text-gray-600">{profile.materialType}</p>
                </div>
                <button onClick={() => handleDelete(profile.id)} className="p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Sensitivity:</span> {profile.defaultSensitivity}</p>
                <p><span className="font-semibold">Standards:</span> {profile.qualityStandards.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
