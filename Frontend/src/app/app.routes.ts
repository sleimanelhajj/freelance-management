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
      },
      {
        path: 'clients',
        loadComponent: () => import('./pages/clients/clients').then((m) => m.ClientsComponent),
      },
      {
        path: 'projects',
        loadComponent: () => import('./pages/projects/projects').then((m) => m.ProjectsComponent),
      },
      {
        path: 'tasks',
        loadComponent: () => import('./pages/tasks/tasks').then((m) => m.TasksComponent),
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./pages/invoices/invoices').then((m) => m.InvoicesComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings').then((m) => m.SettingsComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'app/dashboard' },
];
