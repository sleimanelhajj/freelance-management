import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  userName = 'Sleiman';
  userEmail = 'sleiman@test.com';

  navSections = [
    {
      label: 'Overview',
      links: [
        { label: 'Dashboard', icon: '/assets/dashboard.svg', route: '/app/dashboard' },
      ],
    },
    {
      label: 'Work',
      links: [
        { label: 'Clients', icon: '/assets/clients.svg', route: '/app/clients' },
        { label: 'Projects', icon: '/assets/projects.svg', route: '/app/projects' },
        { label: 'Tasks', icon: '/assets/tasks.svg', route: '/app/tasks' },
      ],
    },
    {
      label: 'Finance',
      links: [{ label: 'Invoices', icon: '/assets/invoice.svg', route: '/app/invoices' }],
    },
  ];
}
