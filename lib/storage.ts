// Simple in-memory storage (replace with database in production)
class MemoryStorage {
  private projects: any[] = [];
  private workOrders: any[] = [];

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
