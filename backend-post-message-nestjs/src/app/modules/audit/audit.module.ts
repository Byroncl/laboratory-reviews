import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AuditLog,
  AuditLogSchema,
  EntityType,
} from './schemas/audit-log.schema';
import { AuditService } from './services/audit.service';
import { AuditController } from './controllers/audit.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import {
  Permission,
  PermissionSchema,
} from '../permissions/schemas/permission.schema';
import { Post, PostSchema } from '../posts/schemas/post.schema';
import { Comment, CommentSchema } from '../comments/schemas/comment.schema';
import {
  Category,
  CategorySchema,
} from '../categories/schemas/category.schema';
import { PermissionsGuard } from '../../core/guards/permissions.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      // Entity schemas needed for snapshot map
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [AuditController],
  providers: [AuditService, PermissionsGuard],
  exports: [AuditService],
})
export class AuditModule implements OnModuleInit {
  constructor(
    private readonly auditService: AuditService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  onModuleInit(): void {
    this.auditService.registerModel(EntityType.USER, this.userModel);
    this.auditService.registerModel(EntityType.ROLE, this.roleModel);
    this.auditService.registerModel(
      EntityType.PERMISSION,
      this.permissionModel,
    );
    this.auditService.registerModel(EntityType.POST, this.postModel);
    this.auditService.registerModel(EntityType.COMMENT, this.commentModel);
    this.auditService.registerModel(EntityType.CATEGORY, this.categoryModel);
  }
}
