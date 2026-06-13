import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from './features/auth/store/auth.actions';
import { AdvancedModalComponent } from './shared/components/modal/advanced-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AdvancedModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'frontend-post-message-angular';

  constructor(private store: Store) {}

  ngOnInit(): void {
    // Cargar autenticación desde localStorage al iniciar
    this.store.dispatch(AuthActions.loadAuthFromStorage());
  }
}
