# AWS Amplify Console Deployment Steps

To complete the deployment of the DPP Accounting Platform through the AWS Amplify Console, follow these exact steps:

## Step 1: Delete Existing Branches and Jobs

First, we need to clean up the existing Amplify app to connect it to GitHub:

1. Log in to the AWS Management Console at https://console.aws.amazon.com/
2. Navigate to AWS Amplify service
3. Find and click on the "DPP-Accounting-Platform" app (ID: d2imcl999tngnc)
4. Go to the "Hosting environments" tab
5. For each branch (including "master"), click on the branch, then click "Actions" → "Delete branch"
6. Confirm deletion when prompted

## Step 2: Connect to GitHub Repository

After all branches are deleted:

1. In the Amplify app, click "Add branch" or if prompted to add a new hosting environment, click that option
2. Select "GitHub" as the repository provider
3. Click "Connect branch" or "Continue"
4. If not already authenticated, click "Authorize AWS Amplify" to connect to GitHub
5. Select your repository from the dropdown (e.g., "Code-Vlue/dpp-accounting-project")
6. Select the "master" branch
7. Keep "Full-stack continuous deployment" unchecked (unless you have Amplify backend resources)

## Step 3: Configure Build Settings

On the build settings page:

1. Service role: Select "Create and use a new service role" (or use an existing one if available)
2. Verify that the build specification is detected from your amplify.yml file, which should look like:
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
3. In the "Advanced settings" section, add the following environment variables:
   - NEXT_PUBLIC_API_URL: https://api.example.com
   - NEXT_PUBLIC_SITE_URL: https://www.dpp-accounting-platform.example.com
   - REGION: us-east-1

## Step 4: Deploy the Application

1. Review all settings
2. Click "Save and deploy"
3. Amplify will now clone your repository, build the application, and deploy it
4. You can monitor the build progress in real-time

## Step 5: Verify Deployment

Once deployment is complete (usually takes 5-10 minutes):

1. You'll see a "Verify" button next to your branch - click it to open your deployed application
2. The URL will be something like: https://master.d2imcl999tngnc.amplifyapp.com/
3. Navigate through several pages to ensure proper functionality
4. Check that server-side rendering works by viewing the page source (right-click → "View Page Source")
   - You should see fully rendered HTML, not just JavaScript loading tags

## Common Issues and Troubleshooting

If you encounter any issues during deployment:

1. Build failures:
   - Check the build logs for specific errors
   - Most common issues relate to Node.js version or dependency problems
   - You may need to adjust the Node.js version in the build settings

2. Deployment timeouts:
   - If the build is taking too long, it might be due to the large node_modules folder
   - Consider adjusting the build timeout in the app settings

3. Next.js configuration issues:
   - Ensure next.config.js has `output: 'standalone'` for proper SSR support
   - Check that your application doesn't have any server-side code that depends on specific environment variables

4. 404 errors after deployment:
   - Add a custom rewrite rule to redirect all requests to index.html
   - This can be done in the "Rewrites and redirects" section of your app settings

## Post-Deployment Steps

After successful deployment:

1. Set up a custom domain (optional):
   - In the Amplify Console, go to "Domain management"
   - Click "Add domain" and follow the steps
   - This will automatically provision an SSL certificate

2. Configure branch protection rules in GitHub:
   - This ensures code quality before deployment
   - Set up required status checks for the main branch

3. Set up preview environments (optional):
   - Enable feature branch previews for your pull requests
   - This allows testing changes before merging to master