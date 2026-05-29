import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment as env } from '../../environments/environment';
import {
  AuthResponse,
  BasicApiResponse,
  LoginRequest,
  RegisterRequest,
  SetPasswordRequest,
  User,
} from '../models/auth.models';
import { signal } from '@angular/core';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  private apiUrl = env.apiUrl;
  private currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();

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
            this.currentUserSignal.set(response.data.user);
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
            this.currentUserSignal.set(response.data.user);
          }
        }),
      );
  }

  getMe(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/auth/me`).pipe(
      tap((response) => {
        if (response.success) {
          this.currentUserSignal.set(response.data);
        }
      }),
      map((response) => response.data),
    );
  }

  // helper functions to manage token in local storage
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  storeToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  clearToken(): void {
    localStorage.removeItem('authToken');
  }

  logout(): void {
    this.clearToken();
    this.currentUserSignal.set(null);
  }

  startGoogleAuth(): void {
    window.location.href = `${this.apiUrl}/auth/google`;
  }

  setPassword(payload: SetPasswordRequest): Observable<BasicApiResponse> {
    return this.http.post<BasicApiResponse>(`${this.apiUrl}/auth/set-password`, payload);
  }

  skipPasswordPrompt(): Observable<BasicApiResponse> {
    return this.http.post<BasicApiResponse>(`${this.apiUrl}/auth/password-prompt/skip`, {});
  }
}
