// Profile service for managing component profiles

import { ComponentProfile } from '@/types';

export class ProfileService {
  private static instance: ProfileService;
  private baseUrl = '/api/profiles';

  private constructor() {}

  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  async getAllProfiles(filters?: {
    materialType?: string;
    search?: string;
  }): Promise<ComponentProfile[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.materialType) params.append('materialType', filters.materialType);
      if (filters?.search) params.append('search', filters.search);

      const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch profiles: ${response.statusText}`);
      }

      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
  }

  async getProfile(id: string): Promise<ComponentProfile | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async createProfile(profileData: Omit<ComponentProfile, 'id'>): Promise<ComponentProfile> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create profile');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  async updateProfile(id: string, profileData: Omit<ComponentProfile, 'id'>): Promise<ComponentProfile> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...profileData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update profile');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async deleteProfile(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete profile');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }

  async duplicateProfile(id: string): Promise<ComponentProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'duplicate' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to duplicate profile');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error duplicating profile:', error);
      throw error;
    }
  }

  async exportProfiles(profiles: ComponentProfile[]): Promise<void> {
    try {
      const dataStr = JSON.stringify(profiles, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `component-profiles-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting profiles:', error);
      throw error;
    }
  }

  async importProfiles(file: File): Promise<ComponentProfile[]> {
    try {
      const text = await file.text();
      const profiles = JSON.parse(text) as ComponentProfile[];

      // Validate the imported data
      if (!Array.isArray(profiles)) {
        throw new Error('Invalid file format: expected array of profiles');
      }

      // Validate each profile
      for (const profile of profiles) {
        if (!profile.name || !profile.materialType || !profile.criticalDefects) {
          throw new Error('Invalid profile data: missing required fields');
        }
      }

      // Import each profile (they'll get new IDs)
      const importedProfiles: ComponentProfile[] = [];
      for (const profile of profiles) {
        try {
          const { id, ...profileData } = profile; // Remove existing ID
          const imported = await this.createProfile(profileData);
          importedProfiles.push(imported);
        } catch (error) {
          console.warn(`Failed to import profile "${profile.name}":`, error);
          // Continue with other profiles
        }
      }

      return importedProfiles;
    } catch (error) {
      console.error('Error importing profiles:', error);
      throw error;
    }
  }

  // Utility method to validate profile data
  validateProfile(profile: Partial<ComponentProfile>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!profile.name || profile.name.trim().length === 0) {
      errors.push('Profile name is required');
    }

    if (profile.name && profile.name.length > 100) {
      errors.push('Profile name must be less than 100 characters');
    }

    if (!profile.materialType) {
      errors.push('Material type is required');
    }

    if (!profile.criticalDefects || profile.criticalDefects.length === 0) {
      errors.push('At least one critical defect type must be selected');
    }

    if (profile.defaultSensitivity !== undefined && (profile.defaultSensitivity < 0 || profile.defaultSensitivity > 1)) {
      errors.push('Default sensitivity must be between 0 and 1');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get default profile for a material type
  async getDefaultProfile(materialType: string): Promise<ComponentProfile | null> {
    try {
      const profiles = await this.getAllProfiles({ materialType });
      return profiles.find(p => p.name.toLowerCase().includes('default')) || profiles[0] || null;
    } catch (error) {
      console.error('Error getting default profile:', error);
      return null;
    }
  }
}