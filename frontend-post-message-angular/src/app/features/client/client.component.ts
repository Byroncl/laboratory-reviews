import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { HasRoleDirective } from '../../core/directives/has-role.directive';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { DashboardService, UserStats } from './services/dashboard.service';
import { TrendingService, TrendingTag } from './services/trending.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Activity {
  id: string;
  user?: {
    name: string;
    avatar?: string;
  };
  text: string;
  createdAt: Date;
}

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    HasPermissionDirective,
    HasRoleDirective,
    DatePipe,
    TranslatePipe,
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
})
export class ClientComponent implements OnInit, OnDestroy {
  recentActivity = signal<Activity[]>([]);
  userStats = signal<UserStats>({
    postCount: 0,
    commentCount: 0,
    favoriteCount: 0,
  });
  trendingTags = signal<TrendingTag[]>([]);

  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
    private trendingService: TrendingService,
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.dashboardService.getUserStats().pipe(takeUntil(this.destroy$)).subscribe({
      next: stats => this.userStats.set(stats),
      error: () => this.userStats.set({ postCount: 0, commentCount: 0, favoriteCount: 0 }),
    });

    this.dashboardService.getRecentActivity(5).pipe(takeUntil(this.destroy$)).subscribe({
      next: activity => this.recentActivity.set(activity),
      error: () => this.recentActivity.set([]),
    });

    this.trendingService.getTrendingTags(5).pipe(takeUntil(this.destroy$)).subscribe({
      next: tags => this.trendingTags.set(tags),
      error: () => this.trendingTags.set([]),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
