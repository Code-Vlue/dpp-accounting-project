# Next.js Static Export Configuration for Amplify

This document explains how we've modified the Next.js configuration to work properly as a static export in AWS Amplify.

## Key Modifications

1. **Static Export Configuration**
   - Set `output: 'export'` in next.config.js to enable static export
   - Configured images with `unoptimized: true`
   - Added rewrites rule to send all paths to the root
   - Disabled trailing slashes with `trailingSlash: false`

2. **SPA Routing Files**
   - Created a custom `index.html` with routing script
   - Added `_routes.json` for Amplify routing configuration
   - Included a custom `404.html` with automatic redirection
   - Created `spa-redirect.js` to handle client-side routing

3. **Amplify Configuration**
   - Updated `amplify.yml` to copy public files into the build output
   - Added custom headers for caching optimization
   - Included post-build verification steps

## How It Works

The static export creates HTML files for each page, but AWS Amplify needs special handling to make client-side routing work:

1. When a user visits a direct URL (e.g., `/auth/login`), the server would normally return 404
2. The `_routes.json` file tells Amplify to redirect all requests to the root `index.html`
3. Our custom `index.html` preserves the URL and loads the appropriate page using client-side routing
4. If a route truly doesn't exist, Next.js will show its 404 page

## Environment Variables

For authentication to work, the following environment variables must be set in the AWS Amplify console:

- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`: Your Cognito user pool ID
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`: Your Cognito client ID
- `AWS_REGION`: The AWS region (typically `us-east-1`)

## Deployment Verification

After deployment, verify the following:

1. Direct navigation to `/auth/login` works without 404 errors
2. Authentication flow works properly
3. All client-side navigation works within the application