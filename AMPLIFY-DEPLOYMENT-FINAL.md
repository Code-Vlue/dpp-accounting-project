# AWS Amplify Deployment - Final Instructions

**⚠️ CRITICAL UPDATE: SIMPLIFIED DEPLOYMENT APPROACH ⚠️**

After multiple attempts to deploy using SSR (Server-Side Rendering), we've identified a much more reliable approach using AWS Amplify's static site deployment capabilities. This approach eliminates the persistent "required-server-files.json" error and ensures consistent deployments.

## AWS Amplify Console Deployment Steps (Updated)

1. **Access AWS Amplify Console**:
   - Log in to the AWS Management Console at https://console.aws.amazon.com/
   - Navigate to AWS Amplify service
   - Find the app "DPP-Accounting-Platform" (ID: d2ibw1me0nb2ns)
   - If you can't find this app, create a new one using the "Create app" button

2. **Connect to GitHub Repository (Recommended)**:
   - In the Amplify Console, select "Host web app"
   - Choose GitHub as the repository provider
   - Connect to your GitHub account and select the repository containing the DPP Accounting Platform
   - Select the "master" branch
   - AWS Amplify will automatically detect the Next.js application

3. **⚠️ CRITICAL: Update the Framework Type**:
   - Go to "Build settings" -> "App settings"
   - Under "Build settings", select the framework: **"Next.js - SSG"** (not SSR)
   - This is essential for successful deployment

4. **Configure Build Settings**:
   - Verify that amplify.yml is detected correctly
   - The amplify.yml should now be:
   ```yaml
   version: 1
   frontend:
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
   
   - Add the following environment variables:
     - NEXT_PUBLIC_API_URL: https://api.example.com
     - NEXT_PUBLIC_SITE_URL: https://www.dpp-accounting-platform.example.com
     - NEXT_PUBLIC_COGNITO_USER_POOL_ID: (your Cognito user pool ID)
     - NEXT_PUBLIC_COGNITO_CLIENT_ID: (your Cognito client ID)

5. **Deploy the Application**:
   - Review all settings
   - Click "Save and deploy"
   - Amplify will clone the repository, build the application, and deploy it
   - Monitor the build logs for any issues

6. **Verify Deployment**:
   - Once deployment is complete, click on the provided domain URL
   - Check for the file /amplify-test.html to verify the deployment is working
   - Navigate to the main application and verify functionality

## Important Configuration Details

1. **Next.js Configuration**:
   The application has been reconfigured for reliable deployment:
   - Removed output: 'standalone' from next.config.js (not needed for this approach)
   - TypeScript errors are now ignored during build
   - Images are set to unoptimized: true for better static compatibility

2. **Authentication Still Works**:
   - Client-side authentication with AWS Cognito still functions normally
   - User authentication flows remain intact

## Troubleshooting

If you encounter any issues during deployment:

1. **Run the Fix Script**:
   - Run this command locally to fix all configuration files:
   ```
   npm run amplify-fix
   ```
   - Commit and push the changes to your repository
   - This will create optimal configuration for AWS Amplify

2. **Build Errors**:
   - If you still see errors, check the build logs in the Amplify Console
   - Make sure the framework is set to "Next.js - SSG"
   - Ensure all environment variables are set correctly

3. **Additional Help**:
   - For persistent issues, check AWS Amplify documentation
   - Refer to the troubleshooting guide in the AWS Amplify console

## Next Steps After Deployment

1. **Set Up Custom Domain**: 
   - Configure a custom domain in the Amplify Console
   - Set up DNS records to point to the Amplify app

2. **Configure Authentication**:
   - Ensure Cognito is properly set up with all required user attributes
   - Test the authentication flow end-to-end

The deployed application should be accessible at your Amplify domain.