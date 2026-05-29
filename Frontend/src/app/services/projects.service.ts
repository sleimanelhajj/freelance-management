import {
  ApiResponse,
  CreateProjectRequest,
  ProjectDetails,
  ProjectListItem,
  ProjectPayloadResult,
  UpdateProjectRequest,
} from './../models/project.models';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment as env } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  constructor(private http: HttpClient) {}

  private apiUrl = env.apiUrl;

  getProjects(): Observable<ApiResponse<ProjectListItem[]>> {
    return this.http.get<ApiResponse<ProjectListItem[]>>(`${this.apiUrl}/projects`).pipe(
      tap((response) => {
        console.log('Fetched projects:', response);
      }),
    );
  }
  getProjectById(projectId: string): Observable<ApiResponse<ProjectDetails>> {
    return this.http.get<ApiResponse<ProjectDetails>>(`${this.apiUrl}/projects/${projectId}`).pipe(
      tap((response) => {
        console.log(`Fetched project ${projectId}:`, response);
      }),
    );
  }

  createProject(payload: CreateProjectRequest): Observable<ApiResponse<ProjectPayloadResult>> {
    return this.http
      .post<ApiResponse<ProjectPayloadResult>>(`${this.apiUrl}/projects`, payload)
      .pipe(
        tap((response) => {
          console.log('Created project:', response);
        }),
      );
  }

  updateProject(
    projectId: string,
    payload: UpdateProjectRequest,
  ): Observable<ApiResponse<ProjectPayloadResult>> {
    return this.http
      .patch<ApiResponse<ProjectPayloadResult>>(`${this.apiUrl}/projects/${projectId}`, payload)
      .pipe(
        tap((response) => {
          console.log(`Updated project ${projectId}:`, response);
        }),
      );
  }

  deleteProject(projectId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}`).pipe(
      tap(() => {
        console.log(`Deleted project ${projectId}`);
      }),
    );
  }
}
