import { Routes } from '@angular/router';
import { ClientComponent } from './client.component';
import { MyPostsComponent } from './pages/my-posts/my-posts.component';
import { MyFavoritesComponent } from './pages/my-favorites/my-favorites.component';
import { MyCommentsComponent } from './pages/my-comments/my-comments.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    component: ClientComponent,
    children: [
      {
        path: 'my-posts',
        component: MyPostsComponent,
      },
      {
        path: 'my-favorites',
        component: MyFavoritesComponent,
      },
      {
        path: 'my-comments',
        component: MyCommentsComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: '',
        redirectTo: 'my-posts',
        pathMatch: 'full',
      },
    ],
  },
];
