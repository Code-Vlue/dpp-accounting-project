# DPP Accounting Platform

Comprehensive financial management system tailored for the Denver Preschool Program. This application helps streamline financial processes, manage tuition credits, and provide robust reporting.

## Documentation

- [Application Architecture](docs/application-architecture.md)
- [Infrastructure Architecture](docs/infrastructure-architecture.md)
- [API Documentation](docs/api-documentation.md)
- [Database Schema](docs/database-schema.md)
- [Local Development Guide](docs/local-development-guide.md)
- [Domain Setup Guide](docs/domain-setup.md)
- [Deployment Guide](docs/deployment-guide.md)
- [AWS Verification Guide](docs/aws-verification-guide.md)

## Features

### Core Financial Functionality

- **User Authentication and Authorization**
  - Role-based access control with AWS Cognito
  - Multi-factor authentication support
  - Custom permission system for financial operations

- **Financial Dashboard**
  - Real-time financial metrics and KPIs
  - Interactive data visualizations
  - Customizable dashboard layout
  - Transaction activity monitoring

- **Chart of Accounts and General Ledger**
  - Hierarchical multi-level chart of accounts
  - Double-entry accounting system
  - Transaction approval workflows
  - Fiscal year and period management
  - Journal entry creation and posting

- **Financial Reporting**
  - Balance sheet generation
  - Income statement (P&L) reporting
  - Statement of functional expenses
  - Budget vs. actual comparison
  - Custom report builder
  - Export to PDF, Excel, and CSV

### Financial Management Modules

- **Accounts Payable**
  - Vendor management with categorization
  - Invoice entry and approval workflow
  - Recurring bills setup and automation
  - Check printing capabilities
  - 1099 preparation tools
  - Expense categorization

- **Accounts Receivable**
  - Customer/funder management
  - Invoice generation and delivery
  - Revenue recognition features
  - Payment tracking and reconciliation
  - Aging reports and analysis
  - Automated receipt generation

- **Budgeting System**
  - Annual budget creation and revision
  - Program-based budgeting
  - Variance analysis tools
  - Budget templates
  - Approval tracking
  - Import/export functionality

- **Fund Accounting**
  - Restricted fund tracking
  - Fund balance reporting
  - Inter-fund transfers
  - Fund allocation tools
  - Fund reconciliation
  - Donor restriction management

### Specialized DPP Features

- **Tuition Credit Management**
  - Provider database integration
  - Bulk tuition credit processing
  - Individual credit adjustments
  - Multi-stage approval workflow
  - Payment scheduling to providers
  - Automated payfile generation

- **Provider Management**
  - Provider onboarding workflow
  - Payment processing and history
  - Tax information management
  - Quality improvement grant tracking
  - Provider portal for reconciliation
  - Communication tools

### Operational Tools

- **Data Import/Export**
  - Bulk data import with validation
  - Custom data mapping
  - Scheduled imports
  - Historical data migration
  - Multi-format support (CSV, Excel, JSON)

- **Bank Reconciliation**
  - Bank account management
  - Transaction import and matching
  - Reconciliation workflow
  - Exception handling
  - Reporting and analysis

- **Asset Management**
  - Asset tracking and categorization
  - Depreciation calculations
  - Disposal and transfer handling
  - Maintenance scheduling
  - Integration with general ledger

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, TypeScript
- **State Management**: Zustand
- **Authentication**: AWS Cognito
- **Cloud Infrastructure**: AWS (S3, CloudFront, Lambda, DynamoDB, RDS)
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- AWS CLI configured with appropriate credentials

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-org/dpp-accounting-platform.git
   cd dpp-accounting-platform
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables by creating a `.env.local` file (use `.env.example` as a template)

4. Run the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Workflow

1. Create a new branch for your feature or bug fix
2. Make your changes
3. Run linting and type-checking
   ```
   npm run lint
   npm run type-check
   ```
4. Submit a pull request to the main branch

