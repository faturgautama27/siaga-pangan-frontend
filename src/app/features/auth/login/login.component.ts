import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { LucideAngularModule, ShieldAlert } from 'lucide-angular';
import { Login } from '../../../store/auth/auth.actions';
import { AuthState } from '../../../store/auth/auth.state';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    MessageModule,
    LucideAngularModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  readonly ShieldAlert = ShieldAlert;

  isLoading$ = this.store.select(AuthState.isLoading);
  errorMessage = '';

  form = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.errorMessage = '';

    const { username, password } = this.form.value;
    this.store.dispatch(new Login({ username: username!, password: password! })).subscribe({
      error: (err) => {
        this.errorMessage = err.error?.error?.message ?? 'Login gagal. Periksa email dan password.';
      },
    });
  }
}
