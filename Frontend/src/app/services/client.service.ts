import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment as env } from '../../environments/environment';
import {
  ApiResponse,
  ClientDetails,
  ClientListItem,
  ClientPayloadResult,
  CreateClientRequest,
  UpdateClientRequest,
} from '../models/client.models';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private apiUrl = env.apiUrl;

  constructor(private http: HttpClient) {}

  getClients(): Observable<ClientListItem[]> {
    return this.http
      .get<ApiResponse<ClientListItem[]>>(`${this.apiUrl}/clients`)
      .pipe(map((res) => res.data));
  }

  getClientById(id: string): Observable<ClientDetails> {
    return this.http
      .get<ApiResponse<ClientDetails>>(`${this.apiUrl}/clients/${id}`)
      .pipe(map((res) => res.data));
  }

  createClient(payload: CreateClientRequest): Observable<ClientPayloadResult> {
    return this.http
      .post<ApiResponse<ClientPayloadResult>>(`${this.apiUrl}/clients`, payload)
      .pipe(map((res) => res.data));
  }

  updateClient(id: string, payload: UpdateClientRequest): Observable<ClientPayloadResult> {
    return this.http
      .patch<ApiResponse<ClientPayloadResult>>(`${this.apiUrl}/clients/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clients/${id}`);
  }
}
