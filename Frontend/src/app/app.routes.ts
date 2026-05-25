import { Routes } from '@angular/router';
import { Auth } from './pages/auth/auth';
import { MainLayout } from './pages/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'app', pathMatch: 'full' },
  { path: 'auth', component: Auth },
  { path: 'app', component: MainLayout, canActivate: [authGuard] },
  { path: '**', redirectTo: 'app' },
];
