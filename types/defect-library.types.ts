// Defect Library Types
export interface DefectKnowledge {
  id: string;
  defectType: string;
  definition: string;
  causes: string[];
  remedies: string[];
  preventiveMeasures: string[];
  standardsReference: {
    [standard: string]: {
      clause: string;
      acceptanceCriteria: string;
    };
  };
  visualExamples: string[];
  severity: 'minor' | 'moderate' | 'major' | 'critical';
}
