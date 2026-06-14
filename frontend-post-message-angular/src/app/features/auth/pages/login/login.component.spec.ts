import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import * as AuthActions from '../../store/auth.actions';
import { selectIsLoading, selectAuthError } from '../../store/auth.selectors';
import { I18nService } from '../../../../core/services/i18n.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: MockStore;

  const initialState = {
    auth: {
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      token: null,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        provideMockStore({ initialState }),
        I18nService,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('dispatches login({username,password}) when form is submitted with valid credentials', () => {
    spyOn(store, 'dispatch');
    component.loginForm.setValue({ username: 'alice', password: 'password123' });
    component.onSubmit();
    expect(store.dispatch).toHaveBeenCalledWith(
      AuthActions.login({ username: 'alice', password: 'password123' })
    );
  });

  it('does not use setTimeout — no mock path', (done) => {
    spyOn(store, 'dispatch');
    component.loginForm.setValue({ username: 'alice', password: 'password123' });
    component.onSubmit();
    // If setTimeout were used, dispatch would not be called synchronously
    expect(store.dispatch).toHaveBeenCalled();
    done();
  });

  it('shows error message when selectError emits an error', () => {
    store.overrideSelector(selectAuthError, 'Invalid credentials');
    store.refreshState();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Invalid credentials');
  });

  it('shows loading spinner when selectIsLoading is true', () => {
    store.overrideSelector(selectIsLoading, true);
    store.refreshState();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    // Button should be disabled or show loading indicator
    const button = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBeTrue();
  });
});
