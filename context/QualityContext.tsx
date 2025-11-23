'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuditFormData } from '@/types/audit-form.types';
import { DetectionResult } from '@/types';

// Types for our global state
export interface Site {
    id: string;
    name: string;
    location: string;
    complianceScore: number;
    defectRate: number;
    lastAudit: Date;
    status: 'operational' | 'attention' | 'critical';
    activeIssues: number;
}

export interface Alert {
    id: string;
    type: 'compliance' | 'defect' | 'audit';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    site: string;
}

interface QualityContextType {
    // Data
    audits: AuditFormData[];
    defects: DetectionResult[];
    sites: Site[];
    alerts: Alert[];

    // Actions
    addAudit: (audit: AuditFormData) => void;
    addDefect: (defect: DetectionResult) => void;
    updateSiteStatus: (siteId: string, updates: Partial<Site>) => void;

    // Computed Metrics
    getOverallCompliance: () => number;
    getDefectRate: () => number;
}

const QualityContext = createContext<QualityContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_SITES: Site[] = [
    {
        id: '1',
        name: 'Manufacturing Plant A',
        location: 'Mumbai, India',
        complianceScore: 92.5,
        defectRate: 2.3,
        lastAudit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'operational',
        activeIssues: 2,
    },
    {
        id: '2',
        name: 'Manufacturing Plant B',
        location: 'Pune, India',
        complianceScore: 78.2,
        defectRate: 5.8,
        lastAudit: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        status: 'attention',
        activeIssues: 7,
    },
    {
        id: '3',
        name: 'Quality Control Center',
        location: 'Bangalore, India',
        complianceScore: 95.1,
        defectRate: 1.2,
        lastAudit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'operational',
        activeIssues: 0,
    },
];

const INITIAL_ALERTS: Alert[] = [
    {
        id: '1',
        type: 'compliance',
        severity: 'high',
        message: 'Plant B compliance score dropped below 80%',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        site: 'Manufacturing Plant B',
    },
    {
        id: '2',
        type: 'defect',
        severity: 'medium',
        message: 'Increased defect rate detected in production line 3',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        site: 'Manufacturing Plant A',
    },
];

export function QualityProvider({ children }: { children: ReactNode }) {
    const [audits, setAudits] = useState<AuditFormData[]>([]);
    const [defects, setDefects] = useState<DetectionResult[]>([]);
    const [sites, setSites] = useState<Site[]>(INITIAL_SITES);
    const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const loadData = () => {
            try {
                const savedAudits = localStorage.getItem('chitti_audits');
                const savedDefects = localStorage.getItem('chitti_defects');
                const savedSites = localStorage.getItem('chitti_sites');
                const savedAlerts = localStorage.getItem('chitti_alerts');

                if (savedAudits) setAudits(JSON.parse(savedAudits));
                if (savedDefects) setDefects(JSON.parse(savedDefects));
                if (savedSites) setSites(JSON.parse(savedSites));
                if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
            } catch (e) {
                console.error('Failed to load data from localStorage', e);
            } finally {
                setIsInitialized(true);
            }
        };

        loadData();
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem('chitti_audits', JSON.stringify(audits));
        localStorage.setItem('chitti_defects', JSON.stringify(defects));
        localStorage.setItem('chitti_sites', JSON.stringify(sites));
        localStorage.setItem('chitti_alerts', JSON.stringify(alerts));
    }, [audits, defects, sites, alerts, isInitialized]);

    const addAudit = (audit: AuditFormData) => {
        setAudits(prev => [audit, ...prev]);

        // Logic to update site compliance based on audit
        // This is a simplified simulation
        const siteId = audit.siteId || '1'; // Default to Plant A if not specified

        // Calculate simple score from audit responses
        const totalItems = Object.keys(audit.responses).length;
        const passedItems = Object.values(audit.responses).filter(r => r.response === 'pass').length;
        const score = totalItems > 0 ? (passedItems / totalItems) * 100 : 100;

        // Update site
        updateSiteStatus(siteId, {
            complianceScore: Math.round(score),
            lastAudit: new Date(),
            status: score < 80 ? 'attention' : 'operational'
        });

        // Trigger alert if score is low
        if (score < 80) {
            const newAlert: Alert = {
                id: Date.now().toString(),
                type: 'compliance',
                severity: score < 70 ? 'high' : 'medium',
                message: `Low compliance score (${Math.round(score)}%) detected in recent audit`,
                timestamp: new Date(),
                site: sites.find(s => s.id === siteId)?.name || 'Unknown Site'
            };
            setAlerts(prev => [newAlert, ...prev]);
        }
    };

    const addDefect = (defect: DetectionResult) => {
        setDefects(prev => [defect, ...prev]);

        // If defect is found, update defect rate simulation
        if (defect.overallStatus === 'fail') {
            const siteId = '1'; // Default to Plant A
            const currentSite = sites.find(s => s.id === siteId);
            if (currentSite) {
                updateSiteStatus(siteId, {
                    defectRate: Math.min(100, currentSite.defectRate + 0.5),
                    activeIssues: currentSite.activeIssues + 1
                });

                // Trigger alert for critical defects
                const criticalDefects = defect.defects.filter(d => d.severity === 'critical');
                if (criticalDefects.length > 0) {
                    const newAlert: Alert = {
                        id: Date.now().toString(),
                        type: 'defect',
                        severity: 'high',
                        message: `Critical defect detected: ${criticalDefects[0].type}`,
                        timestamp: new Date(),
                        site: currentSite.name
                    };
                    setAlerts(prev => [newAlert, ...prev]);
                }
            }
        }
    };

    const updateSiteStatus = (siteId: string, updates: Partial<Site>) => {
        setSites(prev => prev.map(site =>
            site.id === siteId ? { ...site, ...updates } : site
        ));
    };

    const getOverallCompliance = () => {
        if (sites.length === 0) return 0;
        const sum = sites.reduce((acc, site) => acc + site.complianceScore, 0);
        return Math.round(sum / sites.length);
    };

    const getDefectRate = () => {
        if (sites.length === 0) return 0;
        const sum = sites.reduce((acc, site) => acc + site.defectRate, 0);
        return Number((sum / sites.length).toFixed(1));
    };

    return (
        <QualityContext.Provider value={{
            audits,
            defects,
            sites,
            alerts,
            addAudit,
            addDefect,
            updateSiteStatus,
            getOverallCompliance,
            getDefectRate
        }}>
            {children}
        </QualityContext.Provider>
    );
}

export function useQualityContext() {
    const context = useContext(QualityContext);
    if (context === undefined) {
        throw new Error('useQualityContext must be used within a QualityProvider');
    }
    return context;
}
