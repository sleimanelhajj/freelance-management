import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal';
import { InputFieldComponent } from '../../components/shared/input-field/input-field';
import { LoginRequest, AuthResponse } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent, InputFieldComponent],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  auth: string = 'login';

  showErrorModal = signal(false);
  showSetPasswordModal = signal(false);
  settingPassword = signal(false);
  errorMessage = signal('');

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  setPasswordForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const token = params.get('token');
      const error = params.get('error');
      const provider = params.get('provider');
      const needsPasswordSetup = params.get('needsPasswordSetup') === '1';

      if (token) {
        this.authService.storeToken(token);
        if (provider === 'google') {
          if (needsPasswordSetup) {
            this.setPasswordForm.reset({
              password: '',
              confirmPassword: '',
            });
            this.showSetPasswordModal.set(true);
          } else {
            this.router.navigate(['/app']);
            return;
          }
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true,
          });
        } else {
          this.router.navigate(['/app']);
        }
        return;
      }

      if (error) {
        this.errorMessage.set(error);
        this.showErrorModal.set(true);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true,
        });
      }
    });
  }

  setAuth(auth: string) {
    this.auth = auth;
  }

  closeErrorModal() {
    this.showErrorModal.set(false);
    this.errorMessage.set('');
  }

  submitForm() {
    if (this.auth === 'login') {
      if (this.loginForm.valid) {
        this.authService.login(this.loginForm.value as LoginRequest).subscribe({
          next: (response: AuthResponse) => {
            console.log('Login success:', response);
            this.router.navigate(['/app']);
          },
          error: (err) => {
            this.errorMessage.set(err?.error?.message || 'Something went wrong. Please try again.');
            this.showErrorModal.set(true);
          },
        });
      } else {
        this.loginForm.markAllAsTouched();
      }
    } else if (this.auth === 'sign-up') {
      if (this.registerForm.valid) {
        this.authService.signUp(this.registerForm.value as any).subscribe({
          next: (response: AuthResponse) => {
            console.log('Registration success:', response);
            this.router.navigate(['/app']);
          },
          error: (err) => {
            this.errorMessage.set(err?.error?.message || 'Something went wrong. Please try again.');
            this.showErrorModal.set(true);
          },
        });
      } else {
        this.registerForm.markAllAsTouched();
      }
    }
  }

  continueWithGoogle(): void {
    this.authService.startGoogleAuth();
  }

  skipSetPassword(): void {
    this.authService.skipPasswordPrompt().subscribe({
      next: () => {
        this.showSetPasswordModal.set(false);
        this.router.navigate(['/app']);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to skip. Please try again.');
        this.showErrorModal.set(true);
      },
    });
  }

  submitSetPassword(): void {
    if (this.setPasswordForm.invalid) {
      this.setPasswordForm.markAllAsTouched();
      return;
    }

    const password = this.setPasswordForm.controls.password.value || '';
    const confirm = this.setPasswordForm.controls.confirmPassword.value || '';

    if (password !== confirm) {
      this.errorMessage.set('Passwords do not match.');
      this.showErrorModal.set(true);
      return;
    }

    this.settingPassword.set(true);
    this.authService.setPassword({ password }).subscribe({
      next: () => {
        this.settingPassword.set(false);
        this.showSetPasswordModal.set(false);
        this.router.navigate(['/app']);
      },
      error: (err) => {
        this.settingPassword.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to set password. Please try again.');
        this.showErrorModal.set(true);
      },
    });
  }
}
