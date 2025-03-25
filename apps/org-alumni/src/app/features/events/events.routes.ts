import { Route } from '@angular/router';

export const EVENTS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./event-list/event-list.component').then(m => m.EventListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./event-create/event-create.component').then(m => m.EventCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./event-detail/event-detail.component').then(m => m.EventDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./event-edit/event-edit.component').then(m => m.EventEditComponent)
  }
]; 