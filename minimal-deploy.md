# Minimal AWS Amplify Deployment

## Minimal Working Configuration

After multiple attempts, we have reduced the deployment to the absolute minimal configuration that should work with AWS Amplify:

1. **Simplified next.config.js**
   - Only includes `output: 'export'`
   - Sets `images.unoptimized: true`
   - Enables `ignoreBuildErrors` for TypeScript

2. **Minimal amplify.yml**
   - Simple build process: `npm ci` and `npm run build`
   - Artifacts from the `out` directory
   - Minimal caching configuration

3. **Setup in AWS Amplify Console**
   - Framework: "Next.js - SSG"
   - Branch: master
   - Environment variables:
     - NEXT_PUBLIC_COGNITO_USER_POOL_ID
     - NEXT_PUBLIC_COGNITO_CLIENT_ID

## Important Notes

1. All configuration options that were causing problems have been removed
2. This setup uses Next.js's static export capability
3. We've simplified everything to the most basic configuration possible

## After Deployment Success

After this minimal deployment succeeds, we can iteratively add back features while ensuring the build continues to work:

1. Add proper routing for direct page access
2. Re-enable environment variable injection
3. Add custom routing configuration for Amplify

The current focus is solely on getting a successful build and deployment.