import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { InputFieldComponent } from '../../components/shared/input-field/input-field';
import {
  ClientDetails,
  ClientProjectItem,
  ClientStatus,
  UpdateClientRequest,
} from '../../models/client.models';
import { ClientService } from '../../services/client.service';
import { LayoutHeaderService } from '../../services/layout-header.service';
import { RouteTransitionComponent } from '../../route-transition';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent, MatFormFieldModule, MatSelectModule],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.css',
})
export class ClientDetailComponent extends RouteTransitionComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private layoutHeaderService: LayoutHeaderService,
  ) {
    super();
  }

  clientId = '';
  loading = signal(true);
  submitting = signal(false);
  errorMessage = signal('');
  formModalOpen = signal(false);
  deleteConfirmOpen = signal(false);
  deleting = signal(false);

  client = signal<ClientDetails | null>(null);

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
    this.clientId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.clientId) {
      this.router.navigate(['/app/clients']);
      return;
    }
    this.loadClient();
  }

  loadClient(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.clientService.getClientById(this.clientId).subscribe({
      next: (client) => {
        this.client.set(client);
        this.layoutHeaderService.setOverrides('Client Detail', `Clients / ${client.name}`);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load client details.');
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.layoutHeaderService.clearOverrides();
  }

  openEditModal(): void {
    const currentClient = this.client();
    if (!currentClient) return;

    this.clientForm.reset({
      name: currentClient.name || '',
      email: currentClient.email || '',
      phone: currentClient.phone || '',
      company: currentClient.company || '',
      notes: currentClient.notes || '',
      status: currentClient.status || 'ACTIVE',
    });
    this.formModalOpen.set(true);
  }

  closeEditModal(): void {
    this.formModalOpen.set(false);
    this.submitting.set(false);
  }

  submitEdit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const raw = this.clientForm.getRawValue();
    const payload: UpdateClientRequest = {
      name: raw.name.trim(),
      email: raw.email.trim(),
      status: raw.status,
      phone: raw.phone.trim() || undefined,
      company: raw.company.trim() || undefined,
      notes: raw.notes.trim() || undefined,
    };

    this.clientService.updateClient(this.clientId, payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeEditModal();
        this.loadClient();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to update client.');
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
    const currentClient = this.client();
    if (!currentClient) return;

    this.deleting.set(true);
    this.clientService.deleteClient(this.clientId).subscribe({
      next: () => {
        this.deleteConfirmOpen.set(false);
        this.router.navigate(['/app/clients']);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to delete client.');
        this.deleting.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/app/clients']);
  }

  projectStatusClass(status: ClientProjectItem['status']): string {
    if (status === 'ACTIVE') return 'status-active';
    if (status === 'COMPLETED') return 'status-completed';
    if (status === 'PAUSED') return 'status-paused';
    return 'status-inactive';
  }
}
