export type ClientStatus = 'ACTIVE' | 'INACTIVE';

export interface ClientListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: ClientStatus;
}

export interface ClientProjectItem {
  id: string;
  title: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  deadline: string | null;
}

export interface ClientDetails extends ClientListItem {
  notes: string | null;
  projects: ClientProjectItem[];
}

export interface ClientPayloadResult extends ClientListItem {
  notes: string | null;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  status?: ClientStatus;
}

export type UpdateClientRequest = Partial<CreateClientRequest>;

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
