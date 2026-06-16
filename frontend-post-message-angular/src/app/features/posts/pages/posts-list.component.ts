import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { PostsService } from '../services';
import { PostCardComponent, PostFilterComponent, PaginationComponent, BulkUploadComponent } from '../components';
import { IPostFilters } from '../interfaces';
import { IPost } from '../interfaces';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    TranslatePipe,
    PostCardComponent,
    PostFilterComponent,
    PaginationComponent,
    BulkUploadComponent,
  ],
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.css'],
})
export class PostsListComponent implements OnInit {
  private postsService = inject(PostsService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  public posts$ = this.postsService.posts$;
  public filteredPosts$ = this.postsService.filteredPosts$;
  public loading$ = this.postsService.isLoadingPosts;
  public error$ = this.postsService.postError;
  public pagination$ = this.postsService.pagination$;

  // Modal states
  readonly showViewModal = signal(false);
  readonly showEditModal = signal(false);
  readonly showCreateModal = signal(false);
  readonly showStatusModal = signal(false);
  readonly selectedPost = signal<IPost | null>(null);
  readonly selectedStatus = signal<string>('');
  readonly isSavingEdit = signal(false);
  readonly isCreatingPost = signal(false);

  editForm!: FormGroup;
  createForm!: FormGroup;

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(filters?: IPostFilters): void {
    this.postsService.loadPosts(filters).subscribe({
      error: (err) => console.error('Failed to load posts:', err),
    });
  }

  onFilterChange(filters: IPostFilters): void {
    this.postsService.updateFilters(filters);
    this.loadPosts(filters);
  }

  onFilterReset(): void {
    this.postsService.clearFilters();
    this.loadPosts();
  }

  onPostView(postId: string): void {
    const post = this.filteredPosts$().find(p => (p.id || p._id) === postId);
    if (post) {
      this.selectedPost.set(post);
      this.showViewModal.set(true);
    }
  }

  onPostEdit(postId: string): void {
    const post = this.filteredPosts$().find(p => (p.id || p._id) === postId);
    if (post) {
      this.selectedPost.set(post);
      this.initEditForm(post);
      this.showEditModal.set(true);
    }
  }

  private initEditForm(post: IPost): void {
    this.editForm = this.fb.group({
      title: [post.title, [Validators.required, Validators.minLength(5)]],
      body: [post.content, [Validators.required, Validators.minLength(20)]],
      tags: [post.tags?.join(', ') || '', []],
    });
  }

  onPostDelete(postId: string): void {
    Swal.fire({
      title: '¿Eliminar post?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d93026',
      cancelButtonColor: '#666',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.postsService.deletePost(postId).subscribe({
          next: () => {
            this.notificationService.toast('✅ Post eliminado correctamente', 'success');
            this.loadPosts();
          },
          error: (err) => {
            this.notificationService.toast('❌ Error al eliminar el post', 'error');
            console.error('Failed to delete post:', err);
          },
        });
      }
    });
  }

  onPostChangeStatus(event: { id: string; status: string }): void {
    const post = this.filteredPosts$().find(p => (p.id || p._id) === event.id);
    if (post) {
      this.selectedPost.set(post);
      this.selectedStatus.set(event.status);
      this.showStatusModal.set(true);
    }
  }

  confirmStatusChange(): void {
    if (this.selectedPost() && this.selectedStatus()) {
      const postId = this.selectedPost()?.id || this.selectedPost()?._id;
      if (postId) {
        this.postsService.updatePostStatus(postId, this.selectedStatus() as any).subscribe({
          next: () => {
            this.notificationService.toast('Estado del post actualizado', 'success');
            this.showStatusModal.set(false);
            this.loadPosts();
          },
          error: (err) => {
            this.notificationService.toast('Error al cambiar el estado', 'error');
            console.error('Failed to change post status:', err);
          },
        });
      }
    }
  }

  saveEditedPost(): void {
    if (!this.editForm.valid || !this.selectedPost()) {
      this.notificationService.toast('Por favor completa los campos requeridos', 'warning');
      return;
    }

    this.isSavingEdit.set(true);
    const postId = this.selectedPost()?.id || this.selectedPost()?._id;

    if (!postId) {
      this.notificationService.toast('Error: No se encontró el ID del post', 'error');
      this.isSavingEdit.set(false);
      return;
    }

    const formValue = this.editForm.value;
    const updateData = {
      title: formValue.title,
      body: formValue.body,
      tags: formValue.tags
        ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [],
    };

    this.postsService.updatePost(postId, updateData).subscribe({
      next: () => {
        this.notificationService.toast('✅ Post actualizado correctamente', 'success');
        this.showEditModal.set(false);
        this.isSavingEdit.set(false);
        this.loadPosts();
      },
      error: (err) => {
        this.notificationService.toast('❌ Error al actualizar el post', 'error');
        console.error('Failed to update post:', err);
        this.isSavingEdit.set(false);
      },
    });
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
  }

  openCreateModal(): void {
    this.initCreateForm();
    this.showCreateModal.set(true);
  }

  private initCreateForm(): void {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      body: ['', [Validators.required, Validators.minLength(20)]],
      tags: ['', []],
    });
  }

  createPost(): void {
    if (!this.createForm.valid) {
      this.notificationService.toast('Por favor completa los campos requeridos', 'warning');
      return;
    }

    this.isCreatingPost.set(true);
    const formValue = this.createForm.value;

    const currentUser = this.authService.currentUser$();
    const author = currentUser?.username || 'Anonymous';

    const createData: any = {
      title: formValue.title,
      content: formValue.body,
      body: formValue.body,
      author,
      tags: formValue.tags
        ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [],
    };

    this.postsService.createPost(createData).subscribe({
      next: () => {
        this.notificationService.toast('✅ Post creado correctamente', 'success');
        this.showCreateModal.set(false);
        this.isCreatingPost.set(false);
        this.loadPosts();
      },
      error: (err) => {
        this.notificationService.toast('❌ Error al crear el post', 'error');
        console.error('Failed to create post:', err);
        this.isCreatingPost.set(false);
      },
    });
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }


  onNextPage(): void {
    this.postsService.nextPage();
    this.loadPosts();
  }

  onPrevPage(): void {
    this.postsService.prevPage();
    this.loadPosts();
  }
}
