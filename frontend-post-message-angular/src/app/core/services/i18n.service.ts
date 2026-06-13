import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'es' | 'en';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private currentLanguage$ = new BehaviorSubject<Language>('es');

  private translations: Record<Language, Record<string, any>> = {
    es: {
      auth: {
        login: {
          title: 'Bienvenido de vuelta',
          subtitle: 'Inicia sesión en tu cuenta para continuar',
          email: 'Correo o usuario',
          password: 'Contraseña',
          rememberMe: 'Recordar mi contraseña',
          signIn: 'Iniciar sesión',
          signing: 'Iniciando...',
          noAccount: '¿No tienes cuenta?',
          createAccount: 'Crear cuenta',
          copyright: '© 2024 Albatros. Todos los derechos reservados.',
          errors: {
            invalidEmail: 'Correo inválido',
            minPassword: 'Mínimo 6 caracteres'
          }
        },
        register: {
          title: 'Crear cuenta',
          subtitle: 'Regístrate para comenzar',
          fullName: 'Nombre completo',
          email: 'Correo electrónico',
          password: 'Contraseña',
          confirmPassword: 'Confirmar contraseña',
          createAccount: 'Crear cuenta',
          creating: 'Creando cuenta...',
          haveAccount: '¿Ya tienes cuenta?',
          signIn: 'Iniciar sesión',
          terms: 'Al crear una cuenta, aceptas nuestros',
          termsLink: 'Términos de servicio',
          joinTitle: 'Únete a nosotros',
          joinSubtitle: 'Crea tu cuenta y comienza a gestionar tu plataforma hoy',
          errors: {
            nameRequired: 'Se requiere nombre (mínimo 2 caracteres)',
            invalidEmail: 'Correo electrónico inválido',
            minPassword: 'Mínimo 6 caracteres',
            confirmRequired: 'Confirma tu contraseña',
            passwordMismatch: 'Las contraseñas no coinciden'
          }
        },
        common: {
          error: 'Error'
        }
      }
    },
    en: {
      auth: {
        login: {
          title: 'Welcome back',
          subtitle: 'Sign in to your account to continue',
          email: 'Email or username',
          password: 'Password',
          rememberMe: 'Remember my password',
          signIn: 'Sign in',
          signing: 'Signing in...',
          noAccount: "Don't have an account?",
          createAccount: 'Create account',
          copyright: '© 2024 Albatros. All rights reserved.',
          errors: {
            invalidEmail: 'Invalid email',
            minPassword: 'Minimum 6 characters'
          }
        },
        register: {
          title: 'Create account',
          subtitle: 'Sign up to get started',
          fullName: 'Full name',
          email: 'Email address',
          password: 'Password',
          confirmPassword: 'Confirm password',
          createAccount: 'Create account',
          creating: 'Creating account...',
          haveAccount: 'Already have an account?',
          signIn: 'Sign in',
          terms: 'By creating an account, you agree to our',
          termsLink: 'Terms of Service',
          joinTitle: 'Join us',
          joinSubtitle: 'Create your account and start managing your platform today',
          errors: {
            nameRequired: 'Name is required (at least 2 characters)',
            invalidEmail: 'Please enter a valid email',
            minPassword: 'Password must be at least 6 characters',
            confirmRequired: 'Confirm password is required',
            passwordMismatch: 'Passwords do not match'
          }
        },
        common: {
          error: 'Error'
        }
      }
    }
  };

  get language$(): Observable<Language> {
    return this.currentLanguage$.asObservable();
  }

  get currentLanguage(): Language {
    return this.currentLanguage$.getValue();
  }

  setLanguage(lang: Language): void {
    this.currentLanguage$.next(lang);
    localStorage.setItem('app-language', lang);
  }

  translate(key: string, fallback: string = ''): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || fallback || key;
  }

  constructor() {
    const savedLang = localStorage.getItem('app-language') as Language;
    if (savedLang) {
      this.currentLanguage$.next(savedLang);
    }
  }
}
