import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputFieldComponent } from '../../components/shared/input-field/input-field';
import { InvoiceListItem, CreateInvoiceRequest } from '../../models/invoice.models';
import { ProjectListItem } from '../../models/project.models';
import { InvoicesService } from '../../services/invoices.service';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent],
  templateUrl: './invoices.html',
  styleUrl: './invoices.css',
})
export class InvoicesComponent implements OnInit {
  constructor(
    private invoicesService: InvoicesService,
    private projectsService: ProjectsService,
    private router: Router,
  ) {}

  loading = signal(false);
  submitting = signal(false);
  deleteSubmitting = signal(false);
  formModalOpen = signal(false);
  deleteConfirmOpen = signal(false);
  errorMessage = '';

  invoices: InvoiceListItem[] = [];
  projects: ProjectListItem[] = [];
  totalUnpaid = 0;
  deleteCandidate: InvoiceListItem | null = null;

  invoiceForm = new FormGroup({
    projectId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dueDate: new FormControl('', { nonNullable: true }),
    tax: new FormControl('0', { nonNullable: true }),
    lineItems: new FormArray<FormGroup>([]),
  });

  ngOnInit(): void {
    this.loadInvoicesPage();
  }

  get lineItems(): FormArray<FormGroup> {
    return this.invoiceForm.controls.lineItems;
  }

  createLineItemGroup(): FormGroup {
    return new FormGroup({
      description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      unitPrice: new FormControl('0', { nonNullable: true, validators: [Validators.required] }),
    });
  }

  loadInvoicesPage(): void {
    this.loading.set(true);
    this.errorMessage = '';

    this.projectsService.getProjects().subscribe({
      next: (projectResponse) => {
        if (!projectResponse.success) {
          this.loading.set(false);
          return;
        }

        this.projects = projectResponse.data;
        this.invoicesService.getInvoices().subscribe({
          next: (data) => {
            this.invoices = data.invoices;
            this.totalUnpaid = data.totalUnpaid;
            this.loading.set(false);
          },
          error: (err) => {
            this.errorMessage = err?.error?.message || 'Failed to load invoices.';
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
    this.lineItems.clear();
    this.lineItems.push(this.createLineItemGroup());
    this.invoiceForm.reset({
      projectId: this.projects[0]?.id ?? '',
      dueDate: '',
      tax: '0',
    });
    this.formModalOpen.set(true);
  }

  closeAddModal(): void {
    this.formModalOpen.set(false);
    this.submitting.set(false);
  }

  addLineItem(): void {
    this.lineItems.push(this.createLineItemGroup());
  }

  removeLineItem(index: number): void {
    if (this.lineItems.length <= 1) return;
    this.lineItems.removeAt(index);
  }

  submitCreateInvoice(): void {
    if (this.invoiceForm.invalid || this.lineItems.length === 0) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage = '';

    const raw = this.invoiceForm.getRawValue();
    const taxNum = Number(raw.tax || 0);
    const dueDateIso = raw.dueDate ? `${raw.dueDate}T00:00:00.000Z` : undefined;
    const lineItemsPayload = this.lineItems.controls.map((line) => {
      const row = line.getRawValue() as {
        description: string;
        unitPrice: string;
      };
      return {
        description: row.description.trim(),
        qty: 1,
        unitPrice: Number(row.unitPrice),
      };
    });

    const payload: CreateInvoiceRequest = {
      projectId: raw.projectId,
      ...(dueDateIso ? { dueDate: dueDateIso } : {}),
      ...(Number.isFinite(taxNum) ? { tax: taxNum } : {}),
      lineItems: lineItemsPayload,
    };

    this.invoicesService.createInvoice(payload).subscribe({
      next: (created) => {
        const project = this.projects.find((p) => p.id === created.projectId);
        const createdListItem: InvoiceListItem = {
          id: created.id,
          invoiceNumber: created.invoiceNumber,
          amount: created.total,
          status: created.status,
          dueDate: created.dueDate,
          project: {
            id: project?.id ?? created.projectId,
            title: project?.title ?? 'Unknown Project',
          },
          client: {
            id: project?.client.id ?? '',
            name: project?.client.name ?? 'Unknown Client',
          },
        };

        this.invoices = [createdListItem, ...this.invoices];
        this.recalculateStats();
        this.submitting.set(false);
        this.closeAddModal();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to create invoice.';
        this.submitting.set(false);
      },
    });
  }

  requestDelete(invoice: InvoiceListItem): void {
    this.deleteCandidate = invoice;
    this.deleteConfirmOpen.set(true);
  }

  cancelDelete(): void {
    if (this.deleteSubmitting()) return;
    this.deleteConfirmOpen.set(false);
    this.deleteCandidate = null;
  }

  confirmDelete(): void {
    if (!this.deleteCandidate) return;

    const invoice = this.deleteCandidate;
    this.deleteSubmitting.set(true);
    this.errorMessage = '';

    this.invoicesService.deleteInvoice(invoice.id).subscribe({
      next: () => {
        this.invoices = this.invoices.filter((i) => i.id !== invoice.id);
        this.deleteSubmitting.set(false);
        this.cancelDelete();
        this.recalculateStats();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to delete invoice.';
        this.deleteSubmitting.set(false);
        this.cancelDelete();
      },
    });
  }

  onView(invoice: InvoiceListItem): void {
    this.router.navigate(['/app/invoices', invoice.id]);
  }

  onEdit(invoice: InvoiceListItem): void {
    this.router.navigate(['/app/invoices', invoice.id], { queryParams: { mode: 'edit' } });
  }

  statusClass(status: InvoiceListItem['status']): string {
    if (status === 'PAID') return 'status-paid';
    if (status === 'SENT') return 'status-sent';
    if (status === 'OVERDUE') return 'status-overdue';
    return 'status-draft';
  }

  canDelete(invoice: InvoiceListItem): boolean {
    return invoice.status === 'DRAFT';
  }

  overdueCount(): number {
    const now = Date.now();
    return this.invoices.filter(
      (invoice) =>
        invoice.status === 'OVERDUE' ||
        (invoice.status !== 'PAID' && !!invoice.dueDate && new Date(invoice.dueDate).getTime() < now),
    ).length;
  }

  paidTotal(): number {
    return this.invoices
      .filter((invoice) => invoice.status === 'PAID')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
  }

  pendingCount(): number {
    return this.invoices.filter((invoice) => invoice.status !== 'PAID').length;
  }

  private recalculateStats(): void {
    this.totalUnpaid = this.invoices
      .filter((invoice) => invoice.status !== 'PAID')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
  }
}
