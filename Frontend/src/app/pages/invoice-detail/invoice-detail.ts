import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputFieldComponent } from '../../components/shared/input-field/input-field';
import { InvoiceDetails, InvoiceStatus, PaymentMethod, UpdateInvoiceRequest } from '../../models/invoice.models';
import { InvoicesService } from '../../services/invoices.service';
import { LayoutHeaderService } from '../../services/layout-header.service';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent],
  templateUrl: './invoice-detail.html',
  styleUrl: './invoice-detail.css',
})
export class InvoiceDetailComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoicesService: InvoicesService,
    private layoutHeaderService: LayoutHeaderService,
  ) {}

  invoiceId = '';
  loading = signal(true);
  submitting = signal(false);
  markPaidSubmitting = signal(false);
  formModalOpen = signal(false);
  errorMessage = signal('');
  invoice = signal<InvoiceDetails | null>(null);
  autoOpenEdit = false;

  invoiceForm = new FormGroup({
    dueDate: new FormControl('', { nonNullable: true }),
    tax: new FormControl('0', { nonNullable: true }),
    status: new FormControl<InvoiceStatus>('DRAFT', { nonNullable: true }),
    amountPaid: new FormControl('0', { nonNullable: true }),
    paymentMethod: new FormControl<PaymentMethod | ''>('', { nonNullable: true }),
    paidAt: new FormControl('', { nonNullable: true }),
    lineItems: new FormArray<FormGroup>([]),
  });

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id') || '';
    this.autoOpenEdit = this.route.snapshot.queryParamMap.get('mode') === 'edit';
    if (!this.invoiceId) {
      this.router.navigate(['/app/invoices']);
      return;
    }
    this.loadInvoice();
  }

  ngOnDestroy(): void {
    this.layoutHeaderService.clearOverrides();
  }

  get lineItems(): FormArray<FormGroup> {
    return this.invoiceForm.controls.lineItems;
  }

  createLineItemGroup(item?: { description: string; unitPrice: number }): FormGroup {
    return new FormGroup({
      description: new FormControl(item?.description ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      unitPrice: new FormControl(String(item?.unitPrice ?? 0), {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  loadInvoice(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.invoicesService.getInvoiceById(this.invoiceId).subscribe({
      next: (invoice) => {
        this.invoice.set(invoice);
        this.layoutHeaderService.setOverrides('Invoice Detail', `Invoices / ${invoice.invoiceNumber}`);
        this.loading.set(false);

        if (this.autoOpenEdit) {
          this.autoOpenEdit = false;
          this.openEditModal();
          this.router.navigate([], { relativeTo: this.route, queryParams: { mode: null }, queryParamsHandling: 'merge' });
        }
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load invoice details.');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/app/invoices']);
  }

  openEditModal(): void {
    const inv = this.invoice();
    if (!inv) return;

    this.lineItems.clear();
    inv.lineItems.forEach((item) => {
      this.lineItems.push(this.createLineItemGroup(item));
    });

    this.invoiceForm.reset({
      dueDate: this.toDateInput(inv.dueDate),
      tax: String(inv.tax),
      status: inv.status,
      amountPaid: String(inv.amountPaid),
      paymentMethod: inv.paymentMethod ?? '',
      paidAt: this.toDateInput(inv.paidAt),
    });
    this.formModalOpen.set(true);
  }

  closeEditModal(): void {
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

  submitEdit(): void {
    if (this.invoiceForm.invalid || this.lineItems.length === 0) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const raw = this.invoiceForm.getRawValue();
    const dueDateIso = raw.dueDate ? `${raw.dueDate}T00:00:00.000Z` : null;
    const paidAtIso = raw.paidAt ? `${raw.paidAt}T00:00:00.000Z` : null;
    const tax = Number(raw.tax);
    const amountPaid = Number(raw.amountPaid);

    const payload: UpdateInvoiceRequest = {
      dueDate: dueDateIso,
      status: raw.status,
      ...(Number.isFinite(tax) ? { tax } : {}),
      ...(Number.isFinite(amountPaid) ? { amountPaid } : {}),
      ...(raw.paymentMethod ? { paymentMethod: raw.paymentMethod as PaymentMethod } : {}),
      paidAt: paidAtIso,
      lineItems: this.lineItems.controls.map((line) => {
        const row = line.getRawValue() as { description: string; unitPrice: string };
        return {
          description: row.description.trim(),
          qty: 1,
          unitPrice: Number(row.unitPrice),
        };
      }),
    };

    this.invoicesService.updateInvoice(this.invoiceId, payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeEditModal();
        this.loadInvoice();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to update invoice.');
        this.submitting.set(false);
      },
    });
  }

  markAsPaid(): void {
    const inv = this.invoice();
    if (!inv || inv.status === 'PAID') return;

    this.markPaidSubmitting.set(true);
    const payload: UpdateInvoiceRequest = {
      status: 'PAID',
      amountPaid: inv.total,
      paidAt: new Date().toISOString(),
      paymentMethod: inv.paymentMethod ?? 'OTHER',
    };

    this.invoicesService.updateInvoice(this.invoiceId, payload).subscribe({
      next: () => {
        this.markPaidSubmitting.set(false);
        this.loadInvoice();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to mark invoice as paid.');
        this.markPaidSubmitting.set(false);
      },
    });
  }

  statusClass(status: InvoiceStatus): string {
    if (status === 'PAID') return 'status-paid';
    if (status === 'SENT') return 'status-sent';
    if (status === 'OVERDUE') return 'status-overdue';
    return 'status-draft';
  }

  private toDateInput(value: string | null): string {
    if (!value) return '';
    return value.slice(0, 10);
  }
}
