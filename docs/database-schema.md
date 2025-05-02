# DPP Accounting Platform Database Schema

This document outlines the database schema for the DPP Accounting Platform, detailing the tables, relationships, and key data structures used throughout the application.

## Overview

The DPP Accounting Platform uses a relational database structure to store financial data, user information, and application configuration. The schema is designed for:

- Data integrity through appropriate constraints and relationships
- Scalability to handle growing data volumes
- Performance optimization for common financial operations
- Multi-tenant support with proper data isolation
- Auditability with comprehensive change tracking

## Database Tables

### Core Financial Tables

#### accounts

Stores the chart of accounts structure.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| code | varchar(20) | Account code (e.g., "1000") |
| name | varchar(100) | Account name |
| type | varchar(20) | Account type (asset, liability, equity, revenue, expense) |
| subtype | varchar(50) | Account subtype |
| description | text | Optional description |
| parent_id | uuid | Reference to parent account (hierarchy) |
| is_active | boolean | Whether the account is active |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the account |
| updated_by | uuid | User who last updated the account |

**Indexes:**
- Primary key: id
- Unique: code
- Foreign key: parent_id → accounts.id

#### journal_entries

Stores journal entries for the general ledger.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entry_no | varchar(20) | Entry number (e.g., "JE-2025-0001") |
| date | date | Journal entry date |
| description | text | Description |
| status | varchar(20) | Status (draft, posted, approved, voided) |
| posting_date | date | Date when entry was posted |
| fiscal_year | integer | Fiscal year |
| fiscal_period | integer | Fiscal period within the year |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the entry |
| updated_by | uuid | User who last updated the entry |
| approved_by | uuid | User who approved the entry |
| posted_by | uuid | User who posted the entry |
| voided_by | uuid | User who voided the entry |
| void_reason | text | Reason for voiding, if applicable |

**Indexes:**
- Primary key: id
- Unique: entry_no
- Index: date
- Index: status

#### journal_entry_lines

Stores individual line items for journal entries.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| journal_entry_id | uuid | Reference to journal_entries |
| account_id | uuid | Reference to accounts |
| description | text | Line item description |
| debit | decimal(19,4) | Debit amount |
| credit | decimal(19,4) | Credit amount |
| fund_id | uuid | Reference to funds (optional) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**Indexes:**
- Primary key: id
- Foreign key: journal_entry_id → journal_entries.id
- Foreign key: account_id → accounts.id
- Foreign key: fund_id → funds.id
- Index: (journal_entry_id, account_id)

### Accounts Payable

#### vendors

Stores vendor information for accounts payable.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | varchar(100) | Vendor name |
| vendor_type | varchar(50) | Vendor type (supplier, contractor, etc.) |
| tax_id | varchar(20) | Tax ID / EIN |
| contact_name | varchar(100) | Primary contact name |
| email | varchar(100) | Email address |
| phone | varchar(20) | Phone number |
| address_line1 | varchar(100) | Address line 1 |
| address_line2 | varchar(100) | Address line 2 |
| city | varchar(50) | City |
| state | varchar(50) | State |
| zip | varchar(20) | ZIP/Postal code |
| country | varchar(50) | Country |
| payment_terms | varchar(50) | Payment terms (e.g., net_30) |
| is_active | boolean | Whether vendor is active |
| notes | text | Additional notes |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the vendor |
| updated_by | uuid | User who last updated the vendor |

**Indexes:**
- Primary key: id
- Index: name
- Index: vendor_type
- Index: tax_id

#### bills

Stores vendor bills for accounts payable.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| bill_number | varchar(50) | Bill number (system-generated) |
| vendor_id | uuid | Reference to vendors |
| invoice_number | varchar(50) | Vendor's invoice number |
| date | date | Bill date |
| due_date | date | Payment due date |
| amount | decimal(19,4) | Total amount |
| status | varchar(20) | Status (draft, pending, approved, paid, voided) |
| description | text | Description |
| is_recurring | boolean | Whether this is a recurring bill |
| journal_entry_id | uuid | Reference to journal_entries when posted |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the bill |
| updated_by | uuid | User who last updated the bill |
| approved_by | uuid | User who approved the bill |

