import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  auth: string = 'login';

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

  submitForm() {
    if (this.auth === 'login') {
      if (this.loginForm.valid) {
        console.log('Login Payload Submitted:', this.loginForm.value);
      } else {
        this.loginForm.markAllAsTouched();
      }
    } else {
      if (this.registerForm.valid) {
        console.log('Registration Payload Submitted:', this.registerForm.value);
      } else {
        this.registerForm.markAllAsTouched();
      }
    }
  }
}