## CI/CD Pipeline & Deployment

The project uses GitHub Actions for continuous integration and deployment.

### Workflows

1. **CI/CD Pipeline (`ci-cd.yml`)**
   - Triggered on pushes to main/master branch and pull requests
   - Builds and tests the application
   - Deploys to development environment on commits to main/master
   - Deploys to production after successful deployment to development

2. **Branch Protection (`branch-protection.yml`)**
   - Enforces code quality checks on pull requests
   - Runs linting and type checking
   - Ensures code meets project standards before merging

3. **Tests (`tests.yml`)**
   - Runs on pushes to main/master and pull requests
   - Executes linting, type checking, and tests
   - Provides feedback on code quality

4. **Manual Deployment (`manual-deploy.yml`)**
   - Can be triggered manually from GitHub Actions tab
   - Allows specifying target environment (development, staging, production)
   - Useful for controlled deployments outside the automated CI/CD flow

### Deployment Strategy

The application is automatically deployed through our CI/CD pipeline:

- **Development**: Automatic deployment on every push to main/master
- **Staging**: Manual deployment from development or via GitHub Actions workflow
- **Production**: Deployed after successful development deployment or manually with approval

### GitHub Secrets

The following secrets need to be configured in GitHub repository settings:

- `AWS_ACCESS_KEY_ID` - AWS access key with deployment permissions
- `AWS_SECRET_ACCESS_KEY` - Corresponding AWS secret key
- `DEV_BUCKET_NAME` - S3 bucket name for development environment
- `DEV_CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID for development
- `DEV_SITE_URL` - Public URL for development environment
- `STAGING_BUCKET_NAME` - S3 bucket name for staging environment
- `STAGING_CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID for staging
- `STAGING_SITE_URL` - Public URL for staging environment
- `PROD_BUCKET_NAME` - S3 bucket name for production environment
- `PROD_CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID for production
- `PROD_SITE_URL` - Public URL for production environment

### Deployment Scripts

The project includes scripts to help with deployments:

- `npm run deploy:dev` - Deploy to development environment
- `npm run deploy:staging` - Deploy to staging environment
- `npm run deploy:prod` - Deploy to production environment
- `npm run verify:dev` - Verify development deployment
- `npm run verify:staging` - Verify staging deployment
- `npm run verify:prod` - Verify production deployment

### Domain and SSL Configuration

The project includes comprehensive scripts for setting up and configuring domains, SSL certificates, and CDN:

1. **Route 53 and ACM Setup**
   ```bash
   ./scripts/setup-domain.sh
   ```
   - Creates a Route 53 hosted zone for your domain
   - Requests an ACM certificate 
   - Configures DNS validation records
   - Saves configuration to domain-config.json

2. **CloudFront and S3 Setup**
   ```bash
   ./scripts/setup-cloudfront.sh
   ```
   - Creates S3 buckets for hosting, www redirect, and logs
   - Sets up a CloudFront distribution with the SSL certificate
   - Configures proper cache behaviors and security settings
   - Updates Route 53 records to point to CloudFront
   - Uploads placeholder content

3. **Verification Scripts**
   ```bash
   ./scripts/verify-domain.sh
   ./scripts/verify-cloudfront.sh
   ```
   - Verify that all components are correctly configured
   - Check domain accessibility
   - Validate SSL certificate status
   - Confirm DNS record configuration

**Domain Configuration Requirements:**
- Domains must have DNS managed by Route 53
- SSL certificates are provisioned through AWS Certificate Manager
- All scripts use AWS CLI with appropriate permissions
- Required AWS permissions: route53:*, acm:*, s3:*, cloudfront:*

## Project Structure

- `/src/app`: Next.js App Router pages and layouts
- `/src/components`: Reusable React components
- `/src/hooks`: Custom React hooks
- `/src/lib`: Utility functions and helpers
- `/src/types`: TypeScript type definitions

## Contributing

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is proprietary software.