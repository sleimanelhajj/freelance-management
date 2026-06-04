import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import {
  InvoiceStatus,
  ProjectDetails,
  ProjectStatus,
  ProjectTaskPreview,
  UpdateProjectRequest,
} from '../../models/project.models';
import { ActionButton } from '../../components/shared/action-button/action-button';
import { InputFieldComponent } from '../../components/shared/input-field/input-field';
import { LayoutHeaderService } from '../../services/layout-header.service';
import { ProjectsService } from '../../services/projects.service';
import { TasksService } from '../../services/tasks.service';
import { RouteTransitionComponent } from '../../route-transition';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent, MatFormFieldModule, MatSelectModule, ActionButton],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetailComponent extends RouteTransitionComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService,
    private tasksService: TasksService,
    private layoutHeaderService: LayoutHeaderService,
  ) {
    super();
  }

  projectId = '';
  loading = signal(true);
  submitting = signal(false);
  deleting = signal(false);
  formModalOpen = signal(false);
  deleteConfirmOpen = signal(false);
  taskStatusUpdating = signal<Record<string, boolean>>({});
  errorMessage = signal('');
  project = signal<ProjectDetails | null>(null);

  projectForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    deadline: new FormControl('', { nonNullable: true }),
    budget: new FormControl('', { nonNullable: true }),
    status: new FormControl<ProjectStatus>('ACTIVE', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.projectId) {
      this.router.navigate(['/app/projects']);
      return;
    }
    this.loadProjectByID();
  }

  ngOnDestroy(): void {
    this.layoutHeaderService.clearOverrides();
  }

  loadProjectByID(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.projectsService.getProjectById(this.projectId).subscribe({
      next: (response) => {
        if (response.success) {
          const p = response.data;
          this.project.set(p);
          this.layoutHeaderService.setOverrides('Project Detail', `Projects / ${p.title}`);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load project details.');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/app/projects']);
  }

  openEditModal(): void {
    const p = this.project();
    if (!p) return;

    this.projectForm.reset({
      title: p.title,
      description: p.description ?? '',
      deadline: this.toDateInput(p.deadline),
      budget: p.budget !== null ? String(p.budget) : '',
      status: p.status,
    });
    this.formModalOpen.set(true);
  }

  closeEditModal(): void {
    this.formModalOpen.set(false);
    this.submitting.set(false);
  }

  submitEdit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const raw = this.projectForm.getRawValue();
    const parsedBudget = raw.budget !== '' ? Number(raw.budget) : undefined;
    const deadlineIso = raw.deadline ? `${raw.deadline}T00:00:00.000Z` : undefined;

    const payload: UpdateProjectRequest = {
      title: raw.title.trim(),
      description: raw.description.trim(),
      status: raw.status,
      ...(deadlineIso ? { deadline: deadlineIso } : {}),
      ...(parsedBudget !== undefined && Number.isFinite(parsedBudget)
        ? { budget: parsedBudget }
        : {}),
    };

    this.projectsService.updateProject(this.projectId, payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeEditModal();
        this.loadProjectByID();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to update project.');
        this.submitting.set(false);
      },
    });
  }

  openDeleteConfirm(): void {
    this.deleteConfirmOpen.set(true);
  }

  closeDeleteConfirm(): void {
    if (this.deleting()) return;
    this.deleteConfirmOpen.set(false);
  }

  confirmDelete(): void {
    this.deleting.set(true);
    this.projectsService.deleteProject(this.projectId).subscribe({
      next: () => {
        this.deleteConfirmOpen.set(false);
        this.router.navigate(['/app/projects']);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to delete project.');
        this.deleting.set(false);
      },
    });
  }

  viewAllInvoices(): void {
    this.router.navigate(['/app/invoices']);
  }

  onAddTask(): void {
    // TODO: Wire add-task modal/flow for this project detail page.
  }

  viewAllTasks(): void {
    this.router.navigate(['/app/tasks']);
  }

  projectStatusClass(status: ProjectStatus): string {
    if (status === 'ACTIVE') return 'status-active';
    if (status === 'COMPLETED') return 'status-completed';
    if (status === 'PAUSED') return 'status-paused';
    return 'status-cancelled';
  }

  taskStatusClass(status: ProjectTaskPreview['status']): string {
    if (status === 'DONE') return 'status-done';
    if (status === 'IN_PROGRESS') return 'status-in-progress';
    return 'status-todo';
  }

  invoiceStatusClass(status: InvoiceStatus): string {
    if (status === 'PAID') return 'status-paid';
    if (status === 'SENT') return 'status-sent';
    if (status === 'OVERDUE') return 'status-overdue';
    return 'status-draft';
  }

  isTaskUpdating(taskId: string): boolean {
    return !!this.taskStatusUpdating()[taskId];
  }

  toggleTaskCompleted(task: ProjectTaskPreview): void {
    const nextStatus: ProjectTaskPreview['status'] = task.status === 'DONE' ? 'TODO' : 'DONE';

    this.taskStatusUpdating.update((current) => ({ ...current, [task.id]: true }));

    this.tasksService.updateTask(task.id, { status: nextStatus }).subscribe({
      next: (updatedTask) => {
        const currentProject = this.project();
        if (currentProject) {
          this.project.set({
            ...currentProject,
            tasks: currentProject.tasks.map((t) =>
              t.id === updatedTask.id
                ? { ...t, status: updatedTask.status, dueDate: updatedTask.dueDate }
                : t,
            ),
          });
        }

        this.taskStatusUpdating.update((current) => ({ ...current, [task.id]: false }));
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to update task status.');
        this.taskStatusUpdating.update((current) => ({ ...current, [task.id]: false }));
      },
    });
  }

  private toDateInput(value: string | null): string {
    if (!value) return '';
    return value.slice(0, 10);
  }
}
