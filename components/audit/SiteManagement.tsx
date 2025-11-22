'use client';

import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Building,
  Clock,
  Award,
  Calendar
} from 'lucide-react';
import { Site, AuditUser } from '@/types/audit';

interface SiteManagementProps {
  currentUser: AuditUser;
}

export default function SiteManagement({ currentUser }: SiteManagementProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem('audit_token');
      const response = await fetch('/api/audit/sites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSites(data.data);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm('Are you sure you want to delete this site? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('audit_token');
      const response = await fetch(`/api/audit/sites/${siteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchSites();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete site');
      }
    } catch (error) {
      console.error('Error deleting site:', error);
      alert('Failed to delete site');
    }
  };

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Management</h1>
          <p className="text-gray-600">Manage audit locations and facilities</p>
        </div>
        {currentUser.userType === 'ADMIN' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Site
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSites.map((site) => (
          <div
            key={site.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{site.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {site.location}
                  </div>
                </div>
              </div>
              {currentUser.userType === 'ADMIN' && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingSite(site)}
                    className="text-gray-400 hover:text-blue-600 p-1 rounded"
                    title="Edit site"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSite(site.id)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded"
                    title="Delete site"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {site.timezone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  {site.timezone}
                </div>
              )}
              {site.certifications && site.certifications.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="h-4 w-4 mr-2 text-gray-400" />
                  {site.certifications.join(', ')}
                </div>
              )}
              {site.lastAuditDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  Last audit: {new Date(site.lastAuditDate).toLocaleDateString()}
                </div>
              )}
            </div>

            {site.contactInfo && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">Contact</p>
                <p className="text-sm text-gray-700">{site.contactInfo.name}</p>
                <p className="text-sm text-gray-600">{site.contactInfo.email}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSites.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sites found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first site'}
          </p>
        </div>
      )}

      {/* Create/Edit Site Modal */}
      {(showCreateModal || editingSite) && (
        <SiteModal
          site={editingSite}
          onClose={() => {
            setShowCreateModal(false);
            setEditingSite(null);
          }}
          onSave={() => {
            fetchSites();
            setShowCreateModal(false);
            setEditingSite(null);
          }}
        />
      )}
    </div>
  );
}

// Site Modal Component
interface SiteModalProps {
  site?: Site | null;
  onClose: () => void;
  onSave: () => void;
}

function SiteModal({ site, onClose, onSave }: SiteModalProps) {
  const [formData, setFormData] = useState({
    name: site?.name || '',
    location: site?.location || '',
    organizationId: site?.organizationId || 'default-org',
    timezone: site?.timezone || 'Asia/Kolkata',
    certifications: site?.certifications?.join(', ') || '',
    contactName: site?.contactInfo?.name || '',
    contactEmail: site?.contactInfo?.email || '',
    contactPhone: site?.contactInfo?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('audit_token');
      const payload = {
        name: formData.name,
        location: formData.location,
        organizationId: formData.organizationId,
        timezone: formData.timezone,
        certifications: formData.certifications.split(',').map((c: string) => c.trim()).filter(Boolean),
        contactInfo: {
          name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone,
        },
      };

      const url = site ? `/api/audit/sites/${site.id}` : '/api/audit/sites';
      const method = site ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSave();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save site');
      }
    } catch (error) {
      console.error('Error saving site:', error);
      alert('Failed to save site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {site ? 'Edit Site' : 'Create Site'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              placeholder="City, State"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <input
              type="text"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              placeholder="Asia/Kolkata"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certifications
            </label>
            <input
              type="text"
              value={formData.certifications}
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
              placeholder="ISO 9001, ISO 14001 (comma separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
            
            <div className="space-y-3">
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Contact Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="Contact Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="Contact Phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}