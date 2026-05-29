import { Routes } from '@angular/router';
import { Auth } from './pages/auth/auth';
import { MainLayoutComponent } from './pages/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'app/dashboard', pathMatch: 'full' },
  { path: 'auth', component: Auth },
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
        data: { title: 'Dashboard', subtitle: 'date' },
      },
      {
        path: 'clients',
        loadComponent: () => import('./pages/clients/clients').then((m) => m.ClientsComponent),
        data: { title: 'Clients', subtitle: 'Manage your client base' },
      },
      {
        path: 'clients/:id',
        loadComponent: () =>
          import('./pages/client-detail/client-detail').then((m) => m.ClientDetailComponent),
        data: { title: 'Client Detail', subtitle: 'Client profile and projects' },
      },
      {
        path: 'projects',
        loadComponent: () => import('./pages/projects/projects').then((m) => m.ProjectsComponent),
        data: { title: 'Projects', subtitle: 'All your active work' },
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('./pages/project-detail/project-detail').then((m) => m.ProjectDetailComponent),
        data: { title: 'Project Detail', subtitle: 'Project overview and activity' },
      },
      {
        path: 'tasks',
        loadComponent: () => import('./pages/tasks/tasks').then((m) => m.TasksComponent),
        data: { title: 'Tasks', subtitle: 'All tasks across projects' },
      },
      {
        path: 'invoices',
        loadComponent: () => import('./pages/invoices/invoices').then((m) => m.InvoicesComponent),
        data: { title: 'Invoices', subtitle: 'Track payments and billing' },
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings').then((m) => m.SettingsComponent),
        data: { title: 'Settings', subtitle: 'Manage your workspace preferences' },
      },
    ],
  },
  { path: '**', redirectTo: 'app/dashboard' },
];
