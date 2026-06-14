---
sidebar_position: 4
title: Comments Module
description: Comments with real-time WebSocket support
---

# Comments Module 💬

Manages post comments with real-time updates via Socket.IO WebSocket gateway.

## Overview

```mermaid
graph TB
    subgraph "HTTP"
        Controller["CommentsController<br/>CRUD REST endpoints"]
    end
    
    subgraph "WebSocket"
        Gateway["CommentsGateway<br/>Real-time events"]
    end
    
    Service["CommentsService<br/>Business logic"]
    Model["Comment Mongoose Model"]
    
    Controller --> Service
    Gateway --> Service
    Service --> Model
```

## Schema

```typescript
@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Schema.Types.ObjectId, ref: 'Post', required: true })
  postId: Post;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  body: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
```

## REST Controller

```typescript
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  createComment(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.createComment(createCommentDto);
  }

  @Get('post/:postId')
  findByPost(@Param('postId') postId: string) {
    return this.commentsService.findByPostId(postId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findById(id);
  }

  @Patch(':id')
  updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(id, updateCommentDto);
  }

  @Delete(':id')
  removeComment(@Param('id') id: string) {
    return this.commentsService.removeComment(id);
  }
}
```

## WebSocket Gateway

```typescript
@WebSocketGateway({
  namespace: '/comments',
  cors: {
    origin: '*',
  },
})
export class CommentsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userConnections: Map<string, { userId: string; username: string }> = new Map();

  constructor(private commentsService: CommentsService) {}

  @SubscribeMessage('user:register')
  handleUserRegister(
    @MessageBody() data: { userId: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.userConnections.set(client.id, data);
    this.server.emit('users:connected', Array.from(this.userConnections.values()));
  }

  @SubscribeMessage('comment:create')
  async handleCreateComment(
    @MessageBody() data: CreateCommentDto,
    @ConnectedSocket() client: Socket,
  ) {
    const comment = await this.commentsService.createComment(data);
    this.server.emit('comment:created', comment);
  }

  @SubscribeMessage('comment:update')
  async handleUpdateComment(
    @MessageBody() data: { id: string; body: string },
    @ConnectedSocket() client: Socket,
  ) {
    const comment = await this.commentsService.updateComment(data.id, data);
    this.server.emit('comment:updated', comment);
  }

  @SubscribeMessage('comment:delete')
  async handleDeleteComment(
    @MessageBody() id: string,
    @ConnectedSocket() client: Socket,
  ) {
    await this.commentsService.removeComment(id);
    this.server.emit('comment:deleted', id);
  }

  @SubscribeMessage('comments:list')
  async handleListComments(
    @MessageBody() postId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const comments = await this.commentsService.findByPostId(postId);
    client.emit('comments:list', comments);
  }

  @SubscribeMessage('comment:typing')
  handleTyping(
    @MessageBody() data: { username: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast.emit('comment:typing', data);
  }

  @SubscribeMessage('comment:typing:stop')
  handleTypingStop(
    @MessageBody() data: { username: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast.emit('comment:typing:stop', data);
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.userConnections.delete(client.id);
    this.server.emit('users:connected', Array.from(this.userConnections.values()));
    console.log(`Client disconnected: ${client.id}`);
  }
}
```

## Socket Events

### Client → Server

| Event | Payload | Purpose |
|-------|---------|---------|
| `user:register` | `{ userId, username }` | Register user presence |
| `comment:create` | `CreateCommentDto` | Create comment |
| `comment:update` | `{ id, body }` | Update comment |
| `comment:delete` | `id: string` | Delete comment |
| `comments:list` | `postId: string` | Fetch all comments for post |
| `comment:typing` | `{ username }` | User started typing |
| `comment:typing:stop` | `{ username }` | User stopped typing |

### Server → Client

| Event | Payload | Purpose |
|-------|---------|---------|
| `comment:created` | `Comment` | New comment created |
| `comment:updated` | `Comment` | Comment updated |
| `comment:deleted` | `id: string` | Comment deleted |
| `comments:list` | `Comment[]` | Comments list response |
| `users:connected` | `{ userId, username }[]` | Connected users list |
| `comment:typing` | `{ username }` | User is typing |
| `comment:typing:stop` | `{ username }` | User stopped typing |

## Service

```typescript
@Injectable()
export class CommentsService {
  constructor(
    @InjectModel('Comment') private commentModel: Model<CommentDocument>,
    private postsService: PostsService,
  ) {}

  async createComment(createCommentDto: CreateCommentDto) {
    // Verify post exists
    await this.postsService.findById(createCommentDto.postId);

    const comment = new this.commentModel(createCommentDto);
    return comment.save();
  }

  async findById(id: string) {
    const comment = await this.commentModel.findById(id).exec();
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async findByPostId(postId: string) {
    return this.commentModel
      .find({ postId, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateComment(id: string, updateCommentDto: UpdateCommentDto) {
    return this.commentModel
      .findByIdAndUpdate(id, updateCommentDto, { new: true })
      .exec();
  }

  async removeComment(id: string) {
    return this.commentModel
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .exec();
  }
}
```

## DTOs

```typescript
export class CreateCommentDto {
  @IsMongoId()
  postId: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(5)
  body: string;
}

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  body?: string;
}
```

## Client Example (Angular)

```typescript
import { Socket, io } from 'socket.io-client';

export class CommentsService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000/comments');
  }

  registerUser(userId: string, username: string) {
    this.socket.emit('user:register', { userId, username });
  }

  createComment(comment: CreateCommentDto) {
    this.socket.emit('comment:create', comment);
  }

  listenForNewComments() {
    return new Observable(observer => {
      this.socket.on('comment:created', (comment) => {
        observer.next(comment);
      });
    });
  }

  listenForTyping() {
    return new Observable(observer => {
      this.socket.on('comment:typing', (data) => {
        observer.next(data);
      });
    });
  }
}
```

## REST Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/comments` | POST | ❌ | Create comment |
| `/comments/post/:postId` | GET | ❌ | Get comments for post |
| `/comments/:id` | GET | ❌ | Get comment by ID |
| `/comments/:id` | PATCH | ❌ | Update comment |
| `/comments/:id` | DELETE | ❌ | Delete comment |

## Security Concerns ⚠️

1. **No authentication on WebSocket**: The gateway doesn't verify JWT tokens
2. **In-memory user tracking**: User presence is stored in memory and lost on reconnect
3. **No authorization checks**: Any connected user can create/update/delete comments

See [WebSocket Security Issues](../websocket/security.md)

## Architecture Note

Like Posts, this module uses flat Service → Model pattern. Consider refactoring to Clean Architecture for consistency.

---

**Next**: [Files Module →](./files.md)
