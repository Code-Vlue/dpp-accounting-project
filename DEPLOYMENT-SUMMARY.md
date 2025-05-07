# AWS Amplify Deployment - Complete Guide

This document provides a comprehensive guide to deploying the DPP Accounting Platform to AWS Amplify. The deployment approach has been thoroughly tested and optimized based on multiple rounds of troubleshooting.

## Deployment Approach

This project uses a **static export** approach with SPA (Single Page Application) client-side routing. This approach was chosen because:

1. It's more reliable for deployment on AWS Amplify
2. It avoids server-side rendering (SSR) complexity
3. It provides a consistent user experience

## Pre-Deployment Checklist

Before deploying to AWS Amplify, ensure you have:

1. ✅ AWS Account with Amplify access
2. ✅ Cognito User Pool configured with required attributes
3. ✅ Proper environment variables ready (see below)
4. ✅ Latest code pushed to your repository

## Required Environment Variables

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | AWS Cognito User Pool ID | us-east-1_abcdefghi |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | AWS Cognito App Client ID | 6a7b8c9d0e1f2g3h4i5j |
| `AWS_REGION` | AWS Region (must match Cognito region) | us-east-1 |
| `API_URL` | API Gateway URL (optional) | https://api.example.com |
| `SITE_URL` | Public site URL (optional) | https://dpp-accounting.example.com |

## Deployment Steps

### 1. Create a New Amplify App

1. Log in to the AWS Management Console
2. Navigate to AWS Amplify
3. Click "Create app" > "Host web app"
4. Choose your Git provider and connect to your repository
5. Select the branch you want to deploy

### 2. Configure Build Settings

1. Verify the build settings are auto-detected
2. Add the required environment variables (listed above)
3. Advanced settings:
   - Set the build image to the latest version
   - Set the service role to a role with appropriate permissions

**Critical Setting**: Ensure "Framework" is set to "Next.js - SSG" (not SSR)

### 3. Review and Deploy

1. Review your settings
2. Click "Save and deploy"
3. Monitor the build progress in the Amplify Console

## Verifying Your Deployment

After deployment completes, verify:

1. Navigate to the provided Amplify URL
2. Visit `/amplify-test.html` to verify environment variables are loaded correctly
3. Try the authentication flow by going to `/auth/login`
4. Verify direct navigation to protected routes works properly

## Troubleshooting Common Issues

### 1. Authentication Redirect Loops

**Symptoms**: Browser shows infinite redirects when trying to access login page

**Solution**:
- Verify middleware implementation is disabled or properly excludes auth routes
- Check browser console for environment variable errors
- Clear browser cookies and try again

### 2. Environment Variables Not Loading

**Symptoms**: Application shows "NOT CONFIGURED" for Cognito settings

**Solution**:
- Check Amplify Console environment variables are correctly set
- Verify the build logs show variables being injected
- Check for any errors in the sed commands

### 3. 404 Errors on Direct Page Access

**Symptoms**: Accessing a URL directly (not from navigation) shows 404

**Solution**:
- Verify `_routes.json` is properly configured and present in the output directory
- Check Amplify Console "Rewrites and redirects" settings
- Ensure `public/404.html` is properly implemented

## Advanced Configuration

### Custom Domain Setup

1. In the Amplify Console, go to "Domain Management"
2. Click "Add domain"
3. Enter your domain and follow the verification steps
4. Update your DNS settings according to the provided instructions

### Continuous Deployment

The setup already includes continuous deployment. When you push to the configured branch, Amplify will automatically deploy your changes.

## Key Files and Their Purpose

- **amplify.yml**: Main configuration for AWS Amplify build process
- **next.config.js**: Next.js configuration with static export settings
- **public/env-config.js**: Runtime environment variable injection
- **public/_routes.json**: Amplify routing configuration for SPA
- **public/404.html**: Handles direct navigation in SPA mode
- **src/middleware.ts**: Disabled middleware to prevent redirect loops

## Security Considerations

1. **Environment Variables**: Sensitive values are only exposed client-side if prefixed with `NEXT_PUBLIC_`
2. **Authentication**: Uses AWS Cognito with JWT tokens stored in cookies
3. **CORS**: AWS Amplify automatically handles CORS for the hosted application

## Maintenance and Updates

To update your deployed application:

1. Make and test changes locally
2. Commit and push to your repository
3. Amplify will automatically detect the changes and start a new build
4. Monitor the build process in the Amplify Console

## AWS Resources Summary

| Resource Type | Resource Name/ID | Region | Purpose |
|--------------|------------------|--------|---------|
| Amplify App | d2imcl999tngnc | us-east-1 | Static hosting |
| Cognito User Pool | (Your User Pool ID) | us-east-1 | Authentication |

## Documentation References

1. `AMPLIFY-DEPLOYMENT-FINAL.md`: Definitive deployment guide
2. `fix-amplify-deployment.md`: Issues fixed for successful deployment
3. `fix-auth.md`: Authentication fixes for static export
4. `minimal-deploy.md`: Minimal configuration for successful deployment
5. `docs/deployment-guide.md`: General deployment documentation

---

**Prepared By:** Claude Code  
**Date:** May 7, 2025  
**Project Status:** Deployment Ready - Static Export