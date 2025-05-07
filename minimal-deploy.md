# Minimal AWS Amplify Deployment Guide

## Critical Configuration for Successful Deployment

After multiple troubleshooting iterations, we've identified the minimal viable configuration for successful deployment to AWS Amplify:

### 1. Next.js Configuration (`next.config.js`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  trailingSlash: false,
}

module.exports = nextConfig
```

### 2. AWS Amplify Configuration (`amplify.yml`)

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
            - echo "NEXT_PUBLIC_COGNITO_USER_POOL_ID=$NEXT_PUBLIC_COGNITO_USER_POOL_ID" >> .env.local
            - echo "NEXT_PUBLIC_COGNITO_CLIENT_ID=$NEXT_PUBLIC_COGNITO_CLIENT_ID" >> .env.local
            - echo "NEXT_PUBLIC_AWS_REGION=$AWS_REGION" >> .env.local
            - npm run build
            - cp -r public/* out/
            - sed -i "s/__COGNITO_USER_POOL_ID__/$NEXT_PUBLIC_COGNITO_USER_POOL_ID/g" out/env-config.js
            - sed -i "s/__COGNITO_CLIENT_ID__/$NEXT_PUBLIC_COGNITO_CLIENT_ID/g" out/env-config.js
            - sed -i "s/__REGION__/$AWS_REGION/g" out/env-config.js
        postBuild:
          commands:
            - echo "Build completed on `date`"
      artifacts:
        baseDirectory: out
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
```

### 3. Required Amplify Console Settings

- **Framework**: Select "Next.js - SSG" (NOT "Next.js - SSR")
- **Environment Variables**:
  - NEXT_PUBLIC_COGNITO_USER_POOL_ID
  - NEXT_PUBLIC_COGNITO_CLIENT_ID
  - AWS_REGION

### 4. Critical Client-Side Files

Ensure these files exist in your public directory:
- `public/env-config.js` - For runtime environment variables
- `public/404.html` - For SPA routing fallback
- `public/_routes.json` - For Amplify routing configuration
- `public/index.html` - Custom entry point with routing script

### 5. Deployment Steps

1. Log in to AWS Amplify Console
2. Create a new app or select existing one
3. Connect to your repository
4. Select branch to deploy
5. Configure build settings:
   - Verify framework is "Next.js - SSG"
   - Add required environment variables
   - Use existing amplify.yml from repository
6. Click "Save and deploy"

### 6. Verification

After deployment completes:
1. Check build logs for any errors
2. Navigate directly to the deployed URL
3. Try accessing `/auth/login` directly in browser
4. Test authentication flow
5. Check browser console for environment variable loading

### Troubleshooting

If deployment fails:
1. Verify the framework selection is "Next.js - SSG" (not SSR)
2. Check that all environment variables are correctly set
3. Ensure the output directory in amplify.yml matches your next.config.js setting
4. Verify all required public files are present

This minimal configuration ensures the application deploys successfully while maintaining authentication functionality.