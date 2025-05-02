# DPP Accounting Platform API Documentation

This document provides documentation for the API endpoints available in the DPP Accounting Platform.

## Overview

The DPP Accounting Platform exposes a set of API endpoints to interact with the system programmatically. These endpoints are primarily used by the frontend application but can also be accessed by third-party integrations with proper authentication.

## Authentication

All API endpoints (except public endpoints) require authentication using JSON Web Tokens (JWT).

### Authentication Flow

1. Obtain a JWT token by authenticating with the `/api/auth/signin` endpoint
2. Include the token in the `Authorization` header of subsequent requests:
   ```
   Authorization: Bearer <token>
   ```
3. Token refresh is handled automatically by the client library

## Base URL

For development: `http://localhost:3000/api`
For production: `https://[your-domain.com]/api`

## Response Format

All API responses follow a standard format:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Or in case of an error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

## Rate Limiting

API requests are limited to 100 requests per minute per IP address. Exceeding this limit will result in a 429 Too Many Requests response.

## API Endpoints

### Authentication

#### Sign In

```
POST /api/auth/signin
```

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin"
    }
  },
  "error": null
}
```

#### Sign Up

```
POST /api/auth/signup
```

Creates a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "name": "New User"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user456",
      "email": "newuser@example.com",
      "name": "New User",
      "role": "user"
    }
  },
  "error": null
}
```

#### Refresh Token

```
POST /api/auth/refresh
```

Refreshes an expired JWT token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "error": null
}
```

### Chart of Accounts

#### Get All Accounts

```
GET /api/finance/accounts
```

Retrieves all accounts in the chart of accounts.

**Query Parameters:**
- `status` (optional): Filter by account status (`active`, `inactive`)
- `type` (optional): Filter by account type (`asset`, `liability`, `equity`, `revenue`, `expense`)
- `parent` (optional): Filter by parent account ID

**Response:**
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": "acc123",
        "code": "1000",
        "name": "Cash",
        "type": "asset",
        "subtype": "current_asset",
        "balance": 10000.00,
        "parent_id": null,
        "status": "active",
        "description": "Cash on hand",
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
      },
      // ...
    ]
  },
  "error": null
}
```

#### Get Account by ID

```
GET /api/finance/accounts/:id
```

Retrieves a specific account by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "account": {
      "id": "acc123",
      "code": "1000",
      "name": "Cash",
      "type": "asset",
      "subtype": "current_asset",
      "balance": 10000.00,
      "parent_id": null,
      "status": "active",
      "description": "Cash on hand",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  },
  "error": null
}
```

#### Create Account

```
POST /api/finance/accounts
```

Creates a new account in the chart of accounts.

**Request Body:**
```json
{
  "code": "1010",
  "name": "Checking Account",
  "type": "asset",
  "subtype": "current_asset",
  "parent_id": null,
  "description": "Main checking account"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "account": {
      "id": "acc124",
      "code": "1010",
      "name": "Checking Account",
      "type": "asset",
      "subtype": "current_asset",
      "balance": 0.00,
      "parent_id": null,
      "status": "active",
      "description": "Main checking account",
      "created_at": "2025-04-29T12:00:00Z",
      "updated_at": "2025-04-29T12:00:00Z"
    }
  },
  "error": null
}
```

#### Update Account

```
PUT /api/finance/accounts/:id
```

Updates an existing account.

**Request Body:**
```json
{
  "name": "Main Checking Account",
  "description": "Updated description",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "account": {
      "id": "acc124",
      "code": "1010",
      "name": "Main Checking Account",
      "type": "asset",
      "subtype": "current_asset",
      "balance": 0.00,
      "parent_id": null,
      "status": "active",
      "description": "Updated description",
      "created_at": "2025-04-29T12:00:00Z",
      "updated_at": "2025-04-29T13:00:00Z"
    }
  },
  "error": null
}
```

### General Ledger

#### Get Journal Entries

```
GET /api/finance/journal-entries
```

Retrieves journal entries.

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `posted`, `approved`, `voided`)
- `start_date` (optional): Filter by start date (ISO format)
- `end_date` (optional): Filter by end date (ISO format)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "journal_entries": [
      {
        "id": "je123",
        "entry_no": "JE-2025-0001",
        "date": "2025-04-01T00:00:00Z",
        "description": "Monthly rent payment",
        "status": "posted",
        "amount": 2500.00,
        "created_by": "user123",
        "approved_by": "user456",
        "created_at": "2025-04-01T09:00:00Z",
        "updated_at": "2025-04-01T10:00:00Z",
        "lines": [
          {
            "id": "jel123",
            "account_id": "acc125",
            "account_code": "6000",
            "account_name": "Rent Expense",
            "description": "Office rent",
            "debit": 2500.00,
            "credit": 0.00
          },
          {
            "id": "jel124",
            "account_id": "acc123",
            "account_code": "1000",
            "account_name": "Cash",
            "description": "Office rent",
            "debit": 0.00,
            "credit": 2500.00
          }
        ]
      },
      // ...
    ],
    "pagination": {
      "total": 120,
      "page": 1,
      "limit": 20,
      "pages": 6
    }
  },
  "error": null
}
```

