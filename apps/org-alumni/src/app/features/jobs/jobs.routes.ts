import { Route } from '@angular/router';

export const JOBS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./job-list/job-list.component').then(m => m.JobListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./job-create/job-create.component').then(m => m.JobCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./job-detail/job-detail.component').then(m => m.JobDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./job-edit/job-edit.component').then(m => m.JobEditComponent)
  }
]; 