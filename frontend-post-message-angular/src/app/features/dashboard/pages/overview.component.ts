import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthUser as User } from '../../../features/auth/models/auth.model';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../features/auth/store/auth.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent {
  user$: Observable<User | null>;

  constructor(private store: Store) {
    this.user$ = this.store.select(state => {
      const authState = state as any;
      return authState?.auth?.user || null;
    });
  }
}