#### Create Journal Entry

```
POST /api/finance/journal-entries
```

Creates a new journal entry.

**Request Body:**
```json
{
  "date": "2025-04-30T00:00:00Z",
  "description": "Utility payment",
  "lines": [
    {
      "account_id": "acc126",
      "description": "Electric bill",
      "debit": 150.00,
      "credit": 0.00
    },
    {
      "account_id": "acc123",
      "description": "Electric bill",
      "debit": 0.00,
      "credit": 150.00
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "journal_entry": {
      "id": "je124",
      "entry_no": "JE-2025-0002",
      "date": "2025-04-30T00:00:00Z",
      "description": "Utility payment",
      "status": "draft",
      "amount": 150.00,
      "created_by": "user123",
      "approved_by": null,
      "created_at": "2025-04-29T14:00:00Z",
      "updated_at": "2025-04-29T14:00:00Z",
      "lines": [
        {
          "id": "jel125",
          "account_id": "acc126",
          "account_code": "6010",
          "account_name": "Utilities Expense",
          "description": "Electric bill",
          "debit": 150.00,
          "credit": 0.00
        },
        {
          "id": "jel126",
          "account_id": "acc123",
          "account_code": "1000",
          "account_name": "Cash",
          "description": "Electric bill",
          "debit": 0.00,
          "credit": 150.00
        }
      ]
    }
  },
  "error": null
}
```

### Accounts Payable

#### Get Vendors

```
GET /api/finance/vendors
```

Retrieves vendors for accounts payable.

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `inactive`)
- `type` (optional): Filter by vendor type
- `search` (optional): Search term for vendor name or ID
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "id": "vnd123",
        "name": "ABC Office Supplies",
        "vendor_type": "supplier",
        "email": "accounts@abcsupplies.com",
        "phone": "555-123-4567",
        "tax_id": "12-3456789",
        "status": "active",
        "address": {
          "street": "123 Main St",
          "city": "Denver",
          "state": "CO",
          "zip": "80202",
          "country": "USA"
        },
        "payment_terms": "net_30",
        "created_at": "2025-01-15T00:00:00Z",
        "updated_at": "2025-01-15T00:00:00Z"
      },
      // ...
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  },
  "error": null
}
```

#### Get Bills

```
GET /api/finance/bills
```

Retrieves bills for accounts payable.

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `pending`, `approved`, `paid`, `voided`)
- `vendor_id` (optional): Filter by vendor ID
- `due_start` (optional): Filter by due date start (ISO format)
- `due_end` (optional): Filter by due date end (ISO format)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "bills": [
      {
        "id": "bill123",
        "bill_number": "BILL-2025-0001",
        "vendor_id": "vnd123",
        "vendor_name": "ABC Office Supplies",
        "invoice_number": "INV12345",
        "date": "2025-04-15T00:00:00Z",
        "due_date": "2025-05-15T00:00:00Z",
        "amount": 750.25,
        "status": "pending",
        "description": "Office supplies for Q2",
        "created_by": "user123",
        "created_at": "2025-04-15T10:00:00Z",
        "updated_at": "2025-04-15T10:00:00Z"
      },
      // ...
    ],
    "pagination": {
      "total": 87,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  },
  "error": null
}
```

### Accounts Receivable

#### Get Customers

```
GET /api/finance/customers
```

