import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthStateModel } from './auth.model';
import { Login, LoginSuccess, LoginFailure, Logout } from './auth.actions';
import { AuthService } from '../../core/services/auth.service';

const defaults: AuthStateModel = {
  token: null,
  user: null,
  isLoading: false,
};

@State<AuthStateModel>({
  name: 'auth',
  defaults,
})
@Injectable()
export class AuthState {
  private authService = inject(AuthService);
  private router = inject(Router);

  @Selector()
  static token(state: AuthStateModel): string | null {
    return state.token;
  }

  @Selector()
  static user(state: AuthStateModel) {
    return state.user;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return !!state.token;
  }

  @Selector()
  static role(state: AuthStateModel): string | null {
    return state.user?.role ?? null;
  }

  @Selector()
  static isLoading(state: AuthStateModel): boolean {
    return state.isLoading;
  }

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    ctx.patchState({ isLoading: true });
    return this.authService.login(action.payload.username, action.payload.password).pipe(
      tap((res) => {
        ctx.dispatch(new LoginSuccess({ token: res.data.token, user: res.data.user }));
      }),
      catchError((err) => {
        ctx.dispatch(new LoginFailure(err.error?.error?.message ?? 'Login gagal.'));
        return throwError(() => err);
      })
    );
  }

  @Action(LoginSuccess)
  loginSuccess(ctx: StateContext<AuthStateModel>, action: LoginSuccess) {
    ctx.patchState({
      token: action.payload.token,
      user: action.payload.user,
      isLoading: false,
    });
    this.router.navigate(['/dashboard']);
  }

  @Action(LoginFailure)
  loginFailure(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ isLoading: false });
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    ctx.setState(defaults);
    this.router.navigate(['/login']);
  }
}