**Indexes:**
- Primary key: id
- Foreign key: vendor_id → vendors.id
- Foreign key: journal_entry_id → journal_entries.id
- Unique: bill_number
- Index: status
- Index: due_date

#### bill_items

Stores line items for bills.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| bill_id | uuid | Reference to bills |
| description | text | Item description |
| account_id | uuid | Reference to accounts |
| amount | decimal(19,4) | Line item amount |
| quantity | decimal(10,2) | Quantity |
| unit_price | decimal(19,4) | Unit price |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**Indexes:**
- Primary key: id
- Foreign key: bill_id → bills.id
- Foreign key: account_id → accounts.id

#### bill_payments

Stores payments made against vendor bills.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| payment_number | varchar(50) | Payment number (system-generated) |
| bill_id | uuid | Reference to bills |
| date | date | Payment date |
| amount | decimal(19,4) | Payment amount |
| payment_method | varchar(50) | Payment method (check, ach, card, etc.) |
| reference_number | varchar(50) | Reference number (check number, transaction ID) |
| notes | text | Payment notes |
| journal_entry_id | uuid | Reference to journal_entries when posted |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the payment |

**Indexes:**
- Primary key: id
- Foreign key: bill_id → bills.id
- Foreign key: journal_entry_id → journal_entries.id
- Unique: payment_number
- Index: date

### Accounts Receivable

#### customers

Stores customer information for accounts receivable.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | varchar(100) | Customer name |
| customer_type | varchar(50) | Customer type (funder, parent, etc.) |
| tax_id | varchar(20) | Tax ID / EIN |
| contact_name | varchar(100) | Primary contact name |
| email | varchar(100) | Email address |
| phone | varchar(20) | Phone number |
| address_line1 | varchar(100) | Address line 1 |
| address_line2 | varchar(100) | Address line 2 |
| city | varchar(50) | City |
| state | varchar(50) | State |
| zip | varchar(20) | ZIP/Postal code |
| country | varchar(50) | Country |
| payment_terms | varchar(50) | Payment terms (e.g., net_45) |
| is_active | boolean | Whether customer is active |
| notes | text | Additional notes |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the customer |
| updated_by | uuid | User who last updated the customer |

**Indexes:**
- Primary key: id
- Index: name
- Index: customer_type
- Index: tax_id

#### invoices

Stores customer invoices for accounts receivable.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| invoice_number | varchar(50) | Invoice number (system-generated) |
| customer_id | uuid | Reference to customers |
| date | date | Invoice date |
| due_date | date | Payment due date |
| amount | decimal(19,4) | Total amount |
| balance | decimal(19,4) | Remaining balance |
| status | varchar(20) | Status (draft, sent, partial, paid, overdue, voided) |
| description | text | Description |
| is_recurring | boolean | Whether this is a recurring invoice |
| journal_entry_id | uuid | Reference to journal_entries when posted |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the invoice |
| updated_by | uuid | User who last updated the invoice |

**Indexes:**
- Primary key: id
- Foreign key: customer_id → customers.id
- Foreign key: journal_entry_id → journal_entries.id
- Unique: invoice_number
- Index: status
- Index: due_date

#### invoice_items

Stores line items for invoices.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| invoice_id | uuid | Reference to invoices |
| description | text | Item description |
| account_id | uuid | Reference to accounts |
| amount | decimal(19,4) | Line item amount |
| quantity | decimal(10,2) | Quantity |
| unit_price | decimal(19,4) | Unit price |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**Indexes:**
- Primary key: id
- Foreign key: invoice_id → invoices.id
- Foreign key: account_id → accounts.id

#### invoice_payments

Stores payments received against customer invoices.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| payment_number | varchar(50) | Payment number (system-generated) |
| invoice_id | uuid | Reference to invoices |
| date | date | Payment date |
| amount | decimal(19,4) | Payment amount |
| payment_method | varchar(50) | Payment method (check, ach, card, etc.) |
| reference_number | varchar(50) | Reference number (check number, transaction ID) |
| notes | text | Payment notes |
| journal_entry_id | uuid | Reference to journal_entries when posted |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the payment |

