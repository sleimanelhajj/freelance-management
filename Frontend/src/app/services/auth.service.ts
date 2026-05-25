import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment as env } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.models';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  private apiUrl = env.apiUrl;

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, {
        email: loginRequest.email,
        password: loginRequest.password,
      })
      .pipe(
        tap((response: AuthResponse) => {
          if (response.success && response.data.token) {
            console.log('Login successful, token received:', response.data.token);
            this.storeToken(response.data.token);
          }
        }),
      );
  }

  signUp(registerRequest: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, {
        name: registerRequest.name,
        email: registerRequest.email,
        password: registerRequest.password,
      })
      .pipe(
        tap((response: AuthResponse) => {
          if (response.success && response.data.token) {
            console.log('Registration successful, token received:', response.data.token);
            this.storeToken(response.data.token);
          }
        }),
      );
  }

  // helper functions to manage token in local storage
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  storeToken(token: string): void {
    localStorage.setItem('authToken', token);
  }
}
