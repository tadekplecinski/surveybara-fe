import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { redirectIfAuthenticatedGuard } from './guards/auth-redirect.guard';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [redirectIfAuthenticatedGuard],
    component: LoginComponent,
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [redirectIfAuthenticatedGuard],
    component: LoginComponent,
  },
  { path: 'register', component: RegisterComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { role: 'admin' },
  },
  {
    path: 'user-dashboard',
    component: UserDashboardComponent,
    canActivate: [authGuard],
    data: { role: 'user' },
  },
  { path: '**', redirectTo: '/' },
];