**Indexes:**
- Primary key: id
- Foreign key: invoice_id → invoices.id
- Foreign key: journal_entry_id → journal_entries.id
- Unique: payment_number
- Index: date

### Fund Accounting

#### funds

Stores fund information for fund accounting.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| code | varchar(20) | Fund code |
| name | varchar(100) | Fund name |
| description | text | Fund description |
| type | varchar(50) | Fund type (unrestricted, temporarily_restricted, permanently_restricted) |
| is_active | boolean | Whether fund is active |
| start_date | date | Start date of the fund |
| end_date | date | End date of the fund (if applicable) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the fund |
| updated_by | uuid | User who last updated the fund |

**Indexes:**
- Primary key: id
- Unique: code
- Index: type
- Index: is_active

#### fund_transfers

Stores transfers between funds.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| transfer_number | varchar(50) | Transfer number (system-generated) |
| date | date | Transfer date |
| source_fund_id | uuid | Reference to source fund |
| destination_fund_id | uuid | Reference to destination fund |
| amount | decimal(19,4) | Transfer amount |
| description | text | Description |
| journal_entry_id | uuid | Reference to journal_entries when posted |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the transfer |
| approved_by | uuid | User who approved the transfer |

**Indexes:**
- Primary key: id
- Foreign key: source_fund_id → funds.id
- Foreign key: destination_fund_id → funds.id
- Foreign key: journal_entry_id → journal_entries.id
- Unique: transfer_number
- Index: date

### Budgeting

#### budgets

Stores budget information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | varchar(100) | Budget name |
| description | text | Budget description |
| fiscal_year | integer | Fiscal year |
| start_date | date | Start date |
| end_date | date | End date |
| status | varchar(20) | Status (draft, active, archived) |
| total_amount | decimal(19,4) | Total budget amount |
| notes | text | Additional notes |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the budget |
| updated_by | uuid | User who last updated the budget |
| approved_by | uuid | User who approved the budget |

**Indexes:**
- Primary key: id
- Index: fiscal_year
- Index: status

#### budget_items

Stores individual budget line items.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| budget_id | uuid | Reference to budgets |
| account_id | uuid | Reference to accounts |
| fund_id | uuid | Reference to funds (optional) |
| description | text | Item description |
| amount | decimal(19,4) | Budgeted amount |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the item |
| updated_by | uuid | User who last updated the item |

**Indexes:**
- Primary key: id
- Foreign key: budget_id → budgets.id
- Foreign key: account_id → accounts.id
- Foreign key: fund_id → funds.id
- Index: (budget_id, account_id)

#### budget_revisions

Stores revisions to existing budgets.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| budget_id | uuid | Reference to budgets |
| revision_number | integer | Revision number |
| date | date | Revision date |
| description | text | Revision description |
| previous_total | decimal(19,4) | Previous budget total |
| new_total | decimal(19,4) | New budget total |
| status | varchar(20) | Status (draft, approved, rejected) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the revision |
| approved_by | uuid | User who approved the revision |

**Indexes:**
- Primary key: id
- Foreign key: budget_id → budgets.id
- Unique: (budget_id, revision_number)
- Index: status

### Bank Reconciliation

#### bank_accounts

Stores bank account information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | varchar(100) | Account name |
| account_number | varchar(50) | Bank account number (masked) |
| routing_number | varchar(20) | Bank routing number |
| bank_name | varchar(100) | Bank name |
| account_type | varchar(50) | Account type (checking, savings, etc.) |
| gl_account_id | uuid | Reference to GL account |
| is_active | boolean | Whether account is active |
| opening_balance | decimal(19,4) | Opening balance |
| opening_date | date | Opening date |
| currency | varchar(3) | Currency code (default USD) |
| notes | text | Additional notes |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the account |
| updated_by | uuid | User who last updated the account |

**Indexes:**
- Primary key: id
- Foreign key: gl_account_id → accounts.id
- Index: is_active

