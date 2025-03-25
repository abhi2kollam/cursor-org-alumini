import { Route } from '@angular/router';

export const POSTS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./post-list/post-list.component').then(m => m.PostListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./post-create/post-create.component').then(m => m.PostCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./post-detail/post-detail.component').then(m => m.PostDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./post-edit/post-edit.component').then(m => m.PostEditComponent)
  }
];