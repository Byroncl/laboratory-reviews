import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthUser as User } from '../../../features/auth/models/auth.model';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../features/auth/store/auth.selectors';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsersService } from '../../admin/services/users.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
  user$: Observable<User | null>;

  readonly totalPosts = signal(0);
  readonly totalComments = signal(0);
  readonly activeUsers = signal(0);
  readonly growthPercentage = signal(0);

  constructor(private store: Store, private usersService: UsersService) {
    this.user$ = this.store.select(state => {
      const authState = state as any;
      return authState?.auth?.user || null;
    });
  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.usersService.loadStats()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (response) => {
          const stats = response.data;
          this.activeUsers.set(stats.active || 0);
          this.totalPosts.set((stats as any).posts || 0);
          this.totalComments.set((stats as any).comments || 0);
          this.growthPercentage.set((stats as any).growthPercentage || 0);
        },
        error: (err) => {
          console.error('Error loading statistics:', err);
          // Fallback to zeros
          this.activeUsers.set(0);
          this.totalPosts.set(0);
          this.totalComments.set(0);
          this.growthPercentage.set(0);
        }
      });
  }
}
