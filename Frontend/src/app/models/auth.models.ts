export interface LoginRequest {
  email: string | null;
  password: string | null;
}

// Matching your exact Swagger payload pattern with null safety
export interface RegisterRequest {
  name: string | null;
  email: string | null;
  password: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthData;
}

export interface SetPasswordRequest {
  password: string;
}

export interface BasicApiResponse {
  success: boolean;
  message: string;
}
