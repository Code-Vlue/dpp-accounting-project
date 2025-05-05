# AWS Amplify Deployment Instructions for DPP Accounting Platform

This document outlines the steps needed to complete the deployment of the DPP Accounting Platform as a fully dynamic Next.js application in AWS Amplify.

## Current Status

- AWS Amplify app created: `d1qo57qge3hvpb`
- Environment variables configured
- Main branch created
- All application files uploaded to S3 bucket: `s3://dpp-accounting-platform-prod/amplify-deployment/`
- amplify.yml configuration created and uploaded to S3

## Next Steps to Complete Deployment

### 1. Prepare the Deployment Package

Create a deployment zip file containing:

```bash
# On your local system (not in Claude)
cd /path/to/local/copy
zip -r deployment.zip .
```

Include these files at the root level:
- package.json
- package-lock.json
- next.config.js
- amplify.yml
- src/ directory
- public/ directory
- All other project files

### 2. Upload the Deployment Package

Use the signed URL provided by AWS to upload the deployment package:

```bash
curl -T deployment.zip "https://aws-amplify-prod-us-east-1-artifacts.s3.us-east-1.amazonaws.com/d1qo57qge3hvpb/main/0000000003/DEPLOY/artifacts.zip?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEIj%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQCNscz5gjI3ItnQ%2FX2dL452qKFb29MqizF3xnVAB%2BlvLwIgNVgA%2F8DlmoJlU7QY1636LwXO454Gv4OANcM4P6RMrFgqwQMIMRAGGgwwNzM2NTMxNzE1NzYiDO7N3sblmPBKlvubWiqeAy2cHWwv2%2FuEyoMRJoVF26rbdiaXTuFQI7Ce6oWVu4mFLlShO33%2FgPWKwBVpdakmFCNyT6QixoXQxbzIwrFDzMf7Rn5Nej6errOXQfkDAz7muu9tccxx6uMtBjWaOKWwlyV7iMJdDOFGHylc7mAPpHVMaYwcwoyyEoivq%2FdC8DRN7hqu3EmEAA0uPKoBfDQcDQ0Ba%2BMV9hinnH5emDblTYNXvPCbqb7uLmiPCtqUMupSN9I2cFkVzYIvEZ2v7gSFWlaF3IpchnUUlIdpnvTQtgIqafN%2BDpL8qntSAoYUgkGq1%2FdrUqjZ0b075JX7%2F%2FgALPyAkt9kgrAtn13FHPPu%2BwCz64r9g9dLVW4bUAtiPXhgYLmb6yrmRZB2PmvhDUHVwd8vG6hDEMtKVEiTLTIfF2h1PBA2RUd3N57yDp0m2nEa2gXOfD%2Fp3cic4KuoojpfMJe4S6OKtWWj2gz%2FwD7xr52zvVO8mSLuL%2F4kkRUpbMNp40%2Bzg5k0eEOPgxdAPTTdwGUsGvBPQKEF2hbSg931zDm7o%2BRxRhgJO2CsIp8C0TDzuuPABjqeAXoKeBYu1LHJOsaqwZ8hEuR3dU%2FrZlhxM%2FN8i0J9amIAAmej9dh5oxRF6MBdShIme2puHmD2s11F%2BTdyF4ilEjy3B5xwc%2FI80oOrP6I10Kx6t9LMz8DOGvEOtrQbFOXi%2FeJxXD7DI%2FFtjWqP2SZ5xz6u4AAfQZ0XnADl5OvuzKZGT0jv3XuADrGRKEO5f8yBO1iPei2GEs8MwSxJB7He&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250505T164009Z&X-Amz-SignedHeaders=host&X-Amz-Expires=10800&X-Amz-Credential=ASIARCJQSGV4GQ4P46VE%2F20250505%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=da85b2aa4843083a891a6125ffea25e6d6cae38713b9fc85170b1f0bd347fbfb"
```

### 3. Start the Deployment

```bash
aws amplify start-deployment --app-id d1qo57qge3hvpb --branch-name main --job-id 3
```

### 4. Monitor Deployment Status

```bash
aws amplify get-job --app-id d1qo57qge3hvpb --branch-name main --job-id 3
```

### 5. Alternative Approach: AWS Console

If you encounter any issues with the CLI method, you can use the AWS Console:

1. Login to AWS Console
2. Navigate to AWS Amplify
3. Select the app: DPP-Accounting-Platform
4. Select the main branch
5. Click "Deploy" and follow the instructions to upload your zip file.

## Verify Successful Deployment

After deployment completes, the application should be available at:
https://main.d1qo57qge3hvpb.amplifyapp.com

## Important Notes for Dynamic Next.js Deployment

1. **Server-Side Rendering (SSR)**: Amplify fully supports Next.js SSR capabilities. 

2. **API Routes**: Next.js API routes will function properly with this deployment.

3. **Environment Variables**: All environment variables have been pre-configured in the Amplify app.

4. **Build Commands**: The amplify.yml file is configured to run the proper build commands for Next.js.

5. **Custom Domain**: After verifying the application works, you can add a custom domain in the Amplify Console.

## Why Amplify Is Better Than S3/CloudFront for Dynamic Next.js

AWS Amplify provides these advantages for dynamic Next.js applications:

- **SSR Support**: Handles server-side rendering requests
- **API Routes**: Supports Next.js API routes
- **Authentication**: Integrates with Cognito
- **Backend Services**: Easy connection to other AWS services
- **Preview Deployments**: Branch-based deployments for feature testing
- **Build Process**: Automatic handling of Next.js build process
- **CI/CD**: Built-in continuous deployment
- **Environment Variables**: Simple environment variable management

Using S3/CloudFront alone would only support static content and couldn't handle server-side rendering or API routes.