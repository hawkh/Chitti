// Simple in-memory storage (replace with database in production)
class MemoryStorage {
  private projects: any[] = [
    { id: 'proj_1', name: 'Project Alpha', clientName: 'Client A' },
    { id: 'proj_2', name: 'Project Beta', clientName: 'Client B' },
  ];
  private workOrders: any[] = [
    { id: 'wo_1', projectId: 'proj_1', title: 'Initial Work Order', assignedTo: 'John Doe', deadline: new Date(), priority: 'high', status: 'assigned' },
  ];

  // Projects
  getProjects() {
    return this.projects;
  }

  addProject(project: any) {
    this.projects.push(project);
    return project;
  }

  // Work Orders
  getWorkOrders(projectId?: string) {
    if (projectId) {
      return this.workOrders.filter(wo => wo.projectId === projectId);
    }
    return this.workOrders;
  }

  addWorkOrder(workOrder: any) {
    this.workOrders.push(workOrder);
    return workOrder;
  }
}

export const storage = new MemoryStorage();
