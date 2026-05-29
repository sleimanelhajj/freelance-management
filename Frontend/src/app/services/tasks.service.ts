import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment as env } from '../../environments/environment';
import { ApiResponse, CreateTaskRequest, TaskItem, UpdateTaskRequest } from '../models/task.models';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private apiUrl = env.apiUrl;

  constructor(private http: HttpClient) {}

  getTasksByProject(projectId: string): Observable<TaskItem[]> {
    return this.http
      .get<ApiResponse<TaskItem[]>>(`${this.apiUrl}/tasks/${projectId}/all`)
      .pipe(map((res) => res.data));
  }

  createTask(payload: CreateTaskRequest): Observable<TaskItem> {
    return this.http
      .post<ApiResponse<TaskItem>>(`${this.apiUrl}/tasks`, payload)
      .pipe(map((res) => res.data));
  }

  updateTask(taskId: string, payload: UpdateTaskRequest): Observable<TaskItem> {
    return this.http
      .patch<ApiResponse<TaskItem>>(`${this.apiUrl}/tasks/${taskId}`, payload)
      .pipe(map((res) => res.data));
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${taskId}`);
  }
}
