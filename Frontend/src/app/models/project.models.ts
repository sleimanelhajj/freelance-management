export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
export type ISODate = string;

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';

export interface ProjectClientRef {
  id: string;
  name: string;
}

export interface ProjectListItem {
  id: string;
  title: string;
  status: ProjectStatus;
  deadline: ISODate | null;
  budget: number | null;
  client: ProjectClientRef;
}

export interface ProjectTaskPreview {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate: ISODate | null;
}

export interface ProjectInvoicePreview {
  id: string;
  invoiceNumber: string;
  total: number;
  status: InvoiceStatus;
}

export interface ProjectDetails {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  deadline: ISODate | null;
  budget: number | null;
  client: ProjectClientRef;
  tasks: ProjectTaskPreview[];
  invoices: ProjectInvoicePreview[];
}

export interface CreateProjectRequest {
  clientId: string;
  title: string;
  description?: string;
  deadline?: ISODate;
  budget?: number;
  status?: ProjectStatus;
}

export type UpdateProjectRequest = Partial<Omit<CreateProjectRequest, 'clientId'>>;

export interface ProjectPayloadResult {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  deadline: ISODate | null;
  budget: number | null;
  clientId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export type ApiSuccess<T> = ApiResponse<T>;
