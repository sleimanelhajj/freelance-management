export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ISODate = string;

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: ISODate | null;
  projectId: string;
}

export interface CreateTaskRequest {
  projectId: string;
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: ISODate;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: ISODate;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
