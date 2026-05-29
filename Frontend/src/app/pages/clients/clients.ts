import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputFieldComponent } from '../../components/shared/input-field/input-field';
import {
  ClientListItem,
  ClientStatus,
  CreateClientRequest,
  UpdateClientRequest,
} from '../../models/client.models';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class ClientsComponent implements OnInit {
  constructor(
    private clientService: ClientService,
    private router: Router,
  ) {}

  clients: ClientListItem[] = [];
  loading = signal(false);
  submitting = signal(false);
  formModalOpen = signal(false);
  editDetailsLoading = signal(false);
  deleteSubmitting = signal(false);
  errorMessage = '';
  deleteConfirmOpen = signal(false);
  deleteCandidate: ClientListItem | null = null;

  formMode: 'create' | 'edit' = 'create';
  editingClientId: string | null = null;

  clientForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl('', { nonNullable: true }),
    company: new FormControl('', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),
    status: new FormControl<ClientStatus>('ACTIVE', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);
    this.errorMessage = '';

    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load clients.';
        this.loading.set(false);
      },
    });
  }

  openAddModal(): void {
    this.formMode = 'create';
    this.editingClientId = null;
    this.editDetailsLoading.set(false);
    this.clientForm.reset({
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
      status: 'ACTIVE',
    });
    this.formModalOpen.set(true);
  }

  openEditModal(client: ClientListItem): void {
    this.formMode = 'edit';
    this.editingClientId = client.id;
    this.submitting.set(false);
    this.editDetailsLoading.set(true);

    // Open immediately so first click always responds.
    this.clientForm.reset({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      notes: '',
      status: client.status || 'ACTIVE',
    });
    this.formModalOpen.set(true);

    this.clientService.getClientById(client.id).subscribe({
      next: (fullClient) => {
        this.clientForm.reset({
          name: fullClient.name || '',
          email: fullClient.email || '',
          phone: fullClient.phone || '',
          company: fullClient.company || '',
          notes: fullClient.notes || '',
          status: fullClient.status || 'ACTIVE',
        });
        this.editDetailsLoading.set(false);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load client details.';
        this.editDetailsLoading.set(false);
      },
    });
  }

  closeFormModal(): void {
    this.formModalOpen.set(false);
    this.submitting.set(false);
    this.editDetailsLoading.set(false);
  }

  submitClientForm(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage = '';

    const raw = this.clientForm.getRawValue();
    const payload: CreateClientRequest = {
      name: raw.name.trim(),
      email: raw.email.trim(),
      status: raw.status,
      ...(raw.phone.trim() ? { phone: raw.phone.trim() } : {}),
      ...(raw.company.trim() ? { company: raw.company.trim() } : {}),
      ...(raw.notes.trim() ? { notes: raw.notes.trim() } : {}),
    };

    if (this.formMode === 'create') {
      this.clientService.createClient(payload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.closeFormModal();
          this.loadClients();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Failed to create client.';
          this.submitting.set(false);
        },
      });
      return;
    }

    const updatePayload: UpdateClientRequest = payload;
    this.clientService.updateClient(this.editingClientId!, updatePayload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeFormModal();
        this.loadClients();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to update client.';
        this.submitting.set(false);
      },
    });
  }

  requestDelete(client: ClientListItem): void {
    this.deleteCandidate = client;
    this.deleteConfirmOpen.set(true);
  }

  cancelDelete(): void {
    if (this.deleteSubmitting()) return;
    this.deleteConfirmOpen.set(false);
    this.deleteCandidate = null;
  }

  confirmDelete(): void {
    if (!this.deleteCandidate) return;

    const client = this.deleteCandidate;
    this.deleteSubmitting.set(true);

    this.clientService.deleteClient(client.id).subscribe({
      next: () => {
        this.deleteSubmitting.set(false);
        this.cancelDelete();
        this.loadClients();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to delete client.';
        this.deleteSubmitting.set(false);
        this.cancelDelete();
      },
    });
  }

  onView(client: ClientListItem): void {
    this.router.navigate(['/app/clients', client.id]);
  }

  statusClass(status: ClientStatus): string {
    return status === 'ACTIVE' ? 'status-active' : 'status-inactive';
  }
}
