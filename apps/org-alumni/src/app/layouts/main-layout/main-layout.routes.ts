import { Route } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';

export const MAIN_LAYOUT_ROUTES: Route[] = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'posts',
        pathMatch: 'full'
      },
      {
        path: 'posts',
        loadChildren: () => import('../../features/posts/posts.routes').then(m => m.POSTS_ROUTES)
      },
      {
        path: 'events',
        loadChildren: () => import('../../features/events/events.routes').then(m => m.EVENTS_ROUTES)
      },
      {
        path: 'jobs',
        loadChildren: () => import('../../features/jobs/jobs.routes').then(m => m.JOBS_ROUTES)
      },
      {
        path: 'connects',
        loadChildren: () => import('../../features/connects/connects.routes').then(m => m.CONNECTS_ROUTES)
      },
      {
        path: 'admin',
        loadChildren: () => import('../../features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      }
    ]
  }
]; 