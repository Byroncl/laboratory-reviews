import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { LanguageSwitcherComponent } from '../../../../core/components/language-switcher.component';
import { ErrorMessagePipe } from '../../pipes/error-message.pipe';
import { FormErrorDirective } from '../../directives/form-error.directive';

import { selectIsLoading, selectAuthError, selectIsAuthenticated } from '../../store/auth.selectors';
import * as AuthActions from '../../store/auth.actions';

import { AUTH_FORM_VALIDATORS } from '../../constants';
import { hasFieldError, markFormAsTouched } from '../../utils';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    LanguageSwitcherComponent,
    ErrorMessagePipe,
    FormErrorDirective
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly loginForm = this.fb.group({
    username: ['', AUTH_FORM_VALIDATORS.USERNAME],
    password: ['', AUTH_FORM_VALIDATORS.PASSWORD]
  });

  readonly isLoading$ = toSignal(this.store.select(selectIsLoading), { initialValue: false });
  readonly error$ = toSignal(this.store.select(selectAuthError), { initialValue: null });
  readonly showPassword$ = signal(false);
  readonly isSubmitted$ = signal(false);
  readonly loginType$ = signal<'user' | 'client'>('user');

  constructor() {
    this.store.select(selectIsAuthenticated).pipe(
      filter(auth => auth === true),
      takeUntilDestroyed()
    ).subscribe(() => {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/dashboard';
      this.router.navigate([returnUrl]);
    });
  }

  hasError(field: string): boolean {
    return hasFieldError(this.loginForm, field);
  }

  togglePassword(): void {
    this.showPassword$.update(v => !v);
  }

  onSubmit(): void {
    this.isSubmitted$.set(true);
    markFormAsTouched(this.loginForm);

    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value as { username: string; password: string };
      this.store.dispatch(AuthActions.login({
        username: username.toLowerCase().trim(),
        password,
        type: this.loginType$()
      }));
    }
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
