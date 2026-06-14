import { Routes } from '@angular/router';
import { PostsListComponent } from './pages/posts-list.component';
import { PostDetailComponent } from './pages/post-detail.component';
import { PostFormComponent } from './pages/post-form.component';

export const postsRoutes: Routes = [
  { path: '', component: PostsListComponent },
  { path: 'create', component: PostFormComponent },
  { path: ':id', component: PostDetailComponent },
  { path: ':id/edit', component: PostFormComponent },
];
