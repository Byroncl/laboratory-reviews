import { Routes } from '@angular/router';
import {
  PostsListComponent,
  PostDetailComponent,
  PostFormComponent,
} from './pages';

export const postsRoutes: Routes = [
  {
    path: '',
    component: PostsListComponent,
    data: { title: 'Posts' },
  },
  {
    path: 'new',
    component: PostFormComponent,
    data: { title: 'Create Post' },
  },
  {
    path: ':id',
    component: PostDetailComponent,
    data: { title: 'Post Detail' },
  },
  {
    path: ':id/edit',
    component: PostFormComponent,
    data: { title: 'Edit Post' },
  },
];
