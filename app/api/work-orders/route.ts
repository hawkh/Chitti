import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  
  const workOrders = storage.getWorkOrders(projectId || undefined);
  return NextResponse.json(workOrders);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const workOrder = {
      id: `wo_${Date.now()}`,
      projectId: data.projectId,
      title: data.title,
      assignedTo: data.assignedTo,
      components: data.components || [],
      ndtMethods: data.ndtMethods || [],
      deadline: new Date(data.deadline),
      priority: data.priority || 'medium',
      status: 'assigned',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    storage.addWorkOrder(workOrder);
    return NextResponse.json(workOrder, { status: 201 });
  } catch (error) {
    console.error('Work order creation error:', error);
    return NextResponse.json({ error: 'Failed to create work order' }, { status: 500 });
  }
}
