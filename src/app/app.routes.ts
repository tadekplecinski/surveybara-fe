import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { AuthRedirectGuard } from './guards/auth-redirect.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [AuthRedirectGuard],
    component: LoginComponent,
  },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: '',
    component: LoginComponent,
    canActivate: [AuthRedirectGuard],
    pathMatch: 'full',
  },
  { path: '**', redirectTo: 'login' },
];
