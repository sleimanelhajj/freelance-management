export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'PAYPAL' | 'CARD' | 'OTHER';
export type ISODate = string;

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: ISODate | null;
  project: { id: string; title: string };
  client: { id: string; name: string };
}

export interface InvoicesListData {
  invoices: InvoiceListItem[];
  totalUnpaid: number;
}

export interface InvoiceLineItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceDetails {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  dueDate: ISODate | null;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  paidAt: ISODate | null;
  paymentMethod: PaymentMethod | null;
  project: { id: string; title: string };
  client: { id: string; name: string; email: string };
}

export interface CreateInvoiceLineItemInput {
  description: string;
  qty: number;
  unitPrice: number;
}

export interface CreateInvoiceRequest {
  projectId: string;
  dueDate?: ISODate;
  tax?: number;
  amountPaid?: number;
  paymentMethod?: PaymentMethod;
  paidAt?: ISODate;
  lineItems: CreateInvoiceLineItemInput[];
}

export interface CreateInvoiceResponse {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  dueDate: ISODate | null;
  total: number;
  projectId: string;
  lineItems: InvoiceLineItem[];
}

export interface UpdateInvoiceRequest {
  dueDate?: ISODate | null;
  tax?: number;
  lineItems?: CreateInvoiceLineItemInput[];
  amountPaid?: number;
  paymentMethod?: PaymentMethod;
  paidAt?: ISODate | null;
  status?: InvoiceStatus;
}

export interface UpdateInvoiceResponse {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  dueDate: ISODate | null;
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  paymentMethod: PaymentMethod | null;
  paidAt: ISODate | null;
}

export interface DeleteInvoiceResponse {
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