Retrieves customers for accounts receivable.

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `inactive`)
- `type` (optional): Filter by customer type
- `search` (optional): Search term for customer name or ID
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "cust123",
        "name": "XYZ Foundation",
        "customer_type": "funder",
        "email": "grants@xyzfoundation.org",
        "phone": "555-987-6543",
        "tax_id": "98-7654321",
        "status": "active",
        "address": {
          "street": "456 Grant Ave",
          "city": "Denver",
          "state": "CO",
          "zip": "80203",
          "country": "USA"
        },
        "payment_terms": "net_45",
        "created_at": "2025-01-20T00:00:00Z",
        "updated_at": "2025-01-20T00:00:00Z"
      },
      // ...
    ],
    "pagination": {
      "total": 28,
      "page": 1,
      "limit": 20,
      "pages": 2
    }
  },
  "error": null
}
```

#### Get Invoices

```
GET /api/finance/invoices
```

Retrieves invoices for accounts receivable.

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `sent`, `partial`, `paid`, `overdue`, `voided`)
- `customer_id` (optional): Filter by customer ID
- `due_start` (optional): Filter by due date start (ISO format)
- `due_end` (optional): Filter by due date end (ISO format)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "inv123",
        "invoice_number": "INV-2025-0001",
        "customer_id": "cust123",
        "customer_name": "XYZ Foundation",
        "date": "2025-04-10T00:00:00Z",
        "due_date": "2025-05-25T00:00:00Z",
        "amount": 15000.00,
        "balance": 15000.00,
        "status": "sent",
        "description": "Q2 Grant Funding",
        "created_by": "user123",
        "created_at": "2025-04-10T11:00:00Z",
        "updated_at": "2025-04-10T11:30:00Z"
      },
      // ...
    ],
    "pagination": {
      "total": 52,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  },
  "error": null
}
```

### Financial Reports

#### Balance Sheet

```
GET /api/finance/reports/balance-sheet
```

Generates a balance sheet report.

**Query Parameters:**
- `date` (required): Report date (ISO format)
- `comparison_date` (optional): Comparison date for comparative report (ISO format)
- `fund_id` (optional): Filter by specific fund
- `format` (optional): Response format (`json`, `pdf`, `csv`, default: `json`)

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "title": "Balance Sheet",
      "as_of_date": "2025-04-30T00:00:00Z",
      "comparison_date": "2024-12-31T00:00:00Z",
      "generated_at": "2025-04-29T15:00:00Z",
      "assets": {
        "current_assets": [
          {
            "account_code": "1000",
            "account_name": "Cash",
            "balance": 45678.90,
            "comparison_balance": 38765.43,
            "change": 6913.47,
            "change_percentage": 17.83
          },
          // ...
        ],
        "fixed_assets": [
          // ...
        ],
        "other_assets": [
          // ...
        ],
        "total_assets": {
          "balance": 892345.67,
          "comparison_balance": 850123.45,
          "change": 42222.22,
          "change_percentage": 4.97
        }
      },
      "liabilities": {
        "current_liabilities": [
          // ...
        ],
        "long_term_liabilities": [
          // ...
        ],
        "total_liabilities": {
          "balance": 452345.67,
          "comparison_balance": 478123.45,
          "change": -25777.78,
          "change_percentage": -5.39
        }
      },
      "equity": {
        "equity_accounts": [
          // ...
        ],
        "total_equity": {
          "balance": 440000.00,
          "comparison_balance": 372000.00,
          "change": 68000.00,
          "change_percentage": 18.28
        }
      }
    }
  },
  "error": null
}
```

#### Income Statement

```
GET /api/finance/reports/income-statement
```

Generates an income statement (profit & loss) report.

**Query Parameters:**
- `start_date` (required): Start date (ISO format)
- `end_date` (required): End date (ISO format)
- `comparison_start` (optional): Comparison period start date (ISO format)
- `comparison_end` (optional): Comparison period end date (ISO format)
- `fund_id` (optional): Filter by specific fund
- `format` (optional): Response format (`json`, `pdf`, `csv`, default: `json`)

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "title": "Income Statement",
      "period": {
        "start_date": "2025-01-01T00:00:00Z",
        "end_date": "2025-04-30T00:00:00Z"
      },
      "comparison_period": {
        "start_date": "2024-01-01T00:00:00Z",
        "end_date": "2024-04-30T00:00:00Z"
      },
      "generated_at": "2025-04-29T15:30:00Z",
      "revenue": {
        "revenue_accounts": [
          {
            "account_code": "4000",
            "account_name": "Grant Revenue",
            "amount": 250000.00,
            "comparison_amount": 225000.00,
            "change": 25000.00,
            "change_percentage": 11.11
          },
          // ...
        ],
        "total_revenue": {
          "amount": 325000.00,
          "comparison_amount": 295000.00,
          "change": 30000.00,
          "change_percentage": 10.17
        }
      },
      "expenses": {
        "expense_accounts": [
          // ...
        ],
        "total_expenses": {
          "amount": 257000.00,
          "comparison_amount": 243000.00,
          "change": 14000.00,
          "change_percentage": 5.76
        }
      },
      "net_income": {
        "amount": 68000.00,
        "comparison_amount": 52000.00,
        "change": 16000.00,
        "change_percentage": 30.77
      }
    }
  },
  "error": null
}
```

