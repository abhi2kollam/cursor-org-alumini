import { Route } from '@angular/router';

export const CONNECTS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./connect-list/connect-list.component').then(m => m.ConnectListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./connect-detail/connect-detail.component').then(m => m.ConnectDetailComponent)
  }
]; 