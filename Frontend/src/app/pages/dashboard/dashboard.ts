import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardResponse } from '../../models/dashboard.models';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  imports: [CommonModule],
})
export class DashboardComponent implements OnInit {
  constructor(private dashboardService: DashboardService) {}
  currentDate = new Date();

  dashBoardData: DashboardResponse = {
    success: false,
    data: {
      stats: {
        activeProjects: 0,
        totalClients: 0,
        unpaidInvoices: 0,
        totalUnpaid: 0,
        overdueInvoices: 0,
        earnedThisMonth: 0,
      },
      upcomingDeadlines: [],
      recentActivity: [],
    },
  };

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe((data) => {
      console.log('Dashboard data in component:', data);
      this.dashBoardData = data;
    });
  }

  getActivityDotClass(type: string): string {
    if (type === 'PROJECT_CREATED') return 'dot-project';
    if (type === 'TASK_CREATED') return 'dot-task';
    return 'dot-invoice';
  }

  formatRelativeTime(dateValue: string): string {
    const createdAt = new Date(dateValue).getTime();
    const now = Date.now();
    const diffMs = Math.max(now - createdAt, 0);

    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    if (diffMs < oneHour) {
      const mins = Math.max(Math.floor(diffMs / (60 * 1000)), 1);
      return `${mins}m ago`;
    }

    if (diffMs < oneDay) {
      const hours = Math.floor(diffMs / oneHour);
      return `${hours}h ago`;
    }

    if (diffMs < oneDay * 2) {
      return 'Yesterday';
    }

    const days = Math.floor(diffMs / oneDay);
    return `${days}d ago`;
  }
}
