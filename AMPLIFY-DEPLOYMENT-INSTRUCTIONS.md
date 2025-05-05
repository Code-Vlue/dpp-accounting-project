# AWS Amplify Deployment Instructions

This document provides instructions for deploying the DPP Accounting Platform to AWS Amplify, which will support server-side rendering (SSR) capabilities for dynamic content.

## Deployment Steps

### 1. Create an AWS Amplify App

```bash
# Create the Amplify app
aws amplify create-app \
  --name "DPP-Accounting-Platform" \
  --platform WEB

# Create a branch for deployment
aws amplify create-branch \
  --app-id d35l0gmaos0fh5 \
  --branch-name master \
  --framework "Next.js - SSR" \
  --stage PRODUCTION

# Set environment variables
aws amplify update-app \
  --app-id d35l0gmaos0fh5 \
  --environment-variables \
  "NEXT_PUBLIC_API_URL=https://api.example.com,NEXT_PUBLIC_SITE_URL=https://www.dpp-accounting-platform.example.com,REGION=us-east-1"
```

### 2. Connect to GitHub Repository

For continuous deployment, connect your Amplify app to your GitHub repository:

```bash
# Update the app with your GitHub repository
aws amplify update-app \
  --app-id d35l0gmaos0fh5 \
  --repository "https://github.com/Code-Vlue/dpp-accounting-project" \
  --access-token YOUR_GITHUB_ACCESS_TOKEN
```

### 3. Manual Deployment (Alternative)

If you prefer to deploy manually:

1. Build your Next.js application:
   ```bash
   npm run build
   ```

2. Create a deployment package:
   ```bash
   # Create zip file of the required contents
   zip -r deployment.zip .next package.json package-lock.json next.config.js public node_modules
   ```

3. Start a manual deployment:
   ```bash
   # Get pre-signed URL for file upload
   aws amplify create-deployment \
     --app-id d35l0gmaos0fh5 \
     --branch-name master

   # Upload files to the pre-signed URL
   curl -v -H "Content-Type: application/zip" \
     --upload-file deployment.zip \
     "PRESIGNED_URL_FROM_PREVIOUS_COMMAND"

   # Start deployment
   aws amplify start-deployment \
     --app-id d35l0gmaos0fh5 \
     --branch-name master \
     --job-id JOB_ID_FROM_CREATE_DEPLOYMENT
   ```

### 4. Monitor Deployment Status

```bash
# Check deployment status
aws amplify get-job \
  --app-id d35l0gmaos0fh5 \
  --branch-name master \
  --job-id JOB_ID
```

### 5. Access Your Deployed Application

Once deployment is complete, your application will be available at:
```
https://master.d35l0gmaos0fh5.amplifyapp.com
```

## Troubleshooting

If you encounter deployment issues:

1. Check deployment logs via AWS Console or CLI:
   ```bash
   aws amplify get-job --app-id d35l0gmaos0fh5 --branch-name master --job-id JOB_ID
   ```

2. Verify your `amplify.yml` configuration is correct.

3. Ensure your Next.js application uses the `standalone` output mode in `next.config.js`.

## Custom Domain Setup

To use a custom domain:

```bash
# Add domain to Amplify app
aws amplify create-domain-association \
  --app-id d35l0gmaos0fh5 \
  --domain-name your-domain.com \
  --sub-domain-settings subDomainSetting=master,subDomain=www

# Verify domain setup
aws amplify get-domain-association \
  --app-id d35l0gmaos0fh5 \
  --domain-name your-domain.com
```

Follow the DNS validation instructions provided in the response to complete domain setup.

## Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Next.js on AWS Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html)
EOF < /dev/null
