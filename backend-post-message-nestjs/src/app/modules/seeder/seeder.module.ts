import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { ClientsModule } from '../clients/clients.module';
import { CategoriesModule } from '../categories/categories.module';
import { PostsModule } from '../posts/posts.module';
import { CommentsModule } from '../comments/comments.module';
import { FavoritesModule } from '../favorites/favorites.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PermissionsModule,
    RolesModule,
    UsersModule,
    ClientsModule,
    CategoriesModule,
    PostsModule,
    CommentsModule,
    FavoritesModule,
    NotificationsModule,
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
