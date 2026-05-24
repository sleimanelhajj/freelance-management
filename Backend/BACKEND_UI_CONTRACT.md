# Freelance Management Backend - UI Data Contract

Last updated: 2026-05-24

This file is for UI/UX design handoff. It documents how data is linked and the exact API response shapes currently returned by the backend.

## Base Info

- Base API URL: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api-docs`
- Health check: `GET /health`

## Auth and Headers

Most endpoints require JWT auth.

- Header format:
  - `Authorization: Bearer <token>`

Token is returned by:
- `POST /api/auth/register`
- `POST /api/auth/login`

## Data Relationship Map

- `User` has many `Client`
- `User` has many `Project`
- `Client` has many `Project`
- `Project` has many `Task`
- `Project` has many `Invoice`
- `Invoice` has many `LineItem`
- Payment is inline on `Invoice` (no separate payment table):
  - `amountPaid`
  - `paymentMethod`
  - `paidAt`

## Enums Used in UI

- `ClientStatus`: `ACTIVE | INACTIVE`
- `ProjectStatus`: `ACTIVE | COMPLETED | PAUSED | CANCELLED`
- `TaskStatus`: `TODO | IN_PROGRESS | DONE`
- `Priority`: `LOW | MEDIUM | HIGH`
- `InvoiceStatus`: `DRAFT | SENT | PAID | OVERDUE`
- `PaymentMethod`: `BANK_TRANSFER | CASH | PAYPAL | CARD | OTHER`

## Date/Number Types

- Dates are returned as ISO strings in JSON.
- Currency-like fields are numeric (`budget`, `subtotal`, `tax`, `total`, `amountPaid`, `totalUnpaid`, `earnedThisMonth`).

## Global Success/Error Shape

Most successful endpoints return:

```json
{
  "success": true,
  "data": {}
}
```

Error shape:

```json
{
  "success": false,
  "message": "Error message"
}
```

Some endpoints also include a `message` in success responses (mainly auth).

---

## 1) Auth

### `POST /api/auth/register`

Request:

```json
{
  "name": "Sleiman",
  "email": "sleiman@test.com",
  "password": "123456"
}
```

Response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Sleiman",
      "email": "sleiman@test.com",
      "createdAt": "2026-05-24T10:00:00.000Z"
    },
    "token": "jwt_token"
  }
}
```

### `POST /api/auth/login`

Request:

```json
{
  "email": "sleiman@test.com",
  "password": "123456"
}
```

Response:

```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Sleiman",
      "email": "sleiman@test.com",
      "createdAt": "2026-05-24T10:00:00.000Z"
    },
    "token": "jwt_token"
  }
}
```

### `GET /api/auth/me`

Response:

```json
{
  "success": true,
  "message": "User data retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Sleiman",
    "email": "sleiman@test.com",
    "createdAt": "2026-05-24T10:00:00.000Z"
  }
}
```

---

## 2) Clients

### `GET /api/clients`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "ACME",
      "email": "client@acme.com",
      "phone": "+961...",
      "company": "ACME",
      "status": "ACTIVE"
    }
  ]
}
```

### `GET /api/clients/:id`

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "ACME",
    "email": "client@acme.com",
    "phone": "+961...",
    "company": "ACME",
    "notes": "VIP",
    "status": "ACTIVE",
    "projects": [
      {
        "id": "uuid",
        "title": "Website Redesign",
        "status": "ACTIVE",
        "deadline": "2026-06-15T00:00:00.000Z"
      }
    ]
  }
}
```

### `POST /api/clients`

Request fields:
- `name` (required)
- `email` (required)
- `phone`, `company`, `notes`, `status` (optional)

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "ACME",
    "email": "client@acme.com",
    "phone": null,
    "company": "ACME",
    "notes": null,
    "status": "ACTIVE"
  }
}
```

### `PATCH /api/clients/:id`

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    "email": "updated@email.com",
    "phone": null,
    "company": null,
    "notes": null,
    "status": "ACTIVE"
  }
}
```

### `DELETE /api/clients/:id`

Response status: `204 No Content`  
Body: empty

---

## 3) Projects

### `GET /api/projects`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Website Redesign",
      "status": "ACTIVE",
      "deadline": "2026-06-15T00:00:00.000Z",
      "budget": 1200,
      "client": {
        "id": "uuid",
        "name": "ACME"
      }
    }
  ]
}
```

### `GET /api/projects/:id`

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Website Redesign",
    "description": "Landing + dashboard",
    "status": "ACTIVE",
    "deadline": "2026-06-15T00:00:00.000Z",
    "budget": 1200,
    "client": {
      "id": "uuid",
      "name": "ACME"
    },
    "tasks": [
      {
        "id": "uuid",
        "title": "Design hero section",
        "status": "IN_PROGRESS",
        "dueDate": "2026-06-01T00:00:00.000Z"
      }
    ],
    "invoices": [
      {
        "id": "uuid",
        "invoiceNumber": "INV-1710000000000",
        "total": 500,
        "status": "SENT"
      }
    ]
  }
}
```

### `POST /api/projects`

Request fields:
- `clientId`, `title` (required)
- `description`, `deadline`, `budget`, `status` (optional)

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Website Redesign",
    "description": null,
    "status": "ACTIVE",
    "deadline": null,
    "budget": null,
    "clientId": "uuid"
  }
}
```

### `PATCH /api/projects/:id`

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated Project",
    "description": "Updated",
    "status": "PAUSED",
    "deadline": "2026-06-20T00:00:00.000Z",
    "budget": 1500,
    "clientId": "uuid"
  }
}
```

### `DELETE /api/projects/:id`

Response status: `204 No Content`  
Body: empty

---

## 4) Tasks

### `GET /api/tasks/:id/all`

