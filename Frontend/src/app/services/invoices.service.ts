import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment as env } from '../../environments/environment';
import {
  ApiResponse,
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  DeleteInvoiceResponse,
  InvoiceDetails,
  InvoicesListData,
  UpdateInvoiceRequest,
  UpdateInvoiceResponse,
} from '../models/invoice.models';

@Injectable({
  providedIn: 'root',
})
export class InvoicesService {
  private apiUrl = env.apiUrl;

  constructor(private http: HttpClient) {}

  getInvoices(filters?: { status?: string; projectId?: string }): Observable<InvoicesListData> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.projectId) params.set('projectId', filters.projectId);

    const query = params.toString();
    const url = query ? `${this.apiUrl}/invoices?${query}` : `${this.apiUrl}/invoices`;

    return this.http.get<ApiResponse<InvoicesListData>>(url).pipe(map((res) => res.data));
  }

  getInvoiceById(invoiceId: string): Observable<InvoiceDetails> {
    return this.http
      .get<ApiResponse<InvoiceDetails>>(`${this.apiUrl}/invoices/${invoiceId}`)
      .pipe(map((res) => res.data));
  }

  createInvoice(payload: CreateInvoiceRequest): Observable<CreateInvoiceResponse> {
    return this.http
      .post<ApiResponse<CreateInvoiceResponse>>(`${this.apiUrl}/invoices`, payload)
      .pipe(map((res) => res.data));
  }

  updateInvoice(invoiceId: string, payload: UpdateInvoiceRequest): Observable<UpdateInvoiceResponse> {
    return this.http
      .patch<ApiResponse<UpdateInvoiceResponse>>(`${this.apiUrl}/invoices/${invoiceId}`, payload)
      .pipe(map((res) => res.data));
  }

  deleteInvoice(invoiceId: string): Observable<DeleteInvoiceResponse> {
    return this.http
      .delete<ApiResponse<DeleteInvoiceResponse>>(`${this.apiUrl}/invoices/${invoiceId}`)
      .pipe(map((res) => res.data));
  }
}
