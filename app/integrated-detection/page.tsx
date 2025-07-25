'use client';

import React, { useState, useEffect } from 'react';
import { DetectionWorkflow } from '@/components/detection/DetectionWorkflow';
import { BatchResultsVisualization } from '@/components/detection/BatchResultsVisualization';
import { ComponentProfileManager } from '@/components/profiles/ComponentProfileManager';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { SearchAndFilter } from '@/components/dashboard/SearchAndFilter';
import { DetectionResult, ComponentProfile, DefectSeverity, ResultStatus } from '@/types';
import { ProfileService } from '@/services/profiles/ProfileService';

type ViewMode = 'detection' | 'results' | 'profiles' | 'analytics';

export default function IntegratedDetectionPage() {
  const [currentView, setCurrentView] = useState<ViewMode>('detection');
  
  // Check URL params for initial tab
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') as ViewMode;
    if (tab && ['detection', 'results', 'profiles', 'analytics'].includes(tab)) {
      setCurrentView(tab);
    }
  }, []);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<DetectionResult[]>([]);
  const [profiles, setProfiles] = useState<ComponentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load profiles on component mount
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const profileService = ProfileService.getInstance();
      const loadedProfiles = await profileService.getAllProfiles();
      setProfiles(loadedProfiles);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  const handleDetectionComplete = (results: DetectionResult[]) => {
    setDetectionResults(prev => [...prev, ...results]);
    setCurrentView('results');
  };

  const handleProfileCreate = async (profileData: Omit<ComponentProfile, 'id'>) => {
    try {
      const profileService = ProfileService.getInstance();
      const newProfile = await profileService.createProfile(profileData);
      setProfiles(prev => [...prev, newProfile]);
    } catch (error) {
      console.error('Failed to create profile:', error);
      alert('Failed to create profile. Please try again.');
    }
  };

  const handleProfileUpdate = async (id: string, profileData: Omit<ComponentProfile, 'id'>) => {
    try {
      const profileService = ProfileService.getInstance();
      const updatedProfile = await profileService.updateProfile(id, profileData);
      setProfiles(prev => prev.map(p => p.id === id ? updatedProfile : p));
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleProfileDelete = async (id: string) => {
    try {
      const profileService = ProfileService.getInstance();
      await profileService.deleteProfile(id);
      setProfiles(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete profile:', error);
      alert('Failed to delete profile. Please try again.');
    }
  };

  const handleProfileDuplicate = async (profile: ComponentProfile) => {
    try {
      const profileService = ProfileService.getInstance();
      const duplicatedProfile = await profileService.duplicateProfile(profile.id);
      setProfiles(prev => [...prev, duplicatedProfile]);
    } catch (error) {
      console.error('Failed to duplicate profile:', error);
      alert('Failed to duplicate profile. Please try again.');
    }
  };

  const handleExportResults = (format: 'pdf' | 'csv' | 'json') => {
    // Implementation would use the ReportGenerator service
    console.log(`Exporting results as ${format}`);
    alert(`Export functionality will be implemented for ${format} format`);
  };

  const navigationItems = [
    { id: 'detection', label: 'Detection', icon: '🔍' },
    { id: 'results', label: 'Results', icon: '📊', badge: detectionResults.length },
    { id: 'profiles', label: 'Profiles', icon: '⚙️', badge: profiles.length },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AI NDT Defect Detection</h1>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Integrated System
              </span>
            </div>
            
            {/* System Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">System Online</span>
              </div>
              <div className="text-sm text-gray-500">
                {detectionResults.length} inspections completed
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as ViewMode)}
                className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  currentView === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'detection' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Start New Detection</h2>
              <p className="text-gray-600 mt-1">
                Upload images or videos for AI-powered defect detection analysis
              </p>
            </div>
            <DetectionWorkflow
              onDetectionComplete={handleDetectionComplete}
            />
          </div>
        )}

        {currentView === 'results' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Detection Results</h2>
              <p className="text-gray-600 mt-1">
                View and analyze your defect detection results
              </p>
            </div>
            
            {detectionResults.length > 0 ? (
              <div className="space-y-6">
                <SearchAndFilter
                  results={detectionResults}
                  onFilteredResults={setFilteredResults}
                />
                <BatchResultsVisualization
                  results={filteredResults.length > 0 ? filteredResults : detectionResults}
                  onExport={handleExportResults}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by running some detections to see results here
                </p>
                <button
                  onClick={() => setCurrentView('detection')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Detection
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'profiles' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Component Profiles</h2>
              <p className="text-gray-600 mt-1">
                Manage detection profiles for different component types and materials
              </p>
            </div>
            <ComponentProfileManager
              profiles={profiles}
              onProfileCreate={handleProfileCreate}
              onProfileUpdate={handleProfileUpdate}
              onProfileDelete={handleProfileDelete}
              onProfileDuplicate={handleProfileDuplicate}
            />
          </div>
        )}

        {currentView === 'analytics' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
              <p className="text-gray-600 mt-1">
                Comprehensive analytics and insights from your detection data
              </p>
            </div>
            
            {detectionResults.length > 0 ? (
              <AnalyticsDashboard
                results={detectionResults}
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📈</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
                <p className="text-gray-600 mb-4">
                  Analytics will appear here once you have detection results
                </p>
                <button
                  onClick={() => setCurrentView('detection')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Detection
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              AI NDT Defect Detection System v1.0 - Integrated Platform
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>System Status: Online</span>
              <span>•</span>
              <span>Last Updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}