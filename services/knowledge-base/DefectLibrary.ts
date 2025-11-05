import { DefectKnowledge } from '@/types/defect-library.types';

export class DefectLibraryService {
  private library: Map<string, DefectKnowledge> = new Map();

  constructor() {
    this.loadLibrary();
  }

  getDefectInfo(defectType: string): DefectKnowledge | null {
    return this.library.get(defectType) || null;
  }

  getCauses(defectType: string): string[] {
    return this.library.get(defectType)?.causes || [];
  }

  getRemedies(defectType: string): string[] {
    return this.library.get(defectType)?.remedies || [];
  }

  getStandardsReference(defectType: string, standard: string) {
    const defect = this.library.get(defectType);
    return defect?.standardsReference[standard] || null;
  }

  getAllDefects(): DefectKnowledge[] {
    return Array.from(this.library.values());
  }

  private loadLibrary() {
    DEFECT_DATA.forEach(defect => {
      this.library.set(defect.defectType, defect);
    });
  }
}

const DEFECT_DATA: DefectKnowledge[] = [
  {
    id: 'porosity',
    defectType: 'porosity',
    definition: 'Gas entrapment forming cavities in weld metal',
    causes: [
      'Moisture on electrode or base metal',
      'Improper shielding gas flow',
      'Surface contamination (oil, rust, paint)',
      'Excessive arc length',
      'High welding speed'
    ],
    remedies: [
      'Use low-hydrogen electrodes',
      'Preheat base metal to remove moisture',
      'Ensure proper gas flow rate (15-20 CFH)',
      'Clean surfaces thoroughly before welding',
      'Reduce travel speed'
    ],
    preventiveMeasures: [
      'Store electrodes in heated cabinet',
      'Use proper joint preparation',
      'Maintain equipment regularly'
    ],
    standardsReference: {
      'AWS D1.1': {
        clause: '6.12.2',
        acceptanceCriteria: 'Max 10 pores per inch, cumulative 25mm per 300mm'
      },
      'ASME B31.3': {
        clause: 'Table 341.3.2',
        acceptanceCriteria: 'Scattered porosity acceptable if <3% of weld area'
      }
    },
    visualExamples: ['/defects/porosity-1.jpg'],
    severity: 'moderate'
  },
  {
    id: 'crack',
    defectType: 'crack',
    definition: 'Linear fracture in weld or base metal',
    causes: [
      'High residual stress',
      'Hydrogen embrittlement',
      'Rapid cooling rate',
      'Poor joint design',
      'Excessive restraint'
    ],
    remedies: [
      'Preheat material to proper temperature',
      'Control cooling rate with post-heat',
      'Use correct filler metal composition',
      'Improve joint design',
      'Apply stress relief heat treatment'
    ],
    preventiveMeasures: [
      'Proper preheat temperature',
      'Post-weld heat treatment',
      'Use low-hydrogen processes'
    ],
    standardsReference: {
      'AWS D1.1': {
        clause: '6.12.1',
        acceptanceCriteria: 'Not acceptable - any crack shall be rejected'
      },
      'ASME B31.3': {
        clause: '341.3.2',
        acceptanceCriteria: 'Not acceptable'
      }
    },
    visualExamples: ['/defects/crack-1.jpg'],
    severity: 'critical'
  },
  {
    id: 'slag_inclusion',
    defectType: 'slag_inclusion',
    definition: 'Non-metallic solid material entrapped in weld metal',
    causes: [
      'Improper cleaning between passes',
      'Low welding current',
      'Fast travel speed',
      'Incorrect electrode angle'
    ],
    remedies: [
      'Thoroughly clean each weld pass',
      'Increase amperage',
      'Adjust travel speed',
      'Correct electrode angle',
      'Use proper welding technique'
    ],
    preventiveMeasures: [
      'Wire brush between passes',
      'Proper welding parameters',
      'Welder training'
    ],
    standardsReference: {
      'AWS D1.1': {
        clause: '6.12.4',
        acceptanceCriteria: 'Max 3mm length for statically loaded structures'
      }
    },
    visualExamples: ['/defects/slag-1.jpg'],
    severity: 'moderate'
  },
  {
    id: 'incomplete_fusion',
    defectType: 'incomplete_fusion',
    definition: 'Lack of bonding between weld metal and base metal',
    causes: [
      'Low heat input',
      'Surface contamination',
      'Incorrect electrode angle',
      'Fast travel speed',
      'Poor joint preparation'
    ],
    remedies: [
      'Increase welding current',
      'Clean surfaces thoroughly',
      'Correct electrode angle',
      'Reduce travel speed',
      'Improve joint preparation'
    ],
    preventiveMeasures: [
      'Proper welding parameters',
      'Good joint fit-up',
      'Adequate access'
    ],
    standardsReference: {
      'AWS D1.1': {
        clause: '6.12.5',
        acceptanceCriteria: 'Not acceptable'
      }
    },
    visualExamples: ['/defects/incomplete-fusion-1.jpg'],
    severity: 'major'
  },
  {
    id: 'undercut',
    defectType: 'undercut',
    definition: 'Groove melted into base metal at weld toe',
    causes: [
      'High amperage',
      'Excessive travel speed',
      'Incorrect electrode angle',
      'Long arc length'
    ],
    remedies: [
      'Reduce amperage and travel speed',
      'Maintain correct electrode angle',
      'Use short arc length',
      'Proper welding technique'
    ],
    preventiveMeasures: [
      'Proper parameter selection',
      'Welder training',
      'Use correct technique'
    ],
    standardsReference: {
      'AWS D1.1': {
        clause: '6.12.3',
        acceptanceCriteria: 'Max 1mm for statically loaded structures'
      }
    },
    visualExamples: ['/defects/undercut-1.jpg'],
    severity: 'moderate'
  }
];

export const defectLibrary = new DefectLibraryService();
