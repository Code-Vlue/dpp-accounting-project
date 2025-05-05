# AWS Amplify Deployment Verification

This document provides steps to verify and complete the AWS Amplify deployment for the DPP Accounting Platform.

## Current Deployment Status

The application has been initially deployed to S3/CloudFront as a static deployment:
- CloudFront Distribution: https://d3b2beatmnvsp8.cloudfront.net
- S3 Bucket: dpp-accounting-platform-prod

However, for full server-side rendering functionality, deploying to AWS Amplify is required.

## Amplify App Creation Status

An AWS Amplify app has been created and configured:
- App ID: d2imcl999tngnc
- App Name: DPP-Accounting-Platform
- Default Domain: d2imcl999tngnc.amplifyapp.com
- Environment Variables:
  - NEXT_PUBLIC_API_URL: https://api.example.com
  - NEXT_PUBLIC_SITE_URL: https://www.dpp-accounting-platform.example.com
  - REGION: us-east-1

## Verification Steps

1. **Check AWS Amplify App**:
   ```bash
   aws amplify get-app --app-id d2imcl999tngnc
   ```
   
   Expected result: App details showing the created Amplify app with environment variables configured.

2. **Check Master Branch**:
   ```bash
   aws amplify get-branch --app-id d2imcl999tngnc --branch-name master
   ```
   
   Expected result: Branch details showing master branch configured with the "Next.js - SSR" framework.

## Deployment Completion Steps

To complete the deployment to AWS Amplify, follow one of these approaches:

### Option 1: AWS Amplify Console (Recommended)

1. Log in to the AWS Management Console at https://console.aws.amazon.com/
2. Navigate to AWS Amplify service
3. Find the app "DPP-Accounting-Platform" (ID: d2imcl999tngnc)
4. Click on the app name to view details
5. If no build has been initiated, click "Run build" on the master branch
6. To connect the app to GitHub:
   - Navigate to "App settings"
   - Under "Repository" section, click "Connect repository"
   - Follow prompts to connect to your GitHub repository
   - Select the master branch
7. Once GitHub is connected, Amplify will automatically build and deploy on new commits
8. After deployment, the app will be available at https://master.d2imcl999tngnc.amplifyapp.com/

### Option 2: Manual Deployment with AWS CLI

1. Build the application locally:
   ```bash
   npm run build
   ```

2. Create a deployment package:
   ```bash
   cd /workspace/DPP-Project
   zip -r deployment.zip .next node_modules public package.json next.config.js
   ```

3. Create a new Amplify deployment:
   ```bash
   aws amplify create-deployment --app-id d2imcl999tngnc --branch-name master
   ```
   
4. Upload the deployment package using the pre-signed URL from the previous command
   (Note: This step requires AWS Signature V4 authentication)

5. Start the deployment:
   ```bash
   aws amplify start-deployment --app-id d2imcl999tngnc --branch-name master --job-id [JOB_ID]
   ```
   
6. Monitor the deployment:
   ```bash
   aws amplify get-job --app-id d2imcl999tngnc --branch-name master --job-id [JOB_ID]
   ```

## Verification Post-Deployment

After deployment completes, verify:

1. The application loads at https://master.d2imcl999tngnc.amplifyapp.com/
2. Server-side rendering works properly (dynamic pages load with data)
3. Authentication flows function correctly
4. All modules operate as expected

## Common Issues and Troubleshooting

1. **Build Failures**: 
   - Check the build logs in the Amplify Console
   - Verify the amplify.yml file is correctly configured
   - Ensure the next.config.js has `output: 'standalone'` for SSR support

2. **404 Errors**:
   - Verify the rewrites and redirects in the Amplify custom rules section
   - For Next.js, add a rule to direct all traffic to index.html for client-side routing

3. **Environment Variable Issues**:
   - Verify all required environment variables are set in the Amplify app settings
   - Ensure variables are prefixed with NEXT_PUBLIC_ if they need to be accessible client-side

4. **Server-Side Rendering Issues**:
   - Confirm next.config.js has `output: 'standalone'`
   - Check that the Amplify app is using the "Next.js - SSR" or "SSR" framework setting
   - Verify that server components are properly implemented