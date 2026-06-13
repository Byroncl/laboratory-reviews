import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { selectIsLoading, selectAuthError, selectIsAuthenticated } from '../../store/auth.selectors';
import * as AuthActions from '../../store/auth.actions';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading$ = new Observable<boolean>();
  error$ = new Observable<string | null>();
  isShowPassword = false;
  isLoading = false;
  error: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.store.select(selectIsAuthenticated)
      .pipe(
        filter(auth => auth === true)
      )
      .subscribe(() => this.router.navigate(['/dashboard']));
  }

  private initForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = null;

      const { email, password } = this.loginForm.value;

      setTimeout(() => {
        const mockUser = {
          id: '1',
          email,
          name: email.split('@')[0]
        };

        localStorage.setItem('auth_token', 'mock-jwt-token-' + Date.now());
        localStorage.setItem('auth_user', JSON.stringify(mockUser));

        this.store.dispatch(AuthActions.loginSuccess({
          user: mockUser,
          token: 'mock-jwt-token-' + Date.now()
        }));

        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      }, 1500);
    }
  }

  togglePasswordVisibility(): void {
    this.isShowPassword = !this.isShowPassword;
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}