#### bank_reconciliations

Stores bank reconciliation information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| bank_account_id | uuid | Reference to bank_accounts |
| statement_date | date | Bank statement date |
| statement_balance | decimal(19,4) | Bank statement balance |
| gl_balance | decimal(19,4) | GL balance as of statement date |
| status | varchar(20) | Status (in_progress, completed, voided) |
| is_balanced | boolean | Whether reconciliation is balanced |
| difference | decimal(19,4) | Unreconciled difference |
| completed_date | date | Date when reconciliation was completed |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the reconciliation |
| completed_by | uuid | User who completed the reconciliation |

**Indexes:**
- Primary key: id
- Foreign key: bank_account_id → bank_accounts.id
- Index: statement_date
- Index: status

#### bank_transactions

Stores imported bank transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| bank_account_id | uuid | Reference to bank_accounts |
| transaction_date | date | Transaction date |
| description | text | Transaction description |
| amount | decimal(19,4) | Transaction amount |
| transaction_type | varchar(50) | Transaction type (deposit, withdrawal) |
| reference | varchar(100) | Reference number |
| source | varchar(50) | Source of import (bank_import, manual) |
| status | varchar(20) | Status (unreconciled, reconciled, matched) |
| reconciliation_id | uuid | Reference to bank_reconciliations |
| journal_entry_id | uuid | Reference to journal_entries if matched |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| imported_by | uuid | User who imported the transaction |

**Indexes:**
- Primary key: id
- Foreign key: bank_account_id → bank_accounts.id
- Foreign key: reconciliation_id → bank_reconciliations.id
- Foreign key: journal_entry_id → journal_entries.id
- Index: transaction_date
- Index: status

### Asset Management

#### assets

Stores fixed asset information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| asset_number | varchar(50) | Asset number (system-generated) |
| name | varchar(100) | Asset name |
| description | text | Asset description |
| category | varchar(50) | Asset category |
| purchase_date | date | Purchase date |
| purchase_cost | decimal(19,4) | Purchase cost |
| acquisition_method | varchar(50) | Acquisition method (purchase, donation, lease) |
| location | varchar(100) | Physical location |
| status | varchar(20) | Status (active, disposed, inactive) |
| asset_account_id | uuid | Reference to asset GL account |
| accumulated_depreciation_account_id | uuid | Reference to accumulated depreciation GL account |
| depreciation_expense_account_id | uuid | Reference to depreciation expense GL account |
| depreciation_method | varchar(50) | Depreciation method |
| useful_life_years | integer | Useful life in years |
| salvage_value | decimal(19,4) | Estimated salvage value |
| last_depreciation_date | date | Last depreciation date |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the asset |
| updated_by | uuid | User who last updated the asset |

**Indexes:**
- Primary key: id
- Unique: asset_number
- Foreign key: asset_account_id → accounts.id
- Foreign key: accumulated_depreciation_account_id → accounts.id
- Foreign key: depreciation_expense_account_id → accounts.id
- Index: category
- Index: status

#### asset_depreciation

Stores asset depreciation entries.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| asset_id | uuid | Reference to assets |
| date | date | Depreciation date |
| amount | decimal(19,4) | Depreciation amount |
| accumulated_depreciation | decimal(19,4) | Total accumulated depreciation to date |
| book_value | decimal(19,4) | Book value after depreciation |
| journal_entry_id | uuid | Reference to journal_entries when posted |
| fiscal_year | integer | Fiscal year |
| fiscal_period | integer | Fiscal period |
| created_at | timestamp | Creation timestamp |
| created_by | uuid | User who created the entry |

**Indexes:**
- Primary key: id
- Foreign key: asset_id → assets.id
- Foreign key: journal_entry_id → journal_entries.id
- Index: date
- Index: (fiscal_year, fiscal_period)

#### asset_disposals

