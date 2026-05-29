import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment as env } from '../../environments/environment';
import { DashboardResponse } from '../models/dashboard.models';
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  private apiUrl = env.apiUrl;

  getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard`).pipe(
      tap((response: DashboardResponse) => {
        console.log('Dashboard data received:', response);
      }),
    );
  }
}
