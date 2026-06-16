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
  fieldErrors: Record<string, string> = {};
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
    this.subscribeToErrors();
  }

  private subscribeToErrors(): void {
    this.store.select(selectAuthError).subscribe(error => {
      if (error) {
        this.setErrorForField(error);
      }
    });
  }

  private setErrorForField(errorMessage: string): void {
    // Clear previous errors
    this.fieldErrors = {};

    // Map backend validation messages to form fields
    const errorMappings: Record<string, string[]> = {
      name: ['El nombre', 'name'],
      lastname: ['El apellido', 'lastname', 'last name'],
      username: ['El nombre de usuario', 'username'],
      email: ['El correo electrónico', 'email', 'Email'],
      password: ['La contraseña', 'password']
    };

    // Check which field the error belongs to
    const lowerError = errorMessage.toLowerCase();
    for (const [fieldName, keywords] of Object.entries(errorMappings)) {
      if (keywords.some(keyword => lowerError.includes(keyword.toLowerCase()))) {
        this.fieldErrors[fieldName] = errorMessage;
        this.error = errorMessage; // Also show in general error
        return;
      }
    }

    // If no specific field matched, show as general error
    this.error = errorMessage;
  }

  private initForm(): void {
    this.registerForm = this.formBuilder.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        lastname: ['', [Validators.required, Validators.minLength(2)]],
        username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        accountType: ['client', [Validators.required]]
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
      this.fieldErrors = {};

      const { username, password, ...rest } = this.registerForm.value;
      // Normalize username and email to lowercase
      const normalizedUsername = username.toLowerCase().trim();
      this.store.dispatch(
        AuthActions.register({
          username: normalizedUsername,
          password,
          name: rest.name,
          lastname: rest.lastname,
          email: rest.email.toLowerCase().trim(),
          accountType: rest.accountType || 'client'
        })
      );
      this.isLoading = false;
    }
  }

  onFieldFocus(fieldName: string): void {
    // Clear the error for this specific field when user starts typing
    delete this.fieldErrors[fieldName];
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
    this.router.navigate(['/']);
  }
}
