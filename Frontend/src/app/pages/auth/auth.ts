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
import { LoginRequest, AuthResponse } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  auth: string = 'login';

  showErrorModal = signal(false);
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
}
