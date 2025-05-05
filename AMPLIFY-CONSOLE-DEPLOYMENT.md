# AWS Amplify Console Deployment Instructions

To deploy the DPP Accounting Platform to AWS Amplify via the AWS Console, follow these instructions:

## Prerequisites

1. An AWS account with appropriate permissions
2. The GitHub repository at https://github.com/Code-Vlue/dpp-accounting-project

## Deployment Steps

### 1. Access AWS Amplify Console

1. Sign in to the AWS Management Console
2. Navigate to AWS Amplify service
3. Click "Create app" or "New app"

### 2. Connect to GitHub Repository

1. Select "Host web app" 
2. Choose "GitHub" as the repository provider
3. Click "Continue"
4. Authenticate with GitHub if prompted
5. Select the repository "Code-Vlue/dpp-accounting-project"
6. Select the "master" branch
7. Click "Next"

### 3. Configure Build Settings

1. The repository already contains a properly configured `amplify.yml` file in the root directory
2. Add the following environment variables:
   - NEXT_PUBLIC_API_URL: https://api.example.com
   - NEXT_PUBLIC_SITE_URL: https://www.dpp-accounting-platform.example.com
   - REGION: us-east-1
3. Click "Next"

### 4. Review and Deploy

1. Review your settings
2. Click "Save and deploy"

### 5. Monitor Deployment

1. Amplify will automatically build and deploy your application
2. The console will show build progress and logs
3. Once complete, your app will be available at the provided URL

### 6. Custom Domain (Optional)

1. In the Amplify Console, select your app
2. Navigate to "Domain management"
3. Click "Add domain"
4. Follow the prompts to configure your custom domain

## Troubleshooting

If deployment fails, check the following:

1. Build logs in the Amplify Console for specific errors
2. Verify the `amplify.yml` file in the repository is correct
3. Ensure the `next.config.js` has the correct settings, especially the `output: 'standalone'` configuration

## Verification

After successful deployment:

1. Visit the provided Amplify app URL
2. Verify that server-side rendering works by checking that dynamic pages load correctly
3. Test authentication flows and protected routes
4. Check that API endpoints function as expected

## Post-Deployment

After deployment is complete, you may want to:

1. Set up a custom domain
2. Configure branch protection rules
3. Set up preview environments for PRs
4. Enable CloudFront cache settings for improved performance