import { Route } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerificationPendingComponent } from './verification-pending/verification-pending.component';

export const AUTH_ROUTES: Route[] = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'verification-pending',
    component: VerificationPendingComponent
  }
]; 