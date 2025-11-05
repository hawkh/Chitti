import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(req: NextRequest) {
  const projects = storage.getProjects();
  return NextResponse.json(projects);
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

    storage.addProject(project);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
