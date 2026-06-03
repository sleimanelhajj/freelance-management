import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InputFieldComponent } from '../../components/shared/input-field/input-field';
import {
  CreateProjectRequest,
  ProjectListItem,
  ProjectStatus,
  UpdateProjectRequest,
} from '../../models/project.models';
import { ProjectsService } from '../../services/projects.service';
import { ClientService } from '../../services/client.service';
import { ClientListItem } from '../../models/client.models';
import { Router } from '@angular/router';
import { RouteTransitionComponent } from '../../route-transition';
import { ActionButton } from "../../components/shared/action-button/action-button";

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent, MatFormFieldModule, MatSelectModule, ActionButton],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class ProjectsComponent extends RouteTransitionComponent implements OnInit {
  constructor(
    private projectsService: ProjectsService,
    private clientService: ClientService,
    private router: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    //initialize our clients:
    this.clientService.getClients().subscribe((clients) => {
      this.clients = clients;
    });

    // initialize the projects
    this.loadProjects();
  }

  projectsFetched = signal(true);
  addModalOpen = signal(false);
  editModalOpen = signal(false);
  editDetailsLoading = signal(false);
  deleteConfirmOpen = signal(false);
  deleteSubmitting = signal(false);
  editingProjectId: string | null = null;
  deleteCandidate: ProjectListItem | null = null;

  projects: ProjectListItem[] = [];
  clients: ClientListItem[] = [];

  // Shared form structure for the Add Project modal.
  projectForm = new FormGroup({
    clientId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    deadline: new FormControl('', { nonNullable: true }),
    budget: new FormControl('', { nonNullable: true }),
    status: new FormControl<ProjectStatus>('ACTIVE', { nonNullable: true }),
  });

  // Separate form for editing to keep add/edit state isolated.
  editProjectForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    deadline: new FormControl('', { nonNullable: true }),
    budget: new FormControl('', { nonNullable: true }),
    status: new FormControl<ProjectStatus>('ACTIVE', { nonNullable: true }),
  });

  openAddModal(): void {
    // Opens the add-project modal.
    this.projectForm.reset({
      clientId: '',
      title: '',
      description: '',
      deadline: '',
      budget: '',
      status: 'ACTIVE',
    });
    this.addModalOpen.set(true);
  }

  closeAddModal(): void {
    this.addModalOpen.set(false);
  }

  submitAddProject(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const raw = this.projectForm.getRawValue();
    const parsedBudget = raw.budget !== '' ? Number(raw.budget) : undefined;
    const deadlineIso = raw.deadline ? `${raw.deadline}T00:00:00.000Z` : undefined;
    const payload: CreateProjectRequest = {
      clientId: raw.clientId,
      title: raw.title.trim(),
      status: raw.status,
      ...(raw.description.trim() ? { description: raw.description.trim() } : {}),
      ...(deadlineIso ? { deadline: deadlineIso } : {}),
      ...(parsedBudget !== undefined && Number.isFinite(parsedBudget)
        ? { budget: parsedBudget }
        : {}),
    };

    this.projectsService.createProject(payload).subscribe({
      next: (response) => {
        if (response.success) {
          const created = response.data;
          const selectedClient = this.clients.find((c) => c.id === created.clientId);

          const createdListItem: ProjectListItem = {
            id: created.id,
            title: created.title,
            status: created.status,
            deadline: created.deadline,
            budget: created.budget,
            client: {
              id: selectedClient?.id ?? created.clientId,
              name: selectedClient?.name ?? 'Unknown Client',
            },
          };

          // Insert new project immediately to avoid extra reload calls.
          this.projects = [createdListItem, ...this.projects];
          this.projectsFetched.set(false);
        }
        this.closeAddModal();
      },
      error: () => {
        // TODO: Show proper toast/error feedback for failed create.
      },
    });
  }

  onView(project: ProjectListItem): void {
    this.router.navigate(['/app/projects', project.id]);
  }

  openEditModal(project: ProjectListItem): void {
    this.editingProjectId = project.id;
    this.editDetailsLoading.set(true);

    // Start with list data so modal opens immediately.
    this.editProjectForm.reset({
      title: project.title,
      description: '',
      deadline: this.toDateInput(project.deadline),
      budget: project.budget !== null ? String(project.budget) : '',
      status: project.status,
    });
    this.editModalOpen.set(true);

    // Pull full details (description, etc.) and patch form.
    this.projectsService.getProjectById(project.id).subscribe({
      next: (response) => {
        if (response.success) {
          const details = response.data;
          this.editProjectForm.patchValue({
            title: details.title,
            description: details.description ?? '',
            deadline: this.toDateInput(details.deadline),
            budget: details.budget !== null ? String(details.budget) : '',
            status: details.status,
          });
        }
        this.editDetailsLoading.set(false);
      },
      error: () => {
        this.editDetailsLoading.set(false);
      },
    });
  }

  closeEditModal(): void {
    this.editModalOpen.set(false);
    this.editDetailsLoading.set(false);
    this.editingProjectId = null;
  }

  submitEditProject(): void {
    if (!this.editingProjectId) return;
    if (this.editProjectForm.invalid) {
      this.editProjectForm.markAllAsTouched();
      return;
    }

    const raw = this.editProjectForm.getRawValue();
    const parsedBudget = raw.budget !== '' ? Number(raw.budget) : undefined;
    const deadlineIso = raw.deadline ? `${raw.deadline}T00:00:00.000Z` : undefined;
    const payload: UpdateProjectRequest = {
      title: raw.title.trim(),
      status: raw.status,
      ...(raw.description.trim() ? { description: raw.description.trim() } : {}),
      ...(deadlineIso ? { deadline: deadlineIso } : {}),
      ...(parsedBudget !== undefined && Number.isFinite(parsedBudget)
        ? { budget: parsedBudget }
        : {}),
    };

    this.projectsService.updateProject(this.editingProjectId, payload).subscribe({
      next: (response) => {
        if (response.success) {
          const updated = response.data;
          this.projects = this.projects.map((p) =>
            p.id === updated.id
              ? {
                  ...p,
                  title: updated.title,
                  status: updated.status,
                  deadline: updated.deadline,
                  budget: updated.budget,
                }
              : p,
          );
        }
        this.closeEditModal();
      },
      error: () => {
        // TODO: Show proper toast/error feedback for failed update.
      },
    });
  }

  requestDelete(project: ProjectListItem): void {
    this.deleteCandidate = project;
    this.deleteConfirmOpen.set(true);
  }

  cancelDelete(): void {
    if (this.deleteSubmitting()) return;
    this.deleteConfirmOpen.set(false);
    this.deleteCandidate = null;
  }

  confirmDelete(): void {
    if (!this.deleteCandidate) return;

    const project = this.deleteCandidate;
    this.deleteSubmitting.set(true);

    this.projectsService.deleteProject(project.id).subscribe({
      next: () => {
        this.projects = this.projects.filter((p) => p.id !== project.id);
        this.deleteSubmitting.set(false);
        this.cancelDelete();
      },
      error: () => {
        // TODO: Show proper toast/error feedback for failed delete.
        this.deleteSubmitting.set(false);
        this.cancelDelete();
      },
    });
  }

  statusClass(status: ProjectStatus): string {
    // Maps backend status to badge color classes in the template.
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'COMPLETED':
        return 'status-completed';
      case 'PAUSED':
        return 'status-paused';
      case 'CANCELLED':
      default:
        return 'status-cancelled';
    }
  }
  private toDateInput(value: string | null): string {
    if (!value) return '';
    return value.slice(0, 10);
  }

  loadProjects() {
    this.projectsService.getProjects().subscribe((response) => {
      if (response.success) {
        this.projects = response.data;
        this.projectsFetched.set(false);
      }
    });
  }
}