### Tuition Credits

#### Get Tuition Credit Batches

```
GET /api/finance/tuition-credits/batches
```

Retrieves tuition credit batches.

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `pending`, `approved`, `processed`)
- `start_date` (optional): Filter by start date (ISO format)
- `end_date` (optional): Filter by end date (ISO format)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "batches": [
      {
        "id": "batch123",
        "batch_number": "TCB-2025-0001",
        "description": "April 2025 Tuition Credits",
        "period": {
          "start_date": "2025-04-01T00:00:00Z",
          "end_date": "2025-04-30T00:00:00Z"
        },
        "status": "approved",
        "total_amount": 125000.00,
        "total_credits": 250,
        "created_by": "user123",
        "approved_by": "user456",
        "created_at": "2025-04-25T09:00:00Z",
        "updated_at": "2025-04-27T14:00:00Z"
      },
      // ...
    ],
    "pagination": {
      "total": 24,
      "page": 1,
      "limit": 20,
      "pages": 2
    }
  },
  "error": null
}
```

#### Get Providers

```
GET /api/finance/providers
```

Retrieves providers for tuition credits.

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `inactive`, `onboarding`)
- `type` (optional): Filter by provider type
- `search` (optional): Search term for provider name or ID
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "id": "prov123",
        "name": "Sunshine Preschool",
        "provider_type": "center",
        "license_number": "LIC12345",
        "email": "director@sunshinepre.org",
        "phone": "555-234-5678",
        "tax_id": "45-6789012",
        "status": "active",
        "address": {
          "street": "789 Sunshine Way",
          "city": "Denver",
          "state": "CO",
          "zip": "80205",
          "country": "USA"
        },
        "quality_rating": 4,
        "created_at": "2025-01-05T00:00:00Z",
        "updated_at": "2025-03-10T00:00:00Z"
      },
      // ...
    ],
    "pagination": {
      "total": 175,
      "page": 1,
      "limit": 20,
      "pages": 9
    }
  },
  "error": null
}
```

## Data Import Endpoints

### Import Bank Transactions

```
POST /api/finance/import/bank-transactions
```

Imports bank transactions for reconciliation.

**Request Body:**
```json
{
  "account_id": "acc124",
  "file_format": "csv",
  "mapping": {
    "date": "Column1",
    "description": "Column2",
    "amount": "Column3",
    "type": "Column4",
    "reference": "Column5"
  },
  "content": "Base64 encoded file content"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "import_id": "imp123",
    "account_id": "acc124",
    "total_rows": 125,
    "processed_rows": 125,
    "imported_transactions": 125,
    "errors": [],
    "status": "completed",
    "created_at": "2025-04-29T16:00:00Z",
    "completed_at": "2025-04-29T16:01:30Z"
  },
  "error": null
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_INVALID_CREDENTIALS` | Invalid username or password |
| `AUTH_TOKEN_EXPIRED` | JWT token has expired |
| `AUTH_UNAUTHORIZED` | User is not authorized to access the resource |
| `VALIDATION_ERROR` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `RESOURCE_ALREADY_EXISTS` | Resource already exists |
| `DATABASE_ERROR` | Database operation failed |
| `INVALID_STATUS_TRANSITION` | Invalid status transition |
| `BUSINESS_RULE_VIOLATION` | Business rule violation |
| `INSUFFICIENT_PERMISSIONS` | User has insufficient permissions |
| `INTERNAL_SERVER_ERROR` | Internal server error |

## Versioning

The current API version is v1. The version is included in the URL path:

```
/api/v1/resource
```

## Rate Limiting Headers

The API returns the following headers with each response:

- `X-RateLimit-Limit`: Number of requests allowed per minute
- `X-RateLimit-Remaining`: Number of requests remaining in the current minute
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

## Changelog

### v1.0.0 (2025-04-29)
- Initial API release

### v1.1.0 (Planned)
- Add webhooks for event notifications
- Enhanced reporting API
- Bulk operations for financial transactions