Stores asset disposal information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| asset_id | uuid | Reference to assets |
| disposal_date | date | Disposal date |
| disposal_method | varchar(50) | Disposal method (sold, scrapped, donated) |
| disposal_amount | decimal(19,4) | Disposal amount (if sold) |
| reason | text | Reason for disposal |
| gain_loss_account_id | uuid | Reference to gain/loss GL account |
| journal_entry_id | uuid | Reference to journal_entries when posted |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the disposal |
| approved_by | uuid | User who approved the disposal |

**Indexes:**
- Primary key: id
- Foreign key: asset_id → assets.id
- Foreign key: gain_loss_account_id → accounts.id
- Foreign key: journal_entry_id → journal_entries.id
- Index: disposal_date

### Tuition Credits

#### providers

Stores provider information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | varchar(100) | Provider name |
| provider_type | varchar(50) | Provider type (center, home, etc.) |
| license_number | varchar(50) | License number |
| tax_id | varchar(20) | Tax ID / EIN |
| contact_name | varchar(100) | Primary contact name |
| email | varchar(100) | Email address |
| phone | varchar(20) | Phone number |
| address_line1 | varchar(100) | Address line 1 |
| address_line2 | varchar(100) | Address line 2 |
| city | varchar(50) | City |
| state | varchar(50) | State |
| zip | varchar(20) | ZIP/Postal code |
| country | varchar(50) | Country |
| status | varchar(20) | Status (active, inactive, onboarding) |
| quality_rating | integer | Quality rating (1-5) |
| vendor_id | uuid | Reference to vendors for payment |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the provider |
| updated_by | uuid | User who last updated the provider |

**Indexes:**
- Primary key: id
- Index: name
- Index: license_number
- Index: status
- Foreign key: vendor_id → vendors.id

#### tuition_credit_batches

Stores batches of tuition credits.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| batch_number | varchar(50) | Batch number (system-generated) |
| description | text | Batch description |
| period_start | date | Start date of the period covered |
| period_end | date | End date of the period covered |
| status | varchar(20) | Status (draft, pending, approved, processed) |
| total_amount | decimal(19,4) | Total batch amount |
| total_credits | integer | Total number of credits |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the batch |
| approved_by | uuid | User who approved the batch |
| processed_by | uuid | User who processed the batch |

**Indexes:**
- Primary key: id
- Unique: batch_number
- Index: status
- Index: period_start
- Index: period_end

#### tuition_credits

Stores individual tuition credits.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| credit_number | varchar(50) | Credit number (system-generated) |
| batch_id | uuid | Reference to tuition_credit_batches |
| provider_id | uuid | Reference to providers |
| student_id | varchar(50) | Student identifier |
| period_start | date | Start date of the credit period |
| period_end | date | End date of the credit period |
| amount | decimal(19,4) | Credit amount |
| status | varchar(20) | Status (pending, approved, processed, voided) |
| description | text | Credit description |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the credit |
| approved_by | uuid | User who approved the credit |

**Indexes:**
- Primary key: id
- Unique: credit_number
- Foreign key: batch_id → tuition_credit_batches.id
- Foreign key: provider_id → providers.id
- Index: status
- Index: student_id

#### payment_batches

Stores payment batches for providers.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| batch_number | varchar(50) | Batch number (system-generated) |
| description | text | Batch description |
| payment_date | date | Payment date |
| total_amount | decimal(19,4) | Total batch amount |
| status | varchar(20) | Status (draft, pending, approved, processed) |
| bill_id | uuid | Reference to bills when posted |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the batch |
| approved_by | uuid | User who approved the batch |
| processed_by | uuid | User who processed the batch |

**Indexes:**
- Primary key: id
- Unique: batch_number
- Foreign key: bill_id → bills.id
- Index: status
- Index: payment_date

#### provider_payments

Stores individual provider payments.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| payment_number | varchar(50) | Payment number (system-generated) |
| batch_id | uuid | Reference to payment_batches |
| provider_id | uuid | Reference to providers |
| amount | decimal(19,4) | Payment amount |
| status | varchar(20) | Status (pending, approved, processed) |
| description | text | Payment description |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the payment |
| approved_by | uuid | User who approved the payment |

**Indexes:**
- Primary key: id
- Unique: payment_number
- Foreign key: batch_id → payment_batches.id
- Foreign key: provider_id → providers.id
- Index: status

