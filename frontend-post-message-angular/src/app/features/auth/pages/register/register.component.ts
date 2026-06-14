import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { selectIsLoading, selectAuthError } from '../../store/auth.selectors';
import * as AuthActions from '../../store/auth.actions';
import { I18nService } from '../../../../core/services/i18n.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { LanguageSwitcherComponent } from '../../../../core/components/language-switcher.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  error: string | null = null;
  isShowPassword = false;
  isShowConfirmPassword = false;

  get i18n(): I18nService {
    return this.i18nService;
  }

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private router: Router,
    private i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.formBuilder.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = null;

      const { name, password } = this.registerForm.value as { name: string; password: string };
      // Register dispatches login action with username; register endpoint is out of scope for this change
      this.store.dispatch(AuthActions.register({ username: name, password }));
      this.isLoading = false;
    }
  }

  togglePasswordVisibility(): void {
    this.isShowPassword = !this.isShowPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.isShowConfirmPassword = !this.isShowConfirmPassword;
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
