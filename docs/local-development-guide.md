# DPP Accounting Platform Local Development Guide

This guide provides detailed instructions for setting up and running the DPP Accounting Platform in a local development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18.x or later)
   ```bash
   # Check Node.js version
   node --version
   ```

2. **npm** (v8.x or later) or **yarn** (v1.22.x or later)
   ```bash
   # Check npm version
   npm --version
   
   # or for yarn
   yarn --version
   ```

3. **Git**
   ```bash
   # Check Git version
   git --version
   ```

4. **AWS CLI** (for AWS service interactions)
   ```bash
   # Check AWS CLI version
   aws --version
   
   # Configure AWS CLI
   aws configure
   ```

5. **A code editor** (Visual Studio Code recommended)

## Getting the Code

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/dpp-accounting-platform.git
   cd dpp-accounting-platform
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

## Environment Configuration

1. Create a `.env.local` file by copying the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` to include your development environment variables:
   ```
   # Next.js Environment Variables
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   
   # AWS Configuration (Optional for local development)
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   
   # Cognito Configuration
   NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_example
   NEXT_PUBLIC_COGNITO_CLIENT_ID=example
   
   # Mock Mode (use this for local development without AWS)
   NEXT_PUBLIC_MOCK_AUTH=true
   NEXT_PUBLIC_MOCK_SERVICES=true
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Workflow

### Code Structure

The DPP Accounting Platform follows a feature-based organization:

- `/src/app`: Next.js App Router pages and layouts
- `/src/components`: Reusable React components
- `/src/lib`: Utilities and services
- `/src/store`: Global state management
- `/src/types`: TypeScript type definitions
- `/src/middleware`: Next.js middleware

### Common Development Tasks

#### Creating a New Page

1. Create a new directory in `/src/app` corresponding to the route
2. Add a `page.tsx` file for the page content
3. Optionally add a `layout.tsx` file for page-specific layout

Example:
```tsx
// src/app/finance/reports/custom/page.tsx
export default function CustomReportsPage() {
  return (
    <div>
      <h1>Custom Reports</h1>
      {/* Page content */}
    </div>
  );
}
```

#### Creating a New Component

1. Create a new file in `/src/components` in the appropriate subdirectory
2. Define the component with TypeScript props
3. Export the component

Example:
```tsx
// src/components/finance/reports/ReportFilter.tsx
import { useState } from 'react';

interface ReportFilterProps {
  onFilter: (filters: any) => void;
  availableFilters: string[];
}

export default function ReportFilter({ onFilter, availableFilters }: ReportFilterProps) {
  const [selectedFilters, setSelectedFilters] = useState({});
  
  // Component logic
  
  return (
    <div>
      {/* Component UI */}
    </div>
  );
}
```

#### Adding a New Service

1. Create a new file in `/src/lib/finance`
2. Define the service functions and types
3. Export the service

Example:
```tsx
// src/lib/finance/custom-report-service.ts
import { Report, ReportParams } from '@/types/finance';

export async function generateCustomReport(params: ReportParams): Promise<Report> {
  // Implementation
  return {} as Report;
}

export async function saveCustomReport(report: Report): Promise<Report> {
  // Implementation
  return report;
}
```

### Mock Services

For local development without backend dependencies, the platform includes mock service implementations:

1. Enable mock services in `.env.local`:
   ```
   NEXT_PUBLIC_MOCK_SERVICES=true
   ```

2. Mock data is defined in service files with a `-mock.ts` suffix
3. The application automatically switches between real and mock implementations based on the environment variable

### Testing

#### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- components/finance/reports/ReportFilter.test.tsx

# Run tests in watch mode
npm test -- --watch
```

#### Writing Tests

Use Jest and React Testing Library for component tests:

```tsx
// src/components/finance/reports/ReportFilter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ReportFilter from './ReportFilter';

describe('ReportFilter', () => {
  it('renders available filters', () => {
    const mockFilters = ['date', 'account', 'fund'];
    render(<ReportFilter onFilter={() => {}} availableFilters={mockFilters} />);
    
    mockFilters.forEach(filter => {
      expect(screen.getByText(filter, { exact: false })).toBeInTheDocument();
    });
  });
  
  // More tests...
});
```

### Type Checking

Run TypeScript type checking to catch errors:

```bash
npm run type-check
```

### Code Linting

Lint your code to ensure it meets project standards:

```bash
npm run lint
```

Fix automatically fixable linting issues:

```bash
npm run lint -- --fix
```

## Using AWS Services Locally

### Working with Cognito

When developing with AWS Cognito authentication:

1. Create a Cognito User Pool for development (if not using mock mode)
2. Configure `NEXT_PUBLIC_COGNITO_USER_POOL_ID` and `NEXT_PUBLIC_COGNITO_CLIENT_ID` in `.env.local`
3. Create test users in the Cognito User Pool:
   ```bash
   aws cognito-idp admin-create-user \
     --user-pool-id YOUR_USER_POOL_ID \
     --username testuser@example.com \
     --temporary-password Temp1234! \
     --user-attributes Name=email,Value=testuser@example.com Name=email_verified,Value=true
   ```

### Working with S3

For file storage development:

1. Create an S3 bucket for development
2. Configure CORS on the bucket:
   ```bash
   aws s3api put-bucket-cors --bucket YOUR_BUCKET_NAME --cors-configuration '{
     "CORSRules": [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
         "AllowedOrigins": ["http://localhost:3000"],
         "ExposeHeaders": ["ETag"]
       }
     ]
   }'
   ```

## Debugging

### Next.js Debug Mode

Start the development server in debug mode:

```bash
NODE_OPTIONS='--inspect' npm run dev
```

Then connect to the debugger using Chrome DevTools or VS Code.

### API Debugging

Use the Network tab in browser DevTools to inspect API requests and responses.

### State Debugging

Use React DevTools to inspect component state and props.

## Common Issues and Solutions

### Authentication Issues

**Problem**: Unable to log in or authenticate with Cognito
**Solution**: 
- Verify Cognito credentials in `.env.local`
- Check if `NEXT_PUBLIC_MOCK_AUTH=true` is set for local development
- Ensure test user exists and has verified email

### API Connection Issues

**Problem**: API calls failing
**Solution**:
- Check that `NEXT_PUBLIC_API_URL` is set correctly
- Verify that backend services are running
- Check if `NEXT_PUBLIC_MOCK_SERVICES=true` is set for local development

### Build Errors

**Problem**: TypeScript errors preventing build
**Solution**:
- Run `npm run type-check` to identify issues
- Fix type errors in the codebase
- Ensure all required types are defined

### Rendering Issues

**Problem**: Components not rendering correctly
**Solution**:
- Check React component props
- Verify state management is working correctly
- Use React DevTools to inspect component hierarchy

## Deployment from Local

To deploy the application from your local environment:

1. Configure AWS credentials with appropriate permissions
2. Set the target environment:
   ```bash
   export DEPLOY_ENV=development  # or staging/production
   ```

3. Run the deployment script:
   ```bash
   npm run deploy:$DEPLOY_ENV
   ```

## Git Workflow

Follow these best practices for Git workflow:

1. Create a feature branch from main:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. Make changes and commit:
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   ```

3. Push branch and create pull request:
   ```bash
   git push -u origin feature/my-new-feature
   ```

4. After review and approval, merge to main

## Contributing

Please refer to the [CONTRIBUTING.md](../CONTRIBUTING.md) file for detailed contribution guidelines.