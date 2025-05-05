# AWS Amplify Deployment - Final Instructions

After attempting programmatic deployment via AWS CLI, we recommend proceeding with the AWS Console approach for deploying the DPP Accounting Platform. This approach is more reliable and avoids potential authentication and KMS issues.

## AWS Amplify Console Deployment Steps

1. **Access AWS Amplify Console**:
   - Log in to the AWS Management Console at https://console.aws.amazon.com/
   - Navigate to AWS Amplify service
   - Find the app "DPP-Accounting-Platform" (ID: d2imcl999tngnc)
   - If you can't find this app, create a new one using the "Create app" button

2. **Connect to GitHub Repository (Recommended)**:
   - In the Amplify Console, select "Host web app"
   - Choose GitHub as the repository provider
   - Connect to your GitHub account and select the repository containing the DPP Accounting Platform
   - Select the "master" branch
   - AWS Amplify will automatically detect the Next.js application

3. **Configure Build Settings**:
   - Verify that amplify.yml is detected correctly
   - If not, create it with the following content:
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
           baseDirectory: .
           files:
             - .next/**/*
             - node_modules/**/*
             - public/**/*
             - package.json
             - next.config.js
         cache:
           paths:
             - node_modules/**/*
             - .next/cache/**/*
   ```
   
   - Add the following environment variables:
     - NEXT_PUBLIC_API_URL: https://api.example.com
     - NEXT_PUBLIC_SITE_URL: https://www.dpp-accounting-platform.example.com
     - REGION: us-east-1

4. **Deploy the Application**:
   - Review all settings
   - Click "Save and deploy"
   - Amplify will clone the repository, build the application, and deploy it
   - Monitor the build logs for any issues

5. **Verify Deployment**:
   - Once deployment is complete, click on the provided domain URL (something like https://master.d2imcl999tngnc.amplifyapp.com/)
   - Verify that the application loads correctly
   - Test navigation to several pages
   - Verify that server-side rendering is working properly

## Important Configuration Details

1. **Next.js Configuration**:
   The application is properly configured for SSR in Amplify with:
   - `output: 'standalone'` in next.config.js
   - Proper amplify.yml configuration for Next.js

2. **Environment Variables**:
   - All environment variables are properly set in the Amplify app configuration
   - These will be available during build and runtime

3. **Custom Domain Configuration (Optional)**:
   - After successful deployment, you can configure a custom domain
   - In the Amplify Console, go to "Domain management"
   - Click "Add domain" and follow the steps
   - This will set up HTTPS automatically with an ACM certificate

## Troubleshooting

If you encounter any issues during deployment:

1. **Build Errors**:
   - Check the build logs in the Amplify Console
   - Common issues may be related to Node.js version or package compatibility
   - Verify that all dependencies are correctly listed in package.json

2. **Deployment Errors**:
   - Verify that the deployment artifact is not too large (Amplify has size limits)
   - Check that the output configuration in next.config.js is correct
   - Verify that amplify.yml includes all necessary files

3. **Runtime Errors**:
   - Check browser console for any JavaScript errors
   - Verify that environment variables are correctly set
   - Check server-side rendering by viewing page source

## Next Steps After Deployment

1. **Set Up Custom Domain**:
   - Configure a custom domain in the Amplify Console
   - Set up DNS records to point to the Amplify app

2. **Set Up CI/CD**:
   - With GitHub integration, Amplify will automatically deploy changes on push
   - Configure branch-based deployments for staging/development environments

3. **Monitoring**:
   - Set up monitoring and alerts for the application
   - Configure CloudWatch alarms for critical metrics

## Verification Report

After deployment is complete, create a verification report that includes:
- Screenshot of the deployed application
- Confirmation of server-side rendering functionality
- List of tested features and their status
- Any issues encountered and their resolution

The deployed application should be accessible at:
https://master.d2imcl999tngnc.amplifyapp.com/