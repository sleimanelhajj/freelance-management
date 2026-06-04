import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InputFieldComponent } from '../../components/shared/input-field/input-field';
import { ModalShellComponent } from '../../components/shared/modal-shell/modal-shell';
import { ProjectListItem } from '../../models/project.models';
import { Priority, CreateTaskRequest, TaskItem, TaskStatus, UpdateTaskRequest } from '../../models/task.models';
import { ProjectsService } from '../../services/projects.service';
import { TasksService } from '../../services/tasks.service';
import { ActionButton } from "../../components/shared/action-button/action-button";

interface TaskTableItem extends TaskItem {
  projectTitle: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent, MatFormFieldModule, MatSelectModule, ActionButton, ModalShellComponent],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class TasksComponent implements OnInit {
  constructor(
    private projectsService: ProjectsService,
    private tasksService: TasksService,
  ) {}

  loading = signal(false);
  submitting = signal(false);
  deleteSubmitting = signal(false);
  statusUpdating = signal<Record<string, boolean>>({});
  formModalOpen = signal(false);
  deleteConfirmOpen = signal(false);
  errorMessage = '';

  formMode: 'create' | 'edit' = 'create';
  editingTaskId: string | null = null;
  deleteCandidate: TaskTableItem | null = null;

  projects: ProjectListItem[] = [];
  tasks: TaskTableItem[] = [];

  taskForm = new FormGroup({
    projectId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    status: new FormControl<TaskStatus>('TODO', { nonNullable: true }),
    priority: new FormControl<Priority>('MEDIUM', { nonNullable: true }),
    dueDate: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.loadProjectsAndTasks();
  }

  loadProjectsAndTasks(): void {
    this.loading.set(true);
    this.errorMessage = '';

    this.projectsService.getProjects().subscribe({
      next: (projectResponse) => {
        if (!projectResponse.success) {
          this.loading.set(false);
          return;
        }

        this.projects = projectResponse.data;
        if (this.projects.length === 0) {
          this.tasks = [];
          this.loading.set(false);
          return;
        }

        const perProjectTaskCalls = this.projects.map((project) =>
          this.tasksService.getTasksByProject(project.id).pipe(
            catchError(() => of([])),
          ),
        );

        forkJoin(perProjectTaskCalls).subscribe({
          next: (taskGroups) => {
            this.tasks = taskGroups
              .flatMap((projectTasks, index) =>
                projectTasks.map((task) => ({
                  ...task,
                  projectTitle: this.projects[index].title,
                })),
              )
              .sort((a, b) => {
                const left = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                const right = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                return left - right;
              });
            this.loading.set(false);
          },
          error: () => {
            this.errorMessage = 'Failed to load tasks.';
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load projects.';
        this.loading.set(false);
      },
    });
  }

  openAddModal(): void {
    this.formMode = 'create';
    this.editingTaskId = null;
    this.taskForm.controls.projectId.enable();
    this.taskForm.reset({
      projectId: this.projects[0]?.id ?? '',
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
    });
    this.formModalOpen.set(true);
  }

  openEditModal(task: TaskTableItem): void {
    this.formMode = 'edit';
    this.editingTaskId = task.id;
    this.taskForm.reset({
      projectId: task.projectId,
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      dueDate: this.toDateInput(task.dueDate),
    });
    // Backend update route edits task fields only, not projectId.
    this.taskForm.controls.projectId.disable();
    this.formModalOpen.set(true);
  }

  closeFormModal(): void {
    this.formModalOpen.set(false);
    this.submitting.set(false);
  }

  submitTaskForm(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage = '';

    const raw = this.taskForm.getRawValue();
    const dueDateIso = raw.dueDate ? `${raw.dueDate}T00:00:00.000Z` : undefined;

    if (this.formMode === 'create') {
      const createPayload: CreateTaskRequest = {
        projectId: raw.projectId,
        title: raw.title.trim(),
        priority: raw.priority,
        ...(raw.description.trim() ? { description: raw.description.trim() } : {}),
        ...(dueDateIso ? { dueDate: dueDateIso } : {}),
      };

      this.tasksService.createTask(createPayload).subscribe({
        next: (createdTask) => {
          const project = this.projects.find((p) => p.id === createdTask.projectId);
          this.tasks = [
            {
              ...createdTask,
              projectTitle: project?.title ?? 'Unknown Project',
            },
            ...this.tasks,
          ];
          this.submitting.set(false);
          this.closeFormModal();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to create task.';
          this.submitting.set(false);
        },
      });
      return;
    }

    if (!this.editingTaskId) {
      this.submitting.set(false);
      return;
    }

    const updatePayload: UpdateTaskRequest = {
      title: raw.title.trim(),
      status: raw.status,
      priority: raw.priority,
      ...(raw.description.trim() ? { description: raw.description.trim() } : {}),
      ...(dueDateIso ? { dueDate: dueDateIso } : {}),
    };

    this.tasksService.updateTask(this.editingTaskId, updatePayload).subscribe({
      next: (updatedTask) => {
        this.tasks = this.tasks.map((task) =>
          task.id === updatedTask.id
            ? { ...task, ...updatedTask }
            : task,
        );
        this.submitting.set(false);
        this.closeFormModal();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to update task.';
        this.submitting.set(false);
      },
    });
  }

  requestDelete(task: TaskTableItem): void {
    this.deleteCandidate = task;
    this.deleteConfirmOpen.set(true);
  }

  cancelDelete(): void {
    if (this.deleteSubmitting()) return;
    this.deleteConfirmOpen.set(false);
    this.deleteCandidate = null;
  }

  confirmDelete(): void {
    if (!this.deleteCandidate) return;

    const task = this.deleteCandidate;
    this.deleteSubmitting.set(true);

    this.tasksService.deleteTask(task.id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t.id !== task.id);
        this.deleteSubmitting.set(false);
        this.cancelDelete();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to delete task.';
        this.deleteSubmitting.set(false);
        this.cancelDelete();
      },
    });
  }

  taskStatusClass(status: TaskStatus): string {
    if (status === 'DONE') return 'status-done';
    if (status === 'IN_PROGRESS') return 'status-in-progress';
    return 'status-todo';
  }

  formatStatusLabel(status: TaskStatus): string {
    return status === 'IN_PROGRESS' ? 'IN PROGRESS' : status;
  }

  isStatusUpdating(taskId: string): boolean {
    return !!this.statusUpdating()[taskId];
  }

  cycleTaskStatus(task: TaskTableItem): void {
    if (this.isStatusUpdating(task.id)) return;

    const nextStatus: TaskStatus =
      task.status === 'TODO' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';

    this.statusUpdating.update((current) => ({ ...current, [task.id]: true }));

    this.tasksService.updateTask(task.id, { status: nextStatus }).subscribe({
      next: (updatedTask) => {
        this.tasks = this.tasks.map((t) =>
          t.id === updatedTask.id
            ? { ...t, status: updatedTask.status, dueDate: updatedTask.dueDate }
            : t,
        );
        this.statusUpdating.update((current) => ({ ...current, [task.id]: false }));
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to update task status.';
        this.statusUpdating.update((current) => ({ ...current, [task.id]: false }));
      },
    });
  }

  priorityClass(priority: Priority): string {
    if (priority === 'HIGH') return 'priority-high';
    if (priority === 'MEDIUM') return 'priority-medium';
    return 'priority-low';
  }

  private toDateInput(value: string | null): string {
    if (!value) return '';
    return value.slice(0, 10);
  }
}
