import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  accountMenuOpen = false;
  @Input() mobileOpen = false;
  @Output() navClosed = new EventEmitter<void>();

  navSections = [
    {
      label: 'Overview',
      links: [{ label: 'Dashboard', icon: '/assets/dashboard.svg', route: '/app/dashboard' }],
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

  ngOnInit(): void {
    // Pull latest user profile so sidebar always reflects logged in account.
    this.authService.getMe().subscribe({
      error: () => {
        // If token is invalid/expired, logout and return to auth page.
        this.authService.logout();
        this.router.navigate(['/auth']);
      },
    });
  }

  get userInitials(): string {
    const name = this.authService.currentUser()?.name || '';
    const words = name.trim().split(/\s+/).filter(Boolean);
    const first = words[0]?.[0] ?? '';
    const second = words[1]?.[0] ?? '';
    return `${first}${second}`.toUpperCase() || 'U';
  }

  toggleAccountMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.accountMenuOpen = !this.accountMenuOpen;
  }

  closeAccountMenu(): void {
    this.accountMenuOpen = false;
  }

  closeMobileNav(): void {
    this.closeAccountMenu();
    this.navClosed.emit();
  }

  onLogout(): void {
    this.closeAccountMenu();
    this.navClosed.emit();
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAccountMenu();
  }
}
