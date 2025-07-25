'use client';

import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Settings,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { ComponentProfile, MaterialType, DefectType } from '@/types';

interface ComponentProfileManagerProps {
  profiles: ComponentProfile[];
  onProfileCreate: (profile: Omit<ComponentProfile, 'id'>) => void;
  onProfileUpdate: (id: string, profile: Omit<ComponentProfile, 'id'>) => void;
  onProfileDelete: (id: string) => void;
  onProfileDuplicate?: (profile: ComponentProfile) => void;
  onProfileExport?: (profiles: ComponentProfile[]) => void;
  onProfileImport?: (profiles: ComponentProfile[]) => void;
  className?: string;
}

interface ProfileFormData {
  name: string;
  materialType: MaterialType;
  criticalDefects: DefectType[];
  defaultSensitivity: number;
  qualityStandards: string[];
  customParameters: Record<string, any>;
}

const initialFormData: ProfileFormData = {
  name: '',
  materialType: MaterialType.METAL,
  criticalDefects: [],
  defaultSensitivity: 0.7,
  qualityStandards: [],
  customParameters: {}
};

export const ComponentProfileManager: React.FC<ComponentProfileManagerProps> = ({
  profiles,
  onProfileCreate,
  onProfileUpdate,
  onProfileDelete,
  onProfileDuplicate,
  onProfileExport,
  onProfileImport,
  className = ''
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ComponentProfile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMaterial, setFilterMaterial] = useState<MaterialType | 'all'>('all');

  // Filter profiles based on search and material type
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMaterial = filterMaterial === 'all' || profile.materialType === filterMaterial;
    return matchesSearch && matchesMaterial;
  });

  const handleCreateProfile = useCallback(() => {
    setEditingProfile(null);
    setFormData(initialFormData);
    setShowForm(true);
  }, []);

  const handleEditProfile = useCallback((profile: ComponentProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      materialType: profile.materialType,
      criticalDefects: profile.criticalDefects,
      defaultSensitivity: profile.defaultSensitivity,
      qualityStandards: profile.qualityStandards,
      customParameters: profile.customParameters
    });
    setShowForm(true);
  }, []);

  const handleSaveProfile = useCallback(() => {
    if (editingProfile) {
      onProfileUpdate(editingProfile.id, formData);
    } else {
      onProfileCreate(formData);
    }
    setShowForm(false);
    setEditingProfile(null);
    setFormData(initialFormData);
  }, [editingProfile, formData, onProfileCreate, onProfileUpdate]);

  const handleCancelEdit = useCallback(() => {
    setShowForm(false);
    setEditingProfile(null);
    setFormData(initialFormData);
  }, []);

  const handleDeleteProfile = useCallback((profile: ComponentProfile) => {
    if (window.confirm(`Are you sure you want to delete the profile "${profile.name}"?`)) {
      onProfileDelete(profile.id);
    }
  }, [onProfileDelete]);

  const handleDuplicateProfile = useCallback((profile: ComponentProfile) => {
    if (onProfileDuplicate) {
      onProfileDuplicate(profile);
    }
  }, [onProfileDuplicate]);

  const updateFormData = useCallback(<K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const addQualityStandard = useCallback(() => {
    const standard = prompt('Enter quality standard:');
    if (standard && standard.trim()) {
      updateFormData('qualityStandards', [...formData.qualityStandards, standard.trim()]);
    }
  }, [formData.qualityStandards, updateFormData]);

  const removeQualityStandard = useCallback((index: number) => {
    updateFormData('qualityStandards', formData.qualityStandards.filter((_, i) => i !== index));
  }, [formData.qualityStandards, updateFormData]);

  const addCustomParameter = useCallback(() => {
    const key = prompt('Enter parameter name:');
    if (key && key.trim()) {
      const value = prompt('Enter parameter value:');
      if (value !== null) {
        updateFormData('customParameters', {
          ...formData.customParameters,
          [key.trim()]: value
        });
      }
    }
  }, [formData.customParameters, updateFormData]);

  const removeCustomParameter = useCallback((key: string) => {
    const { [key]: removed, ...rest } = formData.customParameters;
    updateFormData('customParameters', rest);
  }, [formData.customParameters, updateFormData]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Component Profiles</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage detection profiles for different component types and materials
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {onProfileImport && (
              <button
                onClick={() => onProfileImport([])}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>
            )}
            
            {onProfileExport && profiles.length > 0 && (
              <button
                onClick={() => onProfileExport(profiles)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            )}
            
            <button
              onClick={handleCreateProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Profile
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterMaterial}
            onChange={(e) => setFilterMaterial(e.target.value as MaterialType | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Materials</option>
            <option value={MaterialType.METAL}>Metal</option>
            <option value={MaterialType.PLASTIC}>Plastic</option>
            <option value={MaterialType.COMPOSITE}>Composite</option>
            <option value={MaterialType.CERAMIC}>Ceramic</option>
          </select>
        </div>
      </div>

      {/* Profile Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {editingProfile ? 'Edit Profile' : 'Create New Profile'}
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <ProfileForm
                formData={formData}
                onUpdate={updateFormData}
                onAddQualityStandard={addQualityStandard}
                onRemoveQualityStandard={removeQualityStandard}
                onAddCustomParameter={addCustomParameter}
                onRemoveCustomParameter={removeCustomParameter}
              />
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={!formData.name.trim() || formData.criticalDefects.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingProfile ? 'Update' : 'Create'} Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map(profile => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onEdit={() => handleEditProfile(profile)}
            onDelete={() => handleDeleteProfile(profile)}
            onDuplicate={() => handleDuplicateProfile(profile)}
          />
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {profiles.length === 0 ? 'No Profiles Created' : 'No Profiles Found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {profiles.length === 0 
              ? 'Create your first component profile to get started with customized defect detection.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {profiles.length === 0 && (
            <button
              onClick={handleCreateProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Profile
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface ProfileFormProps {
  formData: ProfileFormData;
  onUpdate: <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void;
  onAddQualityStandard: () => void;
  onRemoveQualityStandard: (index: number) => void;
  onAddCustomParameter: () => void;
  onRemoveCustomParameter: (key: string) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  onUpdate,
  onAddQualityStandard,
  onRemoveQualityStandard,
  onAddCustomParameter,
  onRemoveCustomParameter
}) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Metal Casting Profile"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Type *
            </label>
            <select
              value={formData.materialType}
              onChange={(e) => onUpdate('materialType', e.target.value as MaterialType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={MaterialType.METAL}>Metal</option>
              <option value={MaterialType.PLASTIC}>Plastic</option>
              <option value={MaterialType.COMPOSITE}>Composite</option>
              <option value={MaterialType.CERAMIC}>Ceramic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detection Settings */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Detection Settings</h4>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Sensitivity: {Math.round(formData.defaultSensitivity * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={formData.defaultSensitivity}
            onChange={(e) => onUpdate('defaultSensitivity', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low Sensitivity</span>
            <span>High Sensitivity</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Critical Defect Types *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(DefectType).map(defectType => (
              <label key={defectType} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={formData.criticalDefects.includes(defectType)}
                  onChange={(e) => {
                    const newDefects = e.target.checked
                      ? [...formData.criticalDefects, defectType]
                      : formData.criticalDefects.filter(d => d !== defectType);
                    onUpdate('criticalDefects', newDefects);
                  }}
                  className="mr-2 rounded"
                />
                <span className="capitalize">{defectType.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Quality Standards */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Quality Standards</h4>
        <div className="space-y-2">
          {formData.qualityStandards.map((standard, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={standard}
                onChange={(e) => {
                  const newStandards = [...formData.qualityStandards];
                  newStandards[index] = e.target.value;
                  onUpdate('qualityStandards', newStandards);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => onRemoveQualityStandard(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={onAddQualityStandard}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            + Add Quality Standard
          </button>
        </div>
      </div>

      {/* Custom Parameters */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Custom Parameters</h4>
        <div className="space-y-2">
          {Object.entries(formData.customParameters).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  const newParams = { ...formData.customParameters };
                  delete newParams[key];
                  newParams[e.target.value] = value;
                  onUpdate('customParameters', newParams);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Parameter name"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  onUpdate('customParameters', {
                    ...formData.customParameters,
                    [key]: e.target.value
                  });
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Parameter value"
              />
              <button
                onClick={() => onRemoveCustomParameter(key)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={onAddCustomParameter}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            + Add Custom Parameter
          </button>
        </div>
      </div>
    </div>
  );
};

interface ProfileCardProps {
  profile: ComponentProfile;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const getMaterialColor = (material: MaterialType) => {
    switch (material) {
      case MaterialType.METAL:
        return 'bg-gray-100 text-gray-800';
      case MaterialType.PLASTIC:
        return 'bg-blue-100 text-blue-800';
      case MaterialType.COMPOSITE:
        return 'bg-green-100 text-green-800';
      case MaterialType.CERAMIC:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{profile.name}</h3>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getMaterialColor(profile.materialType)}`}>
            {profile.materialType.toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicate}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Duplicate profile"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Edit profile"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete profile"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium text-gray-700">Sensitivity:</span>
          <span className="ml-2 text-gray-600">{Math.round(profile.defaultSensitivity * 100)}%</span>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">Critical Defects:</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {profile.criticalDefects.slice(0, 3).map(defect => (
              <span key={defect} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs capitalize">
                {defect.replace('_', ' ')}
              </span>
            ))}
            {profile.criticalDefects.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{profile.criticalDefects.length - 3} more
              </span>
            )}
          </div>
        </div>

        {profile.qualityStandards.length > 0 && (
          <div>
            <span className="font-medium text-gray-700">Standards:</span>
            <div className="mt-1 text-gray-600">
              {profile.qualityStandards.slice(0, 2).join(', ')}
              {profile.qualityStandards.length > 2 && ` +${profile.qualityStandards.length - 2} more`}
            </div>
          </div>
        )}

        {Object.keys(profile.customParameters).length > 0 && (
          <div>
            <span className="font-medium text-gray-700">Custom Parameters:</span>
            <span className="ml-2 text-gray-600">{Object.keys(profile.customParameters).length} defined</span>
          </div>
        )}
      </div>
    </div>
  );
};