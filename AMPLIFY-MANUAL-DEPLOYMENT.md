# Manual AWS Amplify Deployment Instructions

To deploy the DPP Accounting Platform to AWS Amplify via the AWS Console, follow these step-by-step instructions:

## Prerequisites

- AWS Account with appropriate permissions
- GitHub repository with the codebase: https://github.com/Code-Vlue/dpp-accounting-project

## Deployment Steps

### 1. Access AWS Amplify Console

1. Sign in to the AWS Management Console at https://console.aws.amazon.com/
2. Navigate to the AWS Amplify service
3. Click "Create app" or "New app"

### 2. Choose Source Repository

1. Select "Host web app"
2. Choose "GitHub" as the repository provider
3. Click "Continue"
4. Authenticate with GitHub if prompted
5. Select the repository "Code-Vlue/dpp-accounting-project"
6. Select the "master" branch
7. Click "Next"

### 3. Configure Build Settings

1. For the build settings, use the following configuration:
   - App name: DPP-Accounting-Platform
   - Environment variables:
     - NEXT_PUBLIC_API_URL: https://api.example.com
     - NEXT_PUBLIC_SITE_URL: https://www.dpp-accounting-platform.example.com
     - REGION: us-east-1

2. Use the following build specification (ampify.yml):
   ```yaml
   version: 1
   applications:
     - frontend:
         phases:
           preBuild:
             commands:
               - npm ci
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: .next
           files:
             - '**/*'
         cache:
           paths:
             - node_modules/**/*
             - .next/cache/**/*
   ```

3. Click "Next"

### 4. Review and Deploy

1. Review the settings
2. Click "Save and deploy"
3. Wait for the deployment to complete

### 5. Verify Deployment

1. Once deployment is complete, click on the provided domain URL
2. Verify that the application loads correctly
3. Test functionality to ensure everything works as expected

### Troubleshooting

If you encounter a 404 error or other deployment issues:

1. Check the build logs in the Amplify Console for error messages
2. Verify that the Next.js configuration is correct, especially:
   - Ensure `output: 'standalone'` is set in next.config.js
   - Confirm that amplify.yml is correctly formatted
3. Try redeploying by clicking "Redeploy this version" in the Amplify Console

### Setting Up a Custom Domain (Optional)

1. In the Amplify Console, select your app
2. Navigate to "Domain management"
3. Click "Add domain"
4. Follow the prompts to connect your custom domain

## Important Notes

- Amplify will build and deploy your Next.js application using server-side rendering
- The default domain will be [app-id].amplifyapp.com
- For proper SSR support, ensure that the Next.js configuration has output mode set to 'standalone'