### Authentication & Users

#### users

Stores user information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | varchar(100) | Email address |
| first_name | varchar(50) | First name |
| last_name | varchar(50) | Last name |
| role | varchar(50) | User role |
| status | varchar(20) | Status (active, inactive, suspended) |
| cognito_id | varchar(100) | Cognito user ID |
| last_login | timestamp | Last login timestamp |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| created_by | uuid | User who created the user |
| updated_by | uuid | User who last updated the user |

**Indexes:**
- Primary key: id
- Unique: email
- Unique: cognito_id
- Index: status
- Index: role

#### user_permissions

Stores user permission assignments.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to users |
| permission | varchar(100) | Permission identifier |
| created_at | timestamp | Creation timestamp |
| created_by | uuid | User who created the permission |

**Indexes:**
- Primary key: id
- Foreign key: user_id → users.id
- Unique: (user_id, permission)

#### audit_logs

Stores system audit logs.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to users |
| action | varchar(50) | Action performed |
| entity_type | varchar(50) | Entity type affected |
| entity_id | uuid | Entity ID affected |
| details | jsonb | Detailed information about the change |
| ip_address | varchar(45) | IP address |
| user_agent | text | User agent |
| timestamp | timestamp | When the action occurred |

**Indexes:**
- Primary key: id
- Foreign key: user_id → users.id
- Index: action
- Index: entity_type
- Index: entity_id
- Index: timestamp

## Entity Relationships

### Chart of Accounts Relationships

```
accounts
  ↑ (parent_id)
  └── accounts (self-referential for hierarchy)
```

### Financial Transactions Relationships

```
journal_entries
  ↓
  └── journal_entry_lines
       ├── accounts
       └── funds
```

### Accounts Payable Relationships

```
vendors
  ↓
  └── bills
       ├── journal_entries
       ├── bill_items
       │    └── accounts
       └── bill_payments
            └── journal_entries
```

### Accounts Receivable Relationships

```
customers
  ↓
  └── invoices
       ├── journal_entries
       ├── invoice_items
       │    └── accounts
       └── invoice_payments
            └── journal_entries
```

### Banking Relationships

```
bank_accounts
  ├── accounts (GL accounts)
  ├── bank_reconciliations
  └── bank_transactions
       ├── bank_reconciliations
       └── journal_entries
```

### Tuition Credits Relationships

```
providers
  ├── vendors
  ├── tuition_credits
  │    └── tuition_credit_batches
  └── provider_payments
       └── payment_batches
            └── bills
```

## Data Migration

The database schema supports data migration through:

1. **Staging Tables**: Each major entity has corresponding staging tables for import
2. **Version Tracking**: Schema version tracking for migration management
3. **Data History**: Detailed change tracking and audit logs for all entities
4. **ETL Processes**: Extract, transform, load processes for moving data between systems
5. **Incremental Syncing**: Support for incremental data synchronization

## Backup & Recovery

The database backup strategy includes:

1. **Full Daily Backups**: Complete database backups daily
2. **Transaction Log Backups**: Every 15 minutes for point-in-time recovery
3. **Retention Policy**: 30 days of backups retained
4. **Offsite Storage**: Backups stored in separate AWS region
5. **Recovery Testing**: Monthly recovery testing to validate backup integrity

## Optimization

The schema includes these optimization features:

1. **Indexing Strategy**: Strategic indexes on frequently queried columns
2. **Partitioning**: Time-based partitioning for large tables (audit_logs, journal_entries)
3. **Materialized Views**: For complex reports and dashboards
4. **Query Optimization**: Optimized table design for common query patterns
5. **Archiving Strategy**: Automated archiving for historical data

## Security Considerations

The database schema implements these security measures:

1. **Row-Level Security**: Enforced at the database level
2. **Encryption**: At-rest and in-transit encryption
3. **Minimal Privileges**: Role-based access control
4. **Audit Logging**: Comprehensive tracking of all data access and changes
5. **PII Protection**: Separation of personally identifiable information