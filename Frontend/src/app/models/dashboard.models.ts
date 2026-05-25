export type DashboardActivityType = 'PROJECT_CREATED' | 'TASK_CREATED' | 'INVOICE_CREATED';

export interface DashboardStats {
  activeProjects: number;
  totalClients: number;
  unpaidInvoices: number;
  totalUnpaid: number;
  overdueInvoices: number;
  earnedThisMonth: number;
}

export interface UpcomingDeadline {
  projectId: string;
  title: string;
  deadline: string;
  clientName: string;
}

export interface RecentActivityItem {
  type: DashboardActivityType;
  description: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  upcomingDeadlines: UpcomingDeadline[];
  recentActivity: RecentActivityItem[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}