Important:
- `:id` here is **projectId** (not taskId)

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Design hero section",
      "description": "v1 draft",
      "status": "TODO",
      "priority": "MEDIUM",
      "dueDate": "2026-06-01T00:00:00.000Z",
      "projectId": "uuid"
    }
  ]
}
```

### `POST /api/tasks`

Request fields:
- `projectId`, `title` (required)
- `description`, `priority`, `dueDate` (optional)

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Design hero section",
    "description": null,
    "status": "TODO",
    "priority": "MEDIUM",
    "dueDate": null,
    "projectId": "uuid"
  }
}
```

### `PATCH /api/tasks/:id`

Important:
- `:id` here is **taskId**

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Design hero section",
    "description": "updated",
    "status": "DONE",
    "priority": "HIGH",
    "dueDate": "2026-06-03T00:00:00.000Z",
    "projectId": "uuid"
  }
}
```

### `DELETE /api/tasks/:id`

Response status: `204 No Content`  
Body: empty

---

## 5) Invoices

No separate payment resource. Payment is embedded in invoice fields:
- `amountPaid`
- `paymentMethod`
- `paidAt`

### `GET /api/invoices`

Supports optional query params:
- `status`
- `projectId`

Response:

```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "uuid",
        "invoiceNumber": "INV-1710000000000",
        "amount": 500,
        "status": "SENT",
        "dueDate": "2026-06-10T00:00:00.000Z",
        "project": {
          "id": "uuid",
          "title": "Website Redesign"
        },
        "client": {
          "id": "uuid",
          "name": "ACME"
        }
      }
    ],
    "totalUnpaid": 350
  }
}
```

### `GET /api/invoices/:id`

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "invoiceNumber": "INV-1710000000000",
    "status": "SENT",
    "dueDate": "2026-06-10T00:00:00.000Z",
    "lineItems": [
      {
        "description": "UI Design",
        "qty": 2,
        "unitPrice": 100,
        "total": 200
      }
    ],
    "subtotal": 200,
    "tax": 20,
    "total": 220,
    "amountPaid": 100,
    "paidAt": "2026-06-01T00:00:00.000Z",
    "paymentMethod": "BANK_TRANSFER",
    "project": {
      "id": "uuid",
      "title": "Website Redesign"
    },
    "client": {
      "id": "uuid",
      "name": "ACME",
      "email": "client@acme.com"
    }
  }
}
```

### `POST /api/invoices`

Request:

```json
{
  "projectId": "uuid",
  "dueDate": "2026-06-10T00:00:00.000Z",
  "tax": 20,
  "amountPaid": 100,
  "paymentMethod": "BANK_TRANSFER",
  "paidAt": "2026-06-01T00:00:00.000Z",
  "lineItems": [
    { "description": "UI Design", "qty": 2, "unitPrice": 100 }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "invoiceNumber": "INV-1710000000000",
    "status": "DRAFT",
    "dueDate": "2026-06-10T00:00:00.000Z",
    "total": 220,
    "projectId": "uuid",
    "lineItems": [
      {
        "description": "UI Design",
        "qty": 2,
        "unitPrice": 100,
        "total": 200
      }
    ]
  }
}
```

### `PATCH /api/invoices/:id`

Accepted fields (all optional):
- `dueDate`
- `tax`
- `lineItems` (replaces existing set)
- `amountPaid`
- `paymentMethod`
- `paidAt`
- `status`

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "invoiceNumber": "INV-1710000000000",
    "status": "PAID",
    "dueDate": "2026-06-10T00:00:00.000Z",
    "subtotal": 200,
    "tax": 20,
    "total": 220,
    "amountPaid": 220,
    "paymentMethod": "CASH",
    "paidAt": "2026-06-02T00:00:00.000Z"
  }
}
```

### `DELETE /api/invoices/:id`

Rule:
- Only `DRAFT` invoices can be deleted.

Response:

```json
{
  "success": true,
  "data": {
    "message": "Invoice deleted"
  }
}
```

---

## 6) Dashboard

### `GET /api/dashboard`

Response:

```json
{
  "success": true,
  "data": {
    "stats": {
      "activeProjects": 4,
      "totalClients": 9,
      "unpaidInvoices": 3,
      "totalUnpaid": 3500,
      "overdueInvoices": 1,
      "earnedThisMonth": 1200
    },
    "upcomingDeadlines": [
      {
        "projectId": "uuid",
        "title": "Website Redesign",
        "deadline": "2026-06-15T00:00:00.000Z",
        "clientName": "ACME"
      }
    ],
    "recentActivity": [
      {
        "type": "PROJECT_CREATED",
        "description": "Project created: Website Redesign",
        "createdAt": "2026-05-24T12:30:00.000Z"
      },
      {
        "type": "TASK_CREATED",
        "description": "Task created: Design hero section",
        "createdAt": "2026-05-24T11:30:00.000Z"
      },
      {
        "type": "INVOICE_CREATED",
        "description": "Invoice created: INV-1710000000000",
        "createdAt": "2026-05-24T10:30:00.000Z"
      }
    ]
  }
}
```

---

## UI Notes for Designer

- `Client Details` can show nested `projects`.
- `Project Details` can show nested `tasks` + `invoices`.
- `Invoice Details` can show:
  - billing lines (`lineItems`)
  - computed totals (`subtotal`, `tax`, `total`)
  - payment state (`amountPaid`, `paymentMethod`, `paidAt`)
- Dashboard cards can be built directly from `data.stats`.
- Overdue and unpaid states come from invoice status + due date logic.

## Known API Behavior to Account For

- Delete endpoints for clients/projects/tasks return `204` with no response body.
- `GET /api/tasks/:id/all` uses `:id` as `projectId`.
- Error responses always include:
  - `success: false`
  - `message: string`
