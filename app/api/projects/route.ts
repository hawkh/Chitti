import { NextRequest, NextResponse } from 'next/server';

// Mock projects storage
const mockProjects = [
  {
    id: 'proj_1',
    name: 'Bridge Inspection 2024',
    clientName: 'City Infrastructure Dept',
    description: 'Annual structural integrity assessment',
    standards: ['ISO 9001', 'ASTM E165'],
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-06-30'),
    status: 'active',
    managerId: 'mgr_1',
    teamMembers: ['inspector_1', 'inspector_2'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'proj_2',
    name: 'Pipeline NDT Survey',
    clientName: 'Energy Corp',
    description: 'Non-destructive testing of pipeline welds',
    standards: ['ASME B31.3', 'API 1104'],
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-08-31'),
    status: 'active',
    managerId: 'mgr_1',
    teamMembers: ['inspector_3', 'inspector_4', 'inspector_5'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'proj_3',
    name: 'Manufacturing Quality Audit',
    clientName: 'AutoTech Industries',
    description: 'Quarterly quality control inspection',
    standards: ['ISO 9001', 'IATF 16949'],
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-05-31'),
    status: 'active',
    managerId: 'mgr_2',
    teamMembers: ['inspector_6', 'inspector_7'],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-01')
  }
];

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(mockProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const project = {
      id: `proj_${Date.now()}`,
      name: data.name,
      clientName: data.clientName,
      description: data.description,
      standards: data.standards || [],
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: 'active',
      managerId: data.managerId || 'default',
      teamMembers: data.teamMembers || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockProjects.push(project);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
